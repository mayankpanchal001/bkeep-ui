import { useState } from 'react';
import { useGetRoles } from '../../services/apis/roleApi';
import { Icons } from '../shared/Icons';
import Button from '../typography/Button';
import Chips from '../typography/Chips';
import {
    Table,
    TableBody,
    TableCell,
    TableEmptyState,
    TableHead,
    TableHeader,
    TableLoadingState,
    TablePagination,
    TableRow,
    TableRowCheckbox,
    TableSelectAllCheckbox,
    TableSelectionToolbar,
} from '../ui/table';

type RoleType = {
    id: string;
    name: string;
    displayName: string;
    description: string;
    isActive: boolean;
};

const RolesTab = () => {
    const { data, isLoading, isError } = useGetRoles();
    const [selectedItems, setSelectedItems] = useState<(string | number)[]>([]);

    const roles = data?.data?.items || [];
    const pagination = data?.data?.pagination;
    const rowIds = roles.map((r: RoleType) => r.id);

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

            <Table
                enableSelection
                rowIds={rowIds}
                selectedIds={selectedItems}
                onSelectionChange={setSelectedItems}
            >
                <TableSelectionToolbar>
                    <button
                        onClick={() =>
                            console.log('Bulk action on:', selectedItems)
                        }
                        className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-md transition-colors"
                    >
                        Export Selected
                    </button>
                </TableSelectionToolbar>

                <TableHeader>
                    <tr>
                        <TableHead>
                            <TableSelectAllCheckbox />
                        </TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Display Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Status</TableHead>
                    </tr>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        <TableLoadingState colSpan={5} rows={5} />
                    ) : roles.length === 0 ? (
                        <TableEmptyState colSpan={5} message="No roles found" />
                    ) : (
                        roles.map((role: RoleType) => (
                            <TableRow key={role.id} rowId={role.id}>
                                <TableCell>
                                    <TableRowCheckbox rowId={role.id} />
                                </TableCell>
                                <TableCell>
                                    <span className="font-medium text-primary">
                                        {role.name}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <span className="text-primary/75">
                                        {role.displayName}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <span
                                        className="max-w-md truncate block text-primary/75"
                                        title={role.description}
                                    >
                                        {role.description || '—'}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <Chips
                                        label={
                                            role.isActive
                                                ? 'Active'
                                                : 'Inactive'
                                        }
                                        variant={
                                            role.isActive ? 'success' : 'danger'
                                        }
                                    />
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            {pagination && pagination.totalPages > 1 && (
                <TablePagination
                    page={pagination.page}
                    totalPages={pagination.totalPages}
                    totalItems={pagination.total}
                    itemsPerPage={10}
                    onPageChange={() => {}} // No-op as per current implementation
                />
            )}
        </div>
    );
};

export default RolesTab;
