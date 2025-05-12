import { getAllPackages } from "@/lib/tebex";
import PackageCard from "@/components/PackageCard";

// Define types
type Package = {
  id: string;
  name: string;
  description: string | null;
  image?: string;
  base_price: number;
  total_price: number;
  currency: string;
};

export const metadata = {
  title: "All Items - Where Is Dan Store",
  description: "Browse all items available in our store",
};

export default async function PackagesPage() {
  // Fetch all packages
  const packagesData = await getAllPackages();
  const packages = packagesData.data as Package[];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">All Items</h1>
      
      {packages.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-gray-600">No items found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => (
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
} 