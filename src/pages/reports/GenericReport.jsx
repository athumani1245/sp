import React from 'react';
import Layout from '../../components/Layout';
import { useNavigate } from 'react-router-dom';

const GenericReport = ({ title, icon, description }) => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="main-content">
        <div className="leases-filters-section">
          <div className="row g-3 align-items-center">
            <div className="col-8">
              <h4 className="mb-1">
                <i className={`bi ${icon} me-2`}></i>
                {title}
              </h4>
            </div>
            <div className="col-4">
              <div className="d-flex justify-content-end">
                <button
                  className="odoo-btn odoo-btn-secondary odoo-btn-sm"
                  onClick={() => navigate("/dashboard")}
                >
                  <i className="bi bi-arrow-left me-1"></i>
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="leases-filters-section">
          <div className="text-center py-5">
            <i className={`bi ${icon} display-4 text-muted`}></i>
            <h5 className="text-muted mt-3">{title}</h5>
            <p className="text-muted">{description}</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default GenericReport;