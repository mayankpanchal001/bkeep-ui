import { useEffect, useState } from 'react';
import { FaArrowRight, FaTimes } from 'react-icons/fa';
import { ImportField } from '../../services/apis/chartsAccountApi';
import Button from '../typography/Button';
import { SelectField } from '../typography/InputFields';

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
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">
                            Map Import Fields
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Map columns from{' '}
                            <span className="font-medium">{filename}</span> to
                            system fields
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-4 overflow-y-auto flex-1">
                    <div className="space-y-4">
                        <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-500 border-b border-gray-100 pb-2 mb-2">
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
                                        <span className="font-medium text-gray-700">
                                            {field.label}
                                        </span>
                                        {field.required && (
                                            <span className="text-red-500 ml-1">
                                                *
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-xs text-gray-400 mt-0.5">
                                        {field.key}
                                    </div>
                                </div>
                                <div className="col-span-2 flex justify-center text-gray-300">
                                    <FaArrowRight />
                                </div>
                                <div className="col-span-5">
                                    <SelectField
                                        value={mapping[field.key] || ''}
                                        onChange={(e) =>
                                            handleMappingChange(
                                                field.key,
                                                e.target.value
                                            )
                                        }
                                        options={[
                                            {
                                                value: '',
                                                label: 'Select column...',
                                            },
                                            ...fileHeaders.map((h) => ({
                                                value: h,
                                                label: h,
                                            })),
                                        ]}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isUploading}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleConfirm}
                        disabled={!isFormValid || isUploading}
                        loading={isUploading}
                    >
                        Import Data
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ImportMappingModal;
