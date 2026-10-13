import {Card,Group,SimpleGrid,Text,UnstyledButton} from '@mantine/core';
import classes from '../../css/accion-cards.module.css';
interface CardData  {
    title : string;
    icon: React.ComponentType<{ color?: string; size?: number; stroke?: number }>;
    color: string;
}

interface CardProps {
    data: CardData[]
}

export function AccionCards({data} : Readonly<CardProps>) {

  const items = data.map((item) => (
    <UnstyledButton key={item.title} className={classes.item}>
      <item.icon color={item.color} size={32} stroke={1.5} />
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
