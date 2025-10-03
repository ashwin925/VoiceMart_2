// Utility functions for the application
export function formatPrice(price) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(price);
}

export function validateImageUrl(url) {
  try {
    new URL(url);
    return url.match(/\.(jpeg|jpg|gif|png|webp)$/) != null;
  } catch {
    return false;
  }
}

export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}