import { useTaxById } from '../../services/apis/taxApi';
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from '../ui/drawer';
import { Button } from '../ui/button';
import { Loader2 } from 'lucide-react';

interface TaxDetailDrawerProps {
    taxId: string | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const TaxDetailDrawer = ({
    taxId,
    open,
    onOpenChange,
}: TaxDetailDrawerProps) => {
    const { data, isLoading, error } = useTaxById(taxId || undefined);
    const tax = data?.data;

    return (
        <Drawer open={open} onOpenChange={onOpenChange} direction="right">
            <DrawerContent className="h-full w-[400px] ml-auto rounded-none border-l">
                <DrawerHeader>
                    <DrawerTitle>Tax Details</DrawerTitle>
                    <DrawerDescription>
                        View detailed information about this tax.
                    </DrawerDescription>
                </DrawerHeader>

                <div className="p-4 flex-1 overflow-y-auto">
                    {isLoading ? (
                        <div className="flex h-full items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : error ? (
                        <div className="flex h-full items-center justify-center text-destructive">
                            Failed to load tax details
                        </div>
                    ) : tax ? (
                        <div className="space-y-6">
                            <div className="space-y-1">
                                <h3 className="text-sm font-medium text-muted-foreground">
                                    Name
                                </h3>
                                <p className="text-lg font-medium">
                                    {tax.name}
                                </p>
                            </div>

                            <div className="space-y-1">
                                <h3 className="text-sm font-medium text-muted-foreground">
                                    Code
                                </h3>
                                <p className="text-base">{tax.code || '—'}</p>
                            </div>

                            <div className="space-y-1">
                                <h3 className="text-sm font-medium text-muted-foreground">
                                    Rate
                                </h3>
                                <p className="text-base">
                                    {(tax.rate || 0)}%
                                </p>
                            </div>

                            <div className="space-y-1">
                                <h3 className="text-sm font-medium text-muted-foreground">
                                    Description
                                </h3>
                                <p className="text-base">
                                    {tax.description || '—'}
                                </p>
                            </div>

                            <div className="space-y-1">
                                <h3 className="text-sm font-medium text-muted-foreground">
                                    Status
                                </h3>
                                <span
                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                        tax.isActive
                                            ? 'bg-secondary/20 text-secondary'
                                            : 'bg-destructive/10 text-destructive'
                                    }`}
                                >
                                    {tax.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground">
                            No tax found
                        </div>
                    )}
                </div>

                <DrawerFooter>
                    <DrawerClose asChild>
                        <Button variant="outline">Close</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
};

export default TaxDetailDrawer;
