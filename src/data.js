// Data por defecto: Juan Diego Archila León

export const profile = {
  name: "Juan Diego Archila León",
  role: "Programador Junior / Desarrollador Web",
  headline: "Programador Junior Full Stack",
  photoURL: "https://firebasestorage.googleapis.com/v0/b/cv-juandiegoarchilaleon.firebasestorage.app/o/profile_images%2F1768314636000_cropped.jpg?alt=media&token=b1f1a14a-3b54-4bb0-8030-46dd0d4d317a",
  location: "Bogotá, D.C., Colombia",
  email: "juandiegoarchilaleon@gmail.com",
  phone: "+57 314 274 9518",
  linkedin: "https://www.linkedin.com/in/juan-diego-archila-leon/",
  whatsapp: "https://wa.me/573142749518",
  website: "", 
  summary: "Programador Junior con 2 años de experiencia en desarrollo web y aplicaciones móviles (React, Node.js, Firebase, NestJS). He desarrollado sistemas ERP, dashboards y apps móviles orientados a resultados. Complemento mi perfil técnico con más de 7 años de experiencia administrativa en gestión operativa, atención al cliente, coordinación de equipos y marketing, lo que me permite entender el negocio, analizar requerimientos y convertir problemas reales en soluciones tecnológicas funcionales.",
  about: ""
};

export const skills = {
  main: [
    { name: "JavaScript", icon: "Code2" },
    { name: "React", icon: "LayoutTemplate" },
    { name: "Node.js", icon: "Server" },
    { name: "Firebase", icon: "Database" },
    { name: "API REST", icon: "Globe" },
    { name: "Git", icon: "GitBranch" }
  ],
  categories: {
    frontend: ["HTML5", "CSS3", "Tailwind CSS", "Responsive Design"],
    backend: ["Express.js", "Fastify", "NestJS", "SQL"],
    database: ["MySQL", "PostgreSQL", "Firestore"],
    tools: ["VS Code", "Postman", "Google Cloud Vision AI", "Android APK"]
  }
};

export const experience = [
  {
    role: "Desarrollador de Software Independiente",
    company: "ALTENOT Tech Lab",
    period: "Febrero 2024 - Actualidad",
    location: "Bogotá, Colombia",
    description: "Desarrollo de soluciones de software a medida para control operativo de PYMES.",
    link: "https://altenot.com",
    linkLabel: "Visitar sitio web",
    summary: [
      "Diseño y desarrollo de ecosistemas digitales (ERP/POS) para control unificado de caja, inventario y personal.",
      "Implementación de sistemas de 'Verdad Única' para eliminar fugas de dinero y errores operativos en tiempo real.",
      "Gestión integral del ciclo de vida del software: análisis de negocio, arquitectura, desarrollo y despliegue."
    ],
    details: [
      "Desarrollo de soluciones verticales especializadas para Supermercados, Restaurantes y Hotelería.",
      "Consultoría en transformación digital: migración de procesos manuales/Excel a aplicaciones web centralizadas."
    ]
  },
  {
    role: "Desarrollador Full Stack Junior",
    company: "Cocina Casera",
    period: "Enero 2017 - Actualidad",
    location: "Bogotá, Colombia",
    description: "Reduje tiempos operativos hasta en un 90% en un sistema que procesa 50+ pedidos diarios.",
    link: "",
    linkLabel: "",
    summary: [
      "Integré WhatsApp Cloud API y validación de pagos con OCR (Google Vision AI).",
      "Migré procesos manuales a un sistema digital centralizado y escalable."
    ],
    details: [
      "Diseñé Dashboard administrativo en tiempo real para control de inventarios.",
      "Implementé sistema de seguridad con tokens de tiempo y enlaces seguros."
    ]
  },
  {
    role: "Desarrollador Web Junior",
    company: "Colegio Americano de Bogotá",
    period: "Julio 2023 - Enero 2024",
    location: "Bogotá, Colombia",
    description: "Desarrollo y mantenimiento de aplicaciones académicas.",
    link: "",
    linkLabel: "",
    summary: [
      "Implementé funcionalidades web con JavaScript, HTML y CSS.",
      "Corregí bugs críticos y optimicé procesos administrativos.",
      "Automaticé tareas repetitivas reduciendo carga operativa."
    ],
    details: [
      "Colaboré en la integración de servicios backend con Node.js.",
      "Analicé requerimientos técnicos junto al equipo administrativo."
    ]
  }
];

export const projects = [
  {
    title: "Cocina Casera",
    tech: ["React", "Node.js", "Firebase", "WhatsApp API"],
    link: "#",
    linkLabel: "Ver Proyecto",
    role: "Full Stack Developer",
    featured: true,
    stats: { value: "50+", label: "Pedidos Diarios" },
    description: "Proyecto en producción que automatiza pedidos y gestión operativa mediante una plataforma web y backend propio.",
    features: [
      "Gestión de pedidos en tiempo real",
      "Validación automática de pagos con OCR",
      "Dashboard de ventas e inventario"
    ]
  },
  {
    title: "ALTENOT Tech Lab",
    tech: ["React", "Node.js", "Firebase", "Tailwind CSS"],
    link: "https://altenot.com",
    linkLabel: "Ver Proyecto",
    role: "Lead Developer",
    featured: true,
    stats: { value: "ERP", label: "SaaS" },
    description: "Desarrollo de sistema web tipo ERP para gestión de órdenes de servicio, inventario y ventas.",
    features: [
      "Implementación de POS e inventario híbrido (stock y bajo pedido)",
      "Automatización de flujos operativos con React y backend en Node.js"
    ]
  },
  {
    title: "Plataforma SaaS CV Generator",
    tech: ["React", "Node.js", "Firebase", "Tailwind CSS"],
    link: "#",
    linkLabel: "Ver Proyecto",
    role: "Creator & Lead Dev",
    featured: true,
    stats: { value: "SaaS", label: "Web + PDF" },
    description: "Plataforma integral que revolucionó la forma de presentar perfiles profesionales. Permite a usuarios tener Web + PDF, plantillas y edición total.",
    features: [
      "Generación dual (Web Interactiva + PDF optimizado)",
      "CMS completo para administración de contenido",
      "Arquitectura Multi-usuario escalable"
    ]
  }
];

export const education = [
  {
    degree: "Técnico en Programación de Software",
    institution: "SENA",
    period: "2022 - 2024",
    location: "Bogotá",
    details: "Enfoque en desarrollo web, lógica de programación y bases de datos."
  }
];

export const continuousEducation = [
  {
    title: "Aprendizaje Constante",
    description: "Actualmente profundizando en TypeScript y testing (Jest, Cypress) mediante proyectos prácticos y documentación oficial."
  }
];

export const header = {
    title: "JD.Archila"
};

export const footer = {
    availabilityTitle: "Disponible para oportunidades como",
    availabilityDescription: "Estoy disponible para asumir nuevos retos profesionales. Busco oportunidades donde pueda aportar valor inmediato y continuar creciendo.",
    buttonEmail: "Enviar Correo",
    buttonWhatsapp: "WhatsApp",
    copyrightText: "© 2026 Juan Diego Archila León. Todos los derechos reservados."
};


export const theme = { 
    template: 'new-york', 
    font: 'Arimo', 
    color: '#0f172a' 
};

export const roadmap = [];

// Etiquetas (nombres) por defecto para menú y títulos de secciones
export const labels = {
  nav: {
    home: 'Inicio',
    experience: 'Experiencia',
    projects: 'Proyectos',
    skills: 'Habilidades',
    contact: 'Contacto'
  },
  sections: {
    profile: 'Perfil Personal',
    experience: 'Experiencia Profesional',
    projects: 'Proyectos Reales',
    skills: 'Stack Técnico',
    education: 'Formación Académica',
    continuous: 'Formación Continua',
    contact: 'Contacto'
  }
};
