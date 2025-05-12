const TEBEX_BASE_URL = "https://headless.tebex.io/api";
const PUBLIC_TOKEN = process.env.NEXT_PUBLIC_TEBEX_PUBLIC_TOKEN;
const PRIVATE_TOKEN = process.env.TEBEX_PRIVATE_TOKEN?.trim();

// Store information 
export async function getStoreInfo() {
  try {
    const res = await fetch(`${TEBEX_BASE_URL}/accounts/${PUBLIC_TOKEN}`, {
      headers: {
        Accept: "application/json",
      },
      next: { revalidate: 3600 }, // Cache for an hour
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to fetch store info: ${res.status} ${errorText}`);
    }
    
    return res.json();
  } catch (error) {
    console.error('Error fetching store info:', error);
    throw error;
  }
}

// Categories
export async function getCategories(includePackages = false) {
  try {
    const url = includePackages 
      ? `${TEBEX_BASE_URL}/accounts/${PUBLIC_TOKEN}/categories?includePackages=1`
      : `${TEBEX_BASE_URL}/accounts/${PUBLIC_TOKEN}/categories`;
    
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
      next: { revalidate: 3600 }, // Cache for an hour
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to fetch categories: ${res.status} ${errorText}`);
    }
    
    return res.json();
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
}

export async function getCategoryById(categoryId: string, includePackages = true) {
  try {
    const url = includePackages 
      ? `${TEBEX_BASE_URL}/accounts/${PUBLIC_TOKEN}/categories/${categoryId}?includePackages=1`
      : `${TEBEX_BASE_URL}/accounts/${PUBLIC_TOKEN}/categories/${categoryId}`;
    
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
      next: { revalidate: 3600 }, // Cache for an hour
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to fetch category with ID ${categoryId}: ${res.status} ${errorText}`);
    }
    
    return res.json();
  } catch (error) {
    console.error(`Error fetching category ${categoryId}:`, error);
    throw error;
  }
}

// Packages
export async function getAllPackages() {
  try {
    const res = await fetch(`${TEBEX_BASE_URL}/accounts/${PUBLIC_TOKEN}/packages`, {
      headers: {
        Accept: "application/json",
      },
      next: { revalidate: 3600 }, // Cache for an hour
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to fetch packages: ${res.status} ${errorText}`);
    }
    
    return res.json();
  } catch (error) {
    console.error('Error fetching packages:', error);
    throw error;
  }
}

export async function getPackageById(packageId: string) {
  try {
    const res = await fetch(`${TEBEX_BASE_URL}/accounts/${PUBLIC_TOKEN}/packages/${packageId}`, {
      headers: {
        Accept: "application/json",
      },
      next: { revalidate: 3600 }, // Cache for an hour
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to fetch package with ID ${packageId}: ${res.status} ${errorText}`);
    }
    
    return res.json();
  } catch (error) {
    console.error(`Error fetching package ${packageId}:`, error);
    throw error;
  }
}

// Basket operations
export async function createBasket(completeUrl: string, cancelUrl: string) {
  try {
    console.log('Creating basket with URLs:', { completeUrl, cancelUrl });
    
    const requestBody = {
      complete_url: completeUrl,
      cancel_url: cancelUrl,
      complete_auto_redirect: true,
      custom: ["Client-side basket creation"]
    };
    
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      "Accept": "application/json",
    };
    
    // Add the private token header if available
    if (PRIVATE_TOKEN) {
      headers["X-Tebex-Secret"] = PRIVATE_TOKEN;
    }
    
    const res = await fetch(`${TEBEX_BASE_URL}/accounts/${PUBLIC_TOKEN}/baskets`, {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody),
      cache: "no-store",
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to create basket: ${res.status} ${errorText}`);
    }
    
    const response = await res.json();
    console.log('Basket creation response:', response);
    
    // Handle the nested response structure
    if (response.data && response.data.ident) {
      return { ident: response.data.ident };
    }
    
    throw new Error('Invalid basket response: Missing ident in data object');
  } catch (error) {
    console.error('Error creating basket:', error);
    throw error;
  }
}

export async function getBasket(basketIdent: string) {
  try {
    const headers: HeadersInit = {
      "Accept": "application/json",
    };
    
    // Add the private token header if available
    if (PRIVATE_TOKEN) {
      headers["X-Tebex-Secret"] = PRIVATE_TOKEN;
    }
    
    const res = await fetch(`${TEBEX_BASE_URL}/accounts/${PUBLIC_TOKEN}/baskets/${basketIdent}`, {
      headers,
      cache: "no-store" // Don't cache basket data
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to fetch basket: ${res.status} ${errorText}`);
    }
    
    const response = await res.json();
    
    if (!response.data) {
      throw new Error('Invalid basket response: Missing data object');
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching basket:', error);
    throw error;
  }
}

export async function addToBasket(basketIdent: string, packageId: string, quantity: number = 1) {
  try {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      "Accept": "application/json",
    };
    
    // Add the private token header if available
    if (PRIVATE_TOKEN) {
      headers["X-Tebex-Secret"] = PRIVATE_TOKEN;
    }
    
    const res = await fetch(`${TEBEX_BASE_URL}/baskets/${basketIdent}/packages`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        package_id: packageId,
        quantity: quantity,
      }),
      cache: "no-store",
    });

    if (!res.ok) {
      /*
       * Tebex returns a HTTP 400 with a JSON payload when the package already exists
       * in the basket. Instead of treating this as a fatal error, fetch the basket,
       * determine the current quantity of the item, and update it with the desired
       * increment. This ensures the user can seamlessly increase quantities without
       * running into front-end errors.
       */
      if (res.status === 400) {
        try {
          const errorJson = await res.json();
          const duplicateMsg = errorJson?.detail ?? "";

          if (typeof duplicateMsg === "string" && duplicateMsg.toLowerCase().includes("already in your basket")) {
            // Fetch the current basket to determine existing quantity
            const currentBasket = await getBasket(basketIdent);

            // Locate the existing package entry in the basket
            const existingItem = Array.isArray(currentBasket.packages)
              ? currentBasket.packages.find((p: any) => (p.package?.id || p.id) === packageId)
              : undefined;

            const existingQty = existingItem?.qty || existingItem?.quantity || 0;
            const newQty = existingQty + quantity;

            // Perform a quantity update instead of an add
            await updateBasketItem(basketIdent, packageId, newQty);

            // Return a shape similar to add success for consistency
            return { success: true, quantity: newQty };
          }
        } catch (innerErr) {
          // Fall through to generic error handling below if anything goes wrong
          console.error("Error handling duplicate-package scenario:", innerErr);
        }
      }

      // Generic error handling for everything else
      const errorText = await res.text();
      throw new Error(`Failed to add to basket: ${res.status} ${errorText}`);
    }
    
    return res.json();
  } catch (error) {
    console.error('Error adding to basket:', error);
    throw error;
  }
}

export async function updateBasketItem(basketIdent: string, packageId: string, quantity: number) {
  try {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    
    // Add the private token header if available
    if (PRIVATE_TOKEN) {
      headers["X-Tebex-Secret"] = PRIVATE_TOKEN;
    }
    
    const res = await fetch(`${TEBEX_BASE_URL}/baskets/${basketIdent}/packages/${packageId}`, {
      method: "PUT",
      headers,
      body: JSON.stringify({
        quantity: quantity,
      }),
      cache: "no-store",
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to update basket item quantity: ${res.status} ${errorText}`);
    }
    
    // This endpoint returns no content on success
    return { success: true };
  } catch (error) {
    console.error('Error updating basket item:', error);
    throw error;
  }
}

export async function removeFromBasket(basketIdent: string, packageId: string) {
  try {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      "Accept": "application/json",
    };
    
    // Add the private token header if available
    if (PRIVATE_TOKEN) {
      headers["X-Tebex-Secret"] = PRIVATE_TOKEN;
    }
    
    const res = await fetch(`${TEBEX_BASE_URL}/baskets/${basketIdent}/packages/remove`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        package_id: packageId,
      }),
      cache: "no-store",
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to remove item from basket: ${res.status} ${errorText}`);
    }
    
    // This endpoint returns the full basket object after removal
    return res.json();
  } catch (error) {
    console.error('Error removing item from basket:', error);
    throw error;
  }
}

export async function getBasketAuthUrl(basketIdent: string, returnUrl: string) {
  try {
    const headers: HeadersInit = {
      "Accept": "application/json",
    };
    
    // Add the private token header if available
    if (PRIVATE_TOKEN) {
      headers["X-Tebex-Secret"] = PRIVATE_TOKEN;
    }
    
    const encodedReturnUrl = encodeURIComponent(returnUrl);
    const res = await fetch(`${TEBEX_BASE_URL}/accounts/${PUBLIC_TOKEN}/baskets/${basketIdent}/auth?returnUrl=${encodedReturnUrl}`, {
      headers,
      cache: "no-store",
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to get basket auth URL: ${res.status} ${errorText}`);
    }
    
    // The auth endpoint returns an array of auth providers with their URL
    const authProviders = await res.json();
    
    // If there are auth providers, return the first one's URL
    if (Array.isArray(authProviders) && authProviders.length > 0) {
      return { auth_url: authProviders[0].url };
    }
    
    // If no auth providers, we can use the checkout URL from the basket
    const basketData = await getBasket(basketIdent);
    if (basketData.links && basketData.links.checkout) {
      return { auth_url: basketData.links.checkout };
    }
    
    throw new Error('No authentication URL available for this basket');
  } catch (error) {
    console.error('Error getting basket auth URL:', error);
    throw error;
  }
} 