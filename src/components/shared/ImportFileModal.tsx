import { useRef, useState } from 'react';
import { FaCloudUploadAlt, FaFileExcel } from 'react-icons/fa';
import {
    downloadSampleData,
    useAccountsTemplatePreview,
    useApplyAccountsTemplate,
} from '../../services/apis/chartsAccountApi';
import { useTemplates } from '../../services/apis/templatesApi';
import { Button } from '../ui/button';
import Popup from './Popup';

interface ImportFileModalProps {
    isOpen: boolean;
    onClose: () => void;
    onFileSelect: (file: File) => void;
}

const ImportFileModal = ({
    isOpen,
    onClose,
    onFileSelect,
}: ImportFileModalProps) => {
    const [dragActive, setDragActive] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
        null
    );
    const inputRef = useRef<HTMLInputElement>(null);

    const { data: templatesData, isLoading: isTemplatesLoading } = useTemplates(
        { type: 'chart_of_accounts', isActive: true, limit: 50 },
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
        // Validate file type (basic check)
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
            // Could add toast error here
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

    const handleConfirm = () => {
        if (selectedFile) {
            onFileSelect(selectedFile);
            // Reset local state
            setSelectedFile(null);
            setSelectedTemplateId(null);
        }
    };

    const handleApplyTemplate = () => {
        if (!selectedTemplateId) return;
        applyTemplateMutation.mutate(selectedTemplateId, {
            onSuccess: () => {
                setSelectedTemplateId(null);
                setSelectedFile(null);
                onClose();
            },
        });
    };

    const handleClose = () => {
        setSelectedFile(null);
        setSelectedTemplateId(null);
        onClose();
    };

    return (
        <Popup
            isOpen={isOpen}
            onClose={handleClose}
            title="Import Chart of Accounts"
            size="md"
            footer={
                <div className="flex justify-between items-center w-full">
                    <div className="flex gap-2">
                        {selectedTemplateId ? (
                            <Button
                                variant="outline"
                                onClick={handleApplyTemplate}
                                disabled={applyTemplateMutation.isPending}
                            >
                                Apply Template
                            </Button>
                        ) : null}
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleConfirm}
                            disabled={!selectedFile}
                        >
                            Continue
                        </Button>
                    </div>
                </div>
            }
        >
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-primary">
                            Templates
                        </p>
                        <Button onClick={handleDownloadSample}>
                            Download Sample File
                        </Button>
                    </div>

                    {isTemplatesLoading ? (
                        <p className="text-xs text-primary/50">
                            Loading templates...
                        </p>
                    ) : templates.length ? (
                        <div className="flex flex-wrap gap-2">
                            {templates.map((t) => (
                                <button
                                    key={t.id}
                                    type="button"
                                    onClick={() => setSelectedTemplateId(t.id)}
                                    className={`px-3 py-1.5 rounded text-sm border ${
                                        selectedTemplateId === t.id
                                            ? 'bg-primary text-white border-primary'
                                            : 'bg-card border-primary/10 text-primary hover:bg-primary/5'
                                    }`}
                                >
                                    {t.name || 'Template'}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-primary/50">
                            No templates available.
                        </p>
                    )}

                    {selectedTemplateId && (
                        <div className="rounded border border-primary/10 bg-card p-3">
                            {isTemplatePreviewLoading ? (
                                <p className="text-xs text-primary/50">
                                    Loading template preview...
                                </p>
                            ) : preview ? (
                                <div className="space-y-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-medium text-primary">
                                                {preview.template.name ||
                                                    'Template'}
                                            </p>
                                            <p className="text-xs text-primary/50">
                                                {preview.template.description ||
                                                    '—'}
                                            </p>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                setSelectedTemplateId(null)
                                            }
                                        >
                                            Clear
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="rounded border border-primary/10 p-2">
                                            <p className="text-[10px] text-primary/60">
                                                Total
                                            </p>
                                            <p className="text-sm font-medium text-primary">
                                                {preview.summary.totalAccounts}
                                            </p>
                                        </div>
                                        <div className="rounded border border-primary/10 p-2">
                                            <p className="text-[10px] text-primary/60">
                                                New
                                            </p>
                                            <p className="text-sm font-medium text-primary">
                                                {preview.summary.newAccounts}
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
                                            {preview.accounts.map((a) => (
                                                <div
                                                    key={`${a.accountNumber}-${a.accountName}`}
                                                    className="grid grid-cols-12 gap-2 px-3 py-2 border-t border-primary/10"
                                                >
                                                    <p className="col-span-3 text-xs text-primary">
                                                        {a.accountNumber}
                                                    </p>
                                                    <p className="col-span-6 text-xs text-primary">
                                                        {a.accountName}
                                                    </p>
                                                    <p className="col-span-3 text-xs text-right text-primary/70">
                                                        {a.willBeSkipped
                                                            ? 'Skipped'
                                                            : 'New'}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
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

                <p className="text-sm text-primary/50">
                    Upload your chart of accounts to quickly populate your
                    system. We support .xlsx, .xls, and .csv files.
                </p>

                <div
                    className={`relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg transition-colors cursor-pointer
                        ${
                            dragActive
                                ? 'border-primary bg-primary/50/10'
                                : 'border-primary/25 hover:border-primary/50 hover:bg-card'
                        }
                        ${selectedFile ? 'bg-primary/50/20 border-primary' : ''}
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
                            <FaFileExcel className="w-10 h-10 text-secondary mx-auto mb-2" />
                            <p className="text-sm font-medium text-primary">
                                {selectedFile.name}
                            </p>
                            <p className="text-xs text-primary/50 mt-1">
                                {(selectedFile.size / 1024).toFixed(2)} KB
                            </p>
                            <Button
                                size="sm"
                                className="mt-2 text-red-500 hover:text-red-700 hover:bg-red-50"
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
                        <div className="text-center">
                            <FaCloudUploadAlt className="w-10 h-10 text-primary/40 mx-auto mb-2" />
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
        </Popup>
    );
};

export default ImportFileModal;
