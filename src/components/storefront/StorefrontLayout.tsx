import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { CartDrawer, FloatingCartButton } from './CartDrawer';
import { MobileStickyBar } from './MobileStickyBar';

export function StorefrontLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 pb-14 lg:pb-0">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      <FloatingCartButton />
      <MobileStickyBar />
    </div>
  );
}
