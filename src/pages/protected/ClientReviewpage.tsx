import { SINGLE_TENANT_PREFIX } from '@/components/homepage/constants';
import PageHeader from '@/components/shared/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import Input from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/utils/cn';
import {
    AlertCircle,
    ArrowDownRight,
    ArrowUpRight,
    Bot,
    Calendar,
    Check,
    CheckCircle2,
    Clock,
    FileText,
    Filter,
    Inbox,
    MessageSquare,
    Save,
    Search,
    Sparkles,
    Tag,
    X,
} from 'lucide-react';
import { useState } from 'react';

const CAP_SINGULAR =
    SINGLE_TENANT_PREFIX.charAt(0).toUpperCase() +
    SINGLE_TENANT_PREFIX.slice(1);

type Transaction = {
    id: string;
    date: string;
    description: string;
    amount: number;
    suggestedCategory?: string;
    status: 'pending' | 'reviewed' | 'approved';
    clientComment?: string;
    aiConfidence?: number;
};

const MOCK_TRANSACTIONS: Transaction[] = [
    {
        id: '1',
        date: '2024-01-15',
        description: 'Payment to Vendor XYZ - Invoice #12345',
        amount: 1250.0,
        suggestedCategory: 'Office Supplies',
        status: 'pending',
        aiConfidence: 65,
    },
    {
        id: '2',
        date: '2024-01-18',
        description: 'Bank Transfer - Monthly Subscription',
        amount: 99.99,
        suggestedCategory: 'Software',
        status: 'pending',
        aiConfidence: 72,
    },
    {
        id: '3',
        date: '2024-01-20',
        description: 'Payment - Unclear Transaction',
        amount: 450.0,
        status: 'pending',
        aiConfidence: 45,
    },
    {
        id: '4',
        date: '2024-01-22',
        description: `Refund from ${CAP_SINGULAR} ABC`,
        amount: -500.0,
        suggestedCategory: 'Refunds',
        status: 'reviewed',
        clientComment: 'This is a refund for overpayment',
        aiConfidence: 80,
    },
];

const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
});

const statusConfig = {
    pending: {
        label: 'Pending',
        variant: 'warning' as const,
        icon: AlertCircle,
    },
    reviewed: {
        label: 'Reviewed',
        variant: 'secondary' as const,
        icon: Clock,
    },
    approved: {
        label: 'Approved',
        variant: 'success' as const,
        icon: CheckCircle2,
    },
};

const ClientReviewpage = () => {
    const [transactions, setTransactions] =
        useState<Transaction[]>(MOCK_TRANSACTIONS);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [selectedTransaction, setSelectedTransaction] =
        useState<Transaction | null>(null);
    const [comment, setComment] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');

    const filteredTransactions = transactions.filter((transaction) => {
        const matchesSearch =
            transaction.description
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            transaction.suggestedCategory
                ?.toLowerCase()
                .includes(searchQuery.toLowerCase());
        const matchesStatus =
            statusFilter === 'all' || transaction.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const pendingCount = transactions.filter(
        (t) => t.status === 'pending'
    ).length;
    const reviewedCount = transactions.filter(
        (t) => t.status === 'reviewed'
    ).length;
    const approvedCount = transactions.filter(
        (t) => t.status === 'approved'
    ).length;

    const handleReview = (transaction: Transaction) => {
        setSelectedTransaction(transaction);
        setComment(transaction.clientComment || '');
        setSelectedCategory(transaction.suggestedCategory || '');
    };

    const handleCloseModal = () => {
        setSelectedTransaction(null);
        setComment('');
        setSelectedCategory('');
    };

    const handleSaveReview = () => {
        if (!selectedTransaction) return;

        const updatedTransactions = transactions.map((t) =>
            t.id === selectedTransaction.id
                ? {
                      ...t,
                      status: 'reviewed' as const,
                      clientComment: comment,
                      suggestedCategory:
                          selectedCategory || t.suggestedCategory,
                  }
                : t
        );
        setTransactions(updatedTransactions);
        handleCloseModal();
    };

    const handleApprove = (transactionId: string) => {
        const updatedTransactions = transactions.map((t) =>
            t.id === transactionId ? { ...t, status: 'approved' as const } : t
        );
        setTransactions(updatedTransactions);
    };

    const getConfidenceColor = (confidence: number) => {
        if (confidence >= 70) return 'text-green-600';
        if (confidence >= 50) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getConfidenceProgressColor = (confidence: number) => {
        if (confidence >= 70) return 'bg-green-500';
        if (confidence >= 50) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title={`${CAP_SINGULAR} Review`}
                subtitle={`${filteredTransactions.length} transactions • ${pendingCount} pending review`}
            />

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Pending Card */}
                <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-all hover:shadow-md hover:border-yellow-500/30">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-bl from-yellow-500/10 to-transparent rounded-bl-full" />
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                Pending Review
                            </p>
                            <p className="text-3xl font-bold text-foreground mt-1">
                                {pendingCount}
                            </p>
                        </div>
                        <div className="h-12 w-12 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                            <AlertCircle className="h-6 w-6 text-yellow-600" />
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                        Requires your attention
                    </p>
                </div>

                {/* Reviewed Card */}
                <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-all hover:shadow-md hover:border-blue-500/30">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-bl from-blue-500/10 to-transparent rounded-bl-full" />
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                Reviewed
                            </p>
                            <p className="text-3xl font-bold text-foreground mt-1">
                                {reviewedCount}
                            </p>
                        </div>
                        <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                            <Clock className="h-6 w-6 text-blue-600" />
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                        Awaiting approval
                    </p>
                </div>

                {/* Approved Card */}
                <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-all hover:shadow-md hover:border-green-500/30">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-bl from-green-500/10 to-transparent rounded-bl-full" />
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                Approved
                            </p>
                            <p className="text-3xl font-bold text-foreground mt-1">
                                {approvedCount}
                            </p>
                        </div>
                        <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                            <CheckCircle2 className="h-6 w-6 text-green-600" />
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                        Completed this period
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 p-4 rounded-xl border border-border bg-card">
                <div className="flex-1">
                    <Input
                        placeholder="Search transactions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        startIcon={<Search className="h-4 w-4" />}
                        clearable
                        onClear={() => setSearchQuery('')}
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="h-3.5 w-3.5 text-yellow-600" />
                                Pending
                            </div>
                        </SelectItem>
                        <SelectItem value="reviewed">
                            <div className="flex items-center gap-2">
                                <Clock className="h-3.5 w-3.5 text-blue-600" />
                                Reviewed
                            </div>
                        </SelectItem>
                        <SelectItem value="approved">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                                Approved
                            </div>
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Transactions List */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
                {filteredTransactions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 px-4">
                        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                            <Inbox className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <p className="text-lg font-medium text-foreground">
                            No transactions found
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                            Try adjusting your search or filter criteria
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-border">
                        {filteredTransactions.map((transaction) => {
                            const StatusIcon =
                                statusConfig[transaction.status].icon;
                            return (
                                <div
                                    key={transaction.id}
                                    className="p-4 hover:bg-muted/30 transition-colors"
                                >
                                    <div className="flex items-start gap-4">
                                        {/* Status Icon */}
                                        <div
                                            className={cn(
                                                'h-10 w-10 rounded-lg flex items-center justify-center shrink-0',
                                                transaction.status ===
                                                    'pending' &&
                                                    'bg-yellow-500/10',
                                                transaction.status ===
                                                    'reviewed' &&
                                                    'bg-blue-500/10',
                                                transaction.status ===
                                                    'approved' &&
                                                    'bg-green-500/10'
                                            )}
                                        >
                                            <StatusIcon
                                                className={cn(
                                                    'h-5 w-5',
                                                    transaction.status ===
                                                        'pending' &&
                                                        'text-yellow-600',
                                                    transaction.status ===
                                                        'reviewed' &&
                                                        'text-blue-600',
                                                    transaction.status ===
                                                        'approved' &&
                                                        'text-green-600'
                                                )}
                                            />
                                        </div>

                                        {/* Main Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-foreground truncate">
                                                        {transaction.description}
                                                    </p>
                                                    <div className="flex items-center gap-3 mt-1.5">
                                                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                                            <Calendar className="h-3 w-3" />
                                                            {new Date(
                                                                transaction.date
                                                            ).toLocaleDateString(
                                                                'en-US',
                                                                {
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                    year: 'numeric',
                                                                }
                                                            )}
                                                        </span>
                                                        {transaction.suggestedCategory && (
                                                            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                                                <Tag className="h-3 w-3" />
                                                                {
                                                                    transaction.suggestedCategory
                                                                }
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Amount */}
                                                <div className="text-right shrink-0">
                                                    <div
                                                        className={cn(
                                                            'font-semibold flex items-center gap-1 justify-end',
                                                            transaction.amount <
                                                                0
                                                                ? 'text-red-600'
                                                                : 'text-green-600'
                                                        )}
                                                    >
                                                        {transaction.amount <
                                                        0 ? (
                                                            <ArrowDownRight className="h-4 w-4" />
                                                        ) : (
                                                            <ArrowUpRight className="h-4 w-4" />
                                                        )}
                                                        {currencyFormatter.format(
                                                            Math.abs(
                                                                transaction.amount
                                                            )
                                                        )}
                                                    </div>
                                                    {transaction.aiConfidence && (
                                                        <div className="flex items-center gap-1.5 mt-1 justify-end">
                                                            <Bot className="h-3 w-3 text-muted-foreground" />
                                                            <span
                                                                className={cn(
                                                                    'text-xs font-medium',
                                                                    getConfidenceColor(
                                                                        transaction.aiConfidence
                                                                    )
                                                                )}
                                                            >
                                                                {
                                                                    transaction.aiConfidence
                                                                }
                                                                %
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* AI Confidence Bar */}
                                            {transaction.aiConfidence && (
                                                <div className="mt-3">
                                                    <div className="flex items-center gap-2">
                                                        <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
                                                        <span className="text-xs text-muted-foreground">
                                                            AI Confidence
                                                        </span>
                                                        <div className="flex-1 max-w-[120px]">
                                                            <Progress
                                                                value={
                                                                    transaction.aiConfidence
                                                                }
                                                                className="h-1.5"
                                                                indicatorClassName={getConfidenceProgressColor(
                                                                    transaction.aiConfidence
                                                                )}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Client Comment */}
                                            {transaction.clientComment && (
                                                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-100 dark:border-blue-900/50">
                                                    <div className="flex items-start gap-2">
                                                        <MessageSquare className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                                                        <p className="text-sm text-blue-800 dark:text-blue-200">
                                                            {
                                                                transaction.clientComment
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 shrink-0">
                                            <Badge
                                                variant={
                                                    statusConfig[
                                                        transaction.status
                                                    ].variant
                                                }
                                            >
                                                {
                                                    statusConfig[
                                                        transaction.status
                                                    ].label
                                                }
                                            </Badge>
                                            {transaction.status ===
                                                'pending' && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleReview(
                                                            transaction
                                                        )
                                                    }
                                                    startIcon={
                                                        <MessageSquare className="h-3.5 w-3.5" />
                                                    }
                                                >
                                                    Review
                                                </Button>
                                            )}
                                            {transaction.status ===
                                                'reviewed' && (
                                                <Button
                                                    size="sm"
                                                    onClick={() =>
                                                        handleApprove(
                                                            transaction.id
                                                        )
                                                    }
                                                    startIcon={
                                                        <Check className="h-3.5 w-3.5" />
                                                    }
                                                >
                                                    Approve
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Review Modal */}
            <Dialog
                open={!!selectedTransaction}
                onOpenChange={(open) => !open && handleCloseModal()}
            >
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Review Transaction
                        </DialogTitle>
                        <DialogDescription>
                            Add your comments and categorize this transaction
                        </DialogDescription>
                    </DialogHeader>

                    {selectedTransaction && (
                        <div className="space-y-6">
                            {/* Transaction Details Card */}
                            <div className="rounded-lg border border-border bg-muted/30 p-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-foreground">
                                            {selectedTransaction.description}
                                        </p>
                                        <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                                            <span className="inline-flex items-center gap-1">
                                                <Calendar className="h-3.5 w-3.5" />
                                                {new Date(
                                                    selectedTransaction.date
                                                ).toLocaleDateString('en-US', {
                                                    weekday: 'long',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                    <div
                                        className={cn(
                                            'text-xl font-bold',
                                            selectedTransaction.amount < 0
                                                ? 'text-red-600'
                                                : 'text-green-600'
                                        )}
                                    >
                                        {currencyFormatter.format(
                                            selectedTransaction.amount
                                        )}
                                    </div>
                                </div>

                                {/* AI Suggestion */}
                                {selectedTransaction.aiConfidence && (
                                    <>
                                        <Separator className="my-4" />
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                                    <Sparkles className="h-4 w-4 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-foreground">
                                                        AI Suggestion
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {
                                                            selectedTransaction.suggestedCategory
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Progress
                                                    value={
                                                        selectedTransaction.aiConfidence
                                                    }
                                                    className="w-20 h-2"
                                                    indicatorClassName={getConfidenceProgressColor(
                                                        selectedTransaction.aiConfidence
                                                    )}
                                                />
                                                <span
                                                    className={cn(
                                                        'text-sm font-medium',
                                                        getConfidenceColor(
                                                            selectedTransaction.aiConfidence
                                                        )
                                                    )}
                                                >
                                                    {
                                                        selectedTransaction.aiConfidence
                                                    }
                                                    %
                                                </span>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Category Input */}
                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Input
                                    id="category"
                                    placeholder="Enter or confirm category"
                                    value={selectedCategory}
                                    onChange={(e) =>
                                        setSelectedCategory(e.target.value)
                                    }
                                    startIcon={<Tag className="h-4 w-4" />}
                                />
                                {selectedTransaction.suggestedCategory &&
                                    selectedCategory !==
                                        selectedTransaction.suggestedCategory && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setSelectedCategory(
                                                    selectedTransaction.suggestedCategory ||
                                                        ''
                                                )
                                            }
                                            className="text-xs text-primary hover:underline flex items-center gap-1"
                                        >
                                            <Sparkles className="h-3 w-3" />
                                            Use AI suggestion: "
                                            {
                                                selectedTransaction.suggestedCategory
                                            }
                                            "
                                        </button>
                                    )}
                            </div>

                            {/* Comment Input */}
                            <div className="space-y-2">
                                <Label htmlFor="comment">Your Comment</Label>
                                <Textarea
                                    id="comment"
                                    placeholder="Add any notes or comments about this transaction..."
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    rows={4}
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={handleCloseModal}>
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                        </Button>
                        <Button onClick={handleSaveReview}>
                            <Save className="h-4 w-4 mr-2" />
                            Save Review
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ClientReviewpage;
