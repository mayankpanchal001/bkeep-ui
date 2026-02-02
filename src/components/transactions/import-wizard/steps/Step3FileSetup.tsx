import { ArrowRight } from 'lucide-react';
import { Button } from '../../../ui/button';
import { Label } from '../../../ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../../ui/select';
import { useImportWizard } from '../useImportWizard';
import { ColumnMode } from '../types';

export function Step3FileSetup() {
    const { state, actions, importFields, allDateFormats } = useImportWizard();

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h2 className="text-lg font-semibold text-primary">
                    Let's set up your file
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                    Configure how your file should be parsed
                </p>
            </div>

            {/* Section 1: Format Setup */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">
                        1
                    </div>
                    <h3 className="font-medium text-primary">
                        Tell us about the format of your data
                    </h3>
                </div>

                <div className="ml-8 space-y-4">
                    {/* Header Row Toggle */}
                    <div className="space-y-2">
                        <Label>Is the first row a header?</Label>
                        <div className="flex gap-2">
                            <Button
                                variant={
                                    state.hasHeaderRow ? 'default' : 'outline'
                                }
                                size="sm"
                                onClick={() => actions.setHasHeaderRow(true)}
                            >
                                Yes
                            </Button>
                            <Button
                                variant={
                                    !state.hasHeaderRow ? 'default' : 'outline'
                                }
                                size="sm"
                                onClick={() => actions.setHasHeaderRow(false)}
                            >
                                No
                            </Button>
                        </div>
                    </div>

                    {/* Column Mode */}
                    <div className="space-y-2">
                        <Label>How many columns show amounts?</Label>
                        <div className="flex gap-2">
                            <Button
                                variant={
                                    state.columnMode === 'single'
                                        ? 'default'
                                        : 'outline'
                                }
                                size="sm"
                                onClick={() =>
                                    actions.setColumnMode(
                                        'single' as ColumnMode
                                    )
                                }
                            >
                                One column
                            </Button>
                            <Button
                                variant={
                                    state.columnMode === 'double'
                                        ? 'default'
                                        : 'outline'
                                }
                                size="sm"
                                onClick={() =>
                                    actions.setColumnMode(
                                        'double' as ColumnMode
                                    )
                                }
                            >
                                Two columns (Credit/Debit)
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {state.columnMode === 'single'
                                ? 'Single column uses positive/negative values for income/expense'
                                : 'Two columns have separate Credit and Debit columns'}
                        </p>
                    </div>

                    {/* Date Format */}
                    <div className="space-y-2">
                        <Label>What's the date format?</Label>
                        <Select
                            value={state.dateFormat}
                            onValueChange={actions.setDateFormat}
                        >
                            <SelectTrigger className="w-[200px]">
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
                </div>
            </div>

            {/* Section 2: Field Mapping */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">
                        2
                    </div>
                    <h3 className="font-medium text-primary">
                        Select the fields that correspond to your file
                    </h3>
                </div>

                <div className="ml-8 space-y-3">
                    {/* Mapping Table Header */}
                    <div className="grid grid-cols-12 gap-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border pb-2">
                        <div className="col-span-5">System Field</div>
                        <div className="col-span-2 flex justify-center"></div>
                        <div className="col-span-5">Your File Column</div>
                    </div>

                    {/* Mapping Rows */}
                    {importFields.map((field) => (
                        <div
                            key={field.key}
                            className="grid grid-cols-12 gap-4 items-center py-2"
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
                                {field.formatHint && (
                                    <div className="text-xs text-muted-foreground mt-0.5">
                                        {field.formatHint}
                                    </div>
                                )}
                            </div>
                            <div className="col-span-2 flex justify-center text-muted-foreground">
                                <ArrowRight className="w-4 h-4" />
                            </div>
                            <div className="col-span-5">
                                <Select
                                    value={
                                        state.fieldMappings[field.key] ||
                                        '__none__'
                                    }
                                    onValueChange={(value) =>
                                        actions.updateFieldMapping(
                                            field.key,
                                            value === '__none__' ? '' : value
                                        )
                                    }
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select column..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="__none__">
                                            -- Not mapped --
                                        </SelectItem>
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
                    ))}
                </div>
            </div>

            {/* Preview of detected columns */}
            {state.fileHeaders.length > 0 && (
                <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-sm font-medium text-primary mb-2">
                        Columns detected in your file:
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {state.fileHeaders.map((header) => (
                            <span
                                key={header}
                                className="inline-flex items-center px-2 py-1 rounded-md bg-card border border-border text-xs text-foreground"
                            >
                                {header}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
