
import React, { useState } from 'react';
import LoginScreen from './LoginScreen';
import RegisterScreen from './RegisterScreen';

const Auth: React.FC = () => {
    const [isLoginView, setIsLoginView] = useState(true);

    if (isLoginView) {
        return <LoginScreen onSwitchToRegister={() => setIsLoginView(false)} />;
    } else {
        return <RegisterScreen onSwitchToLogin={() => setIsLoginView(true)} />;
    }
};

export default Auth;
