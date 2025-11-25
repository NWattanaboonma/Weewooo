const request = require('supertest');
const express = require('express');
const createHistoryRouter = require('../server/history.js');

// --- Mock Setup ---
const mockConnection = {
    beginTransaction: jest.fn(),
    query: jest.fn(),
    commit: jest.fn(),
    rollback: jest.fn(),
    release: jest.fn(),
};

const mockPool = {
    getConnection: jest.fn().mockResolvedValue(mockConnection),
    query: jest.fn() // Used for direct pool queries (GET requests)
};

// Setup Express app with dependency injection
const app = express();
app.use(express.json());
app.use('/api', createHistoryRouter(mockPool));

describe('Unit Testing Project: History Module', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // SECTION: Transaction & Inventory Logic (POST /action/log)
    it('TC-01: Should successfully log "Use" action and update inventory', async () => {
        // 1. Select Item (Stock exists)
        mockConnection.query.mockResolvedValueOnce([[{ 
            id: 1, name: 'Gauze', category: 'Supplies', quantity: 10 
        }]]);
        // 2. Update Item
        mockConnection.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
        // 3. Insert History
        mockConnection.query.mockResolvedValueOnce([{ insertId: 100 }]);
        // 4. Check Low Stock (No alert needed)
        mockConnection.query.mockResolvedValueOnce([[{ 
            quantity: 9, min_quantity: 2, name: 'Gauze', location: 'A1'
        }]]);

        const res = await request(app).post('/api/action/log').send({
            itemId: 101, action: 'Use', quantity: 1, user: 'Tester'
        });

        expect(res.statusCode).toBe(200);
        expect(mockConnection.commit).toHaveBeenCalled();
        expect(mockConnection.query).toHaveBeenCalledTimes(4);
    });

    it('TC-02: Should correctly increase quantity on "Check In"', async () => {
        // 1. Get item (Current Qty: 10)
        mockConnection.query.mockResolvedValueOnce([[{ id: 1, name: 'Saline', quantity: 10 }]]);
        // 2. Update query
        mockConnection.query.mockResolvedValueOnce([{}]);
        // 3. Insert history
        mockConnection.query.mockResolvedValueOnce([{}]);
        // 4. Low stock check
        mockConnection.query.mockResolvedValueOnce([[{ quantity: 15, min_quantity: 5 }]]);

        const res = await request(app).post('/api/action/log').send({
            itemId: 102, action: 'Check In', quantity: 5, user: 'Tester'
        });

        expect(res.statusCode).toBe(200);
        
        // Verify logic: 10 + 5 = 15. The second query (UPDATE) should contain 15.
        const updateCall = mockConnection.query.mock.calls.find(call => call[0].startsWith('UPDATE'));
        expect(updateCall[1][0]).toBe(15); 
    });

    it('TC-03: Should trigger Low Stock Notification when quantity drops below min', async () => {
        // 1. Select Item
        mockConnection.query.mockResolvedValueOnce([[{ id: 1, name: 'Gauze', quantity: 10 }]]);
        // 2. Update & 3. Insert History
        mockConnection.query.mockResolvedValueOnce({}).mockResolvedValueOnce({});
        
        // 4. Check Low Stock (Remaining: 1, Min: 5 -> Trigger Alert)
        mockConnection.query.mockResolvedValueOnce([[{ 
            quantity: 1, min_quantity: 5, name: 'Gauze', location: 'A1' 
        }]]);

        // 5. Insert Notification
        mockConnection.query.mockResolvedValueOnce({});

        const res = await request(app).post('/api/action/log').send({
            itemId: 101, action: 'Use', quantity: 9, user: 'Tester'
        });

        expect(res.statusCode).toBe(200);
        
        const allCalls = mockConnection.query.mock.calls;
        const notificationCall = allCalls.find(call => call[0].includes('INSERT INTO notification_log'));
        expect(notificationCall).toBeDefined();
    });

    it('TC-04: Should return 500 and rollback if item not found', async () => {
        // 1. Select Item returns empty array (Not Found)
        mockConnection.query.mockResolvedValueOnce([[]]); 

        const res = await request(app).post('/api/action/log').send({
            itemId: 999, action: 'Use', quantity: 1
        });

        expect(res.statusCode).toBe(500);
        expect(mockConnection.rollback).toHaveBeenCalled();
        expect(mockConnection.commit).not.toHaveBeenCalled();
    });

    it('TC-05: Should rollback transaction on DB failure', async () => {
        mockConnection.query.mockRejectedValue(new Error('DB Connection Failed'));

        const res = await request(app).post('/api/action/log').send({
            itemId: 101, action: 'Use', quantity: 1
        });

        expect(res.statusCode).toBe(500);
        expect(mockConnection.rollback).toHaveBeenCalled();
    });

    // SECTION: History Retrieval Logic (GET /history)
    it('TC-06: Should return history list with correct data structure', async () => {
        mockPool.query.mockResolvedValueOnce([[{
            id: 1, itemName: 'Gauze', action: 'Use', date: new Date()
        }]]);

        const res = await request(app).get('/api/history');
        expect(res.statusCode).toBe(200);
        expect(res.body[0].itemName).toBe('Gauze');
    });

    it('TC-07: Should filter history by caseId', async () => {
        mockPool.query.mockResolvedValueOnce([[]]); 
        
        const res = await request(app).get('/api/history?caseId=C12345');
        
        expect(res.statusCode).toBe(200);
        expect(mockPool.query.mock.calls[0][0]).toContain('WHERE case_id = ?');
    });

    it('TC-08: Should format history with null date as N/A', async () => {
        const mockHistoryWithNullDate = [{
            id: 2, itemName: 'Bandage', action: 'Use', date: null
        }];
        mockPool.query.mockResolvedValueOnce([mockHistoryWithNullDate]);

        const res = await request(app).get('/api/history');

        expect(res.statusCode).toBe(200);
        expect(res.body[0].date).toBe('N/A');
    });
});