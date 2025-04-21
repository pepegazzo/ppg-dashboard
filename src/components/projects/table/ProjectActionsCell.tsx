
import { useState } from "react";
import { TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Eye, Key, Link, Copy } from "lucide-react";

interface ProjectActionsCellProps {
  projectId: string;
  projectPassword?: string | null;
  projectSlug?: string | null;
  setShowDeleteModal: (show: boolean) => void;
  setSelectedProjects: (ids: string[]) => void;
}

export function ProjectActionsCell({
  projectId,
  projectPassword,
  projectSlug,
  setShowDeleteModal,
  setSelectedProjects,
}: ProjectActionsCellProps) {
  const [open, setOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handlePortalClick = () => {
    setOpen(true);
  };

  const handleVisitPortal = () => {
    if (projectSlug) {
      window.open(`/projects/${projectSlug}/portal`, "_blank", "noopener,noreferrer");
    }
  };

  const handleCopyPassword = () => {
    if (projectPassword) {
      navigator.clipboard.writeText(projectPassword);
    }
  };

  return (
    <TableCell className="flex items-center gap-2 p-0">
      <Button
        variant="default"
        size="sm"
        className="bg-primary text-primary-foreground hover:bg-primary/90"
        onClick={handlePortalClick}
      >
        Portal
        <Link className="ml-1 w-4 h-4" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              Project Password
            </DialogTitle>
            <DialogDescription>
              Use this password to access the client portal for this project.
            </DialogDescription>
          </DialogHeader>
          <div className="mb-4 mt-2 flex items-center gap-2">
            <input
              type={showPassword ? "text" : "password"}
              readOnly
              value={projectPassword || ""}
              className="w-full font-mono px-3 py-1.5 border rounded bg-muted text-base"
              placeholder="No password"
              aria-label="Project Password"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              type="button"
            >
              <Eye className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopyPassword}
              aria-label="Copy password"
              type="button"
            >
              <Copy className="w-5 h-5" />
            </Button>
          </div>
          <DialogFooter>
            <Button
              variant="default"
              onClick={handleVisitPortal}
              disabled={!projectSlug}
              className="w-full"
              type="button"
            >
              Visit Project Portal
              <Link className="ml-2 w-4 h-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TableCell>
  );
}
