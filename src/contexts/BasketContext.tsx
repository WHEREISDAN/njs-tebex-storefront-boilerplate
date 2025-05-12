"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { createBasket, getBasket } from "@/lib/tebex";

type BasketItem = {
  id: string;
  name: string;
  image: string;
  quantity: number;
  price: number;
};

type BasketContextType = {
  basketIdent: string | null;
  items: BasketItem[];
  isLoading: boolean;
  totalItems: number;
  totalPrice: number;
  refreshBasket: () => Promise<void>;
  initializeBasket: () => Promise<string | null>;
  isMounted: boolean;
};

// Default context values to prevent hydration mismatch
const defaultContextValue: BasketContextType = {
  basketIdent: null,
  items: [],
  isLoading: false,
  totalItems: 0,
  totalPrice: 0,
  refreshBasket: async () => {},
  initializeBasket: async () => null,
  isMounted: false
};

const BasketContext = createContext<BasketContextType>(defaultContextValue);

export function BasketProvider({ children }: { children: ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);
  const [basketIdent, setBasketIdent] = useState<string | null>(null);
  const [items, setItems] = useState<BasketItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Calculate totals
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const calculatedTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  // If the calculated total is 0 but we have items, there might be an issue with price extraction
  const totalPrice = (calculatedTotal === 0 && items.length > 0) ? 0 : calculatedTotal;

  // Initialize basket on first load, only on client side
  useEffect(() => {
    setIsMounted(true);
    const storedBasketId = localStorage.getItem("tebexBasketId");
    if (storedBasketId) {
      setBasketIdent(storedBasketId);
      fetchBasket(storedBasketId);
    }
  }, []);

  // Fetch basket details
  const fetchBasket = async (basketId: string) => {
    if (!isMounted) return;
    
    setIsLoading(true);
    try {
      const basketData = await getBasket(basketId);
      
      // Debug: Log the full basket data
      console.log('Raw basket data:', JSON.stringify(basketData, null, 2));
      console.log('Basket total price from API:', basketData.total_price);
      
      if (Array.isArray(basketData.packages)) {
        console.log('Package pricing details:');
        basketData.packages.forEach((item: any, index: number) => {
          console.log(`Package ${index + 1} (${item.package?.name || item.name || 'Unknown'}):`);
          console.log('- Direct price properties:', {
            price: item.price,
            base_price: item.base_price, 
            total_price: item.total_price,
            unit_price: item.unit_price
          });
          if (item.package) {
            console.log('- Package object price properties:', {
              price: item.package.price,
              base_price: item.package.base_price,
              total_price: item.package.total_price
            });
          }
        });
      }
      
      // Process the basket data
      // The API returns packages as an array of items in the basket
      const basketItems = Array.isArray(basketData.packages) 
        ? basketData.packages.map((item: any) => ({
            id: item.package?.id || item.id,
            name: item.package?.name || item.name,
            image: item.package?.image || item.image || "",
            quantity: item.in_basket?.quantity || item.qty || item.quantity || 1,
            price: extractPrice(item),
          }))
        : [];
      
      // Debug: Log the processed items with extracted prices
      console.log('Processed basket items with extracted prices:', basketItems);
      
      // If we have items but all prices are 0, distribute the basket total price evenly
      const allPricesAreZero = basketItems.length > 0 && basketItems.every((item: BasketItem) => item.price === 0);
      if (allPricesAreZero && basketData.total_price) {
        console.log('All prices are zero, using basket total price:', basketData.total_price);
        
        // If there's only one item type in the basket
        if (basketItems.length === 1) {
          const totalItems = basketItems[0].quantity;
          const pricePerItem = basketData.total_price / totalItems;
          
          console.log(`Distributing total (${basketData.total_price}) to ${totalItems} items at ${pricePerItem} each`);
          basketItems[0].price = pricePerItem;
        } 
        // If there are multiple item types, distribute proportionally by quantity
        else {
          const totalQuantity = basketItems.reduce((sum: number, item: BasketItem) => sum + item.quantity, 0);
          
          basketItems.forEach((item: BasketItem) => {
            const proportion = item.quantity / totalQuantity;
            const allocatedPrice = basketData.total_price * proportion / item.quantity;
            console.log(`Allocating ${allocatedPrice} per item for ${item.name} (${item.quantity} items)`);
            item.price = allocatedPrice;
          });
        }
      }
      
      setItems(basketItems);
    } catch (error) {
      console.error("Error fetching basket:", error);
      // If basket is invalid, remove from storage and reset state
      if (isMounted) {
        localStorage.removeItem("tebexBasketId");
      }
      setBasketIdent(null);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize a new basket
  const initializeBasket = async (): Promise<string | null> => {
    if (!isMounted) return null;
    
    setIsLoading(true);
    let attempts = 0;
    const maxAttempts = 2;
    
    while (attempts < maxAttempts) {
      attempts++;
      try {
        // Create basket with URLs
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
        const completeUrl = `${baseUrl}/checkout/complete`;
        const cancelUrl = `${baseUrl}/checkout/cancel`;
        
        console.log(`Initializing basket attempt ${attempts}/${maxAttempts}`);
        
        // Try server-side API route first
        let basketData;
        try {
          const response = await fetch('/api/basket/create', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ completeUrl, cancelUrl }),
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error('Server API error:', response.status, errorText);
            throw new Error(`Server-side API error: ${response.status}`);
          }
          
          basketData = await response.json();
          console.log('Server-side basket creation response:', basketData);
        } catch (serverError) {
          // Fall back to client-side creation if server fails
          console.warn('Falling back to client-side basket creation:', serverError);
          basketData = await createBasket(completeUrl, cancelUrl);
        }
        
        // Extract the basket ident
        const basketIdent = basketData?.ident;
        
        if (!basketIdent) {
          console.error('Invalid basket data: missing ident', basketData);
          if (attempts < maxAttempts) {
            console.log(`Retrying basket creation (attempt ${attempts + 1}/${maxAttempts})...`);
            // Short delay before retry
            await new Promise(resolve => setTimeout(resolve, 500));
            continue;
          }
          throw new Error('Invalid basket data: missing ident');
        }
        
        console.log('Basket initialized with ident:', basketIdent);
        setBasketIdent(basketIdent);
        if (isMounted) {
          localStorage.setItem("tebexBasketId", basketIdent);
        }
        setItems([]);
        setIsLoading(false);
        return basketIdent;
      } catch (error) {
        console.error(`Error initializing basket (attempt ${attempts}/${maxAttempts}):`, error);
        
        if (attempts < maxAttempts) {
          console.log(`Retrying basket creation (attempt ${attempts + 1}/${maxAttempts})...`);
          // Short delay before retry
          await new Promise(resolve => setTimeout(resolve, 500));
          continue;
        }
        
        setIsLoading(false);
        return null;
      }
    }
    
    setIsLoading(false);
    return null;
  };

  // Refresh basket data
  const refreshBasket = async () => {
    if (!isMounted) return;
    
    if (basketIdent) {
      await fetchBasket(basketIdent);
    } else {
      await initializeBasket();
    }
  };

  // Helper function to extract price from various API response formats
  const extractPrice = (item: any): number => {
    console.log('Extracting price from item:', item);
    // Check all possible locations where price might be stored
    let price = 0;
    
    // Check in_basket structure first (this is the primary structure in the API response)
    if (item.in_basket && typeof item.in_basket.price !== 'undefined') {
      console.log('Using item.in_basket.price:', item.in_basket.price);
      price = typeof item.in_basket.price === 'number' 
        ? item.in_basket.price 
        : parseFloat(item.in_basket.price);
      
      // If we found a valid price in the expected location, return it immediately
      if (!isNaN(price) && price > 0) {
        console.log('Found valid price in in_basket:', price);
        return price;
      }
    }
    
    // Try direct properties first
    if (typeof item.price === 'number') {
      console.log('Using item.price:', item.price);
      price = item.price;
    } else if (typeof item.base_price === 'number') {
      console.log('Using item.base_price:', item.base_price);
      price = item.base_price;
    } else if (typeof item.total_price === 'number') {
      console.log('Using item.total_price:', item.total_price);
      price = item.total_price;
    } 
    // Then nested objects
    else if (item.unit_price?.amount) {
      console.log('Using item.unit_price.amount:', item.unit_price.amount);
      price = typeof item.unit_price.amount === 'number' 
        ? item.unit_price.amount 
        : parseFloat(item.unit_price.amount);
    } 
    // Package object may contain the price
    else if (item.package) {
      if (typeof item.package.price === 'number') {
        console.log('Using item.package.price:', item.package.price);
        price = item.package.price;
      } else if (typeof item.package.base_price === 'number') {
        console.log('Using item.package.base_price:', item.package.base_price);
        price = item.package.base_price;
      } else if (typeof item.package.total_price === 'number') {
        console.log('Using item.package.total_price:', item.package.total_price);
        price = item.package.total_price;
      }
    }
    
    // Also try string values and convert them
    if (price === 0) {
      if (typeof item.price === 'string' && item.price.trim() !== '') {
        console.log('Converting string item.price:', item.price);
        price = parseFloat(item.price);
      } else if (typeof item.base_price === 'string' && item.base_price.trim() !== '') {
        console.log('Converting string item.base_price:', item.base_price);
        price = parseFloat(item.base_price);
      } else if (typeof item.total_price === 'string' && item.total_price.trim() !== '') {
        console.log('Converting string item.total_price:', item.total_price);
        price = parseFloat(item.total_price);
      } else if (item.package) {
        if (typeof item.package.price === 'string' && item.package.price.trim() !== '') {
          console.log('Converting string item.package.price:', item.package.price);
          price = parseFloat(item.package.price);
        } else if (typeof item.package.base_price === 'string' && item.package.base_price.trim() !== '') {
          console.log('Converting string item.package.base_price:', item.package.base_price);
          price = parseFloat(item.package.base_price);
        } else if (typeof item.package.total_price === 'string' && item.package.total_price.trim() !== '') {
          console.log('Converting string item.package.total_price:', item.package.total_price);
          price = parseFloat(item.package.total_price);
        }
      }
    }
    
    console.log('Final extracted price:', price);
    // Ensure the result is a valid number
    return isNaN(price) ? 0 : price;
  };

  const value = {
    basketIdent,
    items,
    isLoading,
    totalItems,
    totalPrice,
    refreshBasket,
    initializeBasket,
    isMounted
  };

  return <BasketContext.Provider value={value}>{children}</BasketContext.Provider>;
}

export const useBasket = () => {
  const context = useContext(BasketContext);
  if (context === undefined) {
    throw new Error("useBasket must be used within a BasketProvider");
  }
  return context;
}; 