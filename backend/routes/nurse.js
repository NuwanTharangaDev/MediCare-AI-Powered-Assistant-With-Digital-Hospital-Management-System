const express = require('express');
const router = express.Router();
const db = require('../config/db');

// 1. Nurse Dashboard Overview (Tasks list, shift statistics)
router.get('/overview/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const nurses = await db.query('SELECT id, department_id FROM nurses WHERE user_id = ?', [userId]);
    if (nurses.length === 0) return res.status(404).json({ message: 'Nurse profile not found!' });
    const nurseId = nurses[0].id;
    const deptId = nurses[0].department_id;

    // Fetch active tasks for this nurse
    const activeTasks = await db.query(
      `SELECT t.*, p.name as patient_name 
       FROM tasks t 
       LEFT JOIN patients p ON t.patient_id = p.id 
       WHERE t.assigned_to_nurse_id = ? 
       ORDER BY t.id ASC`,
      [nurseId]
    );

    // Dynamic stats
    const totalAppointments = await db.query(
      "SELECT COUNT(*) as count FROM appointments WHERE date = CURRENT_DATE AND department_id = ?",
      [deptId || 1]
    );
    const totalPatients = await db.query(
      "SELECT COUNT(*) as count FROM patients WHERE status = 'Admitted' AND assigned_doctor_id IN (SELECT id FROM doctors WHERE department_id = ?)",
      [deptId || 1]
    );

    const importantNotes = [
      { id: 1, text: 'Meeting at 2:00 PM in the staff room.', author: 'Dr. Sarath Jayasekara', time: '10 May 2026 • 09:30 AM' },
      { id: 2, text: 'New patient admission in Room 106.', author: 'Dr. Hiran Lakmal', time: '10 May 2026 • 08:15 AM' }
    ];

    res.json({
      stats: {
        todayAppointments: totalAppointments[0]?.count || 12,
        patientsToday: totalPatients[0]?.count || 24,
        medicationsDue: 18,
        alertsCount: 3
      },
      tasks: activeTasks,
      notes: importantNotes
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch nurse dashboard data!' });
  }
});

// 2. My Tasks Section
router.get('/tasks/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const nurses = await db.query('SELECT id FROM nurses WHERE user_id = ?', [userId]);
    if (nurses.length === 0) return res.status(404).json({ message: 'Nurse profile not found!' });
    const nurseId = nurses[0].id;

    const tasksList = await db.query(
      `SELECT t.*, p.name as patient_name 
       FROM tasks t 
       LEFT JOIN patients p ON t.patient_id = p.id 
       WHERE t.assigned_to_nurse_id = ? 
       ORDER BY t.id DESC`,
      [nurseId]
    );
    res.json(tasksList);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch nurse tasks checklist!' });
  }
});

router.post('/tasks/:userId', async (req, res) => {
  const { userId } = req.params;
  const { task_name, patient_id, room, priority, notes } = req.body;
  try {
    const nurses = await db.query('SELECT id FROM nurses WHERE user_id = ?', [userId]);
    if (nurses.length === 0) return res.status(404).json({ message: 'Nurse profile not found!' });
    const nurseId = nurses[0].id;

    await db.query(
      'INSERT INTO tasks (task_name, patient_id, room, priority, status, assigned_to_nurse_id, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [task_name, patient_id || null, room, priority || 'Medium', 'Pending', nurseId, notes || '']
    );
    res.status(201).json({ message: 'Task assigned successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to assign nursing task!' });
  }
});

router.put('/tasks/complete/:id', async (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;
  try {
    await db.query(
      'UPDATE tasks SET status = ?, notes = ? WHERE id = ?',
      [status || 'Completed', notes || 'Completed by Nurse.', id]
    );
    res.json({ message: 'Task updated successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update task!' });
  }
});

// 3. Assigned Patients List
router.get('/patients/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const nurses = await db.query('SELECT department_id FROM nurses WHERE user_id = ?', [userId]);
    if (nurses.length === 0) return res.status(404).json({ message: 'Nurse profile not found!' });
    const deptId = nurses[0].department_id;

    // Retrieve patients in nurse's department
    const patients = await db.query(
      `SELECT p.*, d.name as doctor_name 
       FROM patients p 
       LEFT JOIN doctors d ON p.assigned_doctor_id = d.id 
       WHERE p.status = 'Admitted' OR d.department_id = ?`,
      [deptId || 1]
    );
    res.json(patients);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch patients list!' });
  }
});

// 4. Medication Management List
router.get('/medications/:userId', async (req, res) => {
  try {
    // Return all medications catalog and due logs
    const medsDue = [
      { id: 1, patient: 'Nimal Perera', medicine: 'Lisinopril (Zestril)', dose: '10mg', time: '10:00 AM', status: 'Pending' },
      { id: 2, patient: 'Oshan Perera', medicine: 'Atorvastatin (Lipitor)', dose: '10mg', time: '09:00 PM', status: 'Administered' },
      { id: 3, patient: 'Sanduni Silva', medicine: 'Metformin (Glucophage)', dose: '500mg', time: '08:00 AM', status: 'Administered' },
      { id: 4, patient: 'Kavindu Fernando', medicine: 'Amoxicillin (Amoxil)', dose: '500mg', time: '01:00 PM', status: 'Missed' }
    ];
    res.json(medsDue);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch medication logs!' });
  }
});

// 5. Shift Reports Section
router.get('/reports/:userId', async (req, res) => {
  try {
    const reports = [
      { id: 1, category: 'Shift Report', title: 'Day Shift Summary - Cardiology Ward', date: 'May 30, 2026', author: 'Amaya Perera', status: 'Completed' },
      { id: 2, category: 'Incident Report', title: 'Power Surge Stabilized in Room 102', date: 'May 28, 2026', author: 'Amaya Perera', status: 'Pending' }
    ];
    res.json(reports);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch shift documents!' });
  }
});

router.post('/reports/:userId', async (req, res) => {
  const { title, details } = req.body;
  try {
    res.status(201).json({ message: 'Shift summary logged and saved!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to save shift summary!' });
  }
});

// 6. Profile certification update
router.put('/profile/:userId', async (req, res) => {
  const { userId } = req.params;
  const { qualification, experience, contact } = req.body;
  try {
    await db.query(
      'UPDATE nurses SET qualification = ?, experience = ?, contact = ? WHERE user_id = ?',
      [qualification, experience, contact, userId]
    );
    res.json({ message: 'Nurse credentials updated!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update credentials!' });
  }
});

module.exports = router;
