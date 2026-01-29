/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,jsx,ts,tsx}"
    ],
    theme: {
        extend: {
            colors: {
                "herbalife-green": "#7CB342",
                "herbalife-dark": "#689F38",
                "herbalife-light": "#9CCC65",
            },
        },
    },
    plugins: [],
};
