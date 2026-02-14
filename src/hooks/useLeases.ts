import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getLeases,
  getLeaseById,
  createLease,
  updateLease,
  deleteLease,
  cancelLease,
  terminateLease,
  renewLease,
  getLeasePayments,
  cancelPayment,
  getLeaseReport,
} from '../services/leaseService';
import { message } from 'antd';

// Query Keys
export const leaseKeys = {
  all: ['leases'] as const,
  lists: () => [...leaseKeys.all, 'list'] as const,
  list: (params: any) => [...leaseKeys.lists(), params] as const,
  details: () => [...leaseKeys.all, 'detail'] as const,
  detail: (id: string) => [...leaseKeys.details(), id] as const,
  payments: (leaseId: string) => [...leaseKeys.detail(leaseId), 'payments'] as const,
  stats: () => [...leaseKeys.all, 'stats'] as const,
};

// Lease Hooks
export const useLeases = (params: any = {}) => {
  return useQuery({
    queryKey: leaseKeys.list(params),
    queryFn: () => getLeases(params),
  });
};

export const useLease = (leaseId: string | null) => {
  return useQuery({
    queryKey: leaseKeys.detail(leaseId || ''),
    queryFn: () => getLeaseById(leaseId!),
    enabled: !!leaseId,
  });
};

export const useLeasePayments = (leaseId: string | null, params: any = {}) => {
  return useQuery({
    queryKey: [...leaseKeys.payments(leaseId || ''), params],
    queryFn: () => getLeasePayments(leaseId!, params),
    enabled: !!leaseId,
  });
};

export const useLeaseReport = () => {
  return useQuery({
    queryKey: ['leaseReport'],
    queryFn: getLeaseReport,
  });
};

// Hook to fetch original lease (used for lease history/renewal chain)
export const useOriginalLease = (originalLeaseId: string | null | undefined) => {
  return useQuery({
    queryKey: leaseKeys.detail(originalLeaseId || ''),
    queryFn: () => getLeaseById(originalLeaseId!),
    enabled: !!originalLeaseId,
  });
};


// Lease Mutations
export const useCreateLease = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createLease,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leaseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: leaseKeys.stats() });
      message.success('Lease created successfully!');
    },
    onError: (error: any) => {
      let errorMsg = 'Failed to create lease';
      
      if (error.response?.data?.description) {
        const desc = error.response.data.description;
        // Check if description is an object (nested errors)
        if (typeof desc === 'object') {
          // Extract first error message from nested object
          const firstKey = Object.keys(desc)[0];
          const firstError = desc[firstKey];
          errorMsg = Array.isArray(firstError) ? firstError[0] : firstError;
        } else {
          errorMsg = desc;
        }
      } else if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      }
      
      message.error(errorMsg);
    },
  });
};

export const useUpdateLease = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateLease,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: leaseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: leaseKeys.detail(variables.leaseId) });
      queryClient.invalidateQueries({ queryKey: leaseKeys.stats() });
      message.success('Lease updated successfully!');
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.description || error.response?.data?.message || 'Failed to update lease';
      message.error(errorMsg);
    },
  });
};

export const useDeleteLease = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteLease,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leaseKeys.all });
      message.success('Lease deleted successfully!');
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.description || error.response?.data?.message || 'Failed to delete lease';
      message.error(errorMsg);
    },
  });
};

export const useCancelLease = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelLease,
    onSuccess: (data, leaseId) => {
      queryClient.invalidateQueries({ queryKey: leaseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: leaseKeys.detail(leaseId) });
      queryClient.invalidateQueries({ queryKey: leaseKeys.stats() });
      message.success('Lease cancelled successfully!');
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.description || error.response?.data?.message || 'Failed to cancel lease';
      message.error(errorMsg);
    },
  });
};

export const useTerminateLease = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: terminateLease,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: leaseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: leaseKeys.detail(variables.leaseId) });
      queryClient.invalidateQueries({ queryKey: leaseKeys.stats() });
      message.success('Lease terminated successfully!');
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.description || error.response?.data?.message || 'Failed to terminate lease';
      message.error(errorMsg);
    },
  });
};

export const useRenewLease = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: renewLease,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leaseKeys.all });
      message.success('Lease renewed successfully!');
    },
    onError: (error: any) => {
      let errorMsg = 'Failed to renew lease';
      
      if (error.response?.data?.description) {
        const desc = error.response.data.description;
        // Check if description is an object (nested errors)
        if (typeof desc === 'object') {
          // Extract first error message from nested object
          const firstKey = Object.keys(desc)[0];
          const firstError = desc[firstKey];
          errorMsg = Array.isArray(firstError) ? firstError[0] : firstError;
        } else {
          errorMsg = desc;
        }
      } else if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      }
      
      message.error(errorMsg);
    },
  });
};

export const useCancelPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leaseKeys.all });
      message.success('Payment cancelled successfully!');
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.description || error.response?.data?.message || 'Failed to cancel payment';
      message.error(errorMsg);
    },
  });
};
