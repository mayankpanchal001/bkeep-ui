
import { ImportChartOfAccountsWizard } from '../chart-of-accounts/import-wizard/ImportChartOfAccountsWizard';
import {
    Drawer,
    DrawerContent,
} from '../ui/drawer';

interface ImportChartOfAccountsDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

const ImportChartOfAccountsDrawer = ({
    isOpen,
    onClose,
}: ImportChartOfAccountsDrawerProps) => {

    // Prevent closing on outside click or escape
    const handleOpenChange = (open: boolean) => {
        if (!open && isOpen) {
            return;
        }
    };

    return (
        <Drawer
            open={isOpen}
            onOpenChange={handleOpenChange}
            direction="bottom"
            dismissible={false}
        >
            <DrawerContent className="h-screen max-h-screen mt-0 rounded-none bg-card">
                <div className="w-full max-w-7xl mx-auto h-[calc(100%-1.5rem)]">
                    <ImportChartOfAccountsWizard onClose={onClose} />
                </div>
            </DrawerContent>
        </Drawer>
    );
};

export default ImportChartOfAccountsDrawer;
