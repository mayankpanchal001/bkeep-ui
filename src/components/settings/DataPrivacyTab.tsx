import { Icons } from '../shared/Icons';
import { Button } from '../ui/button';

const DataPrivacyTab = () => {
    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-primary mb-4">
                Data & Privacy
            </h3>
            <div className="flex flex-col gap-4">
                <div className="p-4 border border-primary/10 rounded">
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <div className="font-medium text-primary">
                                Export Data
                            </div>
                            <div className="text-sm text-primary/50">
                                Download a copy of your data
                            </div>
                        </div>
                        <Button variant="outline">
                            <Icons.Download className="w-4 h-4" />
                            Export Data
                        </Button>
                    </div>
                </div>
                <div className="p-4 border border-destructive/20 bg-destructive/10 rounded">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="font-medium text-destructive">
                                Delete Account
                            </div>
                            <div className="text-sm text-destructive">
                                Permanently delete your account and all data
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            className="border-destructive/30 text-destructive hover:bg-destructive/10"
                        >
                            <Icons.Trash className="w-4 h-4" />
                            Delete Account
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DataPrivacyTab;
