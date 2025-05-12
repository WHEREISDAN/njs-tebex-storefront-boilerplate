"use client";

import { useState, useEffect } from "react";
import { useBasket } from "@/contexts/BasketContext";
import { getBasketAuthUrl, removeFromBasket, updateBasketItem, getBasket } from "@/lib/tebex";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export default function BasketPage() {
  const { basketIdent, items, totalPrice, refreshBasket, isMounted } = useBasket();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Check for authentication returns
  useEffect(() => {
    if (!isMounted) return;
    
    async function handleAuthReturn() {
      const action = searchParams.get('action');
      const packageId = searchParams.get('packageId');
      const quantity = searchParams.get('quantity');
      
      if (basketIdent && action && packageId) {
        setIsLoading(true);
        setError("");
        
        try {
          if (action === 'remove') {
            await removeFromBasket(basketIdent, packageId);
          } else if (action === 'update' && quantity) {
            await updateBasketItem(basketIdent, packageId, parseInt(quantity, 10));
          }
          
          await refreshBasket();
          router.replace('/basket');
        } catch (err) {
          console.error(`Error performing ${action} after auth:`, err);
          setError(`Failed to ${action} item after authentication.`);
        } finally {
          setIsLoading(false);
        }
      }
    }
    
    if (basketIdent) {
      handleAuthReturn();
    }
  }, [basketIdent, searchParams, refreshBasket, router, isMounted]);

  const handleRemoveItem = async (packageId: string) => {
    if (!basketIdent || !isMounted) return;
    setError("");
    
    try {
      setIsLoading(true);
      
      // Authenticate first, then remove the item
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const returnUrl = `${baseUrl}/basket?action=remove&packageId=${packageId}`;
      
      const authResponse = await getBasketAuthUrl(basketIdent, returnUrl);
      if (authResponse?.auth_url) {
        window.location.href = authResponse.auth_url;
      } else {
        // Try direct removal if auth URL not available
        await removeFromBasket(basketIdent, packageId);
        await refreshBasket();
      }
    } catch (err) {
      console.error("Error removing item:", err);
      setError("Failed to remove item. Please try again.");
      setIsLoading(false);
    }
  };

  const handleQuantityChange = async (packageId: string, newQuantity: number) => {
    if (!basketIdent || newQuantity < 1 || !isMounted) return;
    setError("");

    try {
      setIsLoading(true);
      
      // Authenticate first, then update the quantity
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const returnUrl = `${baseUrl}/basket?action=update&packageId=${packageId}&quantity=${newQuantity}`;
      
      const authResponse = await getBasketAuthUrl(basketIdent, returnUrl);
      if (authResponse?.auth_url) {
        window.location.href = authResponse.auth_url;
      } else {
        // Try direct update if auth URL not available
        await updateBasketItem(basketIdent, packageId, newQuantity);
        await refreshBasket();
      }
    } catch (err) {
      console.error("Error updating quantity:", err);
      setError("Failed to update quantity. Please try again.");
      setIsLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (!basketIdent || !isMounted) return;
    setError("");
    
    setIsLoading(true);
    try {
      // Fetch basket data to get checkout links
      const basketData = await getBasket(basketIdent);
      
      // Use the checkout link provided in the basket data
      if (basketData?.links?.checkout) {
        window.location.href = basketData.links.checkout;
      } else {
        // Fallback to auth approach if checkout link not available
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
        const authResponse = await getBasketAuthUrl(basketIdent, `${baseUrl}/basket`);
        
        if (authResponse?.auth_url) {
          window.location.href = authResponse.auth_url;
        } else {
          setError("Failed to get checkout URL. Please try again later.");
        }
      }
    } catch (err) {
      console.error("Error starting checkout:", err);
      setError("Failed to start checkout process. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state (before hydration completes)
  if (!isMounted) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-white game-heading">Your Cart</h1>
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-8 text-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="rounded-full bg-gray-700 h-12 w-12 mb-4"></div>
            <div className="h-4 bg-gray-700 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  // Empty basket state
  if (!basketIdent || items.length === 0) {
    return (
      <div className="text-center py-20">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-600 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
        <h1 className="text-3xl font-bold mb-6 text-white">Your Cart is Empty</h1>
        <p className="text-lg mb-8 text-gray-400 max-w-md mx-auto">Looks like you haven't added any items to your cart yet.</p>
        <Link 
          href="/packages" 
          className="game-button-primary inline-flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Browse Items
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-white game-heading">Your Cart</h1>
      
      {error && (
        <div className="bg-red-900/30 border border-red-800 text-red-400 p-4 rounded-lg mb-6">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        </div>
      )}
      
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden mb-6">
        <table className="w-full">
          <thead className="bg-gray-900 border-b border-gray-700">
            <tr>
              <th className="text-left p-4 text-gray-400 font-medium">Item</th>
              <th className="text-center p-4 text-gray-400 font-medium">Quantity</th>
              <th className="text-right p-4 text-gray-400 font-medium">Price</th>
              <th className="text-right p-4 text-gray-400 font-medium">Total</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t border-gray-700">
                <td className="p-4">
                  <div className="flex items-center">
                    {item.image ? (
                      <div className="relative w-16 h-16 mr-4 rounded overflow-hidden bg-gray-700">
                        <Image 
                          src={item.image} 
                          alt={item.name} 
                          fill 
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 mr-4 bg-gray-700 flex items-center justify-center rounded">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <span className="font-medium text-white">{item.name}</span>
                  </div>
                </td>
                <td className="p-4 text-center">
                  <div className="flex items-center justify-center">
                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      className="w-8 h-8 border border-gray-600 rounded-l flex items-center justify-center hover:bg-gray-700 text-gray-300"
                      disabled={item.quantity <= 1 || isLoading}
                    >
                      -
                    </button>
                    <span className="w-10 h-8 border-t border-b border-gray-600 flex items-center justify-center text-white bg-gray-700">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      className="w-8 h-8 border border-gray-600 rounded-r flex items-center justify-center hover:bg-gray-700 text-gray-300"
                      disabled={isLoading}
                    >
                      +
                    </button>
                  </div>
                </td>
                <td className="p-4 text-right text-gray-300">${item.price.toFixed(2)}</td>
                <td className="p-4 text-right font-bold text-blue-400">${(item.price * item.quantity).toFixed(2)}</td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="text-red-400 hover:text-red-300 p-1.5 rounded-full hover:bg-red-900/20"
                    disabled={isLoading}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between items-stretch gap-6 mb-8">
        <Link 
          href="/packages"
          className="text-blue-400 hover:text-blue-300 flex items-center self-start"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className="mr-2">
            <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
          </svg>
          Continue Shopping
        </Link>
        
        <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg md:min-w-[300px]">
          <h3 className="text-lg font-bold mb-4 text-white">Order Summary</h3>
          
          <div className="space-y-3 mb-4 text-sm">
            <div className="flex justify-between text-gray-400">
              <span>Items ({items.reduce((acc, item) => acc + item.quantity, 0)})</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Discount</span>
              <span>$0.00</span>
            </div>
          </div>
          
          <div className="border-t border-gray-700 pt-4 mb-6">
            <div className="flex justify-between font-bold">
              <span className="text-white">Total</span>
              <span className="text-blue-400 text-xl">${totalPrice.toFixed(2)}</span>
            </div>
          </div>
          
          <button
            onClick={handleCheckout}
            disabled={isLoading}
            className="w-full game-button-primary flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              <>
                Proceed to Checkout
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 