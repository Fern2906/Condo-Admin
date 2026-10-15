import Navbar from '@/matine-components/navbar';
import { Footer } from '@/matine-components/footer';

export default function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    const links = [
        { link: '/about', label: 'Features' },
        { link: '/pricing', label: 'Pricing' },
        { link: '/learn', label: 'Learn' },
        { link: '/community', label: 'Community' },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar links={links} />
            <main style={{ flex: 1, paddingTop: 56 }}>
                {children}
            </main>
            <Footer />
        </div>
    );
}
