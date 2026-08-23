/** config.js
 * Central konfiguration för olika basadresser
 * administrationsklienten ska använda
 */

// --------------------------------------------------
// API-basadress
// --------------------------------------------------
// Vid lokal utveckling används API:t som körs via Docker på port 3001
// I övriga miljöer används produktions-API:t

const isLocal =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1';

export const API_BASE_URL = isLocal
  ? 'http://localhost:3001/api'
  : 'https://zupreme-restaurant-api.sarasjodin.se/api';

// --------------------------------------------------
// Bild-basadress
// --------------------------------------------------
// Basadress för menybilder som ligger på den publika webbplatsen
// API:t returnerar image_path som en relativ sökväg, exempelvis:
// /images/menu-items/burrata-med-tomat-och-basilika.webp
//
// I adminvyn kombineras IMAGE_BASE_URL med image_path
// för att skapa den fullständiga bildadressen
//
// Om image_path saknas används i stället en kategoribild
// från adminprojektets assets/images/menu-categories

export const IMAGE_BASE_URL = 'https://zupreme-restaurant.netlify.app';
