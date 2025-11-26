import { useState } from 'react';
import { FaSearch, FaUsers } from 'react-icons/fa';
import { useUsers, type UsersQueryParams } from '../../services/apis/usersApi';
import { InputField } from '../typography/InputFields';
import Button from '../typography/Button';

const UsersTab = () => {
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState<UsersQueryParams>({
        page: 1,
        limit: 20,
        sort: 'createdAt',
        order: 'asc',
    });

    const { data, isLoading, isError } = useUsers(filters);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setFilters((prev) => ({
            ...prev,
            search: search || undefined,
            page: 1, // Reset to first page on new search
        }));
    };

    const handlePageChange = (newPage: number) => {
        setFilters((prev) => ({
            ...prev,
            page: newPage,
        }));
    };

    const handleFilterChange = (
        key: keyof UsersQueryParams,
        value: boolean | undefined
    ) => {
        setFilters((prev) => ({
            ...prev,
            [key]: value,
            page: 1, // Reset to first page on filter change
        }));
    };

    const users = data?.data?.items || [];
    const pagination = data?.data?.pagination;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-primary">
                    Users Management
                </h3>
                <div className="flex items-center gap-2 text-sm text-primary-50">
                    <FaUsers className="w-4 h-4" />
                    <span>
                        {pagination?.total || 0} user
                        {pagination?.total !== 1 ? 's' : ''}
                    </span>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="space-y-4">
                <form onSubmit={handleSearch} className="flex gap-2">
                    <div className="flex-1">
                        <InputField
                            id="user-search"
                            placeholder="Search users by name or email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            icon={<FaSearch className="w-4 h-4" />}
                        />
                    </div>
                    <Button type="submit" variant="primary">
                        Search
                    </Button>
                </form>

                {/* Filter Toggles */}
                <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={filters.isVerified === true}
                            onChange={(e) =>
                                handleFilterChange(
                                    'isVerified',
                                    e.target.checked ? true : undefined
                                )
                            }
                            className="w-4 h-4 text-primary border-primary-10 rounded focus:ring-primary"
                        />
                        <span className="text-sm text-primary">
                            Verified Only
                        </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={filters.isActive === true}
                            onChange={(e) =>
                                handleFilterChange(
                                    'isActive',
                                    e.target.checked ? true : undefined
                                )
                            }
                            className="w-4 h-4 text-primary border-primary-10 rounded focus:ring-primary"
                        />
                        <span className="text-sm text-primary">
                            Active Only
                        </span>
                    </label>
                </div>
            </div>

            {/* Users Table */}
            {isLoading ? (
                <div className="text-center py-8 text-primary-50">
                    Loading users...
                </div>
            ) : isError ? (
                <div className="text-center py-8 text-red-500">
                    Failed to load users. Please try again.
                </div>
            ) : users.length === 0 ? (
                <div className="text-center py-8 text-primary-50">
                    No users found
                </div>
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b border-primary-10">
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-primary">
                                        Name
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-primary">
                                        Email
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-primary">
                                        Role
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-primary">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr
                                        key={user.id}
                                        className="border-b border-primary-10 hover:bg-primary-5 transition-colors"
                                    >
                                        <td className="py-3 px-4 text-sm text-primary">
                                            {user.name}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-primary-75">
                                            {user.email}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-primary-75">
                                            {user.role?.displayName ||
                                                user.role?.name ||
                                                'N/A'}
                                        </td>
                                        <td className="py-3 px-4 text-sm">
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                Active
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {pagination && pagination.totalPages > 1 && (
                        <div className="flex items-center justify-between pt-4 border-t border-primary-10">
                            <div className="text-sm text-primary-50">
                                Showing page {pagination.page} of{' '}
                                {pagination.totalPages} ({pagination.total}{' '}
                                total users)
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        handlePageChange(pagination.page - 1)
                                    }
                                    disabled={!pagination.hasPreviousPage}
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        handlePageChange(pagination.page + 1)
                                    }
                                    disabled={!pagination.hasNextPage}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default UsersTab;
