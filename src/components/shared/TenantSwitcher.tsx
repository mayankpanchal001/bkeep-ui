import { FaBuilding } from 'react-icons/fa';
import { useTenant } from '../../stores/tenant/tenantSelectore';

type TenantSwitcherProps = {
    compact?: boolean;
};

const TenantSwitcher = ({ compact = false }: TenantSwitcherProps) => {
    const { tenants, selectedTenant, selectTenant } = useTenant();

    if (!tenants.length) {
        return null;
    }

    const selectClasses = compact
        ? 'text-xs'
        : 'text-sm text-primary font-medium';

    return (
        <div className="flex flex-col gap-1 min-w-[120px]">
            {!compact && (
                <span className="text-[10px] uppercase tracking-wide text-primary-50">
                    Tenant
                </span>
            )}
            <div className="flex items-center gap-2 px-3 py-2 bg-white border border-primary-10 rounded-xl shadow-sm">
                <FaBuilding className="text-primary-50 w-4 h-4" />
                <select
                    value={selectedTenant?.id || ''}
                    onChange={(event) => selectTenant(event.target.value)}
                    className={`bg-transparent ${selectClasses} flex-1 focus:outline-none`}
                >
                    {!selectedTenant && (
                        <option value="" disabled>
                            Select tenant
                        </option>
                    )}
                    {tenants.map((tenant) => (
                        <option key={tenant.id} value={tenant.id}>
                            {tenant.name} ({tenant.schemaName})
                        </option>
                    ))}
                </select>
            </div>
            {!compact && selectedTenant?.schemaName && (
                <span className="text-[10px] uppercase tracking-wide text-primary-40">
                    {selectedTenant.schemaName}
                </span>
            )}
        </div>
    );
};

export default TenantSwitcher;
