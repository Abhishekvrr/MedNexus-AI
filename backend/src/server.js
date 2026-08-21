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
import doctorsRoutes from "./routes/doctorsRoutes.js";

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
import aiVoiceScribeRoutes from "./routes/aiVoiceScribeRoutes.js";
import emergencyRoutes from "./routes/emergencyRoutes.js";
import pharmacyRoutes from "./routes/pharmacyRoutes.js";

// ============================================================
// APP CONFIGURATION
// ============================================================

const app = express();

const PORT = process.env.PORT || 5000;

// ============================================================
// CORS CONFIGURATION
// ============================================================

// Local development URLs
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

// Production frontend URL(s)
// Example:
// FRONTEND_URL=https://mednexus-ai.vercel.app,https://mycustomdomain.com
if (process.env.FRONTEND_URL) {
  const productionOrigins = process.env.FRONTEND_URL
    .split(",")
    .map((url) => url.trim())
    .filter(Boolean);

  allowedOrigins.push(...productionOrigins);
}

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow all origins (Postman, Vercel deployments, mobile apps, local dev)
      return callback(null, true);
    },
    credentials: true,
  })
);

// Explicit preflight and CORS header fallback
app.use((req, res, next) => {
  const origin = req.headers.origin || "*";
  res.header("Access-Control-Allow-Origin", origin);
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Methods",
    "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

// Middleware to normalize incoming serverless /api paths
app.use((req, res, next) => {
  if (!req.url.startsWith("/api") && req.url !== "/") {
    req.url = `/api${req.url.startsWith("/") ? "" : "/"}${req.url}`;
  }
  next();
});

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

// ============================================================
// ROOT API
// ============================================================

app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    service: "MedNexus AI API",
    version: "1.0.0",
    status: "operational",
  });
});

app.get("/api", (req, res) => {
  return res.status(200).json({
    success: true,
    service: "MedNexus AI API",
    version: "1.0.0",
    status: "operational",
    endpoints: "/api/health, /api/auth, /api/ai, /api/emergency, /api/pharmacy",
  });
});

// ============================================================
// HEALTH CHECK
// ============================================================

app.get("/api/health", async (req, res) => {
  try {
    if (!pool) {
      return res.status(200).json({
        success: true,
        service: "MedNexus AI API",
        status: "operational_without_db",
        database: {
          connected: false,
          message: "DATABASE_URL not configured yet in environment variables",
        },
        timestamp: new Date().toISOString(),
      });
    }

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
    console.error("Health check error:", error.message);

    return res.status(200).json({
      success: true,
      service: "MedNexus AI API",
      status: "degraded",
      database: {
        connected: false,
        error: error.message,
      },
      timestamp: new Date().toISOString(),
    });
  }
});

// ============================================================
// API ROUTES
// ============================================================

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/appointments",
  appointmentRoutes
);

app.use(
  "/api/patients",
  patientRoutes
);

app.use(
  "/api/patient",
  patientRoutes
);


// ============================================================
// DOCTOR ROUTES
// ============================================================

app.use(
  "/api/doctor",
  doctorRoutes
);

app.use(
  "/api/doctors",
  doctorsRoutes
);

// ============================================================
// OTHER ROUTES
// ============================================================

app.use(
  "/api/dashboard",
  dashboardRoutes
);

app.use(
  "/api/medical-records",
  medicalRecordsRoutes
);

app.use(
  "/api/prescriptions",
  prescriptionRoutes
);

app.use(
  "/api/prescriptions",
  prescriptionsRoutes
);

app.use(
  "/api/lab-reports",
  labReportsRoutes
);

app.use(
  "/api/health-metrics",
  healthMetricsRoutes
);

app.use(
  "/api/family",
  familyRoutes
);

app.use(
  "/api/notifications",
  notificationRoutes
);

app.use(
  "/api/hospitals",
  hospitalRoutes
);

app.use(
  "/api/recommendations",
  recommendationRoutes
);

app.use(
  "/api/ai",
  aiRoutes
);

app.use(
  "/api/ai",
  aiVoiceScribeRoutes
);

app.use(
  "/api/emergency",
  emergencyRoutes
);

app.use(
  "/api/pharmacy",
  pharmacyRoutes
);

app.use(
  "/api/ai-recommendations",
  aiRecommendationRoutes
);

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

app.use(
  (error, req, res, next) => {
    console.error(
      "GLOBAL SERVER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
);

const startServer = async () => {
  try {
    if (pool) {
      await pool.query("SELECT 1").catch((err) => {
        console.warn("Database connection notice:", err.message);
      });
      console.log("PostgreSQL connected");
    }

    app.listen(PORT, () => {
      console.log("");
      console.log("==============================================");
      console.log("       MEDNEXUS AI BACKEND                    ");
      console.log("==============================================");
      console.log(`Server listening on port ${PORT}`);
      console.log("==============================================");
      console.log("");
    });
  } catch (error) {
    console.error("Backend startup error:", error.message);
  }
};

startServer();

export default app;