-- =====================================================================
-- Hospital Management System (HMS) - Medical Hospital database setup
-- Combines both schema creation and database seeding in one file.
-- Compatible with MySQL/MariaDB.
-- =====================================================================

CREATE DATABASE IF NOT EXISTS medical_hms;
USE medical_hms;

-- ==========================================
-- 1. SCHEMA DEFINITION (TABLES CREATION)
-- ==========================================

-- 1. Roles
CREATE TABLE IF NOT EXISTS roles (
  id INT NOT NULL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE
);

-- 2. Users
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role_id INT NOT NULL,
  status VARCHAR(20) DEFAULT 'Active',
  last_login DATETIME NULL,
  profile_image TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT
);

-- 3. Departments
CREATE TABLE IF NOT EXISTS departments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  head_doctor_id INT NULL,
  room_count INT DEFAULT 10,
  staff_count INT DEFAULT 5,
  description TEXT NULL
);

-- 4. Doctors
CREATE TABLE IF NOT EXISTS doctors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  department_id INT NULL,
  specialization VARCHAR(100) NOT NULL,
  experience INT NOT NULL,
  availability VARCHAR(50) DEFAULT 'Available',
  contact VARCHAR(50) NOT NULL,
  rating DECIMAL(3,2) DEFAULT 5.0,
  bio TEXT NULL,
  qualification VARCHAR(100) NULL,
  consultation_hours VARCHAR(100) NULL,
  certificate_url TEXT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);

-- 5. Patients
CREATE TABLE IF NOT EXISTS patients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  age INT NOT NULL,
  gender VARCHAR(20) NOT NULL,
  address TEXT NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL,
  blood_group VARCHAR(10) NULL,
  allergies TEXT NULL,
  chronic_conditions TEXT NULL,
  emergency_contact VARCHAR(100) NULL,
  status VARCHAR(50) DEFAULT 'Discharged',
  assigned_doctor_id INT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_doctor_id) REFERENCES doctors(id) ON DELETE SET NULL
);

-- 6. Nurses
CREATE TABLE IF NOT EXISTS nurses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  employee_id VARCHAR(50) NOT NULL UNIQUE,
  department_id INT NULL,
  qualification VARCHAR(100) NULL,
  experience INT NOT NULL,
  contact VARCHAR(50) NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);

-- 7. Appointments
CREATE TABLE IF NOT EXISTS appointments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  doctor_id INT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  status VARCHAR(50) DEFAULT 'Pending',
  payment_status VARCHAR(50) DEFAULT 'Pending',
  type VARCHAR(100) DEFAULT 'Consultation',
  notes TEXT NULL,
  department_id INT NULL,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);

-- 8. Billing
CREATE TABLE IF NOT EXISTS billing (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  invoice_id VARCHAR(50) NOT NULL UNIQUE,
  date DATE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'Pending',
  insurance_claims VARCHAR(100) DEFAULT 'None',
  payment_history TEXT NULL,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

-- 9. Medical Records
CREATE TABLE IF NOT EXISTS medical_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  record_name VARCHAR(150) NOT NULL,
  date DATE NOT NULL,
  doctor_id INT NOT NULL,
  status VARCHAR(50) DEFAULT 'Final',
  file_url TEXT NULL,
  diagnosis TEXT NULL,
  treatment TEXT NULL,
  notes TEXT NULL,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
);

-- 10. Medications
CREATE TABLE IF NOT EXISTS medications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT NULL,
  dosage_form VARCHAR(50) NOT NULL,
  standard_dosage VARCHAR(100) NOT NULL
);

-- 11. Messages
CREATE TABLE IF NOT EXISTS messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sender_id INT NOT NULL,
  receiver_id INT NOT NULL,
  content TEXT NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  voice_url TEXT NULL,
  file_url TEXT NULL,
  is_emergency BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 12. Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 13. Prescriptions
CREATE TABLE IF NOT EXISTS prescriptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  doctor_id INT NOT NULL,
  date DATE NOT NULL,
  follow_up_date DATE NULL,
  instructions TEXT NULL,
  signature_url TEXT NULL,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
);

-- 14. Prescription Items
CREATE TABLE IF NOT EXISTS prescription_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  prescription_id INT NOT NULL,
  medicine VARCHAR(100) NOT NULL,
  dosage VARCHAR(50) NOT NULL,
  duration VARCHAR(50) NOT NULL,
  frequency VARCHAR(50) NOT NULL,
  FOREIGN KEY (prescription_id) REFERENCES prescriptions(id) ON DELETE CASCADE
);

-- 15. Reports
CREATE TABLE IF NOT EXISTS reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category VARCHAR(100) NOT NULL,
  title VARCHAR(150) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INT NOT NULL,
  filepath TEXT NULL,
  data TEXT NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- 16. Settings
CREATE TABLE IF NOT EXISTS settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  key_name VARCHAR(100) NOT NULL UNIQUE,
  val_value TEXT NOT NULL,
  category VARCHAR(50) NOT NULL
);

-- 17. Tasks
CREATE TABLE IF NOT EXISTS tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  task_name VARCHAR(255) NOT NULL,
  patient_id INT NULL,
  room VARCHAR(50) NOT NULL,
  priority VARCHAR(50) DEFAULT 'Medium',
  status VARCHAR(50) DEFAULT 'Pending',
  assigned_to_nurse_id INT NULL,
  notes TEXT NULL,
  reminder_time DATETIME NULL,
  evidence_url TEXT NULL,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE SET NULL,
  FOREIGN KEY (assigned_to_nurse_id) REFERENCES nurses(id) ON DELETE SET NULL
);


-- ==========================================
-- 2. SEED DATA (INITIAL RECORDS SEEDING)
-- ==========================================

-- 1. Seed Roles
INSERT INTO roles (id, name) VALUES 
(1, 'admin'),
(2, 'doctor'),
(3, 'patient'),
(4, 'nurse')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 2. Seed Initial Users (Passwords: admin123, doctor123, patient123, nurse123)
INSERT INTO users (id, name, email, password, role_id, status, profile_image) VALUES
(1, 'Admin Lakmal Perera', 'admin@medicare.com', '$2b$10$tZ2cK.2.sP8WpE91l9HkUe8H7sYl7R0FzOa1f81v2s7q4G6l9pLpL', 1, 'Active', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'),
(2, 'Dr. Sarath Jayasekara', 'sarath@medicare.com', '$2b$10$tZ2cK.2.sP8WpE91l9HkUe8H7sYl7R0FzOa1f81v2s7q4G6l9pLpL', 2, 'Active', 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150'),
(3, 'Patient Oshan Perera', 'oshan@medicare.com', '$2b$10$tZ2cK.2.sP8WpE91l9HkUe8H7sYl7R0FzOa1f81v2s7q4G6l9pLpL', 3, 'Active', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'),
(4, 'Nurse Amaya Perera', 'amaya@medicare.com', '$2b$10$tZ2cK.2.sP8WpE91l9HkUe8H7sYl7R0FzOa1f81v2s7q4G6l9pLpL', 4, 'Active', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150')
ON DUPLICATE KEY UPDATE name=VALUES(name), email=VALUES(email), password=VALUES(password), role_id=VALUES(role_id), status=VALUES(status);

-- 3. Seed Departments
INSERT INTO departments (id, name, head_doctor_id, room_count, staff_count, description) VALUES
(1, 'Cardiology', 1, 15, 8, 'Specialized care for heart, blood vessels and advanced cardiology surgery.'),
(2, 'Neurology', NULL, 12, 6, 'Expert diagnosis and therapy for brain, spine and central nervous system disorders.'),
(3, 'Pediatrics', NULL, 20, 14, 'Comprehensive healthcare services for newborns, infants, children and teens.'),
(4, 'Orthopedics', NULL, 18, 10, 'Advanced bone, joint, muscle repairs and physiotherapy procedures.'),
(5, 'Emergency', NULL, 30, 25, '24/7 highly equipped trauma and critical immediate care unit.'),
(6, 'ICU', NULL, 10, 15, 'Intensive care unit tracking and stabilizing unstable critical patients.')
ON DUPLICATE KEY UPDATE name=VALUES(name), room_count=VALUES(room_count), staff_count=VALUES(staff_count), description=VALUES(description);

-- 4. Seed Doctors
INSERT INTO doctors (id, user_id, name, department_id, specialization, experience, availability, contact, rating, bio, qualification, consultation_hours) VALUES
(1, 2, 'Dr. Sarath Jayasekara', 1, 'Cardiologist', 12, 'Available', '0771234567', 4.9, 'Experienced cardiologist specializing in clinical cardiology, vascular disease treatments, and critical care.', 'MD, FACC, Board Certified Cardiologist', '08:00 AM - 04:00 PM')
ON DUPLICATE KEY UPDATE name=VALUES(name), department_id=VALUES(department_id), specialization=VALUES(specialization), experience=VALUES(experience), availability=VALUES(availability), contact=VALUES(contact), rating=VALUES(rating);

-- Set department head doctor to point to Dr. Sarath
UPDATE departments SET head_doctor_id = 1 WHERE id = 1;

-- 5. Seed Patients (and their corresponding login users)
INSERT INTO patients (id, user_id, name, age, gender, address, phone, email, blood_group, allergies, chronic_conditions, emergency_contact, status, assigned_doctor_id) VALUES
(1, 3, 'Oshan Perera', 28, 'Male', '123 Highlevel Road, Homagama', '0711122334', 'oshan@medicare.com', 'A+', 'Dust, Penicillin', 'None', 'Kavindu Perera (Brother) - 0719876543', 'Admitted', 1)
ON DUPLICATE KEY UPDATE name=VALUES(name), age=VALUES(age), gender=VALUES(gender), address=VALUES(address), phone=VALUES(phone), email=VALUES(email), blood_group=VALUES(blood_group), allergies=VALUES(allergies), chronic_conditions=VALUES(chronic_conditions), emergency_contact=VALUES(emergency_contact), status=VALUES(status), assigned_doctor_id=VALUES(assigned_doctor_id);

-- Additional mock patient users for dashboard analytic lists
INSERT INTO users (id, name, email, password, role_id, status, profile_image) VALUES
(5, 'Nimal Perera', 'nimal@example.com', '$2b$10$tZ2cK.2.sP8WpE91l9HkUe8H7sYl7R0FzOa1f81v2s7q4G6l9pLpL', 3, 'Active', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'),
(6, 'Sanduni Silva', 'sanduni@example.com', '$2b$10$tZ2cK.2.sP8WpE91l9HkUe8H7sYl7R0FzOa1f81v2s7q4G6l9pLpL', 3, 'Active', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'),
(7, 'Kavindu Fernando', 'kavindu@example.com', '$2b$10$tZ2cK.2.sP8WpE91l9HkUe8H7sYl7R0FzOa1f81v2s7q4G6l9pLpL', 3, 'Active', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150'),
(8, 'Chamika Jayawardena', 'chamika@example.com', '$2b$10$tZ2cK.2.sP8WpE91l9HkUe8H7sYl7R0FzOa1f81v2s7q4G6l9pLpL', 3, 'Active', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150')
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO patients (id, user_id, name, age, gender, address, phone, email, blood_group, allergies, chronic_conditions, emergency_contact, status, assigned_doctor_id) VALUES
(2, 5, 'Nimal Perera', 45, 'Male', '45 Galle Road, Colombo', '0777123456', 'nimal@example.com', 'O+', 'None', 'Hypertension', 'Priyanthi Perera (Wife) - 0777112233', 'Admitted', 1),
(3, 6, 'Sanduni Silva', 32, 'Female', '78 Kandy Road, Kadawatha', '0714567890', 'sanduni@example.com', 'B-', 'Sulfa Drugs', 'Asthma', 'Sunil Silva (Father) - 0714445566', 'Discharged', 1),
(4, 7, 'Kavindu Fernando', 29, 'Male', '12 Negombo Road, Wattala', '0751234567', 'kavindu@example.com', 'AB+', 'Peanuts', 'None', 'Nishanthi Fernando (Mother) - 0759998877', 'Emergency', 1),
(5, 8, 'Chamika Jayawardena', 55, 'Male', '89 Highlevel Road, Nugegoda', '0729876543', 'chamika@example.com', 'O-', 'Aspirin', 'Diabetes', 'Dilini Jayawardena (Daughter) - 0725556677', 'Admitted', 1)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 6. Seed Nurses
INSERT INTO nurses (id, user_id, name, employee_id, department_id, qualification, experience, contact) VALUES
(1, 4, 'Nurse Amaya Perera', 'NUR-2024-0091', 1, 'BSc. in Nursing, Registered Nurse (RN)', 5, '0779876543')
ON DUPLICATE KEY UPDATE name=VALUES(name), employee_id=VALUES(employee_id), department_id=VALUES(department_id), qualification=VALUES(qualification), experience=VALUES(experience);

-- 7. Seed Appointments
INSERT INTO appointments (id, patient_id, doctor_id, date, time, status, payment_status, type, notes, department_id) VALUES
(1, 1, 1, '2026-05-31', '10:00:00', 'Upcoming', 'Paid', 'Consultation', 'Regular follow-up consultation on cardiology progress.', 1),
(2, 2, 1, '2026-05-30', '09:00:00', 'Completed', 'Paid', 'Follow-up Visit', 'Check blood pressure levels and adjust heart medication.', 1),
(3, 3, 1, '2026-05-30', '11:00:00', 'Pending', 'Pending', 'ECG Test', 'Standard electrocardiogram scan for chest pains.', 1),
(4, 4, 1, '2026-05-30', '10:00:00', 'Confirmed', 'Paid', 'Consultation', 'Emergency follow up regarding acute hypertension.', 1),
(5, 5, 1, '2026-05-30', '14:00:00', 'Confirmed', 'Paid', 'Consultation', 'Diabetic neuropathy review and health checks.', 1)
ON DUPLICATE KEY UPDATE patient_id=VALUES(patient_id), doctor_id=VALUES(doctor_id), date=VALUES(date), time=VALUES(time);

-- 8. Seed Billing invoices
INSERT INTO billing (id, patient_id, invoice_id, date, amount, status, insurance_claims, payment_history) VALUES
(1, 1, 'INV-2026-001', '2026-05-30', 2500.00, 'Paid', 'None', 'Paid via Visa card ending in 4522 on 2026-05-30.'),
(2, 2, 'INV-2026-002', '2026-05-28', 5000.00, 'Paid', 'Ceylinco Life (70%)', 'Paid client co-payment via cash. Insurance claimed successfully.'),
(3, 3, 'INV-2026-003', '2026-05-30', 1500.00, 'Pending', 'None', 'Invoice generated. Pending online portal payment.'),
(4, 4, 'INV-2026-004', '2026-05-29', 10000.00, 'Paid', 'AIA Insurance (100%)', 'Direct insurance billing settlement completed on 2026-05-29.')
ON DUPLICATE KEY UPDATE patient_id=VALUES(patient_id), invoice_id=VALUES(invoice_id), date=VALUES(date), amount=VALUES(amount), status=VALUES(status);

-- 9. Seed Medical Records
INSERT INTO medical_records (id, patient_id, record_name, date, doctor_id, status, file_url, diagnosis, treatment, notes) VALUES
(1, 1, 'Cardiovascular Screening Report', '2026-05-13', 1, 'Final', '#', 'Slightly elevated cardiovascular pressure. Standard cholesterol levels.', 'Moderate workout regimen, diet adjustments, Lipitor 10mg daily.', 'Patient feels healthy. Follow up scheduled in two weeks.'),
(2, 2, 'ECG Scan and Heartbeat Trace', '2026-05-10', 1, 'Final', '#', 'Normal sinus rhythm with mild sinus arrhythmia.', 'Continue regular heart support medication. Limit caffeinated intake.', 'Report printed and handed over to family member.')
ON DUPLICATE KEY UPDATE patient_id=VALUES(patient_id), record_name=VALUES(record_name);

-- 10. Seed Medications Inventory
INSERT INTO medications (id, name, description, dosage_form, standard_dosage) VALUES
(1, 'Atorvastatin (Lipitor)', 'Cholesterol lowering drug.', 'Tablet', '10mg once daily at night'),
(2, 'Metformin (Glucophage)', 'Oral diabetes medicine that helps control blood sugar levels.', 'Tablet', '500mg twice daily with meals'),
(3, 'Lisinopril (Zestril)', 'ACE inhibitor used to treat high blood pressure.', 'Tablet', '10mg once daily in the morning'),
(4, 'Amoxicillin (Amoxil)', 'Penicillin-type antibiotic used to treat bacterial infections.', 'Capsule', '500mg three times daily for 7 days')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 11. Seed Conversations/Messages
INSERT INTO messages (id, sender_id, receiver_id, content, timestamp, voice_url, file_url, is_emergency) VALUES
(1, 3, 2, 'Good morning Doctor Sarath, I wanted to double check my follow-up time.', '2026-05-30 08:30:00', NULL, NULL, 0),
(2, 2, 3, 'Hello Oshan, yes your follow-up appointment is set for tomorrow at 10:00 AM in cardiology room 101.', '2026-05-30 08:45:00', NULL, NULL, 0),
(3, 4, 2, 'Dr. Sarath, patient Nimal Perera in room 102 has high blood pressure of 160/95. Please advise.', '2026-05-30 09:15:00', NULL, NULL, 1)
ON DUPLICATE KEY UPDATE sender_id=VALUES(sender_id), receiver_id=VALUES(receiver_id), content=VALUES(content);

-- 12. Seed Alerts / Notifications
INSERT INTO notifications (id, user_id, message, is_read, timestamp) VALUES
(1, 3, 'Your appointment with Dr. Sarath Jayasekara has been scheduled for May 31 at 10:00 AM.', 0, '2026-05-30 08:00:00'),
(2, 2, 'New consultation scheduled: Oshan Perera tomorrow at 10:00 AM.', 0, '2026-05-30 08:05:00'),
(3, 4, 'Shift alert: Urgent patient admission in Room 106. Please review tasks.', 0, '2026-05-30 08:15:00')
ON DUPLICATE KEY UPDATE user_id=VALUES(user_id), message=VALUES(message);

-- 13. Seed Prescriptions
INSERT INTO prescriptions (id, patient_id, doctor_id, date, follow_up_date, instructions, signature_url) VALUES
(1, 1, 1, '2026-05-13', '2026-05-31', 'Please ensure you take medicines strictly after meals and monitor your heart rate regularly.', 'Dr. Sarath Jayasekara Digital Sig')
ON DUPLICATE KEY UPDATE patient_id=VALUES(patient_id), doctor_id=VALUES(doctor_id);

-- 14. Seed Prescription Items
INSERT INTO prescription_items (id, prescription_id, medicine, dosage, duration, frequency) VALUES
(1, 1, 'Atorvastatin (Lipitor)', '10mg', '30 Days', 'Once daily at night'),
(2, 1, 'Lisinopril (Zestril)', '10mg', '30 Days', 'Once daily in the morning')
ON DUPLICATE KEY UPDATE prescription_id=VALUES(prescription_id), medicine=VALUES(medicine);

-- 15. Seed Analytical Reports
INSERT INTO reports (id, category, title, created_by, filepath, data) VALUES
(1, 'Revenue Reports', 'Hospital Monthly Earnings - May 2026', 1, '#', '{"total_revenue": 1450000.00, "growth_percentage": 12.5}'),
(2, 'Patient Reports', 'Patient Admissions and Discharge Rates', 1, '#', '{"total_admissions": 542, "critical_patients": 24}')
ON DUPLICATE KEY UPDATE category=VALUES(category), title=VALUES(title);

-- 16. Seed Hospital Settings
INSERT INTO settings (id, key_name, val_value, category) VALUES
(1, 'hospital_name', 'MediCare Hospital', 'General'),
(2, 'hospital_logo', 'default_logo.png', 'General'),
(3, 'hospital_address', '123 Highlevel Road, Homagama', 'General'),
(4, 'hospital_contact', '0112752049', 'General'),
(5, 'sms_notifications', 'Enabled', 'System'),
(6, 'email_notifications', 'Enabled', 'System'),
(7, 'dark_mode', 'Disabled', 'Appearance'),
(8, 'theme_color', 'Blue', 'Appearance')
ON DUPLICATE KEY UPDATE key_name=VALUES(key_name), val_value=VALUES(val_value);

-- 17. Seed Nurse Tasks
INSERT INTO tasks (id, task_name, patient_id, room, priority, status, assigned_to_nurse_id, notes, reminder_time) VALUES
(1, 'Check Vital Signs', 2, 'Room 101', 'High', 'Completed', 1, 'Check blood pressure, pulse, and oxygen saturation. Note down on shift file.', '2026-05-30 09:00:00'),
(2, 'Medication Administration', 7, 'Room 102', 'High', 'Pending', 1, 'Administer heart pills Zestril 10mg. Patient needs post-meal support.', '2026-05-30 10:00:00'),
(3, 'Blood Test Collection', 6, 'Room 103', 'Medium', 'Pending', 1, 'Collect blood samples for full count profile (FBC) test and send to lab.', '2026-05-30 11:00:00'),
(4, 'Patient Discharge Assistance', 8, 'Room 104', 'Low', 'Completed', 1, 'Help patient with clearance and hand over medication files.', '2026-05-30 14:00:00')
ON DUPLICATE KEY UPDATE task_name=VALUES(task_name);
