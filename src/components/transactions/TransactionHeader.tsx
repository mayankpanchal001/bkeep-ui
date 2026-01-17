import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useChartOfAccounts } from '@/services/apis/chartsAccountApi';
import {
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ExternalLink,
    MessageSquare,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '../ui/button';
import { BankCard } from './BankCard';
import ImportTransactionsModal from './ImportTransactionsModal';

interface HeaderTransaction {
    accountId?: string;
    status: 'pending' | 'posted' | 'voided' | 'reversed';
    date: string;
}

interface TransactionHeaderProps {
    selectedAccountId?: string;
    onAccountSelect?: (accountId: string) => void;
    transactions?: HeaderTransaction[];
    onStatusSelect?: (
        status: 'pending' | 'posted' | 'voided' | 'reversed'
    ) => void;
}

function hashStringToHue(input: string) {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
        hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
    }
    return hash % 360;
}

function formatMMYY(date: Date) {
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yy = String(date.getFullYear()).slice(-2);
    return `${mm}/${yy}`;
}

function formatCardNumber(groups: number[]) {
    return groups.map((g) => String(g).padStart(4, '0')).join(' ');
}

export function TransactionHeader({
    selectedAccountId,
    onAccountSelect,
    transactions = [],
    onStatusSelect,
}: TransactionHeaderProps) {
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const { data: accountsResponse } = useChartOfAccounts({
        isActive: true,
        limit: 100,
    });
    const accounts = accountsResponse?.data?.items || [];

    // Filter for bank/credit card accounts usually relevant for transactions view
    // or just show all for now if not specified.
    const displayAccounts = accounts.filter(
        (a) =>
            a.accountType === 'asset' ||
            a.accountType === 'liability' ||
            a.accountDetailType === 'credit-card' ||
            a.accountDetailType === 'chequing'
    );

    const activeAccount = accounts.find((a) => a.id === selectedAccountId);

    // Check scroll position
    const checkScrollButtons = useCallback(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        setCanScrollLeft(container.scrollLeft > 0);
        setCanScrollRight(
            container.scrollLeft <
                container.scrollWidth - container.clientWidth - 10
        );
    }, []);

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        // Small delay to ensure DOM is updated
        const timeoutId = setTimeout(() => {
            checkScrollButtons();
        }, 100);

        container.addEventListener('scroll', checkScrollButtons);
        window.addEventListener('resize', checkScrollButtons);

        return () => {
            clearTimeout(timeoutId);
            container.removeEventListener('scroll', checkScrollButtons);
            window.removeEventListener('resize', checkScrollButtons);
        };
    }, [checkScrollButtons, displayAccounts.length]);

    const scrollLeft = () => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const cardWidth = 400; // w-96 = 384px + gap
        container.scrollBy({
            left: -cardWidth,
            behavior: 'smooth',
        });
    };

    const scrollRight = () => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const cardWidth = 400; // w-96 = 384px + gap
        container.scrollBy({
            left: cardWidth,
            behavior: 'smooth',
        });
    };

    return (
        <div className="space-y-6">
            {/* Top Header Row */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Account Selector */}
                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex items-center gap-2 text-xl font-semibold text-foreground hover:opacity-80 transition-opacity">
                                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-white">
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        className="w-5 h-5"
                                    >
                                        <rect
                                            x="2"
                                            y="5"
                                            width="20"
                                            height="14"
                                            rx="2"
                                        />
                                        <line x1="2" y1="10" x2="22" y2="10" />
                                    </svg>
                                </div>
                                {activeAccount?.accountName || 'All Accounts'}
                                <ChevronDown className="w-5 h-5 text-muted-foreground" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="start"
                            className="w-[300px]"
                        >
                            {displayAccounts.map((account) => (
                                <DropdownMenuItem
                                    key={account.id}
                                    onClick={() =>
                                        onAccountSelect?.(account.id)
                                    }
                                >
                                    {account.accountName}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 text-sm font-medium text-green-700 hover:text-green-800">
                        <MessageSquare className="w-4 h-4" />
                        Give feedback
                    </button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                                Requests
                                <ChevronDown className="w-4 h-4 ml-2" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem>No new requests</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button>
                                Link account
                                <ChevronDown className="w-4 h-4 ml-2" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem>
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Connect Bank
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => setIsImportModalOpen(true)}
                            >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Upload Statement
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Account Cards Row */}
            <div className="relative">
                {/* Left Arrow Button */}
                {canScrollLeft && (
                    <button
                        onClick={scrollLeft}
                        className="absolute left-2 top-1/2 -translate-y-1/2 z-30 bg-card/90 hover:bg-card shadow-lg rounded-full p-2 transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-green-600"
                        aria-label="Scroll left"
                    >
                        <ChevronLeft className="w-6 h-6 text-green-700" />
                    </button>
                )}

                {/* Right Arrow Button */}
                {canScrollRight && (
                    <button
                        onClick={scrollRight}
                        className="absolute right-2 top-1/2 -translate-y-1/2 z-30 bg-card/90 hover:bg-card shadow-lg rounded-full p-2 transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-green-600"
                        aria-label="Scroll right"
                    >
                        <ChevronRight className="w-6 h-6 text-green-700" />
                    </button>
                )}

                <div
                    ref={scrollContainerRef}
                    className="flex overflow-x-auto p-4 gap-4 scrollbar-hide relative"
                >
                    {displayAccounts
                        .sort((a, b) => {
                            // Put selected account first
                            if (selectedAccountId === a.id) return -1;
                            if (selectedAccountId === b.id) return 1;
                            return 0;
                        })
                        .map((account) => {
                            const isSelected = selectedAccountId === account.id;

                            const accountTransactions = transactions.filter(
                                (t) => t.accountId === account.id
                            );
                            const pendingCount = accountTransactions.filter(
                                (t) => t.status === 'pending'
                            ).length;
                            const postedCount = accountTransactions.filter(
                                (t) => t.status === 'posted'
                            ).length;
                            const voidedCount = accountTransactions.filter(
                                (t) => t.status === 'voided'
                            ).length;
                            const reversedCount = accountTransactions.filter(
                                (t) => t.status === 'reversed'
                            ).length;

                            const hue = hashStringToHue(
                                `${account.id}-${account.accountNumber}-${account.accountName}`
                            );
                            const createdAt = new Date(account.createdAt);
                            const valid = Number.isNaN(createdAt.getTime())
                                ? '--/--'
                                : formatMMYY(createdAt);
                            const expiryDate = new Date(
                                Number.isNaN(createdAt.getTime())
                                    ? Date.now()
                                    : createdAt.getTime()
                            );
                            expiryDate.setFullYear(
                                expiryDate.getFullYear() + 3
                            );
                            const expiry = formatMMYY(expiryDate);

                            const digits = (account.accountNumber || '')
                                .replace(/\D/g, '')
                                .slice(-4)
                                .padStart(4, '0');
                            const seedHue = hue + 1;
                            const group1 = (seedHue * 73 + 4642) % 10000;
                            const group2 = (seedHue * 97 + 3489) % 10000;
                            const group3 = (seedHue * 53 + 9867) % 10000;
                            const group4 = Number(digits);
                            const cardNumber = formatCardNumber([
                                group1,
                                group2,
                                group3,
                                group4,
                            ]);

                            return (
                                <BankCard
                                    key={account.id}
                                    accountName={account.accountName}
                                    cardNumber={cardNumber}
                                    valid={valid}
                                    expiry={expiry}
                                    hue={hue}
                                    isSelected={isSelected}
                                    pendingCount={pendingCount}
                                    postedCount={postedCount}
                                    voidedCount={voidedCount}
                                    reversedCount={reversedCount}
                                    onClick={() =>
                                        onAccountSelect?.(account.id)
                                    }
                                    onStatusClick={onStatusSelect}
                                />
                            );
                        })}
                </div>
            </div>

            <ImportTransactionsModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                selectedAccountId={selectedAccountId}
            />
        </div>
    );
}
