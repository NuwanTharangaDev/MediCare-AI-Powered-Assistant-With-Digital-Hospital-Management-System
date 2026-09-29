const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const env = process.env;

let pool = null;
let useLocalFallback = false;
const localDbPath = path.join(__dirname, '../../database/local_db.json');

// Memory store structure representing the 17 tables
let localStore = {};


// Initialize Local JSON DB if not exists
function initLocalDb() {
  try {
    const parentDir = path.dirname(localDbPath);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }
    if (!fs.existsSync(localDbPath)) {
      localStore = { ...defaultSeed };
      fs.writeFileSync(localDbPath, JSON.stringify(localStore, null, 2), 'utf8');
      console.log('Seeded Local JSON Database successfully at:', localDbPath);
    } else {
      const data = fs.readFileSync(localDbPath, 'utf8');
      localStore = JSON.parse(data);
      console.log('Loaded Local JSON Database successfully from:', localDbPath);
    }
  } catch (err) {
    console.error('Failed to initialize local JSON DB:', err.message);
    localStore = { ...defaultSeed };
  }
}

function saveLocalDb() {
  try {
    fs.writeFileSync(localDbPath, JSON.stringify(localStore, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to save local JSON DB:', err.message);
  }
}

// Simple SQL simulator for Local JSON fallback using alasql
function executeLocalQuery(sql, params = []) {
  const alasql = require('alasql');

  // Custom standard functions
  if (!alasql.fn.CONCAT) {
    alasql.fn.CONCAT = function(...args) {
      return args.join('');
    };
  }

  // Preprocess SQL for alasql compatibility
  let processedSql = sql;

  // Replace CURRENT_DATE with today's date literal 'YYYY-MM-DD'
  const todayStr = "'" + new Date().toISOString().substring(0, 10) + "'";
  processedSql = processedSql.replace(/\bCURRENT_DATE\b/gi, todayStr);

  // Remove SEPARATOR from GROUP_CONCAT as alasql default separator is comma and SEPARATOR syntax might fail parser
  processedSql = processedSql.replace(/SEPARATOR\s+['"].*?['"]/gi, '');

  // Intercept SHOW TABLES
  if (processedSql.toUpperCase().includes('SHOW TABLES')) {
    return [
      { 'Tables_in_medical_hms': 'users' },
      { 'Tables_in_medical_hms': 'patients' },
      { 'Tables_in_medical_hms': 'doctors' },
      { 'Tables_in_medical_hms': 'nurses' }
    ];
  }

  // Load latest localStore datasets into alasql tables
  for (const tableName of Object.keys(localStore)) {
    alasql('DROP TABLE IF EXISTS ' + tableName);
    alasql('CREATE TABLE ' + tableName);
    alasql.tables[tableName].data = JSON.parse(JSON.stringify(localStore[tableName] || []));
  }


  let results;
  try {
    results = alasql(processedSql, params);
  } catch (err) {
    console.error('--- ALASQL ERROR ---');
    console.error('Original SQL:', sql);
    console.error('Processed SQL:', processedSql);
    console.error('Params:', params);
    console.error('Error Message:', err.message);
    console.error('--------------------');
    throw err;
  }

  // Sync data back to localStore if table modification occurred
  const upperSql = sql.trim().toUpperCase();
  if (upperSql.startsWith('INSERT') || upperSql.startsWith('UPDATE') || upperSql.startsWith('DELETE')) {
    for (const tableName of Object.keys(localStore)) {
      if (alasql.tables[tableName] && alasql.tables[tableName].data) {
        localStore[tableName] = JSON.parse(JSON.stringify(alasql.tables[tableName].data));
      }
    }
    saveLocalDb();

    if (upperSql.startsWith('INSERT')) {
      const tableMatch = sql.trim().match(/INSERT\s+INTO\s+(\w+)/i);
      if (tableMatch) {
        const tableName = tableMatch[1].toLowerCase();
        const tableData = localStore[tableName] || [];
        const maxId = tableData.reduce((max, r) => (r.id > max ? r.id : max), 0);
        return { insertId: maxId, affectedRows: 1 };
      }
      return { insertId: 1, affectedRows: 1 };
    }
    return { affectedRows: 1 };
  }

  // Ensure deep copy for SELECT queries to avoid reference leakage
  return JSON.parse(JSON.stringify(results || []));
}

// Establish DB connection
async function connectDb() {
  try {
    pool = mysql.createPool({
      host: env.DB_HOST || 'localhost',
      user: env.DB_USER || 'root',
      password: env.DB_PASSWORD || '',
      database: env.DB_NAME || 'medical_hms',
      port: env.DB_PORT || 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    
    // Quick validation test
    const conn = await pool.getConnection();
    console.log('Successfully connected to MySQL Database!');
    conn.release();
    useLocalFallback = false;
  } catch (err) {
    console.warn(`\n[WARNING] MySQL connection failed: "${err.message}".`);
    console.warn(`[SYSTEM] Seamlessly falling back to persistent Local JSON Database engine!\n`);
    useLocalFallback = true;
    initLocalDb();
  }
}

connectDb();

module.exports = {
  query: async (sql, params = []) => {
    if (useLocalFallback) {
      return executeLocalQuery(sql, params);
    }
    try {
      const [results] = await pool.query(sql, params);
      return results;
    } catch (err) {
      console.error('MySQL database query error:', err.message);
      // fallback in-flight to prevent backend crashes
      if (!useLocalFallback) {
        console.warn('Attempting local DB fallback on active failure...');
        useLocalFallback = true;
        initLocalDb();
        return executeLocalQuery(sql, params);
      }
      throw err;
    }
  },
  isFallback: () => useLocalFallback
};