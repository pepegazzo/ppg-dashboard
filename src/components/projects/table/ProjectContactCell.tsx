
interface ProjectContactCellProps {
  contactName: string | null | undefined;
}

export function ProjectContactCell({
  contactName
}: ProjectContactCellProps) {
  return (
    <span>{contactName || "No Contact"}</span>
  );
}
