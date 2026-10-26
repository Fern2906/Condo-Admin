import { Card, MultiSelect, SimpleGrid, TextInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';

export interface FilterConfig {
    label: string;
    placeholder?: string;
    data: { value: string; label: string }[];
    value: string[];
    onChange: (value: string[]) => void;
    searchable?: boolean;
}

interface FilterBarProps {
    search: { value: string; onChange: (value: string) => void; placeholder?: string };
    filters?: FilterConfig[];
}

export function FilterBar({ search, filters = [] }: FilterBarProps) {
    return (
        <Card withBorder radius="md" padding="md">
            <SimpleGrid cols={{ base: 1, sm: 2, md: Math.min(filters.length + 1, 4) }} spacing="md">
                <TextInput
                    label="Buscar"
                    placeholder={search.placeholder ?? 'Buscar...'}
                    leftSection={<IconSearch size={16} />}
                    value={search.value}
                    onChange={(e) => search.onChange(e.currentTarget.value)}
                />
                {filters.map((f) => (
                    <MultiSelect
                        key={f.label}
                        label={f.label}
                        placeholder={f.placeholder ?? 'Todos'}
                        clearable
                        searchable={f.searchable}
                        data={f.data}
                        value={f.value}
                        onChange={f.onChange}
                    />
                ))}
            </SimpleGrid>
        </Card>
    );
}
