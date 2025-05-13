"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useBasket } from "@/contexts/BasketContext";
import { getBasketAuthUrl } from "@/lib/tebex";

type PackageProps = {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  currency?: string;
};

export default function PackageCard({ id, name, description, price, image, currency = "USD" }: PackageProps) {
  const { basketIdent, initializeBasket } = useBasket();
  const [isAdding, setIsAdding] = useState(false);
  
  const handleAddToBasket = async () => {
    setIsAdding(true);
    try {
      let basketId = basketIdent;
      
      // If no basket exists yet, create one
      if (!basketId) {
        basketId = await initializeBasket();
      }
      
      if (basketId) {
        // Store package ID to add after authentication
        localStorage.setItem("pendingPackageId", id);
        localStorage.setItem("pendingQuantity", "1");
        
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
        const returnUrl = `${baseUrl}/packages/${id}?add=true`;
        
        // Get authentication URL and redirect
        const authResponse = await getBasketAuthUrl(basketId, returnUrl);
        if (authResponse?.auth_url) {
          window.location.href = authResponse.auth_url;
        } else {
          throw new Error("Could not get authentication URL");
        }
      }
    } catch (error) {
      console.error("Error starting basket authentication:", error);
      setIsAdding(false);
    }
  };
  
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden hover:shadow-lg hover:shadow-blue-500/10 transition-all h-full group flex flex-col">
      <Link href={`/packages/${id}`} className="block relative">
        <div className="relative h-52 w-full overflow-hidden">
          {image ? (
            <Image 
              src={image}
              alt={name}
              fill
              className="object-cover transform group-hover:scale-110 transition-transform duration-300 opacity-80 group-hover:opacity-100"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-900">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-gray-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-90"></div>
          <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs font-bold rounded-full px-3 py-1">
            ${price.toFixed(2)} {currency}
          </div>
        </div>
      </Link>
      
      <div className="p-5 flex-grow flex flex-col">
        <Link href={`/packages/${id}`}>
          <h3 className="text-xl font-bold mb-2 text-white group-hover:text-blue-400 transition-colors">{name}</h3>
        </Link>
        
        <p className="text-gray-400 mb-4 text-sm line-clamp-2 flex-grow">{description}</p>
        
        <div className="flex items-center justify-between mt-2">
          <span className="text-lg font-bold text-blue-400">
            ${price.toFixed(2)} {currency}
          </span>
          
          <button
            onClick={handleAddToBasket}
            disabled={isAdding}
            className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2 rounded-lg transition-colors disabled:bg-blue-800 disabled:cursor-not-allowed"
          >
            {isAdding ? "Processing..." : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
} 