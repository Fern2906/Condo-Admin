import AppLayout from "@/layouts/app-layout";
import { AccionCards } from "@/matine-components/accion-cards";
import { usePage } from "@inertiajs/react";
import { IconHome, IconReceiptTax, IconReport, IconCalendarClock, IconBell, IconMessage } from "@tabler/icons-react";

export default function Welcome() {
    // const { auth } = usePage().props;
    // const userRol = auth.user.rol
    const dataResident = [
        { title: 'Mi casa', icon: IconHome, color: 'blue' },
        { title: 'Mis cuotas y pagos', icon: IconReceiptTax, color: 'purple' },
        { title: 'Mis incidencias', icon: IconReport, color: 'green' },
        { title: 'Reservar áreas comunes', icon: IconCalendarClock, color: 'red' },
        { title: 'Avisos', icon: IconBell, color: 'orange' },
        { title: 'Contacto con administración', icon: IconMessage, color: 'teal' },
    ];
    const dataAdmin = [
        { title: 'Casas', icon: IconHome, color: 'blue' },
        { title: 'Cuotas y pagos', icon: IconReceiptTax, color: 'purple' },
        { title: 'Incidencias', icon: IconReport, color: 'green' },
        { title: 'Reservaciones', icon: IconCalendarClock, color: 'red' },
        { title: 'Avisos', icon: IconBell, color: 'orange' },
        { title: 'Reportes', icon: IconMessage, color: 'teal' },
    ];

    return (
        <AppLayout>
            {/* <AccionCards data={userRol === "resident" ? dataResident : dataAdmin} /> */}
            <AccionCards data={dataAdmin} />
        </AppLayout>
    );
}
