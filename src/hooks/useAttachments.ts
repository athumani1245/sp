import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getAttachments, uploadAttachment, deleteAttachment } from '../services/attachmentService';
import { message } from 'antd';

// Query Keys
export const attachmentKeys = {
  all: ['attachments'] as const,
  list: (model: string, recordId: string) => [...attachmentKeys.all, model, recordId] as const,
};

// Fetch attachments for a record
export const useAttachments = (model: string, recordId: string | null) => {
  return useQuery({
    queryKey: attachmentKeys.list(model, recordId || ''),
    queryFn: () => getAttachments({ model, record_id: recordId! }),
    enabled: !!recordId,
  });
};

// Upload attachment
export const useUploadAttachment = (model: string, recordId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => uploadAttachment({ model, record_id: recordId, file }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attachmentKeys.list(model, recordId) });
      message.success('File uploaded successfully!');
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.description || error.response?.data?.message || 'Failed to upload file';
      message.error(errorMsg);
    },
  });
};

// Delete attachment
export const useDeleteAttachment = (model: string, recordId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (attachmentId: string) => deleteAttachment({ model, record_id: recordId, attachmentId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attachmentKeys.list(model, recordId) });
      message.success('File deleted successfully!');
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.description || error.response?.data?.message || 'Failed to delete file';
      message.error(errorMsg);
    },
  });
};
