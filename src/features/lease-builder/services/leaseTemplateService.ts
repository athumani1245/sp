import api from '../../../utils/api';

export interface LeaseVariable {
  id: string;
  label: string;
  description?: string;
  category?: string;
}

export interface LeaseTemplate {
  id: string;
  name: string;
  document_json: any;
  variables: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateTemplatePayload {
  name: string;
  document_json: any;
  variables: string[];
}

function unwrap(response: any): any {
  return response.data?.data ?? response.data;
}

export const leaseTemplateService = {
  list: async (): Promise<LeaseTemplate[]> => {
    const response = await api.get('/lease-templates/');
    const data = unwrap(response);
    return Array.isArray(data) ? data : data?.results ?? [];
  },

  getById: async (id: string): Promise<LeaseTemplate> => {
    const response = await api.get(`/lease-templates/${id}/`);
    return unwrap(response);
  },

  create: async (payload: CreateTemplatePayload): Promise<LeaseTemplate> => {
    const response = await api.post('/lease-templates/', {
      name: payload.name,
      document_json: payload.document_json,
      variables: payload.variables,
    });
    return unwrap(response);
  },

  update: async (id: string, payload: Partial<CreateTemplatePayload>): Promise<LeaseTemplate> => {
    const response = await api.put(`/lease-templates/${id}/`, {
      ...(payload.name !== undefined && { name: payload.name }),
      ...(payload.document_json !== undefined && { document_json: payload.document_json }),
      ...(payload.variables !== undefined && { variables: payload.variables }),
    });
    return unwrap(response);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/lease-templates/${id}/`);
  },
};

function normalizeVariable(item: any): LeaseVariable {
  if (typeof item === 'string') {
    return { id: item, label: item.replace(/_/g, ' ') };
  }
  // API returns { key, label }
  const id = item.key || item.id || item.name || item.variable || String(item);
  const label = item.label || item.display_name || item.name || id.replace(/_/g, ' ');
  return {
    id,
    label,
    description: item.description,
    category: item.category || item.group,
  };
}

export async function fetchLeaseVariables(): Promise<LeaseVariable[]> {
  const response = await api.get('/leases/lease-variables/');
  const raw = response.data?.data || response.data?.variables || response.data || [];
  if (Array.isArray(raw)) return raw.map(normalizeVariable);
  return [];
}
