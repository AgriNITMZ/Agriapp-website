/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Mizoram-inspired color palette
        mizoram: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        earth: {
          50: '#fefdf8',
          100: '#fef7e0',
          200: '#fdecc8',
          300: '#fbd9a5',
          400: '#f7c27a',
          500: '#f2a855',
          600: '#e08c3a',
          700: '#bc6f2a',
          800: '#975a26',
          900: '#7c4a23',
        },
        sky: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        }
      },
      fontFamily: {
        'display': ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
        'body': ['Inter', 'Roboto', 'system-ui', 'sans-serif'],
        'sans': ['Poppins', 'Inter', 'Roboto', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'mizoram-hills': "url('/Assets/Image/mizoram-hills.jpg')",
        'terrace-fields': "url('/Assets/Image/terrace-fields.jpg')",
        'local-farm': "url('/Assets/Image/local-farm.jpg')",
      }
    },
  },
  plugins: [],
}
