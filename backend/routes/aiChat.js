const express = require('express');
const rateLimit = require('express-rate-limit');
const optionalAuth = require('../middleware/optionalAuth');
const { findMatches } = require('../config/assistantFaq');
const { generateReply, getHospitalFactReply, getSafetyReply, isHospitalQuestion, isMedicalQuestion } = require('../services/aiAssistant');
const { getOwnPatientDataReply, isPersonalDataQuestion, loadHospitalContext } = require('../services/hospitalData');

const router = express.Router();
const MAX_MESSAGE_LENGTH = 4000;
const MAX_HISTORY_MESSAGES = 12;
const MAX_HISTORY_MESSAGE_LENGTH = 1500;
const rateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 12,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'Too many chat requests. Please wait a minute and try again.' }
});

function sanitizeHistory(history) {
  if (!Array.isArray(history)) return [];
  return history.slice(-MAX_HISTORY_MESSAGES).flatMap((item) => {
    if (!item || !['user', 'assistant'].includes(item.role) || typeof item.content !== 'string') return [];
    const content = item.content.trim().slice(0, MAX_HISTORY_MESSAGE_LENGTH);
    return content ? [{ role: item.role, content }] : [];
  });
}

function navigationActions(message, role) {
  const lower = message.toLowerCase();
  const roleActions = {
    guest: [
      [/(appointment|book|schedule|doctor|visit)/, 'Sign in to book an appointment', 'Login'],
      [/(medical record|test result|health record)/, 'Sign in to view Medical Records', 'Login'],
      [/(prescription|medicine|medication)/, 'Sign in to view Prescriptions', 'Login'],
      [/(billing|invoice|payment)/, 'Sign in to view Billing', 'Login'],
      [/(profile|personal details|account details)/, 'Sign in to open your Profile', 'Login']
    ],
    patient: [
      [/(appointment|book|schedule|doctor|visit)/, 'Open Appointments', 'Appointments'],
      [/(medical record|test result|health record)/, 'Open Medical Records', 'Medical Records'],
      [/(prescription|medicine|medication)/, 'Open Prescriptions', 'Prescriptions'],
      [/(billing|invoice|payment)/, 'Open Billing', 'Billing'],
      [/(profile|personal details|account details)/, 'Open Profile', 'Profile']
    ],
    doctor: [
      [/(appointment|schedule|consultation)/, 'Open My Schedule', 'My Schedule'],
      [/(patient|case|medical record)/, 'Open Patients', 'Patients'],
      [/(prescription|medicine)/, 'Open Prescriptions', 'Prescriptions'],
      [/(billing|invoice|payment)/, 'Open Billing', 'Billing'],
      [/(message|chat)/, 'Open Messages', 'Messages'],
      [/(profile|account)/, 'Open Profile', 'Profile']
    ],
    nurse: [
      [/(task|shift|duty)/, 'Open My Tasks', 'My Tasks'],
      [/(patient|ward)/, 'Open Patients', 'Patients'],
      [/(appointment|schedule)/, 'Open Appointments', 'Appointments'],
      [/(medication|medicine)/, 'Open Medication Management', 'Medication Management'],
      [/(report|incident)/, 'Open Reports', 'Reports'],
      [/(message|chat)/, 'Open Messages', 'Messages']
    ],
    admin: [
      [/(appointment|booking)/, 'Open Appointments', 'Appointments'],
      [/(patient)/, 'Open Patients', 'Patients'],
      [/(doctor)/, 'Open Doctors', 'Doctors'],
      [/(department|service)/, 'Open Departments', 'Departments'],
      [/(user|account|staff)/, 'Open Users', 'Users']
    ]
  };
  const action = (roleActions[role || 'guest'] || []).find(([pattern]) => pattern.test(lower));
  if (action) return [{ label: action[1], tab: action[2] }];
  return [];
}

router.post('/chat', rateLimiter, optionalAuth, async (req, res) => {
  const { message, history } = req.body || {};
  if (typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ success: false, message: 'Please enter a message for the assistant.' });
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return res.status(413).json({ success: false, message: `Messages must be ${MAX_MESSAGE_LENGTH} characters or fewer.` });
  }

  try {
    const normalizedMessage = message.trim();
    const safetyReply = getSafetyReply(normalizedMessage);
    let reply;
    let sources = [];

    if (safetyReply) {
      reply = safetyReply;
    } else if (isPersonalDataQuestion(normalizedMessage)) {
      reply = await getOwnPatientDataReply(req.user, normalizedMessage);
    } else if (isHospitalQuestion(normalizedMessage)) {
      const context = await loadHospitalContext();
      reply = getHospitalFactReply(normalizedMessage, context)
        || findMatches(normalizedMessage)[0]?.answer
        || "I don't have that information in the hospital system. Please contact the hospital reception for accurate information.";
    } else {
      const result = await generateReply({
        message: normalizedMessage,
        history: sanitizeHistory(history),
        enableGoogleSearch: process.env.GEMINI_ENABLE_GOOGLE_SEARCH === 'true' && !isMedicalQuestion(normalizedMessage)
      });
      reply = result.reply;
      sources = result.sources;
    }

    return res.json({
      success: true,
      reply,
      actions: navigationActions(normalizedMessage, req.user?.role),
      sources
    });
  } catch (error) {
    console.error('[AI] Chat request failed:', error.message);
    return res.status(503).json({ success: false, message: 'Hospital information is temporarily unavailable. Please try again shortly.' });
  }
});

module.exports = router;