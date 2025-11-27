'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, UtensilsCrossed } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import '@/app/_styles/neumorph-restaurant.css';

interface LayoutData {
  sitioId: string;
  nombre: string;
  descripcion: string;
  horario_semana: string;
  horario_finde: string;
  telefono: string;
  email: string;
}

const defaultData: LayoutData = {
  sitioId: '',
  nombre: 'Mi Restaurante',
  descripcion: 'Descripción del restaurante',
  horario_semana: 'Lunes - Viernes: 12:00 - 23:00',
  horario_finde: 'Sábado - Domingo: 11:00 - 00:00',
  telefono: '',
  email: ''
};

export default function RestaurantLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [data, setData] = useState<LayoutData>(defaultData);

  // Cargar datos iniciales de Supabase (nuevo schema)
  useEffect(() => {
    async function loadSitioData() {
      // Primero obtener el sitio activo
      const { data: sitio } = await supabase
        .from('sitios')
        .select('id')
        .eq('activo', true)
        .limit(1)
        .single();

      if (!sitio) return;

      // Luego obtener la configuración
      const { data: config } = await supabase
        .from('sitio_config')
        .select('nombre, descripcion, horario_semana, horario_finde, telefono, email')
        .eq('sitio_id', sitio.id)
        .single();

      if (config) {
        setData({
          sitioId: sitio.id,
          nombre: config.nombre || defaultData.nombre,
          descripcion: config.descripcion || defaultData.descripcion,
          horario_semana: config.horario_semana || defaultData.horario_semana,
          horario_finde: config.horario_finde || defaultData.horario_finde,
          telefono: config.telefono || defaultData.telefono,
          email: config.email || defaultData.email
        });
      }
    }
    loadSitioData();
  }, []);

  // Escuchar mensajes del admin para preview en tiempo real
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      // Navegación SPA desde el admin
      if (event.data?.type === 'admin:navigate') {
        const targetPath = event.data.data?.path;
        if (targetPath && targetPath !== pathname) {
          router.push(targetPath);
        }
        return;
      }

      if (event.data?.type === 'admin:config') {
        const msg = event.data.data;
        setData(prev => ({
          ...prev,
          nombre: msg.nombre !== undefined ? msg.nombre : prev.nombre,
          descripcion: msg.descripcion !== undefined ? msg.descripcion : prev.descripcion,
          horario_semana: msg.horario_semana !== undefined ? msg.horario_semana : prev.horario_semana,
          horario_finde: msg.horario_finde !== undefined ? msg.horario_finde : prev.horario_finde,
          telefono: msg.telefono !== undefined ? msg.telefono : prev.telefono,
          email: msg.email !== undefined ? msg.email : prev.email
        }));
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [pathname, router]);

  // Notificar al admin cuando cambia la ruta (para sincronizar tabs)
  useEffect(() => {
    // Solo enviar si estamos en un iframe
    if (window.parent !== window) {
      window.parent.postMessage(
        { type: 'iframe:navigate', data: { path: pathname } },
        window.location.origin
      );
    }
  }, [pathname]);

  const navItems = [
    { name: 'Inicio', path: '/' },
    { name: 'Menu', path: '/menu' },
    { name: 'Galeria', path: '/galeria' },
    { name: 'Reservar', path: '/reservas' },
    { name: 'Contacto', path: '/contacto' }
  ];

  const isActive = (path: string) => pathname === path;

  return (
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
                  {data.nombre}
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
                <h3 className="text-lg font-bold text-[#2c2c2c] mb-4 transition-all">{data.nombre}</h3>
                <p className="text-[#666666] text-sm leading-relaxed transition-all">
                  {data.descripcion}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#2c2c2c] mb-4">Horarios</h3>
                <p className="text-[#666666] text-sm transition-all">{data.horario_semana}</p>
                <p className="text-[#666666] text-sm transition-all">{data.horario_finde}</p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#2c2c2c] mb-4">Contacto</h3>
                <p className="text-[#666666] text-sm transition-all">Tel: {data.telefono}</p>
                <p className="text-[#666666] text-sm transition-all">{data.email}</p>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-[#d1d1d1] text-center">
              <p className="text-[#666666] text-sm">© {new Date().getFullYear()} {data.nombre}. Todos los derechos reservados.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
