const mysql = require('mysql2/promise');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;

// MySQL connection pool configuration
const pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: 'Manow_wan@1234',
    database: 'QMedicDB'
});

// Utility function to safely format Date objects received from MySQL
const formatDateForFrontend = (date) => {
    if (!date) return null;
    // Format to YYYY-MM-DD string, which is standard for <input type="date"> and clean storage
    return date instanceof Date ? date.toISOString().split('T')[0] : date; 
};

// Utility function to map MySQL item row to the front-end InventoryItem structure
const mapToInventoryItem = (item) => {
    let status = 'In Stock';
    if (item.quantity <= 0) {
        status = 'Out of Stock';
    } else if (item.quantity < item.min_quantity) {
        status = 'Low Stock';
    }

    // FIX: Use robust formatting helper
    const expiryDate = formatDateForFrontend(item.expiry_date);
    // lastScanned should be a simple date string for display, using toLocaleDateString() on the client is safer
    const lastScanned = item.last_scanned ? new Date(item.last_scanned).toLocaleDateString('en-US') : null; 

    return {
        id: item.item_id, // Front-end uses item_id as 'id'
        dbId: item.id,    // Internal DB ID (for item_fk)
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        lastScanned: lastScanned,
        status: status,
        expiryDate: expiryDate,
        location: item.location,
    };
};

/**
 * GET /api/inventory
 * Fetches all inventory items and calculates their 'status'.
 */
app.get('/api/inventory', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM inventory_item');
        const items = rows.map(mapToInventoryItem);

        // Calculate checkedIn, checkedOut, and lowStockCount for the Home Screen
        const [historyRows] = await pool.query('SELECT action, quantity FROM inventory_history');
        
        const summary = historyRows.reduce((acc, record) => {
            if (record.action === "Check In") {
                acc.checkedIn += record.quantity;
            } else {
                acc.checkedOut += record.quantity;
            }
            return acc;
        }, { checkedIn: 0, checkedOut: 0, lowStockCount: items.filter(i => i.status === 'Low Stock').length });

        res.json({
            items: items,
            summary: summary
        });
    } catch (error) {
        console.error('Error fetching inventory:', error);
        res.status(500).send({ message: 'Failed to fetch inventory data.' });
    }
});

/**
 * POST /api/action/log
 * Logs an inventory action (Check In, Check Out, Use, etc.) and updates item quantity.
 */
app.post('/api/action/log', async (req, res) => {
    const { itemId, action, quantity, caseId = `C${Math.floor(Math.random() * 90000) + 10000}`, user = 'Current User' } = req.body;

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Get Item Data
        const [items] = await connection.query('SELECT id, name, category, quantity FROM inventory_item WHERE item_id = ?', [itemId]);
        if (items.length === 0) throw new Error(`Item ID ${itemId} not found.`);
        const item = items[0];
        
        // 2. Calculate New Quantity
        const quantityChange = (action === 'Check In') ? quantity : -quantity;
        let updatedQuantity = item.quantity + quantityChange;
        updatedQuantity = Math.max(0, updatedQuantity); // Ensure no negative stock

        // 3. Update inventory_item
        await connection.query('UPDATE inventory_item SET quantity = ?, last_scanned = CURDATE() WHERE id = ?', [updatedQuantity, item.id]);

        // 4. Insert into inventory_history
        const historyQuery = `
            INSERT INTO inventory_history 
            (item_fk, item_id, item_name, action, quantity, action_date, case_id, user, category)
            VALUES (?, ?, ?, ?, ?, NOW(), ?, ?, ?);
        `;
        await connection.query(historyQuery, [
            item.id, itemId, item.name, action, quantity, caseId, user, item.category
        ]);

        // TODO: (SERVER SIDE FEATURE) Add logic here to check if the new quantity <= min_quantity 
        //       or if a transaction triggers an expiry alert, and then call addNotification API logic.

        await connection.commit();
        res.status(200).send({ message: 'Action logged and inventory updated.', newQuantity: updatedQuantity });

    } catch (error) {
        await connection.rollback();
        console.error('Transaction failed:', error);
        res.status(500).send({ error: 'Failed to complete inventory transaction.' });
    } finally {
        connection.release();
    }
});

/**
 * GET /api/history
 * Fetches all transaction records.
 */
app.get('/api/history', async (req, res) => {
    try {
        // CORRECTION: Use the base column names (item_id, item_name, category)
        // to avoid SQL errors if the 'at_action' versions don't exist.
        const query = `
            SELECT id, item_id as itemId, item_name as itemName, 
                   action_date as date, case_id as caseId, user, quantity, 
                   category
            FROM inventory_history
            ORDER BY action_date DESC;
        `;
        const [rows] = await pool.query(query);
        
        // Format the date string for client display
        const history = rows.map(row => ({
            ...row,
            // Ensure date conversion is safe
            date: row.date ? new Date(row.date).toLocaleString('en-US', {
                month: '2-digit', day: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
            }) : 'N/A'
        }));

        res.json(history);
    } catch (error) {
        console.error('Error fetching history:', error);
        res.status(500).send({ message: 'Failed to fetch history data.' });
    }
});

/**
 * GET /api/notifications
 * Fetches all notifications/alerts.
 */
app.get('/api/notifications', async (req, res) => {
    try {
        const query = `
            SELECT id, item_id_at_alert AS itemId, item_name AS itemName, 
                    expiry_date_at_alert AS expiry, location, is_read AS 'read'
            FROM notification_log
            ORDER BY created_at DESC;
        `;
        const [rows] = await pool.query(query);

        // Convert the date object to the 'YYYY-MM-DD' string format used by the mock
        const notifications = rows.map(row => ({
            ...row,
            expiry: row.expiry ? formatDateForFrontend(row.expiry) : null,
            read: row.read === 1 // MySQL BOOLEAN 1/0 converts to true/false
        }));

        res.json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).send({ message: 'Failed to fetch notifications.' });
    }
});

/**
 * POST /api/notifications/read/:id
 * Marks a specific notification as read.
 */
app.post('/api/notifications/read/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('UPDATE notification_log SET is_read = TRUE WHERE id = ?', [id]);
        res.status(200).send({ message: `Notification ${id} marked as read.` });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).send({ message: 'Failed to update notification status.' });
    }
});

// --- Start Server ---
app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 Server running on port ${PORT}`);
    console.log(`Access the API at http://localhost:${PORT}`);
    console.log(`\n*** REMEMBER TO UPDATE DB_CONFIG WITH YOUR CREDENTIALS ***\n`);
});