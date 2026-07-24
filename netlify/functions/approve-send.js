// approve-send.js
// Called from the approval page when Ben or Rebecca clicks "Send".
// Receives the (possibly edited) email text + recipient info and sends via Brevo.

const https = require("https");

// ---------------------------------------------------------------------------
// Brevo send helper (uses their REST API directly — no SDK needed)
// ---------------------------------------------------------------------------
function sendEmail({ apiKey, from, to, cc, bcc, subject, text }) {
  // Brevo requires htmlContent — convert plain text to simple HTML
  const simpleHtml = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1">$1</a>')
    .replace(/\n/g, "<br>");

  const payload = {
    sender: from,
    to: to.map((email) => ({ email })),
    subject,
    htmlContent: simpleHtml,
    textContent: text,
  };

  if (cc && cc.length) {
    payload.cc = cc.map((email) => ({ email }));
  }

  if (bcc && bcc.length) {
    payload.bcc = bcc.map((email) => ({ email }));
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
    const bccEmail = process.env.ADMIN_EMAIL || "bgoheen@gmail.com";

    await sendEmail({
      apiKey,
      from: { email: "hello@centralmtb.com", name: "Central MTB" },
      to: recipientEmails,
      cc: ccEmails,
      bcc: [bccEmail],
      subject: subject || "Welcome to Central MTB!",
      text: text,
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
