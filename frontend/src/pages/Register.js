import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/auth/register', formData);
            alert('Registration Successful! You can now login.');
            navigate('/login');
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.msg || 'Error registering user');
        }
    };

    return (
        <div className="container">
            <div className="form-box">
                <h2>Create Account</h2>
                <p style={{marginBottom: '20px', color: '#666'}}>Join Medraksh to start tracking your health</p>

                <form onSubmit={handleSubmit}>
                    <input 
                        type="text" 
                        placeholder="Full Name" 
                        onChange={(e) => setFormData({...formData, username: e.target.value})} 
                        required 
                    />
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
                    <button type="submit">Sign Up</button>
                </form>

                <p style={{marginTop: '15px', fontSize: '0.9rem'}}>
                    Already have an account? <Link to="/login" style={{color: '#0061f2', fontWeight: 'bold'}}>Login here</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;