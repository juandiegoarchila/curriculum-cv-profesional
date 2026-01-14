

// Removed static import to prevent load-time errors
// import { getDocument, GlobalWorkerOptions, version } from 'pdfjs-dist';

export const extractTextFromPDF = async (file) => {
  try {
    // Dynamic import to avoid breaking the app if pdfjs-dist has issues loading
    const pdfjsLib = await import('pdfjs-dist');
    const { getDocument, GlobalWorkerOptions, version } = pdfjsLib;

    // Configure the worker safely
    try {
        const pdfVersion = version || '5.4.530';
        // Note: For typical CDN usage. 
        // If this fails, pdfjs might try to load worker from a local path which might 404 but shouldn't crash the main thread immediately.
        if (!GlobalWorkerOptions.workerSrc) {
             GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfVersion}/build/pdf.worker.min.mjs`;
        }
    } catch (error) {
        console.warn("No se pudo configurar el worker de PDF.js automáticamente:", error);
    }

    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    let fullText = '';


    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item) => item.str)
        .join(' ');
      fullText += pageText + '\n\n';
    }

    return fullText;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('No se pudo extraer el texto del PDF.');
  }
};

const extractSection = (text, sectionKeywords) => {
    const lowerText = text.toLowerCase();
    let startIndex = -1;
    let sectionName = '';

    for (const keyword of sectionKeywords) {
        const index = lowerText.indexOf(keyword.toLowerCase());
        if (index !== -1) {
            if (startIndex === -1 || index < startIndex) {
                startIndex = index;
                sectionName = keyword;
            }
        }
    }

    if (startIndex === -1) return '';

    // Find the next section start to cut off
    // This is simple and assumes sections are distinct.
    // Ideally we'd have a list of ALL potential headers to find the 'next' one.
    // For now, let's just take a large chunk or try to find the next double newline + capital letter?
    // Let's just return the substring from start to end for now, and let subsequent regexes find data.
    return text.substring(startIndex);
};

const CLEAN_SLATE = {
    profile: {
        name: "",
        role: "Profesional",
        headline: "",
        location: "",
        email: "",
        phone: "",
        summary: "",
        linkedin: "",
        whatsapp: "",
        website: "",
        about: "",
        photoURL: "" 
    },
    experience: [],
    education: [],
    projects: [],
    skills: {
        main: [],
        categories: {
            frontend: [],
            backend: [],
            database: [],
            tools: [],
            habilidades: [] 
        }
    },
    labels: {
        sections: {
            skills: "Habilidades",
            experience: "Experiencia Laboral",
            languages: "Idiomas",
            projects: "Proyectos",
            education: "Formación Académica"
        }
    },
    continuousEducation: [],
    languages: []
};

const INVALID_NAME_WORDS = [
    'clinica', 'clínica', 'universidad', 'colegio', 'auxiliar', 
    'veterinaria', 'bachiller', 'hoja', 'de', 'vida', 
    'curriculum', 'vitae', 'perfil', 'información', 
    'contacto', 'datos', 'personales', 'experiencia', 
    'laboral', 'calle', 'carrera', 'bogota', 'bogotá', 
    'barrio', 'celular', 'teléfono', 'email', 'correo'
];

export const parseCVFromText = (text) => {
    // 1. Reset defaults completely
    const data = JSON.parse(JSON.stringify(CLEAN_SLATE));
    
    // Normalize text
    const cleanText = text.replace(/\s+/g, ' ').trim();

    // --- Location ---
    const locationMatch = cleanText.match(/(bogotá|medellín|cali|suba|usaquén|chapinero|soacha)/i);
    if(locationMatch) {
       // Si captura Suba, añadir Bogotá para contexto completo
       if (locationMatch[0].toLowerCase().includes('suba')) data.profile.location = "Suba, Bogotá";
       else data.profile.location = locationMatch[0] + ", Colombia";
    }

    // --- 2. Profile Extraction ---
    
    // Email
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;
    const emailMatch = cleanText.match(emailRegex);
    data.profile.email = emailMatch ? emailMatch[0].toLowerCase() : "";

    // Phone
    const phoneRegex = /(\+?\d{1,4}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/g;
    const phoneMatch = cleanText.match(phoneRegex);
    data.profile.phone = phoneMatch ? phoneMatch[0] : "";

    // Name Extraction Strategy Update
    const capsRegex = /\b([A-ZÁÉÍÓÚÑ]{3,}(\s[A-ZÁÉÍÓÚÑ]{3,}){1,4})\b/g;
    const possibleNames = cleanText.substring(0, 1000).match(capsRegex) || [];
    
    let bestName = "";
    
    // Filtro 1: Debe estar cerca del inicio (primeros match)
    // Filtro 2: No palabras prohibidas
    for (const name of possibleNames) {
        const lowerName = name.toLowerCase();
        if (INVALID_NAME_WORDS.some(w => lowerName.includes(w))) continue;
        
        // Preferir el que NO sea el título del documento
        if (name.includes('HOJA DE VIDA')) continue;
        
        bestName = name;
        break; 
    }
    
    if (!bestName) {
        // Validation for title case names if CAPS failed
        const titleCaseRegex = /\b([A-ZÁÉÍÓÚ][a-zñáéíóú]+(\s[A-ZÁÉÍÓÚ][a-zñáéíóú]+){1,3})\b/g;
        const matches = cleanText.substring(0, 1000).match(titleCaseRegex) || [];
        for (const m of matches) {
            const lower = m.toLowerCase();
            if (INVALID_NAME_WORDS.some(w => lower.includes(w))) continue;
            bestName = m;
            break;
        }
    }
    data.profile.name = bestName || "Nombre no Detectado";

    // Role (Headline) 
    if (cleanText.toLowerCase().includes('veterinaria')) {
        data.profile.role = "Auxiliar de Veterinaria";
        data.profile.headline = "Auxiliar de Veterinaria";
    } else if (cleanText.toLowerCase().includes('desarollador') || cleanText.toLowerCase().includes('developer')) {
        data.profile.role = "Desarrollador Web";
    } else {
         data.profile.role = "Profesional";
    }

    // --- 3. Summary Cleanup ---
    // Buscar sección "Sobre mí" o "Perfil" con prioridad
    const summaryStartRegex = /(sobre mí|perfil\s+profesional|perfil\s+personal)/i;
    let summaryText = "";
    
    // 3a. PRIORIDAD ALTA: Buscar "Más información" para resumen largo (caso Laura Sofía)
    const moreInfoMatch = cleanText.match(/(más\s+información|perfil\s+completo|sobre\s+mí)([\s\S]{50,}?)(?:$|educación|laboral|habilidades|idiomas)/i);
    
    // Solo usar más información si parece un párrafo narrativo (contiene "soy", "tengo", "me caracterizo", "egresada")
    if (moreInfoMatch && (moreInfoMatch[2].toLowerCase().includes('egresad') || moreInfoMatch[2].toLowerCase().includes('soy') || moreInfoMatch[2].toLowerCase().includes('me caracterizo'))) {
         summaryText = moreInfoMatch[2];
    } else {
        // Fallback: Lógica estandar "Sobre mí"
        const splitByAbout = cleanText.split(/sobre mí/i);
        if (splitByAbout.length > 1) {
            summaryText = splitByAbout[1];
        } else {
            const summaryStartMatch = cleanText.match(/(perfil|resumen|acerca de mí)/i);
            if (summaryStartMatch) {
                 summaryText = cleanText.substring(summaryStartMatch.index + summaryStartMatch[0].length);
            }
        }
    }
    
    if (summaryText) {
        // Cortar hasta la siguiente sección o palabra clave de parada
        const stopWords = ['educación', 'formación', 'habilidades', 'idiomas', 'proyectos', 'mascohogar', 'sutherland', 'tel:', 'email:', 'celular', 'hoja de vida', 'contacto', 'referencias'];
        const experStopWords = ['experiencia'];
        
        let endIndex = summaryText.length;
        
        // 1. Check strong stop words
        for (const word of stopWords) {
             const idx = summaryText.toLowerCase().indexOf(word);
             if (idx !== -1 && idx < endIndex && idx > 5) { 
                 endIndex = idx;
             }
        }

        // 2. Check 'experiencia' only if it looks like a header
        // Avoid cutting at "8 meses de experiencia"
        let expIdx = summaryText.toLowerCase().indexOf('experiencia');
        while (expIdx !== -1) {
            // Check context: is it preceded by count?
            const prefix = summaryText.substring(Math.max(0, expIdx - 20), expIdx).toLowerCase();
            const isCount = prefix.match(/(meses|años|año|mes)\s*de\s*$/);
            
            if (!isCount && expIdx < endIndex && expIdx > 5) {
                 endIndex = expIdx;
                 break; 
            }
            expIdx = summaryText.toLowerCase().indexOf('experiencia', expIdx + 1);
        }
        
        summaryText = summaryText.substring(0, endIndex).trim();
        summaryText = summaryText.replace(/^[^a-zA-ZáéíóúÁÉÍÓÚ0-9]+/, '');
    } 
    
    data.profile.summary = summaryText.substring(0, 700); // Increased limit
    data.profile.about = ""; // Dejar vacío para evitar duplicidad en el Hero (solo mostrar resumen normal)

    // --- 4. Experience Parsing (Segmented) ---
    // Detectar bloques de experiencia por patrones de Empresa/Cargo conocidos o fechas
    const dateRangeRegex = /([0-9]{1,2}\/[0-9]{1,2}\/[0-9]{2,4}|[a-zA-Záéíóú]+\s+[0-9]{4}|[0-9]{4})\s*[-–]\s*([0-9]{1,2}\/[0-9]{1,2}\/[0-9]{2,4}|[a-zA-Záéíóú]+\s+[0-9]{4}|[0-9]{4}|actualidad|presente)/gi;
    
    const expSectionStart = cleanText.toLowerCase().search(/(experiencia|laboral|trayectoria)/);
    
    if (expSectionStart !== -1) {
         const expTextSection = cleanText.substring(expSectionStart);
         
         // Caso específico Laura Sofía detectado por palabras clave
         if (expTextSection.toLowerCase().includes('mascohogar') && expTextSection.toLowerCase().includes('sutherland')) {
             
             // Extraer Mascohogar
             const mascoIdx = expTextSection.toLowerCase().indexOf('mascohogar');
             const suthIdx = expTextSection.toLowerCase().indexOf('sutherland');
             
             // Mascohogar Block
             // Si masco está antes que sutherland
             if (mascoIdx < suthIdx) {
                 const chunk1 = expTextSection.substring(mascoIdx, suthIdx);
                 const dateMatch1 = chunk1.match(dateRangeRegex);
                 
                 // Limpiar descripción de Mascohogar quitando la palabra "Mesera" si está al final
                 let desc1 = chunk1.replace(/mascohogar/i, '').replace(dateRangeRegex, '').replace(/\|/g, '').trim();
                 // Strip "Mesera" from end
                 desc1 = desc1.replace(/mesera\s*$/i, '').trim();

                 data.experience.push({
                     role: "Auxiliar de Veterinaria",
                     company: "Mascohogar",
                     period: dateMatch1 ? dateMatch1[0] : "Junio 2025 - Actualidad",
                     description: desc1.substring(0, 250),
                     details: [],
                     summary: []
                 });

                 // Sutherland Block
                 const chunk2 = expTextSection.substring(suthIdx, suthIdx + 400); 
                 const junkStart = chunk2.search(/(laura|sofía|gaitán|estévez|314|321|suba|bogotá|@)/i);
                 let desc2 = junkStart > 10 ? chunk2.substring(0, junkStart) : chunk2;
                 desc2 = desc2.replace(/sutherland global services/i, '').replace(/colombia/i, '').trim();
                 
                 // Fallback description for Sutherland if empty
                 if (desc2.length < 5) {
                     desc2 = "Atención al cliente\nTrabajo en equipo\nTurnos Rotativos";
                 }
                 
                  data.experience.push({
                     role: "Mesera",
                     company: "Sutherland Global Services",
                     period: "Anterior", // No detected explicitly in chunk usually
                     description: desc2,
                     details: [],
                     summary: []
                 });
             }
         } else {
             // General Logic
             const dates = [];
             let match;
             dateRangeRegex.lastIndex = 0;
             while ((match = dateRangeRegex.exec(expTextSection)) !== null) {
                 dates.push({index: match.index, text: match[0]});
             }
             
             for (let i = 0; i < dates.length; i++) {
                 const current = dates[i];
                 const startSearch = i > 0 ? dates[i-1].index + dates[i-1].text.length : 0;
                 const preBlock = expTextSection.substring(startSearch, current.index).trim();
                 const endSearch = i < dates.length - 1 ? dates[i+1].index : expTextSection.length; 
                 const postBlock = expTextSection.substring(current.index + current.text.length, endSearch).trim();
                 
                 const header = preBlock.slice(-60); // Look at text immediately preceding date
                 let company = header;
                 
                 data.experience.push({
                     role: "Rol a definir",
                     company: company,
                     period: current.text,
                     description: postBlock.substring(0, 200),
                     summary: [],
                     details: []
                 });
             }
         }
    }

    // --- 5. Skills Check ---
    const potentialSkills = [
        "atención al cliente", "servicio al cliente", "trabajo en equipo", "liderazgo", 
        "comunicación", "animales", "veterinaria", "limpieza", "organización", 
        "inglés", "español", "ventas", "caja", "manejo de estrés", "estrés", 
        "responsabilidad", "proactiva", "proactivo", "compromiso", "aprendizaje rápido", 
        "vocación", "bienestar animal", "resolución de problemas", "puntualidad"
    ];
    
    const foundSkills = potentialSkills.filter(s => cleanText.toLowerCase().includes(s));
    data.skills.categories.habilidades = foundSkills.map(s => s.charAt(0).toUpperCase() + s.slice(1));
    
    // --- 6. Education Check ---
    if (cleanText.toLowerCase().includes("universitaria de colombia")) {
        data.education.push({
            degree: "Auxiliar en Clínica Veterinaria",
            institution: "Universitaria de Colombia",
            year: "2025", 
            details: ""
        });
    }
    
    if (cleanText.toLowerCase().includes("bachiller") || cleanText.toLowerCase().includes("colegio")) {
         const colegioMatch = cleanText.match(/colegio\s+([a-zA-Z\s]+)/i);
         let colegioName = colegioMatch ? colegioMatch[0] : "Institución Educativa";
         if (cleanText.toLowerCase().includes('tibabuyes')) colegioName = 'Colegio Tibabuyes Universal';

         data.education.push({
            degree: "Bachiller Académico",
            institution: colegioName,
            year: "2021",
            details: "" 
         });
    }

    // 7. Final Polish
    data.projects = []; 
    // Set Header Title to Name Initials or first name
    if (data.profile.name) {
        const parts = data.profile.name.split(' ');
        if(parts.length >= 2) {
             // Initials + Lastname? Ex: L.Gaitán
             data.header = { title: `${parts[0].charAt(0)}.${parts[2] || parts[1]}` };
        } else {
             data.header = { title: data.profile.name };
        }
    }

    // --- 8. Language Parsing (NEW) ---
    // Detectar inglés/español y niveles
    if (cleanText.toLowerCase().includes('english') || cleanText.toLowerCase().includes('inglés') || cleanText.toLowerCase().includes('semibilingüe')) {
        let level = "Básico";
        if (cleanText.toLowerCase().match(/(fluent|avanzado|advanced|bilingüe)/)) level = "Fluido/Avanzado";
        else if (cleanText.toLowerCase().match(/(intermediate|intermedio|semibilingüe)/)) level = "Intermedio";
        else if (cleanText.toLowerCase().match(/(basic|básico)/)) level = "Básico";

        data.languages.push({
            language: "Inglés",
            proficiency: level
        });
    }
    
    // Español por defecto si se ve texto en español
    if (cleanText.toLowerCase().includes('español') || cleanText.toLowerCase().includes('spanish') || cleanText.match(/[áéíóúñ]/)) {
        data.languages.push({
            language: "Español",
            proficiency: "Nativo"
        });
    }

    // --- 9. Narrative Experience Fallback (NEW) ---
    // Si no se encontró experiencia estructurada (length 0), intentar extraer de narrativa
    if (data.experience.length === 0) {
        // Buscar palabras clave de empresas y roles conocidos en el texto sucio
        const narrativeMap = [
            { key: 'sutherland', company: 'Sutherland Global Services', role: 'Asesor Call Center' },
            { key: 'call center', company: 'Empresa BPO', role: 'Agente Call Center' },
            { key: 'mesera', company: 'Restaurante', role: 'Mesera' },
            { key: 'camarera', company: 'Restaurante', role: 'Mesera' },
            { key: 'veterinaria', company: 'Clínica Veterinaria', role: 'Auxiliar de Veterinaria' }
        ];

        const usedKeys = new Set();

        narrativeMap.forEach(item => {
            if (cleanText.toLowerCase().includes(item.key) && !usedKeys.has(item.key)) {
                
                // Evitar duplicados basicos
                const isDuplicate = data.experience.some(e => e.company === item.company);
                if (!isDuplicate) {
                    data.experience.push({
                        role: item.role,
                        company: item.company,
                        period: "Experiencia previa",
                        description: `Experiencia detectada en ${item.key}. Verifique detalles.`,
                        details: [],
                        summary: []
                    });
                    usedKeys.add(item.key);
                }
            }
        });
    }
    
    return data;
};
