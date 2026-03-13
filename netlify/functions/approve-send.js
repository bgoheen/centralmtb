// approve-send.js
// Called from the approval page when Ben or Rebecca clicks "Send".
// Receives the (possibly edited) email text + recipient info and sends via Brevo.

const https = require("https");

// ---------------------------------------------------------------------------
// Brevo send helper (uses their REST API directly — no SDK needed)
// ---------------------------------------------------------------------------
function sendEmail({ apiKey, from, to, cc, subject, text, html }) {
  const payload = {
    sender: from,
    to: to.map((email) => ({ email })),
    subject,
    htmlContent: html,
    textContent: text,
  };

  if (cc && cc.length) {
    payload.cc = cc.map((email) => ({ email }));
  }

  const body = JSON.stringify(payload);

  return new Promise((resolve, reject) => {
    const options = {
      hostname: "api.brevo.com",
      path: "/v3/smtp/email",
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(data || "{}"));
        } else {
          reject(new Error(`Brevo API ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

// ---------------------------------------------------------------------------
// Build a clean, branded HTML email from plain text
// ---------------------------------------------------------------------------
function textToHtml(text) {
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

    const apiKey = process.env.BREVO_API_KEY;
    const html = textToHtml(text);

    await sendEmail({
      apiKey,
      from: { email: "hello@centralmtb.com", name: "Central MTB" },
      to: recipientEmails,
      cc: ccEmails,
      subject: subject || "Welcome to Central MTB!",
      text: text,
      html: html,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Email sent!" }),
    };
  } catch (err) {
    console.error("approve-send error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
