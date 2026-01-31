import { MoreVertical } from 'lucide-react';
import * as React from 'react';
import { Button } from '../ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

export interface ActionMenuItem {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    disabled?: boolean;
    destructive?: boolean;
    separator?: boolean; // Add separator before this item
}

export interface ActionMenuProps {
    /**
     * Array of action items to display in the menu
     */
    items: ActionMenuItem[];
    /**
     * Optional label for the dropdown menu (defaults to "Actions")
     */
    label?: string;
    /**
     * Whether the action menu button is disabled
     */
    disabled?: boolean;
    /**
     * Button variant (defaults to "ghost")
     */
    variant?: 'ghost' | 'outline';
    /**
     * Button size (defaults to "sm")
     */
    size?: 'sm' | 'default';
    /**
     * Alignment of the dropdown menu (defaults to "end")
     */
    align?: 'start' | 'end' | 'center';
    /**
     * Whether to show tooltip on the action button
     */
    tooltip?: string;
    /**
     * Custom className for the trigger button
     */
    className?: string;
    /**
     * Whether to show the label in the dropdown
     */
    showLabel?: boolean;
}

/**
 * Reusable ActionMenu component for table rows and other action contexts.
 * Displays a vertical three-dot menu button that opens a dropdown with action items.
 *
 * @example
 * ```tsx
 * <ActionMenu
 *   items={[
 *     {
 *       label: 'View Details',
 *       icon: <Icons.Eye className="mr-2 w-4 h-4" />,
 *       onClick: () => handleView(item),
 *     },
 *     {
 *       label: 'Edit',
 *       icon: <Icons.Edit className="mr-2 w-4 h-4" />,
 *       onClick: () => handleEdit(item),
 *       separator: true,
 *     },
 *     {
 *       label: 'Delete',
 *       icon: <Icons.Trash className="mr-2 w-4 h-4" />,
 *       onClick: () => handleDelete(item),
 *       destructive: true,
 *       separator: true,
 *     },
 *   ]}
 * />
 * ```
 */
export function ActionMenu({
    items,
    label = 'Actions',
    disabled = false,
    variant = 'ghost',
    size = 'sm',
    align = 'end',
    tooltip,
    className,
    showLabel = true,
}: ActionMenuProps) {
    const filteredItems = items.filter(
        (item) => item !== null && item !== undefined
    );

    if (filteredItems.length === 0) {
        return null;
    }

    const triggerButton = (
        <Button
            variant={variant}
            size={size}
            className={`h-8 w-8 p-0 ${className || ''}`}
            disabled={disabled}
            aria-label="Row actions"
        >
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
        </Button>
    );

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                {tooltip ? (
                    <Tooltip>
                        <TooltipTrigger asChild>{triggerButton}</TooltipTrigger>
                        <TooltipContent>{tooltip}</TooltipContent>
                    </Tooltip>
                ) : (
                    triggerButton
                )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align={align}>
                {showLabel && (
                    <>
                        <DropdownMenuLabel>{label}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                    </>
                )}
                {filteredItems.map((item, index) => {
                    const menuItem = (
                        <DropdownMenuItem
                            key={`${item.label}-${index}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (!item.disabled) {
                                    item.onClick();
                                }
                            }}
                            disabled={item.disabled}
                            className={
                                item.destructive
                                    ? 'text-destructive focus:text-destructive'
                                    : ''
                            }
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </DropdownMenuItem>
                    );

                    return (
                        <React.Fragment key={`fragment-${index}`}>
                            {item.separator && index > 0 && (
                                <DropdownMenuSeparator />
                            )}
                            {menuItem}
                        </React.Fragment>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export default ActionMenu;
