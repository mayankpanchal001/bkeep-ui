import { FaDownload, FaFileInvoiceDollar, FaPlus } from 'react-icons/fa';
import TransactionsTable from '../../components/transactions/TransactionsTable';
import Button from '../../components/typography/Button';

const Transactionpage = () => {
    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-primary">
                        Transactions
                    </h1>
                    <p className="text-sm text-primary-50 mt-1">
                        View and manage all your financial transactions
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="md"
                        icon={<FaDownload className="w-4 h-4" />}
                    >
                        Export
                    </Button>
                    <Button
                        variant="primary"
                        size="md"
                        icon={<FaPlus className="w-4 h-4" />}
                    >
                        Add Transaction
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl shadow-sm border border-primary-10 p-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                            <FaFileInvoiceDollar className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-xs text-primary-50 uppercase">
                                Total Income
                            </p>
                            <p className="text-lg font-bold text-primary">
                                $0.00
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-primary-10 p-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                            <FaFileInvoiceDollar className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                            <p className="text-xs text-primary-50 uppercase">
                                Total Expenses
                            </p>
                            <p className="text-lg font-bold text-primary">
                                $0.00
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-primary-10 p-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-primary-10 flex items-center justify-center">
                            <FaFileInvoiceDollar className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-xs text-primary-50 uppercase">
                                This Month
                            </p>
                            <p className="text-lg font-bold text-primary">
                                $0.00
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-primary-10 p-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-primary-10 flex items-center justify-center">
                            <FaFileInvoiceDollar className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-xs text-primary-50 uppercase">
                                Total Count
                            </p>
                            <p className="text-lg font-bold text-primary">0</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Transactions Table */}
            <TransactionsTable />
        </div>
    );
};

export default Transactionpage;
