const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Helper to format date
const getNowString = () => new Date().toISOString().replace('T', ' ').substring(0, 19);

// 1. Admin Dashboard Overview Statistics
router.get('/overview', async (req, res) => {
  try {
    const patients = await db.query('SELECT COUNT(*) as count FROM patients');
    const doctors = await db.query('SELECT COUNT(*) as count FROM doctors');
    const appointments = await db.query('SELECT COUNT(*) as count FROM appointments');
    const departments = await db.query('SELECT COUNT(*) as count FROM departments');
    
    // User accounts breakdown
    const totalUsers = await db.query('SELECT COUNT(*) as count FROM users');
    const activeUsers = await db.query("SELECT COUNT(*) as count FROM users WHERE status = 'Active'");
    const suspendedUsers = await db.query("SELECT COUNT(*) as count FROM users WHERE status = 'Suspended'");
    
    // Recent activities (simulated from appointments & users)
    const recentActivities = [
      { id: 1, type: 'patient', text: 'New patient Dilhan Perera registered', date: 'May 20, 2026', time: '10:00 AM' },
      { id: 2, type: 'appointment', text: 'New appointment scheduled', date: 'May 20, 2026', time: '09:45 AM' },
      { id: 3, type: 'payment', text: 'Payment received from Kavindu Fernando', date: 'May 20, 2026', time: '09:30 AM' }
    ];

    res.json({
      stats: {
        totalPatients: patients[0]?.count || 0,
        totalDoctors: doctors[0]?.count || 0,
        totalAppointments: appointments[0]?.count || 0,
        totalDepartments: departments[0]?.count || 0,
        totalUsers: totalUsers[0]?.count || 0,
        activeUsers: activeUsers[0]?.count || 0,
        suspendedUsers: suspendedUsers[0]?.count || 0,
        newUsersThisMonth: 4
      },
      recentActivities
    });
  } catch (err) {
    console.error('Error fetching admin overview:', err);
    res.status(500).json({ message: 'Failed to fetch admin overview statistics!' });
  }
});

// 2. USERS SECTION CRUD
router.get('/users', async (req, res) => {
  try {
    const users = await db.query(
      `SELECT u.id, u.name, u.email, r.name as role, u.status, u.last_login, u.profile_image 
       FROM users u 
       JOIN roles r ON u.role_id = r.id 
       ORDER BY u.id DESC`
    );
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Failed to fetch user profiles!' });
  }
});

router.post('/users', async (req, res) => {
  const { name, email, password, role, status } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'Missing required user details!' });
  }
  try {
    const roleMap = { admin: 1, doctor: 2, patient: 3, nurse: 4 };
    const roleId = roleMap[role.toLowerCase()] || 3;
    
    await db.query(
      'INSERT INTO users (name, email, password, role_id, status, profile_image) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, password, roleId, status || 'Active', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150']
    );
    res.status(201).json({ message: 'User added successfully!' });
  } catch (err) {
    console.error('Error adding user:', err);
    res.status(500).json({ message: 'Failed to add user account!' });
  }
});

router.put('/users/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, status } = req.body;
  try {
    await db.query('UPDATE users SET name = ?, email = ?, status = ? WHERE id = ?', [name, email, status, id]);
    res.json({ message: 'User updated successfully!' });
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ message: 'Failed to update user profile!' });
  }
});

router.delete('/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM users WHERE id = ?', [id]);
    res.json({ message: 'User deleted successfully!' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ message: 'Failed to delete user profile!' });
  }
});

// 3. DOCTORS SECTION CRUD
router.get('/doctors', async (req, res) => {
  try {
    const doctors = await db.query(
      `SELECT d.*, dept.name as department_name 
       FROM doctors d 
       LEFT JOIN departments dept ON d.department_id = dept.id 
       ORDER BY d.id DESC`
    );
    res.json(doctors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to retrieve doctor profiles!' });
  }
});

router.post('/doctors', async (req, res) => {
  const { name, email, password, specialization, experience, department_id, contact, consultation_hours, qualification, availability } = req.body;
  try {
    // Create in user table
    const result = await db.query(
      'INSERT INTO users (name, email, password, role_id, status, profile_image) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, password, 2, 'Active', 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150']
    );
    const userId = result.insertId;
    
    // Create doctor
    await db.query(
      `INSERT INTO doctors (user_id, name, department_id, specialization, experience, availability, contact, rating, bio, qualification, consultation_hours) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 5.0, ?, ?, ?)`,
      [userId, name, department_id || null, specialization, experience || 5, availability || 'Available', contact, 'Qualified specialist joining Medicare Hospital.', qualification || 'MBBS', consultation_hours || '08:00 AM - 04:00 PM']
    );
    
    res.status(201).json({ message: 'Doctor registered successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to register doctor profile!' });
  }
});

router.put('/doctors/:id', async (req, res) => {
  const { id } = req.params;
  const { name, specialization, experience, department_id, contact, availability, qualification, consultation_hours } = req.body;
  try {
    await db.query(
      `UPDATE doctors 
       SET name = ?, specialization = ?, experience = ?, department_id = ?, contact = ?, availability = ?, qualification = ?, consultation_hours = ? 
       WHERE id = ?`,
      [name, specialization, experience, department_id || null, contact, availability, qualification, consultation_hours, id]
    );
    res.json({ message: 'Doctor profile updated successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update doctor details!' });
  }
});

// 4. PATIENTS SECTION CRUD
router.get('/patients', async (req, res) => {
  try {
    const patients = await db.query('SELECT p.*, d.name as doctor_name FROM patients p LEFT JOIN doctors d ON p.assigned_doctor_id = d.id ORDER BY p.id DESC');
    res.json(patients);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch patients database!' });
  }
});

router.post('/patients', async (req, res) => {
  const { name, email, password, age, gender, address, phone, blood_group, allergies, chronic_conditions, emergency_contact, status, assigned_doctor_id } = req.body;
  try {
    const userResult = await db.query(
      'INSERT INTO users (name, email, password, role_id, status, profile_image) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, password || 'patient123', 3, 'Active', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150']
    );
    const userId = userResult.insertId;
    
    await db.query(
      `INSERT INTO patients (user_id, name, age, gender, address, phone, email, blood_group, allergies, chronic_conditions, emergency_contact, status, assigned_doctor_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, name, age, gender, address, phone, email, blood_group, allergies, chronic_conditions, emergency_contact, status || 'Discharged', assigned_doctor_id || null]
    );
    
    res.status(201).json({ message: 'Patient profile registered successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to register patient profile!' });
  }
});

// 5. APPOINTMENTS SECTION CRUD
router.get('/appointments', async (req, res) => {
  try {
    const appointments = await db.query(
      `SELECT a.*, p.name as patient_name, d.name as doctor_name 
       FROM appointments a 
       JOIN patients p ON a.patient_id = p.id 
       JOIN doctors d ON a.doctor_id = d.id 
       ORDER BY a.date DESC, a.time DESC`
    );
    res.json(appointments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch appointments!' });
  }
});

router.post('/appointments', async (req, res) => {
  const { patient_id, doctor_id, date, time, status, payment_status, type, notes } = req.body;
  try {
    await db.query(
      'INSERT INTO appointments (patient_id, doctor_id, date, time, status, payment_status, type, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [patient_id, doctor_id, date, time, status || 'Pending', payment_status || 'Pending', type || 'Consultation', notes || '']
    );
    res.status(201).json({ message: 'Appointment booked successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to book appointment!' });
  }
});

router.put('/appointments/:id', async (req, res) => {
  const { id } = req.params;
  const { status, payment_status, date, time } = req.body;
  try {
    await db.query(
      'UPDATE appointments SET status = ?, payment_status = ?, date = ?, time = ? WHERE id = ?',
      [status, payment_status, date, time, id]
    );
    res.json({ message: 'Appointment updated successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update appointment details!' });
  }
});

router.delete('/appointments/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM appointments WHERE id = ?', [id]);
    res.json({ message: 'Appointment cancelled/deleted!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete appointment!' });
  }
});

// 6. DEPARTMENTS SECTION CRUD
router.get('/departments', async (req, res) => {
  try {
    const departments = await db.query(
      `SELECT dept.*, d.name as head_doctor_name 
       FROM departments dept 
       LEFT JOIN doctors d ON dept.head_doctor_id = d.id`
    );
    res.json(departments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch departments list!' });
  }
});

router.post('/departments', async (req, res) => {
  const { name, head_doctor_id, room_count, staff_count, description } = req.body;
  try {
    await db.query(
      'INSERT INTO departments (name, head_doctor_id, room_count, staff_count, description) VALUES (?, ?, ?, ?, ?)',
      [name, head_doctor_id || null, room_count || 10, staff_count || 5, description || '']
    );
    res.status(201).json({ message: 'Department created successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create department!' });
  }
});

router.put('/departments/:id', async (req, res) => {
  const { id } = req.params;
  const { name, head_doctor_id, room_count, staff_count, description } = req.body;
  try {
    await db.query(
      'UPDATE departments SET name = ?, head_doctor_id = ?, room_count = ?, staff_count = ?, description = ? WHERE id = ?',
      [name, head_doctor_id || null, room_count, staff_count, description, id]
    );
    res.json({ message: 'Department updated successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update department!' });
  }
});

module.exports = router;
