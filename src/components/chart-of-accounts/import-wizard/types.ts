export type ImportStep = 1 | 2 | 3 | 4;

export interface ParsedAccount {
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

export type ImportMethod = 'file' | 'template';

export interface ImportChartOfAccountsWizardState {
    currentStep: ImportStep;

    // Step 1: Method & Upload
    importMethod: ImportMethod;
    selectedTemplateId: string | null;
    selectedFile: File | null;
    fileHeaders: string[];
    rawFileData: unknown[][];

    // Step 2: Mapping
    hasHeaderRow: boolean;
    fieldMappings: Record<string, string>;

    // Step 3: Review
    parsedAccounts: ParsedAccount[];
    selectedAccountIds: Set<string>;

    // Step 4: Results
    importResults: ImportResults | null;
    importId: string | null;

    // Common
    isLoading: boolean;
    error: string | null;
}

export interface ImportChartOfAccountsWizardActions {
    // Navigation
    goToStep: (step: ImportStep) => void;
    nextStep: () => void;
    prevStep: () => void;

    // Step 1
    setImportMethod: (method: ImportMethod) => void;
    setSelectedTemplateId: (id: string | null) => void;
    setSelectedFile: (file: File | null) => void;
    setFileHeaders: (headers: string[]) => void;
    setRawFileData: (data: unknown[][]) => void;

    // Step 2
    setHasHeaderRow: (hasHeader: boolean) => void;
    setFieldMappings: (mappings: Record<string, string>) => void;
    updateFieldMapping: (fieldKey: string, fileColumn: string) => void;

    // Step 3
    setParsedAccounts: (accounts: ParsedAccount[]) => void;
    toggleAccountSelection: (id: string) => void;
    selectAllAccounts: () => void;
    deselectAllAccounts: () => void;

    // Step 4
    setImportResults: (results: ImportResults | null) => void;
    setImportId: (id: string | null) => void;

    // Common
    setIsLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    reset: () => void;
}

export interface ImportChartOfAccountsWizardContextValue {
    state: ImportChartOfAccountsWizardState;
    actions: ImportChartOfAccountsWizardActions;
}

export const STEP_TITLES: Record<ImportStep, string> = {
    1: 'Upload / Select',
    2: 'Map Fields',
    3: 'Review & Select',
    4: 'Results',
};
