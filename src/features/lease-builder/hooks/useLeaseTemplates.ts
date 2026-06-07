import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { leaseTemplateService, LeaseTemplate, CreateTemplatePayload, fetchLeaseVariables } from '../services/leaseTemplateService';

export const templateKeys = {
  all: ['leaseTemplates'] as const,
  lists: () => [...templateKeys.all, 'list'] as const,
  detail: (id: string) => [...templateKeys.all, 'detail', id] as const,
};

export function useLeaseTemplates() {
  return useQuery({
    queryKey: templateKeys.lists(),
    queryFn: leaseTemplateService.list,
  });
}

export function useLeaseTemplate(id: string | null) {
  return useQuery({
    queryKey: templateKeys.detail(id!),
    queryFn: () => leaseTemplateService.getById(id!),
    enabled: !!id,
  });
}

export function useCreateTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTemplatePayload) => leaseTemplateService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: templateKeys.lists() });
      message.success('Template saved successfully');
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.description || err?.response?.data?.detail || 'Failed to save template';
      message.error(msg);
    },
  });
}

export function useUpdateTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateTemplatePayload> }) =>
      leaseTemplateService.update(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: templateKeys.lists() });
      qc.invalidateQueries({ queryKey: templateKeys.detail(id) });
      message.success('Template updated successfully');
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.description || err?.response?.data?.detail || 'Failed to update template';
      message.error(msg);
    },
  });
}

export function useDeleteTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => leaseTemplateService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: templateKeys.lists() });
      message.success('Template deleted');
    },
    onError: () => message.error('Failed to delete template'),
  });
}

export function useDuplicateTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => leaseTemplateService.duplicate(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: templateKeys.lists() });
      message.success('Template duplicated');
    },
    onError: () => message.error('Failed to duplicate template'),
  });
}

export function useLeaseVariables() {
  return useQuery({
    queryKey: ['leaseVariables'],
    queryFn: fetchLeaseVariables,
    staleTime: 1000 * 60 * 10,
    retry: 1,
  });
}
