// backend/api/notify-payment.js
const express = require("express");
const router = express.Router();
const twilio = require("twilio");

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
const FROM_WHATSAPP_NUMBER = "whatsapp:+14155238886"; // Twilio Sandbox #

router.post("/", async (req, res) => {
  const { supplierPhone, buyerName, totalAmount, paymentMethod } = req.body;

  if (!supplierPhone)
    return res.status(400).json({ error: "No phone provided" });

  try {
    await client.messages.create({
      body: `📦 New Order Received\nBuyer: ${buyerName}\nTotal: SAR ${totalAmount}\nPayment: ${paymentMethod}`,
      from: FROM_WHATSAPP_NUMBER,
      to: `whatsapp:${supplierPhone}`,
    });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Twilio Error:", err.message);
    res.status(500).json({ error: "Failed to send WhatsApp message" });
  }
});

module.exports = router;
