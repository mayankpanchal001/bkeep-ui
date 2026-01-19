import { Button } from '@/components/ui/button';
import { isRouteErrorResponse, useRouteError } from 'react-router';

const LAZY_IMPORT_RETRY_KEY = 'bkeep_lazy_import_retry';

export default function RouteErrorBoundary() {
    const error = useRouteError();
    const message = isRouteErrorResponse(error)
        ? `${error.status} ${error.statusText}`
        : error instanceof Error
          ? error.message
          : String(error);

    const isChunkLoadError =
        message.includes('Failed to fetch dynamically imported module') ||
        message.includes('Importing a module script failed') ||
        message.includes('Failed to load module script');

    return (
        <div className="min-h-[60vh] w-full flex items-center justify-center p-6">
            <div className="w-full max-w-lg rounded-md border border-border bg-background p-6 flex flex-col gap-4">
                <div className="space-y-1">
                    <div className="text-lg font-semibold text-foreground">
                        Unexpected application error
                    </div>
                    <div className="text-sm text-muted-foreground break-all">
                        {message}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={() => window.location.reload()}>
                        Reload
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => {
                            sessionStorage.removeItem(LAZY_IMPORT_RETRY_KEY);
                            window.location.href = '/';
                        }}
                    >
                        Go home
                    </Button>
                    {isChunkLoadError && (
                        <Button
                            variant="outline"
                            onClick={() => {
                                caches
                                    ?.keys?.()
                                    .then((keys) =>
                                        Promise.all(
                                            keys.map((k) => caches.delete(k))
                                        )
                                    )
                                    .finally(() => window.location.reload());
                            }}
                        >
                            Clear cache
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
