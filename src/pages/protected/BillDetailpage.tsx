import { Button } from '@/components/ui/button';
import { useBill } from '@/services/apis/billsApi';
import { Link, useParams } from 'react-router';

const CURRENCY_FORMAT = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
});

const BillDetailpage = () => {
    const { id } = useParams<{ id: string }>();
    const { data, isLoading, isError } = useBill(id ?? '');

    const bill = data?.data;

    if (isLoading) {
        return (
            <div className="text-muted-foreground">Loading bill details...</div>
        );
    }
    if (isError || !bill) {
        return (
            <div className="flex flex-col gap-4">
                <p className="text-destructive">Failed to load bill.</p>
                <Button asChild variant="outline">
                    <Link to="/expenses/bills">Back to Bills</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 max-w-2xl">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-primary">
                    Bill – {bill.supplierName}
                </h2>
                <Button asChild variant="outline">
                    <Link to="/expenses/bills">Back to Bills</Link>
                </Button>
            </div>
            <div className="rounded-lg border border-border bg-card p-4 space-y-3">
                <p>
                    <span className="text-muted-foreground">Due date:</span>{' '}
                    {new Date(bill.dueDate).toLocaleDateString()}
                </p>
                <p>
                    <span className="text-muted-foreground">Bill amount:</span>{' '}
                    {CURRENCY_FORMAT.format(bill.billAmount)}
                </p>
                <p>
                    <span className="text-muted-foreground">
                        Open balance:
                    </span>{' '}
                    {CURRENCY_FORMAT.format(bill.openBalance)}
                </p>
                <p>
                    <span className="text-muted-foreground">Status:</span>{' '}
                    {bill.status}
                </p>
            </div>
        </div>
    );
};

export default BillDetailpage;
