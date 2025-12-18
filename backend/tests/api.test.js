const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');
const Medicine = require('../models/Medicine');

// Define a test user
const testUser = {
    username: 'Test User',  // <--- FIXED: Changed from 'name' to 'username'
    email: `test${Date.now()}@example.com`,
    password: 'password123'
};

let token = '';

afterAll(async () => {
    // Cleanup: Delete the test user and their medicines
    const user = await User.findOne({ email: testUser.email });
    if (user) {
        await Medicine.deleteMany({ user: user._id });
        await User.findByIdAndDelete(user._id);
    }
    await mongoose.connection.close();
});

describe('Medraksh API Integration Tests', () => {

    // 1. Test Registration
    it('POST /api/auth/register - Should register a new user', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send(testUser);
        
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('token');
    });

    // 2. Test Login
    it('POST /api/auth/login - Should login and return token', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: testUser.email,
                password: testUser.password
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('token');
        token = res.body.token; 
    });

    // 3. Test Add Medicine (Protected Route)
    it('POST /api/medicines - Should add a medicine', async () => {
        const res = await request(app)
            .post('/api/medicines')
            .set('x-auth-token', token)
            .send({
                name: 'Test Aspirin',
                dosage: '500mg',
                time: '08:00 AM'
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('name', 'Test Aspirin');
    });

    // 4. Test Get Medicines
    it('GET /api/medicines - Should fetch user medicines', async () => {
        const res = await request(app)
            .get('/api/medicines')
            .set('x-auth-token', token);

        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
        expect(res.body.length).toBeGreaterThan(0);
    });
});