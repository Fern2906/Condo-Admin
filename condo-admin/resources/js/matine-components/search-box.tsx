import { Button } from '@mantine/core';
import { Spotlight, SpotlightActionData, spotlight } from '@mantine/spotlight';
import { IconMagnetFilled } from '@tabler/icons-react';
import { IconAlertCircle } from '@tabler/icons-react';

export interface SearchActionData {
    id: string;
    label: string;
    description: string;
    onClick: () => void;
    leftSection?: React.ReactNode;
}

interface SearchBoxProps {
    placeholder?: string;
    actions: SearchActionData[];
    onSearch?: (query: string) => void;
    onClear?: () => void;
}

export function SearchBox({ placeholder, actions, onSearch, onClear }: SearchBoxProps) {
    return (
        <>
            <Button onClick={spotlight.open}>Open spotlight</Button>
      <Spotlight
        actions={actions}
        nothingFound="Nothing found..."
        highlightQuery
        searchProps={{
          leftSection: <IconMagnetFilled size={20} />,
          placeholder: placeholder,
        }}
      />
    </>
  );
}
