/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        fondo:    '#0F1117',
        card:     '#1A1D27',
        borde:    '#2D3748',
        naranja:  '#F97316',
        'naranja-hover': '#EA6C10',
        texto:    '#F7FAFC',
        subtexto: '#94A3B8',
      },
    },
  },
  plugins: [],
};
