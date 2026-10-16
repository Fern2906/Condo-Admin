import { ActionIcon, Card, Grid, MultiSelect, TextInput } from "@mantine/core";
import { IconSearch, IconX } from "@tabler/icons-react";

interface FilterOption {
  value: string;
  label: string;
}

interface FilterBoxProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterStatus: string[];
  setFilterStatus: (status: string[]) => void;
  filterBuilding: string[];
  setFilterBuilding: (building: string[]) => void;
  statusOptions: FilterOption[];
  buildingOptions: FilterOption[];
}

export function FilterBox({
  searchQuery,
  setSearchQuery,
  filterStatus,
  setFilterStatus,
  filterBuilding,
  setFilterBuilding,
  statusOptions,
  buildingOptions,
}: FilterBoxProps) {
  return (
    <Card withBorder radius="md" padding="md">
      <Grid align="center" gap="md">
        <Grid.Col span={{ base: 12, md: 5 }}>
          <TextInput
            placeholder="Buscar por código, nombre, edificio o locatario..."
            leftSection={<IconSearch size={16} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
            rightSection={
              searchQuery ? (
                <ActionIcon size="xs" variant="subtle" onClick={() => setSearchQuery("")}>
                  <IconX size={12} />
                </ActionIcon>
              ) : null
            }
          />
        </Grid.Col>

        <Grid.Col span={{ base: 6, sm: 3, md: 3.5 }}>
          <MultiSelect
            placeholder="Estado"
            clearable
            searchable
            value={filterStatus}
            onChange={setFilterStatus}
            data={statusOptions}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 6, sm: 3, md: 3.5 }}>
          <MultiSelect
            placeholder="Edificio"
            clearable
            searchable
            value={filterBuilding}
            onChange={setFilterBuilding}
            data={buildingOptions}
          />
        </Grid.Col>
      </Grid>
    </Card>
  );
}
