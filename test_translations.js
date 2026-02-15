import { translations } from './src/translations.js';
console.log('Translations loaded successfully');
if (translations && translations.en && translations.es) {
    console.log('EN keys:', Object.keys(translations.en).length);
    console.log('ES keys:', Object.keys(translations.es).length);
} else {
    console.error('Translations object is malformed');
    process.exit(1);
}
