/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{vue,js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'maimai-purple': '#D946EF',
                'maimai-blue': '#38BDF8',
                'maimai-yellow': '#FACC15',
                'maimai-green': '#4ADE80',
                'maimai-red': '#F87171',
                'maimai-pink': '#F472B6',
            },
            boxShadow: {
                'hard': '4px 4px 0px 0px #000000',
                'hard-sm': '2px 2px 0px 0px #000000',
                'hard-lg': '8px 8px 0px 0px #000000',
            },
            borderWidth: {
                '3': '3px',
            },
            fontFamily: {
                sans: ['"Noto Sans SC"', '"PingFang SC"', '"Microsoft YaHei"', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
