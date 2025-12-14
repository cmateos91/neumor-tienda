import { useSitioData } from './useSitioData';

export function useSitioConfig() {
  const { sitio, sitioConfig, formTienda, setFormTienda, saveTienda, loading, error } = useSitioData();

  return {
    sitio,
    sitioConfig,
    formTienda,
    setFormTienda,
    saveTienda,
    loading,
    error
  };
}
