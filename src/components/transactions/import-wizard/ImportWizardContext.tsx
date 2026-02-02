/* eslint-disable react-refresh/only-export-components */
import {
    createContext,
    useContext,
    ReactNode,
    useCallback,
    useState,
    useMemo,
} from 'react';
import {
    ImportWizardState,
    ImportWizardActions,
    ImportWizardContextValue,
    ImportStep,
    ColumnMode,
    ParsedTransaction,
    ImportResults,
} from './types';

const initialState: ImportWizardState = {
    currentStep: 1,
    selectedFile: null,
    fileHeaders: [],
    rawFileData: [],
    targetAccountId: '',
    hasHeaderRow: true,
    columnMode: 'single',
    dateFormat: 'ddmmyyyy',
    fieldMappings: {},
    parsedTransactions: [],
    selectedTransactionIds: new Set(),
    isReverseValues: false,
    importResults: null,
    importId: null,
    isLoading: false,
    error: null,
};

const ImportWizardContext = createContext<ImportWizardContextValue | null>(
    null
);

export function useImportWizardContext(): ImportWizardContextValue {
    const context = useContext(ImportWizardContext);
    if (!context) {
        throw new Error(
            'useImportWizardContext must be used within an ImportWizardProvider'
        );
    }
    return context;
}

interface ImportWizardProviderProps {
    children: ReactNode;
}

export function ImportWizardProvider({ children }: ImportWizardProviderProps) {
    const [state, setState] = useState<ImportWizardState>(initialState);

    // Navigation actions
    const goToStep = useCallback((step: ImportStep) => {
        setState((prev) => ({ ...prev, currentStep: step }));
    }, []);

    const nextStep = useCallback(() => {
        setState((prev) => {
            if (prev.currentStep < 5) {
                return {
                    ...prev,
                    currentStep: (prev.currentStep + 1) as ImportStep,
                };
            }
            return prev;
        });
    }, []);

    const prevStep = useCallback(() => {
        setState((prev) => {
            if (prev.currentStep > 1) {
                return {
                    ...prev,
                    currentStep: (prev.currentStep - 1) as ImportStep,
                };
            }
            return prev;
        });
    }, []);

    // Step 1 actions
    const setSelectedFile = useCallback((file: File | null) => {
        setState((prev) => ({ ...prev, selectedFile: file }));
    }, []);

    const setFileHeaders = useCallback((headers: string[]) => {
        setState((prev) => ({ ...prev, fileHeaders: headers }));
    }, []);

    const setRawFileData = useCallback((data: unknown[][]) => {
        setState((prev) => ({ ...prev, rawFileData: data }));
    }, []);

    // Step 2 actions
    const setTargetAccountId = useCallback((accountId: string) => {
        setState((prev) => ({ ...prev, targetAccountId: accountId }));
    }, []);

    // Step 3 actions
    const setHasHeaderRow = useCallback((hasHeader: boolean) => {
        setState((prev) => ({ ...prev, hasHeaderRow: hasHeader }));
    }, []);

    const setColumnMode = useCallback((mode: ColumnMode) => {
        setState((prev) => ({ ...prev, columnMode: mode }));
    }, []);

    const setDateFormat = useCallback((format: string) => {
        setState((prev) => ({ ...prev, dateFormat: format }));
    }, []);

    const setFieldMappings = useCallback((mappings: Record<string, string>) => {
        setState((prev) => ({ ...prev, fieldMappings: mappings }));
    }, []);

    const updateFieldMapping = useCallback(
        (fieldKey: string, fileColumn: string) => {
            setState((prev) => ({
                ...prev,
                fieldMappings: {
                    ...prev.fieldMappings,
                    [fieldKey]: fileColumn,
                },
            }));
        },
        []
    );

    // Step 4 actions
    const setParsedTransactions = useCallback(
        (transactions: ParsedTransaction[]) => {
            setState((prev) => ({
                ...prev,
                parsedTransactions: transactions,
                selectedTransactionIds: new Set(transactions.map((t) => t.id)),
            }));
        },
        []
    );

    const toggleTransactionSelection = useCallback((id: string) => {
        setState((prev) => {
            const newSelected = new Set(prev.selectedTransactionIds);
            if (newSelected.has(id)) {
                newSelected.delete(id);
            } else {
                newSelected.add(id);
            }
            return { ...prev, selectedTransactionIds: newSelected };
        });
    }, []);

    const selectAllTransactions = useCallback(() => {
        setState((prev) => ({
            ...prev,
            selectedTransactionIds: new Set(
                prev.parsedTransactions.map((t) => t.id)
            ),
        }));
    }, []);

    const deselectAllTransactions = useCallback(() => {
        setState((prev) => ({
            ...prev,
            selectedTransactionIds: new Set(),
        }));
    }, []);

    const setIsReverseValues = useCallback((reverse: boolean) => {
        setState((prev) => ({ ...prev, isReverseValues: reverse }));
    }, []);

    // Step 5 actions
    const setImportResults = useCallback((results: ImportResults | null) => {
        setState((prev) => ({ ...prev, importResults: results }));
    }, []);

    const setImportId = useCallback((id: string | null) => {
        setState((prev) => ({ ...prev, importId: id }));
    }, []);

    // Common actions
    const setIsLoading = useCallback((loading: boolean) => {
        setState((prev) => ({ ...prev, isLoading: loading }));
    }, []);

    const setError = useCallback((error: string | null) => {
        setState((prev) => ({ ...prev, error: error }));
    }, []);

    const reset = useCallback(() => {
        setState(initialState);
    }, []);

    const actions: ImportWizardActions = useMemo(
        () => ({
            goToStep,
            nextStep,
            prevStep,
            setSelectedFile,
            setFileHeaders,
            setRawFileData,
            setTargetAccountId,
            setHasHeaderRow,
            setColumnMode,
            setDateFormat,
            setFieldMappings,
            updateFieldMapping,
            setParsedTransactions,
            toggleTransactionSelection,
            selectAllTransactions,
            deselectAllTransactions,
            setIsReverseValues,
            setImportResults,
            setImportId,
            setIsLoading,
            setError,
            reset,
        }),
        [
            goToStep,
            nextStep,
            prevStep,
            setSelectedFile,
            setFileHeaders,
            setRawFileData,
            setTargetAccountId,
            setHasHeaderRow,
            setColumnMode,
            setDateFormat,
            setFieldMappings,
            updateFieldMapping,
            setParsedTransactions,
            toggleTransactionSelection,
            selectAllTransactions,
            deselectAllTransactions,
            setIsReverseValues,
            setImportResults,
            setImportId,
            setIsLoading,
            setError,
            reset,
        ]
    );

    const value: ImportWizardContextValue = useMemo(
        () => ({ state, actions }),
        [state, actions]
    );

    return (
        <ImportWizardContext.Provider value={value}>
            {children}
        </ImportWizardContext.Provider>
    );
}
