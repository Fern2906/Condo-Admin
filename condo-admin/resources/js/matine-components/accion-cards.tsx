import {
    IconBell,
  IconBuildingBank,
  IconCalendarClock,
  IconCashBanknote,
  IconCoin,
  IconCreditCard,
  IconHome,
  IconMessage,
  IconMessage2,
  IconReceipt,
  IconReceiptRefund,
  IconReceiptTax,
  IconRepeat,
  IconReport,
} from '@tabler/icons-react';
import {
  Card,
  Group,
  SimpleGrid,
  Text,
  UnstyledButton,
  useMantineTheme,
} from '@mantine/core';
import classes from '../../css/accion-cards.module.css';

const mockdata = [
  { title: 'Mi casa', icon: IconHome, color: 'indigo' },
  { title: 'Mis cuotas y pagos', icon: IconReceiptTax, color: 'cyan' },
  { title: 'Mis incidencias', icon: IconReport, color: 'pink' },
  { title: 'Reservar áreas comunes', icon: IconCalendarClock, color: 'red' },
  { title: 'Avisos', icon: IconBell, color: 'red' },
  { title: 'Contacto con administración', icon: IconMessage, color: 'red' },
];

export function AccionCards() {
  const theme = useMantineTheme();

  const items = mockdata.map((item) => (
    <UnstyledButton key={item.title} className={classes.item}>
      <item.icon color={theme.colors[item.color][6]} size={32} stroke={1.5} />
      <Text size="xs" mt={7}>
        {item.title}
      </Text>
    </UnstyledButton>
  ));

  return (
    <Card className={classes.card}>
      <Group justify="space-between">
        <Text className={classes.title}>Services</Text>
      </Group>
      <SimpleGrid cols={3} mt="md">
        {items}
      </SimpleGrid>
    </Card>
  );
}
