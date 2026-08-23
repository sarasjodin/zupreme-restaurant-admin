/** admin.js
 * Initierar administrationsvyn.
 * Verifierar inloggad användare, hanterar utloggning
 * och navigation mellan administrationssidans flikar
 */

import { authFetch } from './api.js';
import { removeToken, redirectToLogin } from './auth.js';

// --------------------------------------------------
// DOM elements
// --------------------------------------------------

const logoutButton = document.querySelector('#logout-button');
// Get all tab buttons and panels
const tabs = document.querySelectorAll('[role="tab"]');
const panels = document.querySelectorAll('[role="tabpanel"]');

// --------------------------------------------------
// Authentication
// --------------------------------------------------

// Kontrollera att användaren är inloggad och har en giltig JWT-token när sidan laddas
async function init() {
  try {
    // Kontrollera att den sparade JWT-tokenen fortfarande är giltig
    const response = await authFetch('/auth/me');

    // authFetch skickar användaren till login om token saknas
    // eller inte längre är giltig
    if (!response) {
      return;
    }

    if (!response.ok) {
      console.error('Could not verify current user.');
      redirectToLogin();
      return;
    }

    const data = await response.json();
    // Om användaren är giltig tas klassen "auth-pending" bort för att visa administrationsgränssnittet för användaren
    document.body.classList.remove('auth-pending');

    // Nästa steg:
    // await fetchMenuItems();

    // Om användaren inte är admin skickad den tillbaka till login
  } catch (error) {
    console.error(error);
    redirectToLogin();
  }
}

// --------------------------------------------------
// Utloggning
// --------------------------------------------------

function handleLogout() {
  // Ta bort JWT-token och gå tillbaka till login-sidan.
  removeToken();
  redirectToLogin();
}

logoutButton.addEventListener('click', handleLogout);

// --------------------------------------------------
// Tab navigation
// --------------------------------------------------

// Aktiverar vald tab och visar den panel som tabben hör till.
function activateTab(selectedTab) {
  // Uppdatera ARIA-attribut och tabindex för de valda tabbarna
  tabs.forEach((tab) => {
    const isSelected = tab === selectedTab;

    tab.setAttribute('aria-selected', String(isSelected));
    tab.setAttribute('tabindex', isSelected ? '0' : '-1');
  });

  // Hämta ID:t för den valda tab-panelen
  // (attributet innehåller id:t på den panel som tabben styr)
  const selectedPanelId = selectedTab.getAttribute('aria-controls');

  // Uppdatera ARIA-attribut och dölja icke-valda paneler
  panels.forEach((panel) => {
    panel.hidden = panel.id !== selectedPanelId;
  });
}

// Flytta fokus till nästa eller föregående tab baserat på index
// index är positionen i tabs-arrayen
function moveToTab(index) {
  tabs[index].focus();
  activateTab(tabs[index]);
}

// Lägg till event listeners för varje tab för klick och tangentbordsnavigeringn
tabs.forEach((tab, index) => {
  // Byt aktiv tab när en tab klickas på
  tab.addEventListener('click', () => {
    activateTab(tab);
  });

  // Byt aktiv tab när vänster eller höger piltangent trycks ned
  tab.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();

      // Räkna index för nästa tab
      let nextIndex = index + 1;

      // Starta om från första tabben om den sista tabben nås
      if (nextIndex >= tabs.length) {
        nextIndex = 0;
      }

      // Flytta fokus till nästa tab
      moveToTab(nextIndex);
    }

    // Hantera vänsterpiltangent för att flytta till föregående tab
    if (event.key === 'ArrowLeft') {
      event.preventDefault();

      let previousIndex = index - 1;

      // Gå till sista tabben om den första tabben nås
      if (previousIndex < 0) {
        previousIndex = tabs.length - 1;
      }

      // Flytta fokus till föregående tab
      moveToTab(previousIndex);
    }
  });
});

// --------------------------------------------------
// Initialize admin
// --------------------------------------------------

init();
