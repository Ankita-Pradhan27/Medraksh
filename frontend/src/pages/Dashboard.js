import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const [medicines, setMedicines] = useState([]);
    const [form, setForm] = useState({ name: '', dosage: '', time: '', prescriptionImage: null });
    const navigate = useNavigate();

    // Helper: Check if medicine was taken TODAY
    const isTakenToday = (dateString) => {
        if (!dateString) return false;
        const takenDate = new Date(dateString);
        const today = new Date();
        return takenDate.toDateString() === today.toDateString();
    };

    // 1. Fetch Medicines (Wrapped in useCallback to fix warning)
    const fetchMedicines = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) return navigate('/login');
        try {
            const res = await axios.get('http://localhost:5000/api/medicines', { 
                headers: { 'x-auth-token': token } 
            });
            setMedicines(res.data);
        } catch (err) { console.log(err); }
    }, [navigate]);

    // 2. Mark as Taken Function (Wrapped in useCallback to fix warning)
    const markAsTaken = useCallback(async (id) => {
        const token = localStorage.getItem('token');
        try {
            await axios.put(`http://localhost:5000/api/medicines/${id}/taken`, {}, {
                headers: { 'x-auth-token': token }
            });
            alert("Great job! Medicine marked as taken.");
            fetchMedicines(); 
        } catch (err) {
            alert("Error updating status");
        }
    }, [fetchMedicines]);

    // Initial Fetch
    useEffect(() => { fetchMedicines(); }, [fetchMedicines]);

    // 3. The Alarm Clock ⏰
    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            const currentTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

            medicines.forEach(med => {
                if (med.time === currentTime && !isTakenToday(med.lastTaken)) {
                    const userDidTake = window.confirm(`🔔 REMINDER: Time to take ${med.name}!\n\nDid you take it?`);
                    if (userDidTake) {
                        markAsTaken(med._id);
                    }
                }
            });
        }, 12000); 
        return () => clearInterval(interval);
    }, [medicines, markAsTaken]); // Added markAsTaken to dependency array

    // 4. Add Medicine Form
    const addMedicine = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('name', form.name);
        formData.append('dosage', form.dosage);
        formData.append('time', form.time);
        if (form.prescriptionImage) formData.append('prescriptionImage', form.prescriptionImage);

        try {
            await axios.post('http://localhost:5000/api/medicines', formData, {
                headers: { 'x-auth-token': token, 'Content-Type': 'multipart/form-data' }
            });
            window.location.reload();
        } catch (err) { alert('Error adding medicine'); }
    };

    return (
        <div className="container">
            <h2>My Medicines</h2>
            {medicines.map(med => (
                <div key={med._id} className="card" style={{ 
                    borderLeft: isTakenToday(med.lastTaken) ? '5px solid green' : '5px solid orange' 
                }}>
                    <div>
                        <strong>{med.name}</strong> ({med.dosage})<br/>
                        <span>⏰ {med.time}</span>
                        <br/>
                        {isTakenToday(med.lastTaken) ? (
                            <span style={{color: 'green', fontWeight: 'bold'}}>✅ Taken Today</span>
                        ) : (
                            <span style={{color: 'orange'}}>⏳ Pending</span>
                        )}
                    </div>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                        {!isTakenToday(med.lastTaken) && (
                            <button onClick={() => markAsTaken(med._id)} style={{background: '#007bff', fontSize: '12px'}}>
                                Mark Taken
                            </button>
                        )}
                        {med.prescriptionImage && (
                            <a href={`http://localhost:5000/${med.prescriptionImage}`} target="_blank" rel="noopener noreferrer">
                                <img src={`http://localhost:5000/${med.prescriptionImage}`} alt="p" className="preview"/>
                            </a>
                        )}
                    </div>
                </div>
            ))}
            <hr />
            <h3>Add New Medicine</h3>
            <form onSubmit={addMedicine}>
                <input placeholder="Name" onChange={(e) => setForm({...form, name: e.target.value})} required />
                <input placeholder="Dosage" onChange={(e) => setForm({...form, dosage: e.target.value})} required />
                <input placeholder="Time (e.g. 09:15 PM)" onChange={(e) => setForm({...form, time: e.target.value})} required />
                <input type="file" onChange={(e) => setForm({...form, prescriptionImage: e.target.files[0]})} />
                <button type="submit">Add Reminder</button>
            </form>
        </div>
    );
};

export default Dashboard;