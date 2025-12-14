import type React from 'react'
import { Input } from './ui/input'
import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';

type InputSearchProps = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  className?: string;
};

const InputSearch = ({
  value,
  onChange,
  placeholder,
  className,
}: InputSearchProps) => {
  return (
    <Input 
      startIcon={Search}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={cn(
        className, 'w-full focus-visible:ring-transparent'
      )}
    />
  )
}

export default InputSearch
