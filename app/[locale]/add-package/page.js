'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Building2, Phone, Mail, MapPin, User, Send, CheckCircle, Sparkles, Award, Clock, Users, MessageCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
// ❌ حذف: import Header from '@/components/ui/Header';
// ❌ حذف: import Footer from '@/components/ui/Footer';

export default function AddPackagePage() {
  const params = useParams();
  const locale = params?.locale || 'ar';
  const [mounted, setMounted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    city: '',
    venue_name: '',
    notes: ''
  });

  useEffect(() => {
    setMounted(true);
    const dir = locale === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', locale);
    document.body.className = locale === 'ar' ? 'font-sans-ar' : 'font-sans-en';
    document.documentElement.style.direction = dir;
  }, [locale]);

  const content = {
    ar: {
      title: 'أدرج باقاتك معنا',
      subtitle: 'انضم إلى منصة theQapp ووصل لعملاء جدد',
      name: 'الاسم الكامل',
      phone: 'رقم الجوال',
      email: 'البريد الإلكتروني',
      city: 'المدينة',
      venueName: 'اسم مكان الحفلات',
      notes: 'ملاحظات إضافية',
      notesPlaceholder: 'أي تفاصيل إضافية تريد إضافتها...',
      submit: 'إرسال الطلب',
      success: 'تم استلام طلبك! 🎉',
      successMessage: 'شكراً لك، سوف يتم التواصل معك من قبل الفريق المعني بأسرع وقت، نسعد بالشراكة معكم',
      newRequest: 'طلب جديد',
      benefits: 'مزايا الشراكة معنا',
      benefit1: 'وصول إلى أكثر من 1,000,000 عميل',
      benefit2: 'دعم تسويقي متكامل',
      benefit3: 'منصة حجز متطورة',
      benefit4: 'فريق دعم على مدار الساعة'
    },
    en: {
      title: 'List Your Venue',
      subtitle: 'Join theQapp platform and reach new customers',
      name: 'Full Name',
      phone: 'Phone Number',
      email: 'Email Address',
      city: 'City',
      venueName: 'Venue Name',
      notes: 'Additional Notes',
      notesPlaceholder: 'Any additional details you want to add...',
      submit: 'Submit Request',
      success: 'Request Received! 🎉',
      successMessage: 'Thank you! Our team will contact you as soon as possible. We are excited to partner with you.',
      newRequest: 'New Request',
      benefits: 'Partnership Benefits',
      benefit1: 'Reach over 1,000,000 customers',
      benefit2: 'Complete marketing support',
      benefit3: 'Advanced booking platform',
      benefit4: '24/7 support team'
    }
  };

  const t = content[locale] || content.ar;

  const benefits = [
    { icon: <Users size={24} />, text: t.benefit1 },
    { icon: <Sparkles size={24} />, text: t.benefit2 },
    { icon: <Award size={24} />, text: t.benefit3 },
    { icon: <Clock size={24} />, text: t.benefit4 }
  ];

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('partner_requests')
        .insert({
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          city: formData.city,
          venue_name: formData.venue_name,
          notes: formData.notes || null,
          status: 'pending'
        });
      
      if (!error) {
        setSubmitted(true);
        setFormData({
          name: '',
          phone: '',
          email: '',
          city: '',
          venue_name: '',
          notes: ''
        });
        
        // ✅ إرسال حدث لتحديث صفحة الأدمن
        window.dispatchEvent(new CustomEvent('partnerRequestSubmitted', {
          detail: { 
            message: 'New partner request submitted!',
            timestamp: new Date().toISOString()
          }
        }));
        
        console.log('✅ Partner request submitted successfully!');
      } else {
        console.error('❌ Error submitting:', error);
        alert(locale === 'ar' ? 'حدث خطأ، يرجى المحاولة مرة أخرى' : 'An error occurred, please try again');
      }
    } catch (err) {
      console.error('❌ Error:', err);
      alert(locale === 'ar' ? 'حدث خطأ، يرجى المحاولة مرة أخرى' : 'An error occurred, please try again');
    }
    
    setSubmitting(false);
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    // ❌ حذف: <Header />
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Benefits - الجانب الأيسر */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="bg-gradient-to-br from-primary to-blue-800 rounded-2xl p-6 text-white sticky top-24">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Award size={24} />
                {t.benefits}
              </h3>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3 bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                    <div className="bg-white/20 rounded-full p-2 flex-shrink-0">
                      {benefit.icon}
                    </div>
                    <p className="text-sm font-light">{benefit.text}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-white/20 text-center">
                <p className="text-sm opacity-80">
                  {locale === 'ar' ? 'انضم إلى أكثر من 500 شريك' : 'Join over 500 partners'}
                </p>
              </div>
            </div>
          </div>

          {/* Form - الجانب الأيمن */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-10 h-10 text-primary" />
                </div>
                <h1 className="text-3xl font-bold text-primary">{t.title}</h1>
                <p className="text-gray-600 mt-2">{t.subtitle}</p>
              </div>

              {submitted ? (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-8 text-center">
                  <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                    <CheckCircle size={40} className="text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-green-700 mb-3">{t.success}</h3>
                  <p className="text-gray-700 text-lg leading-relaxed max-w-md mx-auto">
                    {t.successMessage}
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-6 bg-primary text-white px-8 py-3 rounded-xl hover:bg-primary/90 transition shadow-lg hover:shadow-xl"
                  >
                    {t.newRequest}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 mb-2 flex items-center gap-2 text-sm font-medium">
                        <User size={16} className="text-primary" /> {t.name} *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary transition"
                        placeholder={t.name}
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-2 flex items-center gap-2 text-sm font-medium">
                        <Building2 size={16} className="text-primary" /> {t.venueName} *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.venue_name}
                        onChange={(e) => setFormData({...formData, venue_name: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary transition"
                        placeholder={t.venueName}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 mb-2 flex items-center gap-2 text-sm font-medium">
                        <Phone size={16} className="text-primary" /> {t.phone} *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary transition"
                        placeholder="05xxxxxxxx"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-2 flex items-center gap-2 text-sm font-medium">
                        <Mail size={16} className="text-primary" /> {t.email} *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary transition"
                        placeholder="info@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2 flex items-center gap-2 text-sm font-medium">
                      <MapPin size={16} className="text-primary" /> {t.city} *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary transition"
                      placeholder={locale === 'ar' ? 'مثال: الرياض، جدة، دبي...' : 'e.g. Riyadh, Jeddah, Dubai...'}
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2 flex items-center gap-2 text-sm font-medium">
                      <MessageCircle size={16} className="text-primary" /> {t.notes}
                    </label>
                    <textarea
                      rows="3"
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary transition resize-none"
                      placeholder={t.notesPlaceholder}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-gradient-to-r from-primary to-blue-700 text-white py-3.5 rounded-xl flex items-center justify-center gap-2 hover:shadow-lg transition disabled:opacity-50 text-lg font-semibold"
                  >
                    <Send size={18} />
                    {submitting ? (locale === 'ar' ? 'جاري الإرسال...' : 'Submitting...') : t.submit}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    // ❌ حذف: <Footer />
  );
}