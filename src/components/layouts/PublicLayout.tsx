import AutoBreadcrumbs from '@/components/shared/AutoBreadcrumbs';

const PublicLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <main className="public-route">
            <div className="px-4 py-2 border-b border-primary/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
                <AutoBreadcrumbs />
            </div>
            <div className="public-route-wrapper">{children}</div>
        </main>
    );
};

export default PublicLayout;
