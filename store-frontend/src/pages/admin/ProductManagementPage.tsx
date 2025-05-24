import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import ProductService, { Product } from '../../services/ProductService';
import UserService from '../../services/UserService';

const ProductManagementPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    image: '',
    category: '',
    stock: ''
  });
  const [error, setError] = useState('');

  // Check if user is admin
  const currentUser = UserService.getCurrentUser();
  const isAdmin = currentUser && ['admin', 'superuser'].includes(currentUser.role);

  useEffect(() => {
    if (!isAdmin) {
      window.location.href = '/forbidden';
      return;
    }
    
    loadProducts();
  }, [isAdmin]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const allProducts = await ProductService.getProducts();
      setProducts(allProducts);
    } catch (error) {
      console.error('Error loading products:', error);
      setError('Не удалось загрузить товары');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!searchTerm.trim()) {
        await loadProducts();
        return;
      }
      
      const searchResults = await ProductService.searchProducts(searchTerm);
      setProducts(searchResults);
    } catch (error) {
      console.error('Error searching products:', error);
      setError('Не удалось выполнить поиск');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      description: '',
      image: '',
      category: '',
      stock: ''
    });
    setError('');
  };

  const openAddModal = () => {
    resetForm();
    setEditingProduct(null);
    setShowAddModal(true);
  };

  const openEditModal = (product: Product) => {
    setFormData({
      name: product.name,
      price: product.price.toString(),
      description: product.description,
      image: product.image,
      category: product.category || '',
      stock: product.stock.toString()
    });
    setEditingProduct(product);
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // Validate form data
      if (!formData.name.trim()) throw new Error('Имя товара обязательно');
      if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) 
        throw new Error('Цена должна быть положительным числом');
      if (isNaN(parseInt(formData.stock)) || parseInt(formData.stock) < 0)
        throw new Error('Количество должно быть неотрицательным числом');
      
      const productData = {
        name: formData.name.trim(),
        price: parseFloat(formData.price),
        description: formData.description.trim(),
        image: formData.image.trim() || 'https://via.placeholder.com/150',
        category: formData.category.trim(),
        stock: parseInt(formData.stock)
      };

      if (editingProduct) {
        // Update existing product
        const updatedProduct = await ProductService.updateProduct(editingProduct.id, productData);
        if (updatedProduct) {
          // Обновляем список товаров с учетом изменений
          const updatedProducts = products.map(p => 
            p.id === updatedProduct.id ? updatedProduct : p
          );
          setProducts(updatedProducts);
          alert('Товар успешно обновлен!');
        } else {
          throw new Error('Не удалось обновить товар');
        }
      } else {
        // Create new product
        const newProduct = await ProductService.createProduct(productData);
        // Добавляем новый товар в список
        setProducts([...products, newProduct]);
        alert('Товар успешно добавлен!');
      }

      closeModal();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleDelete = async (productId: number) => {
    if (window.confirm('Вы уверены, что хотите удалить этот товар?')) {
      try {
        const isDeleted = await ProductService.deleteProduct(productId);
        if (isDeleted) {
          // Удаляем товар из списка
          const updatedProducts = products.filter(p => p.id !== productId);
          setProducts(updatedProducts);
          alert('Товар успешно удален!');
        } else {
          alert('Не удалось удалить товар');
        }
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Ошибка при удалении товара');
      }
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="container mt-4">
          <div className="d-flex justify-content-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Загрузка...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1>Управление товарами</h1>
          <button className="btn btn-primary" onClick={openAddModal}>
            <i className="bi bi-plus-circle me-1"></i> Добавить товар
          </button>
        </div>

        <div className="card mb-4">
          <div className="card-body">
            <form onSubmit={handleSearch} className="d-flex">
              <input 
                type="text" 
                className="form-control me-2" 
                placeholder="Поиск товаров..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button type="submit" className="btn btn-outline-primary">Поиск</button>
              {searchTerm && (
                <button 
                  type="button" 
                  className="btn btn-outline-secondary ms-2"
                  onClick={() => {
                    setSearchTerm('');
                    loadProducts();
                  }}
                >
                  Сбросить
                </button>
              )}
            </form>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover table-striped">
            <thead className="table-dark">
              <tr>
                <th scope="col">ID</th>
                <th scope="col">Фото</th>
                <th scope="col">Наименование</th>
                <th scope="col">Категория</th>
                <th scope="col">Цена</th>
                <th scope="col">В наличии</th>
                <th scope="col">Действия</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-4">
                    Товары не найдены
                  </td>
                </tr>
              ) : (
                products.map(product => (
                  <tr key={product.id}>
                    <td>{product.id}</td>
                    <td>
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        style={{ width: '50px', height: '50px', objectFit: 'cover' }} 
                        className="rounded"
                      />
                    </td>
                    <td>{product.name}</td>
                    <td>{product.category || 'Без категории'}</td>
                    <td>${product.price.toFixed(2)}</td>
                    <td>
                      <span className={`badge ${product.stock > 0 ? 'bg-success' : 'bg-danger'}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td>
                      <div className="btn-group">
                        <button 
                          className="btn btn-sm btn-outline-primary" 
                          onClick={() => openEditModal(product)}
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button 
                          className="btn btn-sm btn-outline-danger" 
                          onClick={() => handleDelete(product.id)}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Product Modal */}
      {showAddModal && (
        <>
          <div className="modal-backdrop show" style={{ opacity: 0.5 }}></div>
          <div className="modal show d-block" tabIndex={-1}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {editingProduct ? 'Редактировать товар' : 'Добавить новый товар'}
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={closeModal}
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body">
                  {error && <div className="alert alert-danger">{error}</div>}
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label htmlFor="name" className="form-label">Наименование *</label>
                      <input
                        type="text"
                        className="form-control"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label htmlFor="price" className="form-label">Цена *</label>
                        <div className="input-group">
                          <span className="input-group-text">$</span>
                          <input
                            type="number"
                            className="form-control"
                            id="price"
                            name="price"
                            value={formData.price}
                            onChange={handleInputChange}
                            step="0.01"
                            min="0.01"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="col-md-6">
                        <label htmlFor="stock" className="form-label">Количество *</label>
                        <input
                          type="number"
                          className="form-control"
                          id="stock"
                          name="stock"
                          value={formData.stock}
                          onChange={handleInputChange}
                          min="0"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="category" className="form-label">Категория</label>
                      <input
                        type="text"
                        className="form-control"
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        placeholder="Например: Электроника, Одежда и т.д."
                      />
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="description" className="form-label">Описание</label>
                      <textarea
                        className="form-control"
                        id="description"
                        name="description"
                        rows={3}
                        value={formData.description}
                        onChange={handleInputChange}
                      ></textarea>
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="image" className="form-label">URL изображения</label>
                      <input
                        type="text"
                        className="form-control"
                        id="image"
                        name="image"
                        value={formData.image}
                        onChange={handleInputChange}
                        placeholder="https://example.com/image.jpg"
                      />
                      <div className="form-text">Если оставить пустым, будет использовано изображение-заполнитель.</div>
                    </div>
                  
                    <div className="modal-footer px-0 pb-0">
                      <button 
                        type="button" 
                        className="btn btn-secondary" 
                        onClick={closeModal}
                      >
                        Отмена
                      </button>
                      <button 
                        type="submit" 
                        className="btn btn-primary"
                      >
                        {editingProduct ? 'Сохранить изменения' : 'Добавить товар'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProductManagementPage; 