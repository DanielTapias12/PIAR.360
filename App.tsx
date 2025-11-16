import React, { useState, useMemo, useCallback, useEffect } from 'react';
import type { AuthenticatedUser, NewStudentData, Student, Strategy, ProgressEntry, UserRole } from './types';
import Layout from './components/Layout';
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/Dashboard';
import DirectorDashboard from './components/DirectorDashboard';
import StudentList from './components/StudentList';
import StudentProfile from './components/StudentProfile';
import FamilyDashboard from './components/FamilyDashboard';
import ChatInterface from './components/ChatInterface';
import StrategyBank from './components/StrategyBank';
import FamilyManagement from './components/FamilyManagement';
import ChangePasswordModal from './components/ChangePasswordModal';
import RegisterStudentModal from './components/RegisterStudentModal';
import { supabase } from './services/supabaseClient';
import type { AuthError } from '@supabase/supabase-js';

const App: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<AuthenticatedUser | null>(null);
    const [authReady, setAuthReady] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [view, setView] = useState<any>('dashboard');
    
    const [students, setStudents] = useState<Student[]>([]);
    const [users, setUsers] = useState<AuthenticatedUser[]>([]);
    
    const [showChangeCredentialsModal, setShowChangeCredentialsModal] = useState(false);
    const [showRegisterStudentModal, setShowRegisterStudentModal] = useState(false);
    const [globalNotification, setGlobalNotification] = useState('');

    const fetchAllData = async () => {
        const { data: usersData, error: usersError } = await supabase.from('users').select('*');
        if (usersError) console.error('Error fetching users:', usersError);
        else setUsers(usersData || []);

        const { data: studentsData, error: studentsError } = await supabase.from('students').select('*');
        if (studentsError) console.error('Error fetching students:', studentsError);
        else setStudents(studentsData || []);
    };
    
    const fetchUserProfileWithRetry = async (userId: string, retries = 5, delay = 300): Promise<AuthenticatedUser | null> => {
        for (let i = 0; i < retries; i++) {
            const { data, error } = await supabase.from('users').select('*').eq('id', userId).single();
            if (data) return data;
            if (error && error.code !== 'PGRST116') { // PGRST116 = 0 rows
                console.error('Error fetching user profile:', error);
                return null;
            }
            await new Promise(res => setTimeout(res, delay * (i + 1)));
        }
        console.error('Failed to fetch user profile after multiple retries.');
        return null;
    };


    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                const userProfile = await fetchUserProfileWithRetry(session.user.id);
                if (userProfile) {
                    setCurrentUser(userProfile);
                    await fetchAllData();
                } else {
                    // This can happen if the trigger hasn't finished yet.
                    console.error("Could not retrieve user profile for session.");
                    await supabase.auth.signOut();
                }
            } else {
                setCurrentUser(null);
            }
            setAuthReady(true);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const studentsForUser = useMemo(() => {
        if (!currentUser) return [];
        switch (currentUser.role) {
            case 'Docente':
                return students.filter(s => s.teacher === currentUser.name);
            case 'Familia':
                return students.filter(s => s.id === currentUser.student_id);
             case 'Director':
                return students;
            default:
                return [];
        }
    }, [currentUser, students]);

    useEffect(() => {
        if (currentUser?.role === 'Familia' && studentsForUser.length > 0 && !selectedStudent) {
            setSelectedStudent(studentsForUser[0]);
        }
    }, [currentUser, studentsForUser, selectedStudent]);

    const handleLogin = async (username: string, password: string): Promise<{ error: AuthError | null }> => {
        // Find email from username
        const { data: user, error: userError } = await supabase.from('users').select('email').eq('username', username).single();
        if (userError || !user) {
            return { error: { name: 'UserNotFound', message: 'Usuario o contraseña incorrectos.' } as AuthError };
        }

        const { error } = await supabase.auth.signInWithPassword({
            email: user.email,
            password,
        });

        if (!error) {
            setView('dashboard');
            setSelectedStudent(null);
        }
        return { error };
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setCurrentUser(null);
        setSelectedStudent(null);
        setView('dashboard');
        setUsers([]);
        setStudents([]);
    };

    const handleSelectStudent = (student: Student) => {
        setSelectedStudent(student);
    };

    const handleBack = () => {
        setSelectedStudent(null);
        setView('dashboard');
    };

    const updateStudentData = async (updatedStudent: Student) => {
        const { data, error } = await supabase.from('students').update(updatedStudent).eq('id', updatedStudent.id).select().single();
        if (error) {
            console.error('Error updating student', error);
        } else if (data) {
            setStudents(prevStudents => prevStudents.map(s => s.id === data.id ? data : s));
            if (selectedStudent && selectedStudent.id === data.id) {
                setSelectedStudent(data);
            }
        }
    };
        
    const handleAssignStrategyToStudent = async (studentIds: string[], strategy: Strategy) => {
        if (!currentUser) return;
    
        const newProgressEntryBase = {
            date: new Date().toISOString().split('T')[0],
            area: 'Estrategia Asignada',
            observation: `Se asignó la estrategia: "${strategy.title}".`,
            author: currentUser.name,
            strategy: { title: strategy.title, description: strategy.description }
        };

        for (const studentId of studentIds) {
            const student = students.find(s => s.id === studentId);
            if (!student) continue;

            const newProgressEntry: ProgressEntry = {
                ...newProgressEntryBase,
                id: `prog_strat_${Date.now()}_${student.id}`,
            };
            
            const updatedEntries = [newProgressEntry, ...student.progress_entries];
            await updateStudentData({ ...student, progress_entries: updatedEntries });
        }
    };
    
    const handleAssignStudentToTeacher = async (studentId: string) => {
        if (!currentUser || currentUser.role !== 'Docente') return;
        const student = students.find(s => s.id === studentId);
        if (student) await updateStudentData({ ...student, teacher: currentUser.name });
    };
    
    const handleUnassignStudentToTeacher = async (studentId: string) => {
        if (!currentUser || currentUser.role !== 'Docente') return;
        const student = students.find(s => s.id === studentId);
        if (student) await updateStudentData({ ...student, teacher: undefined });
    };

    const handleRegisterStudent = async (newStudentData: NewStudentData) => {
        if (!currentUser) return;
        const newStudent: Omit<Student, 'documents' | 'progress_entries'> & { documents: Document[], progress_entries: ProgressEntry[] } = {
            id: `st_${Date.now()}`,
            photo_url: `https://picsum.photos/seed/${newStudentData.name.split(' ').join('')}/200`,
            teacher: currentUser.role === 'Docente' ? currentUser.name : undefined,
            documents: [],
            progress_entries: [],
            ...newStudentData,
        };
        const { data, error } = await supabase.from('students').insert(newStudent).select().single();
        if (error) {
            console.error("Error registering student", error);
        } else if (data) {
            setStudents(prev => [data, ...prev]);
        }
    };
    
    const handleRegisterStudentAndNotify = async (newStudentData: NewStudentData) => {
        await handleRegisterStudent(newStudentData);
        setShowRegisterStudentModal(false);
        setGlobalNotification(`¡Estudiante ${newStudentData.name} registrado con éxito!`);
        setTimeout(() => setGlobalNotification(''), 4000);
    };

    const handleAssignStudentToFamily = async (familyUsername: string, studentId: string) => {
        // Unassign from any other family first
        const { error: unassignError } = await supabase.from('users').update({ student_id: null }).eq('student_id', studentId);
        if (unassignError) console.error("Error unassigning student", unassignError);

        const { error: assignError } = await supabase.from('users').update({ student_id: studentId }).eq('username', familyUsername);
        if (assignError) console.error("Error assigning student", assignError);
        else await fetchAllData();
    };
    
    const handleUnassignStudentFromFamily = async (familyUsername: string) => {
        const { error } = await supabase.from('users').update({ student_id: null }).eq('username', familyUsername);
        if (error) console.error("Error unassigning student", error);
        else await fetchAllData();
    };

    const handlePublicSignUp = async (data: { name: string; username: string; email: string; password: string; role: UserRole }): Promise<{ error: AuthError | null }> => {
        const { error } = await supabase.auth.signUp({
            email: data.email,
            password: data.password,
            options: {
                data: {
                    name: data.name,
                    username: data.username,
                    role: data.role,
                }
            }
        });

        return { error };
    };

    const handleUpdateCredentials = async (newUsername: string, newPassword?: string) => {
        if (!currentUser) return;

        let userUpdates: Partial<AuthenticatedUser> = { username: newUsername };
        
        // Update username in public.users table
        const { error: profileError } = await supabase.from('users').update({ username: newUsername }).eq('id', currentUser.id);
        if (profileError) {
            alert('Este nombre de usuario ya está en uso o hubo un error.');
            return;
        }

        // Update password in auth.users
        if (newPassword) {
            const { error: passwordError } = await supabase.auth.updateUser({ password: newPassword });
            if (passwordError) {
                alert('Error al actualizar la contraseña: ' + passwordError.message);
                // Revert username change if password fails? For simplicity, we won't for now.
                return;
            }
        }
        
        // Update local state
        setCurrentUser(prev => prev ? { ...prev, ...userUpdates } : null);
        await fetchAllData();
        setShowChangeCredentialsModal(false);
    };

    const renderContent = () => {
        if (!currentUser) return null;

        if (selectedStudent) {
            if (currentUser.role === 'Familia') {
                 return <FamilyDashboard student={selectedStudent} onBack={handleBack} onUpdateStudent={updateStudentData}/>;
            }
            return <StudentProfile student={selectedStudent} onBack={handleBack} userRole={currentUser.role} onUpdateStudent={updateStudentData}/>;
        }
        
        if (currentUser.role === 'Familia') {
            const familyStudent = studentsForUser[0];
            if (familyStudent) {
                return <FamilyDashboard student={familyStudent} onBack={handleBack} onUpdateStudent={updateStudentData}/>;
            }
            return <div className="p-8 text-center text-slate-500">No hay un estudiante asociado a esta cuenta familiar.</div>;
        }

        if (currentUser.role === 'Director') {
             return <DirectorDashboard 
                students={students} 
                users={users.filter(u => u.id !== currentUser.id)}
                onSelectStudent={handleSelectStudent}
                currentUser={currentUser}
                onRegisterStudentClick={() => setShowRegisterStudentModal(true)}
                notification={globalNotification}
             />;
        }

        switch (view) {
            case 'dashboard':
                 return <Dashboard students={studentsForUser} onSelectStudent={handleSelectStudent} />;
            case 'students':
                return <StudentList 
                    students={studentsForUser} 
                    allStudents={students}
                    onSelectStudent={handleSelectStudent} 
                    user={currentUser} 
                    onAssignStudent={handleAssignStudentToTeacher}
                    onUnassignStudent={handleUnassignStudentToTeacher}
                    onRegisterStudent={handleRegisterStudent}
                />;
            case 'families':
                return <FamilyManagement
                    allUsers={users}
                    allStudents={students}
                    onAssignStudentToFamily={handleAssignStudentToFamily}
                    onUnassignStudentFromFamily={handleUnassignStudentFromFamily}
                />;
            case 'assistant':
                return <ChatInterface user={currentUser} students={studentsForUser} />;
            case 'strategies':
                return <StrategyBank students={studentsForUser} onAssignStrategy={handleAssignStrategyToStudent} />;
            default:
                return <Dashboard students={studentsForUser} onSelectStudent={handleSelectStudent} />;
        }
    };
    
    if (!authReady) {
        return <div className="flex h-screen items-center justify-center text-slate-500">Cargando...</div>;
    }

    if (!currentUser) {
        return <LoginScreen onLogin={handleLogin} onPublicSignUp={handlePublicSignUp} />;
    }

    return (
        <>
            <Layout user={currentUser} onLogout={handleLogout} setView={setView} currentView={view} onOpenSettings={() => setShowChangeCredentialsModal(true)}>
                {renderContent()}
            </Layout>
            <RegisterStudentModal
                isOpen={showRegisterStudentModal}
                onClose={() => setShowRegisterStudentModal(false)}
                onSubmit={handleRegisterStudentAndNotify}
            />
             {showChangeCredentialsModal && currentUser && (
                <ChangePasswordModal 
                    isOpen={showChangeCredentialsModal}
                    onClose={() => setShowChangeCredentialsModal(false)}
                    onUpdate={handleUpdateCredentials}
                    currentUser={currentUser}
                />
            )}
        </>
    );
};

export default App;