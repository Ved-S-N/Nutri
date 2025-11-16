import React from "react";
import { PaymentForm } from "../components/PaymentForm";
import { UPIPayment } from "../components/UPIPayment";

const CheckoutPage: React.FC = () => {
  const amount = 49900; // ₹499.00

  return (
    <div className="space-y-6 max-w-lg mx-auto mt-10">
      <h1 className="text-3xl font-bold text-center mb-6">
        Complete Your Purchase
      </h1>

      {/* Stripe */}
      <div className="p-6 rounded-xl shadow-lg bg-white/10 dark:bg-black/10 backdrop-blur-lg">
        <PaymentForm amount={amount} />
      </div>

      <div className="text-center text-neutral-500">— or —</div>

      {/* Razorpay / UPI */}
      <div className="text-center">
        <UPIPayment amount={amount} />
      </div>
    </div>
  );
};

export default CheckoutPage;
