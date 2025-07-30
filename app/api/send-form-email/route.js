import nodemailer from "nodemailer";
import countryList from "react-select-country-list"; // <-- add this

export async function POST(request) {
  const data = await request.json();

  // Build country name from code
  const countryOptions = countryList().getData();
  const shippingCountryName =
    countryOptions.find((x) => x.value === data.shippingCountry)?.label ||
    data.shippingCountry;

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: "fernando@ayn-almanal.com",
        pass: "xilh rgxv ztil hbsj",
      },
    });

    // 1. Send to Marsos admin (still plain text)
    await transporter.sendMail({
      from: '"Marsos SA Import from Saudi" <your-gmail-address@gmail.com>',
      to: "marsos@marsos.sa",
      subject: "New Import Saudi Form Submission",
      text: Object.entries(data)
        .map(([k, v]) => `${k}: ${v}`)
        .join("\n"),
    });

    // 2. Send to the user (confirmation receipt, as HTML with images)
    if (data.email) {
      // Image section: only clickable images, no visible URL text
      const imagesHtml =
        Array.isArray(data.imageUrls) && data.imageUrls.length
          ? `
            <tr>
              <td colspan="2" style="padding:14px 0 10px 0;">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                  <tr>
                    ${data.imageUrls
                      .map(
                        (url) => `
                        <td style="padding-right:8px; vertical-align:top;">
                          <a href="${url}" target="_blank">
                            <img src="${url}" alt="Product Image" style="width:50px;height:50px;object-fit:cover;border:1px solid #eee;border-radius:6px;display:block;" />
                          </a>
                        </td>
                      `
                      )
                      .join("")}
                  </tr>
                </table>
              </td>
            </tr>
          `
          : "";

      const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <style>
    @media only screen and (max-width: 600px) {
      .main-table {
        width: 98% !important;
        padding: 4vw !important;
      }
      .logo-img {
        width: 85px !important;
      }
      .submission-table td {
        display: block !important;
        width: 100% !important;
      }
      .images-row img {
        width: 38px !important;
        height: 38px !important;
      }
    }
  </style>
</head>
<body style="margin:0;padding:0;background:#f8f9fa;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background:#f8f9fa;padding:0;margin:0;">
    <tr>
      <td align="center">
        <table class="main-table" width="600" cellpadding="0" cellspacing="0" style="margin:auto;background:#fff;padding:24px;border-radius:8px;text-align:center;">
          <tr>
            <td align="center">
              <img class="logo-img" src="https://marsos.sa/logo.png" alt="Marsos SA" style="width:120px;max-width:95vw;margin-bottom:12px;display:block;margin-left:auto;margin-right:auto;" />
              <h2 style="color:#2c6449;margin:12px 0 6px 0;text-align:center;">Import from Saudi Request</h2>
            </td>
          </tr>
          <tr>
            <td style="text-align:left;">
              <p style="font-size:16px;color:#333;margin:0 0 16px 0;text-align:left;">
                Dear, ${data.representativeName || "Customer"},<br>
                Thank you for your interest in Marsos.sa Import Saudi Arabia.
                We appreciate your request and our team is already reviewing the details
                and will get back to you shortly.
              </p>
              <hr style="margin:20px 0;">
              <h3 style="color:#2c6449;font-size:18px;text-align:center;margin:10px 0 12px 0;">Submission Details</h3>
              <table class="submission-table" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;color:#444;text-align:left;margin:auto;">
                <tr><td style="padding:4px 0;"><b>Product Name:</b></td><td>${
                  data.productName
                }</td></tr>
                <tr><td style="padding:4px 0;"><b>Category:</b></td><td>${
                  data.category
                }</td></tr>
                <tr><td style="padding:4px 0;"><b>Subcategory:</b></td><td>${
                  data.subcategory
                }</td></tr>
                <tr><td style="padding:4px 0;"><b>Size:</b></td><td>${
                  data.size
                }</td></tr>
                <tr><td style="padding:4px 0;"><b>Color:</b></td><td>${
                  data.color
                }</td></tr>
                <tr><td style="padding:4px 0;"><b>Purchase Quantity:</b></td><td>${
                  data.purchaseQuantity
                } ${data.purchaseUnit}</td></tr>
                <tr><td style="padding:4px 0;"><b>Shipping Country:</b></td><td>${shippingCountryName}</td></tr>
                <tr><td style="padding:4px 0;"><b>Shipping Method:</b></td><td>${
                  data.shippingMethod
                }</td></tr>
                <tr><td style="padding:4px 0;"><b>Destination Port:</b></td><td>${
                  data.destinationPort
                }</td></tr>
                <tr><td style="padding:4px 0;"><b>Lead Time:</b></td><td>${
                  data.leadTime || "N/A"
                }</td></tr>
                <tr><td style="padding:4px 0;"><b>Payment Terms:</b></td><td>${
                  data.paymentTerms
                }</td></tr>
                <tr><td style="padding:4px 0;"><b>Product Details:</b></td><td>${
                  data.productDetails
                }</td></tr>
                ${
                  Array.isArray(data.imageUrls) && data.imageUrls.length
                    ? `
                <tr>
                  <td colspan="2" style="padding:10px 0 14px 0;text-align:left;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        ${data.imageUrls
                          .map(
                            (url) => `
                            <td style="padding-right:8px; vertical-align:top;">
                              <a href="${url}" target="_blank">
                                <img src="${url}" alt="Product Image" style="width:50px;height:50px;max-width:60vw;object-fit:cover;border:1px solid #eee;border-radius:6px;display:block;" />
                              </a>
                            </td>
                          `
                          )
                          .join("")}
                      </tr>
                    </table>
                  </td>
                </tr>
                `
                    : ""
                }
                <tr><td style="padding:4px 0;"><b>Representative Name:</b></td><td>${
                  data.representativeName
                }</td></tr>
                <tr><td style="padding:4px 0;"><b>Company Name:</b></td><td>${
                  data.companyName
                }</td></tr>
                <tr><td style="padding:4px 0;"><b>Email:</b></td><td>${
                  data.email
                }</td></tr>
                <tr><td style="padding:4px 0;"><b>Phone:</b></td><td>${
                  data.phoneCountry
                } ${data.phone}</td></tr>
              </table>
              <hr style="margin:20px 0;">
              <p style="font-size:13px;color:#888;margin-bottom:18px;text-align:left;">
                We'll follow up with you soon to confirm the details and next steps.
                If you have any questions in the meantime, feel free to contact us directly at
                <a href="mailto:marsos@marsos.sa" style="color:#2c6449;">marsos@marsos.sa</a>
              </p>
              <div style="text-align:center;margin-top:24px;">
                <a href="https://marsos.sa" style="background:#2c6449;color:#fff;text-decoration:none;padding:10px 24px;border-radius:6px;font-weight:600;">Visit Marsos.sa</a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="text-align:center;">
              <p style="text-align:center;font-size:12px;color:#bbb;margin-top:16px;">
                &copy; ${new Date().getFullYear()} Marsos SA
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

      await transporter.sendMail({
        from: '"Marsos SA Import from Saudi" <your-gmail-address@gmail.com>',
        to: data.email,
        subject: "Your Import from Saudi Request Has Been Submitted",
        html: emailHtml,
      });
    }

    return Response.json({ ok: true, message: "Emails sent!" });
  } catch (error) {
    console.error(error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
