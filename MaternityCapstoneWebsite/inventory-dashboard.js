// Get category icon
function getCategoryInventoryIcon(category) {
  const icons = {
    'Medicine': 'bi-capsule-pill',
    'Equipment': 'bi-tools',
    'Supplies': 'bi-bandaid-fill'
  };
  return icons[category] || 'bi-box-seam';
}

// Determine item status
function getDashboardItemStatus(quantity, reorderLevel, expirationDate) {
  const today = new Date();
  const expDate = new Date(expirationDate);
  const daysUntilExpiry = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));

  if (quantity === 0) return { status: 'Out of Stock', statusClass: 'status-low-stock', barClass: 'fill-low-stock' };
  if (quantity <= reorderLevel) return { status: 'Low Stock', statusClass: 'status-running-low', barClass: 'fill-running-low' };
  if (daysUntilExpiry <= 30 && daysUntilExpiry >= 0) return { status: 'Expiring Soon', statusClass: 'status-running-low', barClass: 'fill-running-low' };
  return { status: 'Good', statusClass: 'status-good', barClass: 'fill-good' };
}

// Update low stock alert banner with inventory data
function updateLowStockAlert(items) {
  const alertBox = document.getElementById("lowStockAlert");
  const message = document.getElementById("lowStockMessage");

  if (!alertBox || !message) return;

  const lowItems = items.filter(item =>
    item.quantity <= item.reorderLevel || item.quantity === 0
  );

  if (lowItems.length > 0) {
    const names = lowItems.map(i => i.name).join(", ");
    message.textContent = `Please restock immediately: ${names}.`;
    alertBox.classList.remove("is-hidden");
  } else {
    alertBox.classList.add("is-hidden");
  }
}

// Load and display dashboard inventory
function loadDashboardInventory() {
  const items = JSON.parse(localStorage.getItem('inventoryItems')) || [];
  const container = document.getElementById('dashboardInventoryList');

  if (!container) return;

  // Update alert banner with real inventory data
  updateLowStockAlert(items);

  // Show only first 4 items or fewer
  const displayItems = items.slice(0, 4);

  if (displayItems.length === 0) {
    container.innerHTML = '<p style="padding: 20px; text-align: center; color: #5a8a72; font-size: 13px;">No inventory items. <a href="inventory.html" style="color: #1D9E75; text-decoration: none; font-weight: 600;">Add items</a></p>';
    return;
  }

  container.innerHTML = displayItems.map(item => {
    const statusInfo = getDashboardItemStatus(item.quantity, item.reorderLevel, item.expirationDate);
    const icon = getCategoryInventoryIcon(item.category);

    return `
      <article class="inventory-row">
        <div class="inventory-head">
          <div class="inventory-item-info">
            <span class="inventory-icon" aria-hidden="true"><i class="bi ${icon}"></i></span>
            <p class="inventory-name">${item.name}</p>
          </div>
          <p class="inventory-qty">${item.quantity} ${item.unit}</p>
        </div>
        <div class="inventory-foot">
          <div class="inventory-track" aria-hidden="true">
            <span class="inventory-fill ${statusInfo.barClass}"></span>
          </div>
          <span class="inventory-status ${statusInfo.statusClass}">${statusInfo.status}</span>
        </div>
      </article>
    `;
  }).join('');
}

// Load on page load
document.addEventListener('DOMContentLoaded', function() {
  loadDashboardInventory();

  // Watch for localStorage changes from other tabs/windows
  window.addEventListener('storage', function(e) {
    if (e.key === 'inventoryItems') {
      loadDashboardInventory();
    }
  });
});
