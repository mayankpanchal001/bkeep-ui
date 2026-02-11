/* eslint-disable react-refresh/only-export-components */
import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useMemo,
    useState,
} from 'react';
import {
    ImportChartOfAccountsWizardActions,
    ImportChartOfAccountsWizardContextValue,
    ImportChartOfAccountsWizardState,
    ImportMethod,
    ImportResults,
    ImportStep,
    ParsedAccount,
} from './types';

const initialState: ImportChartOfAccountsWizardState = {
    currentStep: 1,
    importMethod: 'file',
    selectedTemplateId: null,
    selectedFile: null,
    fileHeaders: [],
    rawFileData: [],
    hasHeaderRow: true,
    fieldMappings: {},
    parsedAccounts: [],
    selectedAccountIds: new Set(),
    importResults: null,
    importId: null,
    isLoading: false,
    error: null,
};

const ImportChartOfAccountsWizardContext =
    createContext<ImportChartOfAccountsWizardContextValue | null>(null);

export function useImportChartOfAccountsWizardContext(): ImportChartOfAccountsWizardContextValue {
    const context = useContext(ImportChartOfAccountsWizardContext);
    if (!context) {
        throw new Error(
            'useImportChartOfAccountsWizardContext must be used within an ImportChartOfAccountsWizardProvider'
        );
    }
    return context;
}

interface ImportChartOfAccountsWizardProviderProps {
    children: ReactNode;
}

export function ImportChartOfAccountsWizardProvider({
    children,
}: ImportChartOfAccountsWizardProviderProps) {
    const [state, setState] =
        useState<ImportChartOfAccountsWizardState>(initialState);

    // Navigation actions
    const goToStep = useCallback((step: ImportStep) => {
        setState((prev) => ({ ...prev, currentStep: step }));
    }, []);

    const nextStep = useCallback(() => {
        setState((prev) => {
            if (prev.currentStep < 4) {
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
    const setImportMethod = useCallback((method: ImportMethod) => {
        setState((prev) => ({ ...prev, importMethod: method }));
    }, []);

    const setSelectedTemplateId = useCallback((id: string | null) => {
        setState((prev) => ({ ...prev, selectedTemplateId: id }));
    }, []);

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
    const setHasHeaderRow = useCallback((hasHeader: boolean) => {
        setState((prev) => ({ ...prev, hasHeaderRow: hasHeader }));
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

    // Step 3 actions
    const setParsedAccounts = useCallback((accounts: ParsedAccount[]) => {
        setState((prev) => ({
            ...prev,
            parsedAccounts: accounts,
            selectedAccountIds: new Set(accounts.map((t) => t.id)),
        }));
    }, []);

    const toggleAccountSelection = useCallback((id: string) => {
        setState((prev) => {
            const newSelected = new Set(prev.selectedAccountIds);
            if (newSelected.has(id)) {
                newSelected.delete(id);
            } else {
                newSelected.add(id);
            }
            return { ...prev, selectedAccountIds: newSelected };
        });
    }, []);

    const selectAllAccounts = useCallback(() => {
        setState((prev) => ({
            ...prev,
            selectedAccountIds: new Set(prev.parsedAccounts.map((t) => t.id)),
        }));
    }, []);

    const deselectAllAccounts = useCallback(() => {
        setState((prev) => ({
            ...prev,
            selectedAccountIds: new Set(),
        }));
    }, []);

    // Step 4 actions
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

    const actions: ImportChartOfAccountsWizardActions = useMemo(
        () => ({
            goToStep,
            nextStep,
            prevStep,
            setImportMethod,
            setSelectedTemplateId,
            setSelectedFile,
            setFileHeaders,
            setRawFileData,
            setHasHeaderRow,
            setFieldMappings,
            updateFieldMapping,
            setParsedAccounts,
            toggleAccountSelection,
            selectAllAccounts,
            deselectAllAccounts,
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
            setImportMethod,
            setSelectedTemplateId,
            setSelectedFile,
            setFileHeaders,
            setRawFileData,
            setHasHeaderRow,
            setFieldMappings,
            updateFieldMapping,
            setParsedAccounts,
            toggleAccountSelection,
            selectAllAccounts,
            deselectAllAccounts,
            setImportResults,
            setImportId,
            setIsLoading,
            setError,
            reset,
        ]
    );

    const value: ImportChartOfAccountsWizardContextValue = useMemo(
        () => ({ state, actions }),
        [state, actions]
    );

    return (
        <ImportChartOfAccountsWizardContext.Provider value={value}>
            {children}
        </ImportChartOfAccountsWizardContext.Provider>
    );
}
