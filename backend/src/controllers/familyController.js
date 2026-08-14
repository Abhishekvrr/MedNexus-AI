import { query } from "../config/database.js";

export const getFamilyMembers = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const result = await query(
      `
      SELECT
        p.id,
        p.user_id,
        p.emergency_contact_name,
        p.emergency_contact_phone,
        p.emergency_contact_relation
      FROM patients p
      WHERE p.user_id = $1
      `,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Patient profile not found",
      });
    }

    const patient = result.rows[0];

    const familyMembers = [];

    if (patient.emergency_contact_name) {
      familyMembers.push({
        id: `emergency-${patient.id}`,
        name: patient.emergency_contact_name,
        relationship:
          patient.emergency_contact_relation ||
          "Emergency Contact",
        phone:
          patient.emergency_contact_phone || null,
        email: null,
      });
    }

    return res.status(200).json({
      success: true,
      count: familyMembers.length,
      family_members: familyMembers,
    });
  } catch (error) {
    console.error(
      "Get family members error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load family members",
      error: error.message,
    });
  }
};