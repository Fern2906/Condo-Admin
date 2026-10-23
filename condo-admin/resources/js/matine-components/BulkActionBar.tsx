import { ActionBar, Box, Button, Text } from "@mantine/core";
import { IconCheck, IconTrash } from "@tabler/icons-react";

interface BulkActionBarProps {
  selection: Array<string | number>;
  onClearSelection: () => void;
  onDeleteSelected: () => void;
  onMarkAsAvailable: () => void;
  itemName?: string;
}

export function BulkActionBar({
  selection,
  onClearSelection,
  onDeleteSelected,
  onMarkAsAvailable,
  itemName = "elementos",
}: BulkActionBarProps) {
  return (
    <ActionBar opened={selection.length > 0} onClose={onClearSelection} shadow="md">
      <Text visibleFrom="xs" size="sm">
        {selection.length} {itemName} seleccionados
      </Text>
      <ActionBar.Divider />

      <Button
        variant="filled"
        color="red"
        px={{ base: "xs", sm: "md" }}
        onClick={onDeleteSelected}
      >
        <IconTrash size={14} />
        <Box visibleFrom="xs" ml={6}>
          Eliminar
        </Box>
      </Button>

      <Button
        variant="filled"
        color="blue"
        px={{ base: "xs", sm: "md" }}
        onClick={onMarkAsAvailable}
      >
        <IconCheck size={14} />
        <Box visibleFrom="xs" ml={6}>
          Marcar Disponible
        </Box>
      </Button>

      <ActionBar.CloseButton />
    </ActionBar>
  );
}
