import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Send login request to backend
            const res = await axios.post('http://localhost:5000/api/auth/login', formData);
            
            // Save the token to local storage
            localStorage.setItem('token', res.data.token);
            
            // Redirect to Dashboard
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.msg || 'Invalid Credentials');
        }
    };

    return (
        <div className="container">
            <div className="form-box">
                <h2>Welcome Back</h2>
                <p style={{marginBottom: '20px', color: '#666'}}>Please login to manage your medicines</p>
                
                <form onSubmit={handleSubmit}>
                    <input 
                        type="email" 
                        placeholder="Email Address" 
                        onChange={(e) => setFormData({...formData, email: e.target.value})} 
                        required 
                    />
                    <input 
                        type="password" 
                        placeholder="Password" 
                        onChange={(e) => setFormData({...formData, password: e.target.value})} 
                        required 
                    />
                    <button type="submit">Login to Dashboard</button>
                </form>

                <p style={{marginTop: '15px', fontSize: '0.9rem'}}>
                    Don't have an account? <Link to="/register" style={{color: '#0061f2', fontWeight: 'bold'}}>Register here</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;