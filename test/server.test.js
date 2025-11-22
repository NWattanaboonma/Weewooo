const request = require('supertest'); // ใช้ยิง HTTP request เพื่อทดสอบ API
const { app, pool } = require('../server/server');

jest.mock('mysql2/promise', () => ({
  createPool: () => ({
    query: jest.fn(),
    getConnection: jest.fn(() => ({
      query: jest.fn(),
      beginTransaction: jest.fn(),
      commit: jest.fn(),
      rollback: jest.fn(),
      release: jest.fn(),
    })),
  }),
}));

// 'describe' is used to group related tests together into a "test suite".
describe('API Endpoints', () => {
  let server;

  // 'beforeAll' runs once before any of the tests in this suite start.
  // We start our Express app and make it listen on a random, available port.
  beforeAll((done) => {
    server = app.listen(0, done);
  });

  // 'afterAll' runs once after all tests in this suite have finished.
  // We close the server to clean up resources and prevent hanging processes.
  afterAll((done) => {
    server.close(done);
  });

  describe('GET /api/history', () => {
    // 'beforeEach' runs before every single test ('it' block) within this 'describe' block.
    // We clear the mock history of `pool.query` to ensure tests don't interfere with each other.
    beforeEach(() => {
      pool.query.mockClear();
    });

    it('should fetch and format history records correctly', async () => {
      // 1. Arrange: Set up the conditions for the test. Here, we define what the
      //    fake database should return when it's queried.
      const mockHistoryData = [
        {
          id: 1,
          itemId: 'MED001',
          itemName: 'Epinephrine',
          date: '2024-05-21T10:00:00.000Z',
          caseId: 'C12345',
          user: 'testuser',
          quantity: 2,
          category: 'Medication',
          action: 'Check Out',
        },
      ];

      // Tell our mock `pool.query` to return the `mockHistoryData` when it's called.
      pool.query.mockResolvedValue([mockHistoryData]);

      // 2. Act: Perform the action we want to test. In this case, we make a GET
      //    request to the '/api/history' endpoint.
      const response = await request(app).get('/api/history');

      // 3. Assert: Verify that the outcome is what we expect.
      // We check for the status code and basic structure.
      // edit For the checking Happy and Fail parth
      expect(response.statusCode).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBe(1);

      // Assert on the specific content of the response to make the test more robust.
      const historyItem = response.body[0];
      expect(historyItem.id).toBe(1);
      expect(historyItem.itemId).toBe('MED001');
      expect(historyItem.itemName).toBe('Epinephrine');
      expect(historyItem.caseId).toBe('C12345');
      expect(historyItem.quantity).toBe(2);
      expect(response.body[0].date).toMatch(/\d{2}\/\d{2}\/\d{4}, \d{1,2}:\d{2}:\d{2} (AM|PM)/);
    });

    // Test Case 2: ทดสอบการกรองข้อมูลด้วย caseId
    it('should filter history records by caseId when provided', async () => {
      // 1. Arrange: Prepare mock data specifically for this filtering test.
      const mockCaseData = [
        {
          id: 2,
          itemId: 'MED002',
          itemName: 'Morphine',
          date: '2024-05-20T12:00:00.000Z',
          caseId: 'C54321', // Specific case ID
          user: 'testuser',
          quantity: 1,
          category: 'Medication',
          action: 'Use',
        },
      ];

      // Tell the mock database to return this specific data.
      pool.query.mockResolvedValue([mockCaseData]);

      // 2. Act: Make an API request, but this time include a query parameter
      //    to test the filtering logic.
      const response = await request(app).get('/api/history?caseId=C54321');

      // 3. Assert: Verify the response.
      expect(response.statusCode).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBe(1);
      expect(response.body[0].caseId).toBe('C54321');

      // This is a powerful assertion. We are checking *how* our code interacted
      // with the mock database. We verify that `pool.query` was called with a SQL
      // string that includes the 'WHERE' clause and with the correct parameter.
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE case_id = ?'), // ตรวจสอบว่ามี WHERE clause
        ['C54321'] // ตรวจสอบว่ามีการส่ง caseId เข้าไปใน params
      );
    });
  });
});
