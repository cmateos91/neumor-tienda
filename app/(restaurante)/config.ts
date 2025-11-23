// Configuración de la plantilla del restaurante
// Este archivo contiene todos los datos personalizables para generar una web única

export const restaurantConfig = {
  // Información básica
  name: "Le Gourmet",
  tagline: "Una experiencia gastronómica inolvidable donde cada plato cuenta una historia",
  description: "Experiencia culinaria única desde 1995",

  // Contacto
  contact: {
    phone: "+34 912 345 678",
    phone_secondary: "+34 912 345 679",
    email: "info@legourmet.com",
    email_reservas: "reservas@legourmet.com",
    address: {
      street: "Calle Gran Vía, 123",
      city: "Madrid",
      postal: "28013",
      country: "España"
    }
  },

  // Horarios
  schedule: {
    weekdays: "Lunes - Viernes: 12:00 - 23:00",
    weekend: "Sábado - Domingo: 11:00 - 00:00"
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
      title: "Chef Premiado",
      description: "Cocina de autor con ingredientes de temporada",
      icon: "ChefHat"
    },
    {
      title: "Estrella Michelin",
      description: "Reconocimiento a la excelencia culinaria",
      icon: "Award"
    },
    {
      title: "Servicio Impecable",
      description: "Atención personalizada para cada comensal",
      icon: "Clock"
    },
    {
      title: "Ubicación Privilegiada",
      description: "En el corazón de la ciudad",
      icon: "MapPin"
    }
  ],

  // Galería de imágenes del home
  homeGallery: [
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80",
    "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&q=80",
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80"
  ],

  // Galería completa
  gallery: [
    { url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80", title: "Ambiente Elegante" },
    { url: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80", title: "Platos de Autor" },
    { url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80", title: "Experiencia Única" },
    { url: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80", title: "Cocina Creativa" },
    { url: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800&q=80", title: "Delicias Gourmet" },
    { url: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&q=80", title: "Arte Culinario" },
    { url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80", title: "Ingredientes Premium" },
    { url: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80", title: "Presentación Exquisita" },
    { url: "https://images.unsplash.com/photo-1512132411229-c30711753930?w=800&q=80", title: "Espacio Acogedor" }
  ],

  // Menú (categorías y platos)
  menu: [
    {
      id: "1",
      nombre: "Carpaccio de Ternera",
      descripcion: "Finas láminas de ternera con rúcula, parmesano y aceite de trufa",
      precio: 18,
      categoria: "Entradas",
      imagen_url: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=80",
      disponible: true
    },
    {
      id: "2",
      nombre: "Lubina a la Sal",
      descripcion: "Lubina salvaje cocinada en costra de sal con guarnición de verduras",
      precio: 32,
      categoria: "Platos Principales",
      imagen_url: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&q=80",
      disponible: true
    },
    {
      id: "3",
      nombre: "Solomillo Wellington",
      descripcion: "Solomillo de ternera envuelto en hojaldre con foie y duxelle de champiñones",
      precio: 38,
      categoria: "Platos Principales",
      imagen_url: "https://images.unsplash.com/photo-1558030006-450675393462?w=600&q=80",
      disponible: true
    },
    {
      id: "4",
      nombre: "Tiramisú de la Casa",
      descripcion: "Clásico postre italiano con café espresso y mascarpone",
      precio: 8,
      categoria: "Postres",
      imagen_url: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&q=80",
      disponible: true
    },
    {
      id: "5",
      nombre: "Vino Tinto Reserva",
      descripcion: "Selección de vinos de la casa",
      precio: 25,
      categoria: "Bebidas",
      disponible: true
    },
    {
      id: "6",
      nombre: "Ensalada César",
      descripcion: "Lechuga romana, parmesano, crutones y nuestra salsa César especial",
      precio: 14,
      categoria: "Entradas",
      imagen_url: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=600&q=80",
      disponible: true
    }
  ],

  // Categorías del menú
  menuCategories: ["Todos", "Entradas", "Platos Principales", "Postres", "Bebidas"],

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
      btnMenu: "Ver Menu",
      btnReservas: "Reservar Mesa",
      featuresTitulo: "Por Que Elegirnos",
      featuresSubtitulo: "Comprometidos con la excelencia en cada detalle",
      galeriaTitulo: "Ambiente Unico",
      galeriaSubtitulo: "Un espacio disenado para crear momentos memorables",
      galeriaBtn: "Ver Galeria Completa"
    },
    menu: {
      title: "Nuestro Menú",
      subtitle: "Descubre una selección de platos elaborados con ingredientes frescos y de temporada",
      filtroTodos: "Todos",
      sinItems: "No hay items en esta categoria"
    },
    galeria: {
      title: "Galería",
      subtitle: "Déjate inspirar por nuestros platos y ambiente"
    },
    reservas: {
      title: "Reserva tu Mesa",
      subtitle: "Asegura tu lugar en una experiencia culinaria excepcional",
      successMessage: "¡Reserva Confirmada!",
      successDescription: "Hemos recibido tu reserva. Te enviaremos un email de confirmación pronto.",
      btnConfirmar: "Confirmar Reserva",
      btnEnviando: "Enviando..."
    },
    contacto: {
      title: "Contacto",
      subtitle: "Estamos aquí para atenderte y hacer de tu visita una experiencia memorable",
      infoTitulo: "Cómo Llegar",
      infoDescripcion: "Ubicados en pleno corazón de Madrid, cerca de las principales estaciones de metro."
    }
  }
};

// Tipos TypeScript para el config
export type RestaurantConfig = typeof restaurantConfig;
export type MenuItem = typeof restaurantConfig.menu[0];
export type GalleryItem = typeof restaurantConfig.gallery[0];
export type Feature = typeof restaurantConfig.features[0];
