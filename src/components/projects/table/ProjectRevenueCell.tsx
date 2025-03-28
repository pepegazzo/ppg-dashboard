
import { Badge } from "@/components/ui/badge";

interface ProjectRevenueCellProps {
  revenue: number | null | undefined;
}

export function ProjectRevenueCell({ revenue }: ProjectRevenueCellProps) {
  const formatRevenue = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return 'S/ 0.00';
    return `S/ ${amount.toFixed(2)}`;
  };

  return (
    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 w-fit">
      {formatRevenue(revenue)}
    </Badge>
  );
}
