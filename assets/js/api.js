/** api.js
 * Gemensam hjälpfunktion för autentiserade API-anrop.
 * Lägger till JWT-token i Authorization-headern
 * och hanterar saknad eller ogiltig autentisering.
 */

import { API_BASE_URL } from './config.js';
import { getToken, removeToken, redirectToLogin } from './auth.js';

// --------------------------------------------------
// Autentiserade API-anrop
// --------------------------------------------------

export async function authFetch(endpoint, options = {}) {
  // Hämta användarens sparade JWT-token
  const token = getToken();

  // Utan token ska användaren inte stanna i adminvyn
  if (!token) {
    redirectToLogin();
    return null;
  }

  // Skapa headers från eventuella headers som skickats med anropet
  const headers = new Headers(options.headers);

  // Lägg till JWT-token enligt Bearer-formatet
  headers.set('Authorization', `Bearer ${token}`);

  // JSON används för anrop som skickar data till API:t
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  // Skapa fetch-alternativ med metod, headers och body
  const fetchOptions = {
    method: options.method || 'GET',
    headers: headers
  };

  // Lägg till body om det finns någon
  if (options.body) {
    fetchOptions.body = options.body;
  }

  // Utför fetch-anropet med den kompletta URL:en och fetch-alternativen
  const response = await fetch(`${API_BASE_URL}${endpoint}`, fetchOptions);

  // 401 innebär att token saknas, är ogiltig eller har gått ut
  if (response.status === 401) {
    removeToken();
    redirectToLogin();
    return null;
  }

  // Returnera API-svaret så att den anropande funktionen
  // kan kontrollera status och läsa eventuell JSON-data
  return response;
}
