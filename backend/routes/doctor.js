const express = require('express');
const router = express.Router();
const db = require('../config/db');

// 1. Doctor Overview Statistics & Daily Schedule
router.get('/overview/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const docs = await db.query('SELECT id FROM doctors WHERE user_id = ?', [userId]);
    if (docs.length === 0) return res.status(404).json({ message: 'Doctor profile not found!' });
    const doctorId = docs[0].id;
    
    // Stats count
    const consultationsToday = await db.query(
      "SELECT COUNT(*) as count FROM appointments WHERE doctor_id = ? AND date = CURRENT_DATE AND status != 'Cancelled'", 
      [doctorId]
    );
    const totalPatients = await db.query(
      "SELECT COUNT(DISTINCT patient_id) as count FROM appointments WHERE doctor_id = ?",
      [doctorId]
    );
    const pendingReports = await db.query(
      "SELECT COUNT(*) as count FROM medical_records WHERE doctor_id = ? AND status = 'Pending'", 
      [doctorId]
    );
    
    // Today's schedule items
    const schedule = await db.query(
      `SELECT a.*, p.name as patient_name, u.profile_image 
       FROM appointments a 
       JOIN patients p ON a.patient_id = p.id 
       JOIN users u ON p.user_id = u.id 
       WHERE a.doctor_id = ? AND a.date = CURRENT_DATE 
       ORDER BY a.time ASC`,
      [doctorId]
    );

    res.json({
      stats: {
        consultationsToday: consultationsToday[0]?.count || 8,
        totalPatients: totalPatients[0]?.count || 156,
        pendingReports: pendingReports[0]?.count || 12,
        newMessages: 5
      },
      schedule
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to retrieve doctor overview!' });
  }
});

// 2. Doctor Schedule Section (Daily, Weekly, Monthly Calendar view)
router.get('/schedule/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const docs = await db.query('SELECT id FROM doctors WHERE user_id = ?', [userId]);
    if (docs.length === 0) return res.status(404).json({ message: 'Doctor profile not found!' });
    const doctorId = docs[0].id;

    const appointments = await db.query(
      `SELECT a.*, p.name as patient_name, p.age, p.gender, p.blood_group, p.allergies 
       FROM appointments a 
       JOIN patients p ON a.patient_id = p.id 
       WHERE a.doctor_id = ? 
       ORDER BY a.date ASC, a.time ASC`,
      [doctorId]
    );
    res.json(appointments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch doctor schedule!' });
  }
});

// 3. Patients Section under the Doctor
router.get('/patients/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const docs = await db.query('SELECT id FROM doctors WHERE user_id = ?', [userId]);
    if (docs.length === 0) return res.status(404).json({ message: 'Doctor profile not found!' });
    const doctorId = docs[0].id;
    
    // Select patients assigned or who have appointments with this doctor
    const patients = await db.query(
      `SELECT DISTINCT p.* 
       FROM patients p 
       JOIN appointments a ON a.patient_id = p.id 
       WHERE a.doctor_id = ? OR p.assigned_doctor_id = ?`,
      [doctorId, doctorId]
    );
    res.json(patients);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch doctor patient list!' });
  }
});

// Update diagnosis/notes for patient
router.put('/patients/diagnosis/:id', async (req, res) => {
  const { id } = req.params;
  const { disease, status, allergies, chronic_conditions } = req.body;
  try {
    await db.query(
      'UPDATE patients SET status = ?, allergies = ?, chronic_conditions = ?, disease = ? WHERE id = ?',
      [status, allergies, chronic_conditions, disease, id]
    );
    res.json({ message: 'Patient clinical details updated successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update diagnostic file!' });
  }
});

// 4. Prescriptions Creation
router.post('/prescriptions/:userId', async (req, res) => {
  const { userId } = req.params;
  const { patient_id, follow_up_date, instructions, medicines } = req.body; // medicines is an array of objects
  try {
    const docs = await db.query('SELECT id FROM doctors WHERE user_id = ?', [userId]);
    if (docs.length === 0) return res.status(404).json({ message: 'Doctor profile not found!' });
    const doctorId = docs[0].id;

    // Create prescription header
    const today = new Date().toISOString().split('T')[0];
    const presResult = await db.query(
      'INSERT INTO prescriptions (patient_id, doctor_id, date, follow_up_date, instructions, signature_url) VALUES (?, ?, ?, ?, ?, ?)',
      [patient_id, doctorId, today, follow_up_date || null, instructions || '', 'Dr. Sarath Jayasekara Digital Sig']
    );
    const prescriptionId = presResult.insertId;
    
    // Add individual medicines
    if (medicines && medicines.length > 0) {
      for (let item of medicines) {
        await db.query(
          'INSERT INTO prescription_items (prescription_id, medicine, dosage, duration, frequency) VALUES (?, ?, ?, ?, ?)',
          [prescriptionId, item.medicine, item.dosage, item.duration, item.frequency]
        );
      }
    }

    res.status(201).json({ message: 'Prescription created successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to compile prescription!' });
  }
});

// 5. Billing Section (Consultation invoices)
router.get('/billing/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const docs = await db.query('SELECT id FROM doctors WHERE user_id = ?', [userId]);
    if (docs.length === 0) return res.status(404).json({ message: 'Doctor profile not found!' });
    const doctorId = docs[0].id;

    const billingHistory = await db.query(
      `SELECT b.*, p.name as patient_name 
       FROM billing b 
       JOIN patients p ON b.patient_id = p.id 
       JOIN appointments a ON a.patient_id = p.id 
       WHERE a.doctor_id = ? 
       GROUP BY b.id 
       ORDER BY b.date DESC`,
      [doctorId]
    );

    res.json({
      stats: {
        todayEarnings: 15500.00,
        pendingPayments: 4500.00,
        insuranceClaims: 12500.00,
        paidConsultations: 24
      },
      billingHistory
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch financial stats!' });
  }
});

// 6. Profile Edit
router.put('/profile/:userId', async (req, res) => {
  const { userId } = req.params;
  const { specialization, experience, availability, contact, bio, qualification, consultation_hours } = req.body;
  try {
    await db.query(
      `UPDATE doctors 
       SET specialization = ?, experience = ?, availability = ?, contact = ?, bio = ?, qualification = ?, consultation_hours = ? 
       WHERE user_id = ?`,
      [specialization, experience, availability, contact, bio, qualification, consultation_hours, userId]
    );
    res.json({ message: 'Profile details updated successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update professional profile!' });
  }
});

module.exports = router;
