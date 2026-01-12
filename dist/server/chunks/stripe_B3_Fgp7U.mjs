import Stripe from 'stripe';

const stripeSecretKey = "sk_test_51SnQRGLnwdj8COJlRvUPsKO0x9GZJVGOKLv1xOovBGCpFveJUvDNPfr2RXhfb9BMpyVdRKkZ4EsRhyoOnaRlDI0300E3fmxVDk";
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2024-12-18.acacia"
});
const FREE_SHIPPING_THRESHOLD = 50;
const SHIPPING_COST = 499;
const STOCK_RESERVATION_MINUTES = 30;

export { FREE_SHIPPING_THRESHOLD as F, SHIPPING_COST as S, STOCK_RESERVATION_MINUTES as a, stripe as s };
