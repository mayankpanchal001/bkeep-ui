import { Download } from 'lucide-react';
import { Button } from '../../../ui/button';
import { FileDropzone } from '../components/FileDropzone';
import { useImportWizard } from '../useImportWizard';

export function Step1Upload() {
    const {
        state,
        handleFileSelect,
        handleRemoveFile,
        handleDownloadSampleSingle,
        handleDownloadSampleDouble,
    } = useImportWizard();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-lg font-semibold text-primary">
                    Upload your file
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                    Upload an Excel or CSV file containing your transactions
                </p>
            </div>

            {/* File Dropzone */}
            <FileDropzone
                selectedFile={state.selectedFile}
                onFileSelect={handleFileSelect}
                onRemoveFile={handleRemoveFile}
                isLoading={state.isLoading}
            />

            {/* Sample Downloads */}
            <div className="space-y-3">
                <p className="text-sm font-medium text-primary">
                    Need a template?
                </p>
                <div className="grid grid-cols-2 gap-3">
                    <Button
                        variant="outline"
                        onClick={handleDownloadSampleSingle}
                        className="justify-start"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Single Column Template
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handleDownloadSampleDouble}
                        className="justify-start"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Double Column Template
                    </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                    Single column has one Amount column. Double column has
                    separate Credit and Debit columns.
                </p>
            </div>

            {/* File Info */}
            {state.selectedFile && state.fileHeaders.length > 0 && (
                <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-sm font-medium text-primary mb-2">
                        File Preview
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Found {state.fileHeaders.length} columns:{' '}
                        <span className="text-foreground">
                            {state.fileHeaders.slice(0, 5).join(', ')}
                            {state.fileHeaders.length > 5 && '...'}
                        </span>
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                        {state.rawFileData.length - 1} data rows detected
                    </p>
                </div>
            )}
        </div>
    );
}
