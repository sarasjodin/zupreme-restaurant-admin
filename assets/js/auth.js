/** auth.js
 * Hjälpfunktioner för hantering av JWT-token
 * och navigering mellan login- och adminvyn
 */

const TOKEN_KEY = 'zupreme_admin_token';

// --------------------------------------------------
// Token-hantering
// --------------------------------------------------

// Sparar JWT-token för den aktuella webbläsarsessionen
export function saveToken(token) {
  sessionStorage.setItem(TOKEN_KEY, token);
}

// Hämtar sparad JWT-token
// Returnerar null om ingen token finns
export function getToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

// Tar bort JWT-token, exempelvis vid utloggning
export function removeToken() {
  sessionStorage.removeItem(TOKEN_KEY);
}

// --------------------------------------------------
// Navigering
// --------------------------------------------------

// Skickar användaren till login-sidan
export function redirectToLogin() {
  window.location.replace('index.html');
}

// Skickar användaren till administrationsvyn
export function redirectToAdmin() {
  window.location.replace('admin.html');
}
