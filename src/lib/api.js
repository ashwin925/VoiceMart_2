const API_BASE_URL = '/api';

// Generic API request function
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

// Products API
export const productsAPI = {
  // Get all products
  getAll: (categoryId = null) => {
    const query = categoryId ? `?category=${categoryId}` : '';
    return apiRequest(`/products${query}`);
  },

  // Get single product
  getById: (id) => apiRequest(`/products/${id}`),

  // Create product
  create: (productData) => 
    apiRequest('/products', {
      method: 'POST',
      body: productData,
    }),

  // Update product
  update: (id, productData) =>
    apiRequest(`/products/${id}`, {
      method: 'PUT',
      body: productData,
    }),

  // Delete product
  delete: (id) =>
    apiRequest(`/products/${id}`, {
      method: 'DELETE',
    }),
};

// Categories API
export const categoriesAPI = {
  // Get all categories
  getAll: () => apiRequest('/categories'),

  // Create category
  create: (categoryData) =>
    apiRequest('/categories', {
      method: 'POST',
      body: categoryData,
    }),
};

// Cart API
export const cartAPI = {
  // Get user cart
  get: () => apiRequest('/cart'),

  // Add item to cart
  addItem: (productId, quantity = 1) =>
    apiRequest('/cart', {
      method: 'POST',
      body: { productId, quantity },
    }),

  // Update item quantity
  updateItem: (productId, quantity) =>
    apiRequest('/cart', {
      method: 'PUT',
      body: { productId, quantity },
    }),

  // Remove item from cart
  removeItem: (productId) =>
    apiRequest(`/cart/${productId}`, {
      method: 'DELETE',
    }),

  // Clear cart
  clear: () =>
    apiRequest('/cart', {
      method: 'DELETE',
    }),
};