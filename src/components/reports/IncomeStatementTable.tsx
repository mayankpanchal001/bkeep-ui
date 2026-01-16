import { useMemo, useState } from 'react';
import { FaChevronDown, FaChevronRight } from 'react-icons/fa';
import {
    incomeStatementPeriods,
    incomeStatementSections,
} from '../../constants/incomeStatementData';
import { cn } from '../../utils/cn';
import { Column, DataTable } from '../shared/DataTable';

type IncomeStatementRow = {
    id: string;
    label: string;
    values: number[];
    type: 'section' | 'item';
    sectionType?: 'normal' | 'calculated' | 'final';
    collapsible?: boolean;
    isExpanded?: boolean;
    code?: string;
};

const IncomeStatementTable = () => {
    const [expandedSections, setExpandedSections] = useState<{
        [key: string]: boolean;
    }>(() => {
        const initialState: { [key: string]: boolean } = {};
        incomeStatementSections.forEach((section) => {
            if (section.collapsible) {
                initialState[section.id] = true;
            }
        });
        return initialState;
    });

    const toggleSection = (sectionId: string) => {
        setExpandedSections((prev) => ({
            ...prev,
            [sectionId]: !prev[sectionId],
        }));
    };

    const formatNumber = (num: number) => {
        return num.toLocaleString();
    };

    const tableData = useMemo(() => {
        const rows: IncomeStatementRow[] = [];
        incomeStatementSections.forEach((section) => {
            rows.push({
                id: section.id,
                label: section.label,
                values: section.totalValues,
                type: 'section',
                sectionType: section.type as 'normal' | 'calculated' | 'final',
                collapsible: section.collapsible,
                isExpanded: expandedSections[section.id],
            });
            if (
                section.collapsible &&
                expandedSections[section.id] &&
                section.items
            ) {
                section.items.forEach((item, index) => {
                    rows.push({
                        id: `${section.id}-item-${index}`,
                        label: item.label,
                        values: item.values,
                        type: 'item',
                        code: item.code,
                        sectionType: section.type as
                            | 'normal'
                            | 'calculated'
                            | 'final',
                    });
                });
            }
        });
        return rows;
    }, [expandedSections]);

    const getRowBackground = (row: IncomeStatementRow) => {
        if (row.type === 'section') {
            if (row.sectionType === 'calculated') return 'bg-card';
            if (row.sectionType === 'final') return 'bg-primary/10';
            return 'bg-card';
        }
        return 'bg-card';
    };

    const columns: Column<IncomeStatementRow>[] = useMemo(
        () => [
            {
                header: 'Income statement',
                cell: (row) => (
                    <div className="flex items-center gap-2">
                        {row.type === 'section' && row.collapsible ? (
                            <div className="flex items-center gap-2">
                                {row.isExpanded ? (
                                    <FaChevronDown className="text-xs" />
                                ) : (
                                    <FaChevronRight className="text-xs" />
                                )}
                                {row.label}
                            </div>
                        ) : row.type === 'item' ? (
                            <div className="pl-4 flex items-center">
                                {row.code && (
                                    <span className="text-xs text-primary/40 mr-2">
                                        {row.code}
                                    </span>
                                )}
                                {row.label}
                            </div>
                        ) : (
                            row.label
                        )}
                    </div>
                ),
                className: 'text-left py-3 px-4 sticky left-0 z-10',
                cellClassName: (row) => {
                    let classes = getRowBackground(row);
                    if (
                        row.type === 'item' ||
                        (row.type === 'section' && !row.sectionType)
                    ) {
                        classes += ' hover:bg-card';
                    }
                    return classes;
                },
            },
            ...incomeStatementPeriods.map((period, index) => ({
                header: period.label,
                cell: (row: IncomeStatementRow) => (
                    <div
                        className={cn(
                            row.sectionType === 'final' && 'text-accent'
                        )}
                    >
                        {formatNumber(row.values[index])}
                    </div>
                ),
                className: 'text-right py-3 px-4 min-w-[150px]',
            })),
        ],
        []
    );

    const getRowClassName = (row: IncomeStatementRow) => {
        if (row.type === 'section') {
            if (row.sectionType === 'calculated') {
                return 'border-b border-primary/25 bg-card font-bold text-primary';
            }
            if (row.sectionType === 'final') {
                return 'border-t-2 border-primary bg-primary/10 font-bold text-primary text-base';
            }
            let classes =
                'border-b border-primary/10 font-semibold text-primary';
            if (row.collapsible) classes += ' cursor-pointer hover:bg-card';
            return classes;
        }
        return 'border-b border-primary/10 hover:bg-card text-primary';
    };

    return (
        <DataTable
            data={tableData}
            columns={columns}
            rowClassName={getRowClassName}
            onRowClick={(row) => {
                if (row.type === 'section' && row.collapsible) {
                    toggleSection(row.id);
                }
            }}
            containerClassName="border-primary/10"
            tableClassName="w-full text-sm"
        />
    );
};

export default IncomeStatementTable;
