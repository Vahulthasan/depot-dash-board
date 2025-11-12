import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

const SearchBar = ({ value, onChange }: SearchBarProps) => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Search by route number, location, or destination..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10 h-12 text-base"
      />
    </div>
  );
};

export default SearchBar;
