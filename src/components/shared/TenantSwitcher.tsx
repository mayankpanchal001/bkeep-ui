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
            <div className="flex items-center gap-2 px-3 py-2 bg-white border border-primary-10 rounded-xl shadow-sm">
                <FaBuilding className="text-primary-50 w-4 h-4" />
                <select
                    value={selectedTenant?.id || ''}
                    onChange={(event) => selectTenant(event.target.value)}
                    className={`bg-transparent ${selectClasses} flex-1 focus:outline-none`}
                >
                    <optgroup label="All tenants">
                        {!selectedTenant && (
                            <option value="" disabled>
                                Select tenant
                            </option>
                        )}

                        {tenants.map((tenant) => (
                            <option key={tenant.id} value={tenant.id}>
                                {tenant.name}
                            </option>
                        ))}
                        <option value="primary">Primary tenant</option>
                        <option value="secondary">Secondary tenant</option>
                        <option value="tertiary">Tertiary tenant</option>
                        <option value="quaternary">Quaternary tenant</option>
                        <option value="quinary">Quinary tenant</option>
                        <option value="senary">Senary tenant</option>
                        <option value="septenary">Septenary tenant</option>
                        <option value="octonary">Octonary tenant</option>
                        <option value="nonary">Nonary tenant</option>
                        <option value="denary">Denary tenant</option>
                    </optgroup>
                </select>
            </div>
        </div>
    );
};

export default TenantSwitcher;
