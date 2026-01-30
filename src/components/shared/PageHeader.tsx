const PageHeader = ({
    title,
    subtitle,
    actions,
}: {
    title: string;
    subtitle: string;
    actions?: React.ReactNode;
}) => {
    return (
        <div className="sm:p-4 rounded-md flex items-center bg-card border-b border-primary/10 pb-4 justify-between gap-4 flex-wrap">
            <div className="flex flex-col justify-between min-w-[200px]">
                <h1 className="text-xl font-bold text-primary">{title}</h1>
                <p className="text-sm text-primary/50">{subtitle}</p>
            </div>
            {actions && (
                <div className="flex items-center max-sm:w-full gap-2">
                    {actions}
                </div>
            )}
        </div>
    );
};

export default PageHeader;
