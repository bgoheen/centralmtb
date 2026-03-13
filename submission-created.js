// submission-created.js
// Netlify automatically triggers this function when any form submission is received.
// It selects a seasonal email template, fills in the rider's info, and sends an
// approval email to Ben + head coach with a one-click "Approve & Send" link.

const { Resend } = require("resend");

// ---------------------------------------------------------------------------
// Season logic
// ---------------------------------------------------------------------------
function getSeason(date) {
  const m = date.getMonth(); // 0-indexed
  // In-season:  June (5) through September (8)
  // Pre-season: March (2) through May (4)
  // Off-season: October (9) through February (1)
  if (m >= 5 && m <= 8) return "in-season";
  if (m >= 2 && m <= 4) return "pre-season";
  return "off-season";
}

// ---------------------------------------------------------------------------
// Email templates — plain-text versions (sent to families)
// Each returns { subject, text, html }
// ---------------------------------------------------------------------------
function getTemplate(season, data) {
  const riderFirst = data["Rider First Name"] || "your rider";
  const parentFirst = data["Parent 1 First Name"] || "";

  const common = {
    hejaBlock: [
      "",
      "We handle all of our team communication and updates through the Heja app, so please make sure to download it and turn on notifications.",
      "",
      "Heja App: https://heja.io/download/WD027099",
      "Team code: WD-027099",
      "",
    ].join("\n"),
    signoff: [
      "Rebecca and I are happy to help with any other questions. You can find us on Heja, or just shoot us a text or email.",
      "",
      `We're looking forward to having ${riderFirst} on the team!`,
      "",
      "Ben Goheen",
      "Team Admin, St. Paul Central Mountain Bike Team",
      "hello@centralmtb.com | centralmtb.com",
    ].join("\n"),
  };

  const greeting = parentFirst ? `Hi ${parentFirst},` : "Hi,";

  if (season === "pre-season") {
    return {
      subject: `Welcome to Central MTB, ${riderFirst}!`,
      text: [
        greeting,
        "",
        "Thanks for reaching out! My name is Ben Goheen, and I'm the team admin. I've copied our head coach and my wife, Rebecca, here as well.",
        "",
        "Registration for the team and the Minnesota Cycling Association (MCA) opens on April 1st, and practices will start in early July.",
        common.hejaBlock,
        common.signoff,
      ].join("\n"),
    };
  }

  if (season === "in-season") {
    return {
      subject: `Welcome to Central MTB, ${riderFirst}!`,
      text: [
        greeting,
        "",
        "Thanks for reaching out! My name is Ben Goheen, and I'm the team admin. I've copied our head coach and my wife, Rebecca, here as well.",
        "",
        "Great news: the season is underway and practices are happening now! We will get you the details on joining a practice and completing registration so you can jump right in.",
        common.hejaBlock,
        common.signoff,
      ].join("\n"),
    };
  }

  // off-season (default)
  return {
    subject: `Welcome to Central MTB, ${riderFirst}!`,
    text: [
      greeting,
      "",
      "Thanks for reaching out! My name is Ben Goheen, and I'm the team admin. I've copied our head coach and my wife, Rebecca, here as well.",
      "",
      "The season is still a ways off, but we are glad you are interested! Registration for the team and the Minnesota Cycling Association (MCA) typically opens on April 1st, and practices start in early July. We will reach out again closer to the season with all the details.",
      "",
      "In the meantime, feel free to check out our Parent Guide at centralmtb.com/parent-guide for information about the team, equipment, costs, and what to expect.",
      common.hejaBlock,
      common.signoff,
    ].join("\n"),
  };
}

// ---------------------------------------------------------------------------
// Build the approval email HTML (sent to Ben + head coach)
// ---------------------------------------------------------------------------
function buildApprovalEmail(season, data, draftText, siteUrl) {
  const riderFirst = data["Rider First Name"] || "Unknown";
  const riderLast = data["Rider Last Name"] || "";
  const riderGrade = data["Rider Grade"] || "";
  const p1Email = data["Parent 1 Email"] || "";
  const p2Email = data["Parent 2 Email"] || "";
  const hasBike = data["Has Mountain Bike"] || "";
  const experience = data["Biking Experience"] || "";

  // Build approval URL with all necessary data encoded
  const payload = Buffer.from(
    JSON.stringify({ season, data, draftText })
  ).toString("base64");

  const approvePageUrl = `${siteUrl}/approve?payload=${encodeURIComponent(payload)}`;

  const seasonLabel =
    season === "pre-season"
      ? "Pre-Season"
      : season === "in-season"
      ? "In-Season"
      : "Off-Season";

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

    <!-- Rider summary -->
    <div style="padding:24px 32px;border-bottom:1px solid #e5e5e5;">
      <h2 style="margin:0 0 12px;font-size:15px;text-transform:uppercase;letter-spacing:0.05em;color:#C2282D;">Rider Info</h2>
      <table style="font-size:14px;color:#333;line-height:1.6;">
        <tr><td style="padding-right:16px;color:#777;">Name</td><td>${riderFirst} ${riderLast}</td></tr>
        <tr><td style="padding-right:16px;color:#777;">Grade</td><td>${riderGrade}</td></tr>
        <tr><td style="padding-right:16px;color:#777;">Parent Email</td><td>${p1Email}${p2Email ? ", " + p2Email : ""}</td></tr>
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

    const resend = new Resend(process.env.RESEND_API_KEY);
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
    await resend.emails.send({
      from: "Central MTB <hello@centralmtb.com>",
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
