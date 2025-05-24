import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import CartService from '../services/CartService';
import ProductService, { Product } from '../services/ProductService';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const productData = await ProductService.getProductById(Number(id));
        if (productData) {
          setProduct(productData);
          setError('');
        } else {
          setError('Товар не найден');
        }
      } catch (err) {
        console.error('Ошибка загрузки товара:', err);
        setError('Не удалось загрузить информацию о товаре');
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setQuantity(Number(e.target.value));
  };

  const addToCart = () => {
    if (product) {
      try {
        CartService.addToCart({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image
        }, quantity);
        
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 3000);
      } catch (error) {
        console.error('Ошибка при добавлении товара в корзину:', error);
        alert('Не удалось добавить товар в корзину');
      }
    }
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

  if (error || !product) {
    return (
      <div>
        <Navbar />
        <div className="container mt-4">
          <div className="alert alert-danger">
            {error || 'Товар не найден.'} <button className="btn btn-link" onClick={() => navigate('/products')}>Вернуться к товарам</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container mt-4">
        {addedToCart && (
          <div className="alert alert-success alert-dismissible fade show" role="alert">
            Товар добавлен в корзину!
            <button type="button" className="btn-close" onClick={() => setAddedToCart(false)}></button>
          </div>
        )}
        
        <div className="row">
          <div className="col-md-5">
            <img src={product.image} alt={product.name} className="img-fluid rounded" />
          </div>
          <div className="col-md-7">
            <h2>{product.name}</h2>
            <p className="fs-3 text-primary">${product.price.toFixed(2)}</p>
            <p>{product.description}</p>
            
            {product.category && (
              <p><strong>Категория:</strong> {product.category}</p>
            )}
            
            <p><strong>В наличии:</strong> {product.stock} шт.</p>
            
            <div className="mb-3">
              <label htmlFor="quantity" className="form-label">Количество</label>
              <select 
                id="quantity" 
                className="form-select w-25" 
                value={quantity} 
                onChange={handleQuantityChange}
                disabled={product.stock <= 0}
              >
                {Array.from({ length: Math.min(10, product.stock) }, (_, i) => i + 1).map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>
            
            <button 
              className="btn btn-primary btn-lg" 
              onClick={addToCart}
              disabled={product.stock <= 0}
            >
              {product.stock > 0 ? 'Добавить в корзину' : 'Нет в наличии'}
            </button>
            
            <button 
              className="btn btn-outline-secondary btn-lg ms-2" 
              onClick={() => navigate('/products')}
            >
              Назад к товарам
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage; 