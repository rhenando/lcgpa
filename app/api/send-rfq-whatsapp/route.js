import { NextResponse } from "next/server";
import { Twilio } from "twilio";

export async function POST(request) {
  // --- TEST LOG ---
  console.log("✅✅✅ --- SENDING RFQ WHATSAPP NOTIFICATION --- ✅✅✅");
  // --- END TEST LOG ---

  const {
    TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN,
    TWILIO_WHATSAPP_NUMBER,
    TWILIO_RFQ_TEMPLATE_SID, // You'll need to create this template
  } = process.env;

  // Log environment variables (without sensitive data)
  console.log("🔍 Environment Check:");
  console.log(
    "TWILIO_ACCOUNT_SID:",
    TWILIO_ACCOUNT_SID ? "✅ SET" : "❌ MISSING"
  );
  console.log(
    "TWILIO_AUTH_TOKEN:",
    TWILIO_AUTH_TOKEN ? "✅ SET" : "❌ MISSING"
  );
  console.log(
    "TWILIO_WHATSAPP_NUMBER:",
    TWILIO_WHATSAPP_NUMBER ? "✅ SET" : "❌ MISSING"
  );
  console.log(
    "TWILIO_RFQ_TEMPLATE_SID:",
    TWILIO_RFQ_TEMPLATE_SID ? "✅ SET" : "❌ MISSING"
  );

  if (
    !TWILIO_ACCOUNT_SID ||
    !TWILIO_AUTH_TOKEN ||
    !TWILIO_WHATSAPP_NUMBER ||
    !TWILIO_RFQ_TEMPLATE_SID
  ) {
    console.error(
      "❌ Twilio environment variables are not fully configured for RFQ notifications. Ensure SID, Token, Number, and RFQ_Template_SID are set."
    );
    return NextResponse.json(
      {
        success: false,
        message: "WhatsApp notification service not configured on server.",
        missing: {
          TWILIO_ACCOUNT_SID: !TWILIO_ACCOUNT_SID,
          TWILIO_AUTH_TOKEN: !TWILIO_AUTH_TOKEN,
          TWILIO_WHATSAPP_NUMBER: !TWILIO_WHATSAPP_NUMBER,
          TWILIO_RFQ_TEMPLATE_SID: !TWILIO_RFQ_TEMPLATE_SID,
        },
      },
      { status: 500 }
    );
  }

  try {
    const requestBody = await request.json();
    console.log("📦 Request Body:", JSON.stringify(requestBody, null, 2));

    const {
      supplierPhone,
      supplierName,
      productName,
      category,
      quantity,
      buyerName,
      shippingCountry,
    } = requestBody;

    // Log received data
    console.log("📋 Received Data:");
    console.log("supplierPhone:", supplierPhone);
    console.log("supplierName:", supplierName);
    console.log("productName:", productName);
    console.log("category:", category);
    console.log("quantity:", quantity);
    console.log("buyerName:", buyerName);
    console.log("shippingCountry:", shippingCountry);

    // Validate required fields
    if (!supplierPhone || !supplierName || !productName) {
      console.error("❌ Missing required fields:", {
        supplierPhone: !supplierPhone,
        supplierName: !supplierName,
        productName: !productName,
      });
      return NextResponse.json(
        {
          success: false,
          message:
            "Missing required fields: supplierPhone, supplierName, or productName",
          received: {
            supplierPhone: !!supplierPhone,
            supplierName: !!supplierName,
            productName: !!productName,
          },
        },
        { status: 400 }
      );
    }

    // Check if phone number is valid
    if (!supplierPhone || supplierPhone.length < 10) {
      console.error("❌ Invalid phone number:", supplierPhone);
      return NextResponse.json(
        {
          success: false,
          message: "Invalid phone number format",
          receivedPhone: supplierPhone,
        },
        { status: 400 }
      );
    }

    const twilioClient = new Twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

    // Clean phone number (remove + if present)
    const cleanPhone = supplierPhone.replace(/^\+/, "");
    const supplierPhoneNumber = `whatsapp:+${cleanPhone}`;

    console.log("📱 Formatted phone number:", supplierPhoneNumber);

    // Prepare content variables
    const contentVariables = {
      1: supplierName || "Supplier", // {{1}} - Supplier Name
      2: productName || "Product", // {{2}} - Product Name
      3: category || "Category", // {{3}} - Category
      4: quantity || "1 Piece(s)", // {{4}} - Quantity
      5: buyerName || "Buyer", // {{5}} - Buyer Name
      6: shippingCountry || "Country", // {{6}} - Shipping Country
    };

    console.log(
      "🔧 Content Variables:",
      JSON.stringify(contentVariables, null, 2)
    );

    // Send WhatsApp template message to supplier
    console.log("📤 Sending WhatsApp message...");
    const message = await twilioClient.messages.create({
      contentSid: TWILIO_RFQ_TEMPLATE_SID,
      from: TWILIO_WHATSAPP_NUMBER,
      to: supplierPhoneNumber,
      contentVariables: JSON.stringify(contentVariables),
    });

    console.log(
      `✅ WhatsApp RFQ template notification sent to ${supplierPhoneNumber}. Message SID: ${message.sid}`
    );

    return NextResponse.json(
      {
        success: true,
        message: "RFQ WhatsApp notification sent successfully",
        messageSid: message.sid,
        sentTo: supplierPhoneNumber,
        contentVariables: contentVariables,
      },
      { status: 200 }
    );
  } catch (whatsappError) {
    console.error(
      "❌ Failed to send RFQ WhatsApp template message:",
      whatsappError.message,
      whatsappError.code,
      whatsappError.moreInfo
    );

    // Log full error details for debugging
    console.error(
      "🔍 Full error object:",
      JSON.stringify(whatsappError, null, 2)
    );

    // Return specific error for debugging
    return NextResponse.json(
      {
        success: false,
        message: "Failed to send WhatsApp notification",
        error: whatsappError.message,
        code: whatsappError.code || "UNKNOWN_ERROR",
        moreInfo: whatsappError.moreInfo || "No additional info",
        details: whatsappError.details || [],
      },
      { status: 500 }
    );
  }
}
