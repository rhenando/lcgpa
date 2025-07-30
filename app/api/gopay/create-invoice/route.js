import { NextResponse } from "next/server";
import { Twilio } from "twilio";

export async function POST(request) {
  // --- TEST LOG ---
  console.log("✅✅✅ --- RUNNING FINAL TEMPLATE CODE --- ✅✅✅");
  // --- END TEST LOG ---

  const {
    GOPAY_API_URL,
    GOPAY_USERNAME,
    GOPAY_PASSWORD,
    GOPAY_ENTITY_ACTIVITY_ID,
    TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN,
    TWILIO_WHATSAPP_NUMBER,
    TWILIO_ORDER_TEMPLATE_SID,
  } = process.env;

  if (
    !GOPAY_API_URL ||
    !GOPAY_USERNAME ||
    !GOPAY_PASSWORD ||
    !GOPAY_ENTITY_ACTIVITY_ID
  ) {
    console.error("❌ GoPay environment variables are not fully configured.");
    return NextResponse.json(
      { message: "Payment provider not configured on server." },
      { status: 500 }
    );
  }

  if (
    !TWILIO_ACCOUNT_SID ||
    !TWILIO_AUTH_TOKEN ||
    !TWILIO_WHATSAPP_NUMBER ||
    !TWILIO_ORDER_TEMPLATE_SID
  ) {
    console.error(
      "❌ Twilio environment variables are not fully configured. Ensure SID, Token, Number, and Template_SID are set."
    );
  }

  try {
    const {
      phone,
      items,
      firstName,
      lastName,
      email,
      serviceName,
      amount,
      shippingCost,
    } = await request.json();

    const billItems = items.map((item) => ({
      name: item.productName,
      quantity: item.quantity,
      unitPrice: Number(item.price),
      vat: "0.15",
      discount: 0,
      discountType: "FIXED",
    }));

    if (shippingCost > 0) {
      billItems.push({
        name: "Shipping",
        quantity: 1,
        unitPrice: Number(shippingCost),
        discount: 0,
        vat: "0.15",
      });
    }

    const uniqueId = Math.random().toString(36).substring(2, 9);
    const shortBillNumber = `${Date.now()}${uniqueId}`.substring(0, 20);

    const finalPayload = {
      billNumber: shortBillNumber,
      entityActivityId: parseInt(GOPAY_ENTITY_ACTIVITY_ID),
      customerFullName: `${firstName} ${lastName}`.trim(),
      customerEmailAddress: email,
      customerMobileNumber: phone,
      issueDate: new Date().toISOString().split("T")[0],
      expireDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      serviceName: serviceName,
      billItemList: billItems,
      totalAmount: Number(amount),
      isPublicView: true,
      showOnlinePayNowButton: true,
    };

    const headers = {
      "Content-Type": "application/json",
      username: GOPAY_USERNAME,
      password: GOPAY_PASSWORD,
    };

    const createInvoiceResponse = await fetch(
      `${GOPAY_API_URL}/simple/upload`,
      {
        method: "POST",
        headers: headers,
        body: JSON.stringify(finalPayload),
      }
    );

    const createInvoiceData = await createInvoiceResponse.json();

    if (!createInvoiceResponse.ok) {
      console.error("❌ GoPay API Error:", createInvoiceData);
      const errorFields =
        createInvoiceData.data
          ?.map((e) => `${e.field}: ${e.message}`)
          .join(", ") ||
        createInvoiceData.message ||
        "Invalid request.";
      return NextResponse.json(
        { message: `GoPay Error: ${errorFields}` },
        { status: 400 }
      );
    }

    const createdBillNumber = createInvoiceData?.data?.billNumber;
    if (!createdBillNumber) {
      throw new Error(
        "GoPay did not return a bill number after invoice creation."
      );
    }

    await new Promise((resolve) => setTimeout(resolve, 3000));

    const getInfoResponse = await fetch(
      `${GOPAY_API_URL}/bill/info?billNumber=${createdBillNumber}`,
      { headers }
    );
    const getInfoData = await getInfoResponse.json();

    const qrText = getInfoData?.data?.qr || "";
    const redirectUrlMatch = qrText.match(
      /https:\/\/.*verify\/bill\?billNumber=\w+/
    );
    const redirectUrl = redirectUrlMatch ? redirectUrlMatch[0] : null;

    const responseForFrontend = {
      success: true,
      sadadNumber: getInfoData.data?.sadadNumber || createdBillNumber,
      invoiceNo: createdBillNumber,
      amount: finalPayload.totalAmount,
      issueDate: finalPayload.issueDate,
      expireDate: finalPayload.expireDate,
      redirectUrl: redirectUrl,
    };

    if (
      TWILIO_ACCOUNT_SID &&
      TWILIO_AUTH_TOKEN &&
      TWILIO_WHATSAPP_NUMBER &&
      TWILIO_ORDER_TEMPLATE_SID
    ) {
      try {
        const twilioClient = new Twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
        const customerPhoneNumber = `whatsapp:+${phone}`;

        await twilioClient.messages.create({
          contentSid: TWILIO_ORDER_TEMPLATE_SID,
          from: TWILIO_WHATSAPP_NUMBER,
          to: customerPhoneNumber,
          contentVariables: JSON.stringify({
            1: finalPayload.customerFullName,
            2: responseForFrontend.sadadNumber,
            3: responseForFrontend.amount.toString(),
          }),
        });

        console.log(
          `✅ WhatsApp TEMPLATE notification sent to ${customerPhoneNumber}`
        );
      } catch (whatsappError) {
        console.error(
          "❌ Failed to send WhatsApp template message:",
          whatsappError.message
        );
      }
    }

    return NextResponse.json(responseForFrontend, { status: 200 });
  } catch (error) {
    console.error("❌ Internal server error in GoPay route:", error);
    return NextResponse.json(
      { message: "An internal server error occurred." },
      { status: 500 }
    );
  }
}
