'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, UtensilsCrossed, Loader2 } from 'lucide-react';
import { RestaurantProvider, useRestaurant } from '@/lib/restaurant-context';
import { defaultTextosNav } from '@/lib/database.types';
import '@/app/_styles/neumorph-restaurant.css';

// Componente interno que usa el context
function RestaurantLayoutContent({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { config, loading, textos } = useRestaurant();

  // Escuchar navegacion desde el admin
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      if (event.data?.type === 'admin:navigate') {
        const targetPath = event.data.data?.path;
        if (targetPath && targetPath !== pathname) {
          router.push(targetPath);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [pathname, router]);

  // Notificar al admin cuando cambia la ruta
  useEffect(() => {
    if (window.parent !== window) {
      window.parent.postMessage(
        { type: 'iframe:navigate', data: { path: pathname } },
        window.location.origin
      );
    }
  }, [pathname]);

  // Actualizar titulo de la pagina dinamicamente
  const nombre = config?.nombre || 'Mi Restaurante';
  useEffect(() => {
    document.title = nombre;
  }, [nombre]);

  const nav = textos?.nav || defaultTextosNav;
  const navItems = [
    { name: nav.nav_inicio, path: '/' },
    { name: nav.nav_menu, path: '/menu' },
    { name: nav.nav_galeria, path: '/galeria' },
    { name: nav.nav_reservas, path: '/reservas' },
    { name: nav.nav_contacto, path: '/contacto' }
  ];

  const isActive = (path: string) => pathname === path;

  // Loader inicial mientras cargan todos los datos
  if (loading) {
    return (
      <div className="min-h-screen bg-[#e6e6e6] flex items-center justify-center">
        <div className="neuro-flat rounded-3xl p-12 flex flex-col items-center gap-6">
          <div className="neuro-pressed rounded-full p-6">
            <UtensilsCrossed className="w-12 h-12 text-[#d4af37]" />
          </div>
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-[#d4af37]" />
            <span className="text-[#666666] text-sm">Cargando...</span>
          </div>
        </div>
      </div>
    );
  }

  const descripcion = config?.descripcion || '';
  const horario_semana = config?.horario_semana || '';
  const horario_finde = config?.horario_finde || '';
  const telefono = config?.telefono || '';
  const email = config?.email || '';

  return (
    <>
      {/* DNS Prefetch para carga rapida de imagenes */}
      <link rel="dns-prefetch" href="https://saynqnmpxerpfgfdpsbx.supabase.co" />
      <link rel="preconnect" href="https://saynqnmpxerpfgfdpsbx.supabase.co" />

      <div className="min-h-screen bg-[#e6e6e6]">
        {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[#e6e6e6] px-4 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="neuro-flat rounded-3xl px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <Link href="/" prefetch={true} className="flex items-center gap-3 neuro-hover rounded-2xl px-4 py-2">
                <div className="neuro-pressed rounded-full p-3">
                  <UtensilsCrossed className="w-6 h-6 text-[#d4af37]" />
                </div>
                <span className="text-xl font-bold text-[#2c2c2c] hidden sm:block transition-all">
                  {nombre}
                </span>
              </Link>

              {/* Desktop Menu */}
              <div className="hidden md:flex items-center gap-2">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    prefetch={true}
                    className={`neuro-hover rounded-2xl px-6 py-3 text-sm font-medium transition-all ${
                      isActive(item.path)
                        ? 'neuro-pressed text-[#d4af37]'
                        : 'text-[#2c2c2c] hover:text-[#d4af37]'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden neuro-hover rounded-2xl p-3 cursor-pointer"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6 text-[#2c2c2c]" />
                ) : (
                  <Menu className="w-6 h-6 text-[#2c2c2c]" />
                )}
              </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
              <div className="md:hidden mt-4 pt-4 border-t border-[#d1d1d1] space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    prefetch={true}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block neuro-hover rounded-2xl px-6 py-3 text-sm font-medium transition-all ${
                      isActive(item.path)
                        ? 'neuro-pressed text-[#d4af37]'
                        : 'text-[#2c2c2c]'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <main>
        {children}
      </main>

      {/* Footer */}
      <footer className="mt-20 px-4 py-12 bg-[#e6e6e6]">
        <div className="max-w-7xl mx-auto">
          <div className="neuro-flat rounded-3xl px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
              <div>
                <h3 className="text-lg font-bold text-[#2c2c2c] mb-4">{nombre}</h3>
                <p className="text-[#666666] text-sm leading-relaxed">
                  {descripcion}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#2c2c2c] mb-4">Horarios</h3>
                <p className="text-[#666666] text-sm">{horario_semana}</p>
                <p className="text-[#666666] text-sm">{horario_finde}</p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#2c2c2c] mb-4">Contacto</h3>
                <p className="text-[#666666] text-sm">Tel: {telefono}</p>
                <p className="text-[#666666] text-sm">{email}</p>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-[#d1d1d1] text-center">
              <p className="text-[#666666] text-sm">© {new Date().getFullYear()} {nombre}. Todos los derechos reservados.</p>
            </div>
          </div>
        </div>
      </footer>
      </div>
    </>
  );
}

// Layout principal con Provider
export default function RestaurantLayout({ children }: { children: React.ReactNode }) {
  return (
    <RestaurantProvider>
      <RestaurantLayoutContent>{children}</RestaurantLayoutContent>
    </RestaurantProvider>
  );
}
