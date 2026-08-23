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
const menuItemFormTitle = document.querySelector('#menu-item-form-title');
const menuItemSubmitButton = document.querySelector('#menu-item-submit-button');

// ID för menyartikeln som redigeras
// null betyder att formuläret används för att skapa en ny artikel
let editingMenuItemId = null;

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
  editingMenuItemId = null;
  menuItemForm.reset();
  menuItemFormTitle.textContent = 'Lägg till menyartikel';
  menuItemSubmitButton.textContent = 'Spara';
  menuItemForm.hidden = false;
  addMenuItemButton.setAttribute('aria-expanded', 'true');
}

function showEditMenuItemForm(item) {
  editingMenuItemId = item.id;

  menuItemForm.elements.category_id.value = item.category_id;
  menuItemForm.elements.name.value = item.name;
  menuItemForm.elements.description.value = item.description ?? '';
  menuItemForm.elements.serving.value = item.serving ?? '';
  menuItemForm.elements.price.value = item.price;
  menuItemForm.elements.sort_order.value = item.sort_order;
  menuItemForm.elements.is_available.checked = Boolean(item.is_available);

  menuItemFormTitle.textContent = 'Redigera menyartikel';
  menuItemSubmitButton.textContent = 'Spara ändringar';

  menuItemForm.hidden = false;
  addMenuItemButton.setAttribute('aria-expanded', 'true');

  menuItemForm.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  });

  // Flytta fokus till fältet för kategorival när formuläret visas
  menuItemForm.elements.category_id.focus();
}

function hideMenuItemForm() {
  menuItemForm.hidden = true;
  menuItemForm.reset();

  // Återställ edit-läget så att formuläret nästa gång
  // kan användas för att skapa en ny menyartikel
  editingMenuItemId = null;
  addMenuItemButton.setAttribute('aria-expanded', 'false');
}

addMenuItemButton.addEventListener('click', showMenuItemForm);
cancelMenuItemButton.addEventListener('click', hideMenuItemForm);

// --------------------------------------------------
// Authentication - API-anrop med JWT-token
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
// Meny API - hämta menyartiklar från API
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
// Meny-API - skapa menyartikel
// --------------------------------------------------

async function createMenuItem(menuItem) {
  try {
    const response = await authFetch('/menu-items', {
      method: 'POST',
      body: JSON.stringify(menuItem)
    });

    if (!response) {
      return null;
    }

    if (!response.ok) {
      const data = await response.json();

      showMessage(
        'menu-status',
        data.error ?? 'Menyartikeln kunde inte skapas.',
        'error'
      );

      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Could not create menu item:', error);

    showMessage('menu-status', 'Menyartikeln kunde inte skapas.', 'error');

    return null;
  }
}

// --------------------------------------------------
// Meny-API - uppdatera menyartikel
// --------------------------------------------------

async function updateMenuItem(menuItemId, menuItem) {
  try {
    const response = await authFetch(`/menu-items/${menuItemId}`, {
      method: 'PATCH',
      body: JSON.stringify(menuItem)
    });

    if (!response) {
      return null;
    }

    if (!response.ok) {
      const data = await response.json();

      showMessage(
        'menu-status',
        data.error ?? 'Menyartikeln kunde inte uppdateras.',
        'error'
      );

      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Could not update menu item:', error);

    showMessage('menu-status', 'Menyartikeln kunde inte uppdateras.', 'error');

    return null;
  }
}

// --------------------------------------------------
// Hantera formulär för menyartiklar
// --------------------------------------------------

async function handleMenuItemSubmit(event) {
  event.preventDefault();

  // Skapa objektet som skickas till API:t från formulärets värden
  const menuItem = {
    category_id: Number(menuItemForm.elements.category_id.value),
    name: menuItemForm.elements.name.value.trim(),
    description: menuItemForm.elements.description.value.trim(),
    serving: menuItemForm.elements.serving.value.trim(),
    price: Number(menuItemForm.elements.price.value),
    sort_order: Number(menuItemForm.elements.sort_order.value),
    is_available: menuItemForm.elements.is_available.checked
  };

  let savedItem;

  // Om inget ID finns skapas en ny menyartikel med POST
  // Om ett ID finns uppdateras den befintliga artikeln med PATCH
  if (editingMenuItemId === null) {
    savedItem = await createMenuItem(menuItem);
  } else {
    savedItem = await updateMenuItem(editingMenuItemId, menuItem);
  }

  // Avbryt om API-anropet misslyckades
  if (!savedItem) {
    return;
  }

  // Spara vilket läge formuläret hade innan hideMenuItemForm()
  // återställer editingMenuItemId till null
  const wasEditing = editingMenuItemId !== null;

  // Dölj och återställ formuläret efter lyckad sparning.
  hideMenuItemForm();

  // Hämta aktuell meny från API:t efter POST eller PATCH
  const menuItems = await fetchMenuItems();

  if (menuItems === null) {
    return;
  }

  // Rendera om tabellerna med den uppdaterade datan
  renderMenuItems(menuItems);

  showMessage(
    'menu-status',
    wasEditing ? 'Menyartikeln uppdaterades.' : 'Menyartikeln skapades.',
    'success',
    true
  );
}

menuItemForm.addEventListener('submit', handleMenuItemSubmit);

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

  editButton.addEventListener('click', () => {
    showEditMenuItemForm(item);
  });

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

// Lägg till event listeners för klick och tangentbordsnavigering
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
