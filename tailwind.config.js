


/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,jsx,ts,tsx}"
    ],
    theme: {
        extend: {
            colors: {
                "herbalife-green": "#1B5E20",
                "herbalife-dark": "#0D3B10",
                "herbalife-light": "#4CAF50",
                "herbalife-lighter": "#C8E6C9",
                "herbalife-accent": "#FF9800",
                "herbalife-error": "#F44336",
                "herbalife-info": "#2196F3",
            },
        },
    },
    plugins: [],
};
