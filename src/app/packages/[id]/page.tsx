"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { getPackageById } from "@/lib/tebex";
import { useBasket } from "@/contexts/BasketContext";
import { addToBasket, getBasketAuthUrl } from "@/lib/tebex";
import { useParams, useRouter, useSearchParams } from "next/navigation";

type Package = {
  id: string;
  name: string;
  description: string;
  image?: string;
  base_price: number;
  total_price: number;
  currency: string;
  category: {
    id: string;
    name: string;
  };
};

export default function PackageDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const packageId = Array.isArray(params.id) ? params.id[0] : params.id as string;
  
  const [pkg, setPkg] = useState<Package | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const { basketIdent, refreshBasket, initializeBasket } = useBasket();
  const processedAddToCart = useRef(false);

  // Fetch package data
  useEffect(() => {
    async function loadPackage() {
      try {
        const response = await getPackageById(packageId);
        // The API returns packages in a data array, even for a single package
        if (response.data) {
          // Check if data is an array or a single object
          if (Array.isArray(response.data) && response.data.length > 0) {
            setPkg(response.data[0]);
          } else if (typeof response.data === 'object') {
            setPkg(response.data);
          } else {
            setError("Invalid package data format");
          }
        } else {
          setError("Package not found");
        }
      } catch (err) {
        console.error("Error loading package:", err);
        setError("Failed to load item details");
      } finally {
        setIsLoading(false);
      }
    }

    if (packageId) {
      loadPackage();
    }
  }, [packageId]);

  // Check if returning from auth with add=true parameter
  useEffect(() => {
    async function processAddToCart() {
      const shouldAdd = searchParams.get('add') === 'true';
      const pendingPackageId = localStorage.getItem('pendingPackageId');
      const pendingQuantity = localStorage.getItem('pendingQuantity');
      
      if (shouldAdd && basketIdent && pendingPackageId && pendingQuantity) {
        setIsAdding(true);
        setError('');
        
        try {
          // Add the package to the basket now that we're authenticated
          await addToBasket(basketIdent, pendingPackageId, parseInt(pendingQuantity, 10) || 1);
          await refreshBasket();
          
          // Clear the pending items
          localStorage.removeItem('pendingPackageId');
          localStorage.removeItem('pendingQuantity');
          
          // Remove the query parameter without reloading the page
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.delete('add');
          window.history.replaceState({}, '', newUrl.toString());
        } catch (err) {
          console.error("Error adding to basket after authentication:", err);
          setError("Failed to add item to cart after authentication");
        } finally {
          setIsAdding(false);
        }
      }
    }
    
    // Only process add-to-cart once when returning from auth
    if (basketIdent && !processedAddToCart.current) {
      processedAddToCart.current = true;
      processAddToCart();
    }
  }, [basketIdent]);

  const handleQuantityChange = (value: number) => {
    if (value >= 1) {
      setQuantity(value);
    }
  };

  const handleAddToBasket = async () => {
    if (!pkg) return;
    
    setIsAdding(true);
    try {
      let basketId = basketIdent;
      
      // If no basket exists yet, create one
      if (!basketId) {
        basketId = await initializeBasket();
      }
      
      if (basketId) {
        // Store package ID and quantity to add after authentication
        localStorage.setItem("pendingPackageId", pkg.id);
        localStorage.setItem("pendingQuantity", quantity.toString());
        
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
        const returnUrl = `${baseUrl}/packages/${pkg.id}?add=true`;
        
        // Get authentication URL and redirect
        const authResponse = await getBasketAuthUrl(basketId, returnUrl);
        if (authResponse?.auth_url) {
          window.location.href = authResponse.auth_url;
        } else {
          throw new Error("Could not get authentication URL");
        }
      }
    } catch (err) {
      console.error("Error starting basket authentication:", err);
      setError("Failed to start authentication process");
      setIsAdding(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (error || !pkg) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p className="text-red-600 mb-6">{error || "Item not found"}</p>
        <Link href="/packages" className="text-blue-600 hover:underline">
          Return to all items
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link href="/packages" className="text-blue-600 hover:underline mb-4 inline-block">
          &larr; Back to All Items
        </Link>
      </div>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-6">
          {error}
        </div>
      )}
      
      <div className="grid md:grid-cols-2 gap-8">
        <div className="relative h-[300px] md:h-[400px] bg-gray-100 rounded-lg overflow-hidden">
          {pkg.image ? (
            <Image 
              src={pkg.image} 
              alt={pkg.name} 
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-200">
              <span className="text-gray-500">No image available</span>
            </div>
          )}
        </div>
        
        <div>
          <h1 className="text-3xl font-bold mb-4">{pkg.name}</h1>
          
          {pkg.category && (
            <Link 
              href={`/categories/${pkg.category.id}`}
              className="inline-block mb-4 bg-gray-200 px-3 py-1 rounded-full text-sm hover:bg-gray-300 transition"
            >
              {pkg.category.name}
            </Link>
          )}
          
          <p className="text-2xl font-bold text-blue-600 mb-6">
            ${pkg.total_price.toFixed(2)} {pkg.currency}
          </p>
          
          <div className="mb-6" dangerouslySetInnerHTML={{ __html: pkg.description }} />
          
          <div className="flex items-center mb-6">
            <span className="mr-4">Quantity:</span>
            <div className="flex items-center">
              <button
                onClick={() => handleQuantityChange(quantity - 1)}
                className="w-10 h-10 border rounded-l flex items-center justify-center hover:bg-gray-100"
                disabled={quantity <= 1}
              >
                -
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                className="w-16 h-10 border-t border-b text-center"
                min="1"
              />
              <button
                onClick={() => handleQuantityChange(quantity + 1)}
                className="w-10 h-10 border rounded-r flex items-center justify-center hover:bg-gray-100"
              >
                +
              </button>
            </div>
          </div>
          
          <button
            onClick={handleAddToBasket}
            disabled={isAdding}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition w-full md:w-auto disabled:bg-blue-400"
          >
            {isAdding ? "Processing..." : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
} 