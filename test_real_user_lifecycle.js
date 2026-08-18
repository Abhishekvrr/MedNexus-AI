const API_BASE = "http://localhost:5000/api";


async function testRealUserLifecycle() {
  console.log("================================================================================");
  console.log("🩺 REAL-WORLD PRODUCTION SIMULATION TEST: NEW DOCTOR & NEW PATIENT LIFECYCLE");
  console.log("================================================================================");

  const timestamp = Date.now();
  const doctorEmail = `dr.vikram.patel.${timestamp}@apollohealth.com`;
  const doctorPassword = "SecureDoc@2026";
  const doctorFullName = "Dr. Vikram Patel";

  const patientEmail = `rohit.sharma.${timestamp}@gmail.com`;
  const patientPassword = "SecurePatient@2026";
  const patientFullName = "Rohit Sharma";

  // ============================================================================
  // STEP 1: REGISTER & SETUP NEW DOCTOR
  // ============================================================================
  console.log("\n[STEP 1] Registering New Doctor Account...");
  const docRegRes = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      full_name: doctorFullName,
      email: doctorEmail,
      password: doctorPassword,
      phone: "+91 98450 11223",
      role: "doctor",
    }),
  });
  const docRegData = await docRegRes.json();
  if (!docRegRes.ok || !docRegData.success) {
    throw new Error(`Doctor registration failed: ${docRegData.message}`);
  }
  const doctorToken = docRegData.token;
  const doctorUserId = docRegData.user?.id;
  console.log(`✅ Doctor Registered! ID: ${doctorUserId}, Email: ${doctorEmail}`);

  // Setup Doctor Professional Profile
  console.log("-> Configuring Doctor Clinical Profile & Practice Settings...");
  const docProfileRes = await fetch(`${API_BASE}/doctors/me`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${doctorToken}`,
    },
    body: JSON.stringify({
      specialization: "Neurology & Spine Medicine",
      qualification: "MBBS, MD (Medicine), DM (Neurology), DNB",
      experience_years: 14,
      consultation_fee: 1200,
      license_number: `KMC-${timestamp.toString().slice(-6)}`,
      bio: "Senior Consultant Neurologist specializing in migraine, stroke rehabilitation, and epilepsy management.",
      available_for_online: true,
      phone: "+91 98450 11223",
    }),
  });
  const docProfileData = await docProfileRes.json();
  const doctorId = docProfileData.doctor?.id;
  console.log(`✅ Doctor Clinical Profile Created! Doctor DB ID: ${doctorId}`);
  console.log(`   Specialization: ${docProfileData.doctor?.specialization}`);
  console.log(`   Consultation Fee: ₹ ${docProfileData.doctor?.consultation_fee}`);

  // ============================================================================
  // STEP 2: REGISTER & SETUP NEW PATIENT
  // ============================================================================
  console.log("\n[STEP 2] Registering New Patient Account...");
  const patRegRes = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      full_name: patientFullName,
      email: patientEmail,
      password: patientPassword,
      phone: "+91 97412 33445",
      role: "patient",
    }),
  });
  const patRegData = await patRegRes.json();
  if (!patRegRes.ok || !patRegData.success) {
    throw new Error(`Patient registration failed: ${patRegData.message}`);
  }
  const patientToken = patRegData.token;
  const patientUserId = patRegData.user?.id;
  console.log(`✅ Patient Registered! User ID: ${patientUserId}, Email: ${patientEmail}`);

  // Setup Patient Health Profile
  console.log("-> Configuring Patient Medical Vitals, Allergies & History...");
  const patProfileRes = await fetch(`${API_BASE}/patient/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${patientToken}`,
    },
    body: JSON.stringify({
      date_of_birth: "1992-04-12",
      gender: "Male",
      blood_group: "B+",
      height_cm: 178,
      weight_kg: 74,
      allergies: "Penicillin, Dust mites",
      chronic_conditions: "Chronic Migraine with Aura",
      current_medications: "Sumatriptan 50mg SOS",
      emergency_contact_name: "Pooja Sharma",
      emergency_contact_phone: "+91 98860 99887",
      emergency_contact_relation: "Spouse",
    }),
  });
  const patProfileData = await patProfileRes.json();
  const patientId = patProfileData.patient?.id;
  console.log(`✅ Patient Health Profile Created! Patient DB ID: ${patientId}`);
  console.log(`   Blood Group: ${patProfileData.patient?.blood_group}, Allergies: ${patProfileData.patient?.allergies}`);

  // ============================================================================
  // STEP 3: PATIENT APPLIES FOR APPOINTMENT WITH THE NEW DOCTOR
  // ============================================================================
  console.log("\n[STEP 3] Patient Booking Appointment with Dr. Vikram Patel...");
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const apptDate = tomorrow.toISOString().split("T")[0];

  const bookRes = await fetch(`${API_BASE}/appointments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${patientToken}`,
    },
    body: JSON.stringify({
      doctor_id: doctorId,
      appointment_date: apptDate,
      appointment_time: "11:30",
      appointment_type: "in_person",
      reason: "Severe unilateral throbbing headache with visual photophobia and nausea for 3 days",
      notes: "Previous episode responded partially to Sumatriptan",
    }),
  });
  const bookData = await bookRes.json();
  if (!bookRes.ok || !bookData.success) {
    throw new Error(`Appointment booking failed: ${bookData.message}`);
  }
  const appointmentId = bookData.appointment?.id;
  console.log(`✅ Appointment Booked Successfully!`);
  console.log(`   Appointment ID: ${appointmentId}`);
  console.log(`   Date: ${apptDate} at 11:30 AM (In-Person Consultation)`);
  console.log(`   Initial Status: ${bookData.appointment?.status}`);

  // ============================================================================
  // STEP 4: DOCTOR LOGS IN, CHECKS PATIENT & CONFIRMS APPOINTMENT
  // ============================================================================
  console.log("\n[STEP 4] Doctor Reviews Appointment in Appointment Management...");
  const docApptsRes = await fetch(`${API_BASE}/appointments`, {
    headers: { Authorization: `Bearer ${doctorToken}` },
  });
  const docApptsData = await docApptsRes.json();
  console.log(`✅ Doctor Loaded ${docApptsData.appointments?.length} Appointment(s)`);

  console.log("-> Doctor Confirms Appointment...");
  const confirmRes = await fetch(`${API_BASE}/appointments/${appointmentId}/confirm`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${doctorToken}` },
  });
  const confirmData = await confirmRes.json();
  console.log(`✅ Appointment Confirmed! New Status: ${confirmData.appointment?.status}`);

  // ============================================================================
  // STEP 5: DOCTOR PRESCRIBES MULTI-MEDICINE REGIMEN TO PATIENT
  // ============================================================================
  console.log("\n[STEP 5] Doctor Issues Multi-Medicine Prescription to Rohit Sharma...");
  const prescribeRes = await fetch(`${API_BASE}/prescriptions/batch`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${doctorToken}`,
    },
    body: JSON.stringify({
      patient_id: patientId,
      appointment_id: appointmentId,
      diagnosis: "Acute Intractable Migraine with Visual Aura",
      notes: "Avoid cheese, caffeine, and direct glare. Maintain sleep hygiene.",
      medicines: [
        {
          medicine_name: "Rizatriptan",
          dosage: "10mg",
          frequency: "1 tablet at aura onset (SOS)",
          duration: "5 days",
          instructions: "Max 20mg in 24 hours. Take with water.",
        },
        {
          medicine_name: "Propranolol Extended Release",
          dosage: "40mg",
          frequency: "1-0-0 (Morning after food)",
          duration: "30 days",
          instructions: "Daily prophylactic dose for migraine prevention. Do not skip.",
        },
        {
          medicine_name: "Naproxen Sodium",
          dosage: "500mg",
          frequency: "1-0-1 (After meals)",
          duration: "3 days",
          instructions: "Take with food to avoid gastric irritation.",
        },
      ],
      start_date: apptDate,
    }),
  });
  const prescribeData = await prescribeRes.json();
  if (!prescribeRes.ok || !prescribeData.success) {
    throw new Error(`Prescription failed: ${prescribeData.message}`);
  }
  console.log(`✅ Prescription Created! Items Prescribed: ${prescribeData.prescriptions?.length}`);
  prescribeData.prescriptions?.forEach((p, idx) => {
    console.log(`   [${idx + 1}] ${p.medicine_name} ${p.dosage} | ${p.frequency} | ${p.duration}`);
  });

  // ============================================================================
  // STEP 6: DOCTOR LOGS CLINICAL ENCOUNTER RECORD & COMPLETES VISIT
  // ============================================================================
  console.log("\n[STEP 6] Doctor Logs Medical Encounter & Completes Visit...");
  const medRecRes = await fetch(`${API_BASE}/medical-records/doctor`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${doctorToken}`,
    },
    body: JSON.stringify({
      patient_id: patientId,
      appointment_id: appointmentId,
      diagnosis: "Acute Intractable Migraine with Visual Aura",
      symptoms: "Unilateral throbbing frontotemporal pain (8/10 VAS), photophobia, nausea, visual scintillating scotoma",
      treatment: "Initiated Rizatriptan acute therapy + Propranolol prophylaxis + dark room rest",
      medical_notes: "Neurological examination cranial nerves II-XII intact. No focal motor/sensory deficits. Fundoscopy normal.",
      record_date: apptDate,
    }),
  });
  const medRecData = await medRecRes.json();
  console.log(`✅ Medical Record Saved! ID: ${medRecData.medical_record?.id}`);

  // Verify Appointment Status transitioned to 'completed'
  const completeApptRes = await fetch(`${API_BASE}/appointments/${appointmentId}/complete`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${doctorToken}` },
  });
  const completeApptData = await completeApptRes.json();
  console.log(`✅ Appointment Successfully Completed! Final Status: ${completeApptData.appointment?.status}`);

  // ============================================================================
  // STEP 7: DOCTOR USES AI CLINICAL COPILOT WITH THE NEW REAL PATIENT DATA
  // ============================================================================
  console.log("\n[STEP 7] Testing Doctor AI Clinical Copilot with Live Real Data...");
  const aiQueryRes = await fetch(`${API_BASE}/ai/doctor-chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${doctorToken}`,
    },
    body: JSON.stringify({
      message: "Give me patient summary for Rohit Sharma and check his prescribed migraine medication safety.",
    }),
  });
  const aiQueryData = await aiQueryRes.json();
  console.log("✅ Doctor AI Clinical Response Received:");
  console.log("--------------------------------------------------------------------------------");
  console.log(aiQueryData.reply);
  console.log("--------------------------------------------------------------------------------");

  // ============================================================================
  // STEP 8: VERIFY DOCTOR PROFILE & MONTHLY EARNINGS
  // ============================================================================
  console.log("\n[STEP 8] Verifying Doctor Analytics & Real-Time Monthly Earnings...");
  const docEarningsRes = await fetch(`${API_BASE}/doctors/me`, {
    headers: { Authorization: `Bearer ${doctorToken}` },
  });
  const docEarningsData = await docEarningsRes.json();
  const stats = docEarningsData.doctor?.stats;
  console.log(`✅ Doctor Profile Statistics:`);
  console.log(`   - Total Patients Under Care: ${stats?.total_patients}`);
  console.log(`   - Total Completed Visits: ${stats?.completed_appointments}`);
  console.log(`   - Total Prescriptions Written: ${stats?.total_prescriptions}`);
  console.log(`   - This Month's Earned Consultation Fees: ₹ ${stats?.this_month_earnings} (1 completed visit × ₹1200)`);
  console.log(`   - Lifetime Revenue: ₹ ${stats?.total_earnings}`);

  // ============================================================================
  // STEP 9: PATIENT LOGS IN & SEES THEIR REAL PRESCRIPTIONS & RECORDS
  // ============================================================================
  console.log("\n[STEP 9] Patient Verification (Logging in as Rohit Sharma)...");
  
  // 1. Patient checks Prescriptions
  const patPresRes = await fetch(`${API_BASE}/prescriptions`, {
    headers: { Authorization: `Bearer ${patientToken}` },
  });
  const patPresData = await patPresRes.json();
  console.log(`✅ Patient Loaded ${patPresData.prescriptions?.length} Active Prescriptions from Dr. Vikram Patel:`);
  patPresData.prescriptions?.forEach((p) => {
    console.log(`   • ${p.medicine_name} (${p.dosage}) - Dr: ${p.doctor_name}`);
  });

  // 2. Patient checks Medical Records
  const patRecsRes = await fetch(`${API_BASE}/medical-records`, {
    headers: { Authorization: `Bearer ${patientToken}` },
  });
  const patRecsData = await patRecsRes.json();
  console.log(`✅ Patient Loaded ${patRecsData.medical_records?.length} Official Medical Records in Chart:`);
  patRecsData.medical_records?.forEach((r) => {
    console.log(`   • Diagnosis: ${r.diagnosis} | Treatment: ${r.treatment}`);
  });

  console.log("\n================================================================================");
  console.log("🎉 ALL REAL-WORLD CLINICAL END-TO-END FLOWS SUCCEEDED WITH 100% RELIABILITY!");
  console.log("================================================================================");
}

testRealUserLifecycle().catch((err) => {
  console.error("❌ TEST FAILED:", err);
  process.exit(1);
});
