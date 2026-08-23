/** admin.js
 * Initierar administrationsvyn.
 * Verifierar inloggad användare, hanterar utloggning
 * och navigation mellan administrationssidans flikar
 */

import { IMAGE_BASE_URL } from './config.js';
import { authFetch } from './api.js';
import { removeToken, redirectToLogin } from './auth.js';
import { showMessage, clearMessage } from './statusMessages.js';

// --------------------------------------------------
// DOM elements
// --------------------------------------------------

const logoutButton = document.querySelector('#logout-button');
// Get all tab buttons and panels
const tabs = document.querySelectorAll('[role="tab"]');
const panels = document.querySelectorAll('[role="tabpanel"]');

const categoryTables = {
  Förrätter: document.querySelector('#menu-starters'),
  Soppor: document.querySelector('#menu-soups'),
  Varmrätter: document.querySelector('#menu-main'),
  Efterrätter: document.querySelector('#menu-desserts'),
  Drycker: document.querySelector('#menu-drinks')
};

const addMenuItemButton = document.querySelector('#add-menu-item-button');
const menuItemForm = document.querySelector('#menu-item-form');
const cancelMenuItemButton = document.querySelector('#cancel-menu-item-button');

// --------------------------------------------------
// Kategoribilder
// --------------------------------------------------

const categoryImages = {
  Förrätter: 'assets/images/menu-categories/forratt.webp',
  Soppor: 'assets/images/menu-categories/soppa.webp',
  Varmrätter: 'assets/images/menu-categories/varmratt.webp',
  Efterrätter: 'assets/images/menu-categories/efterratt.webp',
  Drycker: 'assets/images/menu-categories/dryck.webp'
};

// --------------------------------------------------
// Formulär för menyartiklar
// --------------------------------------------------

function showMenuItemForm() {
  menuItemForm.hidden = false;
  addMenuItemButton.setAttribute('aria-expanded', 'true');
}

function hideMenuItemForm() {
  menuItemForm.hidden = true;
  menuItemForm.reset();
  addMenuItemButton.setAttribute('aria-expanded', 'false');
}

addMenuItemButton.addEventListener('click', showMenuItemForm);
cancelMenuItemButton.addEventListener('click', hideMenuItemForm);

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

    // Användaren är giltig och data om användaren finns i API:ts svar
    const data = await response.json();

    // Visa admin-gränssnittet
    // Om användaren är giltig tas klassen "auth-pending" bort för att visa administrationsgränssnittet för användaren
    document.body.classList.remove('auth-pending');

    // Visa välkomstmeddelande med användarens namn
    showMessage(
      'admin-status',
      `Inloggad som ${data.user.name}`,
      'success',
      true
    );

    // Hämta alla menyartiklar
    const menuItems = await fetchMenuItems();

    if (menuItems === null) {
      return;
    }

    // Rendera menyartiklarna.
    renderMenuItems(menuItems);
  } catch (error) {
    console.error('Could not initialize admin:', error);
    redirectToLogin();
  }
}

// --------------------------------------------------
// Menu API - hämta menyartiklar från API
// --------------------------------------------------

async function fetchMenuItems() {
  showMessage('menu-status', 'Menyn hämtas...', 'loading');

  try {
    // Hämta alla menyartiklar, även de som inte är tillgängliga.
    const response = await authFetch('/menu-items?include_unavailable=true');

    // authFetch skickar användaren till login om token saknas
    // eller inte längre är giltig.
    if (!response) {
      return null;
    }

    // fetch kastar inte automatiskt fel för t.ex. 404 eller 500.
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const menuItems = await response.json();

    clearMessage('menu-status');

    return menuItems;
  } catch (error) {
    console.error('Could not fetch menu items:', error);

    showMessage(
      'menu-status',
      'Menyartiklarna kunde inte hämtas just nu.',
      'error'
    );

    return null;
  }
}

// --------------------------------------------------
// Menu rendering - rendera menyartiklar i tabeller
// --------------------------------------------------

function renderMenuItems(menuItems) {
  // Rensa tidigare menyartiklar.
  Object.values(categoryTables).forEach((tableBody) => {
    tableBody.replaceChildren();
  });

  if (menuItems.length === 0) {
    showMessage('menu-status', 'Det finns inga menyartiklar att visa.', 'info');

    return;
  }

  // Lägg varje menyartikel i rätt kategoritabell.
  menuItems.forEach((item) => {
    const tableBody = categoryTables[item.category_name];

    if (!tableBody) {
      return;
    }

    const row = createMenuItemRow(item);

    tableBody.appendChild(row);
  });
}

// --------------------------------------------------
// Create menu item row - skapa tabellrad för en menyartikel
// --------------------------------------------------

function createMenuItemRow(item) {
  const row = document.createElement('tr');

  // Sorteringsposition
  const positionCell = document.createElement('td');
  positionCell.textContent = item.sort_order;

  // Rättens namn, bild och beskrivning
  const dishHeader = document.createElement('th');
  dishHeader.setAttribute('scope', 'row');

  const dish = document.createElement('div');
  dish.className = 'dish';

  const image = document.createElement('img');
  if (item.image_path) {
    image.src = `${IMAGE_BASE_URL}${item.image_path}`;
  } else {
    image.src = categoryImages[item.category_name];
  }

  image.alt = '';

  const dishContent = document.createElement('div');
  dishContent.className = 'dish-content';

  const name = document.createElement('span');
  name.className = 'dish-name';
  name.textContent = item.name;

  const description = document.createElement('span');
  description.className = 'dish-ingredients';
  description.textContent = item.description ?? '';

  dishContent.append(name, description);
  dish.append(image, dishContent);
  dishHeader.appendChild(dish);

  // Servering
  const servingCell = document.createElement('td');
  servingCell.textContent = item.serving;

  // Pris
  const priceCell = document.createElement('td');
  priceCell.textContent = `${Math.trunc(item.price)} kr`;

  // Tillgänglighet
  const availabilityCell = document.createElement('td');

  const toggle = document.createElement('label');
  toggle.className = 'toggle';

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = item.is_available;
  checkbox.setAttribute('aria-label', `Tillgänglig: ${item.name}`);

  // Sparas för kommande PATCH-funktion.
  checkbox.dataset.id = item.id;

  const slider = document.createElement('span');
  slider.className = 'slider';
  slider.setAttribute('aria-hidden', 'true');

  toggle.append(checkbox, slider);
  availabilityCell.appendChild(toggle);

  // Åtgärder
  const actionsCell = document.createElement('td');

  const actions = document.createElement('div');
  actions.className = 'actions';

  const editButton = document.createElement('button');
  editButton.type = 'button';
  editButton.dataset.id = item.id;
  editButton.setAttribute('aria-label', `Redigera ${item.name}`);

  const editIcon = document.createElement('span');
  editIcon.className = 'icon edit';
  editIcon.setAttribute('aria-hidden', 'true');

  editButton.appendChild(editIcon);

  const deleteButton = document.createElement('button');
  deleteButton.type = 'button';
  deleteButton.className = 'cancel';
  deleteButton.dataset.id = item.id;
  deleteButton.setAttribute('aria-label', `Ta bort ${item.name}`);

  const deleteIcon = document.createElement('span');
  deleteIcon.className = 'icon delete';
  deleteIcon.setAttribute('aria-hidden', 'true');

  deleteButton.appendChild(deleteIcon);

  actions.append(editButton, deleteButton);
  actionsCell.appendChild(actions);

  // Lägg till alla celler i rätt ordning.
  row.append(
    positionCell,
    dishHeader,
    servingCell,
    priceCell,
    availabilityCell,
    actionsCell
  );

  return row;
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
