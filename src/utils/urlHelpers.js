// Helper para normalizar URLs y evitar rutas relativas
export const normalizeUrl = (url) => {
    if (!url || !url.trim()) return '#';
    const trimmed = url.trim();
    
    // Si ya tiene protocolo válido, retornar
    if (trimmed.startsWith('http://') || 
        trimmed.startsWith('https://') || 
        trimmed.startsWith('tel:') || 
        trimmed.startsWith('mailto:')) {
        return trimmed;
    }
    
    // Agregar https:// por defecto
    return `https://${trimmed}`;
};
