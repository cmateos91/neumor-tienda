import { getRestaurantData } from '@/lib/restaurant-data';
import {
  defaultTextosInicio,
  TextosInicio,
  SitioConfig,
  SitioFeature,
  SitioGaleria
} from '@/lib/database.types';
import HomeClient from './_components/HomeClient';

export interface HomeInitialData {
  sitioId: string;
  config: {
    nombre: string;
    tagline: string;
  };
  textos: TextosInicio;
  features: Array<{
    id: string;
    titulo: string;
    descripcion: string;
    icono: string;
  }>;
  homeGallery: Array<{
    id: string;
    url: string;
    titulo: string | null;
  }>;
}

export default async function Home() {
  const data = await getRestaurantData();

  // Preparar datos iniciales con el nuevo schema
  const initialData: HomeInitialData = {
    sitioId: data?.sitio.id || '',
    config: {
      nombre: data?.config.nombre || 'Mi Restaurante',
      tagline: data?.config.tagline || 'Bienvenido a nuestra experiencia gastronómica'
    },
    textos: data?.textos.inicio || defaultTextosInicio,
    features: data?.features.map(f => ({
      id: f.id,
      titulo: f.titulo,
      descripcion: f.descripcion || '',
      icono: f.icono
    })) || [],
    homeGallery: data?.galeriaHome.map(g => ({
      id: g.id,
      url: g.url,
      titulo: g.titulo
    })) || []
  };

  return <HomeClient initialData={initialData} />;
}
