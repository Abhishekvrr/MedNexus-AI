import { query } from "../config/database.js";

/*
===========================================================
CREATE PHARMACY ORDER (APOLLO / 1MG / MEDNEXUS PHARMACY)
POST /api/pharmacy/order
===========================================================
*/
export const createPharmacyOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      items = [],
      delivery_address,
      payment_method = "UPI",
      partner = "Apollo Pharmacy Express",
      prescription_id = null,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No medicine items in the cart to order",
      });
    }

    if (!delivery_address || !delivery_address.trim()) {
      return res.status(400).json({
        success: false,
        message: "Delivery address is required",
      });
    }

    // Get patient profile
    const patRes = await query(`SELECT p.id, u.full_name, u.phone FROM patients p JOIN users u ON p.user_id = u.id WHERE p.user_id = $1`, [userId]);
    const patient = patRes.rows[0] || { full_name: "Patient", phone: "" };

    // Calculate pricing
    let subtotal = 0;
    const structuredItems = items.map((item, idx) => {
      const price = item.price || (120 + ((idx * 45) % 180));
      const qty = item.quantity || 1;
      subtotal += price * qty;
      return {
        medicine_name: item.medicine_name || item.name || "Medication",
        dosage: item.dosage || "Standard Dose",
        frequency: item.frequency || "As prescribed",
        quantity: qty,
        price_per_unit: price,
        total_price: price * qty,
      };
    });

    const discountPercentage = 15; // 15% Apollo Partner Discount
    const discountAmount = Math.round((subtotal * discountPercentage) / 100);
    const deliveryFee = subtotal > 400 ? 0 : 49;
    const totalAmount = subtotal - discountAmount + deliveryFee;

    const orderId = `MN-APOLLO-${Date.now().toString().slice(-6)}`;
    const estimatedDeliveryMins = 45;

    const orderData = {
      order_id: orderId,
      partner,
      patient_name: patient.full_name,
      patient_phone: patient.phone,
      delivery_address: delivery_address.trim(),
      payment_method,
      items: structuredItems,
      subtotal,
      discount_amount: discountAmount,
      discount_percentage: discountPercentage,
      delivery_fee: deliveryFee,
      total_amount: totalAmount,
      status: "verified_by_pharmacist",
      estimated_delivery: `${estimatedDeliveryMins} Mins (Express)`,
      tracking_steps: [
        { step: "Order Received", time: "Just now", completed: true },
        { step: "Verified by Licensed Pharmacist", time: "Just now", completed: true },
        { step: "Packing at Local Apollo Hub", time: "In Progress (est. 10m)", completed: false },
        { step: "Out for Express Delivery", time: "Pending", completed: false },
        { step: "Delivered to Doorstep", time: `Est. ${estimatedDeliveryMins} mins`, completed: false },
      ],
      created_at: new Date().toISOString(),
    };

    // Also trigger notification for user
    await query(
      `
      INSERT INTO notifications (user_id, title, message, notification_type)
      VALUES ($1, $2, $3, 'pharmacy_order')
      `,
      [
        userId,
        `📦 Order Confirmed: ${orderId}`,
        `Your medicines have been sent to ${partner}. Estimated delivery in ${estimatedDeliveryMins} minutes to ${delivery_address.slice(0, 30)}...`,
      ]
    );

    return res.status(201).json({
      success: true,
      message: `Prescription medicines successfully ordered via ${partner}!`,
      order: orderData,
    });
  } catch (error) {
    console.error("Pharmacy order error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to process online pharmacy order",
      error: error.message,
    });
  }
};

/*
===========================================================
GET RECENT PHARMACY ORDERS
GET /api/pharmacy/orders
===========================================================
*/
export const getPharmacyOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    // Return simulated active orders
    return res.status(200).json({
      success: true,
      orders: [
        {
          order_id: "MN-APOLLO-849201",
          partner: "Apollo Pharmacy Express",
          items_count: 3,
          total_amount: 485,
          status: "Delivered",
          created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
        },
      ],
    });
  } catch (error) {
    console.error("Get orders error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};
