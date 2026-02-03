export type ImportStep = 1 | 2 | 3 | 4;

export interface ParsedContact {
    id: string;
    [key: string]: unknown;
    rawData: Record<string, unknown>;
}

export interface ImportResults {
    status: 'completed' | 'failed';
    total: number;
    created: number;
    skipped: number;
    failed: number;
    progress?: number;
    errorMessage?: string | null;
}

export interface ImportField {
    key: string;
    label: string;
    required: boolean;
    formatHint?: string;
}

export interface ImportContactsWizardState {
    currentStep: ImportStep;

    // Step 1: File Upload
    selectedFile: File | null;
    fileHeaders: string[];
    rawFileData: unknown[][];

    // Step 2: Mapping
    hasHeaderRow: boolean;
    fieldMappings: Record<string, string>;
    contactType: 'supplier' | 'customer' | 'employee';
    dateFormat: string;

    // Step 3: Review
    parsedContacts: ParsedContact[];
    selectedContactIds: Set<string>;

    // Step 4: Results
    importResults: ImportResults | null;
    importId: string | null;

    // Common
    isLoading: boolean;
    error: string | null;
}

export interface ImportContactsWizardActions {
    // Navigation
    goToStep: (step: ImportStep) => void;
    nextStep: () => void;
    prevStep: () => void;

    // Step 1
    setSelectedFile: (file: File | null) => void;
    setFileHeaders: (headers: string[]) => void;
    setRawFileData: (data: unknown[][]) => void;

    // Step 2
    setHasHeaderRow: (hasHeader: boolean) => void;
    setFieldMappings: (mappings: Record<string, string>) => void;
    updateFieldMapping: (fieldKey: string, fileColumn: string) => void;
    setContactType: (type: 'supplier' | 'customer' | 'employee') => void;
    setDateFormat: (format: string) => void;

    // Step 3
    setParsedContacts: (contacts: ParsedContact[]) => void;
    toggleContactSelection: (id: string) => void;
    selectAllContacts: () => void;
    deselectAllContacts: () => void;

    // Step 4
    setImportResults: (results: ImportResults | null) => void;
    setImportId: (id: string | null) => void;

    // Common
    setIsLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    reset: () => void;
}

export interface ImportContactsWizardContextValue {
    state: ImportContactsWizardState;
    actions: ImportContactsWizardActions;
}

export const STEP_TITLES: Record<ImportStep, string> = {
    1: 'Upload File',
    2: 'File Setup',
    3: 'Review & Select',
    4: 'Results',
};
