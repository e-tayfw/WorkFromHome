import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    './node_modules/flowbite/**/*.js',
  ],
  theme: {
    extend: {
      colors: {
        // Light mode colors
        text: '#090a0c',
        background: '#f5f5f5',
        primary: '#072040',
        secondary: '#a2b4cc',
        accent: '#819dc1',
        
        // Dark mode colors, prefixed with 'dark-'
        // 'dark-text': '#d0dbfc',
        // 'dark-background': '#12141a',
        // 'dark-primary': '#006a66',
        // 'dark-secondary': '#ffffff',
        // 'dark-accent': '#436be5',
      },
    },
  };
  plugins: [
    require('flowbite/plugin')
  ],
  darkMode: 'class', // Enables dark mode with a 'dark' class on the root element
};

export default config;
