"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function CheckoutCancelPage() {
  // Use useState and useEffect to avoid hydration mismatch
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  return (
    <div className="max-w-lg mx-auto text-center py-12">
      <div className="mb-8">
        <div className="inline-flex items-center justify-center bg-red-100 rounded-full p-4 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="text-red-600">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold mb-4">Checkout Canceled</h1>
        <p className="text-gray-600 mb-6">
          Your order was not completed. If you experienced any issues during checkout, please try again or contact our support team.
        </p>
      </div>
      
      <div className="space-y-4">
        <Link href="/basket" className="block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition mb-4">
          Return to Cart
        </Link>
        <Link href="/" className="text-blue-600 hover:underline">
          Return to Homepage
        </Link>
      </div>
    </div>
  );
} 