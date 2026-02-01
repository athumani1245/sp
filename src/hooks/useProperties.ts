import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getProperties,
  getAllProperties,
  getPropertyById,
  addProperty,
  updateProperty,
  deleteProperty,
  getAvailableUnits,
  getPropertyUnits,
  addPropertyUnit,
  updatePropertyUnit,
  deletePropertyUnit,
  getPropertyStats,
  getRegions,
  getDistricts,
  getWards,
} from '../services/propertyService';
import { message } from 'antd';

// Query Keys
export const propertyKeys = {
  all: ['properties'] as const,
  lists: () => [...propertyKeys.all, 'list'] as const,
  list: (params: any) => [...propertyKeys.lists(), params] as const,
  details: () => [...propertyKeys.all, 'detail'] as const,
  detail: (id: string) => [...propertyKeys.details(), id] as const,
  units: (propertyId: string) => [...propertyKeys.detail(propertyId), 'units'] as const,
  stats: (propertyId: string) => [...propertyKeys.detail(propertyId), 'stats'] as const,
  availableUnits: (params: any) => ['units', 'available', params] as const,
  regions: ['regions'] as const,
  districts: (regionId: string) => ['districts', regionId] as const,
  wards: (districtId: string) => ['wards', districtId] as const,
};

// Location Hooks
export const useRegions = () => {
  return useQuery({
    queryKey: propertyKeys.regions,
    queryFn: getRegions,
    staleTime: 1000 * 60 * 60, // 1 hour - regions rarely change
  });
};

export const useDistricts = (regionId: string | null) => {
  return useQuery({
    queryKey: propertyKeys.districts(regionId || ''),
    queryFn: () => getDistricts(regionId!),
    enabled: !!regionId,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};

export const useWards = (districtId: string | null) => {
  return useQuery({
    queryKey: propertyKeys.wards(districtId || ''),
    queryFn: () => getWards(districtId!),
    enabled: !!districtId,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};

// Property Hooks
export const useProperties = (params: any = {}) => {
  return useQuery({
    queryKey: propertyKeys.list(params),
    queryFn: () => getProperties(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Get all properties without pagination (for dropdowns/selects)
export const useAllProperties = () => {
  return useQuery({
    queryKey: ['properties', 'all'],
    queryFn: getAllProperties,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useProperty = (propertyId: string | null) => {
  return useQuery({
    queryKey: propertyKeys.detail(propertyId || ''),
    queryFn: () => getPropertyById(propertyId!),
    enabled: !!propertyId,
  });
};

export const usePropertyStats = (propertyId: string | null) => {
  return useQuery({
    queryKey: propertyKeys.stats(propertyId || ''),
    queryFn: () => getPropertyStats(propertyId!),
    enabled: !!propertyId,
  });
};

// Property Mutations
export const useAddProperty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addProperty,
    onSuccess: () => {
      // Invalidate and refetch all property list queries
      queryClient.invalidateQueries({ 
        queryKey: propertyKeys.lists(),
        refetchType: 'all'
      });
      message.success('Property added successfully!');
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.description || error.response?.data?.message || 'Failed to add property';
      message.error(errorMsg);
    },
  });
};

export const useUpdateProperty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProperty,
    onSuccess: (data, variables) => {
      // Invalidate and refetch all property list queries
      queryClient.invalidateQueries({ 
        queryKey: propertyKeys.lists(),
        refetchType: 'all'
      });
      queryClient.invalidateQueries({ queryKey: propertyKeys.detail(variables.propertyId) });
      message.success('Property updated successfully!');
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.description || error.response?.data?.message || 'Failed to update property';
      message.error(errorMsg);
    },
  });
};

export const useDeleteProperty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProperty,
    onSuccess: () => {
      // Invalidate and refetch all property list queries
      queryClient.invalidateQueries({ 
        queryKey: propertyKeys.lists(),
        refetchType: 'all'
      });
      message.success('Property deleted successfully!');
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.description || error.response?.data?.message || 'Failed to delete property';
      message.error(errorMsg);
    },
  });
};

// Unit Hooks
export const useAvailableUnits = (params: any = {}) => {
  return useQuery({
    queryKey: propertyKeys.availableUnits(params),
    queryFn: () => getAvailableUnits(params),
    enabled: !!params.property,
  });
};

export const usePropertyUnits = (params: { property: string; page?: number }) => {
  return useQuery({
    queryKey: propertyKeys.units(params.property),
    queryFn: () => getPropertyUnits(params),
    enabled: !!params.property,
  });
};

export const useAddPropertyUnit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addPropertyUnit,
    onSuccess: (data: any, variables: any) => {
      // Use the property ID from the request variables
      const propertyId = variables.property || data.property;
      if (propertyId) {
        queryClient.invalidateQueries({ queryKey: propertyKeys.units(propertyId) });
        queryClient.invalidateQueries({ queryKey: propertyKeys.detail(propertyId) });
      }
      queryClient.invalidateQueries({ queryKey: propertyKeys.availableUnits({}) });
      message.success('Unit added successfully!');
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.description || error.response?.data?.message || 'Failed to add unit';
      message.error(errorMsg);
    },
  });
};

export const useUpdatePropertyUnit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePropertyUnit,
    onSuccess: (data: any) => {
      if (data.property) {
        queryClient.invalidateQueries({ queryKey: propertyKeys.units(data.property) });
      }
      message.success('Unit updated successfully!');
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.description || error.response?.data?.message || 'Failed to update unit';
      message.error(errorMsg);
    },
  });
};

export const useDeletePropertyUnit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePropertyUnit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: propertyKeys.all });
      message.success('Unit deleted successfully!');
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.description || error.response?.data?.message || 'Failed to delete unit';
      message.error(errorMsg);
    },
  });
};
