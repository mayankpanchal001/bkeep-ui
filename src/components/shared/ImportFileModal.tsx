import { useRef, useState } from 'react';
import { FaCloudUploadAlt, FaFileExcel } from 'react-icons/fa';
import { downloadSampleData } from '../../services/apis/chartsAccountApi';
import Button from '../typography/Button';
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
    const inputRef = useRef<HTMLInputElement>(null);

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
        }
    };

    const handleClose = () => {
        setSelectedFile(null);
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
                    <Button onClick={handleDownloadSample}>
                        Download Sample File
                    </Button>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleConfirm}
                            disabled={!selectedFile}
                        >
                            Continue
                        </Button>
                    </div>
                </div>
            }
        >
            <div className="space-y-4">
                <p className="text-sm text-gray-500">
                    Upload your chart of accounts to quickly populate your
                    system. We support .xlsx, .xls, and .csv files.
                </p>

                <div
                    className={`relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg transition-colors cursor-pointer
                        ${
                            dragActive
                                ? 'border-primary bg-primary-50/10'
                                : 'border-gray-300 hover:border-primary/50 hover:bg-gray-50'
                        }
                        ${selectedFile ? 'bg-primary-50/20 border-primary' : ''}
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
                            <FaFileExcel className="w-10 h-10 text-green-600 mx-auto mb-2" />
                            <p className="text-sm font-medium text-gray-900">
                                {selectedFile.name}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
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
                            <FaCloudUploadAlt className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm font-medium text-gray-700">
                                <span className="text-primary hover:underline">
                                    Click to upload
                                </span>{' '}
                                or drag and drop
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
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
