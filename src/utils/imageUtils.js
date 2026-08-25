export const getFullImageUrl = (url) => {
    if (!url) return null;
    
    // Si la URL ya es absoluta, base64 o blob, se devuelve tal cual
    if (url.startsWith('http://') || 
        url.startsWith('https://') || 
        url.startsWith('data:') || 
        url.startsWith('blob:')) {
        return url;
    }

    // Backend base URL (derive from VITE_API_URL)
    const apiUrl = import.meta.env.VITE_API_URL || "https://clubs-api.onrender.com/api";
    const baseUrl = apiUrl.replace(/\/api$/, "");
    
    // Asegurarse de que haya un / entre el base URL y la ruta de la imagen
    return url.startsWith('/') ? `${baseUrl}${url}` : `${baseUrl}/${url}`;
};
