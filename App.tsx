import React, { useState, useMemo, useCallback, useEffect } from 'react';
import type { AuthenticatedUser, NewStudentData, Student, Strategy, ProgressEntry, UserRole } from './types';
import { MOCK_STUDENTS, MOCK_USERS } from './services/mockData';
import Layout from './components/Layout';
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/Dashboard';
import StudentList from './components/StudentList';
import StudentProfile from './components/StudentProfile';
import DirectorDashboard from './components/DirectorDashboard';
import FamilyDashboard from './components/FamilyDashboard';
import ChatInterface from './components/ChatInterface';
import StrategyBank from './components/StrategyBank';
import AdminPanel from './components/AdminPanel';
import MasterAdminDashboard from './components/MasterAdminDashboard';

const App: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<AuthenticatedUser | null>(null);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [view, setView] = useState<any>('dashboard');
    const [directorMode, setDirectorMode] = useState<'academic' | 'admin'>('academic');
    
    const [students, setStudents] = useState<Student[]>(MOCK_STUDENTS);
    const [users, setUsers] = useState<AuthenticatedUser[]>(MOCK_USERS);

    const studentsForUser = useMemo(() => {
        if (!currentUser) return [];
        switch (currentUser.role) {
            case 'Docente':
                return students.filter(s => s.teacher === currentUser.name);
            case 'Directivo':
            case 'Jefe Maestro':
                return students;
            case 'Familia':
                return students.filter(s => s.id === currentUser.studentId);
            default:
                return [];
        }
    }, [currentUser, students]);

    useEffect(() => {
        // Automatically select the student for a family user upon login.
        // This avoids setting state during render, which can cause errors.
        if (currentUser?.role === 'Familia' && studentsForUser.length > 0 && !selectedStudent) {
            setSelectedStudent(studentsForUser[0]);
        }
    }, [currentUser, studentsForUser, selectedStudent]);


    const handleLogin = (user: AuthenticatedUser) => {
        setCurrentUser(user);
        if (user.role === 'Jefe Maestro') {
            setView('performance');
        } else {
            setView('dashboard');
        }
        setDirectorMode('academic');
        setSelectedStudent(null);
    };

    const handleLogout = () => {
        setCurrentUser(null);
        setSelectedStudent(null);
    };

    const handleSelectStudent = (student: Student) => {
        setSelectedStudent(student);
    };

    const handleBack = () => {
        setSelectedStudent(null);
        setView('dashboard');
    };

    const updateStudentData = useCallback((updatedStudent: Student) => {
        setStudents(prevStudents => prevStudents.map(s => s.id === updatedStudent.id ? updatedStudent : s));
        if (selectedStudent && selectedStudent.id === updatedStudent.id) {
            setSelectedStudent(updatedStudent);
        }
    }, [selectedStudent]);
    
    const handleAssignGradeToTeacher = useCallback((teacherName: string, grade: string) => {
        setStudents(prevStudents => 
            prevStudents.map(student => 
                student.grade === grade ? { ...student, teacher: teacherName || undefined } : student
            )
        );
    }, []);

    const handleRegisterUser = useCallback((data: { 
        name: string; 
        role: 'Docente' | 'Familia' | 'Directivo'; 
        studentId?: string; 
        assignedGrade?: string; 
        email: string; 
        age: string; 
        address: string; 
        phone: string;
        specialization?: string;
        experience?: string;
        relationship?: string;
        specificPosition?: string;
     }): { username: string, password: string } => {
        const { name, role, studentId, assignedGrade, email, age, address, phone, specialization, experience, relationship, specificPosition } = data;

        const defaultPasswords: { [key in UserRole]?: string } = {
            'Directivo': 'adminpass',
            'Docente': 'password123',
            'Familia': 'familypass'
        }
        const password = defaultPasswords[role] || Math.random().toString(36).slice(-8);

        const nameParts = name.toLowerCase().trim().split(' ').filter(p => p);
        let usernameBase = 'user';
        if (nameParts.length > 0) {
            usernameBase = nameParts.length > 1 ? `${nameParts[0][0]}${nameParts[nameParts.length - 1]}` : nameParts[0];
        }
        let username = usernameBase;
        let counter = 2;
        while (users.some(u => u.username === username)) {
            username = `${usernameBase}${counter}`;
            counter++;
        }

        const newUser: AuthenticatedUser = { 
            name, 
            username, 
            role, 
            password,
            email, 
            age, 
            address, 
            phone, 
            ...(role === 'Familia' && { studentId, relationship }),
            ...(role === 'Docente' && { specialization, experience }),
            ...(role === 'Directivo' && { specificPosition }),
        };

        setUsers(prevUsers => [...prevUsers, newUser]);
        
        if (newUser.role === 'Docente' && assignedGrade) {
            handleAssignGradeToTeacher(newUser.name, assignedGrade);
        }
        
        return { username, password };
    }, [users, handleAssignGradeToTeacher]);
    
    const handleUpdateUser = useCallback((updatedUser: AuthenticatedUser) => {
        setUsers(prevUsers => prevUsers.map(u => u.username === updatedUser.username ? { ...u, ...updatedUser } : u));
    }, []);

    const handleDeleteUser = useCallback((username: string) => {
        const userToDelete = users.find(u => u.username === username);
        if (!userToDelete) return;

        if (userToDelete.role === 'Docente') {
            setStudents(prevStudents => 
                prevStudents.map(student => 
                    student.teacher === userToDelete.name ? { ...student, teacher: undefined } : student
                )
            );
        }
        
        setUsers(prevUsers => prevUsers.filter(u => u.username !== username));
    }, [users]);

    const handleAssignStrategyToStudent = useCallback((studentIds: string[], strategy: Strategy) => {
        if (!currentUser) return;
    
        const newProgressEntryBase = {
            date: new Date().toISOString().split('T')[0],
            area: 'Estrategia Asignada',
            observation: `Se asignó la estrategia: "${strategy.title}".`,
            author: currentUser.name,
            strategy: { title: strategy.title, description: strategy.description }
        };
    
        const updatedStudents = students.map(student => {
            if (studentIds.includes(student.id)) {
                const newProgressEntry: ProgressEntry = {
                    ...newProgressEntryBase,
                    id: `prog_strat_${Date.now()}_${student.id}`,
                };
                return { ...student, progressEntries: [newProgressEntry, ...student.progressEntries] };
            }
            return student;
        });
        
        setStudents(updatedStudents);
    
        if (selectedStudent && studentIds.includes(selectedStudent.id)) {
            const updatedSelectedStudent = updatedStudents.find(s => s.id === selectedStudent.id);
            if (updatedSelectedStudent) {
                setSelectedStudent(updatedSelectedStudent);
            }
        }
    }, [students, currentUser, selectedStudent]);

    const handleAssignStudentToTeacher = useCallback((studentId: string) => {
        const student = students.find(s => s.id === studentId);
        if (!student || !currentUser || currentUser.role !== 'Docente') return;
        const updatedStudent = { ...student, teacher: currentUser.name };
        updateStudentData(updatedStudent);
    }, [students, currentUser, updateStudentData]);
    
    const handleUnassignStudentToTeacher = useCallback((studentId: string) => {
        const student = students.find(s => s.id === studentId);
        if (!student || !currentUser || currentUser.role !== 'Docente' || student.teacher !== currentUser.name) return;
        const updatedStudent = { ...student, teacher: undefined };
        updateStudentData(updatedStudent);
    }, [students, currentUser, updateStudentData]);

    const handleRegisterStudent = useCallback((newStudentData: NewStudentData) => {
        if (!currentUser) return;
        const newStudent: Student = {
            id: `st_${Date.now()}`,
            photoUrl: `https://picsum.photos/seed/${newStudentData.name.split(' ').join('')}/200`,
            teacher: currentUser.role === 'Docente' ? currentUser.name : undefined,
            documents: [],
            progressEntries: [],
            ...newStudentData,
        };
        setStudents(prevStudents => [newStudent, ...prevStudents]);
    }, [currentUser]);
    
    const renderContent = () => {
        if (!currentUser) return null;

        if (currentUser.role === 'Jefe Maestro') {
            return <MasterAdminDashboard 
                students={students} 
                users={users} 
                onAssignGradeToTeacher={handleAssignGradeToTeacher} 
                onDeleteUser={handleDeleteUser} 
                onRegisterUser={handleRegisterUser} 
                onUpdateUser={handleUpdateUser}
                currentView={view}
                currentUser={currentUser}
            />;
        }

        if (selectedStudent) {
            if (currentUser.role === 'Familia') {
                 return <FamilyDashboard student={selectedStudent} onBack={handleBack} onUpdateStudent={updateStudentData}/>;
            }
            return <StudentProfile student={selectedStudent} onBack={handleBack} userRole={currentUser.role} onUpdateStudent={updateStudentData}/>;
        }
        
        if (currentUser.role === 'Directivo') {
            if (directorMode === 'admin') {
                return <AdminPanel 
                            students={students} 
                            users={users}
                            onAssignGradeToTeacher={handleAssignGradeToTeacher}
                            onDeleteUser={handleDeleteUser}
                            onRegisterUser={handleRegisterUser}
                        />;
            }

            switch (view) {
                case 'dashboard':
                     return <DirectorDashboard students={studentsForUser} onSelectStudent={handleSelectStudent} />;
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
                case 'assistant':
                     return <ChatInterface user={currentUser} students={studentsForUser} />;
                default:
                    return <DirectorDashboard students={studentsForUser} onSelectStudent={handleSelectStudent} />;
            }
        }

        switch (view) {
            case 'dashboard':
                 if (currentUser.role === 'Docente') return <Dashboard students={studentsForUser} onSelectStudent={handleSelectStudent} />;
                 if (currentUser.role === 'Familia') {
                    // The useEffect handles selecting the student. The `if(selectedStudent)`
                    // block at the top of `renderContent` will render the dashboard.
                    // Return a loading state or null while the effect runs.
                    return <div className="p-8 text-center text-slate-500">Cargando...</div>;
                 }
                 return null;
            case 'students':
                if (currentUser.role === 'Familia') return null;
                return <StudentList 
                    students={studentsForUser} 
                    allStudents={students}
                    onSelectStudent={handleSelectStudent} 
                    user={currentUser} 
                    onAssignStudent={handleAssignStudentToTeacher}
                    onUnassignStudent={handleUnassignStudentToTeacher}
                    onRegisterStudent={handleRegisterStudent}
                />;
            case 'assistant':
                return <ChatInterface user={currentUser} students={studentsForUser} />;
            case 'strategies':
                 if (currentUser.role === 'Familia') return null;
                return <StrategyBank students={studentsForUser} onAssignStrategy={handleAssignStrategyToStudent} />;
            default:
                return null;
        }
    };
    
    if (!currentUser) {
        return <LoginScreen onLogin={handleLogin} users={users} />;
    }

    const layoutProps = {
        user: currentUser,
        onLogout: handleLogout,
        setView,
        currentView: view,
        ...(currentUser.role === 'Directivo' && { directorMode, setDirectorMode })
    };

    return (
        <Layout {...layoutProps}>
            {renderContent()}
        </Layout>
    );
};

export default App;