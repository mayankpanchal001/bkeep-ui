import { FaTimes } from 'react-icons/fa';
import { Link, useLocation } from 'react-router';
import { SIDEBAR_ITEMS } from '../../constants';

interface BottombarProps {
    isOpen: boolean;
    onClose: () => void;
}

const Bottombar = ({ isOpen, onClose }: BottombarProps) => {
    const location = useLocation();

    const isItemActive = (itemPath: string | undefined) => {
        if (!itemPath) return false;
        if (location.pathname === itemPath) return true;
        if (location.pathname.startsWith(itemPath + '/')) return true;
        return false;
    };

    return (
        <div className="md:hidden">
            {/* Backdrop */}
            <div
                className={`
                    fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300
                    ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
                `}
                onClick={onClose}
            />

            {/* Bottom Sheet Menu */}
            <div
                className={`
                    fixed bottom-0 inset-x-0 z-50 bg-white rounded-t-3xl shadow-2xl transform transition-transform duration-300 ease-out
                    ${isOpen ? 'translate-y-0' : 'translate-y-full'}
                `}
            >
                <div className="p-4">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-primary">Menu</h2>
                        <button
                            onClick={onClose}
                            className="p-2 text-primary-50 hover:text-primary transition-colors"
                        >
                            <FaTimes className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                        {SIDEBAR_ITEMS.map((item) => {
                            const isActive = isItemActive(item.path);
                            return (
                                <Link
                                    key={item.label}
                                    to={item.path || '/dashboard'}
                                    onClick={onClose}
                                    className="flex flex-col items-center gap-2 group"
                                >
                                    <div
                                        className={`
                                            w-14 h-14 rounded-2xl flex items-center justify-center text-xl transition-all duration-200
                                            ${
                                                isActive
                                                    ? 'bg-primary text-white shadow-lg'
                                                    : 'bg-primary-5 text-primary-50 group-hover:bg-primary-10 group-hover:text-primary'
                                            }
                                        `}
                                    >
                                        {item.icon}
                                    </div>
                                    <span
                                        className={`
                                            text-[10px] font-medium text-center leading-tight max-w-[4rem]
                                            ${isActive ? 'text-primary' : 'text-primary-50'}
                                        `}
                                    >
                                        {item.label}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Safe area padding for bottom swipe indicator */}
                    <div className="h-6"></div>
                </div>
            </div>
        </div>
    );
};

export default Bottombar;
