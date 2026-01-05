import React from 'react';
import { useAuth } from '../../stores/auth/authSelectore';
import Button from '../typography/Button';
import {
    InputField,
    SelectField,
    TextareaField,
} from '../typography/InputFields';
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
    const { user } = useAuth();

    const handleSubmit = (e: React.FormEvent) => {
        onSubmit(e);
    };

    // Get user initials for avatar
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className="flex flex-col gap-4 ">
            {/* Header: Avatar + Upload */}
            <div className="bg-surface">
                <div className="flex items-center gap-6">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full border border-primary/10 bg-primary/10 text-primary">
                        <span className="text-xl font-semibold">
                            {getInitials(formData.name || user?.name || 'User')}
                        </span>
                    </div>
                    <Button size="sm" type="button">
                        Upload image
                    </Button>
                </div>
            </div>

            {/* Profile Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex flex-col gap-4">
                    <div>
                        <InputField
                            id="name"
                            label="Username"
                            value={formData.name}
                            onChange={(e) =>
                                onFormDataChange({
                                    ...formData,
                                    name: e.target.value,
                                })
                            }
                            required
                            placeholder="shadcn"
                        />
                        <p className="mt-2 text-xs text-primary/50">
                            This is your public display name. It can be your
                            real name or a pseudonym. You can only change this
                            once every 30 days.
                        </p>
                    </div>

                    <div>
                        <SelectField
                            id="email"
                            label="Email"
                            labelShow={true}
                            placeholder="Select a verified email to display"
                            value={formData.email}
                            onChange={(e) =>
                                onFormDataChange({
                                    ...formData,
                                    email: e.target.value,
                                })
                            }
                            options={
                                user?.email
                                    ? [
                                          {
                                              value: user.email,
                                              label: user.email,
                                          },
                                      ]
                                    : []
                            }
                            required
                        />
                        <p className="mt-2 text-xs text-primary/50">
                            You can manage verified email addresses in your
                            email settings.
                        </p>
                    </div>

                    <div>
                        <TextareaField
                            id="bio"
                            label="Bio"
                            value={formData.bio || ''}
                            onChange={(e) =>
                                onFormDataChange({
                                    ...formData,
                                    bio: e.target.value,
                                })
                            }
                            placeholder="I own a computer."
                        />
                        <p className="mt-2 text-xs text-primary/50">
                            You can @mention other users and organizations to
                            link to them.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <p className="input-label">URLs</p>
                        <p className="text-xs text-primary/50">
                            Add links to your website, blog, or social media
                            profiles.
                        </p>
                        <div className="space-y-2">
                            {(formData.urls || []).map((url, idx) => (
                                <InputField
                                    key={idx}
                                    id={`url-${idx}`}
                                    type="url"
                                    value={url}
                                    onChange={(e) => {
                                        const next = [...(formData.urls || [])];
                                        next[idx] = e.target.value;
                                        onFormDataChange({
                                            ...formData,
                                            urls: next,
                                        });
                                    }}
                                    placeholder="https://"
                                />
                            ))}
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                onFormDataChange({
                                    ...formData,
                                    urls: [...(formData.urls || []), ''],
                                })
                            }
                        >
                            Add URL
                        </Button>
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button type="submit" variant="primary">
                        Update profile
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default ProfileTab;
