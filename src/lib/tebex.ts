const TEBEX_BASE_URL = "https://headless.tebex.io/api";
const PUBLIC_TOKEN = process.env.NEXT_PUBLIC_TEBEX_PUBLIC_TOKEN;

// Get the CSRF token from cookies
function getCsrfToken(): string | null {
  if (typeof document === 'undefined') return null;
  const cookies = document.cookie.split(';');
  const csrfCookie = cookies.find(cookie => cookie.trim().startsWith('csrf_token='));
  if (!csrfCookie) return null;
  return csrfCookie.split('=')[1];
}

// Store CSRF token in memory cache
let cachedCsrfToken: string | null = null;

// Function to add CSRF token to headers for state-changing operations
function addCsrfToken(headers: HeadersInit): HeadersInit {
  // Try from memory cache first, then cookie
  const csrfToken = cachedCsrfToken || getCsrfToken();
  if (csrfToken) {
    return {
      ...headers,
      'X-CSRF-Token': csrfToken,
    };
  }
  return headers;
}

// Function to ensure we have a CSRF token before making a request
async function ensureCsrfToken(): Promise<void> {
  // Only fetch a new token if we don't have one cached or in cookies
  if (!cachedCsrfToken && !getCsrfToken()) {
    try {
      const res = await fetch('/api/basket/csrf');
      if (!res.ok) {
        console.error('Failed to fetch CSRF token', res.status);
        return;
      }
      
      const data = await res.json();
      if (data && data.token) {
        // Store token in memory cache
        cachedCsrfToken = data.token;
        console.log('CSRF token fetched and cached');
      }
      
      // Give browser time to process cookie
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error('Error fetching CSRF token:', error);
    }
  }
}

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
    
    // Ensure we have a CSRF token
    await ensureCsrfToken();
    
    // Use server-side API route instead of direct Tebex API call
    const res = await fetch('/api/basket/create', {
      method: 'POST',
      headers: addCsrfToken({
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify({ 
        completeUrl, 
        cancelUrl 
      }),
      cache: 'no-store',
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to create basket: ${res.status} ${errorText}`);
    }
    
    return res.json();
  } catch (error) {
    console.error('Error creating basket:', error);
    throw error;
  }
}

export async function getBasket(basketIdent: string) {
  try {
    // Use server-side API route instead of direct Tebex API call
    const res = await fetch(`/api/basket/${basketIdent}`, {
      cache: 'no-store',
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
    // Ensure we have a CSRF token
    await ensureCsrfToken();
    
    // Use server-side API route instead of direct Tebex API call
    const res = await fetch(`/api/basket/${basketIdent}/add`, {
      method: 'POST',
      headers: addCsrfToken({
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify({ 
        packageId, 
        quantity 
      }),
      cache: 'no-store',
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to add package to basket: ${res.status} ${errorText}`);
    }
    
    return res.json();
  } catch (error) {
    console.error('Error adding to basket:', error);
    throw error;
  }
}

export async function updateBasketItem(basketIdent: string, packageId: string, quantity: number) {
  try {
    // Ensure we have a CSRF token
    await ensureCsrfToken();
    
    // Use server-side API route instead of direct Tebex API call
    const res = await fetch(`/api/basket/${basketIdent}/update`, {
      method: 'PUT',
      headers: addCsrfToken({
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify({ 
        packageId, 
        quantity 
      }),
      cache: 'no-store',
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to update basket item quantity: ${res.status} ${errorText}`);
    }
    
    return res.json();
  } catch (error) {
    console.error('Error updating basket item:', error);
    throw error;
  }
}

export async function removeFromBasket(basketIdent: string, packageId: string) {
  try {
    // Ensure we have a CSRF token
    await ensureCsrfToken();
    
    // Use server-side API route instead of direct Tebex API call
    const res = await fetch(`/api/basket/${basketIdent}/remove`, {
      method: 'POST',
      headers: addCsrfToken({
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify({ 
        packageId 
      }),
      cache: 'no-store',
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to remove item from basket: ${res.status} ${errorText}`);
    }
    
    return res.json();
  } catch (error) {
    console.error('Error removing item from basket:', error);
    throw error;
  }
}

export async function getBasketAuthUrl(basketIdent: string, returnUrl: string) {
  try {
    // Validate returnUrl on client side before sending to server
    if (!returnUrl.startsWith('http://localhost:') && 
        !returnUrl.startsWith('https://localhost:') && 
        !returnUrl.startsWith('http://127.0.0.1:') &&
        !returnUrl.startsWith(window.location.origin)) {
      throw new Error('Invalid return URL. Must be a URL from the same origin.');
    }
    
    // Use server-side API route instead of direct Tebex API call
    const encodedReturnUrl = encodeURIComponent(returnUrl);
    const res = await fetch(`/api/basket/${basketIdent}/auth?returnUrl=${encodedReturnUrl}`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to get basket auth URL: ${res.status} ${errorText}`);
    }
    
    return res.json();
  } catch (error) {
    console.error('Error getting basket auth URL:', error);
    throw error;
  }
} 