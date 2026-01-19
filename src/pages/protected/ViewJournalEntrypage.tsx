import { Column, DataTable } from '@/components/shared/DataTable';
import Loading from '@/components/shared/Loading';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useChartOfAccounts } from '@/services/apis/chartsAccountApi';
import { useContacts } from '@/services/apis/contactsApi';
import { ChevronDown, Copy, GripVertical } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Badge } from '../../components/ui/badge';
import {
    useCreateJournalEntry,
    useJournalEntries,
    useJournalEntry,
    useReorderJournalEntryLines,
} from '../../services/apis/journalApi';
import type {
    CreateJournalEntryPayload,
    JournalEntry,
    JournalEntryLine,
} from '../../types/journal';
import { cn } from '../../utils/cn';

const toNumber = (v: unknown) => {
    if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
    if (typeof v === 'string') {
        const n = Number(v);
        return Number.isFinite(n) ? n : 0;
    }
    return 0;
};

const formatDateOnly = (value: unknown) => {
    if (typeof value !== 'string' || !value) return '—';
    const normalized = value.includes('T') ? value : `${value}T00:00:00`;
    const dt = new Date(normalized);
    if (Number.isNaN(dt.getTime())) return value;
    return dt.toLocaleDateString();
};

const formatDateTime = (value: unknown) => {
    if (typeof value !== 'string' || !value) return '—';
    const dt = new Date(value);
    if (Number.isNaN(dt.getTime())) return value;
    return dt.toLocaleString();
};

const formatText = (value: unknown) => {
    if (value === null || value === undefined) return '—';
    const str = String(value).trim();
    return str ? str : '—';
};

const formatBoolean = (value: unknown) => {
    if (typeof value !== 'boolean') return '—';
    return value ? 'Yes' : 'No';
};

// Helper function to get next journal entry number
function getNextJournalEntryNumber(current: string | undefined | null): string {
    if (!current) return '1';

    // Numbers
    if (/^\d+$/.test(current)) {
        const nextNum = parseInt(current, 10) + 1;

        if (current.startsWith('0') && current.length > 1) {
            return String(nextNum).padStart(current.length, '0');
        }
        return String(nextNum);
    }

    const match = current.match(/^(.*?)(\d+)$/);
    if (match) {
        const prefix = match[1];
        const numberPart = match[2];
        const nextNum = parseInt(numberPart, 10) + 1;

        const nextNumStr = String(nextNum).padStart(numberPart.length, '0');
        return prefix + nextNumStr;
    }

    // Letters updating
    if (/^[a-zA-Z]+$/.test(current)) {
        const chars = current.split('');
        let i = chars.length - 1;
        while (i >= 0) {
            const charCode = chars[i].charCodeAt(0);
            if (chars[i] === 'z') {
                chars[i] = 'a';
                i--;
            } else if (chars[i] === 'Z') {
                chars[i] = 'A';
                i--;
            } else {
                chars[i] = String.fromCharCode(charCode + 1);
                return chars.join('');
            }
        }
    }
    return '1';
}

export default function ViewJournalEntrypage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data, isLoading } = useJournalEntry(id!);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [selectedLineIds, setSelectedLineIds] = useState<string[]>([]);
    const [draggedLineId, setDraggedLineId] = useState<string | null>(null);
    const [dragOverLineId, setDragOverLineId] = useState<string | null>(null);
    const [showCopyPreview, setShowCopyPreview] = useState(false);
    const [copyPreviewData, setCopyPreviewData] =
        useState<CreateJournalEntryPayload | null>(null);
    const reorderMutation = useReorderJournalEntryLines();
    const createMutation = useCreateJournalEntry();

    // Fetch journal entries sorted by entryNumber to find the highest one
    // We'll get multiple entries to ensure we find the highest numeric value
    const { data: allEntriesData } = useJournalEntries({
        page: 1,
        limit: 100, // Fetch enough entries to find the highest number
        sort: 'entryNumber',
        order: 'desc',
    });

    const dragLeaveTimeoutRef = useRef<
        Map<HTMLElement, ReturnType<typeof setTimeout>>
    >(new Map());

    const journalEntry = useMemo<JournalEntry | undefined>(() => {
        const root = data as unknown as Record<string, unknown> | undefined;
        const firstData = root?.data as Record<string, unknown> | undefined;
        const candidates = [
            firstData?.journalEntry,
            firstData?.data,
            firstData,
            root?.journalEntry,
        ];
        const entry = candidates.find(
            (v) => typeof v === 'object' && v !== null
        ) as Record<string, unknown> | undefined;
        if (!entry) return undefined;
        if (typeof entry.id === 'string' && Array.isArray(entry.lines))
            return entry as unknown as JournalEntry;
        if (
            typeof (entry as { journalEntry?: unknown }).journalEntry ===
                'object' &&
            (entry as { journalEntry?: Record<string, unknown> }).journalEntry
        ) {
            const nested = (entry as { journalEntry: Record<string, unknown> })
                .journalEntry;
            if (typeof nested.id === 'string' && Array.isArray(nested.lines))
                return nested as unknown as JournalEntry;
        }
        return undefined;
    }, [data]);

    const { data: contactsData } = useContacts({
        page: 1,
        limit: 200,
        isActive: true,
        sort: 'displayName',
        order: 'asc',
    });

    const { data: accountsData } = useChartOfAccounts({
        page: 1,
        limit: 200,
    });

    const contactNameById = useMemo(() => {
        const items =
            (
                contactsData as unknown as {
                    data?: {
                        items?: Array<{ id: string; displayName: string }>;
                    };
                }
            )?.data?.items || [];
        const map = new Map<string, string>();
        for (const c of items) {
            if (c?.id) map.set(c.id, c.displayName);
        }
        return map;
    }, [contactsData]);

    // Create account name map for preview
    const accountNameMap = useMemo(() => {
        const accounts = accountsData?.data?.items || [];
        const map = new Map<string, string>();
        for (const account of accounts) {
            if (account?.id) {
                const label = account.accountNumber
                    ? `${account.accountNumber} - ${account.accountName}`
                    : account.accountName;
                map.set(account.id, label);
            }
        }
        return map;
    }, [accountsData]);

    // Get the highest entry number from all journal entries
    // This must be called before any early returns to follow Rules of Hooks
    const highestEntryNumber = useMemo(() => {
        const entries = allEntriesData?.data?.journalEntries || [];
        if (entries.length === 0) return null;

        // Find the entry with the highest numeric value in entryNumber
        let highest: string | null = null;
        let highestNumeric = -1;

        entries.forEach((entry) => {
            if (!entry.entryNumber) return;

            // Extract numeric part from entry number
            const match = entry.entryNumber.match(/(\d+)$/);
            if (match) {
                const numeric = parseInt(match[1], 10);
                if (numeric > highestNumeric) {
                    highestNumeric = numeric;
                    highest = entry.entryNumber;
                }
            } else if (/^\d+$/.test(entry.entryNumber)) {
                // Pure number
                const numeric = parseInt(entry.entryNumber, 10);
                if (numeric > highestNumeric) {
                    highestNumeric = numeric;
                    highest = entry.entryNumber;
                }
            }
        });

        return highest;
    }, [allEntriesData]);

    const handleDragStart = (e: React.DragEvent, lineId: string) => {
        if (journalEntry?.status !== 'draft' || reorderMutation.isPending) {
            e.preventDefault();
            return;
        }

        // Find the line to get its number for the drag image
        const line = journalEntry.lines.find((l) => l.id === lineId);
        const lineNumber = line?.lineNumber || '';

        setDraggedLineId(lineId);
        setDragOverLineId(null);

        // Data transfer is already set in onDragStart handler
        // Just ensure drop effect is set
        e.dataTransfer.dropEffect = 'move';

        // Add visual feedback to the drag handle
        const target = e.currentTarget as HTMLElement;
        if (target) {
            target.style.opacity = '0.5';
            target.style.cursor = 'grabbing';
        }

        // Add body class to prevent text selection during drag
        document.body.classList.add('dragging');

        // Create a simple drag image for better UX
        try {
            const dragImage = document.createElement('div');
            dragImage.style.position = 'absolute';
            dragImage.style.top = '-1000px';
            dragImage.style.padding = '8px 12px';
            dragImage.style.background = 'rgba(0, 0, 0, 0.85)';
            dragImage.style.color = 'white';
            dragImage.style.borderRadius = '6px';
            dragImage.style.fontSize = '13px';
            dragImage.style.fontWeight = '500';
            dragImage.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
            dragImage.textContent = `Moving line ${lineNumber}`;
            document.body.appendChild(dragImage);
            e.dataTransfer.setDragImage(dragImage, 0, 0);
            setTimeout(() => {
                if (document.body.contains(dragImage)) {
                    document.body.removeChild(dragImage);
                }
            }, 0);
        } catch (err) {
            // Fallback if drag image creation fails
            console.debug('Could not create drag image:', err);
        }
    };

    const handleDragOver = (e: React.DragEvent, lineId: string) => {
        // Always prevent default to allow drop
        e.preventDefault();
        e.stopPropagation();

        if (
            journalEntry?.status !== 'draft' ||
            !draggedLineId ||
            reorderMutation.isPending
        ) {
            e.dataTransfer.dropEffect = 'none';
            setDragOverLineId(null);
            return;
        }

        // Set drop effect to show move cursor
        e.dataTransfer.dropEffect = 'move';

        // Update drag over state - only if different from dragged line
        // This ensures we can drop on the other line even with only 2 lines
        if (lineId !== draggedLineId) {
            // Clear any pending dragLeave timeouts from all rows
            dragLeaveTimeoutRef.current.forEach((timeoutId, element) => {
                clearTimeout(timeoutId);
                dragLeaveTimeoutRef.current.delete(element);
            });

            // Immediately update state - critical for 2-line case
            setDragOverLineId(lineId);

            // Mark the row as drag over for dragLeave handler
            const target = e.currentTarget as HTMLElement;
            if (target) {
                target.setAttribute('data-dragover', 'true');
            }
        } else {
            // Can't drop on itself
            setDragOverLineId(null);
            const target = e.currentTarget as HTMLElement;
            if (target) {
                target.removeAttribute('data-dragover');
            }
        }
    };

    const handleDragLeave = (e: React.DragEvent) => {
        // Only clear if we're actually leaving the row (not entering a child)
        const relatedTarget = e.relatedTarget as HTMLElement | null;
        const currentTarget = e.currentTarget as HTMLElement;

        // Check if we're moving to a child element within the same row
        if (
            relatedTarget &&
            currentTarget.contains(relatedTarget) &&
            relatedTarget !== currentTarget
        ) {
            // Still within the row, don't clear
            return;
        }

        // Check if we're moving to another table row
        // This is critical for 2-line case - we need to detect row transitions
        if (relatedTarget) {
            const closestRow = relatedTarget.closest('tr[data-row-id]');
            if (closestRow && closestRow !== currentTarget) {
                // Moving to another row - don't clear, let dragOver handle it
                // The dragOver event will fire on the new row and update the state
                return;
            }
        }

        // For 2-line case: be more lenient - only clear if we're really leaving
        // Use a small timeout to allow dragOver to fire on the other row first
        const timeoutId = setTimeout(() => {
            // Only clear if we're still not over the other row
            // Check if dragOverLineId is set (meaning we're over another row)
            if (!dragOverLineId || dragOverLineId === draggedLineId) {
                setDragOverLineId(null);
            }
            dragLeaveTimeoutRef.current.delete(currentTarget);
        }, 100);

        // Store timeout ID to clear if dragOver fires quickly
        dragLeaveTimeoutRef.current.set(currentTarget, timeoutId);
    };

    const handleDrop = (e: React.DragEvent, dropLineId: string) => {
        e.preventDefault();
        e.stopPropagation();

        // Clear drag over attribute
        const target = e.currentTarget as HTMLElement;
        if (target) {
            target.removeAttribute('data-dragover');
        }

        // Validate conditions
        if (
            !journalEntry ||
            !id ||
            !draggedLineId ||
            journalEntry.status !== 'draft'
        ) {
            setDraggedLineId(null);
            setDragOverLineId(null);
            return;
        }

        // Don't do anything if dropping on itself
        if (draggedLineId === dropLineId) {
            setDraggedLineId(null);
            setDragOverLineId(null);
            return;
        }

        // Get current lines
        const lines = [...journalEntry.lines];
        const draggedIndex = lines.findIndex(
            (line) => line.id === draggedLineId
        );
        const dropIndex = lines.findIndex((line) => line.id === dropLineId);

        // Validate indices
        if (draggedIndex === -1 || dropIndex === -1) {
            setDraggedLineId(null);
            setDragOverLineId(null);
            return;
        }

        // Reorder: Remove dragged line and insert at new position
        const [draggedLine] = lines.splice(draggedIndex, 1);
        lines.splice(dropIndex, 0, draggedLine);

        // Extract all line IDs in the new order (API requires all lines)
        const lineIds = lines.map((line) => line.id);

        // Prevent multiple simultaneous reorders
        if (reorderMutation.isPending) {
            setDraggedLineId(null);
            setDragOverLineId(null);
            return;
        }

        // Call API with all line IDs in the new order
        reorderMutation.mutate(
            { id, lineIds },
            {
                onSuccess: () => {
                    // Clear drag state after successful reorder
                    setDraggedLineId(null);
                    setDragOverLineId(null);
                },
                onError: () => {
                    // Clear drag state on error
                    setDraggedLineId(null);
                    setDragOverLineId(null);
                },
            }
        );
    };

    const handleDragEnd = (e: React.DragEvent) => {
        // Reset visual state
        const target = e.currentTarget as HTMLElement;
        if (target) {
            target.style.opacity = '1';
            target.style.cursor = 'grab';
        }

        // Remove body dragging class
        document.body.classList.remove('dragging');

        // Clear all drag over attributes
        document.querySelectorAll('tr[data-dragover="true"]').forEach((row) => {
            row.removeAttribute('data-dragover');
        });

        // Clear drag state immediately
        // The drop handler will have already cleared it if drop occurred
        // But if drag ended without drop, clear it here
        setDraggedLineId(null);
        setDragOverLineId(null);
    };

    const columns: Column<JournalEntryLine>[] = [
        {
            header: '#',
            accessorKey: 'lineNumber',
            className: 'w-20',
            cell: (line) => {
                if (!journalEntry) return null;
                const canReorder = journalEntry.status === 'draft';
                const isDragging = draggedLineId === line.id;

                return (
                    <div className="flex items-center gap-2">
                        <span className="text-primary/50">
                            {line.lineNumber}
                        </span>
                        {canReorder && (
                            <div
                                data-drag-handle
                                draggable={!reorderMutation.isPending}
                                onDragStart={(e) => {
                                    e.stopPropagation();

                                    // Prevent drag if reordering is in progress
                                    if (reorderMutation.isPending) {
                                        e.preventDefault();
                                        return;
                                    }

                                    // Set drag data immediately for better browser compatibility
                                    e.dataTransfer.effectAllowed = 'move';
                                    e.dataTransfer.dropEffect = 'move';
                                    e.dataTransfer.setData(
                                        'text/plain',
                                        line.id
                                    );
                                    e.dataTransfer.setData(
                                        'application/x-line-id',
                                        line.id
                                    );

                                    // Call handler for state management and visual feedback
                                    handleDragStart(e, line.id);
                                }}
                                onDrag={(e) => {
                                    // Keep drag effect during drag
                                    e.stopPropagation();
                                    if (
                                        !reorderMutation.isPending &&
                                        draggedLineId
                                    ) {
                                        e.dataTransfer.dropEffect = 'move';
                                    }
                                }}
                                onDragEnd={(e) => {
                                    e.stopPropagation();
                                    handleDragEnd(e);
                                }}
                                onMouseDown={(e) => {
                                    // Prevent text selection and row interactions
                                    e.stopPropagation();
                                    // Don't prevent default - we need native drag behavior
                                }}
                                onClick={(e) => {
                                    // Prevent row click when clicking drag handle
                                    e.stopPropagation();
                                    e.preventDefault();
                                }}
                                onPointerDown={(e) => {
                                    // Prevent pointer events from interfering
                                    e.stopPropagation();
                                }}
                                className={cn(
                                    'touch-none select-none inline-flex items-center justify-center transition-all',
                                    reorderMutation.isPending
                                        ? 'cursor-not-allowed opacity-30'
                                        : isDragging
                                          ? 'cursor-grabbing opacity-50'
                                          : 'cursor-grab opacity-100 hover:opacity-80'
                                )}
                                title={
                                    reorderMutation.isPending
                                        ? 'Reordering...'
                                        : 'Drag to reorder'
                                }
                                role="button"
                                tabIndex={-1}
                                aria-label={`Drag line ${line.lineNumber} to reorder`}
                                aria-disabled={reorderMutation.isPending}
                            >
                                <GripVertical className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors pointer-events-none" />
                            </div>
                        )}
                    </div>
                );
            },
        },
        {
            header: 'Account',
            accessorKey: 'accountName',
            cell: (line) => (
                <div>
                    <div className="font-medium text-primary">
                        {line.account?.accountNumber
                            ? `${line.account.accountNumber} - ${
                                  line.account.accountName || ''
                              }`.trim()
                            : line.accountName || line.accountId}
                    </div>
                    {(line.account?.accountType || line.name) && (
                        <div className="text-xs text-primary/50">
                            {line.account?.accountType || line.name}
                        </div>
                    )}
                </div>
            ),
        },
        {
            header: 'Description',
            accessorKey: 'description',
            cell: (line) => (
                <div className="text-primary/75">
                    {line.description ? line.description : '—'}
                    {line.memo && line.memo !== line.description && (
                        <div className="text-xs text-primary/50 mt-0.5">
                            Memo: {line.memo}
                        </div>
                    )}
                </div>
            ),
        },
        {
            header: 'Contact',
            accessorKey: 'contactId',
            cell: (line) => (
                <span className="text-primary/75">
                    {line.contactId
                        ? contactNameById.get(line.contactId) || line.contactId
                        : '—'}
                </span>
            ),
        },
        {
            header: 'Debit',
            accessorKey: 'debit',
            className: 'text-right font-medium text-primary',
            cell: (line) =>
                toNumber(line.debit).toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'USD',
                }),
        },
        {
            header: 'Credit',
            accessorKey: 'credit',
            className: 'text-right font-medium text-primary',
            cell: (line) =>
                toNumber(line.credit).toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'USD',
                }),
        },
    ];

    if (isLoading) {
        return <Loading />;
    }

    if (!journalEntry) {
        return (
            <div className="text-center py-12">
                <p className="text-sm text-red-600">Journal entry not found</p>
            </div>
        );
    }

    const handleCopy = () => {
        if (!id || !journalEntry) return;

        // Get the next entry number by incrementing the highest entry number found
        // If no entries found, use the current entry's number as fallback
        const baseEntryNumber = highestEntryNumber || journalEntry.entryNumber;
        const nextEntryNumber = getNextJournalEntryNumber(baseEntryNumber);

        // Normalize date format
        const normalizeDate = (value: string) => {
            return value.includes('T') ? value.split('T')[0] : value;
        };

        // Create a preview payload with the same data, but with incremented entry number
        const copyPayload: CreateJournalEntryPayload = {
            entryNumber: nextEntryNumber,
            entryDate: normalizeDate(journalEntry.entryDate),
            entryType: journalEntry.entryType || 'standard',
            isAdjusting: journalEntry.isAdjusting,
            isClosing: journalEntry.isClosing || false,
            isReversing: false, // Don't copy reversing status
            reversalDate: null, // Don't copy reversal date
            description: journalEntry.memo || '',
            memo: journalEntry.memo || '',
            reference: journalEntry.reference || '',
            lines: journalEntry.lines.map((line) => ({
                accountId: line.accountId,
                lineNumber: line.lineNumber,
                debit:
                    typeof line.debit === 'string'
                        ? parseFloat(line.debit) || 0
                        : line.debit,
                credit:
                    typeof line.credit === 'string'
                        ? parseFloat(line.credit) || 0
                        : line.credit,
                description: line.description || '',
                memo: line.memo || line.description || '',
                contactId: line.contactId || '',
                taxId: line.taxId || '',
            })),
        };

        // Show preview dialog
        setCopyPreviewData(copyPayload);
        setShowCopyPreview(true);
    };

    const handleConfirmCopy = () => {
        if (!copyPreviewData) return;

        createMutation.mutate(copyPreviewData, {
            onSuccess: (data) => {
                setShowCopyPreview(false);
                setCopyPreviewData(null);
                const newEntryId = data?.data?.journalEntry?.id;
                if (newEntryId) {
                    navigate(`/journal-entries/${newEntryId}/edit`);
                } else {
                    navigate('/journal-entries');
                }
            },
        });
    };

    return (
        <div className="flex flex-col gap-4">
            <PageHeader
                title={`Journal Entry ${formatText(journalEntry.entryNumber)}`}
                subtitle={formatDateOnly(journalEntry.entryDate)}
                actions={
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopy}
                        disabled={createMutation.isPending}
                    >
                        <Copy className="w-4 h-4 mr-2" />
                        {createMutation.isPending ? 'Copying...' : 'Copy'}
                    </Button>
                }
            />

            <div className="bg-card rounded-lg border border-primary/10 overflow-hidden">
                <div className="px-4 py-2 border-b border-primary/10 flex items-center justify-between">
                    <h3 className="text-base font-semibold text-primary">
                        Journal Lines
                    </h3>
                    {journalEntry.status === 'draft' && (
                        <span className="text-sm text-primary/70">
                            {reorderMutation.isPending
                                ? 'Reordering...'
                                : 'Drag and drop lines to reorder'}
                        </span>
                    )}
                </div>
                <DataTable
                    data={journalEntry.lines}
                    columns={columns}
                    containerClassName="border-none rounded-none"
                    tableClassName="w-full"
                    selectedItems={
                        journalEntry.status === 'draft'
                            ? selectedLineIds
                            : undefined
                    }
                    onSelectionChange={
                        journalEntry.status === 'draft'
                            ? setSelectedLineIds
                            : undefined
                    }
                    onRowDragOver={
                        journalEntry.status === 'draft' &&
                        !reorderMutation.isPending
                            ? (e, line) => handleDragOver(e, line.id)
                            : undefined
                    }
                    onRowDragLeave={
                        journalEntry.status === 'draft' &&
                        !reorderMutation.isPending
                            ? handleDragLeave
                            : undefined
                    }
                    onRowDrop={
                        journalEntry.status === 'draft' &&
                        !reorderMutation.isPending
                            ? (e, line) => handleDrop(e, line.id)
                            : undefined
                    }
                    onRowDragEnd={
                        journalEntry.status === 'draft'
                            ? handleDragEnd
                            : undefined
                    }
                    rowClassName={(line) => {
                        const baseClasses = 'transition-all duration-200';
                        if (journalEntry.status !== 'draft') return baseClasses;

                        const isDragged = draggedLineId === line.id;
                        const isDragOver = dragOverLineId === line.id;
                        const isReordering = reorderMutation.isPending;

                        if (isReordering) {
                            return `${baseClasses} opacity-60`;
                        }

                        if (isDragged) {
                            return `${baseClasses} opacity-40 bg-muted/20`;
                        }

                        if (isDragOver) {
                            return `${baseClasses} border-t-2 border-primary bg-primary/10 shadow-sm`;
                        }

                        if (draggedLineId && !isDragged) {
                            return `${baseClasses} hover:bg-accent/30`;
                        }

                        return `${baseClasses} hover:bg-muted/20`;
                    }}
                    footerContent={
                        <tr className="bg-card border-t border-primary/10">
                            <td
                                colSpan={
                                    journalEntry.status === 'draft' ? 4 : 3
                                }
                                className="px-3 py-2 text-right font-semibold text-sm text-primary"
                            >
                                Total
                            </td>
                            <td className="px-3 py-2 text-right font-semibold text-sm text-primary">
                                {toNumber(
                                    journalEntry.totalDebit
                                ).toLocaleString('en-US', {
                                    style: 'currency',
                                    currency: 'USD',
                                })}
                            </td>
                            <td className="px-3 py-2 text-right font-semibold text-sm text-primary">
                                {toNumber(
                                    journalEntry.totalCredit
                                ).toLocaleString('en-US', {
                                    style: 'currency',
                                    currency: 'USD',
                                })}
                            </td>
                        </tr>
                    }
                />
            </div>

            {/* Essential Details - Always Visible */}
            <div className="bg-card rounded-lg border border-primary/10 p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-primary/50 mb-1">
                            Status
                        </label>
                        <Badge
                            variant={
                                journalEntry.status === 'draft'
                                    ? 'secondary'
                                    : journalEntry.status === 'posted'
                                      ? 'success'
                                      : 'destructive'
                            }
                            className="text-primary/70"
                        >
                            {journalEntry.status}
                        </Badge>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-primary/50 mb-1">
                            Entry Number
                        </label>
                        <p className="text-primary font-medium">
                            {formatText(journalEntry.entryNumber)}
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-primary/50 mb-1">
                            Entry Date
                        </label>
                        <p className="text-primary font-medium">
                            {formatDateOnly(journalEntry.entryDate)}
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-primary/50 mb-1">
                            Entry Type
                        </label>
                        <p className="text-primary font-medium capitalize">
                            {formatText(journalEntry.entryType)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Additional Details - Collapsible */}
            <Collapsible open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <div className="bg-card rounded-lg border border-primary/10 overflow-hidden">
                    <CollapsibleTrigger className="w-full px-4 py-3 flex items-center justify-between hover:bg-primary/5 transition-colors">
                        <h3 className="text-base font-semibold text-primary">
                            Additional Details
                        </h3>
                        <ChevronDown
                            className={`w-4 h-4 text-primary/50 transition-transform duration-200 ${
                                isDetailsOpen ? 'rotate-180' : ''
                            }`}
                        />
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <div className="px-4 pb-4 flex flex-col gap-4">
                            {/*                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 pt-4">
                                <div>
                                    <label className="block text-sm font-medium text-primary/50 mb-1">
                                        ID
                                    </label>
                                    <p className="text-primary font-medium break-all text-sm">
                                        {formatText(journalEntry.id)}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-primary/50 mb-1">
                                        Reference
                                    </label>
                                    <p className="text-primary font-medium text-sm">
                                        {formatText(journalEntry.reference)}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-primary/50 mb-1">
                                        Source Module
                                    </label>
                                    <p className="text-primary font-medium text-sm">
                                        {formatText(journalEntry.sourceModule)}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-primary/50 mb-1">
                                        Source ID
                                    </label>
                                    <p className="text-primary font-medium break-all text-sm">
                                        {formatText(journalEntry.sourceId)}
                                    </p>
                                </div>
                            </div> */}

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-primary/50 mb-1">
                                        Adjusting
                                    </label>
                                    <p className="text-primary font-medium text-sm">
                                        {formatBoolean(
                                            journalEntry.isAdjusting
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-primary/50 mb-1">
                                        Closing
                                    </label>
                                    <p className="text-primary font-medium text-sm">
                                        {formatBoolean(journalEntry.isClosing)}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-primary/50 mb-1">
                                        Reversing
                                    </label>
                                    <p className="text-primary font-medium text-sm">
                                        {formatBoolean(
                                            journalEntry.isReversing
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-primary/50 mb-1">
                                        Reversal Date
                                    </label>
                                    <p className="text-primary font-medium text-sm">
                                        {formatDateOnly(
                                            journalEntry.reversalDate
                                        )}
                                    </p>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-primary/50 mb-1">
                                        Memo
                                    </label>
                                    <p className="text-primary font-medium whitespace-pre-wrap text-sm">
                                        {formatText(journalEntry.memo)}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-primary/50 mb-1">
                                        Approved By
                                    </label>
                                    <p className="text-primary font-medium text-sm">
                                        {formatText(journalEntry.approvedBy)}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-primary/50 mb-1">
                                        Approved At
                                    </label>
                                    <p className="text-primary font-medium text-sm">
                                        {formatDateTime(
                                            journalEntry.approvedAt
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-primary/50 mb-1">
                                        Posted By
                                    </label>
                                    <p className="text-primary font-medium text-sm">
                                        {formatText(journalEntry.postedBy)}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-primary/50 mb-1">
                                        Posted At
                                    </label>
                                    <p className="text-primary font-medium text-sm">
                                        {formatDateTime(journalEntry.postedAt)}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-primary/50 mb-1">
                                        Created At
                                    </label>
                                    <p className="text-primary font-medium text-sm">
                                        {formatDateTime(journalEntry.createdAt)}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-primary/50 mb-1">
                                        Updated At
                                    </label>
                                    <p className="text-primary font-medium text-sm">
                                        {formatDateTime(journalEntry.updatedAt)}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-primary/50 mb-1">
                                        Total Debit
                                    </label>
                                    <p className="text-primary font-semibold text-sm">
                                        {toNumber(
                                            journalEntry.totalDebit
                                        ).toLocaleString('en-US', {
                                            style: 'currency',
                                            currency: 'USD',
                                        })}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-primary/50 mb-1">
                                        Total Credit
                                    </label>
                                    <p className="text-primary font-semibold text-sm">
                                        {toNumber(
                                            journalEntry.totalCredit
                                        ).toLocaleString('en-US', {
                                            style: 'currency',
                                            currency: 'USD',
                                        })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CollapsibleContent>
                </div>
            </Collapsible>

            {(() => {
                const attachments = journalEntry.attachments || [];
                if (attachments.length === 0) return null;
                return (
                    <div className="bg-card rounded-lg border border-primary/10 p-3">
                        <h3 className="text-sm font-medium text-primary mb-2">
                            Attachments
                        </h3>
                        <div className="flex flex-col gap-2">
                            {attachments.map((attachment, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-3 border border-primary/10 rounded-lg"
                                >
                                    <span className="text-sm text-primary">
                                        {attachment}
                                    </span>
                                    <a
                                        href={attachment}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-primary hover:underline"
                                    >
                                        Download
                                    </a>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })()}

            {/* Copy Preview Dialog */}
            <Dialog open={showCopyPreview} onOpenChange={setShowCopyPreview}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Preview Copy Journal Entry</DialogTitle>
                        <DialogDescription>
                            Review the details of the journal entry that will be
                            created. The new entry will be in Draft status.
                        </DialogDescription>
                    </DialogHeader>

                    {copyPreviewData && (
                        <div className="space-y-4">
                            {/* Entry Details */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-card rounded-lg border border-primary/10">
                                <div>
                                    <label className="block text-sm font-medium text-primary/50 mb-1">
                                        New Entry Number
                                    </label>
                                    <p className="text-primary font-semibold">
                                        {copyPreviewData.entryNumber}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-primary/50 mb-1">
                                        Entry Date
                                    </label>
                                    <p className="text-primary font-medium">
                                        {formatDateOnly(
                                            copyPreviewData.entryDate
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-primary/50 mb-1">
                                        Entry Type
                                    </label>
                                    <p className="text-primary font-medium capitalize">
                                        {copyPreviewData.entryType ||
                                            'standard'}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-primary/50 mb-1">
                                        Status
                                    </label>
                                    <Badge
                                        variant="secondary"
                                        className="text-primary/70"
                                    >
                                        Draft
                                    </Badge>
                                </div>
                            </div>

                            {/* Memo/Description */}
                            {(copyPreviewData.memo ||
                                copyPreviewData.description) && (
                                <div className="p-4 bg-card rounded-lg border border-primary/10">
                                    <label className="block text-sm font-medium text-primary/50 mb-2">
                                        Memo
                                    </label>
                                    <p className="text-primary text-sm whitespace-pre-wrap">
                                        {copyPreviewData.memo ||
                                            copyPreviewData.description ||
                                            '—'}
                                    </p>
                                </div>
                            )}

                            {/* Journal Lines Preview */}
                            <div className="border border-primary/10 rounded-lg overflow-hidden">
                                <div className="px-4 py-2 bg-primary/5 border-b border-primary/10">
                                    <h3 className="text-sm font-semibold text-primary">
                                        Journal Lines (
                                        {copyPreviewData.lines.length} lines)
                                    </h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-primary/5">
                                            <tr>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-primary/70">
                                                    #
                                                </th>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-primary/70">
                                                    Account
                                                </th>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-primary/70">
                                                    Description
                                                </th>
                                                <th className="px-3 py-2 text-right text-xs font-medium text-primary/70">
                                                    Debit
                                                </th>
                                                <th className="px-3 py-2 text-right text-xs font-medium text-primary/70">
                                                    Credit
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {copyPreviewData.lines.map(
                                                (line, index) => (
                                                    <tr
                                                        key={index}
                                                        className="border-b border-primary/10 hover:bg-primary/5"
                                                    >
                                                        <td className="px-3 py-2 text-sm text-primary/50">
                                                            {line.lineNumber}
                                                        </td>
                                                        <td className="px-3 py-2 text-sm text-primary">
                                                            {line.accountId
                                                                ? accountNameMap.get(
                                                                      line.accountId
                                                                  ) ||
                                                                  line.accountId
                                                                : '—'}
                                                        </td>
                                                        <td className="px-3 py-2 text-sm text-primary/75">
                                                            {line.description ||
                                                                '—'}
                                                        </td>
                                                        <td className="px-3 py-2 text-sm text-right font-medium text-primary">
                                                            {toNumber(
                                                                line.debit
                                                            ).toLocaleString(
                                                                'en-US',
                                                                {
                                                                    style: 'currency',
                                                                    currency:
                                                                        'USD',
                                                                }
                                                            )}
                                                        </td>
                                                        <td className="px-3 py-2 text-sm text-right font-medium text-primary">
                                                            {toNumber(
                                                                line.credit
                                                            ).toLocaleString(
                                                                'en-US',
                                                                {
                                                                    style: 'currency',
                                                                    currency:
                                                                        'USD',
                                                                }
                                                            )}
                                                        </td>
                                                    </tr>
                                                )
                                            )}
                                        </tbody>
                                        <tfoot className="bg-primary/5">
                                            <tr>
                                                <td
                                                    colSpan={3}
                                                    className="px-3 py-2 text-right font-semibold text-sm text-primary"
                                                >
                                                    Total
                                                </td>
                                                <td className="px-3 py-2 text-right font-semibold text-sm text-primary">
                                                    {copyPreviewData.lines
                                                        .reduce(
                                                            (sum, line) =>
                                                                sum +
                                                                toNumber(
                                                                    line.debit
                                                                ),
                                                            0
                                                        )
                                                        .toLocaleString(
                                                            'en-US',
                                                            {
                                                                style: 'currency',
                                                                currency: 'USD',
                                                            }
                                                        )}
                                                </td>
                                                <td className="px-3 py-2 text-right font-semibold text-sm text-primary">
                                                    {copyPreviewData.lines
                                                        .reduce(
                                                            (sum, line) =>
                                                                sum +
                                                                toNumber(
                                                                    line.credit
                                                                ),
                                                            0
                                                        )
                                                        .toLocaleString(
                                                            'en-US',
                                                            {
                                                                style: 'currency',
                                                                currency: 'USD',
                                                            }
                                                        )}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowCopyPreview(false);
                                setCopyPreviewData(null);
                            }}
                            disabled={createMutation.isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleConfirmCopy}
                            disabled={createMutation.isPending}
                        >
                            <Copy className="w-4 h-4 mr-2" />
                            {createMutation.isPending
                                ? 'Creating...'
                                : 'Create Copy'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
