const FRONTEND_URL = "http://localhost:5173";
const BACKEND_URL = "http://localhost:5000";

async function testCoordination() {
  console.log("==================================================");
  console.log("  MEDNEXUS FRONTEND <-> BACKEND COORDINATION TEST ");
  console.log("==================================================");

  let passed = 0;
  let failed = 0;

  function report(name, ok, details = "") {
    if (ok) {
      console.log(`[PASS] ${name} ${details ? "- " + details : ""}`);
      passed++;
    } else {
      console.log(`[FAIL] ${name} ${details ? "- " + details : ""}`);
      failed++;
    }
  }

  // 1. Frontend Dev Server Check
  try {
    const res = await fetch(FRONTEND_URL);
    const html = await res.text();
    report("1. Frontend Server Live", res.status === 200 && html.includes("html"), `Status: ${res.status}`);
  } catch (err) {
    report("1. Frontend Server Live", false, err.message);
  }

  // 2. Patient Auth Flow (Login)
  let patientToken = null;
  let patientUser = null;
  try {
    const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "testpatient@mednexus.com",
        password: "MedNexus@2026"
      })
    });
    const data = await res.json();
    patientToken = data.token;
    patientUser = data.user;
    report("2. Patient Login Flow", res.status === 200 && Boolean(patientToken), `User: ${patientUser?.full_name} (${patientUser?.email})`);
  } catch (err) {
    report("2. Patient Login Flow", false, err.message);
  }

  // 3. Doctor Auth Flow (Login)
  let doctorToken = null;
  let doctorUser = null;
  try {
    const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "doctor@mednexus.com",
        password: "MedNexus@2026"
      })
    });
    const data = await res.json();
    doctorToken = data.token;
    doctorUser = data.user;
    report("3. Doctor Login Flow", res.status === 200 && Boolean(doctorToken), `User: ${doctorUser?.full_name} (${doctorUser?.email})`);
  } catch (err) {
    report("3. Doctor Login Flow", false, err.message);
  }

  const pHeaders = { Authorization: `Bearer ${patientToken}`, "Content-Type": "application/json" };
  const dHeaders = { Authorization: `Bearer ${doctorToken}`, "Content-Type": "application/json" };

  // 4. Patient Dashboard Data Fetch
  try {
    const res = await fetch(`${BACKEND_URL}/api/dashboard`, { headers: pHeaders });
    const data = await res.json();
    report("4. Dashboard Page API Coordination", res.status === 200 && data.success, `Has summary & stats`);
  } catch (err) {
    report("4. Dashboard Page API Coordination", false, err.message);
  }

  // 5. Patient Appointments & Doctors List for Booking
  try {
    const [dRes, aRes] = await Promise.all([
      fetch(`${BACKEND_URL}/api/doctors`, { headers: pHeaders }),
      fetch(`${BACKEND_URL}/api/appointments`, { headers: pHeaders })
    ]);
    const dData = await dRes.json();
    const aData = await aRes.json();
    report("5. Appointments Page Coordination", dRes.status === 200 && aRes.status === 200 && dData.success && aData.success, `Doctors: ${dData.count || dData.doctors?.length}, Appointments: ${aData.appointments?.length ?? 0}`);
  } catch (err) {
    report("5. Appointments Page Coordination", false, err.message);
  }

  // 6. Doctors Directory Page Coordination
  try {
    const res = await fetch(`${BACKEND_URL}/api/doctors`, { headers: pHeaders });
    const data = await res.json();
    report("6. Doctors Directory Page Coordination", res.status === 200 && data.success && Array.isArray(data.doctors), `Loaded ${data.doctors?.length} doctors`);
  } catch (err) {
    report("6. Doctors Directory Page Coordination", false, err.message);
  }

  // 7. Medical Records Page Coordination
  try {
    const res = await fetch(`${BACKEND_URL}/api/medical-records`, { headers: pHeaders });
    const data = await res.json();
    report("7. Medical Records Page Coordination", res.status === 200 && data.success, `Records: ${data.records?.length ?? 0}`);
  } catch (err) {
    report("7. Medical Records Page Coordination", false, err.message);
  }

  // 8. Prescriptions Page Coordination
  try {
    const res = await fetch(`${BACKEND_URL}/api/prescriptions`, { headers: pHeaders });
    const data = await res.json();
    report("8. Prescriptions Page Coordination", res.status === 200 && data.success, `Prescriptions: ${data.prescriptions?.length ?? 0}`);
  } catch (err) {
    report("8. Prescriptions Page Coordination", false, err.message);
  }

  // 9. Lab Reports Page Coordination
  try {
    const res = await fetch(`${BACKEND_URL}/api/lab-reports`, { headers: pHeaders });
    const data = await res.json();
    report("9. Lab Reports Page Coordination", res.status === 200 && data.success, `Reports: ${data.reports?.length ?? 0}`);
  } catch (err) {
    report("9. Lab Reports Page Coordination", false, err.message);
  }

  // 10. Health Metrics Page Coordination
  try {
    const res = await fetch(`${BACKEND_URL}/api/health-metrics`, { headers: pHeaders });
    const data = await res.json();
    report("10. Health Metrics Page Coordination", res.status === 200 && data.success, `Metrics count: ${data.metrics?.length ?? 0}`);
  } catch (err) {
    report("10. Health Metrics Page Coordination", false, err.message);
  }

  // 11. Family Page Coordination
  try {
    const res = await fetch(`${BACKEND_URL}/api/family`, { headers: pHeaders });
    const data = await res.json();
    report("11. Family Page Coordination", res.status === 200 && data.success, `Members: ${data.members?.length ?? 0}`);
  } catch (err) {
    report("11. Family Page Coordination", false, err.message);
  }

  // 12. AI Assistant Page Coordination
  try {
    const res = await fetch(`${BACKEND_URL}/api/ai/analyze`, {
      method: "POST",
      headers: pHeaders,
      body: JSON.stringify({ symptoms: "I feel fatigued and have a slight fever." })
    });
    const data = await res.json();
    report("12. AI Assistant Page Coordination", res.status === 200 && data.success && Boolean(data.analysis), `Risk Level: ${data.analysis?.risk_level}, Recommendation: ${data.analysis?.doctor_recommendation?.specialty}`);
  } catch (err) {
    report("12. AI Assistant Page Coordination", false, err.message);
  }

  // 13. Notifications Page Coordination
  try {
    const res = await fetch(`${BACKEND_URL}/api/notifications`, { headers: pHeaders });
    const data = await res.json();
    report("13. Notifications Page Coordination", res.status === 200 && data.success, `Notifications: ${data.notifications?.length ?? 0}`);
  } catch (err) {
    report("13. Notifications Page Coordination", false, err.message);
  }

  // 14. Patient Profile Page Coordination
  try {
    const res = await fetch(`${BACKEND_URL}/api/patients/profile`, { headers: pHeaders });
    const data = await res.json();
    report("14. Patient Profile Page Coordination", res.status === 200 && data.success, `Name: ${data.profile?.full_name}, Blood: ${data.profile?.blood_group}`);
  } catch (err) {
    report("14. Patient Profile Page Coordination", false, err.message);
  }

  // 15. Doctor Portal - Patients Coordination
  try {
    const res = await fetch(`${BACKEND_URL}/api/doctor/patients`, { headers: dHeaders });
    const data = await res.json();
    report("15. Doctor Portal - Patients Coordination", res.status === 200 && data.success, `Doctor patients: ${data.count}`);
  } catch (err) {
    report("15. Doctor Portal - Patients Coordination", false, err.message);
  }

  // 16. Doctor Portal - Stats Coordination
  try {
    const res = await fetch(`${BACKEND_URL}/api/doctor/patients/stats`, { headers: dHeaders });
    const data = await res.json();
    report("16. Doctor Portal - Stats Coordination", res.status === 200 && data.success, `Total Appointments: ${data.stats?.total_appointments}`);
  } catch (err) {
    report("16. Doctor Portal - Stats Coordination", false, err.message);
  }

  console.log("\n==================================================");
  console.log(`COORDINATION SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log("==================================================");
  process.exit(failed > 0 ? 1 : 0);
}

testCoordination();
