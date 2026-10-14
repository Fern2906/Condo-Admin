import { Link } from '@inertiajs/react';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';
import { IconBuildingSkyscraper } from '@tabler/icons-react';

export default function AuthSimpleLayout({
    children,
    title,
}: AuthLayoutProps) {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
            <div className="w-full">
                <div className="flex flex-col gap-8">
                    <div className="flex flex-col items-center gap-4">
                        <Link href={home()} className="flex flex-col items-center gap-2 font-medium">
                            <div className="mb-1 flex items-center justify-center rounded-md">
                                <IconBuildingSkyscraper className="size-20 text-(--foreground) dark:text-white" />
                            </div>
                            <span className="sr-only text-black">{title}</span>
                        </Link>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
