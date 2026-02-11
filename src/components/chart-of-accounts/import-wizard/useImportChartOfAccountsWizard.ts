import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
    downloadSampleData,
    getAccountImportProgress,
    useAccountsTemplatePreview,
    useApplyAccountsTemplate,
    useImportChartOfAccounts,
    useImportFields,
} from '../../../services/apis/chartsAccountApi';
import { showErrorToast } from '../../../utills/toast';
import { useImportChartOfAccountsWizardContext } from './ImportChartOfAccountsWizardContext';
import { ImportField, ParsedAccount } from './types';

// Fallback fields based on documentation
const DEFAULT_ACCOUNTS_IMPORT_FIELDS: ImportField[] = [
    { key: 'accountNumber', label: 'Account Number', required: false },
    { key: 'accountName', label: 'Account Name', required: true },
    { key: 'accountType', label: 'Account Type', required: true },
    { key: 'accountDetailType', label: 'Detail Type', required: false },
    { key: 'openingBalance', label: 'Opening Balance', required: false },
    {
        key: 'openingBalanceDate',
        label: 'Opening Balance Date',
        required: false,
    },
];

export function useImportChartOfAccountsWizard() {
    // 1. Context
    const { state, actions } = useImportChartOfAccountsWizardContext();
    const queryClient = useQueryClient();

    // 2. Refs
    const stateRef = useRef(state);

    // 3. Queries
    const importFieldsQuery = useImportFields();

    // Fetch template preview if selected (controlled by state)
    const { data: templatePreviewData, isLoading: isTemplatePreviewLoading } =
        useAccountsTemplatePreview(state.selectedTemplateId || undefined);

    // 4. Mutations
    const importFileMutation = useImportChartOfAccounts();
    const applyTemplateMutation = useApplyAccountsTemplate();

    // Update Refs
    stateRef.current = state;

    // Derived Values
    const importFields = useMemo<ImportField[]>(() => {
        const apiFields = Array.isArray(importFieldsQuery.data?.data)
            ? importFieldsQuery.data?.data || []
            : [];

        if (apiFields.length > 0) {
            return apiFields;
        }

        if (!importFieldsQuery.isLoading && !importFieldsQuery.isError) {
            return DEFAULT_ACCOUNTS_IMPORT_FIELDS;
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

    // Effects
    // Auto-map fields
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
    }, [
        state.fileHeaders,
        importFields,
        state.currentStep,
        state.fieldMappings,
        actions,
    ]);

    // Parse File Helper
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

    // Handle File Selection
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
                actions.setImportMethod('file');
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

    const handleRemoveFile = useCallback(() => {
        actions.setSelectedFile(null);
        actions.setFileHeaders([]);
        actions.setRawFileData([]);
    }, [actions]);

    const handleDownloadSample = useCallback(async () => {
        try {
            const blob = await downloadSampleData();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'chart_of_accounts_sample.xlsx';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch {
            showErrorToast('Failed to download sample file');
        }
    }, []);

    // Parse Accounts for Review
    const parseAccounts = useCallback((): ParsedAccount[] => {
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

        const fieldIndices: Record<string, number> = {};
        Object.keys(fieldMappings).forEach((key) => {
            fieldIndices[key] = getColumnIndex(key);
        });

        return dataRows.map((row, index) => {
            const rowArray = row as unknown[];
            const id = `account-${index}`;
            const accountData: Record<string, unknown> = { id };

            Object.entries(fieldIndices).forEach(([key, colIndex]) => {
                if (colIndex >= 0) {
                    accountData[key] = rowArray[colIndex];
                }
            });

            const rawData: Record<string, unknown> = {};
            headers.forEach((header, i) => {
                rawData[header] = rowArray[i];
            });
            accountData.rawData = rawData;

            return accountData as ParsedAccount;
        });
    }, []);

    const prepareReview = useCallback(() => {
        // Only needed for File import, for Template we rely on templatePreviewData
        const currentState = stateRef.current;
        if (currentState.importMethod === 'file') {
            const accounts = parseAccounts();
            actions.setParsedAccounts(accounts);
        }
    }, [parseAccounts, actions]);

    // Poll for import progress
    const pollImportProgress = useCallback(async () => {
        const currentState = stateRef.current;
        if (!currentState.importId) return;

        try {
            const res = await getAccountImportProgress(currentState.importId);
            const data = res?.data;

            if (data) {
                if (data.status === 'completed' || data.status === 'failed') {
                    actions.setImportResults({
                        status: data.status,
                        total: data.totalRows || 0,
                        created: data.successfulRows || 0,
                        skipped: 0, // API doesn't seem to return skipped in this response structure yet? Assuming 0 or handled by backend
                        failed: data.failedRows || 0,
                        errorMessage: data.errorMessage || null,
                        // Add progress if available in type
                    });
                    actions.setIsLoading(false);
                    await queryClient.invalidateQueries({
                        queryKey: ['accounts'],
                    });
                    await queryClient.refetchQueries({
                        queryKey: ['accounts'],
                    });
                    return true; // Signal completion
                }
            }
            return false; // Still in progress
        } catch {
            showErrorToast('Failed to get import progress');
            actions.setIsLoading(false);
            return true; // Stop polling on error
        }
    }, [actions, queryClient]);

    // Handle Import
    const handleImport = useCallback(() => {
        const currentState = stateRef.current;

        if (currentState.importMethod === 'template') {
            if (!currentState.selectedTemplateId) return;
            actions.setIsLoading(true);
            applyTemplateMutation.mutate(currentState.selectedTemplateId, {
                onSuccess: async (data) => {
                    actions.setImportResults({
                        status: 'completed',
                        total: data.data.summary.totalProcessed,
                        created: data.data.summary.created,
                        skipped: data.data.summary.skipped,
                        failed: data.data.summary.failed,
                    });
                    actions.setIsLoading(false);
                    await queryClient.invalidateQueries({
                        queryKey: ['accounts'],
                    });
                    await queryClient.refetchQueries({
                        queryKey: ['accounts'],
                    });
                    actions.goToStep(4);
                },
                onError: () => {
                    actions.setIsLoading(false);
                },
            });
            return;
        }

        // File Import
        if (!currentState.selectedFile) return;

        let fileToImport = currentState.selectedFile;

        // Filter Logic
        if (
            currentState.selectedAccountIds.size > 0 &&
            currentState.selectedAccountIds.size <
                currentState.parsedAccounts.length
        ) {
            try {
                const {
                    rawFileData,
                    hasHeaderRow,
                    parsedAccounts,
                    selectedAccountIds,
                } = currentState;
                const filteredRows: unknown[][] = [];

                if (hasHeaderRow && rawFileData.length > 0) {
                    filteredRows.push(rawFileData[0]);
                }

                parsedAccounts.forEach((account, index) => {
                    if (selectedAccountIds.has(account.id)) {
                        const rawIndex = hasHeaderRow ? index + 1 : index;
                        if (rawFileData[rawIndex]) {
                            filteredRows.push(rawFileData[rawIndex]);
                        }
                    }
                });

                const ws = XLSX.utils.aoa_to_sheet(filteredRows);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, 'Accounts');
                const wbout = XLSX.write(wb, {
                    bookType: 'xlsx',
                    type: 'array',
                });
                const blob = new Blob([wbout], {
                    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                });
                fileToImport = new File([blob], 'filtered_accounts.xlsx', {
                    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                });
            } catch (err) {
                console.error('Failed to filter file:', err);
                showErrorToast(
                    'Failed to process selected rows. Importing all.'
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

        importFileMutation.mutate(
            { file: fileToImport, mapping: invertedMapping },
            {
                onSuccess: async (data) => {
                    // Check if we got an ID for async processing
                    if (data && data.data && data.data.id) {
                        actions.setImportId(data.data.id);
                        actions.goToStep(4);
                        // Polling will be triggered by Step4Results or Effect
                    } else {
                        // Fallback to synchronous success
                        const count =
                            currentState.selectedAccountIds.size > 0
                                ? currentState.selectedAccountIds.size
                                : currentState.parsedAccounts.length;

                        actions.setImportResults({
                            status: 'completed',
                            total: count,
                            created: count,
                            skipped: 0,
                            failed: 0,
                        });
                        actions.setIsLoading(false);
                        await queryClient.invalidateQueries({
                            queryKey: ['accounts'],
                        });
                        await queryClient.refetchQueries({
                            queryKey: ['accounts'],
                        });
                        actions.goToStep(4);
                    }
                },
                onError: () => {
                    actions.setIsLoading(false);
                },
            }
        );
    }, [actions, applyTemplateMutation, importFileMutation, queryClient]);

    const canProceed = useCallback(() => {
        const currentState = stateRef.current;
        switch (currentState.currentStep) {
            case 1:
                if (currentState.importMethod === 'file') {
                    return currentState.selectedFile !== null;
                }
                return currentState.selectedTemplateId !== null;
            case 2: {
                // Check if ALL required fields are mapped
                if (currentState.importMethod === 'template') return true;
                const requiredFields = importFields.filter((f) => f.required);
                if (requiredFields.length === 0) return true;
                return requiredFields.every(
                    (f) => currentState.fieldMappings[f.key]
                );
            }
            case 3:
                // For template, we might assume it's valid if we are here
                if (currentState.importMethod === 'template') return true;
                return currentState.parsedAccounts.length > 0;
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
        templatePreviewData,
        isTemplatePreviewLoading,
        handleFileSelect,
        handleRemoveFile,
        handleDownloadSample,
        prepareReview,
        handleImport,
        pollImportProgress,
        canProceed,
    };
}
