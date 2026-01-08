# Email Notifications Setup Guide

## Overview

The Digital Permit System (DPS) now includes automatic email notifications for:
1. **New Permit Submissions** - Notifies approvers and safety officers when a requester submits a permit
2. **Comments on Permits** - Notifies relevant stakeholders when comments are added at any stage
3. **Approval Status Updates** - Notifies affected parties when a permit is approved, rejected, or pending

## How It Works

### System Architecture

The email notification system consists of three main components:

1. **Client-Side (React)**
   - Forms and comment submissions trigger email notifications
   - Uses `email-service.ts` to call backend APIs
   - Provides user feedback via toast notifications

2. **Server-Side (Express + Nodemailer)**
   - Handles email delivery using Nodemailer
   - Provides three REST endpoints:
     - `POST /api/notify/permit-submission` - Send new permit notifications
     - `POST /api/notify/comment` - Send comment notifications
     - `POST /api/notify/approval` - Send approval status notifications

3. **User Management**
   - Uses `user-lookup.ts` to find user emails from a sample user database
   - In production, integrate with your actual LDAP/AD or user database

### Email Flow Example

**When a Requester Submits a Permit:**
```
Requester fills form → Click "Submit Permit"
  ↓
PermitDetails.tsx submit() function executes
  ↓
Calls sendPermitSubmissionNotification()
  ↓
Sends POST /api/notify/permit-submission
  ↓
Server validates and sends emails to:
  - Approver 1 (if name is filled)
  - Approver 2 (if name is filled)
  - Safety Officer (if name is filled)
  ↓
Each recipient receives formatted email with permit details
```

## Setup Instructions

### Step 1: Configure Environment Variables

Create a `.env` file in the root directory (or update your deployment platform's env vars) with email configuration:

```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@dps.local
```

### Step 2: Choose Your Email Provider

#### Option A: Gmail (Easiest for Testing)

1. Enable 2-factor authentication on your Gmail account
2. Generate an [App Password](https://myaccount.google.com/apppasswords)
3. Use the generated password as `EMAIL_PASSWORD`

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
```

#### Option B: SendGrid (Production Recommended)

1. Sign up at [SendGrid](https://sendgrid.com)
2. Create an API key
3. Use SendGrid SMTP settings:

```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=apikey
EMAIL_PASSWORD=SG.xxxxxxxxxxxxx
```

#### Option C: Mailgun

1. Sign up at [Mailgun](https://www.mailgun.com)
2. Verify your domain
3. Use Mailgun SMTP settings:

```env
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=postmaster@your-domain.mailgun.org
EMAIL_PASSWORD=your-mailgun-password
```

#### Option D: Corporate SMTP Server

If your organization has an SMTP server, configure with:

```env
EMAIL_HOST=mail.yourdomain.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-username
EMAIL_PASSWORD=your-password
```

### Step 3: Restart the Development Server

After setting environment variables:

```bash
npm run dev
```

The email service will be available for use.

### Step 4: Test the Email System

1. Log in as a Requester
2. Fill out a Work Permit form
3. In the "Requester Details" section, fill in:
   - Applicant Name (your name)
   - Permit Approver 1 (e.g., "John Doe")
   - Permit Approver 2 (optional)
   - Safety Manager (e.g., "Maria Gonzalez")
4. Click "Submit Permit"
5. Check the email addresses of the approvers and safety officers for notifications

## Customizing User Email Mapping

Currently, the system uses sample user data in `client/lib/user-lookup.ts`. To integrate with your actual user database:

1. **Option A: Update Sample Users**
   - Edit `SAMPLE_USERS` array in `client/lib/user-lookup.ts`
   - Add your actual users with their real emails

2. **Option B: Connect to Backend**
   - Create a server endpoint `/api/users` that returns user data
   - Modify `user-lookup.ts` to fetch users from the API instead of local data
   - Example:

```typescript
export const findUserByName = async (name: string): Promise<UserData | undefined> => {
  const response = await fetch('/api/users?search=' + encodeURIComponent(name));
  const users = await response.json();
  return users[0];
};
```

3. **Option C: Integrate with LDAP/AD**
   - Create a server endpoint that queries your LDAP/Active Directory
   - Example endpoint: `/api/users/search?query=John`

## Email Templates

The system includes three pre-built email templates:

### 1. New Permit Request Email

**Sent to:** Approvers and Safety Officers
**When:** A requester submits a new permit
**Includes:**
- Permit details (ID, type, location)
- Requester information
- Permit description
- List of recipients

### 2. Comment Notification Email

**Sent to:** Relevant stakeholders
**When:** Anyone adds a comment at any stage
**Includes:**
- Sender name and role (Requester, Approver, or Safety Officer)
- Comment text (formatted with line breaks)
- Permit ID and type
- List of recipients

### 3. Approval Status Email

**Sent to:** Requester and other stakeholders
**When:** Approver or Safety Officer updates the permit status
**Includes:**
- Approval status (Approved/Rejected/Pending)
- Reviewer name
- Status color indicator
- Optional comment from reviewer

## Customizing Email Templates

To modify email templates, edit the template functions in `server/lib/email.ts`:

```typescript
export const emailTemplates = {
  newPermitRequest: (data) => {
    return {
      subject: `Custom subject`,
      html: `<h1>Custom HTML template</h1>`
    };
  }
};
```

## Troubleshooting

### Emails Not Sending

1. **Check environment variables:**
   ```bash
   # In DevServerControl, verify EMAIL_USER and EMAIL_HOST are set
   ```

2. **Check email credentials:**
   - Verify SMTP credentials are correct
   - For Gmail, ensure you're using an App Password (not your Google password)
   - For SendGrid, verify API key format (should start with `SG.`)

3. **Check server logs:**
   - Look for errors in the dev server console
   - Check network tab in browser DevTools for failed API calls

### "EAUTH: Authentication failed"

This usually means incorrect email credentials:
- Gmail: Enable 2FA and use App Password
- SendGrid: Verify API key is correct
- Other: Test SMTP credentials using telnet or online SMTP tools

### "ECONNREFUSED"

SMTP server is not reachable:
- Verify EMAIL_HOST is correct
- Check if firewall is blocking port 587 or 465
- Verify network connectivity

### Emails going to spam

1. Add SPF/DKIM records to your domain
2. Use a dedicated email service (SendGrid, Mailgun) instead of Gmail for production
3. Customize the `EMAIL_FROM` address to match your domain

## Production Deployment

### On Netlify:

1. Go to Site settings → Environment → Environment variables
2. Add the same email configuration variables:
   - `EMAIL_HOST`
   - `EMAIL_PORT`
   - `EMAIL_SECURE`
   - `EMAIL_USER`
   - `EMAIL_PASSWORD`
   - `EMAIL_FROM`
3. Deploy your changes
4. The Netlify Function will use these environment variables

### On Docker:

Pass environment variables when running the container:

```bash
docker run \
  -e EMAIL_HOST=smtp.gmail.com \
  -e EMAIL_PORT=587 \
  -e EMAIL_USER=your-email@gmail.com \
  -e EMAIL_PASSWORD=your-app-password \
  your-app:latest
```

### On Other Platforms:

Use your platform's environment variable management:
- Vercel: Project Settings → Environment Variables
- Heroku: Config Vars
- AWS: Environment variables in Lambda/CodeBuild
- Azure: Application settings

## Integration Points

Email notifications are triggered at these points:

### Client-Side (React Components)

1. **PermitDetails.tsx**
   - `submit()` function - Sends permit submission emails
   - Comment "Add" button handlers - Sends comment emails

2. **ApproverPermitDetails.tsx**
   - Comment "Add" button handlers - Sends comment emails to requester and safety officer

3. **SafetyPermitDetails.tsx**
   - Comment "Add" button handlers - Sends comment emails to requester and approver

### Server-Side Routes

```
POST /api/notify/permit-submission
- requesterName: string
- requesterEmail: string
- permitType: "work" | "ht" | "gas"
- permitId: string
- approvers?: string[]
- safetyOfficers?: string[]
- permitDetails: object

POST /api/notify/comment
- senderName: string
- senderRole: "requester" | "approver" | "safety"
- permitType: "work" | "ht" | "gas"
- permitId: string
- comment: string
- recipients?: string[]

POST /api/notify/approval
- approverName: string
- permitType: "work" | "ht" | "gas"
- permitId: string
- status: "approved" | "rejected" | "pending"
- comment?: string
- recipients?: string[]
```

## API Error Handling

The email service gracefully handles errors:

1. **Partial failures:** If some emails fail to send, others continue
2. **User feedback:** Toast notifications inform users of success/failure
3. **Server logging:** All email send attempts are logged to console
4. **Graceful degradation:** If no recipients are specified, the submission still succeeds

## Security Considerations

1. **Email Credentials:**
   - Store in environment variables, never in code
   - Use app-specific passwords for Gmail, not your main password
   - For production, use a service account with minimal permissions

2. **Email Content:**
   - Avoid including sensitive data (passwords, tokens) in emails
   - Use standard templates to prevent injection

3. **Rate Limiting:**
   - Consider adding rate limiting for email sending
   - Implement in production: `npm install express-rate-limit`

4. **Verification:**
   - Consider adding email verification before sending critical emails
   - Use email validation before storing addresses

## Future Enhancements

Potential improvements to the email notification system:

1. **Email Scheduling:** Queue emails for batch sending at specific times
2. **Template Engine:** Use Handlebars or EJS for more dynamic templates
3. **Unsubscribe Links:** Add ability for users to manage notification preferences
4. **Attachments:** Include permit PDFs or documents in emails
5. **Multi-language:** Support multiple languages for email content
6. **Tracking:** Track email opens and clicks (requires service like SendGrid)

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review server console logs for error messages
3. Test email credentials using SMTP diagnostic tools
4. Contact your email service provider support
