const express = require('express');

function createHistoryRouter(pool) {
    const router = express.Router();

    router.post('/action/log', async (req, res) => {
        const { itemId, action, quantity, caseId = `C${Math.floor(Math.random() * 90000) + 10000}`, user = 'Current User' } = req.body;
        const qty = Number(quantity) || 0;

        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            // 1. Get Item Data and its minimum quantity threshold
            const [items] = await connection.query('SELECT id, name, category, quantity FROM inventory_item WHERE item_id = ?', [itemId]);
            if (items.length === 0) throw new Error(`Item ID ${itemId} not found.`);
            const item = items[0];
            
            // 2. Calculate New Quantity
            let updatedQuantity = item.quantity;
            const actionsThatReduceStock = ["Use", "Check Out", "Remove All"];

            if (action === 'Check In') {
                updatedQuantity += quantity;
            } else if (actionsThatReduceStock.includes(action)) {
                // --- FIX: Add explicit check for insufficient stock ---
                if (item.quantity < quantity) {
                    throw new Error(`Insufficient stock. Available: ${item.quantity}, Requested: ${quantity}`);
                }
                updatedQuantity -= quantity;
            }
            
            updatedQuantity = Math.max(0, updatedQuantity); 

            // 3. Update inventory_item
            await connection.query('UPDATE inventory_item SET quantity = ?, last_scanned = NOW() WHERE id = ?', [updatedQuantity, item.id]);

            // 4. Insert into inventory_history
            const historyQuery = `
                INSERT INTO inventory_history 
                (item_fk, item_id, item_name, action, quantity, action_date, case_id, user, category)
                VALUES (?, ?, ?, ?, ?, NOW(), ?, ?, ?);
            `;
            await connection.query(historyQuery, [
                item.id, itemId, item.name, action, quantity, caseId, user, item.category
            ]);

            // 5. Check for Low Stock and Send Notification (logic remains the same)
            const [itemDetails] = await connection.query('SELECT quantity, min_quantity, name, location, expiry_date FROM inventory_item WHERE id = ?', [item.id]);
            const updatedItem = itemDetails[0];
            const minQty = updatedItem.min_quantity;
            const actionsThatTriggerAlert = ["Use", "Check Out", "Remove All"];

            if (updatedItem.quantity <= minQty && actionsThatTriggerAlert.includes(action)) {
                const insertNotifQuery = `
                    INSERT INTO notification_log 
                        (item_fk, alert_type, item_id_at_alert, item_name, location, expiry_date_at_alert, details)
                    VALUES (?, 'Low Stock', ?, ?, ?, ?, ?);
                `;
                await connection.query(insertNotifQuery, [
                    item.id,
                    itemId,
                    updatedItem.name,
                    updatedItem.location,
                    updatedItem.expiry_date,
                    `Quantity is ${updatedItem.quantity}, which is at or below the minimum of ${minQty}.`
                ]);
                // console.log(`✅ Low stock notification logged for item ${itemId}.`);
            }

            await connection.commit();
            res.status(200).send({ message: 'Action logged and inventory updated.', newQuantity: updatedQuantity });

        } catch (error) {
            await connection.rollback();
            // Check for the specific "Item not found" error
            if (error.message.includes('Item ID')) {
                res.status(404).send({ error: error.message });
            // --- FIX: Handle insufficient stock error ---
            } else if (error.message.includes('Insufficient stock')) {
                res.status(400).send({ error: error.message });
            } else {
                console.error('Transaction failed:', error);
                res.status(500).send({ error: 'Failed to complete inventory transaction.' });
            }
        } finally {
            connection.release();
        }
    });

    router.get('/history', async (req, res) => {
        // --- FIX: Re-add filtering and sorting parameters ---
        const { caseId, action, category, sort } = req.query;
        try {
            let query = `
                SELECT id, item_id as itemId, item_name as itemName, 
                       action_date as date, case_id as caseId, user, quantity, 
                       category, action
                FROM inventory_history
                WHERE 1=1
            `;
            const params = [];

            // --- FIX: Add logic to build the query dynamically ---
            if (caseId) {
                query += ' AND case_id = ?';
                params.push(caseId);
            }
            if (action) {
                query += ' AND action = ?';
                params.push(action);
            }
            if (category) {
                query += ' AND category = ?';
                params.push(category);
            }
            if (sort === 'date') {
                query += ' ORDER BY action_date DESC';
            } else {
                query += ' ORDER BY action_date DESC'; // Default sort
            }

            const [rows] = await pool.query(query, params);
            const history = rows.map(row => ({ ...row, date: row.date ? new Date(row.date).toLocaleString('en-US') : 'N/A' }));
            res.json(history);
        } catch (error) {
            console.error('Error fetching history:', error);
            res.status(500).send({ message: 'Failed to fetch history data.' });
        }
    });

    return router;
}

module.exports = createHistoryRouter;