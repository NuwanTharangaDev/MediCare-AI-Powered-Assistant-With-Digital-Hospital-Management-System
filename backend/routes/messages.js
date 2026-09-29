const express = require('express');
const router = express.Router();
const db = require('../config/db');

// 1. Get Chat Messages History between two users
router.get('/history/:userId/:otherId', async (req, res) => {
  const { userId, otherId } = req.params;
  try {
    const messages = await db.query(
      `SELECT * FROM messages 
       WHERE (sender_id = ? AND receiver_id = ?) 
          OR (sender_id = ? AND receiver_id = ?) 
       ORDER BY timestamp ASC`,
      [userId, otherId, otherId, userId]
    );
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to retrieve messages history!' });
  }
});

// 2. Send Chat Message
router.post('/send', async (req, res) => {
  const { sender_id, receiver_id, content, is_emergency } = req.body;
  
  if (!sender_id || !receiver_id || !content) {
    return res.status(400).json({ message: 'Missing sender, receiver, or content!' });
  }
  
  try {
    await db.query(
      'INSERT INTO messages (sender_id, receiver_id, content, timestamp, is_emergency) VALUES (?, ?, ?, ?, ?)',
      [sender_id, receiver_id, content, new Date().toISOString(), is_emergency ? 1 : 0]
    );
    
    // Add real-time user notification
    const sender = await db.query('SELECT name FROM users WHERE id = ?', [sender_id]);
    const senderName = sender[0]?.name || 'Someone';
    await db.query('INSERT INTO notifications (user_id, message) VALUES (?, ?)', [
      receiver_id,
      `New chat message from ${senderName}: "${content.substring(0, 30)}..."`
    ]);

    res.status(201).json({ message: 'Message sent successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to send message!' });
  }
});

// 3. Get Contact List for Messaging based on role
router.get('/contacts/:userId/:role', async (req, res) => {
  const { userId, role } = req.params;
  try {
    let contacts = [];
    if (role === 'patient') {
      // Patients can chat with all doctors and nurses
      contacts = await db.query(
        `SELECT u.id, u.name, r.name as role, u.profile_image 
         FROM users u 
         JOIN roles r ON u.role_id = r.id 
         WHERE r.name IN ('doctor', 'nurse') 
         ORDER BY u.name ASC`
      );
    } else if (role === 'doctor') {
      // Doctors can chat with all patients and nurses
      contacts = await db.query(
        `SELECT u.id, u.name, r.name as role, u.profile_image 
         FROM users u 
         JOIN roles r ON u.role_id = r.id 
         WHERE r.name IN ('patient', 'nurse') 
         ORDER BY u.name ASC`
      );
    } else if (role === 'nurse') {
      // Nurses can chat with all doctors and patients
      contacts = await db.query(
        `SELECT u.id, u.name, r.name as role, u.profile_image 
         FROM users u 
         JOIN roles r ON u.role_id = r.id 
         WHERE r.name IN ('doctor', 'patient') 
         ORDER BY u.name ASC`
      );
    } else {
      // Admin can chat with anyone
      contacts = await db.query(
        `SELECT u.id, u.name, r.name as role, u.profile_image 
         FROM users u 
         JOIN roles r ON u.role_id = r.id 
         WHERE u.id != ? 
         ORDER BY u.name ASC`,
        [userId]
      );
    }
    res.json(contacts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch messages contact list!' });
  }
});

// 4. Retrieve notifications
router.get('/notifications/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const list = await db.query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY timestamp DESC LIMIT 10',
      [userId]
    );
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch user notifications!' });
  }
});

router.put('/notifications/read/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    await db.query('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [userId]);
    res.json({ message: 'All notifications marked as read!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to clear alerts!' });
  }
});

module.exports = router;
