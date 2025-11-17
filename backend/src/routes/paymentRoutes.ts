import express, { Request, Response } from "express";
import Stripe from "stripe";
import Razorpay from "razorpay";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-06-20" as any,
});

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID as string,
  key_secret: process.env.RAZORPAY_SECRET as string,
});

// ✅ Create Stripe payment intent
router.post(
  "/create-payment-intent",
  async (req: AuthRequest, res: Response) => {
    try {
      const { amount, currency } = req.body as {
        amount: number;
        currency: string;
      };

      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency,
        automatic_payment_methods: { enabled: true },
      });

      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ message: error.message || "Stripe error" });
    }
  }
);

// ✅ Create Razorpay order
router.post("/create-order", async (req: AuthRequest, res: Response) => {
  try {
    const { amount, currency } = req.body as {
      amount: number;
      currency: string;
    };

    const options = {
      amount,
      currency,
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message || "Razorpay error" });
  }
});

export default router;
