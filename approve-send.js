// approve-send.js
// Called from the approval page when Ben or the head coach clicks "Send".
// Receives the (possibly edited) email text + recipient info and sends via Resend.

const { Resend } = require("resend");

// ---------------------------------------------------------------------------
// Build a clean, branded HTML email from plain text
// ---------------------------------------------------------------------------
function textToHtml(text, riderFirst) {
  const escapedText = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Convert URLs to clickable links
  const linkedText = escapedText.replace(
    /(https?:\/\/[^\s]+)/g,
    '<a href="$1" style="color:#C2282D;">$1</a>'
  );

  // Convert line breaks
  const htmlBody = linkedText.replace(/\n/g, "<br>");

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <div style="max-width:600px;margin:24px auto;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
    <!-- Header bar -->
    <div style="background:#0f1114;padding:20px 32px;text-align:center;">
      <img src="https://centralmtb.com/images/logo.png" alt="Central MTB" width="120" style="display:inline-block;">
    </div>
    <!-- Body -->
    <div style="padding:32px;font-size:15px;color:#333;line-height:1.7;">
      ${htmlBody}
    </div>
    <!-- Footer -->
    <div style="background:#f5f5f5;padding:20px 32px;text-align:center;font-size:12px;color:#999;">
      St. Paul Central Mountain Bike Team &bull;
      <a href="https://centralmtb.com" style="color:#C2282D;">centralmtb.com</a>
    </div>
  </div>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------
exports.handler = async (event) => {
  // Only allow POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  try {
    const {
      recipientEmails, // array of parent email(s)
      subject,
      text,            // the (possibly edited) plain-text email
      riderFirst,
      ccEmails,        // optional: CC head coach / Rebecca
    } = JSON.parse(event.body);

    if (!recipientEmails || !recipientEmails.length || !text) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing required fields." }),
      };
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const html = textToHtml(text, riderFirst);

    const emailPayload = {
      from: "Central MTB <hello@centralmtb.com>",
      to: recipientEmails,
      subject: subject || `Welcome to Central MTB!`,
      text: text,
      html: html,
    };

    // CC head coach + Rebecca if provided
    if (ccEmails && ccEmails.length) {
      emailPayload.cc = ccEmails;
    }

    const result = await resend.emails.send(emailPayload);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Email sent!", id: result.data?.id }),
    };
  } catch (err) {
    console.error("approve-send error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
