/**
 * Payment Status Handler
 * Handles payment status updates, retries, and error recovery
 */

import { paymentService } from '../services/paymentService';
import { orderService } from '../services/orderService';

/**
 * Payment statuses from PayMongo
 */
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SUCCEEDED: 'succeeded',
  FAILED: 'failed',
  CANCELED: 'canceled',
  REFUNDED: 'refunded'
};

/**
 * Check payment status and update order
 * @param {string} paymentIntentId - PayMongo payment intent ID
 * @param {string} orderId - Order ID
 * @returns {Promise<Object>} Status check result
 */
export const checkPaymentStatus = async (paymentIntentId, orderId) => {
  try {
    const result = await paymentService.getPaymentIntent(paymentIntentId);
    
    if (!result.success) {
      return {
        success: false,
        error: result.error,
        status: null
      };
    }

    const status = result.status || result.data?.attributes?.status;
    
    // Update order with payment status
    if (orderId) {
      await orderService.updateOrder(orderId, {
        paymentStatus: status,
        paymentIntentId,
        paymentCheckedAt: new Date().toISOString()
      });
    }

    return {
      success: true,
      status,
      payment: result.payment || result.data?.attributes?.payment
    };
  } catch (error) {
    console.error('Error checking payment status:', error);
    return {
      success: false,
      error: error.message,
      status: null
    };
  }
};

/**
 * Poll payment status until completion or timeout
 * @param {string} paymentIntentId - PayMongo payment intent ID
 * @param {string} orderId - Order ID
 * @param {number} maxAttempts - Maximum polling attempts (default: 30)
 * @param {number} intervalMs - Polling interval in milliseconds (default: 2000)
 * @returns {Promise<Object>} Final payment status
 */
export const pollPaymentStatus = async (
  paymentIntentId,
  orderId,
  maxAttempts = 30,
  intervalMs = 2000
) => {
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    attempts++;
    
    const result = await checkPaymentStatus(paymentIntentId, orderId);
    
    if (!result.success) {
      return result;
    }

    const status = result.status;
    
    // Payment completed (success or failure)
    if ([PAYMENT_STATUS.SUCCEEDED, PAYMENT_STATUS.FAILED, PAYMENT_STATUS.CANCELED].includes(status)) {
      return result;
    }

    // Still pending, wait before next check
    if (status === PAYMENT_STATUS.PENDING || status === PAYMENT_STATUS.PROCESSING) {
      await new Promise(resolve => setTimeout(resolve, intervalMs));
      continue;
    }

    // Unknown status, return current result
    return result;
  }

  // Timeout
  return {
    success: false,
    error: 'Payment status check timeout',
    status: PAYMENT_STATUS.PENDING
  };
};

/**
 * Handle payment failure with retry logic
 * @param {string} orderId - Order ID
 * @param {string} error - Error message
 * @param {number} retryCount - Current retry count
 * @param {number} maxRetries - Maximum retries (default: 3)
 * @returns {Promise<Object>} Retry result
 */
export const handlePaymentFailure = async (
  orderId,
  error,
  retryCount = 0,
  maxRetries = 3
) => {
  if (retryCount >= maxRetries) {
    // Update order to failed status
    await orderService.updateOrder(orderId, {
      paymentStatus: PAYMENT_STATUS.FAILED,
      paymentError: error,
      paymentFailedAt: new Date().toISOString()
    });

    return {
      success: false,
      error: `Payment failed after ${maxRetries} retries: ${error}`,
      shouldRetry: false
    };
  }

  // Wait before retry (exponential backoff)
  const waitTime = Math.min(1000 * Math.pow(2, retryCount), 10000);
  await new Promise(resolve => setTimeout(resolve, waitTime));

  return {
    success: false,
    error,
    shouldRetry: true,
    retryCount: retryCount + 1
  };
};

/**
 * Verify payment completion
 * @param {string} paymentIntentId - PayMongo payment intent ID
 * @param {string} orderId - Order ID
 * @param {number} expectedAmount - Expected payment amount
 * @returns {Promise<Object>} Verification result
 */
export const verifyPayment = async (paymentIntentId, orderId, expectedAmount) => {
  try {
    const statusResult = await checkPaymentStatus(paymentIntentId, orderId);
    
    if (!statusResult.success || statusResult.status !== PAYMENT_STATUS.SUCCEEDED) {
      return {
        verified: false,
        error: `Payment not completed. Status: ${statusResult.status}`,
        status: statusResult.status
      };
    }

    // Verify amount if payment data is available
    if (statusResult.payment) {
      const paidAmount = statusResult.payment.attributes?.amount / 100; // Convert from cents
      if (Math.abs(paidAmount - expectedAmount) > 0.01) {
        return {
          verified: false,
          error: `Amount mismatch. Expected: ${expectedAmount}, Paid: ${paidAmount}`,
          status: statusResult.status
        };
      }
    }

    return {
      verified: true,
      status: statusResult.status,
      payment: statusResult.payment
    };
  } catch (error) {
    return {
      verified: false,
      error: error.message,
      status: null
    };
  }
};

export default {
  checkPaymentStatus,
  pollPaymentStatus,
  handlePaymentFailure,
  verifyPayment,
  PAYMENT_STATUS
};

