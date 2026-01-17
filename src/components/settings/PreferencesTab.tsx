import { Calendar, Clock, DollarSign, Save } from 'lucide-react';
import { Button } from '../ui/button';
import {
    CardDescription,
    CardTitle
} from '../ui/card';
import { Label } from '../ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../ui/select';
import ThemeManager from './ThemeManager';
import { SettingsFormData } from './types';

interface PreferencesTabProps {
    formData: SettingsFormData;
    onFormDataChange: (data: SettingsFormData) => void;
    onSubmit: (e: React.FormEvent) => void;
}

const PreferencesTab = ({
    formData,
    onFormDataChange,
    onSubmit,
}: PreferencesTabProps) => {
    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-6">
                {/* Theme Manager */}
                <ThemeManager />


                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                <Clock className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-xl">
                                    Display & Localization
                                </CardTitle>
                                <CardDescription>
                                    Configure your timezone, currency, and date
                                    format preferences
                                </CardDescription>
                            </div>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Timezone */}
                            <div className="space-y-2">
                                <Label
                                    htmlFor="timezone"
                                    className="flex items-center gap-2"
                                >
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    Timezone
                                </Label>
                                <Select
                                    value={formData.timezone}
                                    onValueChange={(value) =>
                                        onFormDataChange({
                                            ...formData,
                                            timezone: value,
                                        })
                                    }
                                >
                                    <SelectTrigger id="timezone">
                                        <SelectValue placeholder="Select timezone" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="America/New_York">
                                            Eastern Time (ET)
                                        </SelectItem>
                                        <SelectItem value="America/Chicago">
                                            Central Time (CT)
                                        </SelectItem>
                                        <SelectItem value="America/Denver">
                                            Mountain Time (MT)
                                        </SelectItem>
                                        <SelectItem value="America/Los_Angeles">
                                            Pacific Time (PT)
                                        </SelectItem>
                                        <SelectItem value="America/Phoenix">
                                            Mountain Standard Time (MST)
                                        </SelectItem>
                                        <SelectItem value="America/Anchorage">
                                            Alaska Time (AKT)
                                        </SelectItem>
                                        <SelectItem value="Pacific/Honolulu">
                                            Hawaii Time (HST)
                                        </SelectItem>
                                        <SelectItem value="UTC">
                                            Coordinated Universal Time (UTC)
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Currency */}
                            <div className="space-y-2">
                                <Label
                                    htmlFor="currency"
                                    className="flex items-center gap-2"
                                >
                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                    Currency
                                </Label>
                                <Select
                                    value={formData.currency}
                                    onValueChange={(value) =>
                                        onFormDataChange({
                                            ...formData,
                                            currency: value,
                                        })
                                    }
                                >
                                    <SelectTrigger id="currency">
                                        <SelectValue placeholder="Select currency" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="USD">
                                            USD - US Dollar ($)
                                        </SelectItem>
                                        <SelectItem value="CAD">
                                            CAD - Canadian Dollar (C$)
                                        </SelectItem>
                                        <SelectItem value="EUR">
                                            EUR - Euro (€)
                                        </SelectItem>
                                        <SelectItem value="GBP">
                                            GBP - British Pound (£)
                                        </SelectItem>
                                        <SelectItem value="JPY">
                                            JPY - Japanese Yen (¥)
                                        </SelectItem>
                                        <SelectItem value="AUD">
                                            AUD - Australian Dollar (A$)
                                        </SelectItem>
                                        <SelectItem value="CHF">
                                            CHF - Swiss Franc (CHF)
                                        </SelectItem>
                                        <SelectItem value="CNY">
                                            CNY - Chinese Yuan (¥)
                                        </SelectItem>
                                        <SelectItem value="INR">
                                            INR - Indian Rupee (₹)
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Date Format */}
                            <div className="space-y-2 md:col-span-2">
                                <Label
                                    htmlFor="dateFormat"
                                    className="flex items-center gap-2"
                                >
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    Date Format
                                </Label>
                                <Select
                                    value={formData.dateFormat}
                                    onValueChange={(value) =>
                                        onFormDataChange({
                                            ...formData,
                                            dateFormat: value,
                                        })
                                    }
                                >
                                    <SelectTrigger id="dateFormat">
                                        <SelectValue placeholder="Select date format" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="MM/DD/YYYY">
                                            MM/DD/YYYY (US Format)
                                        </SelectItem>
                                        <SelectItem value="DD/MM/YYYY">
                                            DD/MM/YYYY (European Format)
                                        </SelectItem>
                                        <SelectItem value="YYYY-MM-DD">
                                            YYYY-MM-DD (ISO Format)
                                        </SelectItem>
                                        <SelectItem value="DD-MM-YYYY">
                                            DD-MM-YYYY (Alternative)
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4 border-t border-border">
                <Button
                    type="submit"
                    variant="default"
                    size="default"
                    className="min-w-[140px]"
                    startIcon={<Save className="w-4 h-4" />}
                >
                    Save Changes
                </Button>
            </div>
        </form>
    );
};

export default PreferencesTab;
