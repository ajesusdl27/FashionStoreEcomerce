import Stripe from 'stripe';

const stripeSecretKey = import.meta.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable');
}

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2024-12-18.acacia',
});

// Constants
export const FREE_SHIPPING_THRESHOLD = 50;
export const SHIPPING_COST = 499; // In cents for Stripe
export const STOCK_RESERVATION_MINUTES = 30; // Minimum required by Stripe
