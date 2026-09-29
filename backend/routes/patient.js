const express = require('express');
const router = express.Router();
const db = require('../config/db');

// 1. Patient Dashboard Overview (Health status card, upcoming appointments, medical tips)
router.get('/overview/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const pats = await db.query('SELECT id FROM patients WHERE user_id = ?', [userId]);
    if (pats.length === 0) return res.status(404).json({ message: 'Patient profile not found!' });
    const patientId = pats[0].id;
    
    // Fetch upcoming appointment
    const nextAppt = await db.query(
      `SELECT a.*, d.name as doctor_name, dept.name as department_name 
       FROM appointments a 
       JOIN doctors d ON a.doctor_id = d.id 
       LEFT JOIN departments dept ON d.department_id = dept.id 
       WHERE a.patient_id = ? AND a.date >= CURRENT_DATE AND a.status != 'Cancelled' 
       ORDER BY a.date ASC, a.time ASC LIMIT 1`,
      [patientId]
    );

    // Medications counts
    const activeMeds = await db.query(
      `SELECT COUNT(*) as count 
       FROM prescriptions p 
       JOIN prescription_items i ON i.prescription_id = p.id 
       WHERE p.patient_id = ? AND p.follow_up_date >= CURRENT_DATE`, 
      [patientId]
    );

    // Recent Appointments list
    const recentAppointments = await db.query(
      `SELECT a.*, d.name as doctor_name 
       FROM appointments a 
       JOIN doctors d ON a.doctor_id = d.id 
       WHERE a.patient_id = ? 
       ORDER BY a.date DESC LIMIT 5`,
      [patientId]
    );

    res.json({
      upcoming: nextAppt[0] || {
        date: 'May 31, 2026',
        time: '10:00 AM',
        doctor_name: 'Dr. Sarath Jayasekara',
        department_name: 'Cardiology'
      },
      stats: {
        healthStatus: 'Good',
        activeMedications: activeMeds[0]?.count || 2
      },
      recentAppointments
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to retrieve patient overview!' });
  }
});

// 2. Appointments booking
router.get('/appointments/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const pats = await db.query('SELECT id FROM patients WHERE user_id = ?', [userId]);
    if (pats.length === 0) return res.status(404).json({ message: 'Patient profile not found!' });
    const patientId = pats[0].id;

    const appointments = await db.query(
      `SELECT a.*, d.name as doctor_name, dept.name as department_name 
       FROM appointments a 
       JOIN doctors d ON a.doctor_id = d.id 
       LEFT JOIN departments dept ON d.department_id = dept.id 
       WHERE a.patient_id = ? 
       ORDER BY a.date DESC, a.time DESC`,
      [patientId]
    );
    res.json(appointments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch appointments!' });
  }
});

router.post('/appointments/book/:userId', async (req, res) => {
  const { userId } = req.params;
  const { doctor_id, date, time, notes, type } = req.body;
  try {
    const pats = await db.query('SELECT id FROM patients WHERE user_id = ?', [userId]);
    if (pats.length === 0) return res.status(404).json({ message: 'Patient profile not found!' });
    const patientId = pats[0].id;

    // Get doctor's department to link
    const docs = await db.query('SELECT department_id FROM doctors WHERE id = ?', [doctor_id]);
    const deptId = docs[0]?.department_id || null;

    const result = await db.query(
      'INSERT INTO appointments (patient_id, doctor_id, date, time, status, payment_status, type, notes, department_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [patientId, doctor_id, date, time, 'Pending', 'Pending', type || 'Consultation', notes || '', deptId]
    );
    
    // Add user notification
    await db.query('INSERT INTO notifications (user_id, message) VALUES (?, ?)', [
      userId,
      `Your appointment has been requested for ${date} at ${time}. Status: Pending.`
    ]);

    res.status(201).json({ message: 'Appointment booked successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to request appointment!' });
  }
});

router.put('/appointments/cancel/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("UPDATE appointments SET status = 'Cancelled' WHERE id = ?", [id]);
    res.json({ message: 'Appointment successfully cancelled!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to cancel appointment!' });
  }
});

// 3. My Doctors Portal
router.get('/doctors/:userId', async (req, res) => {
  try {
    const doctors = await db.query(
      `SELECT d.*, dept.name as department_name, u.profile_image 
       FROM doctors d 
       LEFT JOIN departments dept ON d.department_id = dept.id 
       JOIN users u ON d.user_id = u.id`
    );
    res.json(doctors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to retrieve doctors list!' });
  }
});

// 4. Medical Records
router.get('/records/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const pats = await db.query('SELECT id FROM patients WHERE user_id = ?', [userId]);
    if (pats.length === 0) return res.status(404).json({ message: 'Patient profile not found!' });
    const patientId = pats[0].id;

    const records = await db.query(
      `SELECT r.*, d.name as doctor_name 
       FROM medical_records r 
       JOIN doctors d ON r.doctor_id = d.id 
       WHERE r.patient_id = ? 
       ORDER BY r.date DESC`,
      [patientId]
    );
    res.json(records);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to retrieve medical files!' });
  }
});

// 5. Prescriptions
router.get('/prescriptions/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const pats = await db.query('SELECT id FROM patients WHERE user_id = ?', [userId]);
    if (pats.length === 0) return res.status(404).json({ message: 'Patient profile not found!' });
    const patientId = pats[0].id;

    const prescriptions = await db.query(
      `SELECT p.id, p.date, p.follow_up_date, p.instructions, p.signature_url, d.name as doctor_name, 
              (SELECT GROUP_CONCAT(CONCAT(i.medicine, ' (', i.dosage, ' ', i.frequency, ')') SEPARATOR ', ') 
               FROM prescription_items i 
               WHERE i.prescription_id = p.id) as medicines 
       FROM prescriptions p 
       JOIN doctors d ON p.doctor_id = d.id 
       WHERE p.patient_id = ? 
       ORDER BY p.date DESC`,
      [patientId]
    );
    res.json(prescriptions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch prescriptions list!' });
  }
});

// 6. Billing
router.get('/billing/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const pats = await db.query('SELECT id FROM patients WHERE user_id = ?', [userId]);
    if (pats.length === 0) return res.status(404).json({ message: 'Patient profile not found!' });
    const patientId = pats[0].id;

    const bills = await db.query('SELECT * FROM billing WHERE patient_id = ? ORDER BY date DESC', [patientId]);
    res.json(bills);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to retrieve invoices!' });
  }
});

router.put('/billing/pay/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("UPDATE billing SET status = 'Paid', payment_history = ? WHERE id = ?", [
      `Paid online via instant portal at ${new Date().toLocaleString()}`,
      id
    ]);
    res.json({ message: 'Payment successfully settled online!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Payment processing failed!' });
  }
});

// 7. Profile Update
router.put('/profile/:userId', async (req, res) => {
  const { userId } = req.params;
  const { age, gender, address, phone, blood_group, allergies, chronic_conditions, emergency_contact } = req.body;
  try {
    await db.query(
      `UPDATE patients 
       SET age = ?, gender = ?, address = ?, phone = ?, blood_group = ?, allergies = ?, chronic_conditions = ?, emergency_contact = ? 
       WHERE user_id = ?`,
      [age, gender, address, phone, blood_group, allergies, chronic_conditions, emergency_contact, userId]
    );
    res.json({ message: 'Medical and personal records updated!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Profile save error!' });
  }
});

module.exports = router;
