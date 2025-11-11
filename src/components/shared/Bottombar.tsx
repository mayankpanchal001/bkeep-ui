import { Link, useLocation } from 'react-router';
import { SIDEBAR_ITEMS } from '../../constants';

const Bottombar = () => {
    const location = useLocation();

    return (
        <div className="protected-route-bottombar">
            <div className="bottombar-items">
                {SIDEBAR_ITEMS.map((item) => (
                    <Link
                        to={item.path || '/dashboard'}
                        key={item.label}
                        className={`bottombar-item ${
                            location.pathname === item.path ? 'active' : ''
                        }`}
                    >
                        <span className="bottombar-item-icon">{item.icon}</span>
                        <span className="bottombar-item-label">
                            {item.label}
                        </span>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default Bottombar;
