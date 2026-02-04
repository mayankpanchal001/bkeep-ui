import { cn } from '@/utils/cn';
import { NavLink, Outlet } from 'react-router';

const EXPENSES_TABS = [
    { label: 'Expenses', path: '/expenses', end: true },
    { label: 'Bills', path: '/expenses/bills', end: false },
    { label: 'Suppliers', path: '/expenses/contacts', end: false },
    { label: 'Mileage', path: '/expenses/mileage', end: false },
];

const ExpensesLayout = () => {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold text-primary">Expenses</h1>
                <nav
                    className="flex gap-1 border-b border-border"
                    aria-label="Expenses sections"
                >
                    {EXPENSES_TABS.map((tab) => (
                        <NavLink
                            key={tab.path}
                            to={tab.path}
                            end={tab.end}
                            className={({ isActive }) =>
                                cn(
                                    'px-4 py-2 text-sm font-medium transition-colors border-b-2',
                                    isActive
                                        ? 'text-primary border-primary'
                                        : 'text-muted-foreground hover:text-primary border-transparent'
                                )
                            }
                        >
                            {tab.label}
                        </NavLink>
                    ))}
                </nav>
            </div>
            <Outlet />
        </div>
    );
};

export default ExpensesLayout;
