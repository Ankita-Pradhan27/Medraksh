import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AdherenceChart = ({ medicines }) => {
    // Calculate Stats
    const total = medicines.length;
    const takenToday = medicines.filter(med => {
        if (!med.lastTaken) return false;
        return new Date(med.lastTaken).toDateString() === new Date().toDateString();
    }).length;
    const pending = total - takenToday;

    const data = [
        { name: 'Taken', value: takenToday },
        { name: 'Pending', value: pending },
    ];

    const COLORS = ['#00C49F', '#FF8042']; // Green for taken, Orange for pending

    if (total === 0) return <p>No medicines to track yet.</p>;

    return (
        <div style={{ width: '100%', height: 300, background: '#fff', borderRadius: '10px', padding: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <h3 style={{textAlign: 'center', marginBottom: '10px'}}>Daily Adherence</h3>
            <ResponsiveContainer>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default AdherenceChart;