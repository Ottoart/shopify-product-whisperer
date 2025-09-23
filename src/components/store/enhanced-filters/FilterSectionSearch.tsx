import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, X } from "lucide-react";

interface FilterSectionSearchProps {
  title: string;
  items: string[];
  selectedItems: string[];
  onToggleItem: (item: string) => void;
  placeholder?: string;
  maxHeight?: string;
}

export default function FilterSectionSearch({
  title,
  items,
  selectedItems,
  onToggleItem,
  placeholder = "Search...",
  maxHeight = "max-h-48"
}: FilterSectionSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredItems = items.filter(item =>
    item.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const clearSearch = () => setSearchTerm("");

  return (
    <div className="space-y-3">
      <Label className="text-xs font-medium">{title}</Label>
      
      {/* Search input */}
      {items.length > 5 && (
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-3 w-3" />
          <Input
            type="text"
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 pr-8 h-8 text-xs"
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      )}

      {/* Items list */}
      <div className={`space-y-2 overflow-y-auto ${maxHeight}`}>
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <div key={item} className="flex items-center space-x-2">
              <Checkbox
                id={`${title.toLowerCase()}-${item}`}
                checked={selectedItems.includes(item)}
                onCheckedChange={() => onToggleItem(item)}
              />
              <Label 
                htmlFor={`${title.toLowerCase()}-${item}`} 
                className="text-sm cursor-pointer flex-1"
              >
                {item}
              </Label>
            </div>
          ))
        ) : searchTerm ? (
          <p className="text-xs text-muted-foreground py-2">
            No {title.toLowerCase()} found matching "{searchTerm}"
          </p>
        ) : (
          <p className="text-xs text-muted-foreground py-2">
            No {title.toLowerCase()} available
          </p>
        )}
      </div>

      {/* Show more/less for long lists */}
      {!searchTerm && items.length > 10 && (
        <div className="text-xs text-muted-foreground">
          Showing {Math.min(filteredItems.length, 10)} of {items.length} {title.toLowerCase()}
        </div>
      )}
    </div>
  );
}