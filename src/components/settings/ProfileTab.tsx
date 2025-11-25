import { FaSave } from 'react-icons/fa';
import Button from '../typography/Button';
import { InputField } from '../typography/InputFields';
import { SettingsFormData } from './types';

interface ProfileTabProps {
    formData: SettingsFormData;
    onFormDataChange: (data: SettingsFormData) => void;
    onSubmit: (e: React.FormEvent) => void;
}

const ProfileTab = ({
    formData,
    onFormDataChange,
    onSubmit,
}: ProfileTabProps) => {
    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-primary mb-4">
                    Profile Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField
                        id="name"
                        label="Name"
                        value={formData.name}
                        onChange={(e) =>
                            onFormDataChange({
                                ...formData,
                                name: e.target.value,
                            })
                        }
                        required
                    />
                    <InputField
                        id="email"
                        label="Email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                            onFormDataChange({
                                ...formData,
                                email: e.target.value,
                            })
                        }
                        required
                    />
                    <InputField
                        id="phone"
                        label="Phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                            onFormDataChange({
                                ...formData,
                                phone: e.target.value,
                            })
                        }
                    />
                    <InputField
                        id="company"
                        label="Company"
                        value={formData.company}
                        onChange={(e) =>
                            onFormDataChange({
                                ...formData,
                                company: e.target.value,
                            })
                        }
                    />
                </div>
            </div>
            <div className="flex justify-end pt-4 border-t border-primary-10">
                <Button type="submit" variant="primary">
                    <FaSave className="mr-2" />
                    Save Changes
                </Button>
            </div>
        </form>
    );
};

export default ProfileTab;

