
import { TableCell } from "@/components/ui/table";

interface ProjectNameCellProps {
  name: string;
}

export function ProjectNameCell({ name }: ProjectNameCellProps) {
  return <span>{name}</span>;
}
