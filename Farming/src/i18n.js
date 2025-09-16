import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// the translations
// (tip move them in a JSON file and load them with import i18n from 'i18next';
// import { initReactI18next } from 'react-i18next';
// import LanguageDetector from 'i18next-browser-languagedetector';

// // the translations
// // (tip move them in a JSON file and load them with i18next-http-backend
// // for all available options read the documentation: https://www.i18next.com/overview/configuration-options)
// i18n
//   .use(LanguageDetector)
//   .use(initReactI18next)
//   .init({
//     debug: true,
//     fallbackLng: 'en',
//     interpolation: {
//       escapeValue: false, // not needed for react as it escapes by default
//     },
//     resources: {
//       en: {
//         translation: {
//           description: {
//             part1: 'Edit <1>src/App.js</1> and save to reload.',
//             part2: 'Learn React',
//           },
//         },
//       },
//       mizo: {
//         translation: {
//           description: {
//             part1: 'Mizo translation part 1',
//             part2: 'Mizo translation part 2',
//           },
//         },
//       },
//     }
//   });

// export default i18n;
// i18next-http-backend
// for all available options read the documentation: https://www.i18next.com/overview/configuration-options)
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: true,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    resources: {
      en: {
        translation: {
          "welcome": "Welcome to Agriapp",
          "news": "News",
          "products": "Products",
          "schemes": "Schemes",
          "contact": "Contact Us",
          "about": "About Us",
          "login": "Login",
          "signup": "Sign Up"
        }
      },
      mizo: {
        translation: {
          "welcome": "Agriapp-ah lo leng rawh",
          "news": "Chanchin Thar",
          "products": "Thil Zawrh",
          "schemes": "Ruahmanna",
          "contact": "Biak Pawhna",
          "about": "Kan Chanchin",
          "login": "Lut",
          "signup": "Inziaklu"
        }
      }
    }
  });

export default i18n;
