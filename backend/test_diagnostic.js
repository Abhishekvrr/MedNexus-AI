import dotenv from "dotenv";
dotenv.config();

import pool, { query } from "./src/config/database.js";
import jwt from "jsonwebtoken";

const BASE_URL = `http://localhost:${process.env.PORT || 5000}`;

async function runDiagnostic() {
  console.log("==================================================");
  console.log("   MEDNEXUS AI BACKEND DIAGNOSTIC TEST SUITE     ");
  console.log("==================================================");
  console.log(`Target URL: ${BASE_URL}\n`);

  let passed = 0;
  let failed = 0;
  let skipped = 0;

  function report(testName, isSuccess, details = "") {
    if (isSuccess) {
      console.log(`[PASS] ${testName} ${details ? "- " + details : ""}`);
      passed++;
    } else {
      console.log(`[FAIL] ${testName} ${details ? "- " + details : ""}`);
      failed++;
    }
  }

  // 1. Check HTTP Root
  try {
    const res = await fetch(`${BASE_URL}/`);
    const data = await res.json();
    report("1. Root Endpoint GET /", res.status === 200 && data.success === true, `Status: ${res.status}, Service: ${data.service}`);
  } catch (err) {
    report("1. Root Endpoint GET /", false, err.message);
  }

  // 2. Check Health API
  try {
    const res = await fetch(`${BASE_URL}/api/health`);
    const data = await res.json();
    report(
      "2. Health Check GET /api/health",
      res.status === 200 && data.success === true && data.database?.connected === true,
      `Database Connected: ${data.database?.connected}, Status: ${data.status}`
    );
  } catch (err) {
    report("2. Health Check GET /api/health", false, err.message);
  }

  // 3. Check Database Direct Connectivity & Tables
  let testUser = null;
  let testPatient = null;
  let testDoctor = null;
  let authToken = null;
  let doctorToken = null;

  try {
    const tablesRes = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    const tableNames = tablesRes.rows.map(r => r.table_name);
    report("3. Database Schema Verification", tableNames.length > 0, `Found ${tableNames.length} tables: ${tableNames.join(", ")}`);

    // Fetch existing users to test authentication and role-based endpoints
    const usersRes = await query(`
      SELECT u.id, u.email, u.full_name, u.role, u.is_active, p.id as patient_id, d.id as doctor_id
      FROM users u
      LEFT JOIN patients p ON u.id = p.user_id
      LEFT JOIN doctors d ON u.id = d.user_id
      ORDER BY u.id ASC
    `);

    console.log(`\nFound ${usersRes.rows.length} existing users in database.`);
    for (const u of usersRes.rows) {
      console.log(`  - ID: ${u.id}, Email: ${u.email}, Role: ${u.role}, Patient ID: ${u.patient_id || 'N/A'}, Doctor ID: ${u.doctor_id || 'N/A'}`);
      if (!testUser && u.role === 'patient') testUser = u;
      if (!testDoctor && u.role === 'doctor') testDoctor = u;
    }

    if (!testUser && usersRes.rows.length > 0) {
      testUser = usersRes.rows[0];
    }
  } catch (err) {
    report("3. Database Schema & Users Query", false, err.message);
  }

  // 4. Generate JWT Token for authenticated tests
  if (testUser) {
    authToken = jwt.sign(
      { id: testUser.id, email: testUser.email, role: testUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    report("4. JWT Generation for Patient", true, `Generated for user ${testUser.email} (id: ${testUser.id})`);
  } else {
    report("4. JWT Generation for Patient", false, "No user available to generate token");
  }

  if (testDoctor) {
    doctorToken = jwt.sign(
      { id: testDoctor.id, email: testDoctor.email, role: testDoctor.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    report("4b. JWT Generation for Doctor", true, `Generated for doctor ${testDoctor.email} (id: ${testDoctor.id})`);
  }

  const authHeaders = authToken ? { Authorization: `Bearer ${authToken}` } : {};

  // 5. Test Auth Endpoint (Bad Login test)
  try {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "invalid_nonexistent_user@mednexus.test", password: "wrongpassword" })
    });
    const data = await res.json();
    report("5. Auth Protection (Reject Invalid Login)", res.status === 401 && data.success === false, `Response Status: ${res.status}`);
  } catch (err) {
    report("5. Auth Protection", false, err.message);
  }

  // 6. Test Patient Profile GET /api/patients/profile
  try {
    const res = await fetch(`${BASE_URL}/api/patients/profile`, { headers: authHeaders });
    const data = await res.json();
    report("6. Patient Profile GET /api/patients/profile", res.status === 200 || res.status === 404, `Status: ${res.status}, Success: ${data.success}`);
  } catch (err) {
    report("6. Patient Profile GET /api/patients/profile", false, err.message);
  }

  // 7. Test Dashboard GET /api/dashboard
  try {
    const res = await fetch(`${BASE_URL}/api/dashboard`, { headers: authHeaders });
    const data = await res.json();
    report("7. Dashboard GET /api/dashboard", res.status === 200, `Status: ${res.status}, Success: ${data.success}`);
  } catch (err) {
    report("7. Dashboard GET /api/dashboard", false, err.message);
  }

  // 8. Test Appointments GET /api/appointments
  try {
    const res = await fetch(`${BASE_URL}/api/appointments`, { headers: authHeaders });
    const data = await res.json();
    report("8. Appointments GET /api/appointments", res.status === 200, `Status: ${res.status}, Count: ${data.appointments?.length ?? data.length ?? 'N/A'}`);
  } catch (err) {
    report("8. Appointments GET /api/appointments", false, err.message);
  }

  // 9. Test Medical Records GET /api/medical-records
  try {
    const res = await fetch(`${BASE_URL}/api/medical-records`, { headers: authHeaders });
    const data = await res.json();
    report("9. Medical Records GET /api/medical-records", res.status === 200, `Status: ${res.status}, Success: ${data.success}`);
  } catch (err) {
    report("9. Medical Records GET /api/medical-records", false, err.message);
  }

  // 10. Test Lab Reports GET /api/lab-reports
  try {
    const res = await fetch(`${BASE_URL}/api/lab-reports`, { headers: authHeaders });
    const data = await res.json();
    report("10. Lab Reports GET /api/lab-reports", res.status === 200, `Status: ${res.status}, Success: ${data.success}`);
  } catch (err) {
    report("10. Lab Reports GET /api/lab-reports", false, err.message);
  }

  // 11. Test Prescriptions GET /api/prescriptions
  try {
    const res = await fetch(`${BASE_URL}/api/prescriptions`, { headers: authHeaders });
    const data = await res.json();
    report("11. Prescriptions GET /api/prescriptions", res.status === 200, `Status: ${res.status}, Success: ${data.success}`);
  } catch (err) {
    report("11. Prescriptions GET /api/prescriptions", false, err.message);
  }

  // 12. Test Health Metrics GET /api/health-metrics
  try {
    const res = await fetch(`${BASE_URL}/api/health-metrics`, { headers: authHeaders });
    const data = await res.json();
    report("12. Health Metrics GET /api/health-metrics", res.status === 200, `Status: ${res.status}, Success: ${data.success}`);
  } catch (err) {
    report("12. Health Metrics GET /api/health-metrics", false, err.message);
  }

  // 13. Test Family Members GET /api/family
  try {
    const res = await fetch(`${BASE_URL}/api/family`, { headers: authHeaders });
    const data = await res.json();
    report("13. Family Members GET /api/family", res.status === 200, `Status: ${res.status}, Success: ${data.success}`);
  } catch (err) {
    report("13. Family Members GET /api/family", false, err.message);
  }

  // 14. Test Hospitals GET /api/hospitals
  try {
    const res = await fetch(`${BASE_URL}/api/hospitals`, { headers: authHeaders });
    const data = await res.json();
    report("14. Hospitals GET /api/hospitals", res.status === 200, `Status: ${res.status}, Hospitals count: ${data.hospitals?.length ?? data.length ?? 0}`);
  } catch (err) {
    report("14. Hospitals GET /api/hospitals", false, err.message);
  }

  // 15. Test Notifications GET /api/notifications
  try {
    const res = await fetch(`${BASE_URL}/api/notifications`, { headers: authHeaders });
    const data = await res.json();
    report("15. Notifications GET /api/notifications", res.status === 200, `Status: ${res.status}, Success: ${data.success}`);
  } catch (err) {
    report("15. Notifications GET /api/notifications", false, err.message);
  }

  // 16. Test Doctor Patients Route (if doctor available)
  if (doctorToken) {
    try {
      const res = await fetch(`${BASE_URL}/api/doctor/patients`, {
        headers: { Authorization: `Bearer ${doctorToken}` }
      });
      const data = await res.json();
      report("16. Doctor Patients GET /api/doctor/patients", res.status === 200, `Status: ${res.status}, Success: ${data.success}`);
    } catch (err) {
      report("16. Doctor Patients GET /api/doctor/patients", false, err.message);
    }
  }

  // 17. Test AI Health Analysis POST /api/ai/analyze
  try {
    console.log("\nTesting AI Analysis Module (POST /api/ai/analyze)...");
    const aiRes = await fetch(`${BASE_URL}/api/ai/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders
      },
      body: JSON.stringify({
        symptoms: "I have had a mild headache and fatigue for the past 2 days."
      })
    });
    const aiData = await aiRes.json();
    if (aiRes.status === 200 && aiData.success) {
      report("17. AI Health Analysis POST /api/ai/analyze", true, `Analysis successfully generated! Model: Groq`);
    } else {
      report("17. AI Health Analysis POST /api/ai/analyze", false, `Status: ${aiRes.status}, Message: ${aiData.message || aiData.error}`);
    }
  } catch (err) {
    report("17. AI Health Analysis POST /api/ai/analyze", false, err.message);
  }

  console.log("\n==================================================");
  console.log(`DIAGNOSTIC SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log("==================================================");

  await pool.end();
  process.exit(failed > 0 ? 1 : 0);
}

runDiagnostic();
