'use client';
import { Search } from 'lucide-react';
import { useParams } from 'next/navigation';

export default function SearchBar({ searchTerm, onSearch }) {
  const params = useParams();
  const locale = params?.locale || 'ar';
  
  const placeholder = locale === 'ar' 
    ? 'ابحث عن مكان حفلة...' 
    : 'Search for a party venue...';

  return (
    <div className="relative max-w-2xl mx-auto mt-6">
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearch(e.target.value)}
          placeholder={placeholder}
          className="w-full px-6 py-4 pl-14 bg-white border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 shadow-lg hover:shadow-xl text-gray-700 placeholder-gray-400"
          aria-label={placeholder}
        />
        <Search 
          size={20} 
          className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" 
        />
        {searchTerm && (
          <button
            onClick={() => onSearch('')}
            className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}