import { useCallback, useEffect, useMemo, useRef } from 'react';
import * as XLSX from 'xlsx';
import { useImportWizardContext } from './ImportWizardContext';
import { ImportField, ParsedTransaction } from './types';
import {
    downloadTransactionSampleDouble,
    downloadTransactionSampleSingle,
    getTransactionImportProgress,
    useStartTransactionImport,
    useTransactionImportFields,
} from '../../../services/apis/transactions';
import { useChartOfAccounts } from '../../../services/apis/chartsAccountApi';
import { showErrorToast } from '../../../utills/toast';

export function useImportWizard() {
    // === ALL HOOKS MUST BE CALLED FIRST IN CONSISTENT ORDER ===

    // 1. Context
    const { state, actions } = useImportWizardContext();

    // 2. Refs (for stable callbacks)
    const stateRef = useRef(state);

    // 3. Queries
    const importFieldsQuery = useTransactionImportFields(state.columnMode);
    const accountsQuery = useChartOfAccounts({ isActive: true, limit: 100 });

    // 4. Mutations
    const importMutation = useStartTransactionImport();

    // === UPDATE REFS ===
    stateRef.current = state;

    // === DERIVED VALUES (using useMemo for stability) ===
    const importFields = useMemo<ImportField[]>(() => {
        return Array.isArray(importFieldsQuery.data?.data?.fields)
            ? importFieldsQuery.data!.data!.fields
            : [];
    }, [importFieldsQuery.data]);

    const allDateFormats = useMemo(() => {
        const providedFormats = importFieldsQuery.data?.data?.dateFormats || [];
        return providedFormats.includes('ddmmyyyy')
            ? providedFormats
            : ['ddmmyyyy', ...providedFormats];
    }, [importFieldsQuery.data]);

    const validAccounts = useMemo(() => {
        const accounts = accountsQuery.data?.data?.items || [];
        return accounts.filter(
            (a) =>
                a.accountType === 'asset' ||
                a.accountType === 'liability' ||
                a.accountDetailType === 'credit-card' ||
                a.accountDetailType === 'chequing'
        );
    }, [accountsQuery.data]);

    // === EFFECTS ===

    // Set default date format when fields data is loaded
    useEffect(() => {
        if (importFieldsQuery.data?.data?.dateFormats && !state.dateFormat) {
            const preferred = 'ddmmyyyy';
            const formats = importFieldsQuery.data.data.dateFormats;
            const defaultFormat = formats.includes(preferred)
                ? preferred
                : formats[0] || 'ddmmyyyy';
            actions.setDateFormat(defaultFormat);
        }
    }, [importFieldsQuery.data, state.dateFormat, actions]);

    // Auto-map fields when file headers and import fields are available
    useEffect(() => {
        if (
            state.fileHeaders.length > 0 &&
            importFields.length > 0 &&
            state.currentStep === 3
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
                        }) as unknown[][];

                        if (jsonData.length > 0) {
                            const headers = (jsonData[0] as unknown[]).map(
                                (h) => String(h)
                            );
                            resolve({ headers, data: jsonData });
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

    // Download sample files
    const handleDownloadSampleSingle = useCallback(async () => {
        try {
            const blob = await downloadTransactionSampleSingle();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'transactions_sample_single.xlsx';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch {
            showErrorToast('Failed to download sample file');
        }
    }, []);

    const handleDownloadSampleDouble = useCallback(async () => {
        try {
            const blob = await downloadTransactionSampleDouble();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'transactions_sample_double.xlsx';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch {
            showErrorToast('Failed to download sample file');
        }
    }, []);

    // Parse transactions from raw file data using mappings
    const parseTransactions = useCallback((): ParsedTransaction[] => {
        const currentState = stateRef.current;
        const {
            rawFileData,
            fieldMappings,
            hasHeaderRow,
            isReverseValues,
            columnMode,
        } = currentState;

        if (rawFileData.length === 0) return [];

        const headers = hasHeaderRow ? (rawFileData[0] as string[]) : [];
        const dataRows = hasHeaderRow ? rawFileData.slice(1) : rawFileData;

        const getColumnIndex = (fieldKey: string): number => {
            const mappedColumn = fieldMappings[fieldKey];
            if (!mappedColumn) return -1;
            return headers.indexOf(mappedColumn);
        };

        const dateColIndex = getColumnIndex('date');
        const descColIndex = getColumnIndex('description');
        const amountColIndex = getColumnIndex('amount');
        const creditColIndex = getColumnIndex('credit');
        const debitColIndex = getColumnIndex('debit');

        return dataRows
            .map((row, index) => {
                const rowArray = row as unknown[];
                const id = `tx-${index}`;

                const date =
                    dateColIndex >= 0
                        ? String(rowArray[dateColIndex] || '')
                        : '';
                const description =
                    descColIndex >= 0
                        ? String(rowArray[descColIndex] || '')
                        : '';

                let amount = 0;
                if (columnMode === 'single' && amountColIndex >= 0) {
                    amount =
                        parseFloat(String(rowArray[amountColIndex] || 0)) || 0;
                } else if (columnMode === 'double') {
                    const credit =
                        parseFloat(String(rowArray[creditColIndex] || 0)) || 0;
                    const debit =
                        parseFloat(String(rowArray[debitColIndex] || 0)) || 0;
                    amount = credit - debit;
                }

                if (isReverseValues) {
                    amount = -amount;
                }

                const rawData: Record<string, unknown> = {};
                headers.forEach((header, i) => {
                    rawData[header] = rowArray[i];
                });

                return {
                    id,
                    date,
                    description,
                    amount,
                    rawData,
                };
            })
            .filter((tx) => tx.date || tx.description || tx.amount !== 0);
    }, []);

    // Prepare for Step 4 by parsing transactions
    const prepareReview = useCallback(() => {
        const transactions = parseTransactions();
        actions.setParsedTransactions(transactions);
    }, [parseTransactions, actions]);

    // Poll for import progress
    const pollImportProgress = useCallback(async () => {
        const currentState = stateRef.current;
        if (!currentState.importId) return;

        try {
            const res = await getTransactionImportProgress(
                currentState.importId
            );
            const data = res?.data;

            if (data) {
                if (data.status === 'completed' || data.status === 'failed') {
                    actions.setImportResults({
                        status: data.status,
                        total: data.totalRows || 0,
                        created: data.successfulRows || 0,
                        skipped: 0,
                        failed: data.failedRows || 0,
                        progress: data.progress || 0,
                        errorMessage: data.errorMessage || null,
                    });
                    actions.setIsLoading(false);
                    return true; // Signal completion
                }
            }
            return false; // Still in progress
        } catch {
            showErrorToast('Failed to get import progress');
            actions.setIsLoading(false);
            return true; // Stop polling on error
        }
    }, [actions]);

    // Start import
    const handleImport = useCallback(() => {
        const currentState = stateRef.current;
        if (!currentState.selectedFile) return;

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
                file: currentState.selectedFile,
                mapping: invertedMapping,
                accountId: currentState.targetAccountId,
                dateFormat: currentState.dateFormat,
                columnMode: currentState.columnMode,
                isReverse: currentState.isReverseValues,
            },
            {
                onSuccess: (data) => {
                    // API returns 'id' not 'importId'
                    const id = data?.data?.id;
                    if (id) {
                        actions.setImportId(id);
                        actions.goToStep(5);
                    } else {
                        actions.setIsLoading(false);
                    }
                },
                onError: () => {
                    actions.setIsLoading(false);
                },
            }
        );
    }, [actions, importMutation]);

    // === VALIDATION HELPERS ===
    const isStep1Valid = state.selectedFile !== null;
    const isStep2Valid = state.targetAccountId !== '';
    const isStep3Valid =
        state.dateFormat !== '' &&
        importFields
            .filter((f) => f.required)
            .every((f) => state.fieldMappings[f.key]);
    const isStep4Valid = state.selectedTransactionIds.size > 0;

    const canProceed = useCallback(() => {
        const currentState = stateRef.current;
        switch (currentState.currentStep) {
            case 1:
                return currentState.selectedFile !== null;
            case 2:
                return currentState.targetAccountId !== '';
            case 3:
                return (
                    currentState.dateFormat !== '' &&
                    importFields
                        .filter((f) => f.required)
                        .every((f) => currentState.fieldMappings[f.key])
                );
            case 4:
                return currentState.selectedTransactionIds.size > 0;
            default:
                return false;
        }
    }, [importFields]);

    return {
        state,
        actions,
        importFields,
        allDateFormats,
        validAccounts,
        importMutation,
        handleFileSelect,
        handleRemoveFile,
        handleDownloadSampleSingle,
        handleDownloadSampleDouble,
        prepareReview,
        handleImport,
        pollImportProgress,
        isStep1Valid,
        isStep2Valid,
        isStep3Valid,
        isStep4Valid,
        canProceed,
    };
}
