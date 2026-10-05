import { useShopSettings } from '@/context/ShopSettingsContext';
import { MapPin, Phone, Clock, MessageCircle, Store, Instagram } from 'lucide-react';
import { getWhatsAppUrl } from '@/lib/whatsapp';

export function AboutPage() {
  const { settings } = useShopSettings();
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-display tracking-wide text-primary-900 mb-6">
        About Sachdeva Mens Wear
      </h1>
      <div className="prose prose-sm max-w-none">
        <p className="text-primary-600 leading-relaxed mb-4">
          Sachdeva Mens Wear is a men's clothing store in Fazilka offering trendy, comfortable and
          affordable styles for everyday wear. From shirts and T-shirts to jeans and casual bottoms,
          discover new styles and fresh arrivals at our store.
        </p>
        <p className="text-primary-600 leading-relaxed mb-4">
          We focus on what matters: latest styles, good fits and pocket-friendly prices. No
          complicated online checkout. Just browse, pick what you like, and order on WhatsApp.
        </p>
        <p className="text-primary-600 leading-relaxed mb-6">
          Visit us in Ph 22, Fazilka, right opposite Vishal Mega Mart.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card p-5">
          <Store className="w-6 h-6 text-accent-500 mb-2" />
          <h3 className="font-semibold text-primary-900 mb-1">Visit Our Store</h3>
          <p className="text-sm text-primary-600">{settings?.address}</p>
          <p className="text-sm text-primary-500 mt-1">Opposite Vishal Mega Mart, Fazilka</p>
        </div>
        <div className="card p-5">
          <MessageCircle className="w-6 h-6 text-[#25D366] mb-2" />
          <h3 className="font-semibold text-primary-900 mb-1">Easy WhatsApp Ordering</h3>
          <p className="text-sm text-primary-600 mb-2">
            Browse products online and order directly on WhatsApp.
          </p>
          <a
            href={getWhatsAppUrl(settings?.whatsapp_number || '', 'Hi Sachdeva Mens Wear, I would like to know more about your products.')}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[#25D366] hover:text-[#1da851] font-medium"
          >
            Chat on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}

export function ContactPage() {
  const { settings } = useShopSettings();
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-display tracking-wide text-primary-900 mb-6">Contact Us</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="card p-5">
          <MapPin className="w-5 h-5 text-accent-500 mb-2" />
          <h3 className="font-semibold text-primary-900 text-sm mb-1">Address</h3>
          <p className="text-sm text-primary-600">{settings?.address}</p>
          <p className="text-sm text-primary-500 mt-1">Opposite Vishal Mega Mart, Fazilka</p>
          <a
            href="https://www.google.com/maps/search/?api=1&query=Vishal+Mega+Mart+Fazilka"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-accent-600 hover:text-accent-700 mt-2 inline-block"
          >
            Get Directions
          </a>
        </div>
        {settings?.opening_hours && (
          <div className="card p-5">
            <Clock className="w-5 h-5 text-accent-500 mb-2" />
            <h3 className="font-semibold text-primary-900 text-sm mb-1">Opening Hours</h3>
            <p className="text-sm text-primary-600">{settings?.opening_hours}</p>
          </div>
        )}
        <div className="card p-5">
          <Phone className="w-5 h-5 text-accent-500 mb-2" />
          <h3 className="font-semibold text-primary-900 text-sm mb-1">Phone / WhatsApp</h3>
          <a
            href={`tel:${settings?.phone_number}`}
            className="text-sm text-primary-600 hover:text-primary-900 block"
          >
            9855882263
          </a>
        </div>
        <div className="card p-5">
          <Instagram className="w-5 h-5 text-accent-500 mb-2" />
          <h3 className="font-semibold text-primary-900 text-sm mb-1">Instagram</h3>
          <a
            href={settings?.social_links?.instagram || 'https://www.instagram.com/sahil_sachdeva190/'}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary-600 hover:text-primary-900"
          >
            @sahil_sachdeva190
          </a>
        </div>
      </div>
      <div className="card p-6 text-center">
        <MessageCircle className="w-10 h-10 text-[#25D366] mx-auto mb-3" />
        <h3 className="font-semibold text-primary-900 mb-2">Order on WhatsApp</h3>
        <p className="text-sm text-primary-600 mb-4">
          The easiest way to reach us. Send a message and we'll help you with products, sizes and availability.
        </p>
        <a
          href={getWhatsAppUrl(settings?.whatsapp_number || '', 'Hi Sachdeva Mens Wear, I would like to know more about your products.')}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-whatsapp"
        >
          <MessageCircle className="w-5 h-5" /> Chat on WhatsApp
        </a>
      </div>
    </div>
  );
}

export function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-display tracking-wide text-primary-900 mb-6">
        Terms &amp; Conditions
      </h1>
      <div className="space-y-4 text-sm text-primary-600 leading-relaxed">
        <p>
          By placing an order with Sachdeva Mens Wear, you agree to the following terms. Orders are
          placed through WhatsApp and confirmed by the store before processing.
        </p>
        <h2 className="text-lg font-semibold text-primary-900">Ordering</h2>
        <p>
          All orders are subject to product availability. We reserve the right to refuse or cancel
          any order. Prices are subject to change without notice.
        </p>
        <h2 className="text-lg font-semibold text-primary-900">Payment</h2>
        <p>
          Online payment is currently unavailable. Payment is accepted at store pickup or as agreed
          with the store. Please confirm payment details when your order is confirmed on WhatsApp.
        </p>
        <h2 className="text-lg font-semibold text-primary-900">Store Pickup</h2>
        <p>
          Orders can be picked up from our store at Ph 22, Fazilka, opposite Vishal Mega Mart.
        </p>
        <h2 className="text-lg font-semibold text-primary-900">Returns</h2>
        <p>
          Please contact us on WhatsApp if you have any issues with your purchase. Items should be
          in original condition.
        </p>
      </div>
    </div>
  );
}

export function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-display tracking-wide text-primary-900 mb-6">Privacy Policy</h1>
      <div className="space-y-4 text-sm text-primary-600 leading-relaxed">
        <p>
          We respect your privacy. When you place an order, we collect your name, phone number,
          and address solely to process your order.
        </p>
        <h2 className="text-lg font-semibold text-primary-900">Information We Collect</h2>
        <p>
          We collect the information you provide when placing an order: name, phone number,
          address, and order notes. We do not require you to create an account.
        </p>
        <h2 className="text-lg font-semibold text-primary-900">How We Use Your Information</h2>
        <p>
          Your information is used only to process your order and communicate with you about it.
          We do not sell or share your data with third parties.
        </p>
        <h2 className="text-lg font-semibold text-primary-900">Local Storage</h2>
        <p>
          We use your browser's local storage to remember your cart and wishlist. This data stays
          on your device and is not sent to any server.
        </p>
      </div>
    </div>
  );
}
