import { getCategories } from "@/lib/tebex";
import CategoryCard from "@/components/CategoryCard";

// Define the type for a category
type Category = {
  id: string;
  name: string;
  description: string | null;
  image?: string;
  package_count?: number;
};

export const metadata = {
  title: "Categories - WHEREISDAN Store",
  description: "Browse all categories of items in our store",
};

export default async function CategoriesPage() {
  try {
    // Fetch categories
    const categoriesData = await getCategories(false);
    
    // Ensure we're accessing the data correctly
    if (!categoriesData.data) {
      throw new Error("Invalid categories data format");
    }
    
    const categories = categoriesData.data as Category[];

    return (
      <div>
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white game-heading mb-6">All Categories</h1>
          <p className="text-gray-400 max-w-3xl">
            Browse through our selection of premium gaming products and digital items,
            organized by category to help you find exactly what you're looking for.
          </p>
        </div>
        
        {categories.length === 0 ? (
          <div className="text-center py-16 bg-gray-800/30 rounded-lg border border-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-lg text-gray-400 mb-4">No categories found.</p>
            <button 
              onClick={() => window.location.reload()}
              className="game-button-secondary"
            >
              Refresh Page
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                id={category.id}
                name={category.name}
                description={category.description || ""}
                image={category.image}
                packageCount={category.package_count || 0}
              />
            ))}
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error("Error loading categories:", error);
    return (
      <div className="text-center py-16 bg-gray-800/30 rounded-lg border border-gray-700">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h1 className="text-2xl font-bold mb-4 text-white">Error Loading Categories</h1>
        <p className="text-red-400 mb-6">The categories could not be loaded.</p>
        <button 
          onClick={() => window.location.reload()}
          className="game-button-primary"
        >
          Try Again
        </button>
      </div>
    );
  }
} 