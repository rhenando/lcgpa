"use client";

import { useEffect, useState } from "react";

export default function PaymentForm({ amount, currency, paymentType }) {
  const [checkoutId, setCheckoutId] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const initiateCheckout = async () => {
      try {
        const response = await fetch("/api/hyperpay/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount, currency, paymentType }),
        });
        const data = await response.json();
        if (isMounted && data.id) {
          setCheckoutId(data.id);
        }
      } catch {
        // Optionally display an error toast/UI here.
      }
    };

    initiateCheckout();

    return () => {
      isMounted = false;
    };
  }, [amount, currency, paymentType]);

  useEffect(() => {
    if (!checkoutId) return;
    const script = document.createElement("script");
    script.src = `https://eu-test.oppwa.com/v1/paymentWidgets.js?checkoutId=${checkoutId}`;
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, [checkoutId]);

  return (
    <div>
      {checkoutId ? (
        <form
          action='/payment/result'
          className='paymentWidgets'
          data-brands='VISA MASTER MADA'
        />
      ) : (
        <p className='text-red-500'>Initializing payment widget…</p>
      )}
    </div>
  );
}
