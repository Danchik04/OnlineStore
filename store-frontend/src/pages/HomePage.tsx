import React from 'react';
import Navbar from '../components/Navbar';

const HomePage: React.FC = () => {
  return (
    <div>
      <Navbar />
      <div className="container mt-4">
        <h1>Welcome to Our Store</h1>
        <p>Browse our collection of products and find what you need.</p>
      </div>
    </div>
  );
};

export default HomePage; 