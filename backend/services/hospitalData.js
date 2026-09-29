const db = require('../config/db');
const defaultHospitalKnowledge = require('../config/hospitalKnowledge');

const allowedSettingKeys = new Map([
  ['hospital_name', 'name'],
  ['hospital_description', 'description'],
  ['hospital_address', 'address'],
  ['hospital_contact', 'contact'],
  ['hospital_opening_hours', 'openingHours'],
  ['hospital_services', 'services'],
  ['appointment_instructions', 'appointmentInstructions']
]);

async function loadHospitalContext() {
  const context = { ...defaultHospitalKnowledge };
  const [departments, doctors, settings] = await Promise.all([
    db.query('SELECT id, name, description FROM departments'),
    db.query('SELECT id, name, specialization, availability, consultation_hours, department_id FROM doctors'),
    db.query('SELECT key_name, val_value FROM settings WHERE key_name IN (?, ?, ?, ?, ?, ?, ?)', [
      'hospital_name', 'hospital_description', 'hospital_address', 'hospital_contact',
      'hospital_opening_hours', 'hospital_services', 'appointment_instructions'
    ])
  ]);

  for (const setting of settings) {
    const key = allowedSettingKeys.get(setting.key_name);
    if (key && setting.val_value) context[key] = setting.val_value;
  }

  context.departments = departments.map(({ name, description }) => ({ name, description }));
  context.services = Array.isArray(context.services)
    ? context.services
    : typeof context.services === 'string' && context.services.trim()
      ? context.services.split(',').map((service) => service.trim())
      : [];
  context.doctors = doctors.map(({ id, name, specialization, availability, consultation_hours, department_id }) => ({
    id,
    name,
    specialization,
    availability,
    consultationHours: consultation_hours,
    department: departments.find((department) => department.id === department_id)?.name || null
  }));
  return context;
}

function isPersonalDataQuestion(message) {
  return /\b(my|mine)\b.{0,60}\b(appointments?|visits?|medical records?|records?|prescriptions?|bills?|invoices?|profile|patient information|payment status|medical history)\b|\b(previous|past|upcoming|next)\s+(appointments?|visits?)\b|\bappointment\s+(history|status)\b/i.test(message);
}

async function getOwnPatientDataReply(user, message) {
  if (!user || user.role !== 'patient') {
    return 'Please sign in with your patient account to access personal appointment, record, prescription, billing, or profile information.';
  }

  const patients = await db.query('SELECT id FROM patients WHERE user_id = ?', [user.id]);
  const patientId = patients[0]?.id;
  if (!patientId) return 'I could not find a patient profile linked to your account. Please contact hospital reception.';

  const lower = message.toLowerCase();
  if (/(appointment|visit)/.test(lower)) {
    const appointments = await db.query(
      'SELECT a.date, a.time, a.status, a.type, d.name AS doctor_name, dep.name AS department_name FROM appointments a LEFT JOIN doctors d ON d.id = a.doctor_id LEFT JOIN departments dep ON dep.id = a.department_id WHERE a.patient_id = ? ORDER BY a.date DESC LIMIT 10',
      [patientId]
    );
    return appointments.length
      ? `Your recorded appointments are: ${appointments.map((item) => `${String(item.date).slice(0, 10)} at ${String(item.time || '').slice(0, 5)} with ${item.doctor_name || 'doctor not listed'}${item.department_name ? ` (${item.department_name})` : ''} - ${item.status}.`).join(' ')}`
      : 'There are no appointments recorded for your account.';
  }

  if (/(prescription|medicine|medication)/.test(lower)) {
    const prescriptions = await db.query(
      'SELECT p.date, p.follow_up_date, pi.medicine, pi.dosage, pi.duration, pi.frequency FROM prescriptions p LEFT JOIN prescription_items pi ON pi.prescription_id = p.id WHERE p.patient_id = ? ORDER BY p.date DESC LIMIT 20',
      [patientId]
    );
    return prescriptions.length
      ? `Your recorded prescriptions include: ${prescriptions.map((item) => `${item.medicine || 'medicine not listed'}${item.dosage ? ` (${item.dosage})` : ''}${item.frequency ? `, ${item.frequency}` : ''}${item.duration ? ` for ${item.duration}` : ''}.`).join(' ')} Follow your prescriber's instructions; I cannot recommend medication changes.`
      : 'There are no prescriptions recorded for your account.';
  }

  if (/(record|medical history)/.test(lower)) {
    const records = await db.query(
      'SELECT record_name, date, status FROM medical_records WHERE patient_id = ? ORDER BY date DESC LIMIT 10',
      [patientId]
    );
    return records.length
      ? `Your available medical records are: ${records.map((item) => `${item.record_name} (${String(item.date).slice(0, 10)}, ${item.status}).`).join(' ')}`
      : 'There are no medical records available for your account.';
  }

  if (/(bill|billing|invoice|payment)/.test(lower)) {
    const invoices = await db.query(
      'SELECT invoice_id, date, amount, status FROM billing WHERE patient_id = ? ORDER BY date DESC LIMIT 10',
      [patientId]
    );
    return invoices.length
      ? `Your billing records are: ${invoices.map((item) => `${item.invoice_id}: ${item.amount} (${item.status}, ${String(item.date).slice(0, 10)}).`).join(' ')}`
      : 'There are no billing records available for your account.';
  }

  const profiles = await db.query(
    'SELECT name, blood_group, status FROM patients WHERE id = ? AND user_id = ?',
    [patientId, user.id]
  );
  const profile = profiles[0];
  return profile
    ? `Your patient profile lists ${profile.name}, blood group ${profile.blood_group || 'not recorded'}, and status ${profile.status || 'not recorded'}. You can update available details in the Profile section.`
    : 'I could not find profile information for your account.';
}

module.exports = { getOwnPatientDataReply, isPersonalDataQuestion, loadHospitalContext };
