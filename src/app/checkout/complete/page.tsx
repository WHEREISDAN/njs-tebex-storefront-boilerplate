"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function CheckoutCompletePage() {
  const [isMounted, setIsMounted] = useState(false);

  // Reset the basket on completion, but only after component has mounted
  useEffect(() => {
    setIsMounted(true);
    
    // Only clear localStorage on the client side
    if (typeof window !== "undefined") {
      localStorage.removeItem("tebexBasketId");
    }
  }, []);

  return (
    <div className="max-w-lg mx-auto text-center py-12">
      <div className="mb-8">
        <div className="inline-flex items-center justify-center bg-green-100 rounded-full p-4 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="text-green-600">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold mb-4">Thank You for Your Purchase!</h1>
        <p className="text-gray-600 mb-6">
          Your order has been successfully completed. You should receive a confirmation email shortly.
        </p>
      </div>
      
      <div className="space-y-4">
        <Link href="/" className="block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
          Return to Homepage
        </Link>
      </div>
    </div>
  );
} 