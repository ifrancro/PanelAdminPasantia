export const getFullImageUrl = (url) => {
    if (!url) return null;
    
    // Si la URL ya es absoluta, base64 o blob, se devuelve tal cual
    if (url.startsWith('http://') || 
        url.startsWith('https://') || 
        url.startsWith('data:') || 
        url.startsWith('blob:')) {
        return url;
    }

    // Backend base URL (Render)
    const baseUrl = "https://clubs-api.onrender.com";
    
    // Asegurarse de que haya un / entre el base URL y la ruta de la imagen
    return url.startsWith('/') ? `${baseUrl}${url}` : `${baseUrl}/${url}`;
};
