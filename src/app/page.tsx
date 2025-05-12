import Link from "next/link";
import { getStoreInfo, getCategories } from "@/lib/tebex";
import CategoryCard from "@/components/CategoryCard";
import Image from "next/image";

// Define the type for a category
type Category = {
  id: string;
  name: string;
  description: string | null;
  image?: string;
  package_count?: number;
};

export default async function Home() {
  // Fetch store info and featured categories
  const [storeData, categoriesData] = await Promise.all([
    getStoreInfo(),
    getCategories(false),
  ]);

  // Get featured categories (first 3)
  const featuredCategories = categoriesData.data.slice(0, 3) as Category[];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative rounded-xl overflow-hidden">
        {/* Background with overlay */}
        <div className="absolute inset-0 bg-black">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 to-gray-900/90 mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-[url('/hero-pattern.png')] opacity-20 bg-center"></div>
        </div>
        
        {/* Content */}
        <div className="relative py-24 px-8 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl sm:text-6xl font-bold mb-6">
              <span className="text-white">WHERE</span>
              <span className="text-blue-500">IS</span>
              <span className="text-white">DAN</span>
            </h1>
            <div className="h-1 w-24 bg-blue-500 mx-auto mb-8 rounded-full"></div>
            <p className="text-lg sm:text-xl max-w-2xl mx-auto mb-10 text-gray-300">
              Premium gaming products and digital items to enhance your gameplay experience
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                href="/categories"
                className="game-button-secondary"
              >
                Browse Categories
              </Link>
              <Link
                href="/packages"
                className="game-button-primary"
              >
                Shop All Items
              </Link>
            </div>
          </div>
        </div>
        
        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-auto">
            <path fill="#111827" fillOpacity="1" d="M0,128L48,133.3C96,139,192,149,288,154.7C384,160,480,160,576,138.7C672,117,768,75,864,69.3C960,64,1056,96,1152,112C1248,128,1344,128,1392,128L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </section>

      {/* Featured Categories */}
      <section>
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-white game-heading">Featured Categories</h2>
          <Link href="/categories" className="text-blue-400 hover:text-blue-300 transition-colors flex items-center">
            View all categories
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredCategories.map((category) => (
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
      </section>

      {/* Store Info */}
      <section className="bg-gray-800/50 border border-gray-700 rounded-xl p-8 backdrop-blur-sm">
        <h2 className="text-2xl font-bold mb-6 text-white game-heading">About Our Store</h2>
        <p className="mb-4 text-gray-300 text-lg">
          {storeData?.data?.name ? `Welcome to ${storeData.data.name}` : "Welcome to WHEREISDAN Store"}
        </p>
        <p className="text-gray-400 leading-relaxed">
          We offer a wide range of premium in-game items to enhance your gaming experience.
          Our store provides high-quality digital products with instant delivery, secure payments, 
          and excellent customer support. Browse our categories, choose the items you love, 
          and elevate your gameplay today!
        </p>
      </section>

      {/* Call To Action */}
      <section className="relative overflow-hidden rounded-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-800 to-blue-600"></div>
        <div className="absolute inset-0 bg-[url('/grid-pattern.png')] opacity-20"></div>
        
        <div className="relative p-10 text-center">
          <h2 className="text-3xl font-bold mb-4 text-white">Ready to Enhance Your Gaming Experience?</h2>
          <p className="mb-8 max-w-2xl mx-auto text-blue-100">
            Explore our store and find the perfect items to take your gameplay to the next level.
            Premium products, instant delivery, secure payments.
          </p>
          <Link
            href="/packages"
            className="inline-block px-8 py-3 bg-white text-blue-700 rounded-md font-medium hover:bg-gray-100 transition-colors shadow-lg hover:shadow-blue-500/20"
          >
            Shop Now
          </Link>
        </div>
      </section>
    </div>
  );
}
