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
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="relative rounded-xl overflow-hidden">
        {/* Background with overlay */}
        <div className="absolute inset-0 bg-gray-900">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 to-gray-900/90 mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-[url('/grid-pattern.png')] opacity-10 bg-center"></div>
        </div>
        
        {/* Content */}
        <div className="relative py-24 px-8 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl sm:text-6xl font-bold mb-6">
              <span className="text-white">WHERE</span>
              <span className="text-blue-400">IS</span>
              <span className="text-white">DAN</span>
            </h1>
            <div className="h-1 w-24 bg-blue-400 mx-auto mb-8 rounded-full"></div>
            <p className="text-lg sm:text-xl max-w-2xl mx-auto mb-10 text-gray-300">
              Premium gaming products and digital items to enhance your gameplay experience
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                href="/categories"
                className="bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg border border-gray-700 transition-colors shadow-lg hover:shadow-blue-500/20 flex items-center justify-center"
              >
                Browse Categories
              </Link>
              <Link
                href="/packages"
                className="bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 px-6 rounded-lg transition-colors shadow-lg hover:shadow-blue-500/20 flex items-center justify-center"
              >
                Shop All Items
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section>
        <div className="flex justify-between items-center mb-8">
          <div className="relative">
            <h2 className="text-2xl font-bold text-white">Featured Categories</h2>
            <div className="absolute -bottom-2 left-0 w-12 h-1 bg-blue-400 rounded-full"></div>
          </div>
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

      {/* Features Section */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Feature 1 */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-lg bg-blue-500/10">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
          </div>
          <h3 className="text-center text-white font-semibold mb-2">Instant Delivery</h3>
          <p className="text-gray-400 text-center text-sm">
            All your purchases are instantly delivered to you as soon as payment is completed.
          </p>
        </div>
        
        {/* Feature 2 */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-lg bg-blue-500/10">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>
          <h3 className="text-center text-white font-semibold mb-2">Secured Content</h3>
          <p className="text-gray-400 text-center text-sm">
            All products are protected and licensed exclusively for your use.
          </p>
        </div>
        
        {/* Feature 3 */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-lg bg-blue-500/10">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
          <h3 className="text-center text-white font-semibold mb-2">Configuration</h3>
          <p className="text-gray-400 text-center text-sm">
            All our products are thoroughly documented with detailed configuration files.
          </p>
        </div>
        
        {/* Feature 4 */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-lg bg-blue-500/10">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
          <h3 className="text-center text-white font-semibold mb-2">Support</h3>
          <p className="text-gray-400 text-center text-sm">
            Customers can always create a ticket for prompt assistance at any time.
          </p>
        </div>
      </section>

      {/* Store Info */}
      <section className="bg-gray-800/50 border border-gray-700 rounded-xl p-8 backdrop-blur-sm">
        <div className="relative mb-6">
          <h2 className="text-2xl font-bold text-white">About Our Store</h2>
          <div className="absolute -bottom-2 left-0 w-12 h-1 bg-blue-400 rounded-full"></div>
        </div>
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

      {/* Customer Count */}
      <section className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
        <div className="relative p-10 text-center">
          <h2 className="text-3xl font-bold mb-4 text-white">We have over 10,000 happy customers</h2>
          <p className="mb-4 max-w-2xl mx-auto text-gray-400">
            Join thousands of satisfied gamers who have enhanced their gameplay with our premium products
          </p>
        </div>
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

      {/* FAQ Section */}
      <section>
        <div className="relative mb-8">
          <h2 className="text-2xl font-bold text-white">Frequently asked questions</h2>
          <div className="absolute -bottom-2 left-0 w-12 h-1 bg-blue-400 rounded-full"></div>
        </div>
        
        <div className="space-y-4">
          <div className="border border-gray-700 rounded-lg overflow-hidden">
            <details className="group">
              <summary className="flex items-center justify-between px-6 py-4 bg-gray-800 cursor-pointer">
                <h3 className="text-white font-medium">How do I receive my purchase?</h3>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-6 py-4 bg-gray-800/50 border-t border-gray-700">
                <p className="text-gray-400">
                  After completing your purchase, you'll receive an email with download instructions or access credentials.
                  All digital items are delivered instantly to your account.
                </p>
              </div>
            </details>
          </div>
          
          <div className="border border-gray-700 rounded-lg overflow-hidden">
            <details className="group">
              <summary className="flex items-center justify-between px-6 py-4 bg-gray-800 cursor-pointer">
                <h3 className="text-white font-medium">What payment methods do you accept?</h3>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-6 py-4 bg-gray-800/50 border-t border-gray-700">
                <p className="text-gray-400">
                  We accept all major credit cards, PayPal, and various regional payment methods.
                  All transactions are processed securely through our payment provider.
                </p>
              </div>
            </details>
          </div>
          
          <div className="border border-gray-700 rounded-lg overflow-hidden">
            <details className="group">
              <summary className="flex items-center justify-between px-6 py-4 bg-gray-800 cursor-pointer">
                <h3 className="text-white font-medium">Do you offer refunds?</h3>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-6 py-4 bg-gray-800/50 border-t border-gray-700">
                <p className="text-gray-400">
                  Due to the digital nature of our products, we generally do not offer refunds.
                  However, please contact our support team if you encounter any issues with your purchase.
                </p>
              </div>
            </details>
          </div>
        </div>
      </section>
    </div>
  );
}
