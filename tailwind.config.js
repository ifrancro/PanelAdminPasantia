


/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,jsx,ts,tsx}"
    ],
    theme: {
        extend: {
            colors: {
                // Paleta Expande (minimalista, derivada del logo).
                // Se conservan los nombres "herbalife-*" para no tocar
                // los ~100 usos existentes en los componentes — solo
                // cambian los valores. La pantalla de login mantiene
                // su paleta propia y no usa estos tokens.
                "herbalife-green": "#0E1B31",   // navy — antes verde marca
                "herbalife-dark": "#060D1A",    // navy oscuro — hover
                "herbalife-light": "#1F7FE0",   // azul — acento/foco
                "herbalife-lighter": "#DCEBFB", // azul pálido — fondos suaves
                "herbalife-accent": "#FF9800",
                "herbalife-error": "#F44336",
                "herbalife-info": "#2196F3",
            },
        },
    },
    plugins: [],
};
