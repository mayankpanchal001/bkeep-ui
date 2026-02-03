
import { AlertCircle, ArrowRight, Loader2, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../../../ui/alert';
import { Button } from '../../../ui/button';
import { Label } from '../../../ui/label';
import { RadioGroup, RadioGroupItem } from '../../../ui/radio-group';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../../ui/select';
import { useImportContactsWizard } from '../useImportContactsWizard';

export function Step2Mapping() {
    const {
        state,
        actions,
        importFields,
        isLoadingFields,
        isFieldsError,
        refetchFields,
        DATE_FORMAT_OPTIONS,
    } = useImportContactsWizard();

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

            {/* Section 1: File Setup */}
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
                    {/* Header Row */}
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
                                {DATE_FORMAT_OPTIONS.map((option) => (
                                    <SelectItem
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Contact Type */}
                    <div className="space-y-2">
                        <Label>Default Contact Type</Label>
                        <RadioGroup
                            value={state.contactType}
                            onValueChange={(val) =>
                                actions.setContactType(
                                    val as 'supplier' | 'customer'
                                )
                            }
                            className="flex gap-4 pt-1"
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem
                                    value="supplier"
                                    id="r-supplier"
                                />
                                <Label htmlFor="r-supplier" className="font-normal">
                                    Supplier
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem
                                    value="customer"
                                    id="r-customer"
                                />
                                <Label htmlFor="r-customer" className="font-normal">
                                    Customer
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem
                                    value="employee"
                                    id="r-employee"
                                />
                                <Label htmlFor="r-employee" className="font-normal">
                                    Employee
                                </Label>
                            </div>
                        </RadioGroup>
                        <p className="text-xs text-muted-foreground">
                            Applied if 'Type' column is not mapped
                        </p>
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
                    {/* Loading State */}
                    {isLoadingFields && (
                        <div className="flex flex-col items-center justify-center py-8 border border-dashed rounded-lg bg-muted/20">
                            <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
                            <p className="text-sm text-muted-foreground">
                                Loading available fields...
                            </p>
                        </div>
                    )}

                    {/* Error State */}
                    {isFieldsError && !isLoadingFields && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Failed to load fields</AlertTitle>
                            <AlertDescription className="flex flex-col gap-2">
                                <p>
                                    There was an error retrieving the contact
                                    fields for mapping.
                                </p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-fit gap-2"
                                    onClick={() => refetchFields()}
                                >
                                    <RefreshCw className="h-3 w-3" />
                                    Try Again
                                </Button>
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Empty State */}
                    {!isLoadingFields &&
                        !isFieldsError &&
                        importFields.length === 0 && (
                            <Alert className="border-amber-200 bg-amber-50 text-amber-900">
                                <AlertCircle className="h-4 w-4 text-amber-600" />
                                <AlertTitle>No Fields Found</AlertTitle>
                                <AlertDescription>
                                    We couldn't find any contact fields to map
                                    to. This might be a configuration issue.
                                    <br />
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="mt-2 text-amber-800 border-amber-300 hover:bg-amber-100"
                                        onClick={() => refetchFields()}
                                    >
                                        <RefreshCw className="h-3 w-3 mr-2" />
                                        Refresh
                                    </Button>
                                </AlertDescription>
                            </Alert>
                        )}

                    {/* Mapping List */}
                    {!isLoadingFields &&
                        !isFieldsError &&
                        importFields.length > 0 && (
                            <>
                                {/* Table Header */}
                                <div className="grid grid-cols-12 gap-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border pb-2">
                                    <div className="col-span-12 md:col-span-5">
                                        System Field
                                    </div>
                                    <div className="hidden md:flex md:col-span-2 justify-center"></div>
                                    <div className="col-span-12 md:col-span-5">
                                        Your File Column
                                    </div>
                                </div>

                                {/* Mapping Rows */}
                                {importFields.map((field) => (
                                    <div
                                        key={field.key}
                                        className="grid grid-cols-12 gap-4 items-center py-2"
                                    >
                                        {/* System Field Label */}
                                        <div className="col-span-12 md:col-span-5">
                                            <div className="flex items-center gap-1">
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
                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                    {field.formatHint}
                                                </p>
                                            )}
                                        </div>

                                        {/* Arrow (Hidden on mobile) */}
                                        <div className="hidden md:flex md:col-span-2 justify-center text-muted-foreground">
                                            <ArrowRight className="w-4 h-4" />
                                        </div>

                                        {/* Column Selection */}
                                        <div className="col-span-12 md:col-span-5">
                                            <Select
                                                value={
                                                    state.fieldMappings[
                                                    field.key
                                                    ] || '__none__'
                                                }
                                                onValueChange={(value) =>
                                                    actions.updateFieldMapping(
                                                        field.key,
                                                        value === '__none__'
                                                            ? ''
                                                            : value
                                                    )
                                                }
                                            >
                                                <SelectTrigger
                                                    className={
                                                        !state.fieldMappings[
                                                            field.key
                                                        ] && field.required
                                                            ? 'border-red-300 focus:ring-red-200'
                                                            : ''
                                                    }
                                                >
                                                    <SelectValue placeholder="Select column..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="__none__">
                                                        -- Not mapped --
                                                    </SelectItem>
                                                    {state.fileHeaders.map(
                                                        (header) => (
                                                            <SelectItem
                                                                key={header}
                                                                value={header}
                                                            >
                                                                {header}
                                                            </SelectItem>
                                                        )
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}
                </div>
            </div>

            {/* Preview of columns */}
            {state.fileHeaders.length > 0 && (
                <div className="bg-muted/50 rounded-lg p-4 ml-8">
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
