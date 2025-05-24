import React, { useState } from 'react';

interface SearchAndFilterProps {
  onSearch: (term: string) => void;
  onFilterPrice: (min: number, max: number) => void;
  onSortChange: (sortOption: string) => void;
  onClear: () => void;
}

const SearchAndFilter: React.FC<SearchAndFilterProps> = ({ 
  onSearch, 
  onFilterPrice, 
  onSortChange,
  onClear
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('default');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const handlePriceFilter = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterPrice(
      minPrice ? Number(minPrice) : 0,
      maxPrice ? Number(maxPrice) : Infinity
    );
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSortBy(value);
    onSortChange(value);
  };

  const handleClear = () => {
    setSearchTerm('');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('default');
    onClear();
  };

  return (
    <div className="card mb-4">
      <div className="card-body">
        <h5 className="card-title">Поиск и фильтрация</h5>
        
        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-3">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Поиск товаров..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">
              <i className="bi bi-search"></i> Поиск
            </button>
          </div>
        </form>
        
        <div className="row">
          {/* Price Filter */}
          <div className="col-md-6">
            <h6>Цена</h6>
            <form onSubmit={handlePriceFilter} className="mb-3">
              <div className="input-group mb-2">
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
              <div className="input-group mb-2">
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
              <button type="submit" className="btn btn-outline-primary btn-sm">
                Применить
              </button>
            </form>
          </div>
          
          {/* Sorting */}
          <div className="col-md-6">
            <h6>Сортировка</h6>
            <select 
              className="form-select mb-3" 
              value={sortBy} 
              onChange={handleSortChange}
            >
              <option value="default">По умолчанию</option>
              <option value="priceAsc">Цена (по возрастанию)</option>
              <option value="priceDesc">Цена (по убыванию)</option>
              <option value="nameAsc">Название (А-Я)</option>
              <option value="nameDesc">Название (Я-А)</option>
            </select>
          </div>
        </div>
        
        {/* Clear All Filters */}
        <div className="text-end">
          <button 
            className="btn btn-outline-secondary btn-sm" 
            onClick={handleClear}
          >
            Сбросить все фильтры
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchAndFilter; 