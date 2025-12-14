// Configuración de la plantilla de tienda
// Este archivo contiene todos los datos personalizables para generar una web única

export const storeConfig = {
  // Información básica
  name: "NeumorShop",
  tagline: "Tu tienda online de confianza con los mejores productos",
  description: "Calidad y servicio excepcional desde 2020",

  // Contacto
  contact: {
    phone: "+34 912 345 678",
    phone_secondary: "+34 912 345 679",
    email: "info@neumorshop.com",
    email_pedidos: "pedidos@neumorshop.com",
    address: {
      street: "Calle Gran Vía, 123",
      city: "Madrid",
      postal: "28013",
      country: "España"
    }
  },

  // Horarios
  schedule: {
    weekdays: "Lunes - Viernes: 9:00 - 20:00",
    weekend: "Sábado - Domingo: 10:00 - 18:00"
  },

  // Redes sociales (opcional)
  social: {
    instagram: "",
    facebook: "",
    twitter: ""
  },

  // Características destacadas
  features: [
    {
      title: "Envío Gratuito",
      description: "En compras superiores a 50€",
      icon: "Truck"
    },
    {
      title: "Garantía de Calidad",
      description: "Productos verificados y de primera calidad",
      icon: "Award"
    },
    {
      title: "Atención 24/7",
      description: "Estamos disponibles para ayudarte",
      icon: "Clock"
    },
    {
      title: "Devolución Fácil",
      description: "30 días para devoluciones sin complicaciones",
      icon: "Package"
    }
  ],

  // Galería de imágenes del home
  homeGallery: [
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=80",
    "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=600&q=80",
    "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&q=80"
  ],

  // Galería completa
  gallery: [
    { url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80", title: "Tienda Moderna" },
    { url: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&q=80", title: "Productos de Calidad" },
    { url: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&q=80", title: "Variedad de Productos" },
    { url: "https://images.unsplash.com/photo-1556742044-3c52d6e88c62?w=800&q=80", title: "Diseño Exclusivo" },
    { url: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=80", title: "Atención al Cliente" },
    { url: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80", title: "Moda y Estilo" },
    { url: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80", title: "Colección Premium" },
    { url: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80", title: "Nuevas Tendencias" },
    { url: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80", title: "Experiencia Única" }
  ],

  // Catálogo (productos)
  productos: [
    {
      id: "1",
      nombre: "Camiseta Premium",
      descripcion: "Camiseta de algodón 100% orgánico con diseño exclusivo",
      precio: 29.99,
      categoria: "Ropa",
      imagen_url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80",
      stock: 50,
      sku: "CAM-001",
      disponible: true,
      destacado: true
    },
    {
      id: "2",
      nombre: "Zapatillas Deportivas",
      descripcion: "Zapatillas de running con tecnología de amortiguación avanzada",
      precio: 89.99,
      categoria: "Calzado",
      imagen_url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80",
      stock: 30,
      sku: "ZAP-001",
      disponible: true,
      destacado: true
    },
    {
      id: "3",
      nombre: "Mochila Urbana",
      descripcion: "Mochila resistente al agua con compartimento para laptop",
      precio: 49.99,
      categoria: "Accesorios",
      imagen_url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80",
      stock: 25,
      sku: "MOC-001",
      disponible: true,
      destacado: false
    },
    {
      id: "4",
      nombre: "Reloj Inteligente",
      descripcion: "Smartwatch con monitor de frecuencia cardíaca y GPS",
      precio: 199.99,
      categoria: "Tecnología",
      imagen_url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80",
      stock: 15,
      sku: "REL-001",
      disponible: true,
      destacado: true
    },
    {
      id: "5",
      nombre: "Gafas de Sol",
      descripcion: "Gafas polarizadas con protección UV400",
      precio: 39.99,
      categoria: "Accesorios",
      stock: 40,
      sku: "GAF-001",
      disponible: true,
      destacado: false
    },
    {
      id: "6",
      nombre: "Auriculares Bluetooth",
      descripcion: "Auriculares inalámbricos con cancelación de ruido",
      precio: 79.99,
      categoria: "Tecnología",
      imagen_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80",
      stock: 20,
      sku: "AUR-001",
      disponible: true,
      destacado: false
    }
  ],

  // Categorías de productos
  productCategories: ["Todos", "Ropa", "Calzado", "Accesorios", "Tecnología"],

  // Mapa (iframe de Google Maps)
  map: {
    embedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3037.4996642468643!2d-3.7077934!3d40.420146599999995!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd4228770f5f5555%3A0x4f4d4b8c0f4b4b4b!2sGran%20V%C3%ADa%2C%20Madrid!5e0!3m2!1ses!2ses!4v1234567890"
  },

  // Información adicional de contacto
  additionalInfo: {
    title: "Cómo Llegar",
    description: "Ubicados en pleno corazón de Madrid, cerca de las principales estaciones de metro: Gran Vía (Líneas 1 y 5) y Callao (Líneas 3 y 5). Disponemos de parking cercano y somos fácilmente accesibles en transporte público."
  },

  // Textos de las páginas
  pages: {
    inicio: {
      btnProductos: "Ver Catálogo",
      btnPedidos: "Hacer Pedido",
      featuresTitulo: "Por Qué Elegirnos",
      featuresSubtitulo: "Comprometidos con la excelencia en cada producto",
      galeriaTitulo: "Nuestra Tienda",
      galeriaSubtitulo: "Un espacio diseñado para una experiencia de compra única",
      galeriaBtn: "Ver Galería Completa"
    },
    productos: {
      title: "Nuestros Productos",
      subtitle: "Descubre nuestra selección de productos de alta calidad",
      filtroTodos: "Todos",
      sinItems: "No hay productos en esta categoría"
    },
    galeria: {
      title: "Galería",
      subtitle: "Descubre nuestros productos y tienda"
    },
    pedidos: {
      title: "Realizar Pedido",
      subtitle: "Completa tus datos para procesar tu compra",
      successMessage: "¡Pedido Confirmado!",
      successDescription: "Hemos recibido tu pedido. Te enviaremos un email de confirmación pronto.",
      btnConfirmar: "Confirmar Pedido",
      btnEnviando: "Procesando..."
    },
    contacto: {
      title: "Contacto",
      subtitle: "Estamos aquí para ayudarte con cualquier consulta",
      infoTitulo: "Cómo Llegar",
      infoDescripcion: "Ubicados en pleno corazón de Madrid, cerca de las principales estaciones de metro."
    }
  }
};

// Tipos TypeScript para el config
export type StoreConfig = typeof storeConfig;
export type Product = typeof storeConfig.productos[0];
export type GalleryItem = typeof storeConfig.gallery[0];
export type Feature = typeof storeConfig.features[0];
