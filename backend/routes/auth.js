const express = require('express');
const router = express.Router();
const db = require('../config/db');
const jwt = require('jsonwebtoken');
const JWT_SECRET = require('../config/jwt');

// 1. User Login
router.post('/login', async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ message: 'Please provide email, password, and role!' });
  }

  try {
    const roleMap = { admin: 1, doctor: 2, patient: 3, nurse: 4 };
    const roleId = roleMap[role.toLowerCase()];

    if (!roleId) {
      return res.status(400).json({ message: 'Invalid role selected!' });
    }

    // Find user in database by email AND role
    const users = await db.query(
      'SELECT * FROM users WHERE email = ? AND role_id = ?',
      [email, roleId]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid email or role combination!' });
    }

    const user = users[0];

    // Password check — supports both plaintext (dev/seed) and bcrypt hashed passwords
    let isMatch = false;
    if (password === user.password) {
      isMatch = true;
    } else {
      try {
        const bcrypt = require('bcryptjs');
        isMatch = await bcrypt.compare(password, user.password);
      } catch (err) {
        isMatch = false;
      }
    }

    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect password! Please try again.' });
    }

    if (user.status === 'Suspended') {
      return res.status(403).json({ message: 'Your account is suspended. Please contact administrator!' });
    }

    // Update last login timestamp
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    await db.query('UPDATE users SET last_login = ? WHERE id = ?', [now, user.id]);

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: role.toLowerCase() },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Fetch role-specific profile
    let profileData = {};
    const roleLower = role.toLowerCase();

    if (roleLower === 'doctor') {
      const docs = await db.query('SELECT * FROM doctors WHERE user_id = ?', [user.id]);
      if (docs.length > 0) profileData = docs[0];
    } else if (roleLower === 'patient') {
      const pats = await db.query('SELECT * FROM patients WHERE user_id = ?', [user.id]);
      if (pats.length > 0) profileData = pats[0];
    } else if (roleLower === 'nurse') {
      const nrs = await db.query('SELECT * FROM nurses WHERE user_id = ?', [user.id]);
      if (nrs.length > 0) profileData = nrs[0];
    }
    // Admin has no separate profile table — profileData stays {}

    return res.json({
      message: 'Login successful!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: role.toLowerCase(),
        profile_image: user.profile_image || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        profile: profileData
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Server error during login authentication!' });
  }
});


// DEBUG ROUTE — POST /api/auth/debug-register — remove after confirming registration works
router.post("/debug-register", async (req, res) => {
  const log = [];
  try {
    log.push("Step 1: Testing DB connection...");
    const dbCheck = await db.query("SELECT 1 AS ok");
    log.push("DB connection OK: " + JSON.stringify(dbCheck));
    log.push("Step 2: Checking users table...");
    const tables = await db.query("SHOW TABLES LIKE 'users'");
    log.push("Users table exists: " + (tables.length > 0));
    log.push("Step 3: Checking patients table...");
    const ptables = await db.query("SHOW TABLES LIKE 'patients'");
    log.push("Patients table exists: " + (ptables.length > 0));
    log.push("Step 4: Inserting test user...");
    const testEmail = "debug_" + Date.now() + "@test.com";
    const userResult = await db.query("INSERT INTO users (name, email, password, role_id, status, profile_image) VALUES (?, ?, ?, ?, ?, ?)", ["Debug Patient", testEmail, "test123", 3, "Active", ""]);
    const userId = userResult.insertId;
    log.push("User inserted OK. user_id=" + userId);
    log.push("Step 5: Inserting test patient...");
    await db.query("INSERT INTO patients (user_id, name, age, gender, address, phone, email, blood_group, allergies, chronic_conditions, emergency_contact, status, assigned_doctor_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [userId, "Debug Patient", 25, "Male", "Test Address", "0700000000", testEmail, "O+", "None", "None", "None", "Discharged", null]);
    log.push("Patient inserted OK.");
    await db.query("DELETE FROM patients WHERE user_id = ?", [userId]);
    await db.query("DELETE FROM users WHERE id = ?", [userId]);
    log.push("Cleanup done. All steps passed!");
    return res.json({ success: true, log });
  } catch (err) {
    log.push("ERROR: " + err.message);
    return res.status(500).json({ success: false, log, error: err.message });
  }
});

// 2. User Registration
router.post('/register', async (req, res) => {
  const { role, name, email, password } = req.body;

  if (!role || !name || !email || !password) {
    return res.status(400).json({ message: 'Please fill in name, email, password, and role.' });
  }

  try {
    // Check for duplicate email
    const existing = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'An account with this email already exists!' });
    }

    const roleMap = { admin: 1, doctor: 2, patient: 3, nurse: 4 };
    const roleId = roleMap[role.toLowerCase()];
    if (!roleId) {
      return res.status(400).json({ message: 'Invalid role registration request!' });
    }

    // Insert base user record
    const userResult = await db.query(
      'INSERT INTO users (name, email, password, role_id, status, profile_image) VALUES (?, ?, ?, ?, ?, ?)',
      [
        name,
        email,
        password,
        roleId,
        'Active',
        req.body.profile_image || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
      ]
    );

    const userId = userResult.insertId;

    // Insert role-specific profile record
    const roleLower = role.toLowerCase();

    try {
      if (roleLower === 'patient') {
        const {
          age, gender, address, phone, blood_group,
          allergies, chronic_conditions, emergency_contact
        } = req.body;

        await db.query(
          'INSERT INTO patients (user_id, name, age, gender, address, phone, email, blood_group, allergies, chronic_conditions, emergency_contact, status, assigned_doctor_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [
            userId,
            name,
            parseInt(age) || 30,
            gender || 'Male',
            address || 'Not Provided',
            phone || '0000000000',
            email,
            blood_group || 'O+',
            allergies || 'None',
            chronic_conditions || 'None',
            emergency_contact || 'None',
            'Discharged',
            req.body.assigned_doctor_id || null
          ]
        );
        console.log(`[REGISTER] Patient profile created for user_id=${userId}`);

      } else if (roleLower === 'doctor') {
        const {
          department_id, specialization, experience,
          contact, bio, qualification, consultation_hours
        } = req.body;

        await db.query(
          'INSERT INTO doctors (user_id, name, department_id, specialization, experience, availability, contact, rating, bio, qualification, consultation_hours) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [
            userId,
            name,
            parseInt(department_id) || 1,
            specialization || 'General',
            parseInt(experience) || 1,
            'Available',
            contact || '0000000000',
            5.0,
            bio || 'Medical professional dedicated to hospital healthcare.',
            qualification || 'MBBS',
            consultation_hours || '09:00 AM - 05:00 PM'
          ]
        );
        console.log(`[REGISTER] Doctor profile created for user_id=${userId}`);

      } else if (roleLower === 'nurse') {
        const employee_id = req.body.employee_id;
        const department_id = req.body.department_id;
        const qualification = req.body.qualification_n || req.body.qualification;
        const experience = req.body.experience_n || req.body.experience;
        const contact = req.body.contact_n || req.body.contact;

        await db.query(
          'INSERT INTO nurses (user_id, name, employee_id, department_id, qualification, experience, contact) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [
            userId,
            name,
            employee_id || `NUR-${Date.now().toString().slice(-4)}`,
            parseInt(department_id) || null,
            qualification || 'BSc. in Nursing',
            parseInt(experience) || 1,
            contact || '0000000000'
          ]
        );
        console.log(`[REGISTER] Nurse profile created for user_id=${userId}`);

      } else if (roleLower === 'admin') {
        console.log(`[REGISTER] Admin user registered: ${name} (${email})`);
      }
    } catch (profileErr) {
      // Profile insert failed — roll back the user row so there's no orphan account
      console.error(`[REGISTER ERROR] Profile insert failed for role=${roleLower}, user_id=${userId}:`, profileErr.message);
      await db.query('DELETE FROM users WHERE id = ?', [userId]);
      return res.status(500).json({
        message: `Account creation failed: could not save ${roleLower} profile. Check server logs for details.`
      });
    }

    // Welcome notification
    await db.query(
      'INSERT INTO notifications (user_id, message) VALUES (?, ?)',
      [userId, `Welcome to Medicare Hospital, ${name}! Your account has been created successfully.`]
    );

    return res.status(201).json({
      message: 'Account successfully created! You can now log in.',
      userId
    });

  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ message: 'Server error during user registration!' });
  }
});

module.exports = router;
