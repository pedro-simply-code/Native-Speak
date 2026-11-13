import type { MarketingContent } from "@/lib/i18n/marketing/build-en";
import { marketingImages } from "@/lib/marketing/images";

export const marketingEs = {
  siteNav: {
    phone: "855-997-4652",
    phoneHref: "tel:+18559974652",
    loginHref: "/login",
    trialHref: "/free-class",
    schoolsHref: "/schools",
  },
  primaryNav: [
    { label: "Nosotros", href: "/about" },
    { label: "Programas", href: "/programs" },
    { label: "Precios", href: "/pricing" },
    { label: "Cómo funciona", href: "/how-it-works" },
    { label: "Escuelas", href: "/schools" },
    { label: "Blog", href: "/blog" },
  ],
  programMenuLinks: [
    { label: "Todos los programas", href: "/programs" },
    { label: "Preescolar", href: "/programs/preschool" },
    { label: "Primaria", href: "/programs/elementary" },
    { label: "Secundaria", href: "/programs/middle-school" },
    { label: "Preparatoria", href: "/programs/high-school" },
    { label: "Adultos", href: "/programs/adults" },
    { label: "Escuelas", href: "/programs/schools" },
  ],
  heroStats: [
    { value: "1:1", label: "En vivo con un profesor" },
    { value: "25–50", label: "Minutos por sesión" },
    { value: "Nativo", label: "Profesores de español" },
  ],
  hero: {
    eyebrow: "Native Speak · Ahora recibiendo alumnos",
    title:
      "Español que realmente hablas — con un profesor en vivo, a tu horario",
    subtitle:
      "Somos una academia en línea nueva, centrada en la conversación, no en videos grabados. Empieza con una clase gratis; sin tarjeta.",
    highlights: [
      "Clases en vivo",
      "Profesores certificados",
      "Todas las edades",
      "Reservas flexibles",
    ] as const,
    ctaPrimary: "Clase gratis",
    schoolsNote: "¿Alianza escolar?",
    schoolsLink: "Habla con nosotros",
    imageCaptionTitle: "Tu primera sesión",
    imageCaptionBody:
      "Conoce a tu profesor, define metas y practica diálogo real — incluso desde cero.",
  },
  audienceStrip: {
    label: "Diseñado para",
    items: [
      "Familias homeschool",
      "Niños y adolescentes",
      "Adultos",
      "Grupos piloto escolares",
    ] as const,
  },
  howItWorksSection: {
    eyebrow: "Cómo funciona",
    title: "Del registro a tu primera conversación",
    subtitle:
      "Crea tu cuenta, agenda clases y conoce a tu profesor en vivo — mira el proceso completo en Cómo funciona.",
    steps: [
      {
        step: "01",
        title: "Crea tu cuenta",
        body: "Elige duración y cantidad de clases, luego crea tu cuenta antes del pago.",
      },
      {
        step: "02",
        title: "Agenda tus clases",
        body: "Inicia sesión, revisa disponibilidad y reserva según tu calendario.",
      },
      {
        step: "03",
        title: "Conecta con tu profesor",
        body: "Únete por Google Meet con tu profesor certificado y descarga materiales en PDF cuando quieras.",
      },
    ],
    image: marketingImages.conversation,
    imageAlt: marketingImages.conversationAlt,
  },
  programsSection: {
    title: "Programas por edad y meta",
    subtitle:
      "Elige la ruta que encaje hoy. Afinamos la colocación después de tu clase gratis.",
  },
  programLevels: [
    { id: "preschool", label: "Preescolar" },
    { id: "elementary", label: "Primaria" },
    { id: "middle", label: "Secundaria" },
    { id: "high", label: "Preparatoria" },
    { id: "adults", label: "Adultos" },
    { id: "schools", label: "Escuelas" },
  ],
  programs: {
    preschool: {
      title: "Preescolar",
      meta: "Sesiones · 25 min · Edades 5–6",
      body: "Introducción lúdica a sonidos, saludos, colores y frases simples — siempre con un profesor paciente en pantalla.",
    },
    elementary: {
      title: "Primaria",
      meta: "Sesiones · 25 min · Edades 6–10",
      body: "Confianza con conversaciones cortas, vocabulario adecuado y hábitos que encajan en homeschool o después de clases.",
    },
    middle: {
      title: "Secundaria",
      meta: "Sesiones · 50 min · Edades 10–13",
      body: "Práctica estructurada, gramática en contexto y retroalimentación que anima a arriesgarse en español.",
    },
    high: {
      title: "Preparatoria",
      meta: "Sesiones · 50 min · Edades 13–18",
      body: "Bloques de conversación rigurosos para fluidez, exámenes o metas de crédito — documentamos el progreso contigo.",
    },
    adults: {
      title: "Adultos",
      meta: "Sesiones · 50 min · Mayores de 18",
      body: "Viajes, trabajo, herencia o curiosidad: aprende a tu ritmo con un profesor que se adapta a tu vida.",
    },
    schools: {
      title: "Escuelas",
      body: "Piloto de español en vivo con cohortes, reportes claros para padres y un contacto dedicado — ideal mientras crecemos.",
    },
  },
  progressSection: {
    title: "En qué se basa cada clase",
    subtitle:
      "Somos nuevos, pero estos principios no cambian: español en vivo, expectativas claras y respeto por tu calendario.",
  },
  operatingHours: {
    title: "Horarios",
    timezone: "Horas en Centroamérica (GMT−6) · Más franjas al contratar",
    rows: [
      "Entre semana · Mañana a noche",
      "Sábado · Bloques en la mañana",
      "¿Necesitas un horario específico? Pregunta al reservar tu clase gratis",
    ],
  },
  youCanExpect: {
    title: "Qué incluye la experiencia",
    items: [
      "Clases en video en vivo",
      "Profesores nativos de español",
      "Colocación después del ensayo",
      "Notas tras sesiones (en expansión)",
      "Política flexible de reprogramación",
      "1:1 u opciones en pareja cuando hay cupo",
      "Precios transparentes",
      "Soporte en inglés cuando lo necesites",
    ],
  },
  footer: {
    brand: "Native Speak",
    tagline:
      "Academia de español conversacional en lanzamiento — clases personalizadas en vivo para familias y alumnos.",
    columns: [
      {
        title: "Programas",
        links: [
          { label: "Todos los programas", href: "/programs" },
          { label: "Preescolar", href: "/programs/preschool" },
          { label: "Preparatoria", href: "/programs/high-school" },
          { label: "Pilotos escolares", href: "/schools" },
        ],
      },
      {
        title: "Comenzar",
        links: [
          { label: "Precios", href: "/pricing" },
          { label: "Cómo funciona", href: "/how-it-works" },
          { label: "Reservar sesión", href: "/free-class" },
          { label: "Iniciar sesión", href: "/login" },
          { label: "Blog", href: "/blog" },
        ],
      },
    ],
  },
  about: {
    title: "Sobre Native Speak",
    intro:
      "Construimos una academia pequeña de español conversacional — profesores en vivo, colocación humana y expectativas honestas mientras incorporamos familias y escuelas piloto.",
    pillars: [
      {
        title: "En vivo, no grabado",
        body: "Practicar con un instructor real supera el video pasivo. Cada decisión del producto parte de esa idea.",
      },
      {
        title: "Alumnos, no logotipos",
        body: "Somos nuevos; no inventamos testimonios ni cifras infladas. Preferimos ganar confianza clase a clase.",
      },
      {
        title: "Calendarios reales",
        body: "Homeschool, padres ocupados y adolescentes: reservas flexibles y comunicación clara en inglés cuando haga falta.",
      },
    ],
    image: marketingImages.teacher,
    imageAlt: marketingImages.teacherAlt,
  },
  schools: {
    title: "Español para escuelas",
    intro:
      "Pilota español en vivo que complementa tu plan de estudios. Nos asociamos selectivamente con charters, híbridos y privados según cupo.",
    bullets: [
      "Cohortes con un solo contacto",
      "Reportes simples para administradores y padres",
      "Profesores nativos alineados a tu calendario",
      "Piloto de bajo riesgo antes de escalar",
    ],
    image: marketingImages.schoolHall,
    imageAlt: marketingImages.schoolHallAlt,
  },
  freeClass: {
    title: "Clase gratis",
    intro:
      "Sin tarjeta. Cuéntanos del alumno y te emparejamos con un profesor para una introducción en vivo de 25 minutos.",
    image: marketingImages.conversation,
    imageAlt: marketingImages.conversationAlt,
  },
  blogPosts: [],
  howItWorksPage: {
    title: "Cómo funciona",
    intro:
      "Crea tu cuenta, agenda clases en vivo y conoce a tu profesor certificado — con materiales en PDF cuando quieras.",
  },
  howItWorksOnboarding: [
    {
      title: "Crea tu cuenta",
      body: "Elige duración y cantidad, luego crea tu cuenta antes del pago.",
    },
    {
      title: "Agenda tus clases",
      body: "Inicia sesión, revisa disponibilidad y reserva según tu horario.",
    },
    {
      title: "Conecta con tu profesor certificado",
      body: "Conéctate por Google Meet. Descarga materiales de la clase gratis en PDF en cualquier momento.",
    },
  ],
  classIncludesSection: {
    title: "¿Qué incluye cada clase de español?",
    items: [
      {
        title: "Repaso de conceptos",
        body: "El profesor refuerza conceptos y palabras clave, tareas y áreas difíciles.",
      },
      {
        title: "Nuevas habilidades",
        body: "Lecciones multimedia: vocabulario, hablar, escuchar, gramática, lectura y escritura — a tu nivel.",
      },
      {
        title: "Aplica lo aprendido",
        body: "Practica en tiempo real, recibe retroalimentación directa y consolida antes de terminar.",
      },
    ],
  },
  proveProgressSection: {
    title: "Demuestra tu progreso",
    items: [
      {
        title: "Aprende con la tarea",
        body: "Descarga y envía tareas en línea. Se revisan y discuten en la siguiente clase.",
      },
      {
        title: "Exámenes y quizzes",
        body: "Realízalos en clase con tu instructor; suelen incluir lectura, escritura y oral.",
      },
      {
        title: "Boletas y avance",
        body: "Accede a tu boleta en cualquier momento.",
      },
    ],
  },
  teacherHiring: {
    title: "Cómo seleccionamos profesores",
    intro:
      "Buscamos calidad en cada contratación. Solo invitamos candidatos que cumplen nuestro estándar.",
    bullets: [
      "Experiencia y certificación para enseñar español como segunda lengua",
      "Inglés comprensible con los alumnos",
      "Entusiasmo por trabajar con quienes quieren aprender",
    ],
  },
  howItWorksFaq: [],
  pricingPage: {
    title: "Precios",
    intro: "Elige duración de sesión, tipo de clase y tamaño del paquete.",
    steps: [
      "Elige la duración",
      "Elige el tipo de clase",
      "Selecciona tu paquete",
    ],
  },
  ui: {
    call: "Llamar",
    login: "Iniciar sesión",
    logIn: "Iniciar sesión",
    tryFreeClass: "Clase gratis",
    mainNavAria: "Principal",
    copyright:
      "Academia en etapa inicial — sin reseñas inventadas. Fotos de Unsplash y Pixabay.",
    badgePopular: "Más popular",
    badgeValue: "Mejor valor",
    programsEyebrow: "Programas",
    programLevelsAria: "Niveles de programa",
    viewProgramLink: "Ver programa de {name} →",
    programImageAlt: "Programa de español — {name}",
    progressEyebrow: "Qué esperar",
    progressCtaBody:
      "Mira cómo una sesión en vivo encaja en tu horario. Elige un momento y conoce a un profesor certificado — sin pago adelantado.",
    progressCtaButton: "Agenda tu sesión",
    howItWorksReadMore:
      "Lee el proceso completo, estructura de clase y preguntas frecuentes →",
    language: "Idioma",
    chooseLanguage: "Elegir idioma",
    aboutEyebrow: "Nuestra historia",
    processEyebrow: "Proceso",
    pricingEyebrow: "Precios",
    stepLabel: "Paso {n}",
    buildQuote: "Arma tu cotización",
    pricingTotal: "Total",
    schoolsEyebrow: "Alianzas",
    schoolsCta: "Agenda una llamada",
    freeClassEyebrow: "Clase de prueba",
    freeClassSubmit: "Solicitar clase gratis",
    faqTitle: "Preguntas frecuentes",
    faqIntroBefore: "¿Paquetes o crédito? También revisa",
    faqIntroLink: "precios",
    faqIntroAfter: ".",
    howItWorksCtaTitle: "¿Qué estás esperando?",
    howItWorksCtaBody:
      "Empieza con una clase gratis o explora paquetes en la página de precios.",
    viewPricing: "Ver precios",
    faqLink: "Preguntas frecuentes",
  },
  auth: {
    loginEyebrow: "Portal de alumnos y equipo",
    loginTitle: "Iniciar sesión",
    loginDesc: "Accede a horarios, pagos, invitaciones y ajustes.",
    registerEyebrow: "Familias",
    registerTitle: "Crea tu cuenta",
    registerDesc:
      "Regístrate con Google o correo para reservar clases y gestionar estudiantes.",
  },
} as unknown as MarketingContent;
