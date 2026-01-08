/**
 * Property Page - Refactored Version
 * Uses custom hooks and modular components for better maintainability
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Modal, Button } from 'react-bootstrap';
import Layout from '../../components/Layout';
import DetailsSkeleton from '../../components/skeletons/DetailsSkeleton';
import PropertyHeader from '../../features/properties/components/PropertyHeader';
import UnitsSection from '../../features/properties/components/UnitsSection';
import { usePropertyDetails } from '../../features/properties/hooks/usePropertyDetails';
import { usePropertyUnits } from '../../features/properties/hooks/usePropertyUnits';
import { usePropertyEdit } from '../../features/properties/hooks/usePropertyEdit';
import { useSubscription } from '../../hooks/useSubscription';
import { usePageTitle } from '../../hooks/usePageTitle';
import { useNotification } from '../../shared/hooks';
import '../../assets/styles/leases.css';

function Property() {
  usePageTitle('Property Details');
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const { hasActiveSubscription } = useSubscription();
  const { showSuccess, showError: showErrorToast } = useNotification();
  
  // Use custom hooks for data management
  const { property, loading, error, refreshProperty } = usePropertyDetails(propertyId);
  
  const {
    units,
    unitsLoading,
    pagination,
    currentPage,
    isAddingUnit,
    editingUnitId,
    newUnitData,
    editUnitData,
    addingUnitLoading,
    updatingUnit,
    fetchUnits,
    handleAddUnit,
    handleCancelAddUnit,
    handleNewUnitChange,
    handleSaveNewUnit,
    handleEditUnit,
    handleCancelEditUnit,
    handleEditUnitChange,
    handleSaveEditUnit,
    handleDeleteUnit: initiateDeleteUnit,
    handlePageChange,
  } = usePropertyUnits(propertyId);

  const {
    isEditing,
    editData,
    updateLoading,
    regions,
    districts,
    wards,
    selectedRegionId,
    selectedDistrictId,
    selectedWardId,
    locationLoading,
    propertyManagers,
    selectedManagerId,
    handleInputChange,
    handleRegionChange,
    handleDistrictChange,
    handleWardChange,
    handleManagerChange,
    startEdit,
    cancelEdit,
    saveEdit,
  } = usePropertyEdit(property, propertyId);

  // Local UI state
  const [activeTab, setActiveTab] = useState('units');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [unitToDelete, setUnitToDelete] = useState(null);
  const [deletingUnit, setDeletingUnit] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorModalMessage, setErrorModalMessage] = useState('');

  // Handle property save
  const handleSave = async () => {
    const result = await saveEdit();
    
    if (result.success) {
      showSuccess(result.message);
      await refreshProperty();
    } else {
      showErrorToast(result.error);
      if (result.error.includes('Session expired')) {
        navigate('/');
      }
    }
  };

  // Handle delete unit
  const handleDeleteUnitClick = (unitId) => {
    setUnitToDelete(unitId);
    setShowDeleteModal(true);
  };

  const confirmDeleteUnit = async () => {
    if (!unitToDelete) return;
    
    try {
      setDeletingUnit(true);
      const result = await initiateDeleteUnit(unitToDelete);
      
      if (result?.success === false) {
        setErrorModalMessage('Cannot delete unit because it has an active lease.');
        setShowErrorModal(true);
      } else {
        showSuccess('Unit deleted successfully');
      }
      
      setShowDeleteModal(false);
      setUnitToDelete(null);
    } catch (error) {
      showErrorToast('Failed to delete unit');
      setShowDeleteModal(false);
      setUnitToDelete(null);
    } finally {
      setDeletingUnit(false);
    }
  };

  const cancelDeleteUnit = () => {
    setShowDeleteModal(false);
    setUnitToDelete(null);
  };

  const closeErrorModal = () => {
    setShowErrorModal(false);
    setErrorModalMessage('');
  };

  // Load units when tab switches
  useEffect(() => {
    if (activeTab === 'units' && propertyId) {
      fetchUnits(currentPage);
    }
  }, [activeTab, propertyId]);

  if (loading) {
    return (
      <Layout>
        <div className="main-content">
          <DetailsSkeleton />
        </div>
      </Layout>
    );
  }

  if (error && !property) {
    return (
      <Layout>
        <div className="main-content">
          <div className="alert alert-danger" role="alert">
            <i className="bi bi-exclamation-triangle me-2"></i>
            <strong>Error:</strong> {error}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="main-content">
        {/* Back Button */}
        <div className="mb-3">
          <button
            className="odoo-btn odoo-btn-secondary odoo-btn-sm"
            onClick={() => navigate('/properties')}
          >
            <i className="bi bi-arrow-left me-1"></i>
            Back to Properties
          </button>
        </div>

        {/* Success/Error Messages */}
        {error && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
            <button
              type="button"
              className="btn-close"
              onClick={() => {}}
              aria-label="Close"
            ></button>
          </div>
        )}

        {/* Tabs */}
        <ul className="nav nav-tabs mb-4">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'details' ? 'active' : ''}`}
              onClick={() => setActiveTab('details')}
            >
              <i className="bi bi-info-circle me-2"></i>
              Details
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'units' ? 'active' : ''}`}
              onClick={() => setActiveTab('units')}
            >
              <i className="bi bi-door-open me-2"></i>
              Units ({pagination?.count || units.length})
            </button>
          </li>
        </ul>

        {/* Details Tab */}
        {activeTab === 'details' && property && (
          <PropertyHeader
            property={property}
            isEditing={isEditing}
            editData={editData}
            onInputChange={handleInputChange}
            onRegionChange={handleRegionChange}
            onDistrictChange={handleDistrictChange}
            onWardChange={handleWardChange}
            onManagerChange={handleManagerChange}
            selectedRegionId={selectedRegionId}
            selectedDistrictId={selectedDistrictId}
            selectedWardId={selectedWardId}
            selectedManagerId={selectedManagerId}
            regions={regions}
            districts={districts}
            wards={wards}
            propertyManagers={propertyManagers}
            locationLoading={locationLoading}
            onSave={handleSave}
            onCancel={cancelEdit}
            onEdit={startEdit}
            updateLoading={updateLoading}
            hasActiveSubscription={hasActiveSubscription}
          />
        )}

        {/* Units Tab */}
        {activeTab === 'units' && (
          <UnitsSection
            units={units}
            unitsLoading={unitsLoading}
            pagination={pagination}
            isAddingUnit={isAddingUnit}
            editingUnitId={editingUnitId}
            newUnitData={newUnitData}
            editUnitData={editUnitData}
            addingUnitLoading={addingUnitLoading}
            updatingUnit={updatingUnit}
            onAddUnit={handleAddUnit}
            onCancelAddUnit={handleCancelAddUnit}
            onNewUnitChange={handleNewUnitChange}
            onSaveNewUnit={handleSaveNewUnit}
            onEditUnit={handleEditUnit}
            onCancelEditUnit={handleCancelEditUnit}
            onEditUnitChange={handleEditUnitChange}
            onSaveEditUnit={handleSaveEditUnit}
            onDeleteUnit={handleDeleteUnitClick}
            onPageChange={handlePageChange}
            hasActiveSubscription={hasActiveSubscription}
          />
        )}

        {/* Delete Confirmation Modal */}
        <Modal show={showDeleteModal} onHide={cancelDeleteUnit} centered>
          <Modal.Header closeButton>
            <Modal.Title>Confirm Delete</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Are you sure you want to delete this unit? This action cannot be undone.</p>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={cancelDeleteUnit}
              disabled={deletingUnit}
              className="odoo-btn odoo-btn-secondary"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={confirmDeleteUnit}
              disabled={deletingUnit}
              className="odoo-btn odoo-btn-danger"
            >
              {deletingUnit ? 'Deleting...' : 'Delete Unit'}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Error Notification Modal */}
        <Modal show={showErrorModal} onHide={closeErrorModal} centered>
          <Modal.Header closeButton>
            <Modal.Title>
              <i className="bi bi-exclamation-triangle text-warning me-2"></i>
              Cannot Delete Unit
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>{errorModalMessage}</p>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="primary"
              onClick={closeErrorModal}
              className="odoo-btn odoo-btn-primary"
            >
              OK
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </Layout>
  );
}

export default Property;
