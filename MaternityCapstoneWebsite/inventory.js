// Initialize localStorage if empty
function initializeInventory() {
  if (!localStorage.getItem('inventoryItems')) {
    localStorage.setItem('inventoryItems', JSON.stringify([]));
  }
}

function getInventoryItems() {
  const data = localStorage.getItem('inventoryItems');
  if (!data) return [];

  try {
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn('Invalid inventoryItems data, resetting storage.', error);
    localStorage.setItem('inventoryItems', JSON.stringify([]));
    return [];
  }
}

// Get item status based on quantity and expiration date
function getItemStatus(quantity, reorderLevel, expirationDate) {
  const today = new Date();
  const expDate = new Date(expirationDate);
  const daysUntilExpiry = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));

  if (quantity === 0) return 'Out of Stock';
  if (quantity <= reorderLevel) return 'Low Stock';
  if (daysUntilExpiry <= 30 && daysUntilExpiry >= 0) return 'Expiring Soon';
  return 'Good Stock';
}

// Format date
function formatDate(dateString) {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
}

function escapeAttr(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Get category icon
function getCategoryIcon(category) {
  const icons = {
    'Medicine': 'bi-capsule',
    'Equipment': 'bi-tools',
    'Supplies': 'bi-box-seam'
  };
  return icons[category] || 'bi-box-seam';
}

// Get category class
function getCategoryClass(category) {
  return category.toLowerCase().replace(' ', '-');
}

// Show toast notification
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <i class="bi bi-check-circle-fill" aria-hidden="true"></i>
    <span>${message}</span>
  `;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Check and display low stock alert
function updateLowStockAlert(items) {
  const lowItems = items.filter(item =>
    item.quantity <= item.reorderLevel || item.quantity === 0
  );

  const banner = document.getElementById('low-stock-banner');

  if (lowItems.length > 0) {
    const names = lowItems.map(i => i.name).join(', ');
    const message = document.getElementById('alert-message');
    message.textContent = `Low stock alert! The following items need restocking: ${names}. Please update your inventory.`;
    banner.classList.remove('is-hidden');
  } else {
    banner.classList.add('is-hidden');
  }
}

function updateArchivedSummary(items) {
  const archivedItems = items.filter(item => item.archived);
  const countEl = document.getElementById('stat-archived');
  const summaryPanel = document.getElementById('archiveSummaryPanel');

  if (countEl) {
    countEl.textContent = archivedItems.length;
  }

  if (summaryPanel) {
    if (archivedItems.length > 0) {
      summaryPanel.classList.remove('is-hidden');
    } else {
      summaryPanel.classList.add('is-hidden');
    }
  }

  renderArchivedItems(archivedItems);
}

function renderArchivedItems(items) {
  const archiveList = document.getElementById('archiveItemsList');
  if (!archiveList) return;

  if (items.length === 0) {
    archiveList.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon" aria-hidden="true"><i class="bi bi-archive"></i></div>
        <p class="empty-state-title">No archived items yet</p>
        <p class="empty-state-text">Archived items will appear here once you archive them.</p>
      </div>
    `;
    return;
  }

  archiveList.innerHTML = items.map(item => `
    <div class="archive-item-card">
      <div class="archive-item-row">
        <div class="archive-item-meta">
          <p class="archive-item-name">${item.name}</p>
          <p class="archive-item-detail">Category: ${item.category} · ${item.quantity} ${item.unit}</p>
          <p class="archive-item-detail">Supplier: ${item.supplier || 'Unknown'}</p>
        </div>
        <span class="archive-item-status">Archived</span>
      </div>
      <p class="archive-item-detail">Expiration: ${formatDate(item.expirationDate)} · Last updated: ${item.lastUpdated}</p>
      <p class="archive-item-detail">Archived date: ${item.archivedDate || item.lastUpdated || 'Unknown'}</p>
    </div>
  `).join('');
}

// Calculate stats
function updateStats(items) {
  const today = new Date();
  let totalItems = items.length;
  let lowStockCount = 0;
  let expiringCount = 0;
  let outOfStockCount = 0;

  items.forEach(item => {
    if (item.quantity === 0) {
      outOfStockCount++;
      lowStockCount++;
    } else if (item.quantity <= item.reorderLevel) {
      lowStockCount++;
    }

    const expDate = new Date(item.expirationDate);
    const daysUntilExpiry = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));
    if (daysUntilExpiry <= 30 && daysUntilExpiry >= 0) {
      expiringCount++;
    }
  });

  document.getElementById('stat-total').textContent = totalItems;
  document.getElementById('stat-low-stock').textContent = lowStockCount;
  document.getElementById('stat-expiring').textContent = expiringCount;
  document.getElementById('stat-out-of-stock').textContent = outOfStockCount;
}

// Render table
function renderTable(items) {
  const tableBody = document.getElementById('tableBody');
  const emptyState = document.getElementById('emptyState');

  if (items.length === 0) {
    tableBody.innerHTML = '';
    emptyState.classList.remove('is-hidden');
    return;
  }

  emptyState.classList.add('is-hidden');
  tableBody.innerHTML = items.map((item, index) => {
    const status = getItemStatus(item.quantity, item.reorderLevel, item.expirationDate);
    const statusClass = status
      .toLowerCase()
      .replace(' ', '-')
      .replace('out-of-stock', 'out');

    const expDate = new Date(item.expirationDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));

    let expiryDisplay = formatDate(item.expirationDate);
    let expiryIcon = '';

    if (daysUntilExpiry < 0) {
      expiryDisplay = `<span class="expiry-danger"><i class="bi bi-exclamation-circle-fill" aria-hidden="true"></i>${expiryDisplay}</span>`;
    } else if (daysUntilExpiry <= 30) {
      expiryDisplay = `<span class="expiry-warning"><i class="bi bi-calendar-event" aria-hidden="true"></i>${expiryDisplay}</span>`;
    }

    // Calculate progress bar
    const maxQty = Math.max(item.reorderLevel * 3, item.quantity);
    const percentage = (item.quantity / maxQty) * 100;
    let barClass = 'good';
    if (item.quantity === 0) barClass = 'critical';
    else if (item.quantity <= item.reorderLevel) barClass = 'low';

    return `
      <tr>
        <td>${index + 1}</td>
        <td>
          <div class="item-name-cell">
            <div class="category-icon ${getCategoryClass(item.category)}" aria-hidden="true">
              <i class="bi ${getCategoryIcon(item.category)}"></i>
            </div>
            <span class="item-name">${item.name}</span>
          </div>
        </td>
        <td>${item.category}</td>
        <td>
          <div class="quantity-cell">
            <div class="qty-display">${item.quantity} ${item.unit}</div>
            <div class="qty-bar">
              <div class="qty-bar-fill ${barClass}" style="width: ${Math.min(percentage, 100)}%"></div>
            </div>
          </div>
        </td>
        <td class="reorder-level">${item.reorderLevel} ${item.unit}</td>
        <td>${expiryDisplay}</td>
        <td>${item.supplier}</td>
        <td>${item.lastUpdated}</td>
        <td>
          <span class="status-badge status-${statusClass}">${status}</span>
        </td>
        <td>
          <div class="actions-cell">
            <button
              type="button"
              class="btn-action"
              title="Quick update"
              data-action="quick-update"
              data-id="${item.id}"
              data-name="${escapeAttr(item.name)}"
              data-qty="${item.quantity}"
              data-unit="${escapeAttr(item.unit)}"
            >
              <i class="bi bi-plus-square" aria-hidden="true"></i>
            </button>
            <button
              type="button"
              class="btn-action"
              title="Edit"
              onclick="window.location.href='inventory-edit.html?id=${item.id}'"
            >
              <i class="bi bi-pencil" aria-hidden="true"></i>
            </button>
            <button
              type="button"
              class="btn-action btn-action-archive"
              title="Archive"
              data-action="archive"
              data-id="${item.id}"
              data-name="${escapeAttr(item.name)}"
            >
              <i class="bi bi-archive" aria-hidden="true"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// Load and display inventory
function loadInventory() {
  const items = getInventoryItems();
  const activeItems = items.filter(item => !item.archived);
  updateStats(activeItems);
  updateLowStockAlert(activeItems);
  updateArchivedSummary(items);
  renderTable(activeItems);
}

// Filter and sort logic
function applyFiltersAndSort() {
  const items = getInventoryItems().filter(item => !item.archived);
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  const categoryFilter = document.getElementById('categoryFilter').value;
  const statusFilter = document.getElementById('statusFilter').value;
  const sortBy = document.getElementById('sortBy').value;

  let filtered = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm) ||
                         item.supplier.toLowerCase().includes(searchTerm);
    const matchesCategory = !categoryFilter || item.category === categoryFilter;
    const matchesStatus = !statusFilter || getItemStatus(item.quantity, item.reorderLevel, item.expirationDate) === statusFilter;
    const isNotArchived = !item.archived;

    return matchesSearch && matchesCategory && matchesStatus && isNotArchived;
  });

  // Sort
  sorted = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      case 'qty-asc':
        return a.quantity - b.quantity;
      case 'qty-desc':
        return b.quantity - a.quantity;
      case 'expiry-asc':
        return new Date(a.expirationDate) - new Date(b.expirationDate);
      default:
        return 0;
    }
  });

  renderTable(sorted);
}

// Quick Update Modal
let currentItemId = null;

function openQuickUpdate(itemId, itemName, currentQty, unit) {
  currentItemId = itemId;
  document.getElementById('modalItemName').textContent = itemName;
  document.getElementById('modalCurrentQty').textContent = currentQty + ' ' + unit;
  document.getElementById('modalUnit').textContent = unit;
  document.getElementById('modalNewQty').value = '';
  document.getElementById('quickUpdateModal').classList.remove('is-hidden');
  document.getElementById('quickUpdateModal').setAttribute('aria-hidden', 'false');
  document.getElementById('modalNewQty').focus();
}

function closeQuickUpdate() {
  document.getElementById('quickUpdateModal').classList.add('is-hidden');
  document.getElementById('quickUpdateModal').setAttribute('aria-hidden', 'true');
  currentItemId = null;
}

function saveQuickUpdate() {
  const newQty = parseInt(document.getElementById('modalNewQty').value);

  if (isNaN(newQty) || newQty < 0) {
    alert('Please enter a valid quantity.');
    return;
  }

  let items = getInventoryItems();
  items = items.map(item => {
    if (item.id === currentItemId) {
      item.quantity = newQty;
      item.lastUpdated = new Date().toLocaleDateString('en-PH');
    }
    return item;
  });

  localStorage.setItem('inventoryItems', JSON.stringify(items));
  closeQuickUpdate();
  loadInventory();
  applyFiltersAndSort();
  showToast('Stock updated successfully!');
}

// Archive Modal
let itemToArchive = { id: null, name: '' };

function openArchiveModal(itemId, itemName) {
  itemToArchive = { id: itemId, name: itemName };
  document.getElementById('archiveItemName').textContent = itemName;
  document.getElementById('archiveModal').classList.remove('is-hidden');
  document.getElementById('archiveModal').setAttribute('aria-hidden', 'false');
}

function closeArchiveModal() {
  document.getElementById('archiveModal').classList.add('is-hidden');
  document.getElementById('archiveModal').setAttribute('aria-hidden', 'true');
  itemToArchive = { id: null, name: '' };
}

function showArchiveBanner(message) {
  const banner = document.getElementById('archive-banner');
  const messageNode = document.getElementById('archiveBannerMessage');
  if (!banner || !messageNode) {
    alert(message);
    return;
  }

  messageNode.innerHTML = `<strong>${message}</strong>`;
  banner.classList.remove('is-hidden');
  banner.style.display = 'flex';

  clearTimeout(window.archiveBannerTimeout);
  window.archiveBannerTimeout = setTimeout(() => {
    banner.classList.add('is-hidden');
  }, 4500);
}

function confirmArchive() {
  if (itemToArchive.id === null || itemToArchive.id === undefined) return;
  const archivedName = itemToArchive.name;

  let items = getInventoryItems();
  const idx = items.findIndex(item => item.id === itemToArchive.id);
  if (idx !== -1) {
    items[idx].archived = true;
    items[idx].archivedDate = new Date().toLocaleDateString('en-US');
  }
  localStorage.setItem('inventoryItems', JSON.stringify(items));

  closeArchiveModal();
  loadInventory();
  applyFiltersAndSort();
  const archiveMessage = `${archivedName} archived successfully.`;
  showArchiveBanner(archiveMessage);
  showToast('Item archived successfully!');
}

// Delete Modal
let itemToDelete = { id: null, name: '' };

function openDeleteModal(itemId, itemName) {
  itemToDelete = { id: itemId, name: itemName };
  document.getElementById('deleteItemName').textContent = itemName;
  document.getElementById('deleteModal').classList.remove('is-hidden');
  document.getElementById('deleteModal').setAttribute('aria-hidden', 'false');
}

function closeDeleteModal() {
  document.getElementById('deleteModal').classList.add('is-hidden');
  document.getElementById('deleteModal').setAttribute('aria-hidden', 'true');
  itemToDelete = { id: null, name: '' };
}

function confirmDelete() {
  if (!itemToDelete.id) return;

  let items = getInventoryItems();
  items = items.filter(item => item.id !== itemToDelete.id);
  localStorage.setItem('inventoryItems', JSON.stringify(items));

  closeDeleteModal();
  loadInventory();
  applyFiltersAndSort();
  showToast('Item deleted successfully!');
}

// Close modals on overlay click
document.addEventListener('DOMContentLoaded', function() {
  initializeInventory();
  loadInventory();

  document.getElementById('tableBody').addEventListener('click', function(e) {
    const button = e.target.closest('button[data-action]');
    if (!button) return;

    const action = button.dataset.action;
    const itemId = Number(button.dataset.id);
    const itemName = button.dataset.name || '';

    if (action === 'archive') {
      openArchiveModal(itemId, itemName);
    } else if (action === 'quick-update') {
      const qty = Number(button.dataset.qty);
      const unit = button.dataset.unit || '';
      openQuickUpdate(itemId, itemName, qty, unit);
    }
  });

  const viewArchiveBtn = document.getElementById('viewArchiveBtn');
  const closeArchivePanelBtn = document.getElementById('closeArchivePanel');

  if (viewArchiveBtn) {
    viewArchiveBtn.addEventListener('click', function() {
      document.getElementById('archivePanel').classList.remove('is-hidden');
    });
  }

  if (closeArchivePanelBtn) {
    closeArchivePanelBtn.addEventListener('click', function() {
      document.getElementById('archivePanel').classList.add('is-hidden');
    });
  }

  // Modal overlay clicks
  document.getElementById('quickUpdateModal').addEventListener('click', function(e) {
    if (e.target === this) closeQuickUpdate();
  });

  document.getElementById('deleteModal').addEventListener('click', function(e) {
    if (e.target === this) closeDeleteModal();
  });

  document.getElementById('archiveModal').addEventListener('click', function(e) {
    if (e.target === this) closeArchiveModal();
  });

  // Button clicks
  // document.getElementById('addNewItemBtn').addEventListener('click', function() {
  //   window.location.href = 'inventory-add.html';
  // });

  // document.getElementById('emptyStateAddBtn').addEventListener('click', function() {
  //   window.location.href = 'inventory-add.html';
  // });

  document.getElementById('cancelUpdateBtn').addEventListener('click', closeQuickUpdate);
  document.getElementById('saveUpdateBtn').addEventListener('click', saveQuickUpdate);

  document.getElementById('cancelDeleteBtn').addEventListener('click', closeDeleteModal);
  document.getElementById('confirmDeleteBtn').addEventListener('click', confirmDelete);

  document.getElementById('archiveCancelBtn').addEventListener('click', closeArchiveModal);
  document.getElementById('archiveConfirmBtn').addEventListener('click', confirmArchive);

  // Search and filter listeners
  document.getElementById('searchInput').addEventListener('input', applyFiltersAndSort);
  document.getElementById('categoryFilter').addEventListener('change', applyFiltersAndSort);
  document.getElementById('statusFilter').addEventListener('change', applyFiltersAndSort);
  document.getElementById('sortBy').addEventListener('change', applyFiltersAndSort);

  // Allow Enter key in quick update
  document.getElementById('modalNewQty').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') saveQuickUpdate();
  });
});
