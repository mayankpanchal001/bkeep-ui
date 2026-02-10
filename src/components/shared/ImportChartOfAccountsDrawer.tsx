/* eslint-disable react-hooks/exhaustive-deps */
import { ArrowRight, FileSpreadsheet, Upload, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import {
    downloadSampleData,
    useAccountsTemplatePreview,
    useApplyAccountsTemplate,
    useImportChartOfAccounts,
    useImportFields,
} from '../../services/apis/chartsAccountApi';
import { useTemplates } from '../../services/apis/templatesApi';
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

interface ImportChartOfAccountsDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

type ImportStep = 'select' | 'template' | 'file-upload' | 'mapping';

const ImportChartOfAccountsDrawer = ({
    isOpen,
    onClose,
}: ImportChartOfAccountsDrawerProps) => {
    const [step, setStep] = useState<ImportStep>('select');
    const [importMethod, setImportMethod] = useState<
        'template' | 'file' | null
    >(null);
    const [dragActive, setDragActive] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
        null
    );
    const [fileHeaders, setFileHeaders] = useState<string[]>([]);
    const [mapping, setMapping] = useState<Record<string, string>>({});
    const inputRef = useRef<HTMLInputElement>(null);

    const { data: templatesData } = useTemplates(
        {
            type: 'accounts',
            isActive: true,
            limit: 50,
            sort: 'createdAt',
            order: 'asc',
        },
        isOpen
    );
    const templates = templatesData?.data?.items || [];
    const {
        data: templatePreviewData,
        isLoading: isTemplatePreviewLoading,
        error: templatePreviewError,
    } = useAccountsTemplatePreview(selectedTemplateId || undefined);
    const preview = templatePreviewData?.data;
    const applyTemplateMutation = useApplyAccountsTemplate();
    const { data: importFieldsData } = useImportFields();
    const importFields = importFieldsData?.data || [];
    const importMutation = useImportChartOfAccounts();

    // Auto-select "Standard Accounts" template when templates are loaded
    useEffect(() => {
        if (
            templates.length > 0 &&
            !selectedTemplateId &&
            step === 'template'
        ) {
            const standardAccountsTemplate = templates.find(
                (t) => t.name === 'Standard Accounts'
            );
            if (standardAccountsTemplate) {
                setSelectedTemplateId(standardAccountsTemplate.id);
            }
        }
    }, [templates, step, selectedTemplateId]);

    // Reset state when drawer closes
    useEffect(() => {
        if (!isOpen) {
            setStep('select');
            setImportMethod(null);
            setSelectedFile(null);
            setSelectedTemplateId(null);
            setFileHeaders([]);
            setMapping({});
            setDragActive(false);
        }
    }, [isOpen]);

    // Auto-map fields when file headers are available
    useEffect(() => {
        if (
            step === 'mapping' &&
            fileHeaders.length > 0 &&
            importFields.length > 0
        ) {
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
        // Validate file type
        if (
            file.type ===
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
            file.type === 'application/vnd.ms-excel' ||
            file.name.endsWith('.xlsx') ||
            file.name.endsWith('.xls') ||
            file.name.endsWith('.csv')
        ) {
            setSelectedFile(file);
            // Parse file to get headers
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
                    });

                    if (jsonData.length > 0) {
                        const headers = jsonData[0] as string[];
                        setFileHeaders(headers);

                        // Auto-map fields
                        const autoMapping: Record<string, string> = {};
                        importFields.forEach((field) => {
                            const match = headers.find(
                                (header) =>
                                    header.toLowerCase() ===
                                        field.label.toLowerCase() ||
                                    header.toLowerCase() ===
                                        field.key.toLowerCase()
                            );
                            if (match) {
                                autoMapping[field.key] = match;
                            }
                        });

                        // Check if all required fields are mapped

                        // Move to mapping step
                        setStep('mapping');
                        setImportMethod('file');
                    }
                } catch (error) {
                    console.error('Failed to parse file:', error);
                }
            };
            reader.readAsArrayBuffer(file);
        } else {
            console.error('Invalid file type');
        }
    };

    const handleDownloadSample = async () => {
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
        } catch (error) {
            console.error('Failed to download sample data', error);
        }
    };

    const handleMappingChange = (fieldKey: string, header: string) => {
        setMapping((prev) => ({
            ...prev,
            [fieldKey]: header,
        }));
    };

    const handleApplyTemplate = () => {
        if (!selectedTemplateId) return;
        applyTemplateMutation.mutate(selectedTemplateId, {
            onSuccess: () => {
                setSelectedTemplateId(null);
                onClose();
            },
        });
    };

    const handleImport = () => {
        if (selectedFile) {
            // Invert mapping: API expects {fileColumnName: systemFieldKey}
            // But we store {systemFieldKey: fileColumnName}
            const invertedMapping: Record<string, string> = {};
            Object.entries(mapping).forEach(
                ([systemFieldKey, fileColumnName]) => {
                    if (fileColumnName) {
                        invertedMapping[fileColumnName] = systemFieldKey;
                    }
                }
            );

            importMutation.mutate(
                { file: selectedFile, mapping: invertedMapping },
                {
                    onSuccess: () => {
                        onClose();
                    },
                }
            );
        }
    };

    const handleBack = () => {
        if (step === 'mapping') {
            if (importMethod === 'template') {
                setStep('template');
            } else {
                setStep('file-upload');
            }
            setMapping({});
        } else if (step === 'template' || step === 'file-upload') {
            setStep('select');
            setImportMethod(null);
            setSelectedFile(null);
            setSelectedTemplateId(null);
            setFileHeaders([]);
            setMapping({});
        }
    };

    const handleSelectMethod = (method: 'template' | 'file') => {
        setImportMethod(method);
        if (method === 'template') {
            setStep('template');
        } else {
            setStep('file-upload');
        }
    };

    // Check if all required fields are mapped
    const isFormValid =
        step === 'select'
            ? false
            : step === 'template'
              ? selectedTemplateId !== null
              : step === 'file-upload'
                ? selectedFile !== null
                : importFields
                      .filter((f) => f.required)
                      .every((f) => mapping[f.key]);

    const handleClose = () => {
        if (importMutation.isPending || applyTemplateMutation.isPending) {
            return;
        }
        onClose();
    };

    // Prevent closing on outside click or escape - only allow via close button
    // When dismissible={false}, vaul won't trigger onOpenChange for outside clicks
    // But we still handle it just in case
    const handleOpenChange = (open: boolean) => {
        // If vaul tries to close the drawer (outside click/escape), prevent it
        // Only allow closing when handleClose() is explicitly called
        if (!open && isOpen) {
            // Prevent closing - ignore the request from vaul
            // The drawer will only close when parent's isOpen prop changes via handleClose()
            return;
        }
    };

    return (
        <Drawer
            open={isOpen}
            onOpenChange={handleOpenChange}
            direction="bottom"
            dismissible={false}
        >
            <DrawerContent className="h-[100vh] max-h-[100vh] mt-0 rounded-none bg-card flex flex-col">
                <DrawerHeader className="flex flex-row items-center justify-between px-6 py-4 border-b border-primary/10">
                    <DrawerTitle className="text-xl font-medium text-primary">
                        {step === 'select'
                            ? 'Import Chart of Accounts'
                            : step === 'template'
                              ? 'Import from Template'
                              : step === 'file-upload'
                                ? 'Import from File'
                                : 'Map Import Fields'}
                    </DrawerTitle>
                    <button
                        onClick={handleClose}
                        className="p-2 -mr-2 text-primary/50 hover:text-primary rounded-full hover:bg-primary/10 transition-colors"
                        aria-label="Close"
                        disabled={
                            importMutation.isPending ||
                            applyTemplateMutation.isPending
                        }
                    >
                        <X className="h-5 w-5" />
                    </button>
                </DrawerHeader>

                <div className="flex-1 overflow-y-auto px-6 py-4">
                    {step === 'select' ? (
                        <div className="space-y-6 py-8">
                            <div className="text-center flex flex-col gap-2 mb-8">
                                <p className="text-lg font-medium text-primary">
                                    Choose Import Method
                                </p>
                                <p className="text-sm text-primary/50">
                                    Select how you want to import your chart of
                                    accounts
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                                {/* Template Option */}
                                <button
                                    type="button"
                                    onClick={() =>
                                        handleSelectMethod('template')
                                    }
                                    className="flex flex-col items-center justify-center p-6 border-2 border-primary/25 rounded-lg hover:border-primary hover:bg-primary/5 transition-all cursor-pointer group"
                                >
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20">
                                        <FileSpreadsheet className="w-6 h-6 text-primary" />
                                    </div>
                                    <h3 className="text-base font-medium text-primary mb-2">
                                        Import from Template
                                    </h3>
                                    <p className="text-xs text-primary/50 text-center">
                                        Use a pre-configured template to quickly
                                        set up your chart of accounts
                                    </p>
                                </button>

                                {/* File Upload Option */}
                                <button
                                    type="button"
                                    onClick={() => handleSelectMethod('file')}
                                    className="flex flex-col items-center justify-center p-6 border-2 border-primary/25 rounded-lg hover:border-primary hover:bg-primary/5 transition-all cursor-pointer group"
                                >
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20">
                                        <Upload className="w-6 h-6 text-primary" />
                                    </div>
                                    <h3 className="text-base font-medium text-primary mb-2">
                                        Import from File
                                    </h3>
                                    <p className="text-xs text-primary/50 text-center">
                                        Upload your own Excel or CSV file with
                                        account data
                                    </p>
                                </button>
                            </div>

                            <div className="text-center pt-4">
                                <Button onClick={handleDownloadSample}>
                                    Download Sample File
                                </Button>
                            </div>
                        </div>
                    ) : step === 'template' ? (
                        <div className="flex flex-col gap-4">
                            {/* Templates Section */}
                            <div className="flex flex-col gap-2">
                                {selectedTemplateId && (
                                    <div className="">
                                        {isTemplatePreviewLoading ? (
                                            <p className="text-xs text-primary/50">
                                                Loading template preview...
                                            </p>
                                        ) : preview ? (
                                            <div className="space-y-3">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-primary">
                                                            {preview.template
                                                                .name ||
                                                                'Template'}
                                                        </p>
                                                        <p className="text-xs text-primary/50">
                                                            {preview.template
                                                                .description ||
                                                                '—'}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-3 gap-2">
                                                    <div className="rounded border border-primary/10 p-2">
                                                        <p className="text-[10px] text-primary/60">
                                                            Total
                                                        </p>
                                                        <p className="text-sm font-medium text-primary">
                                                            {
                                                                preview.summary
                                                                    .totalAccounts
                                                            }
                                                        </p>
                                                    </div>
                                                    <div className="rounded border border-primary/10 p-2">
                                                        <p className="text-[10px] text-primary/60">
                                                            New
                                                        </p>
                                                        <p className="text-sm font-medium text-primary">
                                                            {
                                                                preview.summary
                                                                    .newAccounts
                                                            }
                                                        </p>
                                                    </div>
                                                    <div className="rounded border border-primary/10 p-2">
                                                        <p className="text-[10px] text-primary/60">
                                                            Skipped
                                                        </p>
                                                        <p className="text-sm font-medium text-primary">
                                                            {
                                                                preview.summary
                                                                    .skippedAccounts
                                                            }
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="rounded border border-primary/10 overflow-hidden">
                                                    <div className="grid grid-cols-12 gap-2 bg-primary/5 px-3 py-2">
                                                        <p className="col-span-3 text-[10px] font-medium text-primary/70">
                                                            Number
                                                        </p>
                                                        <p className="col-span-6 text-[10px] font-medium text-primary/70">
                                                            Name
                                                        </p>
                                                        <p className="col-span-3 text-[10px] font-medium text-primary/70 text-right">
                                                            Status
                                                        </p>
                                                    </div>
                                                    <div className="max-h-44 overflow-auto">
                                                        {preview.accounts.map(
                                                            (a) => (
                                                                <div
                                                                    key={`${a.accountNumber}-${a.accountName}`}
                                                                    className="grid grid-cols-12 gap-2 px-3 py-2 border-t border-primary/10"
                                                                >
                                                                    <p className="col-span-3 text-xs text-primary">
                                                                        {
                                                                            a.accountNumber
                                                                        }
                                                                    </p>
                                                                    <p className="col-span-6 text-xs text-primary">
                                                                        {
                                                                            a.accountName
                                                                        }
                                                                    </p>
                                                                    <p className="col-span-3 text-xs text-right text-primary/70">
                                                                        {a.willBeSkipped
                                                                            ? 'Skipped'
                                                                            : 'New'}
                                                                    </p>
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="flex flex-col gap-2 pt-3 border-t border-primary/10">
                                                    <p className="text-xs font-medium text-primary/70">
                                                        Choose an import option:
                                                    </p>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            onClick={
                                                                handleApplyTemplate
                                                            }
                                                            disabled={
                                                                applyTemplateMutation.isPending
                                                            }
                                                            loading={
                                                                applyTemplateMutation.isPending
                                                            }
                                                            className=""
                                                            tooltip={
                                                                'Apply Template Directly'
                                                            }
                                                        >
                                                            Apply
                                                        </Button>
                                                        {/* <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={
                                                                handleImportTemplateData
                                                            }
                                                            disabled={
                                                                !preview?.accounts ||
                                                                preview.accounts
                                                                    .length ===
                                                                    0
                                                            }
                                                            className="flex-1"
                                                        >
                                                            Import & Map
                                                            Template Data
                                                        </Button> */}
                                                    </div>
                                                    <p className="text-[10px] text-primary/50">
                                                        <strong>
                                                            Apply Directly:
                                                        </strong>{' '}
                                                        Import accounts
                                                        immediately without
                                                        mapping.{' '}
                                                        <strong>
                                                            Import & Map:
                                                        </strong>{' '}
                                                        Convert template to file
                                                        format for review and
                                                        custom mapping.
                                                    </p>
                                                </div>
                                            </div>
                                        ) : templatePreviewError ? (
                                            <p className="text-xs text-primary/50">
                                                Could not load template preview.
                                            </p>
                                        ) : (
                                            <p className="text-xs text-primary/50">
                                                Could not load template.
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : step === 'file-upload' ? (
                        <div className="flex flex-col gap-4">
                            {/* File Upload Section */}
                            <div className="flex flex-col gap-2">
                                <p className="text-sm text-primary/50">
                                    Upload your chart of accounts to quickly
                                    populate your system. We support .xlsx,
                                    .xls, and .csv files.
                                </p>

                                <div
                                    className={`relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg transition-colors cursor-pointer ${
                                        dragActive
                                            ? 'border-primary bg-primary/10'
                                            : 'border-primary/25 hover:border-primary/50 hover:bg-card'
                                    } ${
                                        selectedFile
                                            ? 'bg-primary/20 border-primary'
                                            : ''
                                    }`}
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
                                                {(
                                                    selectedFile.size / 1024
                                                ).toFixed(2)}{' '}
                                                KB
                                            </p>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="mt-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedFile(null);
                                                    if (inputRef.current)
                                                        inputRef.current.value =
                                                            '';
                                                }}
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="text-center">
                                            <Upload className="w-10 h-10 text-primary/40 mx-auto mb-2" />
                                            <p className="text-sm font-medium text-primary/70">
                                                <span className="text-primary hover:underline">
                                                    Click to upload
                                                </span>{' '}
                                                or drag and drop
                                            </p>
                                            <p className="text-xs text-primary/50 mt-1">
                                                Excel or CSV files
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : step === 'mapping' ? (
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-2">
                                <p className="text-sm text-primary/50">
                                    Map columns from{' '}
                                    <span className="font-medium">
                                        {selectedFile?.name}
                                    </span>{' '}
                                    to system fields
                                </p>
                            </div>

                            <div className="flex flex-col gap-4">
                                <div className="grid grid-cols-12 gap-4 text-sm font-medium text-primary/50 border-b border-primary/10 pb-2 mb-2">
                                    <div className="col-span-5">
                                        System Field
                                    </div>
                                    <div className="col-span-2 flex justify-center"></div>
                                    <div className="col-span-5">
                                        File Column
                                    </div>
                                </div>

                                {importFields.map((field) => (
                                    <div
                                        key={field.key}
                                        className="grid grid-cols-12 gap-4 items-center"
                                    >
                                        <div className="col-span-5">
                                            <div className="flex items-center">
                                                <span className="font-medium text-primary/70">
                                                    {field.label}
                                                </span>
                                                {field.required && (
                                                    <span className="text-red-500 ml-1">
                                                        *
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-xs text-primary/40 mt-0.5">
                                                {field.key}
                                            </div>
                                        </div>
                                        <div className="col-span-2 flex justify-center text-primary/30">
                                            <ArrowRight className="w-4 h-4" />
                                        </div>
                                        <div className="col-span-5">
                                            <Select
                                                value={mapping[field.key] || ''}
                                                onValueChange={(e) =>
                                                    handleMappingChange(
                                                        field.key,
                                                        e
                                                    )
                                                }
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select column..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {fileHeaders.map((h) => (
                                                        <SelectItem
                                                            key={h}
                                                            value={h}
                                                        >
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
                    ) : null}
                </div>

                <DrawerFooter className="flex flex-row items-center justify-between gap-3 px-6 py-4 border-t border-primary/10">
                    <div className="flex gap-2">
                        {step !== 'select' && (
                            <Button
                                variant="outline"
                                onClick={handleBack}
                                disabled={
                                    importMutation.isPending ||
                                    applyTemplateMutation.isPending
                                }
                            >
                                Back
                            </Button>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={handleClose}
                            disabled={
                                importMutation.isPending ||
                                applyTemplateMutation.isPending
                            }
                        >
                            Cancel
                        </Button>
                        {step === 'file-upload' ? (
                            <Button
                                onClick={() => setStep('mapping')}
                                disabled={!selectedFile || !isFormValid}
                            >
                                Continue
                            </Button>
                        ) : step === 'mapping' ? (
                            <Button
                                onClick={handleImport}
                                disabled={
                                    !isFormValid || importMutation.isPending
                                }
                                loading={importMutation.isPending}
                            >
                                Import Data
                            </Button>
                        ) : null}
                    </div>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
};

export default ImportChartOfAccountsDrawer;
