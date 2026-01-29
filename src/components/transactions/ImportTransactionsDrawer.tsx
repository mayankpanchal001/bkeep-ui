import { ArrowRight, FileSpreadsheet, Upload, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { useChartOfAccounts } from '../../services/apis/chartsAccountApi';
import {
    downloadTransactionSampleDouble,
    downloadTransactionSampleSingle,
    getTransactionImportProgress,
    useStartTransactionImport,
    useTransactionImportFields,
} from '../../services/apis/transactions';
import { showErrorToast } from '../../utills/toast';
import { Button } from '../ui/button';
import {
    Drawer,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from '../ui/drawer';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../ui/select';
import { Switch } from '../ui/switch';

interface ImportTransactionsDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

type ImportStep = 'file-upload' | 'mapping' | 'progress';

const ImportTransactionsDrawer = ({
    isOpen,
    onClose,
}: ImportTransactionsDrawerProps) => {
    const [step, setStep] = useState<ImportStep>('file-upload');
    const [dragActive, setDragActive] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [fileHeaders, setFileHeaders] = useState<string[]>([]);
    const [mapping, setMapping] = useState<Record<string, string>>({});
    const [importId, setImportId] = useState<string | null>(null);
    const [progress, setProgress] = useState<{
        status: 'pending' | 'processing' | 'completed' | 'failed';
        processed?: number;
        total?: number;
        created?: number;
        skipped?: number;
        failed?: number;
    } | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const [mappingMode, setMappingMode] = useState<'single' | 'double'>('single');
    const { data: importFieldsData } = useTransactionImportFields(mappingMode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const importFields = Array.isArray(importFieldsData?.data?.fields)
        ? importFieldsData!.data!.fields
        : [];
    const providedDateFormats = importFieldsData?.data?.dateFormats || [];
    const allDateFormats = providedDateFormats.includes('ddmmyyyy')
        ? providedDateFormats
        : ['ddmmyyyy', ...providedDateFormats];
    const [dateFormat, setDateFormat] = useState<string>('ddmmyyyy');
    const [isReverse, setIsReverse] = useState<boolean>(false);
    const [targetAccountId, setTargetAccountId] = useState<string>('');
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
    const importMutation = useStartTransactionImport();

    useEffect(() => {
        const preferred = 'ddmmyyyy';
        const providedFormats = importFieldsData?.data?.dateFormats || [];
        const nextDefault =
            providedFormats.includes(preferred) && preferred
                ? preferred
                : preferred;
        setDateFormat((prev) => prev || nextDefault);
    }, [importFieldsData]);

    useEffect(() => {
        if (!isOpen) {
            setStep('file-upload');
            setSelectedFile(null);
            setFileHeaders([]);
            setMapping({});
            setDragActive(false);
            setImportId(null);
            setProgress(null);
            setTargetAccountId('');
            setDateFormat('');
            setIsReverse(false);
        }
    }, [isOpen]);

    useEffect(() => {
        if (step === 'mapping' && fileHeaders.length > 0 && importFields.length > 0) {
            const initialMapping: Record<string, string> = {};
            importFields.forEach((field) => {
                const match = fileHeaders.find(
                    (header) =>
                        header.toLowerCase() === field.label.toLowerCase() ||
                        header.toLowerCase() === field.key.toLowerCase()
                );
                if (match) {
                    initialMapping[field.key] = match;
                }
            });
            setMapping(initialMapping);
        }
    }, [step, fileHeaders, importFields]);

    useEffect(() => {
        let timer: number | undefined;
        const poll = async () => {
            if (!importId) return;
            try {
                const res = await getTransactionImportProgress(importId);
                const data = res?.data;
                if (data) {
                    setProgress({
                        status: data.status,
                        processed: data.processed,
                        total: data.total,
                        created: data.created,
                        skipped: data.skipped,
                        failed: data.failed,
                    });
                    if (data.status === 'completed' || data.status === 'failed') {
                        window.clearInterval(timer);
                    }
                }
            } catch {
                showErrorToast('Failed to get import progress');
            }
        };
        if (step === 'progress' && importId) {
            poll();
            timer = window.setInterval(poll, 1500);
        }
        return () => {
            if (timer) window.clearInterval(timer);
        };
    }, [step, importId]);

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
            file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
            file.type === 'application/vnd.ms-excel' ||
            file.name.endsWith('.xlsx') ||
            file.name.endsWith('.xls') ||
            file.name.endsWith('.csv')
        ) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target?.result as ArrayBuffer);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                    if (jsonData.length > 0) {
                        const headers = (jsonData[0] as unknown[]).map((h) => String(h));
                        setFileHeaders(headers);
                        setStep('mapping');
                    }
                } catch {
                    showErrorToast('Failed to parse file');
                }
            };
            reader.readAsArrayBuffer(file);
        }
    };

    const handleDownloadSampleSingle = async () => {
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
    };

    const handleDownloadSampleDouble = async () => {
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
    };

    const handleMappingChange = (fieldKey: string, header: string) => {
        setMapping((prev) => ({
            ...prev,
            [fieldKey]: header,
        }));
    };

    const handleImport = () => {
        if (selectedFile) {
            const invertedMapping: Record<string, string> = {};
            Object.entries(mapping).forEach(([systemFieldKey, fileColumnName]) => {
                if (fileColumnName) {
                    invertedMapping[fileColumnName] = systemFieldKey;
                }
            });
            importMutation.mutate(
                {
                    file: selectedFile,
                    mapping: invertedMapping,
                    accountId: targetAccountId,
                    dateFormat,
                    columnMode: mappingMode,
                    isReverse,
                },
                {
                    onSuccess: (data) => {
                        const id = data?.data?.importId;
                        if (id) {
                            setImportId(id);
                            setStep('progress');
                        } else {
                            onClose();
                        }
                    },
                }
            );
        }
    };

    const handleBack = () => {
        if (step === 'mapping') {
            setStep('file-upload');
            setMapping({});
        }
    };

    const isFormValid =
        step === 'file-upload'
            ? selectedFile !== null && !!targetAccountId && !!dateFormat
            : Array.isArray(importFields) &&
            importFields.filter((f) => f.required).every((f) => mapping[f.key]);

    const handleClose = () => {
        if (importMutation.isPending) {
            return;
        }
        onClose();
    };

    const handleOpenChange = (open: boolean) => {
        if (!open && isOpen) {
            return;
        }
    };

    return (
        <Drawer open={isOpen} onOpenChange={handleOpenChange} direction="bottom" dismissible={false}>
            <DrawerContent className="h-screen  max-h-screen mt-0 rounded-none bg-card flex flex-col">
                <div className="w-[min(100%,900px)] mx-auto my-auto">
                    <DrawerHeader className="flex flex-row items-center justify-between px-6 py-4 border-b border-primary/10">
                        <DrawerTitle className="text-xl font-semibold text-primary">
                            {step === 'file-upload'
                                ? 'Import Transactions from File'
                                : step === 'mapping'
                                    ? 'Map Import Fields'
                                    : 'Import Progress'}
                        </DrawerTitle>
                        <button
                            onClick={handleClose}
                            className="p-2 -mr-2 text-primary/50 hover:text-primary rounded-full hover:bg-primary/10 transition-colors"
                            aria-label="Close"
                            disabled={importMutation.isPending}
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </DrawerHeader>

                    <div className="flex-1 overflow-y-auto  mx-auto px-6 py-4">
                        {step === 'file-upload' ? (
                            <div className="space-y-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex flex-col gap-1">
                                        <p className="text-sm font-medium text-primary">Import Mode</p>
                                        <p className="text-xs text-primary/50">Choose the column style of your file</p>
                                    </div>
                                    <Select value={mappingMode} onValueChange={(v) => setMappingMode(v as 'single' | 'double')}>
                                        <SelectTrigger className="w-[160px]">
                                            <SelectValue placeholder="Select mode" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="single">Single Column</SelectItem>
                                            <SelectItem value="double">Double Column</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div className="flex flex-col gap-1">
                                        <p className="text-sm font-medium text-primary">Target Account</p>
                                        <Select value={targetAccountId} onValueChange={setTargetAccountId}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select account" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {validAccounts.map((account) => (
                                                    <SelectItem key={account.id} value={account.id}>
                                                        {account.accountName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <p className="text-sm font-medium text-primary">Date Format</p>
                                        <Select value={dateFormat} onValueChange={setDateFormat}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select date format" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {allDateFormats.map((fmt) => (
                                                    <SelectItem key={fmt} value={fmt}>
                                                        {fmt}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex items-end gap-2">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-medium text-primary">Reverse Amounts</p>
                                            <Switch checked={isReverse} onCheckedChange={setIsReverse} />
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <Button onClick={handleDownloadSampleSingle}>
                                        Download Single Column Sample
                                    </Button>
                                    <Button variant="outline" onClick={handleDownloadSampleDouble}>
                                        Download Double Column Sample
                                    </Button>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <div
                                        className={`relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg transition-colors cursor-pointer ${dragActive
                                            ? 'border-primary bg-primary/10'
                                            : 'border-primary/25 hover:border-primary/50 hover:bg-card'
                                            } ${selectedFile ? 'bg-primary/20 border-primary' : ''}`}
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
                                                <FileSpreadsheet className="w-10 h-10 text-secondary mx-auto mb-2" />
                                                <p className="text-sm font-medium text-primary">
                                                    {selectedFile.name}
                                                </p>
                                                <p className="text-xs text-primary/50 mt-1">
                                                    {(selectedFile.size / 1024).toFixed(2)} KB
                                                </p>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="mt-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedFile(null);
                                                        if (inputRef.current) inputRef.current.value = '';
                                                    }}
                                                >
                                                    Remove
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="text-center">
                                                <Upload className="w-10 h-10 text-primary/40 mx-auto mb-2" />
                                                <p className="text-sm font-medium text-primary/70">
                                                    <span className="text-primary hover:underline">Click to upload</span>{' '}
                                                    or drag and drop
                                                </p>
                                                <p className="text-xs text-primary/50 mt-1">Excel or CSV files</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : step === 'mapping' ? (
                            <div className="flex flex-col gap-4">
                                <div className="flex flex-col gap-2">
                                    <p className="text-sm text-primary/50">
                                        Map columns from <span className="font-medium">{selectedFile?.name}</span> to system
                                        fields
                                    </p>
                                </div>
                                <div className="flex flex-col gap-4">
                                    <div className="grid grid-cols-12 gap-4 text-sm font-medium text-primary/50 border-b border-primary/10 pb-2 mb-2">
                                        <div className="col-span-5">System Field</div>
                                        <div className="col-span-2 flex justify-center"></div>
                                        <div className="col-span-5">File Column</div>
                                    </div>
                                    {importFields.map((field) => (
                                        <div key={field.key} className="grid grid-cols-12 gap-4 items-center">
                                            <div className="col-span-5">
                                                <div className="flex items-center">
                                                    <span className="font-medium text-primary/70">{field.label}</span>
                                                    {field.required && <span className="text-red-500 ml-1">*</span>}
                                                </div>
                                                <div className="text-xs text-primary/40 mt-0.5">{field.key}</div>
                                            </div>
                                            <div className="col-span-2 flex justify-center text-primary/30">
                                                <ArrowRight className="w-4 h-4" />
                                            </div>
                                            <div className="col-span-5">
                                                <Select
                                                    value={mapping[field.key] || ''}
                                                    onValueChange={(e) => handleMappingChange(field.key, e)}
                                                >
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Select column..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {fileHeaders.map((h) => (
                                                            <SelectItem key={h} value={h}>
                                                                {h}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                <div className="rounded border border-primary/10 p-4">
                                    <p className="text-sm font-medium text-primary">Import Status</p>
                                    <div className="text-sm text-primary/60 mt-2">
                                        <div>Status: {progress?.status || 'processing'}</div>
                                        {progress?.total !== undefined && (
                                            <div>
                                                Processed {progress?.processed || 0} of {progress?.total}
                                            </div>
                                        )}
                                        <div>Created: {progress?.created || 0}</div>
                                        <div>Skipped: {progress?.skipped || 0}</div>
                                        <div>Failed: {progress?.failed || 0}</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <DrawerFooter className="flex flex-row items-center justify-between gap-3 px-6 py-4 border-t border-primary/10">
                        <div className="flex gap-2">
                            {step !== 'file-upload' && step !== 'progress' && (
                                <Button variant="outline" onClick={handleBack} disabled={importMutation.isPending}>
                                    Back
                                </Button>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={handleClose} disabled={importMutation.isPending}>
                                Cancel
                            </Button>
                            {step === 'file-upload' ? (
                                <Button onClick={() => setStep('mapping')} disabled={!selectedFile || !isFormValid}>
                                    Continue
                                </Button>
                            ) : step === 'mapping' ? (
                                <Button onClick={handleImport} disabled={!isFormValid || importMutation.isPending} loading={importMutation.isPending}>
                                    Import Data
                                </Button>
                            ) : step === 'progress' ? (
                                <Button onClick={onClose} variant="default">
                                    Done
                                </Button>
                            ) : null}
                        </div>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    );
};

export default ImportTransactionsDrawer;
