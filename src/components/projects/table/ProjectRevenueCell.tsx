
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

  const getRevenueColor = () => {
    if (!revenue || revenue === 0) return "bg-gray-50 text-gray-700 border-gray-200";
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  };

  return (
    <TableCell>
      <Badge variant="outline" className={`${getRevenueColor()} w-fit`}>
        {formatRevenue(revenue)}
      </Badge>
    </TableCell>
  );
}
