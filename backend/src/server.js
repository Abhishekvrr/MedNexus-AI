import "dotenv/config";

import express from "express";
import cors from "cors";

import pool from "./config/database.js";

// ============================================================
// ROUTES
// ============================================================

import authRoutes from "./routes/authRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import patientRoutes from "./routes/patientRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";

import dashboardRoutes from "./routes/dashboardRoutes.js";
import medicalRecordsRoutes from "./routes/medicalRecordsRoutes.js";
import prescriptionRoutes from "./routes/prescriptionRoutes.js";
import prescriptionsRoutes from "./routes/prescriptionsRoutes.js";
import labReportsRoutes from "./routes/labReportsRoutes.js";
import healthMetricsRoutes from "./routes/healthMetricsRoutes.js";
import familyRoutes from "./routes/familyRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

import hospitalRoutes from "./routes/hospitalRoutes.js";
import recommendationRoutes from "./routes/recommendationRoutes.js";

import aiRoutes from "./routes/aiRoutes.js";
import aiRecommendationRoutes from "./routes/aiRecommendationRoutes.js";

// ============================================================
// APP CONFIGURATION
// ============================================================

const app = express();

const PORT = process.env.PORT || 5000;

// ============================================================
// MIDDLEWARE
// ============================================================

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================================
// HEALTH CHECK
// ============================================================

app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");

    return res.status(200).json({
      success: true,
      service: "MedNexus AI API",
      status: "operational",
      database: {
        connected: true,
        name: "mednexus",
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Health check error:", error);

    return res.status(500).json({
      success: false,
      service: "MedNexus AI API",
      status: "degraded",
      database: {
        connected: false,
      },
      error:
        process.env.NODE_ENV === "production"
          ? undefined
          : error.message,
    });
  }
});

// ============================================================
// API ROUTES
// ============================================================

app.use("/api/auth", authRoutes);

app.use("/api/appointments", appointmentRoutes);

app.use("/api/patients", patientRoutes);

// ============================================================
// DOCTOR ROUTES
// ============================================================

app.use("/api/doctor", doctorRoutes);

// ============================================================
// OTHER ROUTES
// ============================================================

app.use("/api/dashboard", dashboardRoutes);

app.use("/api/medical-records", medicalRecordsRoutes);

app.use("/api/prescriptions", prescriptionRoutes);

app.use("/api/prescriptions", prescriptionsRoutes);

app.use("/api/lab-reports", labReportsRoutes);

app.use("/api/health-metrics", healthMetricsRoutes);

app.use("/api/family", familyRoutes);

app.use("/api/notifications", notificationRoutes);

app.use("/api/hospitals", hospitalRoutes);

app.use("/api/recommendations", recommendationRoutes);

app.use("/api/ai", aiRoutes);

app.use("/api/ai-recommendations", aiRecommendationRoutes);

// ============================================================
// 404 API HANDLER
// ============================================================

app.use("/api", (req, res) => {
  return res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// ============================================================
// GLOBAL ERROR HANDLER
// ============================================================

app.use((error, req, res, next) => {
  console.error("GLOBAL SERVER ERROR:", error);

  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

// ============================================================
// VERCEL EXPORT
// ============================================================

// Export Express app for Vercel
export default app;

// ============================================================
// LOCAL DEVELOPMENT SERVER
// ============================================================

// Only start app.listen() when running locally.
// Vercel will handle the server in production.
if (process.env.NODE_ENV !== "production") {
  const startServer = async () => {
    try {
      await pool.query("SELECT 1");

      console.log("PostgreSQL connected");
      console.log("Database: mednexus");

      app.listen(PORT, () => {
        console.log("");
        console.log("==============================================");
        console.log("       MEDNEXUS AI BACKEND");
        console.log("==============================================");
        console.log(`Server: http://localhost:${PORT}`);
        console.log(`Health: http://localhost:${PORT}/api/health`);
        console.log("==============================================");
        console.log("");
      });
    } catch (error) {
      console.error("Database connection failed:", error);
      process.exit(1);
    }
  };

  startServer();
}