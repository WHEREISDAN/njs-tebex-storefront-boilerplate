import Link from "next/link";
import Image from "next/image";

type CategoryProps = {
  id: string;
  name: string;
  description: string;
  image?: string;
  packageCount?: number;
};

export default function CategoryCard({ id, name, description, image, packageCount = 0 }: CategoryProps) {
  return (
    <Link href={`/categories/${id}`} className="block">
      <div className="game-card group h-full">
        <div className="relative h-40 w-full bg-gray-900">
          {image ? (
            <Image 
              src={image}
              alt={name}
              fill
              className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-800">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-gray-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-70"></div>
        </div>
        
        <div className="p-5">
          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">{name}</h3>
          <p className="text-gray-400 mb-3 line-clamp-2 text-sm">{description}</p>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-500">
              {packageCount} {packageCount === 1 ? "item" : "items"}
            </span>
            <div className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              View Category
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
} 