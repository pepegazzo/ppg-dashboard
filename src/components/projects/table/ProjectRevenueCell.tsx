import { TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface ProjectRevenueCellProps {
  revenue?: number | null;
}

export function ProjectRevenueCell({ revenue }: ProjectRevenueCellProps) {
  const formatRevenue = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return 'S/ 0.00';
    return `S/ ${amount.toFixed(2)}`;
  };

  const getRevenueVariant = () => {
    if (!revenue || revenue === 0) return "outline";
    return "success";
  };

  return (
    <TableCell>
      <Badge variant="table">
        {formatRevenue(revenue)}
      </Badge>
    </TableCell>
  );
}
