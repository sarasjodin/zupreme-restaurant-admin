/** config.js
 * Central konfiguration för vilken API-basadress
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
