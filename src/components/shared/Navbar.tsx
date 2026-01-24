import { cn } from '@/utils/cn';
import {
    Bell,
    Check,
    CheckCheck,
    Clock,
    CreditCard,
    DollarSign,
    FileText,
    Keyboard,
    LogOut,
    Search,
    Settings,
    Trash2,
    User,
    X,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useIsMobile } from '../../hooks/use-mobile';
import { useLogout } from '../../services/apis/authApi';
import { useAuth } from '../../stores/auth/authSelectore';
import { showSuccessToast } from '../../utills/toast';
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from '../ui/drawer';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { ScrollArea } from '../ui/scroll-area';
import { SidebarTrigger } from '../ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import AutoBreadcrumbs from './AutoBreadcrumbs';
import ThemeSwitcher from './ThemeSwitcher';

interface NavbarProps {
    onSearchClick?: () => void;
    onShortcutsClick?: () => void;
}

type NotificationType = 'invoice' | 'payment' | 'report' | 'alert' | 'system';

interface Notification {
    id: string;
    title: string;
    description: string;
    time: string;
    unread: boolean;
    type: NotificationType;
}

const notificationIcons: Record<NotificationType, React.ReactNode> = {
    invoice: <FileText className="w-4 h-4" />,
    payment: <DollarSign className="w-4 h-4" />,
    report: <FileText className="w-4 h-4" />,
    alert: <Bell className="w-4 h-4" />,
    system: <Settings className="w-4 h-4" />,
};

const notificationColors: Record<NotificationType, string> = {
    invoice: 'bg-secondary/20 text-secondary',
    payment: 'bg-secondary/20 text-secondary',
    report: 'bg-secondary/20 text-secondary',
    alert: 'bg-accent/20 text-accent',
    system: 'bg-muted text-primary/70',
};

const Navbar = ({ onSearchClick, onShortcutsClick }: NavbarProps) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { mutate: logout } = useLogout();
    const isMobile = useIsMobile();

    const initials =
        (user?.name || '')
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2) || 'U';

    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([
        {
            id: 'n1',
            title: 'New invoice created',
            description: 'Invoice #INV-1042 has been generated for Acme Corp.',
            time: '2m ago',
            unread: true,
            type: 'invoice',
        },
        {
            id: 'n2',
            title: 'Payment received',
            description: 'Payment of $1,250.00 recorded from Tech Solutions.',
            time: '1h ago',
            unread: true,
            type: 'payment',
        },
        {
            id: 'n3',
            title: 'Report ready',
            description: 'Monthly P&L report has finished processing.',
            time: 'Yesterday',
            unread: false,
            type: 'report',
        },
        {
            id: 'n4',
            title: 'Overdue invoice alert',
            description: 'Invoice #INV-1038 is 30 days overdue.',
            time: '2 days ago',
            unread: false,
            type: 'alert',
        },
    ]);

    const unreadCount = notifications.filter((n) => n.unread).length;

    const markAsRead = (id: string) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
        );
    };

    const markAllAsRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
        showSuccessToast('All notifications marked as read');
    };

    const deleteNotification = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        showSuccessToast('Notification deleted');
    };

    const clearAllNotifications = () => {
        setNotifications([]);
        showSuccessToast('All notifications cleared');
    };

    const handleNotificationClick = (notification: Notification) => {
        markAsRead(notification.id);
        setIsNotificationsOpen(false);

        // Navigate based on notification type
        switch (notification.type) {
            case 'invoice':
                navigate('/invoices');
                break;
            case 'payment':
                navigate('/transactions');
                break;
            case 'report':
                navigate('/reports');
                break;
            default:
                navigate('/settings/notifications');
        }
    };

    const isMac = navigator.userAgent.includes('Macintosh');

    return (
        <nav className="flex items-center justify-between p-4 bg-card/80 dark:bg-muted/80 backdrop-blur-md border-b border-primary/10 sticky top-0 z-40 w-full">
            <div className="flex items-center gap-4">
                <SidebarTrigger className="-ml-1" />

                <AutoBreadcrumbs className="hidden sm:block max-w-[50vw]" />
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3 min-w-fit">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <button
                            onClick={onSearchClick}
                            className="w-[min(150px,30vw)] hidden sm:flex items-center gap-2 px-3 py-1.5 bg-card dark:bg-muted hover:bg-primary/10 rounded-md border border-primary/10 text-primary/50 transition-colors group"
                        >
                            <Search className="w-3.5 h-3.5 group-hover:text-primary" />
                            <span className="text-xs font-medium">Search</span>
                            <kbd className="ml-auto inline-block px-1.5 py-0.5 text-[10px] font-bold text-primary/40 bg-card dark:bg-muted border border-primary/10 rounded ">
                                {isMac ? '⌘' : 'Ctrl'}
                            </kbd>
                        </button>
                    </TooltipTrigger>
                    <TooltipContent>
                        Search ({isMac ? '⌘' : 'Ctrl'}+K)
                    </TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <button
                            onClick={onShortcutsClick}
                            className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-card dark:bg-muted hover:bg-primary/10 rounded-md border border-primary/10 text-primary/50 transition-colors group"
                        >
                            <Keyboard className="w-3.5 h-3.5 group-hover:text-primary" />
                            <span className="text-xs font-medium">
                                Shortcuts
                            </span>
                            <kbd className="ml-auto inline-block px-1.5 py-0.5 text-[10px] font-bold text-primary/40 bg-card dark:bg-muted border border-primary/10 rounded ">
                                ?
                            </kbd>
                        </button>
                    </TooltipTrigger>
                    <TooltipContent>Keyboard Shortcuts (?)</TooltipContent>
                </Tooltip>
                <ThemeSwitcher />

                {/* Enhanced Notifications Panel */}
                {isMobile ? (
                    <Drawer
                        open={isNotificationsOpen}
                        onOpenChange={setIsNotificationsOpen}
                    >
                        <DrawerTrigger asChild>
                            <button
                                className={cn(
                                    'relative p-2 rounded-lg transition-all duration-200',
                                    'hover:bg-primary/10 text-primary/70 hover:text-primary',
                                    isNotificationsOpen &&
                                        'bg-primary/10 text-primary'
                                )}
                                aria-label="Notifications"
                            >
                                <Bell className="w-5 h-5" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1 right-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold leading-none h-4 min-w-4 px-1 animate-in zoom-in duration-200  border border-white dark:border-slate-900">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </button>
                        </DrawerTrigger>
                        <DrawerContent className="h-[85vh] flex flex-col">
                            <DrawerHeader className="text-left px-4 py-3 border-b border-primary/10">
                                <DrawerTitle>Notifications</DrawerTitle>
                                <DrawerDescription className="sr-only">
                                    View and manage your notifications
                                </DrawerDescription>
                            </DrawerHeader>

                            {/* Quick Actions */}
                            {notifications.length > 0 && (
                                <div className="px-4 py-2 border-b border-primary/10 dark:border-primary/20 flex items-center gap-2">
                                    <button
                                        onClick={markAllAsRead}
                                        disabled={unreadCount === 0}
                                        className={cn(
                                            'flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors',
                                            unreadCount > 0
                                                ? 'text-primary hover:bg-primary/10'
                                                : 'text-primary/40 cursor-not-allowed'
                                        )}
                                    >
                                        <CheckCheck className="w-3.5 h-3.5" />
                                        Mark all read
                                    </button>
                                    <button
                                        onClick={clearAllNotifications}
                                        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-colors"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        Clear all
                                    </button>
                                </div>
                            )}

                            {/* Notifications List */}
                            <div className="flex-1 overflow-y-auto">
                                <div className="py-2">
                                    {notifications.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-12 px-4">
                                            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-surface-muted dark:bg-surface-muted/50 mb-4">
                                                <Bell className="w-7 h-7 text-primary/40" />
                                            </div>
                                            <p className="text-sm font-medium text-primary dark:text-primary mb-1">
                                                All caught up!
                                            </p>
                                            <p className="text-xs text-primary/60 dark:text-primary/50 text-center">
                                                You have no notifications at the
                                                moment.
                                            </p>
                                        </div>
                                    ) : (
                                        notifications.map((n) => (
                                            <div
                                                key={n.id}
                                                className={cn(
                                                    'group relative px-4 py-3 cursor-pointer transition-colors',
                                                    n.unread
                                                        ? 'bg-primary/5 dark:bg-primary/10'
                                                        : 'hover:bg-surface-muted dark:hover:bg-surface-muted/50'
                                                )}
                                                onClick={() =>
                                                    handleNotificationClick(n)
                                                }
                                            >
                                                <div className="flex items-start gap-3">
                                                    {/* Icon */}
                                                    <div
                                                        className={cn(
                                                            'flex items-center justify-center w-9 h-9 rounded-lg shrink-0',
                                                            notificationColors[
                                                                n.type
                                                            ]
                                                        )}
                                                    >
                                                        {
                                                            notificationIcons[
                                                                n.type
                                                            ]
                                                        }
                                                    </div>

                                                    {/* Content */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <p
                                                                className={cn(
                                                                    'text-sm truncate',
                                                                    n.unread
                                                                        ? 'font-semibold text-primary dark:text-primary'
                                                                        : 'font-medium text-primary dark:text-primary/90'
                                                                )}
                                                            >
                                                                {n.title}
                                                            </p>
                                                            {n.unread && (
                                                                <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-primary/60 dark:text-primary/50 mt-0.5 line-clamp-2">
                                                            {n.description}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-1.5">
                                                            <Clock className="w-3 h-3 text-primary/40" />
                                                            <span className="text-[11px] text-primary/40">
                                                                {n.time}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Actions - Always visible on mobile */}
                                                    <div className="flex items-center gap-1">
                                                        {n.unread && (
                                                            <button
                                                                onClick={(
                                                                    e
                                                                ) => {
                                                                    e.stopPropagation();
                                                                    markAsRead(
                                                                        n.id
                                                                    );
                                                                }}
                                                                className="p-1.5 rounded-md hover:bg-surface-muted dark:hover:bg-surface-muted/50 text-primary/50 hover:text-primary transition-colors"
                                                            >
                                                                <Check className="w-3.5 h-3.5" />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={(e) =>
                                                                deleteNotification(
                                                                    n.id,
                                                                    e
                                                                )
                                                            }
                                                            className="p-1.5 rounded-md hover:bg-red-100 dark:hover:bg-red-500/20 text-primary/50 hover:text-red-600 transition-colors"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </DrawerContent>
                    </Drawer>
                ) : (
                    // Desktop Popover
                    <Popover
                        open={isNotificationsOpen}
                        onOpenChange={setIsNotificationsOpen}
                    >
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <PopoverTrigger asChild>
                                    <button
                                        className={cn(
                                            'relative p-2 rounded-lg transition-all duration-200',
                                            'hover:bg-primary/10 text-primary/70 hover:text-primary',
                                            isNotificationsOpen &&
                                                'bg-primary/10 text-primary'
                                        )}
                                        aria-label="Notifications"
                                    >
                                        <Bell className="w-5 h-5" />
                                        {unreadCount > 0 && (
                                            <span className="absolute top-1 right-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold leading-none h-4 min-w-4 px-1 animate-in zoom-in duration-200  border border-white dark:border-slate-900">
                                                {unreadCount > 9
                                                    ? '9+'
                                                    : unreadCount}
                                            </span>
                                        )}
                                    </button>
                                </PopoverTrigger>
                            </TooltipTrigger>
                            <TooltipContent>
                                Notifications
                                {unreadCount > 0 ? ` (${unreadCount} new)` : ''}
                            </TooltipContent>
                        </Tooltip>

                        <PopoverContent
                            className="w-[calc(100vw-32px)] sm:w-96 p-0  border-slate-200/80 dark:border-slate-700/80 overflow-hidden"
                            align="end"
                            sideOffset={8}
                        >
                            {/* Header */}
                            <div className="px-4 py-3 border-b border-primary/10 dark:border-primary/20 bg-gradient-to-r from-surface-muted to-card dark:from-surface-muted/50 dark:to-surface-muted">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <Bell className="w-4 h-4 text-primary shrink-0" />
                                        <h3 className="text-sm font-semibold text-primary dark:text-primary truncate">
                                            Notifications
                                        </h3>
                                        {unreadCount > 0 && (
                                            <span className="shrink-0 px-2 py-0.5 text-[10px] font-medium bg-primary/10 text-primary rounded-full">
                                                {unreadCount} new
                                            </span>
                                        )}
                                    </div>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <button
                                                onClick={() =>
                                                    setIsNotificationsOpen(
                                                        false
                                                    )
                                                }
                                                className="p-1 rounded-md hover:bg-surface-muted dark:hover:bg-surface-muted/50 text-primary/40 hover:text-primary/70 dark:hover:text-primary/50 transition-colors shrink-0"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent>Close</TooltipContent>
                                    </Tooltip>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            {notifications.length > 0 && (
                                <div className="px-4 py-2 border-b border-primary/10 dark:border-primary/20 flex items-center gap-2">
                                    <button
                                        onClick={markAllAsRead}
                                        disabled={unreadCount === 0}
                                        className={cn(
                                            'flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors',
                                            unreadCount > 0
                                                ? 'text-primary hover:bg-primary/10'
                                                : 'text-primary/40 cursor-not-allowed'
                                        )}
                                    >
                                        <CheckCheck className="w-3.5 h-3.5" />
                                        Mark all read
                                    </button>
                                    <button
                                        onClick={clearAllNotifications}
                                        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-colors"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        Clear all
                                    </button>
                                </div>
                            )}

                            {/* Notifications List */}
                            <ScrollArea className="max-h-80">
                                <div className="py-2">
                                    {notifications.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-12 px-4">
                                            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-surface-muted dark:bg-surface-muted/50 mb-4">
                                                <Bell className="w-7 h-7 text-primary/40" />
                                            </div>
                                            <p className="text-sm font-medium text-primary dark:text-primary mb-1">
                                                All caught up!
                                            </p>
                                            <p className="text-xs text-primary/60 dark:text-primary/50 text-center">
                                                You have no notifications at the
                                                moment.
                                            </p>
                                        </div>
                                    ) : (
                                        notifications.map((n) => (
                                            <div
                                                key={n.id}
                                                className={cn(
                                                    'group relative px-4 py-3 cursor-pointer transition-colors',
                                                    n.unread
                                                        ? 'bg-primary/5 dark:bg-primary/10 hover:bg-primary/10 dark:hover:bg-primary/15'
                                                        : 'hover:bg-surface-muted dark:hover:bg-surface-muted/50'
                                                )}
                                                onClick={() =>
                                                    handleNotificationClick(n)
                                                }
                                            >
                                                <div className="flex items-start gap-3">
                                                    {/* Icon */}
                                                    <div
                                                        className={cn(
                                                            'flex items-center justify-center w-9 h-9 rounded-lg shrink-0',
                                                            notificationColors[
                                                                n.type
                                                            ]
                                                        )}
                                                    >
                                                        {
                                                            notificationIcons[
                                                                n.type
                                                            ]
                                                        }
                                                    </div>

                                                    {/* Content */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <p
                                                                className={cn(
                                                                    'text-sm truncate',
                                                                    n.unread
                                                                        ? 'font-semibold text-primary dark:text-primary'
                                                                        : 'font-medium text-primary dark:text-primary/90'
                                                                )}
                                                            >
                                                                {n.title}
                                                            </p>
                                                            {n.unread && (
                                                                <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-primary/60 dark:text-primary/50 mt-0.5 line-clamp-2">
                                                            {n.description}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-1.5">
                                                            <Clock className="w-3 h-3 text-primary/40" />
                                                            <span className="text-[11px] text-primary/40">
                                                                {n.time}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {n.unread && (
                                                            <Tooltip>
                                                                <TooltipTrigger
                                                                    asChild
                                                                >
                                                                    <button
                                                                        onClick={(
                                                                            e
                                                                        ) => {
                                                                            e.stopPropagation();
                                                                            markAsRead(
                                                                                n.id
                                                                            );
                                                                        }}
                                                                        className="p-1.5 rounded-md hover:bg-surface-muted dark:hover:bg-surface-muted/50 text-primary/50 hover:text-primary transition-colors"
                                                                    >
                                                                        <Check className="w-3.5 h-3.5" />
                                                                    </button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    Mark as read
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        )}
                                                        <Tooltip>
                                                            <TooltipTrigger
                                                                asChild
                                                            >
                                                                <button
                                                                    onClick={(
                                                                        e
                                                                    ) =>
                                                                        deleteNotification(
                                                                            n.id,
                                                                            e
                                                                        )
                                                                    }
                                                                    className="p-1.5 rounded-md hover:bg-red-100 dark:hover:bg-red-500/20 text-primary/50 hover:text-red-600 transition-colors"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                Delete
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </ScrollArea>

                            {/* Footer */}
                            {/* <div className="px-4 py-3 border-t border-slate-200/80 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/50">
                            <button
                                onClick={handleViewAll}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors"
                            >
                                <Settings className="w-4 h-4" />
                                Notification Settings
                            </button>
                        </div> */}
                        </PopoverContent>
                    </Popover>
                )}

                {/* User Menu */}
                <DropdownMenu>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <DropdownMenuTrigger asChild>
                                <button
                                    className="w-8 h-8 p-1 rounded-full bg-linear-to-br from-primary/20 to-primary/10 flex items-center justify-center text-xs text-primary font-semibold hover:from-primary/30 hover:to-primary/20 transition-colors"
                                    aria-label="User menu"
                                >
                                    {initials}
                                </button>
                            </DropdownMenuTrigger>
                        </TooltipTrigger>
                        <TooltipContent>
                            {user?.name || 'User'} Menu
                        </TooltipContent>
                    </Tooltip>
                    <DropdownMenuContent className="w-72" align="end">
                        <DropdownMenuLabel>
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-linear-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary font-semibold">
                                    {initials}
                                </div>
                                <div className="min-w-0">
                                    <div className="text-sm font-semibold text-primary truncate">
                                        {user?.name || 'User'}
                                    </div>
                                    <div className="text-xs text-primary/60 truncate">
                                        {user?.email || 'user@example.com'}
                                    </div>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => navigate('/settings/profile')}
                        >
                            <User className="mr-2 h-4 w-4" />
                            Account
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() =>
                                showSuccessToast('Billing coming soon')
                            }
                        >
                            <CreditCard className="mr-2 h-4 w-4" />
                            Billing
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => navigate('/settings/notifications')}
                        >
                            <Bell className="mr-2 h-4 w-4" />
                            Notifications
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => logout()}>
                            <LogOut className="mr-2 h-4 w-4" />
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </nav>
    );
};

export default Navbar;
