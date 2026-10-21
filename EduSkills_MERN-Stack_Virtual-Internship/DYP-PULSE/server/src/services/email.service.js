import nodemailer from 'nodemailer';
import config from '../config/index.js';

// In-memory record for test suite verification and inspection
let sentEmails = [];

/**
 * Get in-memory sent emails (for automated testing assertions)
 */
export const getSentEmails = () => [...sentEmails];

/**
 * Clear in-memory sent emails
 */
export const clearSentEmails = () => {
  sentEmails = [];
};

/**
 * Get the last sent email
 */
export const getLastSentEmail = () => sentEmails[sentEmails.length - 1] || null;

// Transporter instance cache
let transporterInstance = null;

/**
 * Create or return Nodemailer transporter based on config
 */
const getTransporter = async () => {
  if (transporterInstance) return transporterInstance;

  const provider = config.email.provider.toLowerCase();

  if (provider === 'smtp') {
    transporterInstance = nodemailer.createTransport({
      host: config.email.smtpHost,
      port: config.email.smtpPort,
      secure: config.email.smtpSecure,
      auth: {
        user: config.email.smtpUser,
        pass: config.email.smtpPass
      }
    });
    return transporterInstance;
  }

  if (provider === 'ethereal') {
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporterInstance = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      console.log(`[Email] Ethereal test inbox created: ${testAccount.user}`);
      return transporterInstance;
    } catch (err) {
      console.warn('[Email] Failed to create Ethereal account, falling back to mock:', err.message);
    }
  }

  // Fallback / default: Mock provider for testing & dev
  transporterInstance = {
    sendMail: async (mailOptions) => {
      return {
        messageId: `mock-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        response: '250 Mock email accepted',
        envelope: { from: mailOptions.from, to: mailOptions.to }
      };
    }
  };

  return transporterInstance;
};

/**
 * Helper to wrap email content in DYPULSE branded layout
 */
const wrapBrandedLayout = ({ title, preheader, contentHtml }) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1E293B; }
    table { border-collapse: collapse; }
    .btn { display: inline-block; padding: 12px 28px; background-color: #2677FF; color: #FFFFFF !important; text-decoration: none; border-radius: 9999px; font-weight: bold; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: bold; text-transform: uppercase; }
  </style>
</head>
<body style="margin: 0; padding: 20px 0; background-color: #F8FAFC;">
  <span style="display: none !important; visibility: hidden; mso-hide: all; font-size: 1px; color: #F8FAFC; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    ${preheader || title}
  </span>
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #FFFFFF; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px rgba(11, 23, 48, 0.08); border: 1px solid #E2E8F0;" border="0" cellspacing="0" cellpadding="0">
          
          <!-- Header Bar -->
          <tr>
            <td style="background-color: #0B1730; padding: 28px 32px; text-align: left; border-bottom: 2px solid #2677FF;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="font-size: 24px; font-weight: 900; letter-spacing: -0.5px; color: #FFFFFF;">
                      DY<span style="color: #2677FF;">PULSE</span>
                    </div>
                    <div style="font-size: 10px; font-weight: 700; color: #94A3B8; text-transform: uppercase; letter-spacing: 1.5px; margin-top: 4px;">
                      Feel the Campus. Live the Game.
                    </div>
                  </td>
                  <td align="right">
                    <span style="background-color: rgba(38, 119, 255, 0.15); color: #38BDF8; font-size: 11px; font-weight: bold; padding: 4px 12px; border-radius: 9999px; border: 1px solid rgba(56, 189, 248, 0.3);">
                      VARSITY STORE
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content Body -->
          <tr>
            <td style="padding: 36px 32px; background-color: #FFFFFF;">
              ${contentHtml}
            </td>
          </tr>

          <!-- Footer Bar -->
          <tr>
            <td style="background-color: #F1F5F9; padding: 24px 32px; text-align: center; border-top: 1px solid #E2E8F0;">
              <p style="margin: 0; font-size: 12px; color: #64748B; font-weight: 500;">
                © ${new Date().getFullYear()} DYPULSE Inc. Built for Collegiate Champions & Varsity Athletes.
              </p>
              <p style="margin: 6px 0 0 0; font-size: 11px; color: #94A3B8;">
                Need campus hostel drop-off help? Reply directly to this dispatch or contact your varsity coordinator.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

// Retry and Queue Mechanism
const emailQueue = [];
let isProcessingQueue = false;

/**
 * Process queue items sequentially with retry capability
 */
const processEmailQueue = async () => {
  if (isProcessingQueue || emailQueue.length === 0) return;
  isProcessingQueue = true;

  while (emailQueue.length > 0) {
    const job = emailQueue[0];

    try {
      const transporter = await getTransporter();
      const info = await transporter.sendMail(job.mailOptions);

      // Record successfully sent email in-memory
      sentEmails.push({
        to: job.mailOptions.to,
        from: job.mailOptions.from,
        subject: job.mailOptions.subject,
        text: job.mailOptions.text,
        html: job.mailOptions.html,
        type: job.type,
        messageId: info.messageId,
        sentAt: new Date()
      });

      if (job.resolve) job.resolve({ success: true, messageId: info.messageId });
      emailQueue.shift(); // Remove completed job
    } catch (error) {
      job.retries += 1;
      console.error(`[Email Queue] Failed sending to ${job.mailOptions.to} (attempt ${job.retries}/${job.maxRetries}):`, error.message);

      if (job.retries >= job.maxRetries) {
        // Exceeded retries, fail gracefully
        if (job.reject) job.reject(error);
        emailQueue.shift();
      } else {
        // Wait before retrying (exponential backoff: 300ms, 600ms, etc.)
        await new Promise((res) => setTimeout(res, job.retries * 300));
      }
    }
  }

  isProcessingQueue = false;
};

/**
 * Enqueue an email to be sent with retry protection
 */
export const queueEmail = ({ mailOptions, type = 'generic', maxRetries = 3 }) => {
  return new Promise((resolve, reject) => {
    emailQueue.push({
      mailOptions: {
        from: config.email.from,
        ...mailOptions
      },
      type,
      retries: 0,
      maxRetries,
      resolve,
      reject
    });

    // Trigger queue processing non-blockingly
    processEmailQueue().catch((err) => console.error('[Email Queue Error]:', err));
  });
};

/* =========================================================================
   EMAIL NOTIFICATION HANDLERS (7 CORE EVENTS)
   ========================================================================= */

/**
 * 1. Account Verification Email
 */
export const sendAccountVerificationEmail = async ({ user, verificationToken }) => {
  const verifyUrl = `${config.clientUrl}/verify-email?token=${verificationToken}`;
  const name = user.firstName || 'Collegiate Athlete';

  const contentHtml = `
    <h1 style="font-size: 20px; font-weight: 800; color: #0B1730; margin-top: 0;">Welcome to DYPULSE, ${name}! ⚡</h1>
    <p style="font-size: 14px; line-height: 1.6; color: #334155;">
      Your student sports & campus lifestyle account is almost ready. Please verify your email address to unlock official varsity gear, team kit reservations, and tournament drops.
    </p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${verifyUrl}" class="btn" style="background-color: #2677FF; color: #FFFFFF; padding: 14px 32px; border-radius: 9999px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">
        VERIFY MY EMAIL
      </a>
    </div>
    <p style="font-size: 12px; color: #64748B; line-height: 1.5;">
      If the button above does not work, copy and paste this link into your browser:<br>
      <a href="${verifyUrl}" style="color: #2677FF; word-break: break-all;">${verifyUrl}</a>
    </p>
    <p style="font-size: 12px; color: #94A3B8; margin-top: 24px;">
      This link will expire in 24 hours. If you did not create a DYPULSE account, please ignore this dispatch.
    </p>
  `;

  const text = `Welcome to DYPULSE, ${name}!\n\nPlease verify your student account by opening the following link:\n${verifyUrl}\n\nThis verification link expires in 24 hours.\n\n- The DYPULSE Team`;

  return queueEmail({
    mailOptions: {
      to: user.email,
      subject: 'Verify your DYPULSE Campus Account ⚡',
      text,
      html: wrapBrandedLayout({
        title: 'Verify your DYPULSE Account',
        preheader: 'Complete your registration to unlock varsity apparel & sports gear.',
        contentHtml
      })
    },
    type: 'account_verification'
  });
};

/**
 * 2. Password Reset Email
 */
export const sendPasswordResetEmail = async ({ user, resetToken }) => {
  const resetUrl = `${config.clientUrl}/reset-password/${resetToken}`;
  const name = user.firstName || 'Collegiate Athlete';

  const contentHtml = `
    <h1 style="font-size: 20px; font-weight: 800; color: #0B1730; margin-top: 0;">Password Reset Request</h1>
    <p style="font-size: 14px; line-height: 1.6; color: #334155;">
      Hello ${name}, we received a request to reset the password for your DYPULSE account. Click the button below to choose a new secure password:
    </p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetUrl}" class="btn" style="background-color: #FF7849; color: #FFFFFF; padding: 14px 32px; border-radius: 9999px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">
        RESET PASSWORD
      </a>
    </div>
    <p style="font-size: 12px; color: #64748B; line-height: 1.5;">
      Direct link:<br>
      <a href="${resetUrl}" style="color: #2677FF; word-break: break-all;">${resetUrl}</a>
    </p>
    <div style="background-color: #FEF2F2; border: 1px solid #FCA5A5; border-radius: 12px; padding: 12px 16px; margin-top: 24px;">
      <p style="margin: 0; font-size: 12px; color: #991B1B; font-weight: 500;">
        ⚠️ This link is valid for <strong>15 minutes only</strong>. If you did not request a password reset, your account is safe and you can discard this email.
      </p>
    </div>
  `;

  const text = `DYPULSE Password Reset\n\nHello ${name},\n\nClick the link below to reset your password:\n${resetUrl}\n\nThis link expires in 15 minutes.\n\n- The DYPULSE Security Team`;

  return queueEmail({
    mailOptions: {
      to: user.email,
      subject: 'DYPULSE Password Reset Instructions',
      text,
      html: wrapBrandedLayout({
        title: 'Reset your DYPULSE Password',
        preheader: 'Instructions to reset your password within 15 minutes.',
        contentHtml
      })
    },
    type: 'password_reset'
  });
};

/**
 * 3. Order Confirmation Email
 */
export const sendOrderConfirmationEmail = async ({ order, recipientEmail }) => {
  const email = recipientEmail || (order.user?.email ? order.user.email : '');
  const customerName = order.shippingAddress?.fullName || 'Collegiate Athlete';
  const orderNumber = order.orderNumber;
  const totalRupees = (order.totalInPaise / 100).toFixed(2);
  const subtotalRupees = (order.subtotalInPaise / 100).toFixed(2);
  const shippingRupees = (order.shippingChargeInPaise / 100).toFixed(2);
  const discountRupees = (order.discountInPaise / 100).toFixed(2);

  const itemsRows = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #E2E8F0; font-size: 13px; color: #1E293B;">
          <strong>${item.name}</strong>
          ${item.size || item.color ? `<div style="font-size: 11px; color: #64748B;">${[item.size, item.color].filter(Boolean).join(' • ')}</div>` : ''}
        </td>
        <td align="center" style="padding: 10px 0; border-bottom: 1px solid #E2E8F0; font-size: 13px; color: #1E293B;">
          ${item.quantity}
        </td>
        <td align="right" style="padding: 10px 0; border-bottom: 1px solid #E2E8F0; font-size: 13px; font-weight: bold; color: #0B1730;">
          ₹${((item.lineTotalInPaise || item.unitPriceInPaise * item.quantity) / 100).toFixed(2)}
        </td>
      </tr>`
    )
    .join('');

  const contentHtml = `
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <h1 style="font-size: 20px; font-weight: 800; color: #0B1730; margin: 0;">Order Confirmed! 📦</h1>
    </div>
    <p style="font-size: 14px; line-height: 1.6; color: #334155; margin-top: 12px;">
      Thanks, ${customerName}! Your order <strong>${orderNumber}</strong> has been placed and is being prepped for dispatch.
    </p>

    <div style="background-color: #F8FAFC; border-radius: 12px; padding: 16px; margin: 20px 0; border: 1px solid #E2E8F0;">
      <div style="font-size: 12px; color: #64748B; font-weight: 600; text-transform: uppercase;">Payment Details</div>
      <div style="font-size: 14px; font-weight: bold; color: #0B1730; margin-top: 4px;">
        ${order.paymentMethod === 'ONLINE' ? 'Razorpay Online Gateway' : 'Cash on Delivery (COD)'}
        <span style="font-size: 12px; font-weight: normal; color: ${order.paymentStatus === 'paid' ? '#16A34A' : '#D97706'}; margin-left: 6px;">
          (${order.paymentStatus.toUpperCase()})
        </span>
      </div>
      <div style="font-size: 12px; color: #64748B; margin-top: 8px;">
        <strong>Campus Delivery to:</strong> ${order.shippingAddress?.street}, ${order.shippingAddress?.city}, ${order.shippingAddress?.state} - ${order.shippingAddress?.pincode}
      </div>
    </div>

    <table role="presentation" width="100%" style="margin-top: 20px;" border="0" cellspacing="0" cellpadding="0">
      <thead>
        <tr style="border-bottom: 2px solid #E2E8F0;">
          <th align="left" style="padding-bottom: 8px; font-size: 12px; color: #64748B; text-transform: uppercase;">Item</th>
          <th align="center" style="padding-bottom: 8px; font-size: 12px; color: #64748B; text-transform: uppercase;">Qty</th>
          <th align="right" style="padding-bottom: 8px; font-size: 12px; color: #64748B; text-transform: uppercase;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRows}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="2" align="right" style="padding-top: 12px; font-size: 12px; color: #64748B;">Subtotal:</td>
          <td align="right" style="padding-top: 12px; font-size: 13px; font-weight: 600;">₹${subtotalRupees}</td>
        </tr>
        <tr>
          <td colspan="2" align="right" style="padding-top: 4px; font-size: 12px; color: #64748B;">Shipping:</td>
          <td align="right" style="padding-top: 4px; font-size: 13px; font-weight: 600;">${order.shippingChargeInPaise === 0 ? 'FREE' : `₹${shippingRupees}`}</td>
        </tr>
        ${order.discountInPaise > 0 ? `
        <tr>
          <td colspan="2" align="right" style="padding-top: 4px; font-size: 12px; color: #16A34A;">Discount:</td>
          <td align="right" style="padding-top: 4px; font-size: 13px; font-weight: 600; color: #16A34A;">-₹${discountRupees}</td>
        </tr>` : ''}
        <tr>
          <td colspan="2" align="right" style="padding-top: 8px; font-size: 14px; font-weight: 800; color: #0B1730;">Total:</td>
          <td align="right" style="padding-top: 8px; font-size: 16px; font-weight: 900; color: #2677FF;">₹${totalRupees}</td>
        </tr>
      </tfoot>
    </table>

    <div style="text-align: center; margin-top: 32px;">
      <a href="${config.clientUrl}/orders/${order._id}" class="btn" style="background-color: #2677FF; color: #FFFFFF; padding: 12px 28px; border-radius: 9999px; text-decoration: none; font-weight: bold; font-size: 13px; display: inline-block;">
        TRACK YOUR ORDER
      </a>
    </div>
  `;

  const text = `Order Confirmed: ${orderNumber}\n\nHello ${customerName},\nYour order ${orderNumber} has been received for ₹${totalRupees}.\nPayment: ${order.paymentMethod} (${order.paymentStatus})\nDelivery to: ${order.shippingAddress?.street}, ${order.shippingAddress?.city} - ${order.shippingAddress?.pincode}\n\nTrack order: ${config.clientUrl}/orders/${order._id}\n\n- DYPULSE Campus Store`;

  return queueEmail({
    mailOptions: {
      to: email,
      subject: `Order Confirmed: ${orderNumber} ⚡`,
      text,
      html: wrapBrandedLayout({
        title: `Order Confirmed - ${orderNumber}`,
        preheader: `We've received order ${orderNumber} for ₹${totalRupees}`,
        contentHtml
      })
    },
    type: 'order_confirmation'
  });
};

/**
 * 4. Order Status Update Email
 */
export const sendOrderStatusUpdateEmail = async ({ order, recipientEmail, newStatus, note = '' }) => {
  const email = recipientEmail || (order.user?.email ? order.user.email : '');
  const customerName = order.shippingAddress?.fullName || 'Collegiate Athlete';
  const orderNumber = order.orderNumber;
  const statusDisplay = newStatus.toUpperCase();

  const contentHtml = `
    <h1 style="font-size: 20px; font-weight: 800; color: #0B1730; margin-top: 0;">Order Status Update 🚚</h1>
    <p style="font-size: 14px; line-height: 1.6; color: #334155;">
      Hello ${customerName}, your order <strong>${orderNumber}</strong> has a new update:
    </p>
    <div style="background-color: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 12px; padding: 16px; margin: 20px 0; text-align: center;">
      <span style="font-size: 11px; font-weight: bold; color: #1E40AF; text-transform: uppercase;">Current Status</span>
      <div style="font-size: 20px; font-weight: 900; color: #1D4ED8; margin-top: 4px;">
        ${statusDisplay}
      </div>
      ${note ? `<p style="font-size: 12px; color: #3B82F6; margin: 8px 0 0 0;">${note}</p>` : ''}
    </div>
    <div style="text-align: center; margin-top: 24px;">
      <a href="${config.clientUrl}/orders/${order._id}" class="btn" style="background-color: #2677FF; color: #FFFFFF; padding: 12px 28px; border-radius: 9999px; text-decoration: none; font-weight: bold; font-size: 13px; display: inline-block;">
        VIEW ORDER TIMELINE
      </a>
    </div>
  `;

  const text = `Order Update: ${orderNumber}\n\nStatus: ${statusDisplay}\n${note ? `Note: ${note}\n` : ''}\nTrack at: ${config.clientUrl}/orders/${order._id}\n\n- DYPULSE Dispatch`;

  return queueEmail({
    mailOptions: {
      to: email,
      subject: `Order Update: ${orderNumber} is now ${statusDisplay}`,
      text,
      html: wrapBrandedLayout({
        title: `Order Status Update - ${orderNumber}`,
        preheader: `Your order is now ${statusDisplay}`,
        contentHtml
      })
    },
    type: 'order_status_update'
  });
};

/**
 * 5. Cancellation Confirmation Email
 */
export const sendOrderCancellationEmail = async ({ order, recipientEmail, reason = '' }) => {
  const email = recipientEmail || (order.user?.email ? order.user.email : '');
  const customerName = order.shippingAddress?.fullName || 'Collegiate Athlete';
  const orderNumber = order.orderNumber;
  const isPaid = order.paymentStatus === 'paid' || order.paymentStatus === 'refunded';

  const contentHtml = `
    <h1 style="font-size: 20px; font-weight: 800; color: #0B1730; margin-top: 0;">Order Cancelled</h1>
    <p style="font-size: 14px; line-height: 1.6; color: #334155;">
      Hello ${customerName}, order <strong>${orderNumber}</strong> has been cancelled as requested.
    </p>
    ${reason ? `<div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 12px 16px; margin: 16px 0; font-size: 13px; color: #475569;"><strong>Reason:</strong> ${reason}</div>` : ''}
    ${isPaid ? `
    <div style="background-color: #ECFDF5; border: 1px solid #A7F3D0; border-radius: 12px; padding: 14px; margin-top: 16px;">
      <p style="margin: 0; font-size: 13px; color: #065F46; font-weight: 600;">
        💳 Refund Initiated
      </p>
      <p style="margin: 4px 0 0 0; font-size: 12px; color: #047857;">
        Because you paid online via Razorpay, your refund of ₹${(order.totalInPaise / 100).toFixed(2)} has been recorded and will reflect in your original payment method in 3–5 campus banking days.
      </p>
    </div>` : `
    <p style="font-size: 13px; color: #64748B;">
      No payment was captured for this order (Cash on Delivery). All reserved items have been restored to campus inventory.
    </p>`}
  `;

  const text = `Order Cancelled: ${orderNumber}\n\nHello ${customerName},\nOrder ${orderNumber} has been cancelled.\n${reason ? `Reason: ${reason}\n` : ''}${isPaid ? 'Refund of online payment initiated.\n' : 'No payment collected (COD).\n'}\n- DYPULSE Customer Service`;

  return queueEmail({
    mailOptions: {
      to: email,
      subject: `Order Cancelled: ${orderNumber}`,
      text,
      html: wrapBrandedLayout({
        title: `Order Cancelled - ${orderNumber}`,
        preheader: `Confirmation of cancellation for order ${orderNumber}`,
        contentHtml
      })
    },
    type: 'order_cancellation'
  });
};

/**
 * 6. Team Kit Request Confirmation Email
 */
export const sendTeamKitConfirmationEmail = async ({ request, recipientEmail }) => {
  const email = recipientEmail || request.teamInfo?.contactEmail;
  const contactPerson = request.teamInfo?.contactPerson || 'Team Captain';
  const teamName = request.teamInfo?.teamName || 'Your Team';

  const contentHtml = `
    <h1 style="font-size: 20px; font-weight: 800; color: #0B1730; margin-top: 0;">Team Kit Request Received! 🏆</h1>
    <p style="font-size: 14px; line-height: 1.6; color: #334155;">
      Hey ${contactPerson}! We received the custom kit customization request for <strong>${teamName}</strong> (${request.sport} • ${request.kitType}).
    </p>

    <div style="background-color: #F8FAFC; border-radius: 12px; padding: 16px; margin: 20px 0; border: 1px solid #E2E8F0;">
      <div style="font-size: 12px; color: #64748B; font-weight: 600; text-transform: uppercase;">Request Summary</div>
      <div style="font-size: 13px; color: #1E293B; margin-top: 6px;">
        • <strong>College/Club:</strong> ${request.teamInfo?.organization}<br>
        • <strong>Sport:</strong> ${request.sport}<br>
        • <strong>Kit Style:</strong> ${request.design?.jerseyStyle || 'Custom Varsity'}<br>
        • <strong>Primary Color:</strong> ${request.design?.primaryColor}<br>
        • <strong>Squad Size:</strong> ${request.totalQuantity} custom jerseys
      </div>
    </div>

    <p style="font-size: 13px; line-height: 1.6; color: #475569;">
      Our varsity apparel design team is reviewing your roster notes and design requirements. We'll follow up with custom mockups and a wholesale quotation within 24–48 hours.
    </p>

    <div style="text-align: center; margin-top: 28px;">
      <a href="${config.clientUrl}/account" class="btn" style="background-color: #8157F5; color: #FFFFFF; padding: 12px 28px; border-radius: 9999px; text-decoration: none; font-weight: bold; font-size: 13px; display: inline-block;">
        TRACK TEAM KIT STATUS
      </a>
    </div>
  `;

  const text = `Team Kit Request Received: ${teamName}\n\nHello ${contactPerson},\nYour request for ${teamName} (${request.sport}, ${request.totalQuantity} units) has been received. Our team will prepare a quotation and design mockups.\n\n- DYPULSE Team Kit Studio`;

  return queueEmail({
    mailOptions: {
      to: email,
      subject: `Team Kit Request Confirmed: ${teamName} (${request.sport}) 🎽`,
      text,
      html: wrapBrandedLayout({
        title: `Team Kit Request Confirmed - ${teamName}`,
        preheader: `Your custom kit request for ${teamName} has been submitted to the varsity studio.`,
        contentHtml
      })
    },
    type: 'team_kit_confirmation'
  });
};

/**
 * 7. Team Kit Request Status Update Email
 */
export const sendTeamKitStatusUpdateEmail = async ({ request, recipientEmail, newStatus, note = '' }) => {
  const email = recipientEmail || request.teamInfo?.contactEmail;
  const contactPerson = request.teamInfo?.contactPerson || 'Team Captain';
  const teamName = request.teamInfo?.teamName || 'Your Team';

  let quoteSnippet = '';
  if (request.quotation?.estimatedPriceInPaise) {
    const totalQuote = (request.quotation.estimatedPriceInPaise / 100).toFixed(2);
    quoteSnippet = `
      <div style="background-color: #F5F3FF; border: 1px solid #DDD6FE; border-radius: 12px; padding: 16px; margin: 16px 0;">
        <span style="font-size: 11px; font-weight: bold; color: #6D28D9; text-transform: uppercase;">Varsity Wholesale Quotation</span>
        <div style="font-size: 22px; font-weight: 900; color: #5B21B6; margin-top: 4px;">₹${totalQuote}</div>
        ${request.quotation.pricePerUnitInPaise ? `<div style="font-size: 12px; color: #7C3AED;">₹${(request.quotation.pricePerUnitInPaise / 100).toFixed(2)} per kit unit</div>` : ''}
        ${request.quotation.notes ? `<p style="font-size: 12px; color: #4C1D95; margin: 6px 0 0 0;">${request.quotation.notes}</p>` : ''}
      </div>
    `;
  }

  const contentHtml = `
    <h1 style="font-size: 20px; font-weight: 800; color: #0B1730; margin-top: 0;">Team Kit Update: ${newStatus}</h1>
    <p style="font-size: 14px; line-height: 1.6; color: #334155;">
      Hello ${contactPerson}, the custom kit request for <strong>${teamName}</strong> has been updated to:
    </p>
    <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 16px; margin: 16px 0; text-align: center;">
      <div style="font-size: 18px; font-weight: 900; color: #8157F5;">${newStatus}</div>
      ${note ? `<p style="font-size: 12px; color: #64748B; margin: 6px 0 0 0;">${note}</p>` : ''}
    </div>
    ${quoteSnippet}
    <div style="text-align: center; margin-top: 24px;">
      <a href="${config.clientUrl}/account" class="btn" style="background-color: #8157F5; color: #FFFFFF; padding: 12px 28px; border-radius: 9999px; text-decoration: none; font-weight: bold; font-size: 13px; display: inline-block;">
        VIEW CUSTOM REQUEST
      </a>
    </div>
  `;

  const text = `Team Kit Update for ${teamName}\nStatus: ${newStatus}\n${note ? `Note: ${note}\n` : ''}${request.quotation?.estimatedPriceInPaise ? `Quotation: ₹${(request.quotation.estimatedPriceInPaise / 100).toFixed(2)}\n` : ''}\nView at: ${config.clientUrl}/account\n\n- DYPULSE Team Kit Studio`;

  return queueEmail({
    mailOptions: {
      to: email,
      subject: `Team Kit Update: ${teamName} is now "${newStatus}"`,
      text,
      html: wrapBrandedLayout({
        title: `Team Kit Update - ${teamName}`,
        preheader: `Status updated to ${newStatus}`,
        contentHtml
      })
    },
    type: 'team_kit_status_update'
  });
};
