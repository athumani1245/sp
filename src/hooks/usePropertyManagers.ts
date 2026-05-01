import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getPropertyManagers,
  getPropertyManagerById,
  createPropertyManager,
  updatePropertyManager,
  deletePropertyManager,
  getPermissions,
} from '../services/propertyManagerService';
import { message } from 'antd';

// Query Keys
export const propertyManagerKeys = {
  all: ['propertyManagers'] as const,
  lists: () => [...propertyManagerKeys.all, 'list'] as const,
  list: (params: any) => [...propertyManagerKeys.lists(), params] as const,
  details: () => [...propertyManagerKeys.all, 'detail'] as const,
  detail: (id: string) => [...propertyManagerKeys.details(), id] as const,
};

// Permissions Hook
export const usePermissions = () => {
  return useQuery({
    queryKey: ['permissions'],
    queryFn: getPermissions,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

// Property Manager Hooks
export const usePropertyManagers = (params: any = {}) => {
  return useQuery({
    queryKey: propertyManagerKeys.list(params),
    queryFn: () => getPropertyManagers(params),
  });
};

export const usePropertyManager = (managerId: string | null) => {
  return useQuery({
    queryKey: propertyManagerKeys.detail(managerId || ''),
    queryFn: () => getPropertyManagerById(managerId!),
    enabled: !!managerId,
  });
};

// Property Manager Mutations
export const useCreatePropertyManager = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPropertyManager,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: propertyManagerKeys.lists() });
      message.success('Property manager created successfully!');
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.description || error.response?.data?.message || 'Failed to create property manager';
      message.error(errorMsg);
    },
  });
};

export const useUpdatePropertyManager = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePropertyManager,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: propertyManagerKeys.lists() });
      queryClient.invalidateQueries({ queryKey: propertyManagerKeys.detail(variables.managerId) });
      message.success('Property manager updated successfully!');
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.description || error.response?.data?.message || 'Failed to update property manager';
      message.error(errorMsg);
    },
  });
};

export const useDeletePropertyManager = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePropertyManager,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: propertyManagerKeys.all });
      message.success('Property manager deleted successfully!');
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.description || error.response?.data?.message || 'Failed to delete property manager';
      message.error(errorMsg);
    },
  });
};
