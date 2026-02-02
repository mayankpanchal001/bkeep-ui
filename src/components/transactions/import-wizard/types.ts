// Import Wizard Types

export type ImportStep = 1 | 2 | 3 | 4 | 5;

export interface ParsedTransaction {
    id: string;
    date: string;
    description: string;
    amount: number;
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
    errors?: ImportError[];
}

export interface ImportError {
    row: number;
    message: string;
    data?: Record<string, unknown>;
}

export interface ImportField {
    key: string;
    label: string;
    required: boolean;
    formatHint?: string;
}

export type ColumnMode = 'single' | 'double';

export type DateFormat =
    | 'ddmmyyyy'
    | 'mmddyyyy'
    | 'yyyymmdd'
    | 'dd/mm/yyyy'
    | 'mm/dd/yyyy'
    | 'yyyy-mm-dd';

export interface ImportWizardState {
    currentStep: ImportStep;

    // Step 1: File Upload
    selectedFile: File | null;
    fileHeaders: string[];
    rawFileData: unknown[][];

    // Step 2: Account Selection
    targetAccountId: string;

    // Step 3: File Setup
    hasHeaderRow: boolean;
    columnMode: ColumnMode;
    dateFormat: string;
    fieldMappings: Record<string, string>;

    // Step 4: Review & Select
    parsedTransactions: ParsedTransaction[];
    selectedTransactionIds: Set<string>;
    isReverseValues: boolean;

    // Step 5: Results
    importResults: ImportResults | null;
    importId: string | null;

    // Common
    isLoading: boolean;
    error: string | null;
}

export interface ImportWizardActions {
    // Navigation
    goToStep: (step: ImportStep) => void;
    nextStep: () => void;
    prevStep: () => void;

    // Step 1
    setSelectedFile: (file: File | null) => void;
    setFileHeaders: (headers: string[]) => void;
    setRawFileData: (data: unknown[][]) => void;

    // Step 2
    setTargetAccountId: (accountId: string) => void;

    // Step 3
    setHasHeaderRow: (hasHeader: boolean) => void;
    setColumnMode: (mode: ColumnMode) => void;
    setDateFormat: (format: string) => void;
    setFieldMappings: (mappings: Record<string, string>) => void;
    updateFieldMapping: (fieldKey: string, fileColumn: string) => void;

    // Step 4
    setParsedTransactions: (transactions: ParsedTransaction[]) => void;
    toggleTransactionSelection: (id: string) => void;
    selectAllTransactions: () => void;
    deselectAllTransactions: () => void;
    setIsReverseValues: (reverse: boolean) => void;

    // Step 5
    setImportResults: (results: ImportResults | null) => void;
    setImportId: (id: string | null) => void;

    // Common
    setIsLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    reset: () => void;
}

export interface ImportWizardContextValue {
    state: ImportWizardState;
    actions: ImportWizardActions;
}

export const STEP_TITLES: Record<ImportStep, string> = {
    1: 'Upload File',
    2: 'Select Account',
    3: 'File Setup',
    4: 'Review & Select',
    5: 'Results',
};

export const DEFAULT_DATE_FORMATS: DateFormat[] = [
    'ddmmyyyy',
    'mmddyyyy',
    'yyyymmdd',
    'dd/mm/yyyy',
    'mm/dd/yyyy',
    'yyyy-mm-dd',
];
