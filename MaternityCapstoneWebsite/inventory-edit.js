// Toast notification
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

// Form state tracking
let formModified = false;
let currentItemId = null;

document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('itemForm');
  const cancelBtn = document.getElementById('cancelBtn');
  const cancelModal = document.getElementById('cancelModal');
  const keepEditingBtn = document.getElementById('keepEditingBtn');
  const discardBtn = document.getElementById('discardBtn');
  const dateAddedInput = document.getElementById('dateAdded');

  // Get item ID from URL
  const params = new URLSearchParams(window.location.search);
  const itemId = parseInt(params.get('id'));

  if (!itemId) {
    alert('Item ID not found.');
    window.location.href = 'inventory.html';
    return;
  }

  // Load item from localStorage
  const items = JSON.parse(localStorage.getItem('inventoryItems')) || [];
  const item = items.find(i => i.id === itemId);

  if (!item) {
    alert('Item not found.');
    window.location.href = 'inventory.html';
    return;
  }

  currentItemId = itemId;

  // Pre-fill form
  document.getElementById('itemName').value = item.name;
  document.getElementById('category').value = item.category;
  document.getElementById('quantity').value = item.quantity;
  document.getElementById('unit').value = item.unit;
  document.getElementById('reorderLevel').value = item.reorderLevel;
  document.getElementById('expirationDate').value = item.expirationDate;
  document.getElementById('supplier').value = item.supplier;
  document.getElementById('dateAdded').value = item.dateAdded;

  // Track form modifications
  form.addEventListener('input', function() {
    formModified = true;
  });

  form.addEventListener('change', function() {
    formModified = true;
  });

  // Cancel button
  cancelBtn.addEventListener('click', function() {
    if (formModified) {
      cancelModal.classList.remove('is-hidden');
      cancelModal.setAttribute('aria-hidden', 'false');
    } else {
      window.location.href = 'inventory.html';
    }
  });

  // Modal buttons
  keepEditingBtn.addEventListener('click', function() {
    cancelModal.classList.add('is-hidden');
    cancelModal.setAttribute('aria-hidden', 'true');
  });

  discardBtn.addEventListener('click', function() {
    window.location.href = 'inventory.html';
  });

  // Close modal on overlay click
  cancelModal.addEventListener('click', function(e) {
    if (e.target === this) {
      cancelModal.classList.add('is-hidden');
      cancelModal.setAttribute('aria-hidden', 'true');
    }
  });

  // Form submission
  form.addEventListener('submit', function(e) {
    e.preventDefault();

    // Clear previous errors
    document.querySelectorAll('.form-error').forEach(el => el.textContent = '');
    document.querySelectorAll('.form-input, .form-select').forEach(el => el.classList.remove('error'));

    // Validate form
    let isValid = true;

    const itemName = document.getElementById('itemName').value.trim();
    if (!itemName) {
      document.getElementById('itemNameError').textContent = 'Item name is required';
      document.getElementById('itemName').classList.add('error');
      isValid = false;
    }

    const category = document.getElementById('category').value;
    if (!category) {
      document.getElementById('categoryError').textContent = 'Category is required';
      document.getElementById('category').classList.add('error');
      isValid = false;
    }

    const quantity = document.getElementById('quantity').value;
    if (!quantity || quantity < 0 || isNaN(quantity)) {
      document.getElementById('quantityError').textContent = 'Please enter a valid quantity';
      document.getElementById('quantity').classList.add('error');
      isValid = false;
    }

    const unit = document.getElementById('unit').value;
    if (!unit) {
      document.getElementById('unitError').textContent = 'Unit is required';
      document.getElementById('unit').classList.add('error');
      isValid = false;
    }

    const reorderLevel = document.getElementById('reorderLevel').value;
    if (!reorderLevel || reorderLevel < 0 || isNaN(reorderLevel)) {
      document.getElementById('reorderLevelError').textContent = 'Please enter a valid reorder level';
      document.getElementById('reorderLevel').classList.add('error');
      isValid = false;
    } else if (parseInt(reorderLevel) > parseInt(quantity)) {
      document.getElementById('reorderLevelError').textContent = 'Reorder level cannot be higher than quantity';
      document.getElementById('reorderLevel').classList.add('error');
      isValid = false;
    }

    const expirationDate = document.getElementById('expirationDate').value;
    if (!expirationDate) {
      document.getElementById('expirationDateError').textContent = 'Expiration date is required';
      document.getElementById('expirationDate').classList.add('error');
      isValid = false;
    } else {
      const expDate = new Date(expirationDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (expDate < today) {
        document.getElementById('expirationDateError').textContent = 'Expiration date cannot be in the past';
        document.getElementById('expirationDate').classList.add('error');
        isValid = false;
      }
    }

    if (!isValid) {
      return;
    }

    // Update in localStorage
    let allItems = JSON.parse(localStorage.getItem('inventoryItems')) || [];
    allItems = allItems.map(i => {
      if (i.id === currentItemId) {
        return {
          id: i.id,
          name: itemName,
          category: category,
          quantity: parseInt(quantity),
          unit: unit,
          reorderLevel: parseInt(reorderLevel),
          expirationDate: expirationDate,
          supplier: document.getElementById('supplier').value.trim() || '',
          dateAdded: i.dateAdded,
          lastUpdated: new Date().toLocaleDateString('en-PH')
        };
      }
      return i;
    });

    localStorage.setItem('inventoryItems', JSON.stringify(allItems));

    formModified = false;
    showToast('Item updated successfully!');

    // Redirect after a short delay
    setTimeout(() => {
      window.location.href = 'inventory.html';
    }, 1500);
  });
});
