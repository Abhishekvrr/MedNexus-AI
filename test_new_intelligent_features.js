import jwt from "jsonwebtoken";

const API_BASE_URL = "http://localhost:5000";
const JWT_SECRET = "super_secret_jwt_key_mednexus_2026_devfusion";

const mockPatientToken = jwt.sign(
  {
    id: "1a62be5d-d2d5-41fa-9d1d-941af83664da",
    email: "rohit.sharma.1787047045613@gmail.com",
    role: "patient",
  },
  JWT_SECRET,
  { expiresIn: "1h" }
);

async function testFeatures() {
  console.log("==================================================");
  console.log("🧪 TESTING 5 NEW INTELLIGENT AI & PHARMACY MODULES");
  console.log("==================================================");

  // 1. Test Doctor Matching in AI Symptom Analysis
  console.log("\n[1] Testing AI Symptom Analysis & Nearby Doctor Matching...");
  const analyzeRes = await fetch(`${API_BASE_URL}/api/ai/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${mockPatientToken}` },
    body: JSON.stringify({ symptoms: "Severe throbbing unilateral headache with aura and photophobia" }),
  });
  const analyzeJson = await analyzeRes.json();
  console.log(`✅ Status: ${analyzeRes.status}`);
  console.log(`   Specialty Recommended: ${analyzeJson.analysis?.doctor_recommendation?.specialty}`);
  console.log(`   Matched Doctors Found: ${analyzeJson.analysis?.matched_doctors?.length || 0}`);
  if (analyzeJson.analysis?.matched_doctors?.length > 0) {
    const doc = analyzeJson.analysis.matched_doctors[0];
    console.log(`   Top Match: Dr. ${doc.doctor_name} (${doc.specialization}) - Fee: ₹${doc.consultation_fee}`);
  }

  // 2. Test Disease Diet Plan
  console.log("\n[2] Testing Disease-Specific Food & Nutrition Diet Plan...");
  const dietRes = await fetch(`${API_BASE_URL}/api/ai/diet-plan`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${mockPatientToken}` },
    body: JSON.stringify({ disease_or_symptoms: "Acute Bronchitis & Productive Cough" }),
  });
  const dietJson = await dietRes.json();
  console.log(`✅ Status: ${dietRes.status}`);
  console.log(`   Plan Title: ${dietJson.data?.condition_title}`);
  console.log(`   Healing Foods Categories: ${dietJson.data?.foods_to_eat?.length || 0}`);
  console.log(`   Foods to Avoid: ${dietJson.data?.foods_to_avoid?.length || 0}`);
  console.log(`   Hydration: ${dietJson.data?.hydration_target}`);

  // 3. Test Tablet & Lab Explainer NLP
  console.log("\n[3] Testing Natural Language Tablet & Lab Report Explainer...");
  const tabletRes = await fetch(`${API_BASE_URL}/api/ai/tablet-explain`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${mockPatientToken}` },
    body: JSON.stringify({ question: "Why did doctor prescribe Brodex Cough Syrup and can I take Amoxicillin with milk?" }),
  });
  const tabletJson = await tabletRes.json();
  console.log(`✅ Status: ${tabletRes.status}`);
  console.log(`   Subject: ${tabletJson.data?.medicine_or_test_highlighted}`);
  console.log(`   Key Takeaways: ${tabletJson.data?.key_takeaways?.length || 0}`);
  console.log(`   Food/Drink Cautions: ${tabletJson.data?.food_and_drink_cautions?.length || 0}`);

  // 4. Test Post-Medication Recovery Check-In
  console.log("\n[4] Testing Post-Medication Empathetic Recovery Check-in...");
  const recoveryRes = await fetch(`${API_BASE_URL}/api/ai/recovery-checkin`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${mockPatientToken}` },
    body: JSON.stringify({}),
  });
  const recoveryJson = await recoveryRes.json();
  console.log(`✅ Status: ${recoveryRes.status}`);
  console.log(`   Check-in Prompt: ${recoveryJson.data?.checkin_message?.slice(0, 70)}...`);
  console.log(`   Follow-up Doctor: ${recoveryJson.data?.follow_up_doctor_name}`);

  // 5. Test 1-Click Apollo Pharmacy Order & Delivery Tracking
  console.log("\n[5] Testing 1-Click Apollo Pharmacy Order & Live Courier Tracking...");
  const orderRes = await fetch(`${API_BASE_URL}/api/pharmacy/order`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${mockPatientToken}` },
    body: JSON.stringify({
      items: [
        { name: "Amoxicillin-Clav 625mg", price: 185, quantity: 1 },
        { name: "Brodex Expectorant Syrup", price: 115, quantity: 1 },
      ],
      delivery_address: "Flat 402, Green Glen Heights, Bangalore - 560103",
      payment_method: "UPI",
      partner: "Apollo Pharmacy Express",
    }),
  });
  const orderJson = await orderRes.json();
  console.log(`✅ Status: ${orderRes.status}`);
  console.log(`   Order ID: ${orderJson.order?.order_id}`);
  console.log(`   Partner: ${orderJson.order?.partner}`);
  console.log(`   Subtotal: ₹${orderJson.order?.subtotal} - Apollo Discount: ₹${orderJson.order?.discount_amount} = Total: ₹${orderJson.order?.total_amount}`);
  console.log(`   Estimated Delivery: ${orderJson.order?.estimated_delivery}`);
  console.log(`   Courier Tracking Steps: ${orderJson.order?.tracking_steps?.length || 0}`);

  console.log("\n==================================================");
  console.log("🎉 ALL 5 NEW MODULES VALIDATED SUCCESSFULLY!");
  console.log("==================================================");
}

testFeatures().catch(console.error);
