import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface SearchFilterProps {
  placeholder?: string;
  onChange: (value: string) => void;
  className?: string;
  debounceMs?: number;
}

export default function SearchFilter({ 
  placeholder = 'Search...', 
  onChange, 
  className = '',
  debounceMs = 300
}: SearchFilterProps) {
  const [inputValue, setInputValue] = useState('');

  // Use a debounce to avoid too many onChange calls while typing quickly
  useEffect(() => {
    const handler = setTimeout(() => {
      onChange(inputValue);
    }, debounceMs);

    return () => {
      clearTimeout(handler);
    };
  }, [inputValue, onChange, debounceMs]);

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
      <Input
        type="text"
        placeholder={placeholder}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className="pl-10 pr-4 py-2"
      />
    </div>
  );
}
