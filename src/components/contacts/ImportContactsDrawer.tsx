import { Drawer, DrawerContent } from '../ui/drawer';
import { ImportContactsWizard } from './import-wizard/ImportContactsWizard';

interface ImportContactsDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

const ImportContactsDrawer = ({
    isOpen,
    onClose,
}: ImportContactsDrawerProps) => {
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
                    <ImportContactsWizard onClose={onClose} />
                </div>
            </DrawerContent>
        </Drawer>
    );
};

export default ImportContactsDrawer;
