import { useGetRoles } from '../../services/apis/roleApi';
import { DataTable, type Column } from '../shared/DataTable';
import { Icons } from '../shared/Icons';
import Button from '../typography/Button';
import Chips from '../typography/Chips';

type RoleType = {
    id: string;
    name: string;
    displayName: string;
    description: string;
    isActive: boolean;
};

const RolesTab = () => {
    const { data, isLoading, isError } = useGetRoles();

    const roles = data?.data?.items || [];
    const pagination = data?.data?.pagination;

    const columns: Column<RoleType>[] = [
        {
            header: 'Name',
            accessorKey: 'name',
            className: 'text-primary font-medium',
        },
        {
            header: 'Display Name',
            accessorKey: 'displayName',
            className: 'text-primary/75',
        },
        {
            header: 'Description',
            accessorKey: 'description',
            cell: (role) => (
                <span
                    className="max-w-md truncate block"
                    title={role.description}
                >
                    {role.description || '—'}
                </span>
            ),
            className: 'text-primary/75',
        },
        {
            header: 'Status',
            accessorKey: 'isActive',
            cell: (role) => (
                <Chips
                    label={role.isActive ? 'Active' : 'Inactive'}
                    variant={role.isActive ? 'success' : 'danger'}
                />
            ),
        },
    ];

    if (isError) {
        return (
            <div className="text-center py-8 text-red-500">
                Failed to load roles. Please try again.
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
                    <Icons.Lock className="w-4 h-4" />
                    <span>Roles</span>
                </h3>
                <div className="flex items-center gap-2 text-sm text-primary/50">
                    <span>
                        {pagination?.total || roles.length} role
                        {(pagination?.total || roles.length) !== 1 ? 's' : ''}
                    </span>

                    <Button variant="outline" size="sm" disabled>
                        Add role
                    </Button>
                </div>
            </div>

            <DataTable
                data={roles}
                columns={columns}
                isLoading={isLoading}
                onSelectionChange={(selectedRows) => {
                    console.log(selectedRows);
                }}
                keyField="id"
                pagination={
                    pagination && pagination.totalPages > 1
                        ? {
                              page: pagination.page,
                              totalPages: pagination.totalPages,
                              totalItems: pagination.total,
                              onPageChange: () => {}, // No-op as per current implementation
                              hasPreviousPage: false,
                              hasNextPage: false,
                          }
                        : undefined
                }
                emptyMessage="No roles found"
            />
        </div>
    );
};

export default RolesTab;
