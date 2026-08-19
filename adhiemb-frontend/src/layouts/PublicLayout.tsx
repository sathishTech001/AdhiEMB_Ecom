import { Outlet } from 'react-router-dom';
import { Navbar } from '@/features/marketplace/components/Navbar';
import { Footer } from '@/features/marketplace/components/Footer';

export function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-dark-bg font-sans">
      <Navbar />
      <main className="flex-grow pt-16">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
