import { Drawer, DrawerContent } from '../ui/drawer';
import { ImportTransactionsWizard } from './import-wizard/ImportTransactionsWizard';

interface ImportTransactionsDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

const ImportTransactionsDrawer = ({
    isOpen,
    onClose,
}: ImportTransactionsDrawerProps) => {
    const handleOpenChange = (open: boolean) => {
        if (!open && isOpen) {
            // Prevent closing via overlay click while processing
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
                    <ImportTransactionsWizard onClose={onClose} />
                </div>
            </DrawerContent>
        </Drawer>
    );
};

export default ImportTransactionsDrawer;
