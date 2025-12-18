import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AdherenceChart from '../components/AdherenceChart';

const Dashboard = () => {
    const [medicines, setMedicines] = useState([]);
    // Initial time is now empty string, browser handles the time input
    const [form, setForm] = useState({ name: '', dosage: '', time: '', prescriptionImage: null });
    const navigate = useNavigate();

    const isTakenToday = (dateString) => {
        if (!dateString) return false;
        return new Date(dateString).toDateString() === new Date().toDateString();
    };

    const fetchMedicines = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) return navigate('/login');
        try {
            const res = await axios.get('http://localhost:5000/api/medicines', { headers: { 'x-auth-token': token } });
            setMedicines(res.data);
        } catch (err) { console.log(err); }
    }, [navigate]);

    // 🛠️ UPDATED MARK TAKEN FUNCTION
    const markAsTaken = useCallback(async (id) => {
        const token = localStorage.getItem('token');
        try {
            await axios.put(`http://localhost:5000/api/medicines/${id}/taken`, {}, { headers: { 'x-auth-token': token } });
            
            // Force refresh data
            await fetchMedicines(); 
            alert("✅ Medicine marked as taken!");
        } catch (err) { 
            console.error(err);
            alert("❌ Error: Could not mark as taken. Check your connection."); 
        }
    }, [fetchMedicines]);

    // Delete Function
    const deleteMedicine = async (id) => {
        if (!window.confirm("Are you sure you want to delete this medicine?")) return;
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`http://localhost:5000/api/medicines/${id}`, {
                headers: { 'x-auth-token': token }
            });
            fetchMedicines();
        } catch (err) {
            alert("Error deleting medicine");
        }
    };

    useEffect(() => { fetchMedicines(); }, [fetchMedicines]);

    // ⏰ UPDATED ALARM LOGIC (24-Hour Format)
    useEffect(() => {
        const interval = setInterval(() => {
            // Use 'en-GB' for 24-hour time matching backend (e.g., "14:30")
            const currentTime = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
            
            medicines.forEach(med => {
                // Compare times. Note: Old medicines saved as "02:00 PM" won't match "14:00".
                // You might need to delete and re-add them.
                if (med.time === currentTime && !isTakenToday(med.lastTaken)) {
                    if (window.confirm(`🔔 Time to take ${med.name}!\nDid you take it?`)) markAsTaken(med._id);
                }
            });
        }, 12000); // Check every 12 seconds
        return () => clearInterval(interval);
    }, [medicines, markAsTaken]);

    const addMedicine = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('name', form.name);
        formData.append('dosage', form.dosage);
        formData.append('time', form.time); // This will now send "14:30" format
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
            <h2 className="section-title">Your Daily Medicines</h2>
            
            <div style={{ marginBottom: '30px', maxWidth: '800px', margin: '0 auto 30px auto' }}>
                <AdherenceChart medicines={medicines} />
            </div>

            <div className="grid-container">
                {medicines.map(med => (
                    <div key={med._id} className={`card ${isTakenToday(med.lastTaken) ? 'taken' : 'pending'}`}>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start'}}>
                            <div>
                                <h3 style={{margin: 0, color: '#333'}}>{med.name}</h3>
                                <p style={{color: '#666', fontSize: '0.9rem'}}>{med.dosage}</p>
                            </div>
                            {/* Display Time */}
                            <span style={{fontWeight: 'bold', color: '#0061f2'}}>⏰ {med.time}</span>
                        </div>

                        {med.prescriptionImage && (
                             <a href={`http://localhost:5000/${med.prescriptionImage}`} target="_blank" rel="noopener noreferrer">
                                <img src={`http://localhost:5000/${med.prescriptionImage}`} alt="Prescription" className="preview"/>
                            </a>
                        )}

                        <div style={{marginTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                            {isTakenToday(med.lastTaken) ? (
                                <span className="status-badge status-success">✅ Taken Today</span>
                            ) : (
                                <span className="status-badge status-warning">⏳ Pending</span>
                            )}
                            
                            {!isTakenToday(med.lastTaken) && (
                                <button onClick={() => markAsTaken(med._id)} style={{width: 'auto', padding: '5px 15px', fontSize: '0.8rem', marginTop: 0}}>
                                    Mark Taken
                                </button>
                            )}
                        </div>

                        <button 
                            onClick={() => deleteMedicine(med._id)} 
                            style={{ background: '#dc3545', marginTop: '15px', fontSize: '0.8rem', padding: '8px' }}
                        >
                            Delete Medicine
                        </button>
                    </div>
                ))}
            </div>

            {/* Form Section */}
            <div className="form-box" style={{margin: '30px auto', maxWidth: '600px'}}>
                <h3>➕ Add New Reminder</h3>
                <form onSubmit={addMedicine} style={{textAlign: 'left'}}>
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'}}>
                        <input placeholder="Medicine Name" onChange={(e) => setForm({...form, name: e.target.value})} />
                        <input placeholder="Dosage" onChange={(e) => setForm({...form, dosage: e.target.value})} />
                    </div>
                    
                    {/* 👇 CHANGED TO TIMER MENU */}
                    <label style={{marginTop: '10px', display: 'block', fontWeight: 'bold'}}>Select Time:</label>
                    <input 
                        type="time" 
                        onChange={(e) => setForm({...form, time: e.target.value})} 
                        required 
                        style={{width: '100%', padding: '10px', margin: '5px 0 15px 0'}}
                    />
                    
                    <label style={{fontWeight: 'bold', fontSize: '0.9rem', display: 'block'}}>Upload Prescription (Optional):</label>
                    <input type="file" onChange={(e) => setForm({...form, prescriptionImage: e.target.files[0]})} style={{background: 'white'}}/>
                    <button type="submit">Save Reminder</button>
                </form>
            </div>
        </div>
    );
};

export default Dashboard;