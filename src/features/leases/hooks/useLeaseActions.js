/**
 * useLeaseActions Hook
 * Manages lease cancellation and renewal actions
 */

import { useState } from 'react';
import { cancelLease } from '../../../services/leaseService';

export const useLeaseActions = (refreshLease) => {
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [error, setError] = useState('');

  const handleCancelClick = () => {
    setShowCancelConfirmation(true);
  };

  const handleCancelConfirm = async (leaseId) => {
    setIsCancelling(true);
    setError('');
    
    try {
      const result = await cancelLease(leaseId);
      
      if (result.success) {
        setShowCancelConfirmation(false);
        if (refreshLease) await refreshLease();
        return { success: true };
      } else {
        setError(result.error || 'Failed to cancel lease');
        return { success: false, error: result.error };
      }
    } catch (error) {
      setError('Failed to cancel lease');
      return { success: false, error: 'Failed to cancel lease' };
    } finally {
      setIsCancelling(false);
    }
  };

  const handleCancelModalClose = () => {
    setShowCancelConfirmation(false);
    setError('');
  };

  const handleRenewClick = () => {
    setShowRenewModal(true);
  };

  const handleRenewModalClose = () => {
    setShowRenewModal(false);
  };

  return {
    isCancelling,
    showCancelConfirmation,
    showRenewModal,
    isGeneratingPDF,
    error,
    setError,
    setIsGeneratingPDF,
    handleCancelClick,
    handleCancelConfirm,
    handleCancelModalClose,
    handleRenewClick,
    handleRenewModalClose,
  };
};
