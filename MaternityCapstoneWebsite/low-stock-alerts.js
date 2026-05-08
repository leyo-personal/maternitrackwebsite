// Toggle low stock stats card visibility with real inventory data
function toggleLowStockStats() {
  const statCard = document.getElementById("statLowStockCard");
  const statCount = document.getElementById("statLowStockCount");
  
  if (!statCard || !statCount) return;

  // Get real inventory data
  const items = JSON.parse(localStorage.getItem('inventoryItems')) || [];
  
  // Count low stock and out of stock items
  const lowCount = items.filter(item =>
    item.quantity <= item.reorderLevel || item.quantity === 0
  ).length;

  statCount.textContent = String(lowCount);

  if (lowCount > 0) {
    statCard.classList.remove("is-hidden");
  } else {
    statCard.classList.add("is-hidden");
  }
}

// Initialize low stock stats on page load
document.addEventListener('DOMContentLoaded', function() {
  toggleLowStockStats();

  // Watch for inventory changes
  window.addEventListener('storage', function(e) {
    if (e.key === 'inventoryItems') {
      toggleLowStockStats();
    }
  });
});
