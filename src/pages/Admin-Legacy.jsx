import React, { useState } from 'react';

const Admin = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState('');
    const [passcode, setPasscode] = useState('');
    const [error, setError] = useState(false);

    const handleLogin = () => {
        // Simple mock login logic
        if (username === 'admin' && passcode === '1234') {
            setIsLoggedIn(true);
            setError(false);
        } else {
            setError(true);
        }
    };

    if (!isLoggedIn) {
        return (
            <div className="admin-body">
                <div className="container" id="login-container">
                    <h2>Admin Login</h2>
                    <input 
                        type="text" 
                        placeholder="Username" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="admin-input"
                    />
                    <input 
                        type="password" 
                        placeholder="Passcode" 
                        value={passcode}
                        onChange={(e) => setPasscode(e.target.value)}
                        className="admin-input"
                    />
                    <button className="btn" onClick={handleLogin}>Sign In</button>
                    {error && <p className="error-msg" style={{ display: 'block' }}>Invalid credentials. Try again.</p>}
                </div>
            </div>
        );
    }

    return (
        <div className="admin-body">
            <div className="container" id="dashboard">
                <h2 style={{ marginBottom: '25px' }}>Welcome back</h2>
                <button className="btn dash-btn" onClick={() => alert('Opening Products...')}>
                    Product & price listing
                </button>
                <button className="btn dash-btn" onClick={() => alert('Tracking Orders...')}>
                    Track order
                </button>
                <button className="btn logout-btn" onClick={() => setIsLoggedIn(false)}>
                    Sign out
                </button>
            </div>
        </div>
    );
};

export default Admin;
