import Navbar from '@/matine-components/navbar';
import { Footer } from '@/matine-components/footer';

export default function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    const links = [
        { link: '/dashboard', label: 'Dashboard' },
        { link: '/locales', label: 'Locales' },
        { link: '/users', label: 'Locatarios' },
        { link: '/contratos', label: 'Contratos' },
        { link: '/pagos', label: 'Cuotas y Pagos' },
        { link: '/reportes', label: 'Reportes' },
        { link: '/mensajes', label: 'Mensajes' },
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
