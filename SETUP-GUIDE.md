# Central MTB Welcome Email System — Setup Guide

## Overview

When someone fills out the join form at centralmtb.com/join:

1. Netlify detects the form submission
2. A serverless function picks the right seasonal template and fills in the rider's info
3. You and the head coach get a notification email with a "Review & Send" button
4. Clicking that button opens a branded approval page where you can preview, edit the message, manage CC recipients, and send
5. The final welcome email is sent from hello@centralmtb.com via Resend

### Seasonal Templates

| Season | Months | Key Message |
|--------|--------|-------------|
| **Off-Season** | Oct - Feb | "Season is a ways off, registration opens April 1, check out Parent Guide" |
| **Pre-Season** | Mar - May | "Registration opens April 1, practices start early July, download Heja" |
| **In-Season** | Jun - Sep | "Season is underway, we'll get you set up to jump right in" |

---

## Files to Add to Your Repo

```
centralmtb/
├── netlify/
│   └── functions/
│       ├── submission-created.js   ← triggered on form submit
│       └── approve-send.js         ← triggered when you click approve
├── approve.html                    ← the approval/editing page
└── package.json                    ← add "resend" dependency
```

### Important Notes

- `submission-created.js` is a **special Netlify function name**. Netlify automatically triggers any function with this name when a form submission comes in. You don't need to configure a webhook.
- `approve.html` goes in the root of your repo alongside your other pages.
- The `package.json` at the root needs the `resend` dependency. If you already have a `package.json`, just add `"resend": "^4.0.0"` to the dependencies.

---

## Step-by-Step Setup

### 1. Create a Resend Account

1. Go to [resend.com](https://resend.com) and sign up (free tier: 100 emails/day)
2. From the dashboard, go to **Domains** → **Add Domain**
3. Enter `centralmtb.com`
4. Resend will give you DNS records to add (see next step)

### 2. Add DNS Records at Namecheap

Resend will provide 3-4 records. Go to Namecheap → Domain List → centralmtb.com → Advanced DNS and add them. They'll look something like:

| Type  | Host                        | Value                          |
|-------|-----------------------------|--------------------------------|
| TXT   | @                           | v=spf1 include:resend.com ~all |
| CNAME | resend._domainkey           | (provided by Resend)           |
| CNAME | (another key)               | (provided by Resend)           |

**Watch for conflicts:**
- If you already have an SPF record (TXT record starting with `v=spf1`), **merge** the Resend include into it rather than adding a second one. Example: `v=spf1 include:_spf.namecheap.com include:resend.com ~all`
- Don't remove any existing records for Namecheap email forwarding

After adding, click **Verify** in Resend. It can take a few minutes to propagate.

### 3. Get Your Resend API Key

1. In Resend, go to **API Keys** → **Create API Key**
2. Name it something like "Central MTB Production"
3. Give it **Send access** for the `centralmtb.com` domain
4. Copy the key (starts with `re_`)

### 4. Add Environment Variables in Netlify

Go to Netlify → centralmtb site → **Site settings** → **Environment variables** and add:

| Key               | Value                                |
|-------------------|--------------------------------------|
| `RESEND_API_KEY`  | `re_your_api_key_here`               |
| `ADMIN_EMAIL`     | `bgoheen@gmail.com`                  |
| `REBECCA_EMAIL`   | `rebeccagoheen1@gmail.com`           |

### 5. Add Files to Your Repo

Copy the provided files into your repo:

```bash
# From the downloaded files:
cp submission-created.js  your-repo/netlify/functions/
cp approve-send.js        your-repo/netlify/functions/
cp approve.html           your-repo/
```

Update your `package.json` to include Resend:
```json
{
  "dependencies": {
    "resend": "^4.0.0"
  }
}
```

### 6. Push & Test

```bash
git add .
git commit -m "Add welcome email approval workflow"
git push
```

Once deployed, submit a test entry through the join form. You and the head coach should each receive the approval email within a few seconds.

---

## How It Works Day-to-Day

1. **New signup comes in** → you get an email with the rider's info and a "Review & Send" button
2. **Click "Review & Send"** → opens a page showing the draft email, pre-filled with the seasonal template
3. **Edit if needed** → tweak the wording, adjust CC recipients, change the subject
4. **Click "Approve & Send"** → the welcome email goes out from hello@centralmtb.com

The approval page works on mobile too, so you can approve from your phone.

---

## Customizing Templates

The three templates live in `submission-created.js` in the `getTemplate()` function. Each is plain text that gets converted to branded HTML on send. To edit a template, just update the text strings in that function and push to GitHub.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| No notification email after form submit | Check Netlify Functions log (Netlify dashboard → Functions). Verify `RESEND_API_KEY` env var is set. |
| "Review & Send" link doesn't work | The payload in the URL may be too long for some email clients. Try opening in a desktop browser. |
| Email lands in spam | Make sure DNS records are verified in Resend. Check SPF/DKIM alignment. |
| Want to change season dates | Edit the `getSeason()` function in `submission-created.js`. |
