/** statusMessages.js
 * Gemensam hjälpfunktion för status- och felmeddelanden i UI.
 */

// --------------------------------------------------
// Timeout-hantering för meddelanden
// --------------------------------------------------
// Sparar en separat timeout för varje elementId
// så att respektive meddelande kan rensas utan att påverka andra meddelanden.
// Om ett nytt meddelande visas innan det tidigare meddelandet har rensats
// rensas det tidigare timeoutet och det nya meddelandet visas istället.
// setTimeout() startar en timer
// clearTimeout() avbryter timer

const messageTimeouts = {};

// --------------------------------------------------
// Show message - Visa meddelande i UI
// --------------------------------------------------

// autoHide är false som standard
// Om autoHide är true rensas meddelandet automatiskt efter 5 sekunder

export function showMessage(elementId, text, type = 'info', autoHide = false) {
  const el = document.getElementById(elementId);
  if (!el) return;

  // Rensa tidigare timeout för detta elementId
  clearTimeout(messageTimeouts[elementId]);

  // Tillåt endast vissa typer av meddelanden som har stöd i UI:t
  const allowedTypes = ['info', 'loading', 'success', 'error'];
  // Om typen inte är tillåten, använd 'info' som standard
  const messageType = allowedTypes.includes(type) ? type : 'info';

  // hidden=false för att visa elementet, men texten och klasserna rensas
  el.hidden = false;

  // Rensa tidigare statusattribut och klasser
  el.removeAttribute('role');
  el.removeAttribute('aria-live');
  el.className = 'status-message';

  // Sätt ARIA-attribut baserat på meddelandetyp
  if (messageType === 'error') {
    el.setAttribute('role', 'alert');
    el.setAttribute('aria-live', 'assertive');
  } else {
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
  }

  // Sätt text och klass för meddelandetyp
  el.textContent = text;
  el.classList.add(messageType);

  // Om autoHide är true, rensa meddelandet efter 5 sekunder
  if (autoHide) {
    messageTimeouts[elementId] = setTimeout(() => {
      clearMessage(elementId);
    }, 5000);
  }
}

// --------------------------------------------------
// Clear message - Rensa meddelande i UI
// --------------------------------------------------
export function clearMessage(elementId) {
  const el = document.getElementById(elementId);
  if (!el) return;

  // Rensa timeout för detta elementId
  clearTimeout(messageTimeouts[elementId]);

  // Rensa text, klasser och ARIA-attribut
  el.textContent = '';
  el.className = 'status-message';
  el.removeAttribute('role');
  el.removeAttribute('aria-live');

  // Dölj elementet tills nästa meddelande ska synas i UI
  el.hidden = true;
}
