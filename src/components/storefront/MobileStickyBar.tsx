import { MessageCircle, Phone } from 'lucide-react';
import { useShopSettings } from '@/context/ShopSettingsContext';
import { getWhatsAppUrl } from '@/lib/whatsapp';
import { useLocation } from 'react-router-dom';

export function MobileStickyBar() {
  const { settings } = useShopSettings();
  const location = useLocation();

  // Don't show on checkout page (has its own actions) or admin
  if (location.pathname.startsWith('/admin') || location.pathname === '/checkout') {
    return null;
  }

  const whatsappNumber = settings?.whatsapp_number || '919855882263';
  const phoneNumber = settings?.phone_number || '919855882263';

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden flex gap-px shadow-lg">
      <a
        href={getWhatsAppUrl(whatsappNumber, 'Hi Sachdeva Mens Wear, I would like to know more about your products.')}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#25D366] text-white text-sm font-semibold active:scale-95 transition-transform"
      >
        <MessageCircle className="w-5 h-5" />
        WhatsApp
      </a>
      <a
        href={`tel:${phoneNumber}`}
        className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary-900 text-white text-sm font-semibold active:scale-95 transition-transform"
      >
        <Phone className="w-5 h-5" />
        Call
      </a>
    </div>
  );
}
