import crypto from 'crypto';
import Razorpay from 'razorpay';
import config from '../config/index.js';
import { AppError } from '../middleware/errorHandler.js';

let razorpayClientInstance = null;

/**
 * Returns the cached or new Razorpay SDK instance
 */
export const getRazorpayInstance = () => {
  if (razorpayClientInstance) return razorpayClientInstance;

  if (!config.razorpay.keyId || !config.razorpay.keySecret) {
    return null;
  }

  razorpayClientInstance = new Razorpay({
    key_id: config.razorpay.keyId,
    key_secret: config.razorpay.keySecret
  });

  return razorpayClientInstance;
};

/**
 * Check if Razorpay online payments are configured with active keys
 */
export const isRazorpayConfigured = () => {
  return Boolean(config.razorpay.keyId && config.razorpay.keySecret);
};

/**
 * Check if the active Razorpay key is in Test Mode
 */
export const isRazorpayTestMode = () => {
  return config.razorpay.keyId.startsWith('rzp_test_');
};

/**
 * Create a server-side Razorpay order using the official SDK
 * @param {Object} order Mongoose order document
 * @returns {Promise<Object>} Razorpay order payload
 */
export const createRazorpayOrder = async (order) => {
  const rzp = getRazorpayInstance();

  if (!rzp) {
    throw new AppError(
      'Razorpay credentials are not configured on this server.',
      500,
      'RAZORPAY_NOT_CONFIGURED'
    );
  }

  // Authoritative server-side amount calculation in integer paise
  const amountInPaise = order.totalInPaise;
  if (!Number.isInteger(amountInPaise) || amountInPaise <= 0) {
    throw new AppError(
      'Invalid order amount for Razorpay payment creation.',
      400,
      'INVALID_PAYMENT_AMOUNT'
    );
  }

  const options = {
    amount: amountInPaise,
    currency: 'INR',
    receipt: order.orderNumber,
    notes: {
      orderId: order._id.toString(),
      orderNumber: order.orderNumber,
      userId: order.user ? order.user.toString() : 'guest'
    }
  };

  try {
    const rzpOrder = await rzp.orders.create(options);
    return rzpOrder;
  } catch (error) {
    console.error('[Razorpay Order Creation Error]:', error);
    throw new AppError(
      error.error?.description || error.message || 'Failed to create payment order with Razorpay.',
      502,
      'RAZORPAY_API_ERROR'
    );
  }
};

/**
 * Initialize payment for an order
 * @param {Object} order Mongoose order document
 * @param {String} method Payment method ('COD' or 'ONLINE')
 */
export const initiatePayment = async (order, method = 'COD') => {
  const normalizedMethod = method.toUpperCase();

  if (normalizedMethod === 'COD') {
    return {
      success: true,
      method: 'COD',
      paymentStatus: 'pending',
      requiresClientAction: false,
      message: 'Cash on delivery selected. Payment due upon parcel arrival at campus hostel drop.'
    };
  }

  if (normalizedMethod === 'ONLINE') {
    if (!isRazorpayConfigured()) {
      return {
        success: false,
        method: 'ONLINE',
        isConfigured: false,
        message:
          'Razorpay online payment keys are not configured on this server. Please choose Cash on Delivery (COD) or set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in server/.env.'
      };
    }

    // Create real Razorpay order on backend
    const rzpOrder = await createRazorpayOrder(order);

    // Associate Razorpay order with internal order document
    order.paymentDetails.razorpayOrderId = rzpOrder.id;
    order.paymentDetails.attemptsCount = (order.paymentDetails.attemptsCount || 0) + 1;
    await order.save();

    return {
      success: true,
      method: 'ONLINE',
      isConfigured: true,
      isTestMode: isRazorpayTestMode(),
      keyId: config.razorpay.keyId,
      razorpayOrderId: rzpOrder.id,
      amountInPaise: rzpOrder.amount,
      currency: rzpOrder.currency,
      orderNumber: order.orderNumber,
      receipt: rzpOrder.receipt
    };
  }

  throw new AppError(`Unsupported payment method: ${method}`, 400, 'INVALID_PAYMENT_METHOD');
};

/**
 * Verify Razorpay payment signature cryptographically
 * Never trust frontend callback without cryptographic verification!
 */
export const verifyRazorpayPayment = ({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) => {
  if (!config.razorpay.keySecret) {
    throw new AppError(
      'Razorpay secret not configured. Cannot verify online payment.',
      500,
      'PAYMENT_GATEWAY_NOT_CONFIGURED'
    );
  }

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    throw new AppError(
      'Missing required payment verification parameters (razorpayOrderId, razorpayPaymentId, razorpaySignature).',
      400,
      'INVALID_PAYMENT_VERIFICATION_PARAMS'
    );
  }

  const generatedSignature = crypto
    .createHmac('sha256', config.razorpay.keySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  const generatedBuffer = Buffer.from(generatedSignature, 'utf8');
  const providedBuffer = Buffer.from(razorpaySignature, 'utf8');

  if (
    generatedBuffer.length !== providedBuffer.length ||
    !crypto.timingSafeEqual(generatedBuffer, providedBuffer)
  ) {
    throw new AppError(
      'Payment verification failed: invalid signature. Potential tampering detected.',
      400,
      'PAYMENT_SIGNATURE_MISMATCH'
    );
  }

  return { verified: true };
};

/**
 * Verify payment status directly against Razorpay servers (trusted server-side lookup)
 */
export const verifyPaymentWithRazorpayServer = async (razorpayPaymentId, expectedAmountInPaise) => {
  const rzp = getRazorpayInstance();
  if (!rzp) {
    return { verified: false, message: 'Razorpay SDK instance not configured' };
  }

  try {
    const payment = await rzp.payments.fetch(razorpayPaymentId);

    // Verify payment status is captured or authorized
    if (!['captured', 'authorized'].includes(payment.status)) {
      return {
        verified: false,
        status: payment.status,
        message: `Payment status is ${payment.status}, not captured.`
      };
    }

    // Verify amount matches expected order total
    if (expectedAmountInPaise != null && payment.amount !== expectedAmountInPaise) {
      return {
        verified: false,
        status: payment.status,
        amount: payment.amount,
        message: `Amount mismatch: expected ${expectedAmountInPaise} paise, but received ${payment.amount} paise.`
      };
    }

    return {
      verified: true,
      status: payment.status,
      paymentMethod: payment.method,
      bank: payment.bank,
      wallet: payment.wallet,
      vpa: payment.vpa
    };
  } catch (error) {
    console.error('[Razorpay Server Payment Lookup Error]:', error);
    return {
      verified: false,
      error: error.message
    };
  }
};

/**
 * Verify Razorpay webhook signature
 * @param {String|Buffer} rawBody The raw request body string or buffer
 * @param {String} signature The X-Razorpay-Signature header value
 * @returns {Boolean}
 */
export const verifyWebhookSignature = (rawBody, signature) => {
  const webhookSecret = config.razorpay.webhookSecret;
  if (!webhookSecret) {
    throw new AppError(
      'Webhook secret is not configured on this server.',
      500,
      'WEBHOOK_SECRET_NOT_CONFIGURED'
    );
  }

  if (!rawBody || !signature) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody)
    .digest('hex');

  const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
  const signatureBuffer = Buffer.from(signature, 'utf8');

  if (expectedBuffer.length !== signatureBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
};
