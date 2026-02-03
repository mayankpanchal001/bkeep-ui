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
    ImportContactsWizardActions,
    ImportContactsWizardContextValue,
    ImportContactsWizardState,
    ImportResults,
    ImportStep,
    ParsedContact,
} from './types';

const initialState: ImportContactsWizardState = {
    currentStep: 1,
    selectedFile: null,
    fileHeaders: [],
    rawFileData: [],
    hasHeaderRow: true,
    fieldMappings: {},
    contactType: 'supplier',
    dateFormat: 'MM/dd/yyyy',
    parsedContacts: [],
    selectedContactIds: new Set(),
    importResults: null,
    importId: null,
    isLoading: false,
    error: null,
};

const ImportContactsWizardContext =
    createContext<ImportContactsWizardContextValue | null>(null);

export function useImportContactsWizardContext(): ImportContactsWizardContextValue {
    const context = useContext(ImportContactsWizardContext);
    if (!context) {
        throw new Error(
            'useImportContactsWizardContext must be used within an ImportContactsWizardProvider'
        );
    }
    return context;
}

interface ImportContactsWizardProviderProps {
    children: ReactNode;
}

export function ImportContactsWizardProvider({
    children,
}: ImportContactsWizardProviderProps) {
    const [state, setState] = useState<ImportContactsWizardState>(initialState);

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
    const setContactType = useCallback(
        (type: 'supplier' | 'customer' | 'employee') => {
            setState((prev) => ({ ...prev, contactType: type }));
        },
        []
    );

    const setDateFormat = useCallback((format: string) => {
        setState((prev) => ({ ...prev, dateFormat: format }));
    }, []);

    // Step 3 actions
    const setParsedContacts = useCallback((contacts: ParsedContact[]) => {
        setState((prev) => ({
            ...prev,
            parsedContacts: contacts,
            selectedContactIds: new Set(contacts.map((t) => t.id)),
        }));
    }, []);

    const toggleContactSelection = useCallback((id: string) => {
        setState((prev) => {
            const newSelected = new Set(prev.selectedContactIds);
            if (newSelected.has(id)) {
                newSelected.delete(id);
            } else {
                newSelected.add(id);
            }
            return { ...prev, selectedContactIds: newSelected };
        });
    }, []);

    const selectAllContacts = useCallback(() => {
        setState((prev) => ({
            ...prev,
            selectedContactIds: new Set(prev.parsedContacts.map((t) => t.id)),
        }));
    }, []);

    const deselectAllContacts = useCallback(() => {
        setState((prev) => ({
            ...prev,
            selectedContactIds: new Set(),
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

    const actions: ImportContactsWizardActions = useMemo(
        () => ({
            goToStep,
            nextStep,
            prevStep,
            setSelectedFile,
            setFileHeaders,
            setRawFileData,
            setHasHeaderRow,
            setFieldMappings,
            updateFieldMapping,
            setContactType,
            setDateFormat,
            setParsedContacts,
            toggleContactSelection,
            selectAllContacts,
            deselectAllContacts,
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
            setHasHeaderRow,
            setFieldMappings,
            updateFieldMapping,
            setContactType,
            setDateFormat,
            setParsedContacts,
            toggleContactSelection,
            selectAllContacts,
            deselectAllContacts,
            setImportResults,
            setImportId,
            setIsLoading,
            setError,
            reset,
        ]
    );

    const value: ImportContactsWizardContextValue = useMemo(
        () => ({ state, actions }),
        [state, actions]
    );

    return (
        <ImportContactsWizardContext.Provider value={value}>
            {children}
        </ImportContactsWizardContext.Provider>
    );
}
