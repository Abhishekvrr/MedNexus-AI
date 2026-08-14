import { query } from "../config/database.js";

/*
===========================================================
CREATE HOSPITAL
POST /api/hospitals
===========================================================
*/

export const createHospital = async (req, res) => {
  try {
    const {
      name,
      address,
      city,
      state,
      postal_code,
      phone,
      email,
      website,
      latitude,
      longitude,
      emergency_services,
      rating,
    } = req.body;

    if (!name || !address || !city) {
      return res.status(400).json({
        success: false,
        message: "name, address and city are required",
      });
    }

    const result = await query(
      `
      INSERT INTO hospitals (
        name,
        address,
        city,
        state,
        postal_code,
        phone,
        email,
        website,
        latitude,
        longitude,
        emergency_services,
        rating
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12
      )
      RETURNING *
      `,
      [
        name,
        address,
        city,
        state || null,
        postal_code || null,
        phone || null,
        email || null,
        website || null,
        latitude || null,
        longitude || null,
        emergency_services ?? false,
        rating || null,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Hospital created successfully",
      hospital: result.rows[0],
    });
  } catch (error) {
    console.error("Create hospital error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create hospital",
      error: error.message,
    });
  }
};


/*
===========================================================
GET ALL HOSPITALS
GET /api/hospitals
===========================================================
*/

export const getHospitals = async (req, res) => {
  try {
    const result = await query(
      `
      SELECT *
      FROM hospitals
      ORDER BY rating DESC NULLS LAST, name ASC
      `
    );

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      hospitals: result.rows,
    });
  } catch (error) {
    console.error("Get hospitals error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch hospitals",
      error: error.message,
    });
  }
};


/*
===========================================================
GET HOSPITAL BY ID
GET /api/hospitals/:id
===========================================================
*/

export const getHospitalById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `
      SELECT *
      FROM hospitals
      WHERE id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found",
      });
    }

    return res.status(200).json({
      success: true,
      hospital: result.rows[0],
    });
  } catch (error) {
    console.error("Get hospital error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch hospital",
      error: error.message,
    });
  }
};


/*
===========================================================
SEARCH HOSPITALS
GET /api/hospitals/search?city=Hyderabad
===========================================================
*/

export const searchHospitals = async (req, res) => {
  try {
    const { city, emergency_services } = req.query;

    const result = await query(
      `
      SELECT *
      FROM hospitals
      WHERE
        ($1::text IS NULL OR city ILIKE '%' || $1 || '%')
        AND
        (
          $2::boolean IS NULL
          OR emergency_services = $2
        )
      ORDER BY rating DESC NULLS LAST, name ASC
      `,
      [
        city || null,
        emergency_services === undefined
          ? null
          : emergency_services === "true",
      ]
    );

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      hospitals: result.rows,
    });
  } catch (error) {
    console.error("Search hospitals error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to search hospitals",
      error: error.message,
    });
  }
};


/*
===========================================================
UPDATE HOSPITAL
PUT /api/hospitals/:id
===========================================================
*/

export const updateHospital = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      address,
      city,
      state,
      postal_code,
      phone,
      email,
      website,
      latitude,
      longitude,
      emergency_services,
      rating,
    } = req.body;

    const result = await query(
      `
      UPDATE hospitals
      SET
        name = COALESCE($1, name),
        address = COALESCE($2, address),
        city = COALESCE($3, city),
        state = COALESCE($4, state),
        postal_code = COALESCE($5, postal_code),
        phone = COALESCE($6, phone),
        email = COALESCE($7, email),
        website = COALESCE($8, website),
        latitude = COALESCE($9, latitude),
        longitude = COALESCE($10, longitude),
        emergency_services = COALESCE($11, emergency_services),
        rating = COALESCE($12, rating)
      WHERE id = $13
      RETURNING *
      `,
      [
        name,
        address,
        city,
        state,
        postal_code,
        phone,
        email,
        website,
        latitude,
        longitude,
        emergency_services,
        rating,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Hospital updated successfully",
      hospital: result.rows[0],
    });
  } catch (error) {
    console.error("Update hospital error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update hospital",
      error: error.message,
    });
  }
};


/*
===========================================================
DELETE HOSPITAL
DELETE /api/hospitals/:id
===========================================================
*/

export const deleteHospital = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `
      DELETE FROM hospitals
      WHERE id = $1
      RETURNING id
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Hospital deleted successfully",
      hospital_id: result.rows[0].id,
    });
  } catch (error) {
    console.error("Delete hospital error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete hospital",
      error: error.message,
    });
  }
};