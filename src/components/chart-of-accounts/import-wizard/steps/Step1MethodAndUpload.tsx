import { Download, FileSpreadsheet, LayoutTemplate } from 'lucide-react';
import { useTemplates } from '../../../../services/apis/templatesApi';
import { cn } from '../../../../utils/cn';
import { Button } from '../../../ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../../ui/select';
import { FileDropzone } from '../components/FileDropzone';
import { useImportChartOfAccountsWizard } from '../useImportChartOfAccountsWizard';

export function Step1MethodAndUpload() {
    const {
        state,
        actions,
        handleFileSelect,
        handleRemoveFile,
        handleDownloadSample,
    } = useImportChartOfAccountsWizard();

    const { data: templatesData, isLoading: isTemplatesLoading } = useTemplates(
        {
            type: 'accounts',
            isActive: true,
            limit: 50,
            sort: 'createdAt',
            order: 'asc',
        }
    );
    const templates = templatesData?.data?.items || [];

    return (
        <div className="space-y-8 max-w-2xl mx-auto">
            {/* Header */}
            <div className="text-center">
                <h2 className="text-xl font-semibold text-primary">
                    Choose Import Method
                </h2>
                <p className="text-sm text-muted-foreground mt-2">
                    Select how you want to import your chart of accounts
                </p>
            </div>

            {/* Method Selection Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                    onClick={() => actions.setImportMethod('file')}
                    className={cn(
                        'flex flex-col items-center justify-center p-6 border-2 rounded-lg transition-all cursor-pointer group hover:border-primary hover:bg-primary/5',
                        state.importMethod === 'file'
                            ? 'border-primary bg-primary/5'
                            : 'border-muted'
                    )}
                >
                    <div
                        className={cn(
                            'w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors',
                            state.importMethod === 'file'
                                ? 'bg-primary/10 text-primary'
                                : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
                        )}
                    >
                        <FileSpreadsheet className="w-6 h-6" />
                    </div>
                    <h3
                        className={cn(
                            'text-base font-semibold mb-1',
                            state.importMethod === 'file'
                                ? 'text-primary'
                                : 'text-foreground'
                        )}
                    >
                        Import from File
                    </h3>
                    <p className="text-xs text-muted-foreground text-center">
                        Upload your own Excel or CSV file
                    </p>
                </button>

                <button
                    onClick={() => actions.setImportMethod('template')}
                    className={cn(
                        'flex flex-col items-center justify-center p-6 border-2 rounded-lg transition-all cursor-pointer group hover:border-primary hover:bg-primary/5',
                        state.importMethod === 'template'
                            ? 'border-primary bg-primary/5'
                            : 'border-muted'
                    )}
                >
                    <div
                        className={cn(
                            'w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors',
                            state.importMethod === 'template'
                                ? 'bg-primary/10 text-primary'
                                : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
                        )}
                    >
                        <LayoutTemplate className="w-6 h-6" />
                    </div>
                    <h3
                        className={cn(
                            'text-base font-semibold mb-1',
                            state.importMethod === 'template'
                                ? 'text-primary'
                                : 'text-foreground'
                        )}
                    >
                        Use a Template
                    </h3>
                    <p className="text-xs text-muted-foreground text-center">
                        Select from pre-defined account lists
                    </p>
                </button>
            </div>

            {/* Content Area */}
            <div className="pt-4 border-t border-border">
                {state.importMethod === 'file' ? (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div>
                            <h3 className="text-lg font-medium text-foreground mb-1">
                                Upload File
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Upload an Excel or CSV file containing your
                                accounts.
                            </p>
                        </div>

                        <FileDropzone
                            selectedFile={state.selectedFile}
                            onFileSelect={handleFileSelect}
                            onRemoveFile={handleRemoveFile}
                            isLoading={state.isLoading}
                        />

                        {/* File Info */}
                        {state.selectedFile && state.fileHeaders.length > 0 && (
                            <div className="bg-muted/50 rounded-lg p-4">
                                <p className="text-sm font-medium text-primary mb-2">
                                    File Analysis
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Found {state.fileHeaders.length} columns:{' '}
                                    <span className="text-foreground font-medium">
                                        {state.fileHeaders
                                            .slice(0, 5)
                                            .join(', ')}
                                        {state.fileHeaders.length > 5 && '...'}
                                    </span>
                                </p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {state.rawFileData.length > 1
                                        ? `${
                                              state.rawFileData.length - 1
                                          } data rows detected`
                                        : 'No data rows detected'}
                                </p>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-muted/30 p-4 rounded-lg">
                            <div>
                                <p className="text-sm font-medium text-foreground">
                                    Need a starting point?
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Download our sample file structure.
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleDownloadSample}
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Download Sample
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div>
                            <h3 className="text-lg font-medium text-foreground mb-1">
                                Select Template
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Choose a standard chart of accounts template to
                                start with.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">
                                Available Templates
                            </label>
                            <Select
                                value={state.selectedTemplateId || ''}
                                onValueChange={actions.setSelectedTemplateId}
                                disabled={isTemplatesLoading}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue
                                        placeholder={
                                            isTemplatesLoading
                                                ? 'Loading templates...'
                                                : 'Select a template...'
                                        }
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    {templates.map((template) => (
                                        <SelectItem
                                            key={template.id}
                                            value={template.id}
                                        >
                                            {template.name}
                                        </SelectItem>
                                    ))}
                                    {templates.length === 0 &&
                                        !isTemplatesLoading && (
                                            <div className="p-2 text-sm text-muted-foreground text-center">
                                                No templates available
                                            </div>
                                        )}
                                </SelectContent>
                            </Select>
                            {state.selectedTemplateId && (
                                <p className="text-xs text-muted-foreground mt-2">
                                    {
                                        templates.find(
                                            (t) =>
                                                t.id ===
                                                state.selectedTemplateId
                                        )?.description
                                    }
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
