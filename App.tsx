
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { supabase } from './services/supabaseClient';
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
import UserRegistrationModal from './components/UserRegistrationModal';
import ChangePasswordModal from './components/ChangePasswordModal';
import { AuthError, User } from '@supabase/supabase-js';

const App: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<AuthenticatedUser | null>(null);
    const [authReady, setAuthReady] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [view, setView] = useState<any>('dashboard');
    
    const [students, setStudents] = useState<Student[]>([]);
    const [users, setUsers] = useState<AuthenticatedUser[]>([]);
    const [directorExists, setDirectorExists] = useState(false);
    
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [showChangeCredentialsModal, setShowChangeCredentialsModal] = useState(false);
    const [newlyCreatedCredentials, setNewlyCreatedCredentials] = useState<{username: string, password: string} | null>(null);

    const fetchData = useCallback(async () => {
        const { data: studentsData, error: studentsError } = await supabase.from('students').select('*');
        if (studentsError) console.error('Error fetching students:', studentsError);
        else setStudents(studentsData || []);

        const { data: usersData, error: usersError } = await supabase.from('users').select('*');
        if (usersError) {
            console.error('Error fetching users:', usersError);
        } else {
            const allUsers = usersData || [];
            setUsers(allUsers);
            setDirectorExists(allUsers.some(u => u.role === 'Director'));
        }
    }, []);

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                const { data: userProfile, error } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();

                if (error) {
                    console.error('Error fetching user profile:', error);
                    setCurrentUser(null);
                } else if (userProfile) {
                    setCurrentUser(userProfile as AuthenticatedUser);
                    await fetchData();
                    if (userProfile.is_new_user) {
                        setShowChangeCredentialsModal(true);
                    }
                }
            } else {
                setCurrentUser(null);
                 // Fetch users even when logged out to check for director existence
                const { data: usersData, error: usersError } = await supabase.from('users').select('role');
                if (!usersError && usersData) {
                     setDirectorExists(usersData.some(u => u.role === 'Director'));
                }
            }
            setAuthReady(true);
        });

        // Initial check for director existence on app load
        const checkInitialDirector = async () => {
             const { data: usersData, error: usersError } = await supabase.from('users').select('role');
             if (!usersError && usersData) {
                 setDirectorExists(usersData.some(u => u.role === 'Director'));
             }
        };
        checkInitialDirector();

        return () => subscription.unsubscribe();
    }, [fetchData]);


    const studentsForUser = useMemo(() => {
        if (!currentUser) return [];
        switch (currentUser.role) {
            case 'Docente':
                return students.filter(s => s.teacher === currentUser.name);
            case 'Familia':
                return students.filter(s => s.id === currentUser.student_id);
             case 'Director':
                return students; // Director can see all students
            default:
                return [];
        }
    }, [currentUser, students]);

    useEffect(() => {
        if (currentUser?.role === 'Familia' && studentsForUser.length > 0 && !selectedStudent) {
            setSelectedStudent(studentsForUser[0]);
        }
    }, [currentUser, studentsForUser, selectedStudent]);

    const handleLogin = async (email: string, password: string): Promise<{ error: AuthError | null }> => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
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
        setStudents([]);
        setUsers([]);
    };

    const handleSelectStudent = (student: Student) => {
        setSelectedStudent(student);
    };

    const handleBack = () => {
        setSelectedStudent(null);
        setView('dashboard');
    };

    const updateStudentData = useCallback(async (updatedStudent: Student) => {
        const { error } = await supabase
            .from('students')
            .update(updatedStudent)
            .eq('id', updatedStudent.id);
        
        if (error) {
            console.error('Error updating student:', error);
        } else {
            setStudents(prevStudents => prevStudents.map(s => s.id === updatedStudent.id ? updatedStudent : s));
            if (selectedStudent && selectedStudent.id === updatedStudent.id) {
                setSelectedStudent(updatedStudent);
            }
        }
    }, [selectedStudent]);
        
    const handleAssignStrategyToStudent = useCallback(async (studentIds: string[], strategy: Strategy) => {
        if (!currentUser) return;
    
        const newProgressEntryBase = {
            date: new Date().toISOString().split('T')[0],
            area: 'Estrategia Asignada',
            observation: `Se asignó la estrategia: "${strategy.title}".`,
            author: currentUser.name,
            strategy: { title: strategy.title, description: strategy.description }
        };

        const updates = students
            .filter(s => studentIds.includes(s.id))
            .map(student => {
                const newProgressEntry: ProgressEntry = {
                    ...newProgressEntryBase,
                    id: `prog_strat_${Date.now()}_${student.id}`,
                };
                const updatedEntries = [newProgressEntry, ...student.progress_entries];
                return supabase.from('students').update({ progress_entries: updatedEntries }).eq('id', student.id);
            });

        const results = await Promise.all(updates);
        const hasError = results.some(res => res.error);

        if (hasError) {
            console.error('Error assigning strategies');
        } else {
            await fetchData(); // Refresh data
        }
    }, [students, currentUser, fetchData]);
    
    const handleAssignStudentToTeacher = useCallback(async (studentId: string) => {
        if (!currentUser || currentUser.role !== 'Docente') return;
        const { error } = await supabase.from('students').update({ teacher: currentUser.name }).eq('id', studentId);
        if (!error) await fetchData();
    }, [currentUser, fetchData]);
    
    const handleUnassignStudentToTeacher = useCallback(async (studentId: string) => {
        if (!currentUser || currentUser.role !== 'Docente') return;
        const { error } = await supabase.from('students').update({ teacher: null }).eq('id', studentId);
        if (!error) await fetchData();
    }, [currentUser, fetchData]);

    const handleRegisterStudent = useCallback(async (newStudentData: NewStudentData) => {
        if (!currentUser) return;
        const newStudent: Omit<Student, 'documents' | 'progress_entries'> & { documents: Document[], progress_entries: ProgressEntry[] } = {
            id: `st_${Date.now()}`,
            // FIX: Changed photoUrl to photo_url to match the Student type.
            photo_url: `https://picsum.photos/seed/${newStudentData.name.split(' ').join('')}/200`,
            teacher: currentUser.role === 'Docente' ? currentUser.name : undefined,
            documents: [],
            progress_entries: [],
            ...newStudentData,
        };
        const { error } = await supabase.from('students').insert(newStudent);
        if (!error) await fetchData();
    }, [currentUser, fetchData]);

    const handleAssignStudentToFamily = useCallback(async (familyUsername: string, studentId: string) => {
        // Unassign from any other family first
        await supabase.from('users').update({ student_id: null }).eq('student_id', studentId);
        // Assign to the new family
        const { error } = await supabase.from('users').update({ student_id: studentId }).eq('username', familyUsername);
        if (!error) await fetchData();
    }, [fetchData]);
    
    const handleUnassignStudentFromFamily = useCallback(async (familyUsername: string) => {
        const { error } = await supabase.from('users').update({ student_id: null }).eq('username', familyUsername);
        if (!error) await fetchData();
    }, [fetchData]);
    
    const handleRegisterUser = useCallback(async (data: { name: string; email: string; role: UserRole }) => {
        const password = Math.random().toString(36).slice(-8);
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: data.email,
            password: password,
        });

        if (authError || !authData.user) {
            console.error("Error signing up:", authError);
            return;
        }

        const baseUsername = data.name.toLowerCase().split(' ').join('').replace(/[^a-z0-9]/gi, '');
        const username = `${baseUsername}${Math.floor(Math.random() * 100)}`;
        
        const { error: profileError } = await supabase.from('users').insert({
            id: authData.user.id,
            ...data,
            username,
            is_new_user: true,
        });

        if (profileError) {
            console.error("Error creating user profile:", profileError);
        } else {
            setNewlyCreatedCredentials({ username, password });
            await fetchData();
        }
    }, [fetchData]);

     const handlePublicSignUp = useCallback(async (data: { name: string; email: string; password: string; role: UserRole }) => {
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: data.email,
            password: data.password,
        });

        if (authError || !authData.user) {
            console.error("Public sign-up error:", authError);
            return { error: authError };
        }
        
        // Generate a simple unique username
        const baseUsername = data.name.toLowerCase().split(' ').join('').replace(/[^a-z0-9]/gi, '');
        const username = `${baseUsername}${Math.floor(Math.random() * 1000)}`;

        const { error: profileError } = await supabase.from('users').insert({
            id: authData.user.id,
            name: data.name,
            email: data.email,
            role: data.role,
            username: username,
            is_new_user: false, // They set their own password, so not a "new user" in the temporary password sense
        });

        if (profileError) {
            console.error("Error creating user profile after public sign-up:", profileError);
            // Here you might want to handle the case where auth user was created but profile failed
        } else {
            if (data.role === 'Director') {
                setDirectorExists(true);
            }
        }

        return { error: profileError };
    }, []);

    const handleUpdateCredentials = useCallback(async (newUsername: string, newPassword?: string) => {
        if (!currentUser) return;

        const updates: { password?: string } = {};
        if (newPassword) {
            updates.password = newPassword;
        }
        
        const { error: authError } = await supabase.auth.updateUser(updates);
        if (authError) {
            console.error("Auth update error:", authError);
            return;
        }

        const { error: profileError } = await supabase
            .from('users')
            .update({ username: newUsername, is_new_user: false })
            .eq('id', currentUser.id);
        
        if (profileError) {
            console.error("Profile update error:", profileError);
            return;
        }

        const updatedUser = { ...currentUser, username: newUsername, is_new_user: false };
        setCurrentUser(updatedUser);
        setShowChangeCredentialsModal(false);
        await fetchData();
    }, [currentUser, fetchData]);

    const handleCloseRegisterModal = () => {
        setShowRegisterModal(false);
        setNewlyCreatedCredentials(null);
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
             // If family user has a student, but it's not selected yet (initial load)
            const familyStudent = studentsForUser[0];
            if (familyStudent) {
                return <FamilyDashboard student={familyStudent} onBack={handleBack} onUpdateStudent={updateStudentData}/>;
            }
            return <div className="p-8 text-center text-slate-500">No hay un estudiante asociado a esta cuenta familiar.</div>;
        }

        if (currentUser.role === 'Director') {
             return <DirectorDashboard 
                students={students} 
                users={users.filter(u => u.id !== currentUser.id)} // Exclude current director from list
                onSelectStudent={handleSelectStudent}
                onRegisterUserClick={() => setShowRegisterModal(true)}
                currentUser={currentUser}
             />;
        }

        // Teacher views
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
        return <LoginScreen onLogin={handleLogin} onPublicSignUp={handlePublicSignUp} directorExists={directorExists} />;
    }

    return (
        <>
            <Layout user={currentUser} onLogout={handleLogout} setView={setView} currentView={view} onOpenSettings={() => setShowChangeCredentialsModal(true)}>
                {renderContent()}
            </Layout>
            {showRegisterModal && currentUser.role === 'Director' && (
                <UserRegistrationModal 
                    isOpen={showRegisterModal}
                    onClose={handleCloseRegisterModal}
                    onRegister={handleRegisterUser}
                    newCredentials={newlyCreatedCredentials}
                />
            )}
             {showChangeCredentialsModal && currentUser && (
                <ChangePasswordModal 
                    isOpen={showChangeCredentialsModal}
                    onClose={() => { if (!currentUser.is_new_user) setShowChangeCredentialsModal(false); }}
                    onUpdate={handleUpdateCredentials}
                    isInitialSetup={!!currentUser.is_new_user}
                    currentUser={currentUser}
                />
            )}
        </>
    );
};

export default App;