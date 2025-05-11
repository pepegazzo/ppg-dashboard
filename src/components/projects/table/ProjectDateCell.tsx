
import { format, parseISO } from "date-fns";

interface ProjectDateCellProps {
  date: string | null;
  readOnly: boolean;
}

export function ProjectDateCell({ date, readOnly }: ProjectDateCellProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    try {
      return format(parseISO(dateString), 'MMM d, yyyy');
    } catch {
      return dateString || '-';
    }
  };

  return (
    <span>{formatDate(date)}</span>
  );
}
