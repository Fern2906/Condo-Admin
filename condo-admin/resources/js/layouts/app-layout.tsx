import Navbar from '@/matine-components/navbar';
import {Footer} from '@/matine-components/footer';
export default function AppLayout({children}: Readonly<{children: React.ReactNode;}>) {

    const links = [
        { link: '/about', label: 'Features' },
        { link: '/pricing', label: 'Pricing' },
        { link: '/learn', label: 'Learn' },
        { link: '/community', label: 'Community' },
    ];

    return (
        <>
        <Navbar links={links}></Navbar>
            {children}
        <Footer></Footer>
        </>
    );
}
