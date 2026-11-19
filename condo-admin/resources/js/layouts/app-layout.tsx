import { usePage } from '@inertiajs/react';
import Navbar from '@/matine-components/navbar';
import { Footer } from '@/matine-components/footer';

export default function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    const { auth } = usePage().props;
    // Los módulos de administración solo existen para el administrador; el
    // resto de usuarios (locatarios, propietarios, sin rol) usa su propio panel.
    const isAdmin = auth.user?.rol?.nombre === 'administrador';

    const links = [
        { link: isAdmin ? '/dashboard' : '/locatario/dashboard', label: 'Dashboard' },
        ...(isAdmin ? [{ link: '/avisos', label: 'Avisos' }] : []),
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
