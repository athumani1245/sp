import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import AddPropertyModal from "../../components/forms/AddProperty";
import SubscriptionGate from "../../components/SubscriptionGate";
import TableSkeleton from "../../components/skeletons/TableSkeleton";
import PropertyCardSkeleton from "../../components/skeletons/PropertyCardSkeleton";
import { getProperties } from "../../services/propertyService";
import { usePageTitle } from "../../hooks/usePageTitle";
import "../../assets/styles/properties.css";

function Properties() {
  usePageTitle('Properties');
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
    // Add the new property to the existing list
    setProperties((prev) => [...prev, newProperty]);
    setShowModal(false);
    // Optionally refresh the list
    fetchProperties();
  };

  const fetchProperties = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const result = await getProperties({
        search: search || undefined,
        page,
        limit: 50,
      });

      if (result.success) {
        setProperties(result.data?.items || []);
        setPagination({
          current_page: result.data?.current_page || 1,
          total_pages: result.data?.total_pages || 1,
          count: result.data?.count || 0,
          next: result.data?.next,
          previous: result.data?.previous
        });
      } else {
        setError(result.error || "Failed to fetch properties");
        setProperties([]);
      }
    } catch (error) {
      setError("Failed to fetch properties");
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  return (
    <Layout>
      <div className="main-content">
        {/* Filters Section */}
        <div className="properties-filters-section mb-3">
          <div className="d-flex flex-column flex-md-row gap-3 align-items-md-center">
            <div className="flex-fill">
              <div className="input-group" style={{ maxWidth: '100%' }}>
                <span className="input-group-text bg-white" tabIndex="-1" style={{ outline: 'none' }}>
                  <i className="bi bi-search" />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search properties..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ outline: 'none' }}
                />
              </div>
            </div>
            <div className="flex-shrink-0">
              <SubscriptionGate feature="adding new properties">
                <button
                  className="odoo-btn odoo-btn-primary d-flex align-items-center"
                  onClick={() => setShowModal(true)}
                  type="button"
                  style={{ minWidth: '180px' }}
                >
                  <i className="fa fa-cube me-2" /> Add New Property
                </button>
              </SubscriptionGate>
            </div>
          </div>
          {tag && (
            <div className="mt-2">
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
          )}
         
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
              {(properties.length > 0 || pagination.count > 0) && (
                <span className="badge bg-primary ms-2">{pagination.count || properties.length}</span>
              )}
            </h5>
          </div>
          
          {loading && (
            <>
              {/* Desktop Table Skeleton */}
              <div className="d-none d-md-block">
                <TableSkeleton rows={5} columns={4} />
              </div>
              {/* Mobile Card Skeleton */}
              <div className="d-md-none">
                <PropertyCardSkeleton count={3} />
              </div>
            </>
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
                  className="odoo-btn odoo-btn-primary odoo-btn-lg"
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
                      <th style={{ width: '30%' }}>Address</th>
                      <th style={{ width: '15%' }}>Property Type</th>
                      <th style={{ width: '15%' }}>Units</th>
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
                        <td>
                          <div className="d-flex align-items-center">
                            <i className="bi bi-door-open me-2 text-muted"></i>
                            <span className="fw-semibold">
                              {property.units_count || property.total_units || 0} units
                            </span>
                          </div>
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
                        
                        <div className="property-list-row">
                          <div className="property-list-label">
                            <i className="bi bi-door-open me-1"></i>Units
                          </div>
                          <div className="property-list-value">
                            <span className="fw-semibold">
                              {property.units_count || property.total_units || 0} units
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Pagination */}
          {pagination && pagination.total_pages > 1 && (
            <div className="properties-pagination-section">
              <nav aria-label="Properties pagination">
                <div className="d-flex justify-content-between align-items-center">
                  <button
                    className="odoo-btn odoo-btn-secondary"
                    disabled={(pagination.current_page || page) <= 1}
                    onClick={() => handlePageChange((pagination.current_page || page) - 1)}
                  >
                    <i className="bi bi-chevron-left me-1"></i>
                    Prev
                  </button>

                  <div className="pagination-info">
                    <span className="text-muted">
                      Page {pagination.current_page || page} of {pagination.total_pages || 1}
                    </span>
                  </div>

                  <button
                    className="odoo-btn odoo-btn-secondary"
                    disabled={(pagination.current_page || page) >= (pagination.total_pages || 1)}
                    onClick={() => handlePageChange((pagination.current_page || page) + 1)}
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
