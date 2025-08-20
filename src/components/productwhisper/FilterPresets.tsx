import { Button } from '@/components/ui/button';
import { ProductWhisperFilters } from '@/types/productwhisper';

interface FilterPresetsProps {
  onApplyPreset: (filters: Partial<ProductWhisperFilters>) => void;
}

export const FilterPresets = ({ onApplyPreset }: FilterPresetsProps) => {
  const presets = [
    {
      name: 'High Value',
      description: 'Products over $100',
      filters: { priceMin: 100 }
    },
    {
      name: 'Low Stock',
      description: 'Products with inventory < 10',
      filters: { search: '' } // We'll need to add inventory filtering in the future
    },
    {
      name: 'Draft Products',
      description: 'Unpublished products',
      filters: { published: 'draft' as const }
    },
    {
      name: 'Recently Updated',
      description: 'Products updated this week',
      filters: { search: '' } // We'll need to add date filtering in the future
    },
    {
      name: 'No Category',
      description: 'Products without category',
      filters: { category: '' }
    },
    {
      name: 'No Vendor',
      description: 'Products without vendor',
      filters: { vendor: '' }
    }
  ];

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-muted-foreground">Quick Filters</h4>
      <div className="grid grid-cols-2 gap-2">
        {presets.map((preset) => (
          <Button
            key={preset.name}
            variant="outline"
            size="sm"
            className="h-auto p-2 text-left flex flex-col items-start"
            onClick={() => onApplyPreset(preset.filters)}
          >
            <span className="font-medium text-xs">{preset.name}</span>
            <span className="text-xs text-muted-foreground">{preset.description}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};