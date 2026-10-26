import type { ReactNode } from 'react';
import { Card, Checkbox, Flex, Table, Text } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';

export interface Column<T> {
    header: ReactNode;
    render: (row: T) => ReactNode;
    align?: 'left' | 'center' | 'right';
}

interface DataTableProps<T extends { id: number }> {
    data: T[];
    columns: Column<T>[];
    /** Si se pasan `selection` y `onSelectionChange` aparece la columna de checkboxes. */
    selection?: number[];
    onSelectionChange?: (ids: number[]) => void;
    /** Contenido de la columna "Acciones" (normalmente <RowActions />). */
    actions?: (row: T) => ReactNode;
    emptyMessage?: string;
    minWidth?: number;
    maxHeight?: number;
}

export function DataTable<T extends { id: number }>({
    data,
    columns,
    selection,
    onSelectionChange,
    actions,
    emptyMessage = 'No se encontraron resultados con los filtros seleccionados.',
    minWidth = 800,
    maxHeight = 600,
}: DataTableProps<T>) {
    const selectable = selection !== undefined && onSelectionChange !== undefined;
    const ids = data.map((r) => r.id);
    const allSelected = selectable && ids.length > 0 && ids.every((id) => selection.includes(id));
    const someSelected = selectable && selection.length > 0 && !allSelected;

    const toggleAll = () => onSelectionChange?.(allSelected ? [] : ids);
    const toggleRow = (id: number) =>
        onSelectionChange?.(selection!.includes(id) ? selection!.filter((x) => x !== id) : [...selection!, id]);

    const colSpan = columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0);

    return (
        <Card withBorder radius="md" padding="lg" w="100%">
            <Table.ScrollContainer minWidth={minWidth} maxHeight={maxHeight}>
                <Table striped highlightOnHover verticalSpacing="sm">
                    <Table.Thead>
                        <Table.Tr>
                            {selectable && (
                                <Table.Th w={40}>
                                    <Checkbox
                                        aria-label="Seleccionar todos"
                                        checked={allSelected}
                                        indeterminate={someSelected}
                                        onChange={toggleAll}
                                    />
                                </Table.Th>
                            )}
                            {columns.map((c, i) => <Table.Th key={i} ta={c.align}>{c.header}</Table.Th>)}
                            {actions && <Table.Th ta="center">Acciones</Table.Th>}
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {data.length === 0 ? (
                            <Table.Tr>
                                <Table.Td colSpan={colSpan} ta="center" py="xl">
                                    <Flex direction="column" align="center" gap="xs">
                                        <IconAlertCircle size={32} color="gray" />
                                        <Text c="dimmed">{emptyMessage}</Text>
                                    </Flex>
                                </Table.Td>
                            </Table.Tr>
                        ) : (
                            data.map((row) => (
                                <Table.Tr key={row.id}>
                                    {selectable && (
                                        <Table.Td>
                                            <Checkbox checked={selection.includes(row.id)} onChange={() => toggleRow(row.id)} />
                                        </Table.Td>
                                    )}
                                    {columns.map((c, i) => <Table.Td key={i} ta={c.align}>{c.render(row)}</Table.Td>)}
                                    {actions && <Table.Td>{actions(row)}</Table.Td>}
                                </Table.Tr>
                            ))
                        )}
                    </Table.Tbody>
                </Table>
            </Table.ScrollContainer>
        </Card>
    );
}
