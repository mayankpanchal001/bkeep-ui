const PreferencesTab = () => {
    return (
        <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
                Appearance is controlled by the application theme in{' '}
                <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                    src/styles/theme.css
                </code>
                . Edit that file to change colors and styling.
            </p>
        </div>
    );
};

export default PreferencesTab;
