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
describe('History Module - Base Choice Coverage (BCC) Tests', () => {

    // Clear mocks before every test
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // --- Base Case ---
    it('BCC-01 (Base Case): Should succeed with all base choices', async () => {
        // Setup: Item exists with quantity 10, min_quantity is 2.
        mockConnection.query.mockResolvedValueOnce([[{ 
            id: 1, name: 'Gauze Pads 4x4', category: 'Supplies', quantity: 10 
        }]]);
        mockConnection.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
        mockConnection.query.mockResolvedValueOnce([{ insertId: 100 }]);
        // Post-action check: new quantity (5) > min_quantity (2), so no alert.
        mockConnection.query.mockResolvedValueOnce([[{ quantity: 5, min_quantity: 2 }]]);

        const res = await request(app).post('/api/action/log').send({
            itemId: 'ITM001', action: 'Use', quantity: 5, user: 'Tester', caseId: 'C123'
        });

        // Assertions
        expect(res.statusCode).toBe(200);
        expect(res.body.newQuantity).toBe(5);
        expect(mockConnection.commit).toHaveBeenCalled();
        const historyInsert = mockConnection.query.mock.calls.find(call => call[0].includes('INSERT INTO inventory_history'));
        expect(historyInsert[1]).toContain('C123'); // Verify provided caseId was used
        expect(historyInsert[1]).toContain('Tester'); // Verify provided user was used
    });

    // --- Non-Base Choices ---

    // F1 (Action) -> "Check In"
    it('BCC-02 (F1 Non-Base): Should succeed for "Check In" action', async () => {
        // Setup: Item exists with quantity 10.
        mockConnection.query.mockResolvedValueOnce([[{ id: 1, name: 'MED001', quantity: 10 }]]);
        mockConnection.query.mockResolvedValueOnce([{}]); // Update
        mockConnection.query.mockResolvedValueOnce([{}]); // History
        mockConnection.query.mockResolvedValueOnce([[{ quantity: 11, min_quantity: 5 }]]); 

        const res = await request(app).post('/api/action/log').send({
            itemId: 'MED001', action: 'Check In', quantity: 1, user: 'Tester', caseId: 'C123'
        });

        // Assertions
        expect(res.statusCode).toBe(200);
        const updateCall = mockConnection.query.mock.calls.find(call => call[0].startsWith('UPDATE'));
        expect(updateCall[1][0]).toBe(11); // Verify quantity was increased
    });

    // F1 (Action) -> "Other" (e.g., "Audit")
    it('BCC-03 (F1 Non-Base): Should log an "Other" action without changing quantity', async () => {
        // Setup: Item exists with quantity 10.
        mockConnection.query.mockResolvedValueOnce([[{ id: 1, name: 'Audit Item', quantity: 10 }]]);
        mockConnection.query.mockResolvedValueOnce([{}]); // Update (sets last_scanned)
        mockConnection.query.mockResolvedValueOnce([{}]); // History
        mockConnection.query.mockResolvedValueOnce([[{ quantity: 10, min_quantity: 5 }]]);

        const res = await request(app).post('/api/action/log').send({
            itemId: 'AUD001', action: 'Audit', quantity: 1, user: 'Tester', caseId: 'C123'
        });

        // Assertions
        expect(res.statusCode).toBe(200);
        const updateCall = mockConnection.query.mock.calls.find(call => call[0].startsWith('UPDATE'));
        expect(updateCall[1][0]).toBe(10); // Verify quantity remains unchanged
    });

    // F2 (Item Existence) -> Not Found
    it('BCC-04 (F2 Non-Base): Should fail with 404 if item ID is not found', async () => {
        // Setup: Item query returns an empty array.
        mockConnection.query.mockResolvedValueOnce([[]]); 

        const res = await request(app).post('/api/action/log').send({
            itemId: 'NON999', action: 'Use', quantity: 1
        });

        // Assertions
        expect(res.statusCode).toBe(404);
        expect(res.body.error).toContain('Item ID NON999 not found');
        expect(mockConnection.rollback).toHaveBeenCalled();
    });

    // F3 (Quantity) -> Insufficient Stock
    it('BCC-05 (F3 Non-Base): Should fail with 400 for insufficient stock', async () => {
        // Setup: Item exists with quantity 10.
        mockConnection.query.mockResolvedValueOnce([[{ 
            id: 1, name: 'Gauze Pads 4x4', quantity: 10 
        }]]);

        const res = await request(app).post('/api/action/log').send({
            itemId: 'ITM001', action: 'Use', quantity: 30, user: 'Tester'
        });

        // Assertions
        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe('Insufficient stock. Available: 10, Requested: 30');
        expect(mockConnection.rollback).toHaveBeenCalled();
    });

    // F3 (Quantity) -> Zero / Non-Numeric
    it('BCC-06 (F3 Non-Base): Should handle zero or non-numeric quantity', async () => {
        // Setup: Item exists with quantity 10.
        mockConnection.query.mockResolvedValueOnce([[{ id: 1, name: 'Zero Qty Item', quantity: 10 }]]);
        mockConnection.query.mockResolvedValueOnce([{}]); // Update
        mockConnection.query.mockResolvedValueOnce([{}]); // History
        mockConnection.query.mockResolvedValueOnce([[{ quantity: 10, min_quantity: 5 }]]);

        const res = await request(app).post('/api/action/log').send({
            itemId: 'ZERO01', action: 'Use', quantity: 'invalid', user: 'Tester', caseId: 'C123'
        });

        // Assertions
        expect(res.statusCode).toBe(200);
        expect(res.body.newQuantity).toBe(10); // Quantity remains 10 (10 - 0)
        const historyInsert = mockConnection.query.mock.calls.find(call => call[0].includes('INSERT INTO inventory_history'));
        expect(historyInsert[1][4]).toBe(0); // Verify history logged a quantity of 0
    });

    // F4 (Low Stock) -> Alert Triggered
    it('BCC-07 (F4 Non-Base): Should trigger a low stock notification', async () => {
        // Setup: Item exists with quantity 10.
        mockConnection.query.mockResolvedValueOnce([[{ id: 1, name: 'Bandages', quantity: 10 }]]);
        mockConnection.query.mockResolvedValueOnce([{}]); // Update
        mockConnection.query.mockResolvedValueOnce([{}]); // History
        // Post-action check: new quantity (2) <= min_quantity (5), so alert.
        mockConnection.query.mockResolvedValueOnce([[{ quantity: 2, min_quantity: 5, name: 'Bandages', location: 'B2', expiry_date: new Date() }]]);
        mockConnection.query.mockResolvedValueOnce([{}]); // Notification insert

        const res = await request(app).post('/api/action/log').send({ 
            itemId: 'BND001', action: 'Use', quantity: 8, user: 'Tester', caseId: 'C123' 
        });

        // Assertions
        expect(res.statusCode).toBe(200);
        const notifInsert = mockConnection.query.mock.calls.find(call => call[0].includes('INSERT INTO notification_log'));
        expect(notifInsert).toBeDefined();
        expect(mockConnection.commit).toHaveBeenCalled();
    });

    // F5 (DB Behavior) -> DB Error
    it('BCC-08 (F5 Non-Base): Should fail with 500 on a generic database error', async () => {
        // Mute console.error for this test to keep the output clean
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        // Setup: The first query fails.
        mockConnection.query.mockRejectedValue(new Error('DB connection lost'));

        const res = await request(app).post('/api/action/log').send({
            itemId: 'ITM001', action: 'Use', quantity: 1
        });

        // Assertions
        expect(res.statusCode).toBe(500);
        expect(res.body.error).toBe('Failed to complete inventory transaction.');
        expect(mockConnection.rollback).toHaveBeenCalled();
        
        consoleErrorSpy.mockRestore(); // Restore console.error
    });

    // F6 (Default Values) -> Not Provided
    it('BCC-09 (F6 Non-Base): Should use default values for caseId and user', async () => {
        // Setup: Same as base case, but no user/caseId in payload.
        mockConnection.query.mockResolvedValueOnce([[{ id: 1, name: 'Default Item', quantity: 10 }]]);
        mockConnection.query.mockResolvedValueOnce([{}]);
        mockConnection.query.mockResolvedValueOnce([{}]);
        mockConnection.query.mockResolvedValueOnce([[{ quantity: 9, min_quantity: 2 }]]);

        const res = await request(app).post('/api/action/log').send({
            itemId: 'DEF001', action: 'Use', quantity: 1
        });

        // Assertions
        expect(res.statusCode).toBe(200);
        const historyInsert = mockConnection.query.mock.calls.find(call => call[0].includes('INSERT INTO inventory_history'));
        expect(historyInsert[1][5]).toMatch(/^C\d{5}$/); // Verify default caseId format (e.g., C12345)
        expect(historyInsert[1][6]).toBe('Current User'); // Verify default user
    });
});