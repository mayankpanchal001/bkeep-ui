import { useEffect, useState } from 'react';
import { FaArrowRight, FaTimes } from 'react-icons/fa';
import { ImportField } from '../../services/apis/chartsAccountApi';
import { Button } from '../ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../ui/select';

interface ImportMappingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (mapping: Record<string, string>) => void;
    fileHeaders: string[];
    importFields: ImportField[];
    filename: string;
    isUploading?: boolean;
}

const ImportMappingModal = ({
    isOpen,
    onClose,
    onConfirm,
    fileHeaders,
    importFields,
    filename,
    isUploading = false,
}: ImportMappingModalProps) => {
    const [mapping, setMapping] = useState<Record<string, string>>({});

    // Auto-map fields with matching names (case-insensitive)
    useEffect(() => {
        if (isOpen && fileHeaders.length > 0 && importFields.length > 0) {
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
    }, [isOpen, fileHeaders, importFields]);

    const handleMappingChange = (fieldKey: string, header: string) => {
        setMapping((prev) => ({
            ...prev,
            [fieldKey]: header,
        }));
    };

    const handleConfirm = () => {
        onConfirm(mapping);
    };

    // Check if all required fields are mapped
    const isFormValid = importFields
        .filter((f) => f.required)
        .every((f) => mapping[f.key]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-card rounded-lg shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-primary/10">
                    <div>
                        <h2 className="text-xl font-semibold text-primary/90">
                            Map Import Fields
                        </h2>
                        <p className="text-sm text-primary/50 mt-1">
                            Map columns from{' '}
                            <span className="font-medium">{filename}</span> to
                            system fields
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-primary/40 hover:text-primary/60 transition-colors"
                    >
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-4 overflow-y-auto flex-1">
                    <div className="flex flex-col gap-4">
                        <div className="grid grid-cols-12 gap-4 text-sm font-medium text-primary/50 border-b border-primary/10 pb-2 mb-2">
                            <div className="col-span-5">System Field</div>
                            <div className="col-span-2 flex justify-center"></div>
                            <div className="col-span-5">File Column</div>
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
                                    <FaArrowRight />
                                </div>
                                <div className="col-span-5">
                                    <Select
                                        value={mapping[field.key] || ''}
                                        onValueChange={(e) =>
                                            handleMappingChange(field.key, e)
                                        }
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

                {/* Footer */}
                <div className="p-4 border-t border-primary/10 flex justify-end gap-3 bg-card">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isUploading}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={!isFormValid || isUploading}
                    >
                        Import Data
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ImportMappingModal;
