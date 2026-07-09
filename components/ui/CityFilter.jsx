'use client';
import { MapPin } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function CityFilter({ selectedCity, onSelect }) {
  const params = useParams();
  const locale = params?.locale || 'ar';
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCities();
  }, []);

  async function fetchCities() {
    try {
      const { data, error } = await supabase
        .from('cities')
        .select('*')
        .order('name_ar');

      if (error) {
        console.error('Error loading cities:', error);
        setCities([{ id: 'all', name_ar: 'جميع المدن', name_en: 'All Cities' }]);
      } else if (data) {
        setCities([
          { id: 'all', name_ar: 'جميع المدن', name_en: 'All Cities' },
          ...data
        ]);
        console.log('Cities loaded:', data);
      }
    } catch (err) {
      console.error('Error:', err);
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-3 justify-center mb-8">
      {cities.map((city) => {
        const cityValue = city.id === 'all' ? 'all' : (city.slug_en || String(city.id));
        return (
          <button
            key={city.id}
            onClick={() => {
              console.log('Selecting city:', cityValue);
              onSelect(cityValue);
            }}
            className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-300 ${
              selectedCity === cityValue
                ? 'bg-primary text-white shadow-lg scale-105'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <MapPin size={18} />
            <span className="font-medium">{locale === 'ar' ? city.name_ar : city.name_en}</span>
          </button>
        );
      })}
    </div>
  );
}