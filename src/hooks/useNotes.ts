import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getNotes, createNote, deleteNote, getReminders, getNotesForRecord } from '../services/noteService';
import type { CreateNotePayload } from '../services/noteService';
import { message } from 'antd';

// Query Keys
export const noteKeys = {
  all: ['notes'] as const,
  list: (model: string, recordId: string) => [...noteKeys.all, model, recordId] as const,
  reminders: () => [...noteKeys.all, 'reminders'] as const,
};

// Fetch notes for a record
export const useNotes = (model: string, recordId: string | null) => {
  return useQuery({
    queryKey: noteKeys.list(model, recordId || ''),
    queryFn: () => getNotesForRecord({ model, record_id: recordId! }),
    enabled: !!recordId,
  });
};

// Create a note
export const useCreateNote = (model: string, recordId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateNotePayload) =>
      createNote({ model, record_id: recordId, payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noteKeys.list(model, recordId) });
      message.success('Note added successfully!');
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.description || error.response?.data?.message || 'Failed to add note';
      message.error(errorMsg);
    },
  });
};

// Delete a note
export const useDeleteNote = (model: string, recordId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (noteId: string) => deleteNote({ model, record_id: recordId, noteId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noteKeys.list(model, recordId) });
      message.success('Note deleted successfully!');
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.description || error.response?.data?.message || 'Failed to delete note';
      message.error(errorMsg);
    },
  });
};

// Fetch all reminders for notification tray
export const useReminders = () => {
  return useQuery({
    queryKey: noteKeys.reminders(),
    queryFn: getReminders,
    refetchInterval: 5 * 60 * 1000, // refresh every 5 minutes
  });
};
