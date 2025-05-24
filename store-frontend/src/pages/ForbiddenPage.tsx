import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const ForbiddenPage: React.FC = () => {
  return (
    <div>
      <Navbar />
      <div className="container mt-4">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card text-center">
              <div className="card-body">
                <div className="py-5">
                  <i className="bi bi-shield-lock text-danger" style={{ fontSize: '5rem' }}></i>
                  <h1 className="mt-3">Доступ запрещен</h1>
                  <p className="lead">
                    У вас недостаточно прав для доступа к этой странице.
                  </p>
                  <div className="mt-4">
                    <Link to="/" className="btn btn-primary me-2">
                      <i className="bi bi-house-door me-1"></i> На главную
                    </Link>
                    <Link to="/dashboard" className="btn btn-outline-secondary">
                      <i className="bi bi-person me-1"></i> Личный кабинет
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForbiddenPage; 