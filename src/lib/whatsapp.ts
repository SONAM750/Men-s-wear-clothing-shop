import type { CartItem, ShopSettings } from '@/types';
import { formatPrice } from './utils';

export function generateWhatsAppMessage(
  cartItems: CartItem[],
  settings: ShopSettings,
  customer: {
    name: string;
    phone: string;
    address: string;
    landmark: string;
    deliveryMethod: string;
    notes: string;
  },
): string {
  const lines: string[] = [];

  lines.push(`Hi ${settings.shop_name},`);
  lines.push('');
  lines.push('I would like to place an order.');
  lines.push('');
  lines.push('Order:');

  cartItems.forEach((item, idx) => {
    lines.push('');
    lines.push(`${idx + 1}. ${item.product_name}`);
    lines.push(`   Size: ${item.size}`);
    if (item.color) lines.push(`   Color: ${item.color}`);
    lines.push(`   Quantity: ${item.quantity}`);
    lines.push(`   Price: ${formatPrice(item.price)} each`);
  });

  const total = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const totalQty = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  lines.push('');
  lines.push(`Total: ${formatPrice(total)} (${totalQty} items)`);
  lines.push('');
  lines.push('Customer Details:');
  lines.push(`Name: ${customer.name}`);
  lines.push(`Phone: ${customer.phone}`);
  if (customer.address) lines.push(`Address: ${customer.address}`);
  if (customer.landmark) lines.push(`Landmark: ${customer.landmark}`);
  lines.push(`Delivery/Pickup: ${customer.deliveryMethod}`);
  if (customer.notes) lines.push(`Notes: ${customer.notes}`);
  lines.push('');
  lines.push('Please confirm my order.');
  lines.push('');
  lines.push('Thank you.');

  return lines.join('\n');
}

export function getWhatsAppUrl(phoneNumber: string, message: string): string {
  const cleaned = phoneNumber.replace(/[^0-9]/g, '');
  return `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`;
}
