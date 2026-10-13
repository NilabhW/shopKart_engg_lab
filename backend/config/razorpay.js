const Razorpay = require('razorpay');

const PLACEHOLDER_PREFIX = 'your_';

const isRazorpayConfigured = () => {
    const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env;
    return Boolean(
        RAZORPAY_KEY_ID &&
        RAZORPAY_KEY_SECRET &&
        RAZORPAY_KEY_ID.startsWith('rzp_test_') &&
        !RAZORPAY_KEY_ID.includes(PLACEHOLDER_PREFIX) &&
        !RAZORPAY_KEY_SECRET.startsWith(PLACEHOLDER_PREFIX)
    );
};

// Created lazily so the server can still start before the keys are filled in.
let instance = null;

const getRazorpay = () => {
    if (!isRazorpayConfigured()) return null;
    if (!instance) {
        instance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });
    }
    return instance;
};

module.exports = { getRazorpay, isRazorpayConfigured };
