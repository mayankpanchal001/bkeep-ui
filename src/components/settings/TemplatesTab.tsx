import { useMemo, useState } from 'react';
import {
    useAccountsTemplatePreview,
    useApplyAccountsTemplate,
} from '../../services/apis/chartsAccountApi';
import {
    useApplyTaxTemplate,
    useTaxTemplatePreview,
} from '../../services/apis/taxApi';
import { useTemplates } from '../../services/apis/templatesApi';
import { useAuth } from '../../stores/auth/authSelectore';
import type {
    Template,
    TemplateListType,
    TemplateType,
} from '../../types/templates';
import { Icons } from '../shared/Icons';
import { Button } from '../ui/button';
import Input from '../ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../ui/select';

const TemplatesTab = () => {
    const { user } = useAuth();
    const [search, setSearch] = useState('');
    const [templateType, setTemplateType] =
        useState<TemplateListType>('accounts');
    const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
        null
    );

    const isSuperAdmin = user?.role?.name === 'superadmin';

    const listFilters = useMemo(() => {
        const apiType: TemplateType =
            templateType === 'accounts' ? 'chart_of_accounts' : 'tax';
        return {
            type: apiType,
            search: search.trim() || undefined,
            limit: 50,
            sort: 'updatedAt',
            order: 'desc' as const,
        };
    }, [templateType, search]);

    const { data: templatesData, isLoading: isTemplatesLoading } = useTemplates(
        listFilters,
        true
    );
    const templates = (templatesData?.data?.items || []) as Template[];

    const {
        data: accountsPreviewData,
        isLoading: isAccountsPreviewLoading,
        error: accountsPreviewError,
    } = useAccountsTemplatePreview(
        templateType === 'accounts'
            ? selectedTemplateId || undefined
            : undefined
    );

    const accountsPreview = accountsPreviewData?.data;
    const applyAccountsTemplate = useApplyAccountsTemplate();
    const applyTaxTemplate = useApplyTaxTemplate();

    const {
        data: taxPreviewData,
        isLoading: isTaxPreviewLoading,
        error: taxPreviewError,
    } = useTaxTemplatePreview(
        templateType === 'tax' ? selectedTemplateId || undefined : undefined
    );

    const taxRows = useMemo(() => {
        const items = taxPreviewData?.data?.taxes || [];
        return items.filter((t) => (t?.name || '').trim().length > 0);
    }, [taxPreviewData]);

    const formatRate = (rate: number) => {
        if (!Number.isFinite(rate)) return '—';
        const normalized =
            rate >= 0 && rate <= 1 ? Math.round(rate * 10000) / 100 : rate;
        return `${normalized}%`;
    };

    if (!isSuperAdmin) {
        return (
            <div className="py-8">
                <div className="rounded-md border border-primary/10 bg-card p-6">
                    <div className="text-sm font-medium text-primary">
                        Access denied
                    </div>
                    <div className="mt-1 text-sm text-primary/60">
                        You don’t have permission to manage templates.
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div className="flex-1">
                    <Input
                        id="template-search"
                        placeholder="Search templates by name or description..."
                        value={search}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setSearch(e.target.value)
                        }
                        startIcon={<Icons.Search className="w-4 h-4" />}
                    />
                </div>
                <div className="grid grid-cols-2 gap-3 lg:w-[520px]">
                    <Select
                        value={templateType}
                        onValueChange={(value: TemplateListType) =>
                            setTemplateType(value)
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select template type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
                <div className="lg:col-span-5 rounded-md border border-primary/10 bg-card">
                    <div className="px-4 py-3 border-b border-primary/10 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-primary">
                                Templates
                            </p>
                            <p className="text-xs text-primary/50">
                                Select a template to preview and apply
                            </p>
                        </div>
                        <div className="text-xs text-primary/50">
                            {templates.length}
                        </div>
                    </div>
                    <div className="max-h-[520px] overflow-auto">
                        {isTemplatesLoading ? (
                            <div className="p-4 text-xs text-primary/50">
                                Loading templates...
                            </div>
                        ) : templates.length ? (
                            <div className="divide-y divide-primary/10">
                                {templates.map((t) => {
                                    const isSelected =
                                        t.id === selectedTemplateId;
                                    return (
                                        <button
                                            key={t.id}
                                            type="button"
                                            onClick={() =>
                                                setSelectedTemplateId(t.id)
                                            }
                                            className={`w-full text-left px-4 py-3 transition-colors ${isSelected
                                                    ? 'bg-primary/5'
                                                    : 'hover:bg-primary/5'
                                                }`}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-primary truncate">
                                                        {t.name || 'Template'}
                                                    </p>
                                                    <p className="text-xs text-primary/50 line-clamp-2">
                                                        {t.description || '—'}
                                                    </p>
                                                </div>
                                                <span
                                                    className={`shrink-0 text-[10px] px-2 py-1 rounded-full border ${t.isActive
                                                            ? 'border-green-600/20 bg-green-600/10 text-green-700'
                                                            : 'border-primary/10 bg-card text-primary/60'
                                                        }`}
                                                >
                                                    {t.isActive
                                                        ? 'Active'
                                                        : 'Inactive'}
                                                </span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="p-4 text-xs text-primary/50">
                                No templates found.
                            </div>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-7 rounded-md border border-primary/10 bg-card">
                    <div className="px-4 py-3 border-b border-primary/10 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-primary">
                                Preview
                            </p>
                            <p className="text-xs text-primary/50">
                                Review what will be applied to your tenant
                            </p>
                        </div>
                        {selectedTemplateId && templateType === 'accounts' ? (
                            <Button
                                variant="default"
                                onClick={() =>
                                    applyAccountsTemplate.mutate(
                                        selectedTemplateId
                                    )
                                }
                                startIcon={<Icons.Save className="w-4 h-4" />}
                                disabled={isAccountsPreviewLoading}
                            >
                                Apply Template
                            </Button>
                        ) : selectedTemplateId && templateType === 'tax' ? (
                            <Button
                                variant="default"
                                onClick={() =>
                                    applyTaxTemplate.mutate(selectedTemplateId)
                                }
                                startIcon={<Icons.Save className="w-4 h-4" />}
                                disabled={isTaxPreviewLoading}
                            >
                                Apply Template
                            </Button>
                        ) : null}
                    </div>

                    <div className="p-4">
                        {!selectedTemplateId ? (
                            <div className="text-sm text-primary/50">
                                Select a template to see the preview.
                            </div>
                        ) : templateType === 'accounts' ? (
                            isAccountsPreviewLoading ? (
                                <div className="text-sm text-primary/50">
                                    Loading preview...
                                </div>
                            ) : accountsPreview ? (
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-base font-medium text-primary">
                                                {accountsPreview.template
                                                    .name || 'Template'}
                                            </p>
                                            <p className="text-sm text-primary/50">
                                                {accountsPreview.template
                                                    .description || '—'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="rounded border border-primary/10 p-2">
                                            <p className="text-[10px] text-primary/60">
                                                Total
                                            </p>
                                            <p className="text-sm font-medium text-primary">
                                                {
                                                    accountsPreview.summary
                                                        .totalAccounts
                                                }
                                            </p>
                                        </div>
                                        <div className="rounded border border-primary/10 p-2">
                                            <p className="text-[10px] text-primary/60">
                                                New
                                            </p>
                                            <p className="text-sm font-medium text-primary">
                                                {
                                                    accountsPreview.summary
                                                        .newAccounts
                                                }
                                            </p>
                                        </div>
                                        <div className="rounded border border-primary/10 p-2">
                                            <p className="text-[10px] text-primary/60">
                                                Skipped
                                            </p>
                                            <p className="text-sm font-medium text-primary">
                                                {
                                                    accountsPreview.summary
                                                        .skippedAccounts
                                                }
                                            </p>
                                        </div>
                                    </div>

                                    <div className="rounded border border-primary/10 overflow-hidden">
                                        <div className="grid grid-cols-12 gap-2 bg-primary/5 px-3 py-2">
                                            <p className="col-span-3 text-[10px] font-medium text-primary/70">
                                                Number
                                            </p>
                                            <p className="col-span-6 text-[10px] font-medium text-primary/70">
                                                Name
                                            </p>
                                            <p className="col-span-3 text-[10px] font-medium text-primary/70 text-right">
                                                Status
                                            </p>
                                        </div>
                                        <div className="max-h-[360px] overflow-auto">
                                            {accountsPreview.accounts.map(
                                                (a) => (
                                                    <div
                                                        key={`${a.accountNumber}-${a.accountName}`}
                                                        className="grid grid-cols-12 gap-2 px-3 py-2 border-t border-primary/10"
                                                    >
                                                        <p className="col-span-3 text-xs text-primary">
                                                            {a.accountNumber}
                                                        </p>
                                                        <p className="col-span-6 text-xs text-primary">
                                                            {a.accountName}
                                                        </p>
                                                        <p className="col-span-3 text-xs text-right text-primary/70">
                                                            {a.willBeSkipped
                                                                ? 'Skipped'
                                                                : 'New'}
                                                        </p>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : accountsPreviewError ? (
                                <div className="text-sm text-primary/50">
                                    Could not load preview.
                                </div>
                            ) : (
                                <div className="text-sm text-primary/50">
                                    No preview available.
                                </div>
                            )
                        ) : isTaxPreviewLoading ? (
                            <div className="text-sm text-primary/50">
                                Loading preview...
                            </div>
                        ) : taxPreviewData?.data ? (
                            <div className="flex flex-col gap-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-base font-medium text-primary">
                                            {taxPreviewData.data.template
                                                .name || 'Template'}
                                        </p>
                                        <p className="text-sm text-primary/50">
                                            {taxPreviewData.data.template
                                                .description || '—'}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-2">
                                    <div className="rounded border border-primary/10 p-2">
                                        <p className="text-[10px] text-primary/60">
                                            Total
                                        </p>
                                        <p className="text-sm font-medium text-primary">
                                            {
                                                taxPreviewData.data.summary
                                                    .totalTaxes
                                            }
                                        </p>
                                    </div>
                                    <div className="rounded border border-primary/10 p-2">
                                        <p className="text-[10px] text-primary/60">
                                            New
                                        </p>
                                        <p className="text-sm font-medium text-primary">
                                            {
                                                taxPreviewData.data.summary
                                                    .newTaxes
                                            }
                                        </p>
                                    </div>
                                    <div className="rounded border border-primary/10 p-2">
                                        <p className="text-[10px] text-primary/60">
                                            Skipped
                                        </p>
                                        <p className="text-sm font-medium text-primary">
                                            {
                                                taxPreviewData.data.summary
                                                    .skippedTaxes
                                            }
                                        </p>
                                    </div>
                                </div>

                                <div className="rounded border border-primary/10 overflow-hidden">
                                    <div className="grid grid-cols-12 gap-2 bg-primary/5 px-3 py-2">
                                        <p className="col-span-5 text-[10px] font-medium text-primary/70">
                                            Name
                                        </p>
                                        <p className="col-span-3 text-[10px] font-medium text-primary/70">
                                            Type
                                        </p>
                                        <p className="col-span-2 text-[10px] font-medium text-primary/70 text-right">
                                            Rate
                                        </p>
                                        <p className="col-span-2 text-[10px] font-medium text-primary/70 text-right">
                                            Status
                                        </p>
                                    </div>
                                    <div className="max-h-[360px] overflow-auto">
                                        {taxRows.length ? (
                                            taxRows.map((t) => (
                                                <div
                                                    key={`${t.name}-${t.type}-${t.rate}`}
                                                    className="grid grid-cols-12 gap-2 px-3 py-2 border-t border-primary/10"
                                                >
                                                    <p className="col-span-5 text-xs text-primary">
                                                        {t.name}
                                                    </p>
                                                    <p className="col-span-3 text-xs text-primary/70">
                                                        {t.type || '—'}
                                                    </p>
                                                    <p className="col-span-2 text-xs text-right text-primary/70">
                                                        {formatRate(t.rate)}
                                                    </p>
                                                    <p className="col-span-2 text-xs text-right text-primary/70">
                                                        {t.willBeSkipped
                                                            ? 'Skipped'
                                                            : 'New'}
                                                    </p>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="px-3 py-2 text-sm text-primary/50">
                                                No tax rows found in this
                                                template.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : taxPreviewError ? (
                            <div className="text-sm text-primary/50">
                                Could not load preview.
                            </div>
                        ) : (
                            <div className="text-sm text-primary/50">
                                No preview available.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TemplatesTab;
