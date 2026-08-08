// Handles tab navigation and switches between admin dashboard sections

// Get all tab buttons and panels
const tabs = document.querySelectorAll('[role="tab"]');
const panels = document.querySelectorAll('[role="tabpanel"]');

// Add click event to each tab
tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    // Mark all tabs as inactive
    tabs.forEach((item) => {
      item.setAttribute('aria-selected', 'false');
    });

    // Hide all tab panels
    panels.forEach((panel) => {
      panel.hidden = true;
    });

    // Mark the clicked tab as active
    tab.setAttribute('aria-selected', 'true');

    // Show the clicked tab's panel
    const panelId = tab.getAttribute('aria-controls');
    document.getElementById(panelId).hidden = false;
  });
});
