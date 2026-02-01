import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getTenants,
  getAllTenants,
  getTenantById,
  createTenant,
  updateTenant,
  deleteTenant,
  getTenantLeases,
} from '../services/tenantService';
import { message } from 'antd';

// Query Keys
export const tenantKeys = {
  all: ['tenants'] as const,
  lists: () => [...tenantKeys.all, 'list'] as const,
  list: (params: any) => [...tenantKeys.lists(), params] as const,
  details: () => [...tenantKeys.all, 'detail'] as const,
  detail: (id: string) => [...tenantKeys.details(), id] as const,
  leases: (tenantId: string) => [...tenantKeys.detail(tenantId), 'leases'] as const,
};

// Tenant Hooks
export const useTenants = (params: any = {}) => {
  return useQuery({
    queryKey: tenantKeys.list(params),
    queryFn: () => getTenants(params),
  });
};

// Get all tenants without pagination (for dropdowns/selects)
export const useAllTenants = () => {
  return useQuery({
    queryKey: ['tenants', 'all'],
    queryFn: getAllTenants,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useTenant = (tenantId: string | null) => {
  return useQuery({
    queryKey: tenantKeys.detail(tenantId || ''),
    queryFn: () => getTenantById(tenantId!),
    enabled: !!tenantId,
  });
};

export const useTenantLeases = (tenantId: string | null, params: any = {}) => {
  return useQuery({
    queryKey: [...tenantKeys.leases(tenantId || ''), params],
    queryFn: () => getTenantLeases(tenantId!, params),
    enabled: !!tenantId,
  });
};

// Tenant Mutations
export const useCreateTenant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTenant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.lists() });
      message.success('Tenant created successfully!');
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.description || error.response?.data?.message || 'Failed to create tenant';
      message.error(errorMsg);
    },
  });
};

export const useUpdateTenant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTenant,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.lists() });
      queryClient.invalidateQueries({ queryKey: tenantKeys.detail(variables.tenantId) });
      message.success('Tenant updated successfully!');
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.description || error.response?.data?.message || 'Failed to update tenant';
      message.error(errorMsg);
    },
  });
};

export const useDeleteTenant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTenant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.all });
      message.success('Tenant deleted successfully!');
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.description || error.response?.data?.message || 'Failed to delete tenant';
      message.error(errorMsg);
    },
  });
};
