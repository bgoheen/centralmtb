// submission-created.js
// Netlify automatically triggers this function when any form submission is received.
// It selects a seasonal email template, fills in the rider's info, and sends an
// approval email to Ben with a one-click "Approve & Send" link.

const https = require("https");

// ---------------------------------------------------------------------------
// Brevo send helper (uses their REST API directly — no SDK needed)
// ---------------------------------------------------------------------------
function sendEmail({ apiKey, from, to, subject, html }) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      sender: from,
      to: to.map((email) => ({ email })),
      subject,
      htmlContent: html,
    });

    const options = {
      hostname: "api.brevo.com",
      path: "/v3/smtp/email",
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(payload),
      },
    };

    const req = https.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(body || "{}"));
        } else {
          reject(new Error(`Brevo API ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

// ---------------------------------------------------------------------------
// Season logic
// ---------------------------------------------------------------------------
function getSeason(date) {
  const m = date.getMonth(); // 0-indexed (0=Jan, 11=Dec)
  const d = date.getDate();

  // Registration Open: April 1 (m=3,d>=1) through June 30 (m=5)
  if ((m === 3 && d >= 1) || m === 4 || m === 5) return "registration-open";

  // Early Season (can still join): July 1 (m=6) through August 31 (m=7)
  if (m === 6 || m === 7) return "early-season";

  // Late Season (suggest next year): September 1 (m=8) through October 14 (m=9,d<=14)
  if (m === 8 || (m === 9 && d <= 14)) return "late-season";

  // Off-Season: October 15 (m=9,d>=15) through March 31 (m=2)
  return "off-season";
}

// ---------------------------------------------------------------------------
// Email templates — plain-text versions (sent to families)
// Each returns { subject, text }
// ---------------------------------------------------------------------------
function getTemplate(season, data) {
  const riderFirst = data["Rider First Name"] || "there";
  const parentFirst = data["Parent 1 First Name"] || "";
  const parent2First = data["Parent 2 First Name"] || "";

  const common = {
    hejaBlock: [
      "",
      "We handle all of our team communication and updates through an app called Heja. Please make sure to download it and turn on notifications.",
      "",
      "Heja App: https://heja.io/download/PF057607",
      "Team code: PF-057607",
      "",
    ].join("\n"),
    signoff: [
      "Rebecca and I are happy to help with any other questions. You can find us on Heja, or just send us a text or email.",
      "",
      "We're looking forward to having you on the team!",
      "",
      "Ben Goheen",
      "651-983-4040",
      "",
      "Rebecca Goheen",
      "651-442-0653",
    ].join("\n"),
  };

  // Build greeting: "Hi RiderName (and Parent1, and Parent2),"
  let greeting = `Hi ${riderFirst}`;
  if (parentFirst && parent2First) {
    greeting += ` (and ${parentFirst} and ${parent2First})`;
  } else if (parentFirst) {
    greeting += ` (and ${parentFirst})`;
  }
  greeting += ",";

  const intro = "Thanks for reaching out! My name is Ben Goheen, and I'm the team admin. I've copied our head coach and my wife, Rebecca, here as well.";

  if (season === "registration-open") {
    return {
      subject: `Welcome to Central MTB, ${riderFirst}!`,
      text: [
        greeting,
        "",
        "My name is Ben Goheen and I'm the team admin. I've copied our head coach and my wife, Rebecca, here as well.",
        "",
        "Registration for the team and the league (Minnesota Cycling Association) is now open and practices will start in early July. Join the team by registering here:",
        "",
        "https://ccnbikes.com/#!/events/st-paul-central-2026",
        "Passcode: Central2026",
        common.hejaBlock,
        common.signoff,
      ].join("\n"),
    };
  }

  if (season === "early-season") {
    return {
      subject: `Welcome to Central MTB, ${riderFirst}!`,
      text: [
        greeting,
        "",
        intro,
        "",
        "Great news: the season is underway and practices are happening now! We will get you the details on joining a practice and completing registration so you can jump right in.",
        common.hejaBlock,
        common.signoff,
      ].join("\n"),
    };
  }

  if (season === "late-season") {
    return {
      subject: `Welcome to Central MTB, ${riderFirst}!`,
      text: [
        greeting,
        "",
        intro,
        "",
        "The season is well underway at this point, so the best time to join would be next year. Registration opens on April 1st and practices start in early July. In the meantime, feel free to check out our Parent Guide at https://centralmtb.com/parent-guide for information about the team, equipment, costs, and what to expect.",
        common.hejaBlock,
        common.signoff,
      ].join("\n"),
    };
  }

  // off-season (default): October 15 - March 31
  return {
    subject: `Welcome to Central MTB, ${riderFirst}!`,
    text: [
      greeting,
      "",
      intro,
      "",
      "We are glad you are interested in joining the team! Registration for the team and the Minnesota Cycling Association (MCA) opens on April 1st, and practices start in early July. We will reach out again closer to the season with all the details.",
      "",
      "In the meantime, feel free to check out our Parent Guide at https://centralmtb.com/parent-guide for information about the team, equipment, costs, and what to expect.",
      common.hejaBlock,
      common.signoff,
    ].join("\n"),
  };
}

// ---------------------------------------------------------------------------
// Build the approval email HTML (sent to Ben)
// ---------------------------------------------------------------------------
function buildApprovalEmail(season, data, draftText, siteUrl) {
  const riderFirst = data["Rider First Name"] || "Unknown";
  const riderLast = data["Rider Last Name"] || "";
  const riderPhone = data["Rider Phone"] || "";
  const riderEmail = data["Rider Email"] || "";
  const riderGrade = data["Rider Grade"] || "";
  const riderGender = data["Rider Gender"] || "";
  const p1First = data["Parent 1 First Name"] || "";
  const p1Last = data["Parent 1 Last Name"] || "";
  const p1Phone = data["Parent 1 Phone"] || "";
  const p1Email = data["Parent 1 Email"] || "";
  const p2First = data["Parent 2 First Name"] || "";
  const p2Last = data["Parent 2 Last Name"] || "";
  const p2Phone = data["Parent 2 Phone"] || "";
  const p2Email = data["Parent 2 Email"] || "";
  const hasBike = data["Has Mountain Bike"] || "";
  const experience = data["Biking Experience"] || "";

  // Build approval URL with all necessary data encoded
  const payload = Buffer.from(
    JSON.stringify({ season, data, draftText })
  ).toString("base64");

  const approvePageUrl = `${siteUrl}/approve?payload=${encodeURIComponent(payload)}`;

  const seasonLabels = {
    "registration-open": "Registration Open",
    "early-season": "Early Season",
    "late-season": "Late Season",
    "off-season": "Off-Season",
  };
  const seasonLabel = seasonLabels[season] || season;

  // Build Parent 2 rows only if provided
  const parent2Rows = p2First ? `
        <tr><td colspan="2" style="padding-top:12px;"><strong style="color:#C2282D;font-size:13px;text-transform:uppercase;letter-spacing:0.04em;">Parent / Guardian 2</strong></td></tr>
        <tr><td style="padding-right:16px;color:#777;">Name</td><td>${p2First} ${p2Last}</td></tr>
        <tr><td style="padding-right:16px;color:#777;">Phone</td><td>${p2Phone}</td></tr>
        <tr><td style="padding-right:16px;color:#777;">Email</td><td>${p2Email}</td></tr>` : "";

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <div style="max-width:600px;margin:24px auto;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

    <!-- Header -->
    <div style="background:#0f1114;padding:24px 32px;">
      <h1 style="margin:0;color:#fff;font-size:20px;font-weight:700;">
        New Signup: ${riderFirst} ${riderLast}
      </h1>
      <p style="margin:4px 0 0;color:#aaa;font-size:14px;">
        Template: <strong style="color:#C2282D;">${seasonLabel}</strong>
      </p>
    </div>

    <!-- Full form details -->
    <div style="padding:24px 32px;border-bottom:1px solid #e5e5e5;">
      <table style="font-size:14px;color:#333;line-height:1.6;width:100%;">
        <tr><td colspan="2"><strong style="color:#C2282D;font-size:13px;text-transform:uppercase;letter-spacing:0.04em;">Rider Information</strong></td></tr>
        <tr><td style="padding-right:16px;color:#777;width:120px;">Name</td><td>${riderFirst} ${riderLast}</td></tr>
        <tr><td style="padding-right:16px;color:#777;">Phone</td><td>${riderPhone}</td></tr>
        <tr><td style="padding-right:16px;color:#777;">Email</td><td>${riderEmail}</td></tr>
        <tr><td style="padding-right:16px;color:#777;">Grade</td><td>${riderGrade}</td></tr>
        <tr><td style="padding-right:16px;color:#777;">Gender</td><td>${riderGender}</td></tr>

        <tr><td colspan="2" style="padding-top:12px;"><strong style="color:#C2282D;font-size:13px;text-transform:uppercase;letter-spacing:0.04em;">Parent / Guardian 1</strong></td></tr>
        <tr><td style="padding-right:16px;color:#777;">Name</td><td>${p1First} ${p1Last}</td></tr>
        <tr><td style="padding-right:16px;color:#777;">Phone</td><td>${p1Phone}</td></tr>
        <tr><td style="padding-right:16px;color:#777;">Email</td><td>${p1Email}</td></tr>
        ${parent2Rows}

        <tr><td colspan="2" style="padding-top:12px;"><strong style="color:#C2282D;font-size:13px;text-transform:uppercase;letter-spacing:0.04em;">Experience</strong></td></tr>
        <tr><td style="padding-right:16px;color:#777;">Has Bike</td><td>${hasBike}</td></tr>
        <tr><td style="padding-right:16px;color:#777;vertical-align:top;">Experience</td><td>${experience}</td></tr>
      </table>
    </div>

    <!-- Draft preview -->
    <div style="padding:24px 32px;border-bottom:1px solid #e5e5e5;">
      <h2 style="margin:0 0 12px;font-size:15px;text-transform:uppercase;letter-spacing:0.05em;color:#C2282D;">Email Draft Preview</h2>
      <div style="background:#fafafa;padding:16px;border-radius:8px;font-size:14px;color:#333;white-space:pre-wrap;line-height:1.6;">${draftText}</div>
    </div>

    <!-- Action buttons -->
    <div style="padding:24px 32px;text-align:center;">
      <a href="${approvePageUrl}"
         style="display:inline-block;background:#C2282D;color:#fff;padding:14px 36px;border-radius:8px;font-size:15px;font-weight:600;text-decoration:none;">
        Review &amp; Send
      </a>
      <p style="margin:12px 0 0;font-size:13px;color:#999;">
        Click above to preview, edit if needed, and approve sending.
      </p>
    </div>

  </div>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------
exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const data = body.payload?.data || body.data || {};

    // Skip bot submissions
    if (data["bot-field"]) {
      return { statusCode: 200, body: "Bot detected, skipping." };
    }

    const apiKey = process.env.BREVO_API_KEY;
    const siteUrl = process.env.URL || "https://centralmtb.com";
    const adminEmail = process.env.ADMIN_EMAIL || "bgoheen@gmail.com";
    const rebeccaEmail = process.env.REBECCA_EMAIL || "rebeccagoheen1@gmail.com";

    const season = getSeason(new Date());
    const template = getTemplate(season, data);
    const approvalHtml = buildApprovalEmail(
      season,
      data,
      template.text,
      siteUrl
    );

    // Send approval email to Ben + Rebecca
    await sendEmail({
      apiKey,
      from: { email: "hello@centralmtb.com", name: "Central MTB" },
      to: [adminEmail, rebeccaEmail],
      subject: `[Action Required] New Signup: ${data["Rider First Name"] || "Unknown"} ${data["Rider Last Name"] || ""}`,
      html: approvalHtml,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Approval email sent." }),
    };
  } catch (err) {
    console.error("submission-created error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
