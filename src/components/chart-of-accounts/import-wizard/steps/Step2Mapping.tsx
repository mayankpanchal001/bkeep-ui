import { ArrowRight } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../../ui/select';
import { useImportChartOfAccountsWizard } from '../useImportChartOfAccountsWizard';

export function Step2Mapping() {
    const { state, actions, importFields, isLoadingFields } =
        useImportChartOfAccountsWizard();

    const handleMappingChange = (fieldKey: string, header: string) => {
        actions.updateFieldMapping(fieldKey, header);
    };

    if (isLoadingFields) {
        return (
            <div className="flex items-center justify-center p-8">
                <span className="text-muted-foreground">Loading fields...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-lg font-semibold text-primary">
                    Map Import Fields
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                    Map the columns from your file to the system fields.
                </p>
            </div>

            {/* Mapping Table */}
            <div className="bg-muted/10 border border-border rounded-lg overflow-hidden">
                <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-muted/50 border-b border-border text-sm font-medium text-muted-foreground">
                    <div className="col-span-5 md:col-span-4">System Field</div>
                    <div className="col-span-2 md:col-span-1 text-center"></div>
                    <div className="col-span-5 md:col-span-7">File Column</div>
                </div>

                <div className="divide-y divide-border">
                    {importFields.map((field) => {
                        const isMapped = !!state.fieldMappings[field.key];
                        return (
                            <div
                                key={field.key}
                                className="grid grid-cols-12 gap-4 px-4 py-3 items-center hover:bg-muted/20 transition-colors"
                            >
                                <div className="col-span-5 md:col-span-4">
                                    <div className="flex flex-col">
                                        <div className="flex items-center">
                                            <span className="text-sm font-medium text-foreground">
                                                {field.label}
                                            </span>
                                            {field.required && (
                                                <span className="text-red-500 ml-1">
                                                    *
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-xs text-muted-foreground mt-0.5 font-mono">
                                            {field.key}
                                        </span>
                                    </div>
                                </div>

                                <div className="col-span-2 md:col-span-1 flex justify-center text-muted-foreground">
                                    <ArrowRight className="w-4 h-4" />
                                </div>

                                <div className="col-span-5 md:col-span-7">
                                    <Select
                                        value={
                                            state.fieldMappings[field.key] || ''
                                        }
                                        onValueChange={(value) =>
                                            handleMappingChange(
                                                field.key,
                                                value
                                            )
                                        }
                                    >
                                        <SelectTrigger
                                            className={`w-full ${
                                                isMapped
                                                    ? 'border-primary/50 bg-primary/5'
                                                    : ''
                                            }`}
                                        >
                                            <SelectValue placeholder="Select column..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {state.fileHeaders.map((header) => (
                                                <SelectItem
                                                    key={header}
                                                    value={header}
                                                >
                                                    {header}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
