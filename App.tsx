
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
import TeacherProfile from './components/TeacherProfile';
import FamilyProfile from './components/FamilyProfile';
import { supabase } from './services/supabaseClient';
import type { Session } from '@supabase/supabase-js';
import type { Student, AuthenticatedUser, Notification, NewStudentData, Strategy, Document, ProgressEntry } from './types';

const App: React.FC = () => {
    const [session, setSession] = useState<Session | null>(null);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [selectedTeacher, setSelectedTeacher] = useState<AuthenticatedUser | null>(null);
    const [selectedFamily, setSelectedFamily] = useState<AuthenticatedUser | null>(null);
    const [view, setView] = useState<any>('dashboard');
    
    const [students, setStudents] = useState<Student[]>([]);
    const [users, setUsers] = useState<AuthenticatedUser[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [currentUser, setCurrentUser] = useState<AuthenticatedUser | null>(null);
    const [loading, setLoading] = useState(true);
    
    const [showRegisterStudentModal, setShowRegisterStudentModal] = useState(false);
    const [showAssignToFamilyModal, setShowAssignToFamilyModal] = useState(false);
    const [newlyRegisteredStudent, setNewlyRegisteredStudent] = useState<Student | null>(null);
    const [initialStudentFilter, setInitialStudentFilter] = useState<Record<string, any> | null>(null);


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
                    // Fetch current user's profile - this is a critical operation.
                    const { data: userProfile, error: profileError } = await supabase
                        .from('users')
                        .select('*')
                        .eq('id', session.user.id)
                        .single();
                    
                    if (profileError) throw profileError;

                    if (userProfile) {
                        setCurrentUser({ ...userProfile, email: session.user.email! } as AuthenticatedUser);
                    } else {
                         // This can happen if the public.users table is not populated yet after signup.
                         // Signing out is a safe way to handle this state.
                         throw new Error("User profile not found in database. Signing out.");
                    }
                } catch (error: any) {
                    console.error("Error fetching critical user profile:", error.message || error);
                    setCurrentUser(null);
                    await supabase.auth.signOut();
                    return; // Stop further execution if profile fails
                }

                // Fetch other non-critical data.
                
                // Fetch all users for directory
                const { data: allUsers, error: usersError } = await supabase.from('users').select('*');
                if(usersError) {
                    console.error("Error fetching user directory:", usersError.message);
                    setUsers([]);
                } else {
                    setUsers((allUsers as AuthenticatedUser[]) || []);
                }

                // Fetch students
                const { data: studentsData, error: studentsError } = await supabase.from('students').select('*').order('created_at', { ascending: false });
                if (studentsError) {
                    console.error("Error fetching students:", studentsError.message);
                    setStudents([]);
                } else {
                     // Sanitize student data to prevent crashes from null/non-array values
                    const processedStudents = (studentsData as any[] || []).map(student => ({
                        ...student,
                        photo_url: student.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name || '?')}&background=0ea5e9&color=fff`,
                        teachers: Array.isArray(student.teachers) ? student.teachers : [],
                        documents: Array.isArray(student.documents) ? student.documents : [],
                        progress_entries: Array.isArray(student.progress_entries) ? student.progress_entries : [],
                        family_member_ids: Array.isArray(student.family_member_ids) ? student.family_member_ids : [],
                    }));
                    setStudents(processedStudents as Student[]);
                }

                // Fetch notifications for the current user
                const { data: notificationsData, error: notificationsError } = await supabase
                    .from('notifications')
                    .select('*')
                    .eq('user_id', session.user.id)
                    .order('timestamp', { ascending: false }).limit(20);
                if (notificationsError) {
                    console.error("Error fetching notifications:", notificationsError.message);
                    setNotifications([]);
                } else {
                    setNotifications((notificationsData as Notification[]) || []);
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
    
    const addNotification = async (title: string, message: string, targetUserIds: string[]) => {
        if (!currentUser || !targetUserIds || targetUserIds.length === 0) return;

        const newNotifications = targetUserIds.map(userId => ({
            title,
            message,
            timestamp: new Date().toISOString(),
            read: false,
            user_id: userId,
        }));
        
        const { data, error } = await supabase.from('notifications').insert(newNotifications).select();
        
        if (error) {
            console.error("Failed to add notification:", error);
            return;
        }

        // Only add the notification to the current user's local state if they are one of the targets.
        if (data && targetUserIds.includes(currentUser.id)) {
            const userNotification = data.find(n => n.user_id === currentUser.id);
            if (userNotification) {
                setNotifications(prev => [userNotification as Notification, ...prev].slice(0, 20));
            }
        }
    };

    const handleClearNotifications = async () => {
        if (!currentUser) return;
        const { error } = await supabase
            .from('notifications')
            .delete()
            .eq('user_id', currentUser.id);
        
        if (error) {
            console.error("Failed to clear notifications:", error);
            addNotification('Error', 'No se pudieron borrar las notificaciones.', [currentUser.id]);
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
                return students.filter(s => s.family_member_ids && s.family_member_ids.includes(currentUser.id));
             case 'Director':
                return students;
            default:
                return [];
        }
    }, [students, currentUser]);

    const handleSelectStudent = (student: Student) => {
        setSelectedStudent(student);
    };
    
    const handleSelectTeacher = (teacher: AuthenticatedUser) => {
        setSelectedTeacher(teacher);
    };
    
    const handleSelectFamily = (family: AuthenticatedUser) => {
        setSelectedFamily(family);
    };

    const handleBack = () => {
        setSelectedStudent(null);
        setSelectedTeacher(null);
        setSelectedFamily(null);
        setView('dashboard');
    };
    
    const handleNavigation = (targetView: string) => {
        setSelectedStudent(null);
        setSelectedTeacher(null);
        setSelectedFamily(null);
        setView(targetView);
    };
    
    const handleNavigationWithFilter = (targetView: string, filter: Record<string, any>) => {
        setInitialStudentFilter(filter);
        handleNavigation(targetView);
    };

    const updateStudentData = async (updatedStudent: Student) => {
        if (!currentUser) return;
        const {
          id,
          name,
          age,
          photo_url,
          grade,
          risk_level,
          diagnosis,
          teachers,
          documents,
          progress_entries,
          family_member_ids,
        } = updatedStudent;

        const updatePayload = {
          name,
          age,
          photo_url,
          grade,
          risk_level,
          diagnosis,
          teachers,
          documents,
          progress_entries,
          family_member_ids,
        };
        
        const { data, error } = await supabase
            .from('students')
            .update(updatePayload)
            .eq('id', id)
            .select();
        
        if (error) {
            console.error("Failed to update student:", error);
            addNotification('Error de Sincronización', `No se pudo actualizar. Razón: ${error.message}`, [currentUser.id]);
            return;
        }

        if (data) {
            const returnedStudent = data[0] as any;
             // Re-sanitize the single updated student record
            const processedStudent: Student = {
                ...returnedStudent,
                photo_url: returnedStudent.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(returnedStudent.name || '?')}&background=0ea5e9&color=fff`,
                teachers: Array.isArray(returnedStudent.teachers) ? returnedStudent.teachers : [],
                documents: Array.isArray(returnedStudent.documents) ? returnedStudent.documents : [],
                progress_entries: Array.isArray(returnedStudent.progress_entries) ? returnedStudent.progress_entries : [],
                family_member_ids: Array.isArray(returnedStudent.family_member_ids) ? returnedStudent.family_member_ids : [],
            };
            
            setStudents(prevStudents => prevStudents.map(s => s.id === processedStudent.id ? processedStudent : s));
            if (selectedStudent && selectedStudent.id === processedStudent.id) {
                setSelectedStudent(processedStudent);
            }
        }
    };

    const handleAddProgressEntry = async (studentId: string, area: string, observation: string, author: string) => {
        if (!currentUser) return false;
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
            addNotification('Registro de Progreso', `Nueva observación añadida para ${student.name}.`, [currentUser.id]);
            return true;
        }
        addNotification('Error', 'No se pudo encontrar al estudiante para añadir la observación.', [currentUser.id]);
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

        addNotification('Estrategia Asignada', `La estrategia "${strategy.title}" ha sido asignada.`, [currentUser.id]);
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
         if (!currentUser) return null;
         let studentToInsert: Omit<Student, 'id' | 'documents' | 'progress_entries'> & { documents: Document[], progress_entries: ProgressEntry[] } = {
            photo_url: `https://picsum.photos/seed/${newStudentData.name.split(' ').join('')}/200`,
            documents: [],
            progress_entries: [],
            teachers: [],
            family_member_ids: [],
            ...newStudentData,
        };

        if (currentUser.role === 'Docente') {
            studentToInsert.teachers = [currentUser.name];
        }
        
        const { data, error } = await supabase.from('students').insert(studentToInsert).select();
        if (error) {
            console.error("Failed to register student:", error);
            addNotification('Error de Registro', `No se pudo registrar al estudiante.`, [currentUser.id]);
            return null;
        }
        if (data) {
            const newStudent = data[0] as any;
             const processedStudent: Student = {
                ...newStudent,
                photo_url: newStudent.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(newStudent.name || '?')}&background=0ea5e9&color=fff`,
                teachers: Array.isArray(newStudent.teachers) ? newStudent.teachers : [],
                documents: Array.isArray(newStudent.documents) ? newStudent.documents : [],
                progress_entries: Array.isArray(newStudent.progress_entries) ? newStudent.progress_entries : [],
                family_member_ids: Array.isArray(newStudent.family_member_ids) ? newStudent.family_member_ids : [],
            };
            setStudents(prev => [processedStudent, ...prev]);
            return processedStudent;
        }
        return null;
    };
    
    const handleRegisterStudentAndNotify = async (newStudentData: NewStudentData) => {
        if (!currentUser) return;
        const newStudent = await handleRegisterStudent(newStudentData);
        if (newStudent) {
            setShowRegisterStudentModal(false);
            if (currentUser?.role === 'Docente') {
                setNewlyRegisteredStudent(newStudent);
                setShowAssignToFamilyModal(true);
            } else {
                 addNotification('Estudiante Registrado', `¡Estudiante ${newStudent.name} registrado con éxito!`, [currentUser.id]);
            }
        }
    };

    const handleAssignStudentToFamily = async (familyId: string, studentId: string) => {
        if (!currentUser) return;
        const familyUser = users.find(u => u.id === familyId);
        const student = students.find(s => s.id === studentId);

        if (!familyUser || !student) {
            addNotification('Error de Asignación', `No se encontró la familia o el estudiante.`, [currentUser.id]);
            return;
        }
        
        const currentIds = student.family_member_ids || [];
        if (currentIds.includes(familyId)) return; // Already assigned

        const updatedIds = [...currentIds, familyId];
        await updateStudentData({ ...student, family_member_ids: updatedIds });
        addNotification('Asignación Exitosa', `${student.name} asignado a ${familyUser.name}.`, [currentUser.id, familyId]);
    };
    
    const handleConfirmAssignmentAndNotify = async (familyUsername: string, studentId: string) => {
        if (!currentUser || !newlyRegisteredStudent) return;
        const familyUser = users.find(u => u.username === familyUsername);
        if (familyUser) {
            await handleUpdateStudentFamily(studentId, [familyUser.id]);
            addNotification('Asignación Exitosa', `${newlyRegisteredStudent?.name} asignado a ${familyUser.name}.`, [currentUser.id, familyUser.id]);
        }
        setShowAssignToFamilyModal(false);
        setNewlyRegisteredStudent(null);
    };

    const handleUnassignFamilyFromStudent = async (familyId: string, studentId: string) => {
        if (!currentUser) return;
        const student = students.find(s => s.id === studentId);
        const familyUser = users.find(u => u.id === familyId);
        if (!student || !familyUser) {
            addNotification('Error de Desasignación', `No se pudo encontrar la familia o el estudiante.`, [currentUser.id]);
            return;
        }
        
        const updatedIds = (student.family_member_ids || []).filter(id => id !== familyId);
        await updateStudentData({ ...student, family_member_ids: updatedIds });
        addNotification('Desasignación Exitosa', `Se quitó a ${familyUser.name} del estudiante ${student.name}.`, [currentUser.id, familyId]);
    };
    
    const handleUpdateStudentFamily = async (studentId: string, familyIds: string[] | null) => {
        if (!currentUser) return;
        const student = students.find(s => s.id === studentId);
        if (!student) {
            addNotification('Error', 'No se pudo encontrar al estudiante para actualizar.', [currentUser.id]);
            return;
        }
        
        const oldFamilyIds = student.family_member_ids || [];
        await updateStudentData({ ...student, family_member_ids: familyIds || [] });

        const newFamilyIds = familyIds || [];
        const allInvolvedIds = [...new Set([...oldFamilyIds, ...newFamilyIds])];
        const targetUserIds = [...new Set([currentUser.id, ...allInvolvedIds])];

        addNotification('Acudiente Actualizado', `Se actualizaron los acudientes para ${student.name}.`, targetUserIds);
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
                addNotification('Error', 'No se pudo subir la foto de perfil.', [currentUser.id]);
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
            addNotification('Error', 'No se pudo actualizar el perfil.', [currentUser.id]);
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
        
        // --- Role: Familia ---
        if (currentUser.role === 'Familia') {
            if (view === 'settings') {
                return <ProfileSettings user={currentUser} onUpdateProfile={handleUpdateUserProfile} />;
            }
            // The FamilyDashboard is the main entry point, and we pass the initial active tab
            // based on the global view state, making sidebar navigation work seamlessly.
            const initialTab = view === 'assistant' ? 'assistant' : 'summary';
            return <FamilyDashboard
                        user={currentUser}
                        students={studentsForUser}
                        onUpdateStudent={updateStudentData}
                        onNavigate={handleNavigation}
                        initialTab={initialTab}
                    />;
        }

        // --- Roles: Director & Docente ---
        if (selectedStudent) {
            return <StudentProfile 
                        student={selectedStudent} 
                        onBack={() => setSelectedStudent(null)} 
                        userRole={currentUser.role} 
                        onUpdateStudent={updateStudentData} 
                        allUsers={users}
                        onUpdateStudentFamily={handleUpdateStudentFamily}
                    />;
        }
        
        if (selectedFamily && currentUser.role === 'Director') {
            return <FamilyProfile 
                        family={selectedFamily} 
                        allStudents={students}
                        onBack={() => setSelectedFamily(null)}
                        onSelectStudent={handleSelectStudent}
                    />;
        }

        if (selectedTeacher && currentUser.role === 'Director') {
            return <TeacherProfile 
                        teacher={selectedTeacher} 
                        allStudents={students}
                        onBack={() => setSelectedTeacher(null)}
                        onSelectStudent={handleSelectStudent}
                    />;
        }
        
        if (view === 'settings') {
             return <ProfileSettings user={currentUser} onUpdateProfile={handleUpdateUserProfile} />;
        }
        
        switch (view) {
            case 'dashboard':
                if (currentUser.role === 'Director') {
                    return <DirectorDashboard 
                        students={students} 
                        users={users.filter(u => u.id !== currentUser.id)}
                        onSelectStudent={handleSelectStudent}
                        onRegisterStudentClick={() => setShowRegisterStudentModal(true)}
                        onSelectTeacher={handleSelectTeacher}
                        onSelectFamily={handleSelectFamily}
                    />;
                }
                return <Dashboard students={studentsForUser} onSelectStudent={handleSelectStudent} onNavigateWithFilter={handleNavigationWithFilter} />;

            case 'students':
                return <StudentList 
                    students={studentsForUser} 
                    allStudents={students}
                    onSelectStudent={handleSelectStudent} 
                    user={currentUser} 
                    onAssignStudent={handleAddTeacherToStudent}
                    onUnassignStudent={handleRemoveTeacherFromStudent}
                    onRegisterStudentClick={() => setShowRegisterStudentModal(true)}
                    initialFilter={initialStudentFilter}
                    onClearInitialFilter={() => setInitialStudentFilter(null)}
                />;
            case 'families':
                return <FamilyManagement
                    allUsers={users}
                    allStudents={students}
                    onAssignStudentToFamily={handleAssignStudentToFamily}
                    onUnassignFamilyFromStudent={handleUnassignFamilyFromStudent}
                />;
            case 'assistant':
                return <ChatInterface 
                            user={currentUser} 
                            students={studentsForUser} 
                            onAddProgressEntry={handleAddProgressEntry}
                            onAssignStrategy={handleAssignStrategyToStudent}
                        />;
            case 'strategies':
                return <StrategyBank students={studentsForUser} onAssignStrategy={handleAssignStrategyToStudent} />;
            case 'settings':
                return <ProfileSettings user={currentUser} onUpdateProfile={handleUpdateUserProfile} />;
            default:
                 return <Dashboard students={studentsForUser} onSelectStudent={handleSelectStudent} onNavigateWithFilter={handleNavigationWithFilter} />;
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
            {newlyRegisteredStudent && currentUser && (
                <AssignToFamilyModal
                    isOpen={showAssignToFamilyModal}
                    onClose={() => {
                        setShowAssignToFamilyModal(false);
                        addNotification('Registro Exitoso', `¡Estudiante ${newlyRegisteredStudent.name} registrado! Puedes asignarlo a una familia más tarde.`, [currentUser.id]);
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
