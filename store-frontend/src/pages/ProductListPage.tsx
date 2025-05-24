import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ProductService, { Product } from '../services/ProductService';
import CartService from '../services/CartService';

const ProductListPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [error, setError] = useState<string>('');
  
  // Сортировка и фильтр по цене
  const [sortOption, setSortOption] = useState<string>('default');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [showFilters, setShowFilters] = useState<boolean>(false);

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);
  
  // Применяем фильтры и сортировку при изменении базовых продуктов или параметров
  useEffect(() => {
    applyFiltersAndSort();
  }, [products, selectedCategory, sortOption, minPrice, maxPrice]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await ProductService.getProducts();
      setProducts(data);
      setFilteredProducts(data);
      setError('');
    } catch (err) {
      console.error('Ошибка загрузки товаров:', err);
      setError('Не удалось загрузить товары. Пожалуйста, попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await ProductService.getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Ошибка загрузки категорий:', err);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim() && !selectedCategory && !minPrice && !maxPrice && sortOption === 'default') {
      loadProducts();
      return;
    }

    setLoading(true);
    try {
      const searchResults = await ProductService.searchProducts(searchTerm);
      setProducts(searchResults);
      setError('');
    } catch (err) {
      console.error('Ошибка поиска товаров:', err);
      setError('Не удалось выполнить поиск. Пожалуйста, попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category === selectedCategory ? '' : category);
  };

  const handleAddToCart = (product: Product) => {
    try {
      CartService.addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image
      }, 1);
      alert(`Товар "${product.name}" добавлен в корзину!`);
    } catch (error) {
      console.error('Ошибка при добавлении товара в корзину:', error);
      alert('Не удалось добавить товар в корзину');
    }
  };
  
  // Применить фильтры и сортировку
  const applyFiltersAndSort = () => {
    let result = [...products];
    
    // Фильтр по категории
    if (selectedCategory) {
      result = result.filter(product => product.category === selectedCategory);
    }
    
    // Фильтр по цене
    if (minPrice) {
      result = result.filter(product => product.price >= Number(minPrice));
    }
    
    if (maxPrice) {
      result = result.filter(product => product.price <= Number(maxPrice));
    }
    
    // Сортировка
    switch (sortOption) {
      case 'priceAsc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'priceDesc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'nameAsc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'nameDesc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        // Без сортировки
        break;
    }
    
    setFilteredProducts(result);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setMinPrice('');
    setMaxPrice('');
    setSortOption('default');
    loadProducts();
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="container mt-4 text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Загрузка...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container mt-4">
        <h1 className="mb-4">Каталог товаров</h1>
        
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        
        {/* Поиск и кнопка фильтров */}
        <div className="row mb-4">
          <div className="col-md-8">
            <form onSubmit={handleSearch} className="d-flex">
              <input 
                type="text" 
                className="form-control me-2" 
                placeholder="Поиск товаров..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button type="submit" className="btn btn-primary">Найти</button>
              <button 
                type="button" 
                className="btn btn-outline-secondary ms-2"
                onClick={() => setShowFilters(!showFilters)}
              >
                {showFilters ? 'Скрыть фильтры' : 'Показать фильтры'}
              </button>
            </form>
          </div>
          <div className="col-md-4 text-end">
            <button 
              className="btn btn-outline-secondary"
              onClick={resetFilters}
              disabled={!searchTerm && !selectedCategory && !minPrice && !maxPrice && sortOption === 'default'}
            >
              Сбросить все фильтры
            </button>
          </div>
        </div>
        
        {/* Блок расширенных фильтров */}
        {showFilters && (
          <div className="card mb-4">
            <div className="card-body">
              <div className="row">
                {/* Фильтр по цене */}
                <div className="col-md-6">
                  <h6>Цена</h6>
                  <div className="d-flex mb-2">
                    <div className="input-group me-2">
                      <span className="input-group-text">От $</span>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Мин"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        min="0"
                      />
                    </div>
                    <div className="input-group">
                      <span className="input-group-text">До $</span>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Макс"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        min="0"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Сортировка */}
                <div className="col-md-6">
                  <h6>Сортировка</h6>
                  <select 
                    className="form-select" 
                    value={sortOption} 
                    onChange={(e) => setSortOption(e.target.value)}
                  >
                    <option value="default">По умолчанию</option>
                    <option value="priceAsc">Цена (по возрастанию)</option>
                    <option value="priceDesc">Цена (по убыванию)</option>
                    <option value="nameAsc">Название (А-Я)</option>
                    <option value="nameDesc">Название (Я-А)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Категории */}
        {categories.length > 0 && (
          <div className="mb-4">
            <h5>Категории:</h5>
            <div className="d-flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category}
                  className={`btn ${selectedCategory === category ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => handleCategoryChange(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {filteredProducts.length === 0 ? (
          <div className="alert alert-info">
            Товары не найдены. Попробуйте изменить параметры поиска.
          </div>
        ) : (
          <div className="row row-cols-1 row-cols-md-3 g-4">
            {filteredProducts.map(product => (
              <div className="col" key={product.id}>
                <div className="card h-100">
                  <img 
                    src={product.image} 
                    className="card-img-top" 
                    alt={product.name}
                    style={{ height: '200px', objectFit: 'cover' }}
                  />
                  <div className="card-body">
                    <h5 className="card-title">{product.name}</h5>
                    <p className="card-text text-truncate">{product.description}</p>
                    <p className="card-text">
                      <small className="text-muted">{product.category}</small>
                    </p>
                    <p className="card-text fw-bold">${product.price.toFixed(2)}</p>
                    <div className="d-flex justify-content-between">
                      <Link to={`/products/${product.id}`} className="btn btn-outline-primary">
                        Подробнее
                      </Link>
                      <button 
                        className="btn btn-primary"
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock <= 0}
                      >
                        {product.stock > 0 ? 'В корзину' : 'Нет в наличии'}
                      </button>
                    </div>
                  </div>
                  <div className="card-footer">
                    <small className="text-muted">
                      В наличии: {product.stock} шт.
                    </small>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductListPage; 