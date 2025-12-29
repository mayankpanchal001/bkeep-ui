import { useState } from 'react';
import {
    useTenants,
    type TenantsQueryParams,
} from '../../services/apis/tenantApi';
import { Tenant } from '../../types';
import { Icons } from '../shared/Icons';
import Button from '../typography/Button';
import Chips from '../typography/Chips';
import CreateTenantModal from './CreateTenantModal';
import { DataTable, type Column } from '../shared/DataTable';

const TenantsTab = () => {
    const [filters, setFilters] = useState<TenantsQueryParams>({
        page: 1,
        limit: 10,
        sort: 'createdAt',
        order: 'asc',
    });
    const [showCreateModal, setShowCreateModal] = useState(false);

    const { data, isLoading, isError } = useTenants(filters);

    const tenants = data?.data?.items || [];
    const pagination = data?.data?.pagination;

    const handlePageChange = (newPage: number) => {
        setFilters((prev) => ({
            ...prev,
            page: newPage,
        }));
    };

    const handleSortChange = (sort: string, order: 'asc' | 'desc') => {
        setFilters((prev) => ({
            ...prev,
            sort,
            order,
            page: 1,
        }));
    };

    const columns: Column<Tenant>[] = [
        {
            header: 'Name',
            accessorKey: 'name',
            sortable: true,
            className: 'font-medium text-gray-900',
        },
        {
            header: 'Created At',
            accessorKey: 'createdAt',
            cell: (tenant) => new Date(tenant.createdAt).toLocaleDateString(),
            className: 'text-gray-500',
        },
        {
            header: 'Status',
            accessorKey: 'isActive',
            cell: (tenant) => (
                <Chips
                    label={tenant.isActive ? 'Active' : 'Inactive'}
                    variant={tenant.isActive ? 'success' : 'danger'}
                />
            ),
        },
        {
            header: 'Is Primary',
            accessorKey: 'isPrimary',
            className: 'text-center',
            cell: (tenant) =>
                tenant.isPrimary ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Primary
                    </span>
                ) : (
                    <span className="text-gray-400">—</span>
                ),
        },
    ];

    if (isError) {
        return (
            <div className="text-center py-12 text-red-500">
                <div className="bg-red-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icons.Close className="w-6 h-6 text-red-500" />
                </div>
                Failed to load tenants. Please try again.
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Icons.Building className="w-5 h-5 text-gray-500" />
                        <span>Tenants Management</span>
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage your organization's tenants and their settings.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
                        <Icons.Building className="w-4 h-4" />
                        <span>
                            {pagination?.total || 0} tenant
                            {(pagination?.total || tenants.length) !== 1
                                ? 's'
                                : ''}
                        </span>
                    </div>
                    <Button
                        onClick={() => setShowCreateModal(true)}
                        size="sm"
                        variant="primary"
                    >
                        <Icons.Plus className="w-4 h-4 mr-2" />
                        Create Tenant
                    </Button>
                </div>
            </div>

            <DataTable
                data={tenants}
                columns={columns}
                isLoading={isLoading}
                keyField="id"
                pagination={
                    pagination
                        ? {
                              page: pagination.page,
                              totalPages: pagination.totalPages,
                              totalItems: pagination.total,
                              onPageChange: handlePageChange,
                              hasPreviousPage: pagination.hasPreviousPage,
                              hasNextPage: pagination.hasNextPage,
                          }
                        : undefined
                }
                sorting={{
                    sort: filters.sort || 'createdAt',
                    order: filters.order || 'asc',
                    onSortChange: handleSortChange,
                }}
                emptyMessage="No tenants found. Get started by creating your first tenant."
            />

            {/* Create Tenant Modal */}
            <CreateTenantModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
            />
        </div>
    );
};


export default TenantsTab;
