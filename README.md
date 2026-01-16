# 🚀 CV Profesional - Plataforma SaaS de Currículums Web Interactivos

<div align="center">

![React](https://img.shields.io/badge/React-18.x-61dafb?logo=react)
![Firebase](https://img.shields.io/badge/Firebase-10.x-FFCA28?logo=firebase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-38bdf8?logo=tailwindcss)
![Vite](https://img.shields.io/badge/Vite-5.x-646cff?logo=vite)

**Democratizando el acceso a portafolios web profesionales**

**Desarrollado por [Juan Diego Archila León](https://curriculum-cv-profesional.web.app/)**

[Demo en Vivo](https://curriculum-cv-profesional.web.app/) | [Reportar Bug](https://wa.me/573142749518)

</div>

---

## 📖 Tabla de Contenidos

- [¿Por qué existe este proyecto?](#-por-qué-existe-este-proyecto)
- [¿Qué hace esta plataforma?](#-qué-hace-esta-plataforma)
- [Problema que resuelve](#-problema-que-resuelve)
- [Características principales](#-características-principales)
- [Stack tecnológico](#-stack-tecnológico)
- [Arquitectura del sistema](#️-arquitectura-del-sistema)
- [Instalación y configuración](#-instalación-y-configuración)
- [Estructura del proyecto](#-estructura-del-proyecto)
- [Casos de uso](#-casos-de-uso)
- [Roadmap](#-roadmap)
- [Contribuciones](#-contribuciones)
- [Licencia](#-licencia)

---

## 💡 ¿Por qué existe este proyecto?

### El Problema Real

Durante mi búsqueda de empleo como **Desarrollador Junior**, identifiqué un problema crítico en el mercado laboral colombiano:

1. **Barrera de entrada tecnológica**: La mayoría de profesionales (especialmente no técnicos) no pueden crear un portafolio web porque:
   - No tienen conocimientos de programación
   - Contratar un desarrollador cuesta entre $500.000 - $2.000.000 COP
   - Plataformas internacionales (Wix, WordPress) requieren pago mensual ($10-30 USD)
   - Los constructores gratuitos limitan personalización y son genéricos

2. **CV en PDF obsoleto**: 
   - No se puede actualizar en tiempo real
   - No es interactivo ni permite demostrar habilidades digitales
   - Se pierde en cientos de aplicaciones iguales
   - No genera impacto visual profesional

3. **Brecha de oportunidades**: 
   - Los reclutadores valoran más a candidatos con presencia web profesional
   - Un enlace web es más compartible que un PDF en redes
   - Google indexa tu perfil (SEO natural)

### La Solución

**CV Profesional** es una plataforma SaaS que permite a **cualquier persona** crear su currículum web interactivo en **menos de 5 minutos**, sin escribir una sola línea de código.

**Impacto real**:
- ✅ Democratiza el acceso a portafolios web profesionales
- ✅ Elimina la barrera económica (100% gratuito)
- ✅ Reduce el tiempo de creación de 2 semanas a 5 minutos
- ✅ Aumenta las probabilidades de contratación con presencia digital profesional

---

## 🎯 ¿Qué hace esta plataforma?

### Para el Usuario Final

**CV Profesional** es un CMS (Content Management System) especializado que transforma tus datos en dos formatos profesionales:

1. **Currículum Web Interactivo** (URL única personalizada)
   - Diseño moderno y responsivo
   - Animaciones fluidas
   - SEO optimizado
   - Actualización en tiempo real

2. **PDF Profesional Descargable**
   - Diseño idéntico a la versión web
   - Optimizado para impresión
   - Incluye enlaces clicables
   - Perfecto para aplicaciones tradicionales

### Funcionalidades Clave

| Funcionalidad | Descripción |
|--------------|-------------|
| **Editor Visual** | Panel de administración intuitivo para editar todos los datos sin tocar código |
| **Autosave Inteligente** | Guarda cambios automáticamente cada 2 segundos (anti-pérdida de datos) |
| **Gestión de Fotos** | Carga, recorte y eliminación de foto de perfil con preview en tiempo real |
| **Plantillas Demo** | Inicia con datos de ejemplo y personalízalos a tu medida |
| **Multi-sección** | Experiencia, Proyectos, Habilidades, Educación, Contacto |
| **Exportación Dual** | Descarga PDF o comparte enlace web |
| **Temas Visuales** | Personaliza colores, fuentes y plantillas |
| **URLs Públicas** | `curriculum-cv-profesional.web.app/p/tu-nombre` |

---

## ⚡ Problema que resuelve

### Antes de CV Profesional

```
Usuario sin conocimientos técnicos → Contrata desarrollador ($1.5M COP) 
                                    → Espera 2 semanas
                                    → Recibe sitio estático
                                    → Paga hosting mensual ($30 USD)
                                    → No puede actualizar solo
                                    → Dependencia permanente
```

### Después de CV Profesional

```
Usuario sin conocimientos técnicos → Crea cuenta gratis
                                    → Completa formulario (5 min)
                                    → Publica instantáneamente
                                    → URL pública inmediata
                                    → Actualiza cuando quiera
                                    → Costo: $0 / Tiempo: 5 min
```

**ROI real para usuarios**: 
- Ahorro: **$1.500.000 COP** + **$360.000 COP/año** (hosting)
- Tiempo: **De 2 semanas a 5 minutos**
- Autonomía: **100% autogestión sin dependencias**

---

## ✨ Características principales

### 🔐 Autenticación y Seguridad
- Login con Google (Firebase Auth)
- Verificación de email obligatoria
- Protección de rutas privadas
- Data isolation por usuario (cada usuario solo ve/edita sus datos)

### 📝 Editor de Contenido
- **Panel Admin completo** con preview en tiempo real
- **Autosave automático** cada 2 segundos (previene pérdida de datos)
- **Validación de URLs** (normalización automática de enlaces sociales)
- **Gestión de imágenes**: Upload, crop, delete con confirmación
- **Drag and drop** para reordenar secciones
- **Rich text editor** para descripciones largas

### 🎨 Personalización Visual
- **Temas predefinidos**: New York, Modern, Classic
- **Paletas de colores**: 12+ opciones profesionales
- **Fuentes tipográficas**: 8+ familias optimizadas
- **Visibilidad de secciones**: Show/hide individual por sección
- **Responsive design**: Mobile-first con breakpoints optimizados

### 🌐 Generación Web
- **URLs amigables**: `/p/juan-diego-archila-leon`
- **Meta tags SEO**: Open Graph + Twitter Cards
- **Canonical URLs**: Evita contenido duplicado
- **Performance**: Lazy loading + code splitting
- **PWA Ready**: Installable en dispositivos

### 📄 Exportación PDF
- **Generación dinámica** desde HTML con html2pdf.js
- **Diseño idéntico** a versión web
- **Optimización de imágenes**: Base64 embebido
- **Enlaces clicables** en el PDF
- **Configuración de página**: A4, márgenes optimizados

### 🔄 Sincronización en Tiempo Real
- **Firestore Realtime**: Cambios instantáneos multi-dispositivo
- **State management**: Context API con onSnapshot
- **Optimistic UI**: Feedback inmediato al usuario
- **Conflict resolution**: Last write wins strategy

### 📊 Onboarding Inteligente
- **Detección de nuevo usuario**: Redirige automáticamente a onboarding
- **Opciones de inicio**:
  1. Subir PDF existente → Parser automático con IA
  2. Usar plantilla demo → Datos precargados editables
  3. Empezar desde cero → Formulario guiado paso a paso
- **Wizard progresivo**: 3 pasos con validación

### 🛡️ Gestión de Datos
- **Demo Mode Protection**: Evita sobrescritura de datos estáticos en `/demo`
- **Merge strategies**: Configurable (merge vs replace completo)
- **Data normalization**: Limpieza automática antes de guardar
- **Backup automático**: Cada cambio queda en historial Firebase

---

## 🛠️ Stack tecnológico

### Frontend
```javascript
{
  "framework": "React 18.x",
  "build": "Vite 5.x",
  "styling": "Tailwind CSS 3.x",
  "animations": "Framer Motion 11.x",
  "routing": "React Router DOM 6.x",
  "icons": "Lucide React 0.4x",
  "pdf": "html2pdf.js 0.10.x"
}
```

### Backend & Servicios
```javascript
{
  "auth": "Firebase Authentication",
  "database": "Cloud Firestore (NoSQL)",
  "storage": "Firebase Storage (fotos de perfil)",
  "hosting": "Firebase Hosting",
  "functions": "Cloud Functions (futuros features)",
  "analytics": "Firebase Analytics"
}
```

### Tooling & DevOps
```javascript
{
  "package_manager": "npm",
  "linting": "ESLint",
  "formatting": "Prettier (implícito)",
  "version_control": "Git",
  "deployment": "Firebase CLI",
  "ci_cd": "GitHub Actions (futuro)"
}
```

---

## 🏗️ Arquitectura del sistema

### Diagrama de Flujo

```
┌─────────────────────────────────────────────────────────────┐
│                      USUARIO PÚBLICO                         │
│                                                              │
│  [Demo] (/demo)        [Login] (/login)      [Registro]     │
└────────┬─────────────────────┬─────────────────────┬────────┘
         │                     │                     │
         ▼                     ▼                     ▼
┌────────────────┐   ┌──────────────────┐   ┌──────────────┐
│  Static Data   │   │ Firebase Auth    │   │ Verify Email │
│  (data.js)     │   │ (Google OAuth)   │   │  Required    │
└────────────────┘   └────────┬─────────┘   └──────┬───────┘
                              │                     │
                              └─────────┬───────────┘
                                        ▼
                              ┌──────────────────┐
                              │   ONBOARDING     │
                              │  /onboarding     │
                              └────────┬─────────┘
                                       │
                    ┌──────────────────┼──────────────────┐
                    ▼                  ▼                  ▼
           ┌────────────────┐ ┌──────────────┐ ┌─────────────┐
           │  Upload PDF    │ │  Use Template│ │Start Scratch│
           │  (CV Parser)   │ │  (Demo Data) │ │  (Empty)    │
           └────────┬───────┘ └──────┬───────┘ └──────┬──────┘
                    │                │                 │
                    └────────────────┼─────────────────┘
                                     ▼
                           ┌───────────────────┐
                           │   ADMIN PANEL     │
                           │    /admin         │
                           │                   │
                           │ ┌───────────────┐ │
                           │ │  Live Preview │ │
                           │ │  Autosave     │ │
                           │ │  Photo Editor │ │
                           │ │  Section CRUD │ │
                           │ └───────┬───────┘ │
                           └─────────┼─────────┘
                                     ▼
                        ┌─────────────────────────┐
                        │   CLOUD FIRESTORE       │
                        │  /users/{uid}/data/cv   │
                        └───────────┬─────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
         ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
         │ Public View  │  │  PDF Export  │  │Firebase      │
         │ /p/{user}    │  │  Download    │  │Storage       │
         │ (SEO Ready)  │  │              │  │(Profile Pic) │
         └──────────────┘  └──────────────┘  └──────────────┘
```

### Flujo de Datos (Data Flow)

```
[Admin Form] 
    ↓ onChange
[FormData State] 
    ↓ useEffect (debounce 2s)
[saveData()] 
    ↓ setDoc(merge: true/false)
[Cloud Firestore] 
    ↓ onSnapshot
[DataContext] 
    ↓ setState
[All Components Re-render]
    ↓
[User Sees Update]
```

### Seguridad (Security)

```
Firebase Rules:
- Authenticated users: READ/WRITE own data only
- Public: READ /users/{userId}/data/cv
- Storage: Authenticated WRITE, Public READ

Route Protection:
- /admin → RequireAuth + EmailVerified
- /onboarding → RequireAuth + EmailVerified
- /login → Redirect if authenticated
```

---

## 📦 Instalación y configuración

### Prerrequisitos

```bash
Node.js >= 18.x
npm >= 9.x
Git
Cuenta Firebase (Plan Spark - gratuito)
```

### 1. Clonar el repositorio

```bash
git clone https://github.com/tuusuario/cv-profesional.git
cd cv-profesional
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar Firebase

1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com/)
2. Habilita servicios:
   - **Authentication** (Google Provider)
   - **Cloud Firestore**
   - **Firebase Storage**
   - **Firebase Hosting**

3. Copia las credenciales del proyecto
4. Crea `src/firebaseConfig.js`:

```javascript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_AUTH_DOMAIN",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_STORAGE_BUCKET",
  messagingSenderId: "TU_MESSAGING_SENDER_ID",
  appId: "TU_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
```

### 4. Configurar Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/data/{document=**} {
      allow read: if true; // Público para CVs
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /feedback/{document=**} {
      allow read: if false;
      allow create: if true;
    }
  }
}
```

### 5. Ejecutar en desarrollo

```bash
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173)

### 6. Build para producción

```bash
npm run build
```

### 7. Deploy a Firebase

```bash
npm install -g firebase-tools
firebase login
firebase init
firebase deploy
```

---

## 📁 Estructura del proyecto

```
cv-profesional/
├── public/
│   └── cv-preview.png          # Imagen para meta tags
│
├── src/
│   ├── assets/                 # Recursos estáticos
│   │
│   ├── components/             # Componentes reutilizables
│   │   ├── Header.jsx          # Navegación principal
│   │   ├── Hero.jsx            # Sección hero con CTA
│   │   ├── Experience.jsx      # Timeline de experiencia
│   │   ├── Projects.jsx        # Grid de proyectos
│   │   ├── Skills.jsx          # Categorías de habilidades
│   │   ├── Education.jsx       # Formación académica
│   │   ├── Footer.jsx          # Contacto y atribución
│   │   ├── CVPreview.jsx       # Modal de preview PDF
│   │   ├── ImageCropper.jsx    # Editor de fotos
│   │   ├── FeedbackModal.jsx   # Sistema de reportes
│   │   ├── Loader.jsx          # Loading states
│   │   └── Modal.jsx           # Modal genérico
│   │
│   ├── context/                # Estado global
│   │   ├── AuthContext.jsx     # Autenticación y usuario
│   │   └── DataContext.jsx     # Datos del CV + sync Firebase
│   │
│   ├── pages/                  # Rutas principales
│   │   ├── LandingPage.jsx     # Página de inicio (marketing)
│   │   ├── Login.jsx           # Autenticación Google
│   │   ├── VerifyEmail.jsx     # Verificación pendiente
│   │   ├── Onboarding.jsx      # Wizard de inicio
│   │   ├── Admin.jsx           # Panel de edición
│   │   ├── Home.jsx            # CV público del usuario
│   │   └── Messages.jsx        # Feedback recibido
│   │
│   ├── utils/                  # Utilidades
│   │   ├── cvParser.js         # Parser PDF → JSON
│   │   └── urlHelpers.js       # Normalización de URLs
│   │
│   ├── App.jsx                 # Router y protección de rutas
│   ├── main.jsx                # Entry point
│   ├── index.css               # Estilos globales + Tailwind
│   ├── data.js                 # Data estática para demo
│   └── firebaseConfig.js       # Credenciales Firebase
│
├── .gitignore
├── firebase.json               # Configuración Firebase Hosting
├── firestore.rules             # Reglas de seguridad Firestore
├── package.json
├── postcss.config.js           # PostCSS + Tailwind
├── tailwind.config.js          # Configuración Tailwind
├── vite.config.js              # Configuración Vite
└── README.md
```

---

## 🎯 Casos de uso

### 1. Desarrollador Junior buscando empleo
**Problema**: No tiene portafolio web, solo CV en PDF  
**Solución**: Crea su CV web en 5 minutos, lo comparte en LinkedIn, genera 3x más interacciones

### 2. Profesional no técnico (Diseñador, Marketing)
**Problema**: Sabe diseño pero no código, no puede implementar su portafolio  
**Solución**: Usa la plataforma para tener presencia web sin contratar desarrollador

### 3. Freelancer con múltiples clientes
**Problema**: Necesita actualizar su portafolio constantemente con nuevos proyectos  
**Solución**: Accede a /admin, agrega proyecto en 2 minutos, cambios visibles instantáneamente

### 4. Estudiante universitario
**Problema**: Busca prácticas pero su CV se pierde entre cientos de PDFs  
**Solución**: Comparte URL de su CV web en emails, destaca visualmente

### 5. Empresa que necesita CVs estandarizados
**Problema**: Los empleados envían CVs en formatos inconsistentes  
**Solución**: Todos usan la misma plataforma, formato profesional uniforme

---

## 🗺️ Roadmap

### ✅ Fase 1: MVP (Completado)
- [x] Sistema de autenticación
- [x] Editor de CV completo
- [x] Exportación a PDF
- [x] URLs públicas
- [x] Responsive design
- [x] Autosave

### 🚧 Fase 2: Mejoras UX (En Progreso)
- [x] Parser de PDF mejorado
- [x] Feedback system
- [ ] Tutorial interactivo onboarding
- [ ] Preview en tiempo real mejorado
- [ ] Más plantillas de diseño

### 📅 Fase 3: Escalabilidad (Q1 2026)
- [ ] Plan Premium (temas exclusivos, dominio custom)
- [ ] Analytics de visitas al CV
- [ ] Compartir en redes sociales (Open Graph)
- [ ] Multi-idioma (ES/EN)
- [ ] Modo oscuro

### 🔮 Fase 4: IA & Automatización (Q2 2026)
- [ ] IA para mejorar descripciones (GPT-4)
- [ ] Sugerencias de optimización SEO
- [ ] Generación automática de cartas de presentación
- [ ] Recomendaciones de habilidades según industria

---

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas! Por favor:

1. Fork el proyecto
2. Crea una rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add: AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Guías de contribución
- Usa **commits semánticos** (feat, fix, docs, style, refactor)
- Documenta nuevas funcionalidades
- Mantén el código limpio y comentado
- Asegúrate que las pruebas pasen (cuando implementemos tests)

---

## 📄 Licencia

Este proyecto está bajo la licencia **MIT**. Ver archivo `LICENSE` para más detalles.

---

## 👨‍💻 Autor

**Juan Diego Archila León**  
Desarrollador Full Stack Junior

- 🌐 [Portafolio](https://curriculum-cv-profesional.web.app/)
- 💼 [LinkedIn](https://www.linkedin.com/in/juan-diego-archila-leon/)
- 📧 [Email](mailto:juandiegoarchilaleon@gmail.com)
- 📱 [WhatsApp](https://wa.me/573142749518)

---

## 🙏 Agradecimientos

- **React Team** por el mejor framework frontend
- **Firebase** por el backend serverless gratuito
- **Tailwind CSS** por el sistema de diseño más eficiente
- **Comunidad Open Source** por las bibliotecas increíbles
- **Mis usuarios beta** por el feedback invaluable

---

<div align="center">

**¿Te gusta el proyecto? Dale una ⭐ en GitHub**

Desarrollado con ❤️ en Bogotá, Colombia 🇨🇴

</div>
