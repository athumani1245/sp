import { create } from 'zustand';

export interface DocumentState {
  templateId: string | null;
  templateName: string;
  editorJson: any | null;
  variables: string[];
  tenantData: Record<string, string>;
  previewMode: boolean;

  setTemplateId: (id: string | null) => void;
  setTemplateName: (name: string) => void;
  setEditorJson: (json: any) => void;
  setVariables: (vars: string[]) => void;
  setTenantData: (data: Record<string, string>) => void;
  updateTenantField: (key: string, value: string) => void;
  togglePreview: () => void;
  reset: () => void;
}

const initialState = {
  templateId: null,
  templateName: '',
  editorJson: null,
  variables: [],
  tenantData: {},
  previewMode: false,
};

export const useDocumentStore = create<DocumentState>((set) => ({
  ...initialState,

  setTemplateId: (id) => set({ templateId: id }),
  setTemplateName: (name) => set({ templateName: name }),
  setEditorJson: (json) => set({ editorJson: json }),
  setVariables: (vars) => set({ variables: vars }),
  setTenantData: (data) => set({ tenantData: data }),
  updateTenantField: (key, value) =>
    set((state) => ({ tenantData: { ...state.tenantData, [key]: value } })),
  togglePreview: () => set((state) => ({ previewMode: !state.previewMode })),
  reset: () => set(initialState),
}));
