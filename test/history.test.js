const request = require('supertest');
const express = require('express');
const createHistoryRouter = require('../server/history.js');

// --- Mock Setup ---
const mockConnection = {
    beginTransaction: jest.fn(),
    query: jest.fn(),
    commit: jest.fn(),
    rollback: jest.fn(),
    release: jest.fn()
};

const mockPool = {
    getConnection: jest.fn().mockResolvedValue(mockConnection),
    query: jest.fn()
};

const app = express();
app.use(express.json());
app.use('/api', createHistoryRouter(mockPool));

// ============================================================================
// SINGLE TEST SUITE: History Module
// ============================================================================
describe('History Module Unit Tests', () => {

    // Clear mocks before every test
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // --- Happy Path Tests ---

    // Test Case: TC-01
    // Technique: ISP (Input Space Partitioning)
    // Justification: Verifies the standard business logic predicates (Item exists -> Stock valid -> Update).
    it('TC-01: Should succeed on a valid "Use" action (Happy Path)', async () => {
        // 1. Select Item (Stock: 10)
        mockConnection.query.mockResolvedValueOnce([[{ 
            id: 1, name: 'Gauze Pads 4x4', category: 'Supplies', quantity: 10 
        }]]);
        // 2. Update Item
        mockConnection.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
        // 3. Insert History
        mockConnection.query.mockResolvedValueOnce([{ insertId: 100 }]);
        // 4. Low Stock Check (item quantity is not below min_quantity)
        mockConnection.query.mockResolvedValueOnce([[{ quantity: 5, min_quantity: 2, name: 'Gauze' }]]);

        const res = await request(app).post('/api/action/log').send({
            itemId: 101, action: 'Use', quantity: 5, user: 'Tester'
        });

        expect(res.statusCode).toBe(200);
        expect(res.body.newQuantity).toBe(5);
        expect(mockConnection.commit).toHaveBeenCalled();
    });

    // Test Case: TC-03
    // Technique: ISP (Input Space Partitioning)
    // Justification: Ensures the control flow graph traverses the specific "Check In" branch/edge (increasing quantity) instead of the default path.
    it('TC-03: Should succeed on a "Check In" action and increase quantity', async () => {
        // 1. Get item (Qty: 10)
        mockConnection.query.mockResolvedValueOnce([[{ id: 1, name: 'MED001', quantity: 10 }]]);
        // 2. Update query
        mockConnection.query.mockResolvedValueOnce([{}]);
        // 3. Insert history
        mockConnection.query.mockResolvedValueOnce([{}]);
        // 4. Low stock check
        mockConnection.query.mockResolvedValueOnce([[{ quantity: 11, min_quantity: 5 }]]); 

        const res = await request(app).post('/api/action/log').send({
            itemId: 102, action: 'Check In', quantity: 1, user: 'Tester'
        });

        expect(res.statusCode).toBe(200);
        const updateCall = mockConnection.query.mock.calls.find(call => call[0].startsWith('UPDATE'));
        expect(updateCall[1][0]).toBe(11); // 10 + 1 = 11
    });

    // Test Case: TC-04
    // Technique: ISP (Input Space Partitioning)
    // Justification: Tests the predicate logic `if (quantity <= min_quantity)` to ensure the alert triggers when the condition is true.
    it('TC-04: Should trigger a low stock notification', async () => {
        mockConnection.query.mockResolvedValueOnce([[{ id: 1, name: 'Bandages', quantity: 10 }]]);
        mockConnection.query.mockResolvedValueOnce([{}]);
        mockConnection.query.mockResolvedValueOnce([{}]);
        // Mock low stock: quantity becomes 2, which is <= min_quantity of 5
        mockConnection.query.mockResolvedValueOnce([[{ quantity: 2, min_quantity: 5, name: 'Bandages', location: 'B2', expiry_date: new Date() }]]);
        mockConnection.query.mockResolvedValueOnce([{}]); // For the notification insert

        await request(app).post('/api/action/log').send({ itemId: 103, action: 'Use', quantity: 8, user: 'Tester' });

        const notifInsert = mockConnection.query.mock.calls.find(call => call[0].includes('INSERT INTO notification_log'));
        expect(notifInsert).toBeDefined();
    });

    // Test Case: TC-02
    // Technique: ISP (Input Space Partitioning)
    // Justification: Tests the partition of "Invalid Inputs" where Quantity requested > Quantity available.
    it('TC-02: Should fail with 400 for insufficient stock', async () => {
        mockConnection.query.mockResolvedValueOnce([[{ 
            id: 1, name: 'Gauze Pads 4x4', category: 'Supplies', quantity: 10 
        }]]);

        const res = await request(app).post('/api/action/log').send({
            itemId: 101, action: 'Use', quantity: 30, user: 'Tester'
        });

        expect(res.statusCode).toBe(400);
        expect(mockConnection.rollback).toHaveBeenCalled();
        // The response body should contain the specific error
        expect(res.body.error).toBe('Insufficient stock. Available: 10, Requested: 30');
    });
    
    // Test Case: TC-05
    // Technique: ISP (Input Space Partitioning)
    // Justification: Tests the partition of "Non-existent Items" (IDs that do not map to the database).
    it('TC-05: Should fail with 500 if item ID is not found', async () => {
        mockConnection.query.mockResolvedValueOnce([[]]); 

        const res = await request(app).post('/api/action/log').send({
            itemId: 999, action: 'Use', quantity: 1
        });

        expect(res.statusCode).toBe(404);
        expect(mockConnection.rollback).toHaveBeenCalled();
    });

    // Test Case: TC-06
    // Technique: ISP (Input Space Partitioning)
    // Justification: Ensures the execution path traverses the `catch` block (Exception handling path) in the control flow graph for generic errors.
    it('TC-06: Should fail with 500 on a generic database error', async () => {
        // Mute console.error for this test to keep the output clean
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        mockConnection.query.mockRejectedValue(new Error('DB connection lost'));

        const res = await request(app).post('/api/action/log').send({
            itemId: 101, action: 'Use', quantity: 1
        });

        expect(res.statusCode).toBe(500);
        expect(res.body.error).toBe('Failed to complete inventory transaction.');
        expect(mockConnection.rollback).toHaveBeenCalled();
        
        consoleErrorSpy.mockRestore(); // Restore console.error
    });

    // Test Case: TC-07
    // Technique: ISP (Input Space Partitioning)
    // Justification: Tests the partition of inputs involving "Optional Query Parameters" (Filter by Action, Category, and Sort).
    it('TC-07: Should correctly filter and sort history records', async () => {
        mockPool.query.mockResolvedValueOnce([[]]);

        await request(app).get('/api/history?sort=date&action=Transfer&category=Supplies&caseId=C12345');
        
        const sqlQuery = mockPool.query.mock.calls[0][0];
        const params = mockPool.query.mock.calls[0][1];

        expect(sqlQuery).toMatch(/WHERE 1=1/);
        expect(sqlQuery).toMatch(/AND case_id = \?/);
        expect(sqlQuery).toMatch(/AND action = \?/);
        expect(params).toEqual(['C12345', 'Transfer', 'Supplies']);
    });
});