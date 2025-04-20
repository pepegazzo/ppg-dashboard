
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

interface ProjectRevenueCellProps {
  revenue: number | null | undefined;
}

export function ProjectRevenueCell({ revenue }: ProjectRevenueCellProps) {
  const formatRevenue = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return 'S/ 0.00';
    return `S/ ${amount.toFixed(2)}`;
  };

  return (
    <Link to="/billing" className="hover:opacity-80 transition-opacity">
      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 w-fit">
        {formatRevenue(revenue)}
      </Badge>
    </Link>
  );
}
