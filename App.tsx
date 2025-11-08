import React, { useState, useMemo, useCallback } from 'react';
import type { Student, AuthenticatedUser } from './types';
import { MOCK_STUDENTS } from './services/mockData';
import Layout from './components/Layout';
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/Dashboard';
import StudentList from './components/StudentList';
import StudentProfile from './components/StudentProfile';
import DirectorDashboard from './components/DirectorDashboard';
import FamilyDashboard from './components/FamilyDashboard';
import ChatInterface from './components/ChatInterface';
import StrategyBank from './components/StrategyBank';

const App: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<AuthenticatedUser | null>(null);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [view, setView] = useState<'dashboard' | 'students' | 'assistant' | 'strategies'>('dashboard');

    // Mute student state for updates
    const [students, setStudents] = useState<Student[]>(MOCK_STUDENTS);

    const handleLogin = (user: AuthenticatedUser) => {
        setCurrentUser(user);
        setView('dashboard');
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
        setView('dashboard'); // Go back to dashboard after leaving a profile
    };

    const updateStudentData = useCallback((updatedStudent: Student) => {
        setStudents(prevStudents => prevStudents.map(s => s.id === updatedStudent.id ? updatedStudent : s));
        if (selectedStudent && selectedStudent.id === updatedStudent.id) {
            setSelectedStudent(updatedStudent);
        }
    }, [selectedStudent]);
    
    const studentsForUser = useMemo(() => {
        if (!currentUser) return [];

        switch (currentUser.role) {
            case 'Docente':
                return students.filter(s => s.teacher === currentUser.name);
            case 'Directivo':
                return students;
            case 'Familia':
                return students.filter(s => s.id === currentUser.studentId);
            default:
                return [];
        }
    }, [currentUser, students]);

    const renderContent = () => {
        if (!currentUser) return null;

        if (selectedStudent) {
            // Family role gets a different profile view.
            if (currentUser.role === 'Familia') {
                 return <FamilyDashboard student={selectedStudent} onBack={handleBack} onUpdateStudent={updateStudentData}/>;
            }
            return <StudentProfile student={selectedStudent} onBack={handleBack} userRole={currentUser.role} onUpdateStudent={updateStudentData}/>;
        }
        
        switch (view) {
            case 'dashboard':
                 if (currentUser.role === 'Docente') return <Dashboard students={studentsForUser} onSelectStudent={handleSelectStudent} />;
                 if (currentUser.role === 'Directivo') return <DirectorDashboard students={studentsForUser} onSelectStudent={handleSelectStudent} />;
                 // The family view is simplified: it always shows their student's dashboard.
                 if (currentUser.role === 'Familia' && studentsForUser.length > 0) {
                     // When family logs in, select their student automatically
                     if (!selectedStudent) {
                        setSelectedStudent(studentsForUser[0]);
                     }
                     return <FamilyDashboard student={studentsForUser[0]} onBack={handleBack} onUpdateStudent={updateStudentData}/>;
                 }
                 return null;
            case 'students':
                if (currentUser.role === 'Familia') return null; // No student list for family role.
                return <StudentList students={studentsForUser} onSelectStudent={handleSelectStudent} userRole={currentUser.role} />;
            case 'assistant':
                return <ChatInterface user={currentUser} students={studentsForUser} />;
            case 'strategies':
                return <StrategyBank />;
            default:
                return null;
        }
    };
    
    if (!currentUser) {
        return <LoginScreen onLogin={handleLogin} />;
    }

    return (
        <Layout user={currentUser} onLogout={handleLogout} setView={setView} currentView={view}>
            {renderContent()}
        </Layout>
    );
};

export default App;
