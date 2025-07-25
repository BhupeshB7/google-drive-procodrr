// tailwind.config.js
import { createConfig } from '@tailwindcss/config'

export default createConfig({
    content: [
        "./index.html",
        "./src/**/*.{js,jsx}",
    ],
    theme: {
        extend: {},
    },
    plugins: [],
})
