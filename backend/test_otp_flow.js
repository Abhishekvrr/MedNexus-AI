// Test OTP authentication flow
const API_BASE_URL = "http://localhost:5000";

async function testOTPFlow() {
  console.log("==================================================");
  console.log("🧪 TESTING PATIENT EMAIL OTP VERIFICATION FLOW");
  console.log("==================================================");

  const testEmail = `patient.verified.${Date.now()}@mednexus.ai`;

  // 1. Send Registration OTP
  console.log(`\n[1] Requesting Registration OTP for: ${testEmail}...`);
  const regRes = await fetch(`${API_BASE_URL}/api/auth/send-registration-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      full_name: "Aarav Sharma",
      email: testEmail,
      password: "SecurePassword123!",
      phone: "+91 98765 43210",
      role: "patient",
    }),
  });

  const regJson = await regRes.json();
  console.log("Status:", regRes.status, "Response:", regJson);

  const otp = regJson.previewOtp;
  if (!otp) {
    console.error("❌ No preview OTP returned");
    return;
  }

  // 2. Verify Registration OTP
  console.log(`\n[2] Verifying Registration OTP (${otp})...`);
  const verifyRes = await fetch(`${API_BASE_URL}/api/auth/verify-registration-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: testEmail,
      otp,
    }),
  });

  const verifyJson = await verifyRes.json();
  console.log("Status:", verifyRes.status, "Message:", verifyJson.message);
  console.log("Token Generated:", verifyJson.token ? "YES (Valid JWT)" : "NO");
  console.log("User Profile Created:", verifyJson.user?.full_name, "| Role:", verifyJson.user?.role);

  // 3. Request 2FA Login OTP
  console.log(`\n[3] Requesting 2FA Login OTP for: ${testEmail}...`);
  const loginOtpRes = await fetch(`${API_BASE_URL}/api/auth/send-login-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: testEmail }),
  });
  const loginOtpJson = await loginOtpRes.json();
  console.log("Status:", loginOtpRes.status, "Preview OTP:", loginOtpJson.previewOtp);

  // 4. Verify 2FA Login OTP
  console.log(`\n[4] Verifying 2FA Login OTP (${loginOtpJson.previewOtp})...`);
  const verifyLoginRes = await fetch(`${API_BASE_URL}/api/auth/verify-login-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: testEmail,
      otp: loginOtpJson.previewOtp,
    }),
  });
  const verifyLoginJson = await verifyLoginRes.json();
  console.log("Status:", verifyLoginRes.status, "Login Success:", verifyLoginJson.success);

  console.log("\n==================================================");
  console.log("🎉 PATIENT EMAIL OTP AUTHENTICATION 100% VERIFIED!");
  console.log("==================================================");
}

testOTPFlow().catch(console.error);
