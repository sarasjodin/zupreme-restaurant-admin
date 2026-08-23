/** login.js
 * Hanterar inloggningsformuläret
 * Skickar inloggningsuppgifterna till API:t,
 * sparar JWT-token och skickar användaren vidare till adminvyn
 */

import { API_BASE_URL } from './config.js';
import { saveToken, redirectToAdmin } from './auth.js';
import { showMessage, clearMessage } from './statusMessages.js';

// --------------------------------------------------
// DOM-element
// --------------------------------------------------

const loginForm = document.querySelector('#login-form');
const submitButton = loginForm.querySelector('button[type="submit"]');

// --------------------------------------------------
// Inloggning
// --------------------------------------------------

loginForm.addEventListener('submit', handleLogin);

async function handleLogin(event) {
  event.preventDefault();
  // Förhindra formulärets vanliga submit och omladdning av sidan
  clearMessage('login-status');

  const email = loginForm.elements.email.value.trim();
  const password = loginForm.elements.password.value;

  // Förhindra flera login-anrop medan det första pågår
  submitButton.disabled = true;
  showMessage('login-status', 'Loggar in...', 'loading');

  try {
    // Skicka e-postadress och lösenord till login-endpointen
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        password
      })
    });

    // Läs JSON-svaret från API:t
    const data = await response.json();

    // Visa API:ts felmeddelande om inloggningen misslyckas
    if (!response.ok) {
      showMessage(
        'login-status',
        data.error ?? 'Inloggningen misslyckades.',
        'error'
      );
      // Avbryt funktionen här om inloggningen misslyckas
      return;
    }

    // Om inloggningen lyckas, spara JWT-token och skicka användaren vidare till adminvyn
    saveToken(data.token);

    redirectToAdmin();
  } catch (error) {
    console.error(error);

    // Visa ett generellt felmeddelande om fetch-anropet misslyckas
    showMessage('login-status', 'Kunde inte kontakta servern.', 'error');
  } finally {
    // Aktivera knappen igen när anropet är avslutat
    submitButton.disabled = false;
  }
}
