import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Layout from "../../components/Layout";
import AddPropertyModal from "../../components/forms/AddProperty";
import { getProperties } from "../../services/propertyService";

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
      <style>
        {`
          .table-row-hover:hover {
            background-color: #f8f9fa !important;
            transition: background-color 0.2s ease;
          }
        `}
      </style>
      <div className="border p-4 bg-white">
        <div className="mb-3">
          <h3 className="fw-bold mb-1">Properties List</h3>
          <div className="text-muted mb-3" style={{ fontSize: "15px" }}>
            Lorem ipsum sit amet, consectetur adipiscing elit. Suspendisse
            varius enim in eros.
          </div>
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
        {error && <div className="alert alert-danger m-3">{error}</div>}
        <div className="table-responsive">
          {loading ? (
            <div className="text-center p-4">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading properties...</p>
            </div>
          ) : (
            <table className="table table-bordered align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Property Name</th>
                  <th>Address</th>
                  <th>Property Type</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {properties.length > 0 ? (
                  properties.map((property) => (
                    <tr 
                      key={property.id || property.property_name}
                      onClick={() => navigate(`/dashboard/properties/${property.id}`)}
                      style={{ cursor: 'pointer' }}
                      className="table-row-hover"
                    >
                      <td className="fw-semibold">
                        {property.property_name || property.name}
                      </td>
                      <td>
                        <div>
                          {property.address?.street && (
                            <div>{property.address.street}</div>
                          )}
                          <small className="text-muted">
                            {[
                              property.address?.ward_name,
                              property.address?.district_name,
                              property.address?.region_name,
                            ]
                              .filter(Boolean)
                              .join(", ")}
                          </small>
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-primary">
                          {property.property_type || "Residential"}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            property.status === "Active"
                              ? "bg-success"
                              : property.status === "Inactive"
                              ? "bg-danger"
                              : "bg-secondary"
                          }`}
                        >
                          {property.status || "Active"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-4">
                      <div className="text-muted">
                        <i className="fa fa-building fa-2x mb-2"></i>
                        <p>No properties found</p>
                        {search && (
                          <small>Try adjusting your search criteria</small>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>{" "}
        <div className="d-flex justify-content-between align-items-center mt-3">
          <button
            className="btn btn-light border"
            disabled={page === 1 || loading}
            onClick={() => setPage(page - 1)}
          >
            <i className="fa fa-chevron-left me-2" /> Previous
          </button>

          <nav aria-label="Page navigation">
            <ul className="pagination mb-0">
              {pagination.total_pages &&
                [...Array(Math.min(pagination.total_pages, 5))].map(
                  (_, index) => {
                    const pageNumber = index + 1;
                    return (
                      <li
                        key={pageNumber}
                        className={`page-item ${
                          page === pageNumber ? "active" : ""
                        }`}
                      >
                        <button
                          className="page-link"
                          onClick={() => setPage(pageNumber)}
                          disabled={loading}
                        >
                          {pageNumber}
                        </button>
                      </li>
                    );
                  }
                )}
              {pagination.total_pages > 5 && (
                <>
                  <li className="page-item disabled">
                    <span className="page-link">...</span>
                  </li>
                  <li className="page-item">
                    <button
                      className="page-link"
                      onClick={() => setPage(pagination.total_pages)}
                      disabled={loading}
                    >
                      {pagination.total_pages}
                    </button>
                  </li>
                </>
              )}
            </ul>
          </nav>

          <button
            className="btn btn-light border"
            disabled={page >= (pagination.total_pages || 1) || loading}
            onClick={() => setPage(page + 1)}
          >
            Next <i className="fa fa-chevron-right ms-2" />
          </button>
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
