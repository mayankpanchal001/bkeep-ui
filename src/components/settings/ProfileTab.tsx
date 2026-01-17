import React, { useRef, useState } from 'react';
import { useAuth } from '../../stores/auth/authSelectore';
import { Icons } from '../shared/Icons';
import { Button } from '../ui/button';
import Input from '../ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../ui/select';
import { Textarea } from '../ui/textarea';
import { SettingsFormData } from './types';

interface ProfileTabProps {
    formData: SettingsFormData;
    onFormDataChange: (data: SettingsFormData) => void;
    onSubmit: (e: React.FormEvent) => void;
    isLoading?: boolean;
}

const ProfileTab = ({
    formData,
    onFormDataChange,
    onSubmit,
    isLoading = false,
}: ProfileTabProps) => {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isEditing || isLoading) return;
        try {
            await Promise.resolve(onSubmit(e));
            // Reset editing state after successful submission
            setIsEditing(false);
        } catch (error) {
            // Error handling is done in the parent component
            // Keep editing state true so user can fix errors
            console.error('Form submission error:', error);
        }
    };

    const handleSaveClick = () => {
        if (formRef.current) {
            formRef.current.requestSubmit();
        }
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
        <div className="flex flex-col gap-4 max-w-2xl ">
            {/* Header: Avatar + Upload + Edit Toggle */}
            <div className="bg-card">
                <div className="flex items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-primary/10 bg-primary/10 text-primary">
                            <span className="text-xl font-semibold">
                                {getInitials(
                                    formData.name || user?.name || 'User'
                                )}
                            </span>
                        </div>
                        <Button size="sm" type="button" disabled={!isEditing}>
                            Upload image
                        </Button>
                    </div>
                    {!isEditing ? (
                        <Button
                            size="sm"
                            type="button"
                            variant="default"
                            onClick={() => setIsEditing(true)}
                        >
                            Edit profile
                        </Button>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Button
                                size="sm"
                                type="button"
                                variant="outline"
                                onClick={() => setIsEditing(false)}
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <Button
                                size="sm"
                                type="button"
                                variant="default"
                                onClick={handleSaveClick}
                                loading={isLoading}
                                disabled={isLoading}
                            >
                                Save changes
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Profile Form */}
            <form
                ref={formRef}
                onSubmit={handleSubmit}
                className="flex flex-col gap-4 "
            >
                <div className="flex flex-col gap-4 ">
                    <div>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) =>
                                onFormDataChange({
                                    ...formData,
                                    name: e.target.value,
                                })
                            }
                            startIcon={<Icons.UserCircle size={16} />}
                            required
                            placeholder="shadcn"
                            disabled={!isEditing}
                        />
                        <p className="mt-2 text-xs text-primary/50">
                            This is your public display name. It can be your
                            real name or a pseudonym. You can only change this
                            once every 30 days.
                        </p>
                    </div>

                    <div>
                        <Select
                            value={formData.email}
                            onValueChange={(value: string) =>
                                onFormDataChange({
                                    ...formData,
                                    email: value,
                                })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select an email to display" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={user?.email || ''}>
                                    {user?.email || ''}
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="mt-2 text-xs text-primary/50">
                            You can manage verified email addresses in your
                            email settings.
                        </p>
                    </div>

                    <div>
                        <Textarea
                            id="bio"
                            value={formData.bio || ''}
                            onChange={(
                                e: React.ChangeEvent<HTMLTextAreaElement>
                            ) =>
                                onFormDataChange({
                                    ...formData,
                                    bio: e.target.value,
                                })
                            }
                            placeholder="I own a computer."
                            disabled={!isEditing}
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
                                <Input
                                    key={idx}
                                    id={`url-${idx}`}
                                    type="url"
                                    value={url}
                                    onChange={(
                                        e: React.ChangeEvent<HTMLInputElement>
                                    ) => {
                                        const next = [...(formData.urls || [])];
                                        next[idx] = e.target.value;
                                        onFormDataChange({
                                            ...formData,
                                            urls: next,
                                        });
                                    }}
                                    placeholder="https://"
                                    disabled={!isEditing}
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
                            disabled={!isEditing}
                        >
                            Add URL
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default ProfileTab;
