import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { FaCloudUploadAlt, FaFileExcel } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import { useChartOfAccounts } from '../../services/apis/chartsAccountApi';
import { useCreateTransaction } from '../../services/apis/transactions';
import { showErrorToast, showSuccessToast } from '../../utills/toast';
import Popup from '../shared/Popup';
import Button from '../typography/Button';

interface ImportTransactionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedAccountId?: string;
}

const ImportTransactionsModal = ({
    isOpen,
    onClose,
    selectedAccountId,
}: ImportTransactionsModalProps) => {
    const [dragActive, setDragActive] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [targetAccountId, setTargetAccountId] = useState<string>(
        selectedAccountId || ''
    );
    const [isProcessing, setIsProcessing] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const { mutateAsync: createTransaction } = useCreateTransaction();
    const { data: accountsData } = useChartOfAccounts({
        isActive: true,
        limit: 100,
    });

    const accounts = accountsData?.data?.items || [];
    const validAccounts = accounts.filter(
        (a) =>
            a.accountType === 'asset' ||
            a.accountType === 'liability' ||
            a.accountDetailType === 'credit-card' ||
            a.accountDetailType === 'chequing'
    );

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = (file: File) => {
        if (
            file.type ===
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
            file.type === 'application/vnd.ms-excel' ||
            file.name.endsWith('.xlsx') ||
            file.name.endsWith('.xls') ||
            file.name.endsWith('.csv')
        ) {
            setSelectedFile(file);
        } else {
            showErrorToast('Invalid file type. Please upload Excel or CSV.');
        }
    };

    const processFile = async () => {
        if (!selectedFile) return;
        if (!targetAccountId) {
            showErrorToast('Please select a target account.');
            return;
        }

        setIsProcessing(true);
        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, {
                    raw: false,
                    dateNF: 'yyyy-mm-dd',
                });

                if (jsonData.length === 0) {
                    showErrorToast('File is empty or could not be parsed.');
                    setIsProcessing(false);
                    return;
                }

                let successCount = 0;
                let errorCount = 0;

                // Simple mapping strategy: Look for keys that contain 'date', 'amount', 'desc'
                // Or expect standard keys: Date, Description, Amount, Type
                for (const row of jsonData as Array<Record<string, unknown>>) {
                    // Normalize keys to lowercase for looser matching
                    const normalizedRow: Record<string, unknown> = {};
                    Object.keys(row).forEach((key) => {
                        normalizedRow[key.toLowerCase()] = row[key];
                    });

                    // Extract fields
                    const dateRaw =
                        normalizedRow['date'] ||
                        normalizedRow['paidat'] ||
                        normalizedRow['transaction date'];
                    const descriptionRaw =
                        normalizedRow['description'] ||
                        normalizedRow['desc'] ||
                        normalizedRow['memo'];
                    const amountRaw =
                        normalizedRow['amount'] || normalizedRow['value'];
                    const typeRaw =
                        normalizedRow['type'] || normalizedRow['category']; // basic guess

                    const dateStr = dateRaw ? String(dateRaw) : '';
                    const description = descriptionRaw
                        ? String(descriptionRaw)
                        : 'Imported Transaction';
                    const amountStr = amountRaw ? String(amountRaw) : '';
                    const typeStr = typeRaw ? String(typeRaw) : '';

                    if (!dateStr || !amountStr) {
                        console.warn('Skipping invalid row:', row);
                        errorCount++;
                        continue;
                    }

                    // Parse amount
                    let amount = parseFloat(
                        String(amountStr).replace(/[^0-9.-]/g, '')
                    );
                    if (isNaN(amount)) {
                        errorCount++;
                        continue;
                    }

                    // Determine Type (Income/Expense)
                    let type: 'income' | 'expense' = 'expense';
                    if (amount < 0) {
                        type = 'expense';
                        amount = Math.abs(amount);
                    } else {
                        // Default positive to income, unless 'type' says otherwise
                        if (
                            typeStr &&
                            String(typeStr).toLowerCase().includes('expense')
                        ) {
                            type = 'expense';
                        } else if (
                            typeStr &&
                            String(typeStr).toLowerCase().includes('income')
                        ) {
                            type = 'income';
                        } else {
                            // If no type column, assume positive is income? Or expense?
                            // Usually bank statements have -ve for expense.
                            // Let's assume positive = income, negative = expense if mixed.
                            // If user selected 'Credit Card' account, positive might be payment (income) and negative expense?
                            // Let's stick to: negative = expense, positive = income.
                            type = 'income';
                        }
                    }

                    // Force Expense if amount was negative in source
                    if (String(amountStr).includes('-')) {
                        type = 'expense';
                        amount = Math.abs(
                            parseFloat(
                                String(amountStr).replace(/[^0-9.-]/g, '')
                            )
                        );
                    }

                    // Construct Payload
                    try {
                        await createTransaction({
                            type,
                            accountId: targetAccountId,
                            paidAt: new Date(dateStr)
                                .toISOString()
                                .split('T')[0],
                            amount,
                            currencyCode: 'CAD', // Default
                            currencyRate: 1,
                            description: description,
                            paymentMethod: 'other',
                        });
                        successCount++;
                    } catch (err) {
                        console.error('Failed to create transaction:', err);
                        errorCount++;
                    }
                }

                if (successCount > 0) {
                    showSuccessToast(
                        `Successfully imported ${successCount} transactions.`
                    );
                    handleClose();
                } else {
                    showErrorToast(
                        `Failed to import transactions. ${errorCount} errors.`
                    );
                }
            } catch (error) {
                console.error('Error parsing file:', error);
                showErrorToast('Error parsing file.');
            } finally {
                setIsProcessing(false);
            }
        };

        reader.readAsBinaryString(selectedFile);
    };

    const handleClose = () => {
        setSelectedFile(null);
        setTargetAccountId(selectedAccountId || '');
        setIsProcessing(false);
        onClose();
    };

    return (
        <Popup
            isOpen={isOpen}
            onClose={handleClose}
            title="Import Transactions"
            size="md"
            footer={
                <div className="flex justify-end items-center w-full gap-2">
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        disabled={isProcessing}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={processFile}
                        disabled={
                            !selectedFile || !targetAccountId || isProcessing
                        }
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Importing...
                            </>
                        ) : (
                            'Import'
                        )}
                    </Button>
                </div>
            }
        >
            <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                        Target Account
                    </label>
                    <Select
                        value={targetAccountId}
                        onValueChange={setTargetAccountId}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Account" />
                        </SelectTrigger>
                        <SelectContent>
                            {validAccounts.map((account) => (
                                <SelectItem key={account.id} value={account.id}>
                                    {account.accountName}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {!selectedAccountId && (
                        <p className="text-xs text-gray-500">
                            Select the account these transactions belong to.
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                        Upload File
                    </label>
                    <div
                        className={`relative flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg transition-colors cursor-pointer
                            ${
                                dragActive
                                    ? 'border-primary bg-primary/5'
                                    : 'border-gray-300 hover:border-primary/50 hover:bg-gray-50'
                            }
                            ${selectedFile ? 'bg-primary/5 border-primary' : ''}
                        `}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => inputRef.current?.click()}
                    >
                        <input
                            ref={inputRef}
                            type="file"
                            className="hidden"
                            accept=".xlsx,.xls,.csv"
                            onChange={handleChange}
                        />

                        {selectedFile ? (
                            <div className="text-center">
                                <FaFileExcel className="w-8 h-8 text-secondary mx-auto mb-2" />
                                <p className="text-sm font-medium text-gray-900">
                                    {selectedFile.name}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {(selectedFile.size / 1024).toFixed(2)} KB
                                </p>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="mt-2 text-red-600 hover:text-red-700 hover:bg-red-50 h-auto py-1 px-2"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedFile(null);
                                        if (inputRef.current)
                                            inputRef.current.value = '';
                                    }}
                                >
                                    Remove
                                </Button>
                            </div>
                        ) : (
                            <div className="text-center p-4">
                                <FaCloudUploadAlt className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm font-medium text-gray-700">
                                    <span className="text-primary hover:underline">
                                        Click to upload
                                    </span>{' '}
                                    or drag and drop
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Supports Excel (.xlsx) and CSV (.csv)
                                </p>
                                <p className="text-xs text-gray-400 mt-2 italic">
                                    Expected columns: Date, Description, Amount
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Popup>
    );
};

export default ImportTransactionsModal;
