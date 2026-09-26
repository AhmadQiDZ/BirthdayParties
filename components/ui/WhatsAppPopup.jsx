'use client';
import { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { useParams } from 'next/navigation';

export default function WhatsAppPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [country, setCountry] = useState('SA');
  const params = useParams();
  const locale = params?.locale || 'ar';
  
  const contactText = locale === 'ar' ? 'تواصل معنا' : 'Contact Us';
  const whatsappText = 'WhatsApp';

  useEffect(() => {
    const savedCountry = localStorage.getItem('userCountry');
    if (savedCountry) {
      setCountry(savedCountry);
    }
    setTimeout(() => setIsVisible(true), 3000);
  }, []);

  const getWhatsAppLink = () => {
    if (country === 'UAE') {
      return 'https://api.whatsapp.com/send?phone=971527729226';
    }
    return 'https://api.whatsapp.com/send?phone=966552552880';
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50 animate-slide-up">
      <div className="relative">
        <button
          onClick={() => setIsVisible(false)}
          className="absolute -top-3 -right-3 bg-gray-800 text-white rounded-full p-1 hover:bg-gray-700 transition"
        >
          <X size={16} />
        </button>
        <a
          href={getWhatsAppLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 bg-[#25D366] text-white px-5 py-3 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
        >
          <MessageCircle size={24} />
          <div>
            <p className="font-bold text-sm">{contactText}</p>
            <p className="text-xs opacity-90">{whatsappText}</p>
          </div>
        </a>
      </div>
    </div>
  );
}