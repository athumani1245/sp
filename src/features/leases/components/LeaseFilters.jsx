/**
 * LeaseFilters Component
 * Reusable filter panel for leases with search, status, property, unit, and tenant filters
 */

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getProperties } from '../../../services/propertyService';
import { getTenants } from '../../../services/tenantService';
import { LEASE_STATUS } from '../../../config/constants';

const LeaseFilters = ({ 
  filters, 
  onFilterChange, 
  onClearFilters, 
  showFilters,
  onToggleFilters,
  activeFilterCount 
}) => {
  const [properties, setProperties] = useState([]);
  const [units, setUnits] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loadingFilters, setLoadingFilters] = useState(false);

  // Fetch dropdown data on mount
  useEffect(() => {
    fetchFilterData();
  }, []);

  // Fetch units when property changes
  useEffect(() => {
    if (filters.propertyFilter) {
      const selectedProperty = properties.find(p => p.id === parseInt(filters.propertyFilter));
      if (selectedProperty?.units) {
        setUnits(selectedProperty.units);
      } else {
        setUnits([]);
      }
      // Clear unit filter if property changes
      if (filters.unitFilter) {
        onFilterChange('unitFilter', '');
      }
    } else {
      setUnits([]);
    }
  }, [filters.propertyFilter, properties]);

  const fetchFilterData = async () => {
    try {
      setLoadingFilters(true);
      
      // Fetch properties with units
      const propertiesResult = await getProperties({ limit: 1000 });
      if (propertiesResult.success) {
        const propertiesData = propertiesResult.data?.items || propertiesResult.data || [];
        setProperties(propertiesData);
      }

      // Fetch tenants
      const tenantsResult = await getTenants({ limit: 1000 });
      if (tenantsResult.success) {
        const tenantsData = tenantsResult.data?.items || tenantsResult.data || [];
        setTenants(tenantsData);
      }
    } catch (error) {
      console.error('Failed to fetch filter data:', error);
    } finally {
      setLoadingFilters(false);
    }
  };

  return (
    <>
      {/* Search Bar with Filter Button */}
      <div className="odoo-search-bar">
        <i className="bi bi-search"></i>
        
        <button 
          className="odoo-filter-btn"
          onClick={onToggleFilters}
          title="Toggle Filters"
        >
          <i className="bi bi-funnel"></i>
          {activeFilterCount > 0 && (
            <span className="filter-count-badge">{activeFilterCount}</span>
          )}
        </button>

        {/* Active Filters */}
        {activeFilterCount > 0 && (
          <div className="odoo-active-filters">
            {filters.status && (
              <span className="odoo-active-filter">
                Status: {filters.status}
                <i 
                  className="bi bi-x" 
                  onClick={() => onFilterChange('status', '')}
                ></i>
              </span>
            )}
            {filters.propertyFilter && (
              <span className="odoo-active-filter">
                Property
                <i 
                  className="bi bi-x" 
                  onClick={() => onFilterChange('propertyFilter', '')}
                ></i>
              </span>
            )}
            {filters.unitFilter && (
              <span className="odoo-active-filter">
                Unit
                <i 
                  className="bi bi-x" 
                  onClick={() => onFilterChange('unitFilter', '')}
                ></i>
              </span>
            )}
            {filters.tenantFilter && (
              <span className="odoo-active-filter">
                Tenant
                <i 
                  className="bi bi-x" 
                  onClick={() => onFilterChange('tenantFilter', '')}
                ></i>
              </span>
            )}
          </div>
        )}

        <input
          type="text"
          placeholder="Search leases..."
          value={filters.search}
          onChange={(e) => onFilterChange('search', e.target.value)}
          className="odoo-search-input"
        />
      </div>

      {/* Collapsible Filter Panel */}
      {showFilters && (
        <div className="odoo-filters-panel">
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label">Status</label>
              <select
                className="form-select form-select-sm"
                value={filters.status}
                onChange={(e) => onFilterChange('status', e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value={LEASE_STATUS.ACTIVE}>Active</option>
                <option value={LEASE_STATUS.DRAFT}>Draft</option>
                <option value={LEASE_STATUS.TERMINATED}>Terminated</option>
                <option value={LEASE_STATUS.EXPIRED}>Expired</option>
              </select>
            </div>

            <div className="col-md-3">
              <label className="form-label">Property</label>
              <select
                className="form-select form-select-sm"
                value={filters.propertyFilter}
                onChange={(e) => onFilterChange('propertyFilter', e.target.value)}
                disabled={loadingFilters}
              >
                <option value="">All Properties</option>
                {properties.map(property => (
                  <option key={property.id} value={property.id}>
                    {property.property_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-3">
              <label className="form-label">Unit</label>
              <select
                className="form-select form-select-sm"
                value={filters.unitFilter}
                onChange={(e) => onFilterChange('unitFilter', e.target.value)}
                disabled={!filters.propertyFilter || units.length === 0}
              >
                <option value="">All Units</option>
                {units.map(unit => (
                  <option key={unit.id} value={unit.id}>
                    {unit.unit_name || unit.unit_number}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-3">
              <label className="form-label">Tenant</label>
              <select
                className="form-select form-select-sm"
                value={filters.tenantFilter}
                onChange={(e) => onFilterChange('tenantFilter', e.target.value)}
                disabled={loadingFilters}
              >
                <option value="">All Tenants</option>
                {tenants.map(tenant => (
                  <option key={tenant.id} value={tenant.id}>
                    {tenant.first_name} {tenant.last_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {activeFilterCount > 0 && (
            <div className="mt-3">
              <button 
                className="btn btn-sm btn-outline-secondary"
                onClick={onClearFilters}
              >
                <i className="bi bi-x-circle me-1"></i>
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
};

LeaseFilters.propTypes = {
  filters: PropTypes.shape({
    search: PropTypes.string,
    status: PropTypes.string,
    propertyFilter: PropTypes.string,
    unitFilter: PropTypes.string,
    tenantFilter: PropTypes.string,
  }).isRequired,
  onFilterChange: PropTypes.func.isRequired,
  onClearFilters: PropTypes.func.isRequired,
  showFilters: PropTypes.bool.isRequired,
  onToggleFilters: PropTypes.func.isRequired,
  activeFilterCount: PropTypes.number.isRequired,
};

export default LeaseFilters;
