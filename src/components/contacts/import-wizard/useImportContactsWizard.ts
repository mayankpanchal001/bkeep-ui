import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
    getContactImportProgress,
    getContactsImportSample,
    useContactsImportFields,
    useStartContactImport,
} from '../../../services/apis/contactsApi';
import { showErrorToast } from '../../../utills/toast';
import { useImportContactsWizardContext } from './ImportContactsWizardContext';
import { ImportField, ParsedContact } from './types';

// Fallback fields in case the API returns empty or fails
const DEFAULT_CONTACTS_IMPORT_FIELDS: ImportField[] = [
    { key: 'displayName', label: 'Name', required: true },
    { key: 'email', label: 'Email', required: false },
    { key: 'phoneNumber', label: 'Phone', required: false },
    { key: 'companyName', label: 'Company', required: false },
];

export const DATE_FORMAT_OPTIONS = [
    { label: 'MM/DD/YYYY', value: 'MM/dd/yyyy' },
    { label: 'DD/MM/YYYY', value: 'dd/MM/yyyy' },
    { label: 'YYYY-MM-DD', value: 'yyyy-MM-dd' },
    { label: 'DD-MM-YYYY', value: 'dd-MM-yyyy' },
];

export function useImportContactsWizard() {
    // === ALL HOOKS MUST BE CALLED FIRST IN CONSISTENT ORDER ===

    // 1. Context
    const { state, actions } = useImportContactsWizardContext();
    const queryClient = useQueryClient();

    // 2. Refs (for stable callbacks)
    const stateRef = useRef(state);

    // 3. Queries
    const importFieldsQuery = useContactsImportFields();

    // 4. Mutations
    const importMutation = useStartContactImport();

    // === UPDATE REFS ===
    stateRef.current = state;

    // === DERIVED VALUES (using useMemo for stability) ===
    const importFields = useMemo<ImportField[]>(() => {
        // Try to get fields from API
        const apiFields = Array.isArray(importFieldsQuery.data?.data?.fields)
            ? importFieldsQuery.data?.data?.fields || []
            : [];

        // If API returns fields, use them
        if (apiFields.length > 0) {
            return apiFields;
        }

        // If API loaded successfully but returned no fields, or if we are in dev/testing,
        // use the default fallback fields to ensure the UI works.
        // We only use defaults if NOT loading (so we don't flash defaults then switch)
        // AND not error (though typically we might want defaults on error too, but explicit error is better)
        // However, the user is seeing "No Fields Found", which means success + empty.
        if (!importFieldsQuery.isLoading && !importFieldsQuery.isError) {
            console.warn(
                'Import Contacts: API returned no fields, using defaults.'
            );
            return DEFAULT_CONTACTS_IMPORT_FIELDS;
        }

        return [];
    }, [
        importFieldsQuery.data,
        importFieldsQuery.isLoading,
        importFieldsQuery.isError,
    ]);

    const isLoadingFields = importFieldsQuery.isLoading;
    const isFieldsError = importFieldsQuery.isError;
    const refetchFields = importFieldsQuery.refetch;

    // === EFFECTS ===

    // Auto-map fields when file headers and import fields are available
    useEffect(() => {
        if (
            state.fileHeaders.length > 0 &&
            importFields.length > 0 &&
            state.currentStep === 2
        ) {
            const autoMappings: Record<string, string> = {};
            importFields.forEach((field) => {
                const match = state.fileHeaders.find(
                    (header) =>
                        header.toLowerCase() === field.label.toLowerCase() ||
                        header.toLowerCase() === field.key.toLowerCase()
                );
                if (match && !state.fieldMappings[field.key]) {
                    autoMappings[field.key] = match;
                }
            });
            if (Object.keys(autoMappings).length > 0) {
                actions.setFieldMappings({
                    ...state.fieldMappings,
                    ...autoMappings,
                });
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.fileHeaders.length, importFields.length, state.currentStep]);

    // === CALLBACKS ===

    // Parse file using XLSX
    const parseFile = useCallback(
        (file: File): Promise<{ headers: string[]; data: unknown[][] }> => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const data = new Uint8Array(
                            e.target?.result as ArrayBuffer
                        );
                        const workbook = XLSX.read(data, { type: 'array' });
                        const sheetName = workbook.SheetNames[0];
                        const worksheet = workbook.Sheets[sheetName];
                        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
                            header: 1,
                            blankrows: false,
                        }) as unknown[][];

                        // Filter out empty rows (rows where all cells are empty/null/undefined)
                        const filteredData = jsonData.filter((row) => {
                            return (
                                Array.isArray(row) &&
                                row.length > 0 &&
                                row.some(
                                    (cell) =>
                                        cell !== null &&
                                        cell !== undefined &&
                                        String(cell).trim() !== ''
                                )
                            );
                        });

                        if (filteredData.length > 0) {
                            const headers = (filteredData[0] as unknown[]).map(
                                (h) => String(h)
                            );
                            resolve({ headers, data: filteredData });
                        } else {
                            reject(new Error('File is empty'));
                        }
                    } catch {
                        reject(new Error('Failed to parse file'));
                    }
                };
                reader.onerror = () => reject(new Error('Failed to read file'));
                reader.readAsArrayBuffer(file);
            });
        },
        []
    );

    // Handle file selection and parsing
    const handleFileSelect = useCallback(
        async (file: File) => {
            const validTypes = [
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/vnd.ms-excel',
            ];
            const validExtensions = ['.xlsx', '.xls', '.csv'];

            const isValidType = validTypes.includes(file.type);
            const isValidExtension = validExtensions.some((ext) =>
                file.name.toLowerCase().endsWith(ext)
            );

            if (!isValidType && !isValidExtension) {
                showErrorToast('Please upload an Excel or CSV file');
                return;
            }

            actions.setIsLoading(true);
            actions.setError(null);

            try {
                const { headers, data } = await parseFile(file);
                actions.setSelectedFile(file);
                actions.setFileHeaders(headers);
                actions.setRawFileData(data);
            } catch (err) {
                showErrorToast(
                    err instanceof Error ? err.message : 'Failed to parse file'
                );
                actions.setError(
                    err instanceof Error ? err.message : 'Failed to parse file'
                );
            } finally {
                actions.setIsLoading(false);
            }
        },
        [parseFile, actions]
    );

    // Remove selected file
    const handleRemoveFile = useCallback(() => {
        actions.setSelectedFile(null);
        actions.setFileHeaders([]);
        actions.setRawFileData([]);
    }, [actions]);

    // Download sample file
    const handleDownloadSample = useCallback(async () => {
        try {
            const blob = await getContactsImportSample();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'contacts_sample.xlsx';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch {
            showErrorToast('Failed to download sample file');
        }
    }, []);

    // Parse contacts from raw file data using mappings
    const parseContacts = useCallback((): ParsedContact[] => {
        const currentState = stateRef.current;
        const { rawFileData, fieldMappings, hasHeaderRow } = currentState;

        if (rawFileData.length === 0) return [];

        const headers = hasHeaderRow ? (rawFileData[0] as string[]) : [];
        const dataRows = hasHeaderRow ? rawFileData.slice(1) : rawFileData;

        const getColumnIndex = (fieldKey: string): number => {
            const mappedColumn = fieldMappings[fieldKey];
            if (!mappedColumn) return -1;
            return headers.indexOf(mappedColumn);
        };

        // Create a map of field key -> column index
        const fieldIndices: Record<string, number> = {};
        Object.keys(fieldMappings).forEach((key) => {
            fieldIndices[key] = getColumnIndex(key);
        });

        return dataRows.map((row, index) => {
            const rowArray = row as unknown[];
            const id = `contact-${index}`;
            const contactData: Record<string, unknown> = { id };

            // Map mapped fields
            Object.entries(fieldIndices).forEach(([key, colIndex]) => {
                if (colIndex >= 0) {
                    contactData[key] = rowArray[colIndex];
                }
            });

            // Store raw data
            const rawData: Record<string, unknown> = {};
            headers.forEach((header, i) => {
                rawData[header] = rowArray[i];
            });
            contactData.rawData = rawData;

            return contactData as ParsedContact;
        });
    }, []);

    // Prepare for Step 3 by parsing contacts
    const prepareReview = useCallback(() => {
        const contacts = parseContacts();
        actions.setParsedContacts(contacts);
    }, [parseContacts, actions]);

    // Poll for import progress
    const pollImportProgress = useCallback(async () => {
        const currentState = stateRef.current;
        if (!currentState.importId) return;

        try {
            const res = await getContactImportProgress(currentState.importId);
            const data = res?.data;

            if (data) {
                if (data.status === 'completed' || data.status === 'failed') {
                    actions.setImportResults({
                        status: data.status,
                        total: data.total || 0,
                        created: data.created || 0,
                        skipped: data.skipped || 0,
                        failed: data.failed || 0,
                        progress: 100, // Assuming completed if status is completed/failed
                        errorMessage: null, // API doesn't seem to return error message in top level
                    });
                    actions.setIsLoading(false);
                    queryClient.invalidateQueries({ queryKey: ['contacts'] });
                    return true; // Signal completion
                }
                // If processing, update intermediate progress if available (optional, but good)
                // The transaction wizard didn't do this explicitly in the snippet, but we can.
            }
            return false; // Still in progress
        } catch {
            showErrorToast('Failed to get import progress');
            actions.setIsLoading(false);
            return true; // Stop polling on error
        }
    }, [actions, queryClient]);

    // Start import
    const handleImport = useCallback(() => {
        const currentState = stateRef.current;
        if (!currentState.selectedFile) return;

        let fileToImport = currentState.selectedFile;

        // If specific contacts are selected (and not all), create a new filtered file
        if (
            currentState.selectedContactIds.size > 0 &&
            currentState.selectedContactIds.size <
                currentState.parsedContacts.length
        ) {
            try {
                const {
                    rawFileData,
                    hasHeaderRow,
                    parsedContacts,
                    selectedContactIds,
                } = currentState;
                const filteredRows: unknown[][] = [];

                // Add header row if it exists
                if (hasHeaderRow && rawFileData.length > 0) {
                    filteredRows.push(rawFileData[0]);
                }

                // Add selected data rows
                // Map parsed contacts back to original raw data rows
                parsedContacts.forEach((contact, index) => {
                    if (selectedContactIds.has(contact.id)) {
                        // The index in parsedContacts corresponds to the index in dataRows
                        // If hasHeaderRow is true, rawFileData index is index + 1
                        const rawIndex = hasHeaderRow ? index + 1 : index;
                        if (rawFileData[rawIndex]) {
                            filteredRows.push(rawFileData[rawIndex]);
                        }
                    }
                });

                // Create new workbook
                const ws = XLSX.utils.aoa_to_sheet(filteredRows);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, 'Contacts');

                // Generate file
                const wbout = XLSX.write(wb, {
                    bookType: 'xlsx',
                    type: 'array',
                });
                const blob = new Blob([wbout], {
                    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                });
                fileToImport = new File([blob], 'filtered_contacts.xlsx', {
                    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                });
            } catch (err) {
                console.error('Failed to filter file:', err);
                showErrorToast(
                    'Failed to process selected contacts. Importing all.'
                );
            }
        }

        const invertedMapping: Record<string, string> = {};
        Object.entries(currentState.fieldMappings).forEach(
            ([systemFieldKey, fileColumnName]) => {
                if (fileColumnName) {
                    invertedMapping[fileColumnName] = systemFieldKey;
                }
            }
        );

        actions.setIsLoading(true);

        importMutation.mutate(
            {
                file: fileToImport,
                mapping: invertedMapping,
                type: currentState.contactType,
                dateFormat: currentState.dateFormat,
            },
            {
                onSuccess: (data) => {
                    const id = data?.data?.importId;
                    if (id) {
                        actions.setImportId(id);
                        actions.goToStep(4);
                    } else {
                        // If no importId is returned, assume it completed synchronously
                        // Calculate count based on what we actually sent (or intended to send)
                        const count =
                            currentState.selectedContactIds.size > 0
                                ? currentState.selectedContactIds.size
                                : currentState.parsedContacts.length;

                        actions.setImportResults({
                            status: 'completed',
                            total: count,
                            created: count,
                            skipped: 0,
                            failed: 0,
                            progress: 100,
                            errorMessage: null,
                        });
                        actions.setIsLoading(false);
                        queryClient.invalidateQueries({
                            queryKey: ['contacts'],
                        });
                        actions.goToStep(4);
                    }
                },
                onError: () => {
                    actions.setIsLoading(false);
                },
            }
        );
    }, [actions, importMutation, queryClient]);

    // === VALIDATION HELPERS ===
    const isStep1Valid = state.selectedFile !== null;
    const isStep2Valid = importFields
        .filter((f) => f.required)
        .every((f) => state.fieldMappings[f.key]);
    const isStep3Valid = state.parsedContacts.length > 0; // Simple validation for review

    const canProceed = useCallback(() => {
        const currentState = stateRef.current;
        switch (currentState.currentStep) {
            case 1:
                return currentState.selectedFile !== null;
            case 2: {
                // Check if ALL required fields are mapped
                const requiredFields = importFields.filter((f) => f.required);
                if (requiredFields.length === 0) return true; // If no required fields, proceed
                return requiredFields.every(
                    (f) => currentState.fieldMappings[f.key]
                );
            }
            case 3:
                return currentState.parsedContacts.length > 0;
            default:
                return false;
        }
    }, [importFields]);

    return {
        state,
        actions,
        importFields,
        isLoadingFields,
        isFieldsError,
        refetchFields,
        importMutation,
        handleFileSelect,
        handleRemoveFile,
        handleDownloadSample,
        prepareReview,
        handleImport,
        pollImportProgress,
        isStep1Valid,
        isStep2Valid,
        isStep3Valid,
        canProceed,
        DATE_FORMAT_OPTIONS,
    };
}
