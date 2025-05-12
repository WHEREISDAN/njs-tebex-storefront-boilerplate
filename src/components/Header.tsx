"use client";

import Link from "next/link";
import { useBasket } from "@/contexts/BasketContext";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function Header() {
  const { totalItems, totalPrice } = useBasket();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  
  // This effect ensures client-side rendering only after hydration
  useEffect(() => {
    setMounted(true);
  }, []);
  
  return (
    <header className="bg-gray-900 border-b border-gray-800 py-4 sticky top-0 z-50">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <h1 className="text-2xl font-bold">
            <span className="text-white">WHERE</span>
            <span className="text-blue-500">IS</span>
            <span className="text-white">DAN</span>
          </h1>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-1">
          <Link 
            href="/" 
            className={`navbar-link ${mounted && pathname === "/" ? "active" : ""}`}
          >
            Home
          </Link>
          <Link 
            href="/categories" 
            className={`navbar-link ${mounted && pathname?.startsWith("/categories") ? "active" : ""}`}
          >
            Categories
          </Link>
          <Link 
            href="/packages" 
            className={`navbar-link ${mounted && pathname?.startsWith("/packages") ? "active" : ""}`}
          >
            All Items
          </Link>
        </nav>
        
        <Link 
          href="/basket" 
          className="flex items-center bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-all duration-200 border border-gray-700 hover:border-blue-500"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          <span className="ml-2">{mounted ? (totalItems === 1 ? '1 item' : `${totalItems} items`) : 'Cart'}</span>
          {mounted && totalItems > 0 && (
            <span className="ml-2 font-bold text-blue-400">${totalPrice.toFixed(2)}</span>
          )}
        </Link>
        
        {/* Mobile menu button */}
        <button className="md:hidden p-2 rounded-md text-gray-300 hover:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </header>
  );
} 