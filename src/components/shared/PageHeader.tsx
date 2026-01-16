const PageHeader = ({
    title,
    subtitle,
}: {
    title: string;
    subtitle: string;
}) => {
    return (
        <div className="flex items-center bg-card border-b border-primary/10 pb-4 justify-between gap-4 flex-wrap">
            <div className="flex flex-col justify-between min-w-[200px]">
                <h1 className="text-xl font-bold text-primary">{title}</h1>
                <p className="text-sm text-primary/50">{subtitle}</p>
            </div>
        </div>
    );
};

export default PageHeader;
