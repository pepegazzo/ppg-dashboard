
import React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface ClientCompanyCellProps {
  name: string;
  isOpen: boolean;
}

export default function ClientCompanyCell({ name, isOpen }: ClientCompanyCellProps) {
  return (
    <div className="flex items-center h-10">
      <span className="font-medium">{name}</span>
      <span className="ml-2 flex items-center">
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </span>
    </div>
  );
}
