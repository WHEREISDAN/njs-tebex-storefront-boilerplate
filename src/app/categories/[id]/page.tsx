import Link from "next/link";
import { getCategoryById } from "@/lib/tebex";
import PackageCard from "@/components/PackageCard";
import { Suspense } from "react";

// Define types
type CategoryPackage = {
  id: string;
  name: string;
  description: string | null;
  image?: string;
  base_price: number;
  total_price: number;
  currency: string;
  category: {
    id: string;
    name: string;
  };
};

type Category = {
  id: string;
  name: string;
  description: string | null;
  image?: string;
  packages: CategoryPackage[];
};

type PageParams = {
  params: {
    id: string;
  };
};

// Generate metadata for the page
export async function generateMetadata({ params }: PageParams) {
  const { id } = params;
  
  try {
    const categoryData = await getCategoryById(id, true);
    
    // Handle the API response structure correctly
    let category: Category | null = null;
    
    if (categoryData.data) {
      // Check if data is an array or a single object
      if (Array.isArray(categoryData.data) && categoryData.data.length > 0) {
        category = categoryData.data[0] as Category;
      } else if (typeof categoryData.data === 'object') {
        category = categoryData.data as Category;
      }
    }
    
    if (!category) {
      return {
        title: "Category - Where Is Dan Store",
        description: "Browse items in this category",
      };
    }
    
    return {
      title: `${category.name} - Where Is Dan Store`,
      description: category.description || `Browse items in the ${category.name} category`,
    };
  } catch (error) {
    console.error("Error generating category metadata:", error);
    return {
      title: "Category - Where Is Dan Store",
      description: "Browse items in this category",
    };
  }
}

export default async function CategoryPage({ params }: PageParams) {
  const { id } = params;
  
  try {
    // Fetch category with its packages
    const categoryData = await getCategoryById(id, true);
    
    // Handle the API response structure correctly
    let category: Category | null = null;
    
    if (categoryData.data) {
      // Check if data is an array or a single object
      if (Array.isArray(categoryData.data) && categoryData.data.length > 0) {
        category = categoryData.data[0] as Category;
      } else if (typeof categoryData.data === 'object') {
        category = categoryData.data as Category;
      }
    }
    
    // If category wasn't found or has invalid format, throw an error
    if (!category) {
      throw new Error("Category not found or invalid format");
    }
    
    return (
      <div>
        <div className="mb-8">
          <Link href="/categories" className="text-blue-600 hover:underline mb-4 inline-block">
            &larr; Back to Categories
          </Link>
          <h1 className="text-3xl font-bold mb-4">{category.name}</h1>
          {category.description && <p className="text-gray-600 mb-2">{category.description}</p>}
        </div>
        
        {!category.packages || category.packages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">No items found in this category.</p>
            <Link href="/packages" className="text-blue-600 hover:underline mt-4 inline-block">
              Browse all items
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {category.packages.map((pkg) => (
              <PackageCard
                key={pkg.id}
                id={pkg.id}
                name={pkg.name}
                description={pkg.description || ""}
                image={pkg.image}
                price={pkg.total_price}
                currency={pkg.currency}
              />
            ))}
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error("Error loading category:", error);
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Category Not Found</h1>
        <p className="text-red-600 mb-6">The requested category could not be loaded.</p>
        <Link href="/categories" className="text-blue-600 hover:underline">
          Return to all categories
        </Link>
      </div>
    );
  }
} 