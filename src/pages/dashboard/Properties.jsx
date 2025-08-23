import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Layout from "../../components/Layout";
import AddPropertyModal from "../../components/forms/AddProperty";
import { getProperties } from "../../services/propertyService";
import "../../assets/styles/properties.css";

function Properties() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [tag, setTag] = useState(false);
  const [page, setPage] = useState(1);
  const [properties, setProperties] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({});

  // Handle successful property addition
  const handlePropertyAdded = (newProperty) => {
    console.log("New property added:", newProperty);
    // Add the new property to the existing list
    setProperties((prev) => [...prev, newProperty]);
    setShowModal(false);
    // Optionally refresh the list
    fetchProperties();
  };

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError("");
      const result = await getProperties({
        search: search || undefined,
        page,
        limit: 50,
      });

      if (result.success) {
        setProperties(result.data || []);
        setPagination(result.pagination || {});
      } else {
        setError(result.error || "Failed to fetch properties");
        setProperties([]);
      }
    } catch (error) {
      console.error("Failed to fetch properties:", error);
      setError("Failed to fetch properties");
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [search, page]);

  return (
    <Layout>
      <div className="main-content">
        <div className="mb-3">
         
          <div className="d-flex flex-wrap align-items-center mb-2 gap-2">
            <div className="input-group" style={{ maxWidth: 300 }}>
              <span className="input-group-text bg-white border-end-0">
                <i className="fa fa-search" />
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ borderLeft: 0 }}
              />
            </div>
            <button
              className="btn btn-outline-secondary d-flex align-items-center"
              type="button"
            >
              <i className="fa fa-filter me-2" /> Filters
            </button>{" "}
            <div className="ms-auto">
              <button
                className="btn btn-dark d-flex align-items-center"
                onClick={() => setShowModal(true)}
                type="button"
              >
                <i className="fa fa-cube me-2" /> Add New Property
              </button>
            </div>
          </div>
          {tag && (
            <div className="mb-2">
              <span className="badge bg-light text-dark border me-2">
                Tag{" "}
                <span
                  style={{ cursor: "pointer" }}
                  onClick={() => setTag(false)}
                >
                  ×
                </span>
              </span>
            </div>
          )}{" "}
          <div className="text-end small text-muted mb-2">
            {pagination.total ? `Showing ${(page - 1) * (pagination.per_page || 50) + 1}–${Math.min(page * (pagination.per_page || 50),pagination.total)} of ${pagination.total}` : "Showing properties"}
          </div>
        </div>
        {error && (
          <div className="alert alert-danger" role="alert">
            <i className="bi bi-exclamation-triangle me-2"></i>
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Main Properties Section */}
        <div className="properties-full-width">
          <div className="properties-header-section">
            <h5 className="properties-title">
              <i className="bi bi-building me-2"></i>
              Properties
              {properties.length > 0 && (
                <span className="badge bg-primary ms-2">{properties.length}</span>
              )}
            </h5>
          </div>
          
          {loading && (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="text-muted mt-2">Loading properties...</p>
            </div>
          )}

          {!loading && properties.length === 0 && !error && (
            <div className="text-center py-5">
              <i className="bi bi-building text-muted" style={{ fontSize: "4rem" }}></i>
              <h4 className="text-muted mt-3 mb-3">No Properties Found</h4>
              <p className="text-muted mb-4">
                {search
                  ? "No properties match your current search. Try adjusting your search criteria."
                  : "No properties have been added yet. Start by creating your first property."}
              </p>
              {!search && (
                <button 
                  className="btn btn-primary btn-lg"
                  onClick={() => setShowModal(true)}
                >
                  <i className="bi bi-plus me-2"></i>
                  Create First Property
                </button>
              )}
            </div>
          )}

          {!loading && properties.length > 0 && (
            <>
              {/* Desktop Table View */}
              <div className="table-responsive d-none d-md-block">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: '20%' }}>Property Name</th>
                      <th style={{ width: '40%' }}>Address</th>
                      <th style={{ width: '20%' }}>Property Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {properties.map((property) => (
                      <tr 
                        key={property.id || property.property_name}
                        onClick={() => navigate(`/properties/${property.id}`)}
                        style={{ cursor: 'pointer' }}
                        className="table-row-hover"
                      >
                        <td>
                          <div className="property-info">
                            <span className="property-name">
                              {property.property_name || property.name}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="address-info">
                            <span className="street-address">
                              {property.address?.street || 'No street address'}
                            </span>
                            <span className="location-details">
                              {
                                property.address?.region_name
                               
                              }
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className="badge bg-secondary">
                            {property.property_type || "Residential"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Full-Width List View */}
              <div className="d-md-none">
                <div className="property-list-container">
                  {properties.map((property) => (
                    <div
                      key={property.id || property.property_name}
                      className="property-list-item"
                      onClick={() => navigate(`/properties/${property.id}`)}
                    >
                      <div className="property-list-header">
                        <div className="property-name-mobile">
                          {property.property_name || property.name}
                        </div>
                        <span className="badge bg-secondary">
                          {property.property_type || "Residential"}
                        </span>
                      </div>
                      
                      <div className="property-list-body">
                        <div className="property-list-row">
                          <div className="property-list-label">
                            <i className="bi bi-geo-alt me-1"></i>Address
                          </div>
                          <div className="property-list-value">
                            {property.address?.street || 'No street address'}
                          </div>
                        </div>
                        
                        {property.address?.region_name && (
                          <div className="property-list-row">
                            <div className="property-list-label">
                              <i className="bi bi-map me-1"></i>Region
                            </div>
                            <div className="property-list-value">
                              {property.address.region_name}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Pagination */}
          {pagination && pagination.total_pages > 1 && (
            <div className="card-footer">
              <nav aria-label="Properties pagination">
                <div className="d-flex justify-content-between align-items-center">
                  <button
                    className="btn btn-outline-secondary"
                    disabled={page === 1 || loading}
                    onClick={() => setPage(page - 1)}
                  >
                    <i className="bi bi-chevron-left me-1"></i>
                    Previous
                  </button>

                  <div className="pagination-info">
                    <span className="text-muted">
                      Page {page} of {pagination.total_pages || 1}
                    </span>
                  </div>

                  <button
                    className="btn btn-outline-secondary"
                    disabled={page >= (pagination.total_pages || 1) || loading}
                    onClick={() => setPage(page + 1)}
                  >
                    Next
                    <i className="bi bi-chevron-right ms-1"></i>
                  </button>
                </div>
              </nav>
            </div>
          )}
        </div>
      </div>
      {/* Add Property Modal */}
      <AddPropertyModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onPropertyAdded={handlePropertyAdded}
      />
    </Layout>
  );
}

export default Properties;
