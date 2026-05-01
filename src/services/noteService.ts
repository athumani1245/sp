import api from '../utils/api';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8000/api';

export type NoteType = 'GENERAL' | 'REMINDER' | 'WARNING' | 'INFO';

export interface Note {
  id: string;
  title: string;
  content: string;
  date: string;
  note_type: NoteType;
  model: string;
  object_id: string;
  author?: {
    id: string;
    first_name: string;
    last_name: string;
  };
  created_at: string;
}

export interface CreateNotePayload {
  title: string;
  content: string;
  date: string;
  note_type: NoteType;
  model: string;
  object_id: string;
}

interface NoteParams {
  model: string;
  record_id: string;
}

// Get All Notes
export const getNotes = async () => {
  const response = await api.get(`${API_BASE}/notes/`);
  return response.data.data || response.data;
};


// Get notes for a specific record
export const getNotesForRecord = async ({ model, record_id }: NoteParams) => {
  const response = await api.get(`${API_BASE}/notes/?model=${model}&object_id=${record_id}`);
  return response.data.data || response.data;
};

// Create a note on a specific record
export const createNote = async ({
  model,
  record_id,
  payload,
}: NoteParams & { payload: CreateNotePayload }) => {
  const response = await api.post(`${API_BASE}/notes/`, payload);
  return response.data.data || response.data;
};

// Delete a note
export const deleteNote = async ({ model, record_id, noteId }: NoteParams & { noteId: string }) => {
  await api.delete(`${API_BASE}/notes/${model}/${record_id}/${noteId}/`);
  return { success: true };
};

// Get all reminders for current user (for notification tray)
export const getReminders = async () => {
  const response = await api.get(`${API_BASE}/notes/`, {
    params: { note_type: 'REMINDER' },
  });
  return response.data.data || response.data;
};
