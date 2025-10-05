'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { categoriesAPI, productsAPI } from '@/lib/api';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [categoriesResponse, productsResponse] = await Promise.all([
        categoriesAPI.getAll(),
        productsAPI.getAll()
      ]);

      const categoriesData = categoriesResponse.data || [];
      const productsData = productsResponse.data || [];

      setCategories(categoriesData);

      // Group products by category
      const productsByCategory = {};
      productsData.forEach(product => {
        const categoryId = product.category?._id || product.category;
        if (!productsByCategory[categoryId]) {
          productsByCategory[categoryId] = [];
        }
        productsByCategory[categoryId].push(product);
      });
      
      setProducts(productsByCategory);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Error loading data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const validateCategory = (category) => {
    const newErrors = {};
    if (!category.name.trim()) {
      newErrors.name = 'Category name is required';
    } else if (category.name.length > 30) {
      newErrors.name = 'Category name must be less than 30 characters';
    }
    if (category.description.length > 200) {
      newErrors.description = 'Description must be less than 200 characters';
    }
    return newErrors;
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    const newErrors = validateCategory(newCategory);
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await categoriesAPI.create(newCategory);
      setIsCreateModalOpen(false);
      setNewCategory({ name: '', description: '' });
      setErrors({});
      fetchData(); // Refresh data
      alert('Category created successfully!');
    } catch (error) {
      console.error('Error creating category:', error);
      alert('Error creating category. Please try again.');
    }
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    const newErrors = validateCategory(editingCategory);
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await categoriesAPI.update(editingCategory._id, {
        name: editingCategory.name,
        description: editingCategory.description
      });
      setEditingCategory(null);
      setErrors({});
      fetchData(); // Refresh data
      alert('Category updated successfully!');
    } catch (error) {
      console.error('Error updating category:', error);
      alert('Error updating category. Please try again.');
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!confirm('Are you sure you want to delete this category? Products in this category will become uncategorized.')) {
      return;
    }

    try {
      await categoriesAPI.delete(categoryId);
      fetchData(); // Refresh data
      alert('Category deleted successfully!');
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Error deleting category. Please try again.');
    }
  };

  const getProductCount = (categoryId) => {
    return products[categoryId]?.length || 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 container-padding section-padding">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Categories</h1>
          <p className="text-gray-400 margin-top-sm">
            Manage product categories and organize your store
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white button-padding rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          + Add Category
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <div key={category._id} className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl card-padding border border-gray-700/50 hover-lift group">
            <div className="flex justify-between items-start margin-bottom">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors">
                  {category.name}
                </h3>
                {category.description && (
                  <p className="text-gray-400 margin-top-sm text-sm">
                    {category.description}
                  </p>
                )}
              </div>
              <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setEditingCategory(category)}
                  className="text-blue-400 hover:text-blue-300 transition-colors p-1"
                  title="Edit category"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDeleteCategory(category._id)}
                  className="text-red-400 hover:text-red-300 transition-colors p-1"
                  title="Delete category"
                >
                  🗑️
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center margin-top">
              <span className="text-sm text-gray-400">
                {getProductCount(category._id)} products
              </span>
              <Link
                href={`/admin/categories/${category._id}`}
                className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
              >
                View Products →
              </Link>
            </div>
          </div>
        ))}

        {categories.length === 0 && (
          <div className="col-span-full text-center py-12">
            <div className="text-6xl mb-4">📁</div>
            <h3 className="text-xl font-medium text-white margin-bottom-sm">No categories yet</h3>
            <p className="text-gray-400 margin-bottom">Create your first category to organize products</p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white button-padding rounded-lg font-medium transition-colors"
            >
              Create Category
            </button>
          </div>
        )}
      </div>

      {/* Create Category Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 container-padding backdrop-blur-sm animate-fadeIn">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 max-w-md w-full animate-scaleIn">
            <div className="modal-padding">
              <div className="flex justify-between items-center margin-bottom">
                <h2 className="text-2xl font-bold text-white">Create New Category</h2>
                <button
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setNewCategory({ name: '', description: '' });
                    setErrors({});
                  }}
                  className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleCreateCategory} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 margin-bottom-sm">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    className={`w-full button-padding bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.name ? 'border-red-500' : 'border-gray-600'
                    }`}
                    placeholder="Enter category name"
                  />
                  {errors.name && (
                    <p className="margin-top-sm text-sm text-red-500">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 margin-bottom-sm">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={newCategory.description}
                    onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                    className={`w-full button-padding bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.description ? 'border-red-500' : 'border-gray-600'
                    }`}
                    placeholder="Enter category description (optional)"
                  />
                  {errors.description && (
                    <p className="margin-top-sm text-sm text-red-500">{errors.description}</p>
                  )}
                </div>

                <div className="flex justify-end space-x-3 margin-top">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreateModalOpen(false);
                      setNewCategory({ name: '', description: '' });
                      setErrors({});
                    }}
                    className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Category
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {editingCategory && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 container-padding backdrop-blur-sm animate-fadeIn">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 max-w-md w-full animate-scaleIn">
            <div className="modal-padding">
              <div className="flex justify-between items-center margin-bottom">
                <h2 className="text-2xl font-bold text-white">Edit Category</h2>
                <button
                  onClick={() => {
                    setEditingCategory(null);
                    setErrors({});
                  }}
                  className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleUpdateCategory} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 margin-bottom-sm">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    value={editingCategory.name}
                    onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                    className={`w-full button-padding bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.name ? 'border-red-500' : 'border-gray-600'
                    }`}
                    placeholder="Enter category name"
                  />
                  {errors.name && (
                    <p className="margin-top-sm text-sm text-red-500">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 margin-bottom-sm">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={editingCategory.description}
                    onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                    className={`w-full button-padding bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.description ? 'border-red-500' : 'border-gray-600'
                    }`}
                    placeholder="Enter category description (optional)"
                  />
                  {errors.description && (
                    <p className="margin-top-sm text-sm text-red-500">{errors.description}</p>
                  )}
                </div>

                <div className="flex justify-end space-x-3 margin-top">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCategory(null);
                      setErrors({});
                    }}
                    className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Update Category
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}