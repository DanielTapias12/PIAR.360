
import React, { useState, useMemo, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import DirectorDashboard from './components/DirectorDashboard';
import StudentList from './components/StudentList';
import StudentProfile from './components/StudentProfile';
import FamilyDashboard from './components/FamilyDashboard';
import ChatInterface from './components/ChatInterface';
import StrategyBank from './components/StrategyBank';
import FamilyManagement from './components/FamilyManagement';
import ProfileSettings from './components/ProfileSettings';
import RegisterStudentModal from './components/RegisterStudentModal';
import AssignToFamilyModal from './components/AssignToFamilyModal';
import Auth from './components/Auth';
import { supabase } from './services/supabaseClient';
import type { Session } from '@supabase/supabase-js';
import type { Student, AuthenticatedUser, Notification, NewStudentData, Strategy, Document, ProgressEntry } from './types';

const App: React.FC = () => {
    const [session, setSession] = useState<Session | null>(null);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [view, setView] = useState<any>('dashboard');
    
    const [students, setStudents] = useState<Student[]>([]);
    const [users, setUsers] = useState<AuthenticatedUser[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [currentUser, setCurrentUser] = useState<AuthenticatedUser | null>(null);
    const [loading, setLoading] = useState(true);
    
    const [showRegisterStudentModal, setShowRegisterStudentModal] = useState(false);
    const [showAssignToFamilyModal, setShowAssignToFamilyModal] = useState(false);
    const [newlyRegisteredStudent, setNewlyRegisteredStudent] = useState<Student | null>(null);


    useEffect(() => {
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);
            setLoading(false);
        };
        getSession();

        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    useEffect(() => {
        const fetchUserData = async () => {
            if (session?.user?.id) {
                try {
                    // Fetch current user's profile
                    const { data: userProfile, error: profileError } = await supabase
                        .from('users')
                        .select('*')
                        .eq('id', session.user.id)
                        .single();
                    
                    if (profileError) throw profileError;
                    if (userProfile) {
                        setCurrentUser({ ...userProfile, email: session.user.email! } as AuthenticatedUser);
                    } else {
                         throw new Error("User profile not found in database.");
                    }


                    // Fetch all users for directory
                    const { data: allUsers, error: usersError } = await supabase.from('users').select('*');
                    if(usersError) throw usersError;
                    setUsers(allUsers as AuthenticatedUser[]);

                    // Fetch students
                    const { data: studentsData, error: studentsError } = await supabase.from('students').select('*').order('created_at', { ascending: false });
                    if (studentsError) throw studentsError;
                    
                    // Sanitize student data to prevent crashes from null/non-array values
                    const processedStudents = (studentsData as any[] || []).map(student => ({
                        ...student,
                        teachers: Array.isArray(student.teachers) ? student.teachers : [],
                        documents: Array.isArray(student.documents) ? student.documents : [],
                        progress_entries: Array.isArray(student.progress_entries) ? student.progress_entries : [],
                    }));

                    setStudents(processedStudents as Student[]);

                    // Fetch notifications
                    const { data: notificationsData, error: notificationsError } = await supabase.from('notifications').select('*').order('timestamp', { ascending: false }).limit(20);
                    if (notificationsError) throw notificationsError;
                    setNotifications((notificationsData as Notification[]) || []);
                } catch (error) {
                    console.error("Error fetching user data:", error);
                    setCurrentUser(null);
                    // If profile load fails, sign out to prevent broken state
                    await supabase.auth.signOut();
                }
            } else {
                // Clear data on logout
                setCurrentUser(null);
                setUsers([]);
                setStudents([]);
                setNotifications([]);
            }
        };

        fetchUserData();
    }, [session]);
    
    const addNotification = async (title: string, message: string) => {
        const newNotification = {
            title,
            message,
            timestamp: new Date().toISOString(),
            read: false,
        };
        const { data, error } = await supabase.from('notifications').insert(newNotification).select();
        if (error) {
            console.error("Failed to add notification:", error);
            return;
        }
        if (data) {
            setNotifications(prev => [data[0] as Notification, ...prev].slice(0, 20));
        }
    };

    const handleClearNotifications = async () => {
        // In a real app with user-specific notifications, you'd add a filter like .eq('user_id', currentUser.id)
        const { error } = await supabase.from('notifications').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        
        if (error) {
            console.error("Failed to clear notifications:", error);
            addNotification('Error', 'No se pudieron borrar las notificaciones.');
        } else {
            setNotifications([]);
        }
    };
    
    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    const studentsForUser = useMemo(() => {
        if (!currentUser) return [];
        
        switch (currentUser.role) {
            case 'Docente':
                return students.filter(s => s.teachers && s.teachers.includes(currentUser.name));
            case 'Familia':
                return students.filter(s => s.id === currentUser.student_id);
             case 'Director':
                return students;
            default:
                return [];
        }
    }, [students, currentUser]);

    const handleSelectStudent = (student: Student) => {
        setSelectedStudent(student);
    };

    const handleBack = () => {
        setSelectedStudent(null);
        setView('students'); // Return to the list view by default
    };
    
    const handleNavigation = (targetView: string) => {
        // Always clear the student selection when using main navigation
        // to prevent being "stuck" in a student profile.
        setSelectedStudent(null);
        setView(targetView);
    };

    const updateStudentData = async (updatedStudent: Student) => {
        const { id, ...updatePayload } = updatedStudent;

        const { data, error } = await supabase
            .from('students')
            .update(updatePayload)
            .eq('id', id)
            .select();
        
        if (error) {
            console.error("Failed to update student:", error);
            addNotification('Error de Sincronización', `No se pudo actualizar el estudiante ${updatedStudent.name}.`);
            return;
        }

        if (data) {
            const returnedStudent = data[0] as any;
             // Re-sanitize the single updated student record
            const processedStudent: Student = {
                ...returnedStudent,
                teachers: Array.isArray(returnedStudent.teachers) ? returnedStudent.teachers : [],
                documents: Array.isArray(returnedStudent.documents) ? returnedStudent.documents : [],
                progress_entries: Array.isArray(returnedStudent.progress_entries) ? returnedStudent.progress_entries : [],
            };
            
            setStudents(prevStudents => prevStudents.map(s => s.id === processedStudent.id ? processedStudent : s));
            if (selectedStudent && selectedStudent.id === processedStudent.id) {
                setSelectedStudent(processedStudent);
            }
        }
    };

    const handleAddProgressEntry = async (studentId: string, area: string, observation: string, author: string) => {
        const student = students.find(s => s.id === studentId);
        if (student) {
            const newProgressEntry: ProgressEntry = {
                id: `prog_${Date.now()}`,
                date: new Date().toISOString().split('T')[0],
                area,
                observation,
                author,
            };
            const updatedEntries = [newProgressEntry, ...student.progress_entries];
            await updateStudentData({ ...student, progress_entries: updatedEntries });
            addNotification('Registro de Progreso', `Nueva observación añadida para ${student.name}.`);
            return true;
        }
        addNotification('Error', 'No se pudo encontrar al estudiante para añadir la observación.');
        return false;
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
            if (student) {
                const newProgressEntry: ProgressEntry = {
                    ...newProgressEntryBase,
                    id: `prog_strat_${Date.now()}_${student.id}`,
                };
                const updatedEntries = [newProgressEntry, ...student.progress_entries];
                await updateStudentData({ ...student, progress_entries: updatedEntries });
            }
        }

        addNotification('Estrategia Asignada', `La estrategia "${strategy.title}" ha sido asignada.`);
    };
    
    const handleAddTeacherToStudent = async (studentId: string) => {
        if (!currentUser || currentUser.role !== 'Docente') return;
        const student = students.find(s => s.id === studentId);
        if (student) {
            const updatedTeachers = [...(student.teachers || []), currentUser.name];
            await updateStudentData({ ...student, teachers: updatedTeachers });
        }
    };

    const handleRemoveTeacherFromStudent = async (studentId: string) => {
        if (!currentUser || currentUser.role !== 'Docente') return;
        const student = students.find(s => s.id === studentId);
        if (student) {
            const updatedTeachers = (student.teachers || []).filter(name => name !== currentUser.name);
            await updateStudentData({ ...student, teachers: updatedTeachers });
        }
    };

    const handleRegisterStudent = async (newStudentData: NewStudentData) => {
         let studentToInsert: Omit<Student, 'id' | 'documents' | 'progress_entries'> & { documents: Document[], progress_entries: ProgressEntry[] } = {
            photo_url: `https://picsum.photos/seed/${newStudentData.name.split(' ').join('')}/200`,
            documents: [],
            progress_entries: [],
            teachers: [],
            ...newStudentData,
        };

        if (currentUser && currentUser.role === 'Docente') {
            studentToInsert.teachers = [currentUser.name];
        }
        
        const { data, error } = await supabase.from('students').insert(studentToInsert).select();
        if (error) {
            console.error("Failed to register student:", error);
            addNotification('Error de Registro', `No se pudo registrar al estudiante.`);
            return null;
        }
        if (data) {
            const newStudent = data[0] as any;
             const processedStudent: Student = {
                ...newStudent,
                teachers: Array.isArray(newStudent.teachers) ? newStudent.teachers : [],
                documents: Array.isArray(newStudent.documents) ? newStudent.documents : [],
                progress_entries: Array.isArray(newStudent.progress_entries) ? newStudent.progress_entries : [],
            };
            setStudents(prev => [processedStudent, ...prev]);
            return processedStudent;
        }
        return null;
    };
    
    const handleRegisterStudentAndNotify = async (newStudentData: NewStudentData) => {
        const newStudent = await handleRegisterStudent(newStudentData);
        if (newStudent) {
            setShowRegisterStudentModal(false);
            if (currentUser?.role === 'Docente') {
                setNewlyRegisteredStudent(newStudent);
                setShowAssignToFamilyModal(true);
            } else {
                 addNotification('Estudiante Registrado', `¡Estudiante ${newStudent.name} registrado con éxito!`);
            }
        }
    };

    const handleAssignStudentToFamily = async (familyUsername: string, studentId: string) => {
        const { error: unassignError } = await supabase.from('users').update({ student_id: null }).eq('student_id', studentId);
        if (unassignError) { console.error('Unassign error:', unassignError); return; }

        const { error: assignError } = await supabase.from('users').update({ student_id: studentId }).eq('username', familyUsername);
        if (assignError) { console.error('Assign error:', assignError); return; }
        
        // Refresh users from DB to get the latest state
        const { data: refreshedUsers, error: fetchError } = await supabase.from('users').select('*');
        if (refreshedUsers) {
            setUsers(refreshedUsers as AuthenticatedUser[]);
        }
    };
    
    const handleConfirmAssignmentAndNotify = async (familyUsername: string, studentId: string) => {
        await handleAssignStudentToFamily(familyUsername, studentId);
        setShowAssignToFamilyModal(false);
        setNewlyRegisteredStudent(null);
        const family = users.find(u => u.username === familyUsername);
        const student = students.find(s => s.id === studentId);
        if (family && student) {
            addNotification('Asignación Exitosa', `Estudiante ${student.name} asignado a ${family.name}.`);
        }
    };

    const handleUnassignStudentFromFamily = async (familyUsername: string) => {
        const { error } = await supabase.from('users').update({ student_id: null }).eq('username', familyUsername);
        if (error) { console.error("Unassign error:", error); return; }

        setUsers(prevUsers => prevUsers.map(user => 
            user.username === familyUsername ? { ...user, student_id: undefined } : user
        ));
    };

    const handleUpdateUserProfile = async (updatedProfileData: Partial<AuthenticatedUser>, newAvatarFile?: File) => {
        if (!currentUser) return;

        let avatarUrl = currentUser.photo_url;

        if (newAvatarFile) {
            const fileExt = newAvatarFile.name.split('.').pop();
            const filePath = `${currentUser.id}/${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('user_avatars')
                .upload(filePath, newAvatarFile);
            
            if (uploadError) {
                console.error('Avatar upload error:', uploadError);
                addNotification('Error', 'No se pudo subir la foto de perfil.');
                return;
            }

            const { data } = supabase.storage.from('user_avatars').getPublicUrl(filePath);
            avatarUrl = data.publicUrl;
        }

        const profileToUpdate = {
            ...updatedProfileData,
            photo_url: avatarUrl,
            updated_at: new Date().toISOString(),
        };
        
        delete profileToUpdate.id;
        delete profileToUpdate.email;

        const { data: updatedUser, error: updateError } = await supabase
            .from('users')
            .update(profileToUpdate)
            .eq('id', currentUser.id)
            .select()
            .single();
        
        if (updateError) {
            console.error('Profile update error:', updateError);
            addNotification('Error', 'No se pudo actualizar el perfil.');
            return;
        }

        if (updatedUser) {
            const fullyUpdatedUser = { ...updatedUser, email: currentUser.email } as AuthenticatedUser;
            setCurrentUser(fullyUpdatedUser);
            setUsers(prevUsers => prevUsers.map(u => u.id === currentUser.id ? fullyUpdatedUser : u));
        }
    };

    const renderContent = () => {
        if (!currentUser) return null;

        if (selectedStudent) {
            if (currentUser.role === 'Familia') {
                 return <FamilyDashboard user={currentUser} student={selectedStudent} onBack={handleBack} onUpdateStudent={updateStudentData}/>;
            }
            return <StudentProfile student={selectedStudent} onBack={handleBack} userRole={currentUser.role} onUpdateStudent={updateStudentData} allUsers={users}/>;
        }
        
        if (currentUser.role === 'Familia') {
            const familyStudent = studentsForUser[0];
            if (familyStudent) {
                return <FamilyDashboard user={currentUser} student={familyStudent} onBack={handleBack} onUpdateStudent={updateStudentData}/>;
            }
            return <div className="p-8 text-center text-slate-500">No hay un estudiante asociado a esta cuenta familiar.</div>;
        }

        if (currentUser.role === 'Director' && view === 'dashboard') {
             return <DirectorDashboard 
                students={students} 
                users={users.filter(u => u.id !== currentUser.id)}
                onSelectStudent={handleSelectStudent}
                onRegisterStudentClick={() => setShowRegisterStudentModal(true)}
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
                    onAssignStudent={handleAddTeacherToStudent}
                    onUnassignStudent={handleRemoveTeacherFromStudent}
                    onRegisterStudentClick={() => setShowRegisterStudentModal(true)}
                />;
            case 'families':
                return <FamilyManagement
                    allUsers={users}
                    allStudents={students}
                    onAssignStudentToFamily={handleAssignStudentToFamily}
                    onUnassignStudentFromFamily={handleUnassignStudentFromFamily}
                />;
            case 'assistant':
                return <ChatInterface 
                            user={currentUser} 
                            students={studentsForUser} 
                            onAddProgressEntry={handleAddProgressEntry}
                        />;
            case 'strategies':
                return <StrategyBank students={studentsForUser} onAssignStrategy={handleAssignStrategyToStudent} />;
            case 'settings':
                return <ProfileSettings user={currentUser} onUpdateProfile={handleUpdateUserProfile} />;
            default:
                return currentUser.role === 'Director' 
                    ? <DirectorDashboard students={students} users={users} onSelectStudent={handleSelectStudent} onRegisterStudentClick={() => setShowRegisterStudentModal(true)} /> 
                    : <Dashboard students={studentsForUser} onSelectStudent={handleSelectStudent} />;
        }
    };
    
    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen w-full bg-slate-50">
                <p className="text-slate-500">Inicializando PIAR.360...</p>
            </div>
        );
    }
    
    if (!session) {
        return <Auth />;
    }

    return (
        <>
            <Layout user={currentUser} setView={handleNavigation} currentView={view} notifications={notifications} setNotifications={setNotifications} onLogout={handleLogout} onClearNotifications={handleClearNotifications}>
                {renderContent()}
            </Layout>
            <RegisterStudentModal
                isOpen={showRegisterStudentModal}
                onClose={() => setShowRegisterStudentModal(false)}
                onSubmit={handleRegisterStudentAndNotify}
            />
            {newlyRegisteredStudent && (
                <AssignToFamilyModal
                    isOpen={showAssignToFamilyModal}
                    onClose={() => {
                        setShowAssignToFamilyModal(false);
                        addNotification('Registro Exitoso', `¡Estudiante ${newlyRegisteredStudent.name} registrado! Puedes asignarlo a una familia más tarde.`);
                        setNewlyRegisteredStudent(null);
                    }}
                    student={newlyRegisteredStudent}
                    families={users.filter(u => u.role === 'Familia')}
                    onConfirm={handleConfirmAssignmentAndNotify}
                />
            )}
        </>
    );
};

export default App;
