
import { FileSpreadsheet, Upload } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { cn } from '../../../../utils/cn';
import { Button } from '../../../ui/button';

interface FileDropzoneProps {
    selectedFile: File | null;
    onFileSelect: (file: File) => void;
    onRemoveFile: () => void;
    isLoading?: boolean;
    accept?: string;
    className?: string;
}

export function FileDropzone({
    selectedFile,
    onFileSelect,
    onRemoveFile,
    isLoading = false,
    accept = '.xlsx,.xls,.csv',
    className,
}: FileDropzoneProps) {
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setDragActive(false);
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                onFileSelect(e.dataTransfer.files[0]);
            }
        },
        [onFileSelect]
    );

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            e.preventDefault();
            if (e.target.files && e.target.files[0]) {
                onFileSelect(e.target.files[0]);
            }
        },
        [onFileSelect]
    );

    const handleClick = useCallback(() => {
        if (!isLoading) {
            inputRef.current?.click();
        }
    }, [isLoading]);

    const handleRemove = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            onRemoveFile();
            if (inputRef.current) {
                inputRef.current.value = '';
            }
        },
        [onRemoveFile]
    );

    return (
        <div
            className={cn(
                'relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg transition-colors cursor-pointer',
                dragActive && 'border-primary bg-primary/10',
                !dragActive &&
                !selectedFile &&
                'border-primary/25 hover:border-primary/50 hover:bg-card',
                selectedFile && 'bg-primary/5 border-primary',
                isLoading && 'opacity-50 cursor-wait',
                className
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={handleClick}
        >
            <input
                ref={inputRef}
                type="file"
                className="hidden"
                accept={accept}
                onChange={handleChange}
                disabled={isLoading}
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
                        onClick={handleRemove}
                        disabled={isLoading}
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

            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-card/50 rounded-lg">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            )}
        </div>
    );
}
