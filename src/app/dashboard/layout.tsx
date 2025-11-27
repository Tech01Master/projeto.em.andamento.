'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, logout } from '@/lib/finmind-utils';
import { Button } from '@/components/ui/button';
import { Wallet, Home, CreditCard, Target, Sparkles, Brain, LogOut, Menu, X } from 'lucide-react';
import Link from 'next/link';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState(getCurrentUser());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/login');
    } else {
      setUser(currentUser);
    }
  }, [router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!user) return null;

  const menuItems = [
    { icon: Home, label: 'Início', href: '/dashboard' },
    { icon: CreditCard, label: 'Dívidas', href: '/dashboard/debts' },
    { icon: Target, label: 'Metas', href: '/dashboard/goals' },
  ];

  if (user.plan === 'inteligente' || user.plan === 'supremo') {
    menuItems.push({ icon: Sparkles, label: 'Compra Inteligente', href: '/dashboard/smart-purchase' });
  }

  if (user.plan === 'supremo') {
    menuItems.push({ icon: Brain, label: 'Análise Financeira', href: '/dashboard/analysis' });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  FinMind
                </h1>
                <p className="text-xs text-gray-500 capitalize">{user.plan}</p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <span className="text-sm text-gray-600">Olá, <span className="font-medium text-gray-900">{user.name}</span></span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-gray-600 hover:text-red-600"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>

            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 shadow-lg">
          <div className="px-4 py-4 space-y-2">
            <div className="pb-3 mb-3 border-b border-gray-200">
              <p className="text-sm text-gray-600">Olá, <span className="font-medium text-gray-900">{user.name}</span></p>
            </div>
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-emerald-50 transition-colors"
                >
                  <Icon className="w-5 h-5 text-emerald-600" />
                  <span className="text-gray-700">{item.label}</span>
                </Link>
              );
            })}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors w-full text-left text-red-600"
            >
              <LogOut className="w-5 h-5" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      )}

      <div className="flex max-w-7xl mx-auto">
        {/* Sidebar - Desktop */}
        <aside className="hidden md:block w-64 min-h-[calc(100vh-4rem)] bg-white border-r border-gray-200 p-6">
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-emerald-50 transition-all duration-200 group"
                >
                  <Icon className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform" />
                  <span className="text-gray-700 group-hover:text-emerald-700 font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
