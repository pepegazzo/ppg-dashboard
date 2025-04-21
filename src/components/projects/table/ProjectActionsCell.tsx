
import { useState } from "react";
import { TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Eye, Key, Link, Copy, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Helper to generate an 8-character alphanumeric password
function generateSimplePassword() {
  return Math.random().toString(36).slice(-8).toUpperCase();
}

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
  const [currentPassword, setCurrentPassword] = useState<string>(projectPassword || "");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handlePortalClick = async () => {
    setOpen(true);

    // If password absent, generate & save password to backend, update modal
    if (!currentPassword) {
      setLoading(true);
      const newPass = generateSimplePassword();

      const { error, data } = await supabase
        .from("projects")
        .update({ portal_password: newPass })
        .eq("id", projectId)
        .select("portal_password")
        .single();

      if (error) {
        toast({
          title: "Failed to generate password",
          description: error.message,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      setCurrentPassword(data.portal_password);
      toast({
        title: "Portal password created",
        description: "A password was generated and saved for this project.",
      });
      setLoading(false);
    }
  };

  const handleVisitPortal = () => {
    if (projectSlug) {
      window.open(`/projects/${projectSlug}/portal`, "_blank", "noopener,noreferrer");
    }
  };

  const handleCopyPassword = () => {
    if (currentPassword) {
      navigator.clipboard.writeText(currentPassword);
      toast({
        title: "Password copied",
        description: "The portal password was copied to clipboard.",
      });
    }
  };

  const handleRegeneratePassword = async () => {
    setLoading(true);
    const newPass = generateSimplePassword();

    const { error, data } = await supabase
      .from("projects")
      .update({ portal_password: newPass })
      .eq("id", projectId)
      .select("portal_password")
      .single();

    if (error) {
      toast({
        title: "Failed to regenerate password",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }
    
    setCurrentPassword(data.portal_password);
    toast({
      title: "Password regenerated",
      description: "A new password was generated and saved for this project.",
    });
    setLoading(false);
  };

  return (
    <TableCell className="flex items-center gap-2 p-0">
      <Button
        variant="default"
        size="sm"
        className="bg-primary text-primary-foreground hover:bg-primary/90"
        onClick={handlePortalClick}
        disabled={loading}
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
              value={currentPassword}
              className="w-full font-mono px-3 py-1.5 border rounded bg-muted text-base"
              placeholder={loading ? "Generating password..." : "No password"}
              aria-label="Project Password"
              disabled={loading}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              type="button"
              disabled={loading}
            >
              <Eye className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopyPassword}
              aria-label="Copy password"
              type="button"
              disabled={loading || !currentPassword}
            >
              <Copy className="w-5 h-5" />
            </Button>
          </div>
          <div className="flex space-x-2 mb-4">
            <Button
              variant="outline"
              onClick={handleRegeneratePassword}
              disabled={loading}
              className="w-full"
              type="button"
            >
              Regenerate Password
              <RefreshCw className="ml-2 w-4 h-4" />
            </Button>
          </div>
          <DialogFooter>
            <Button
              variant="default"
              onClick={handleVisitPortal}
              disabled={!projectSlug || loading}
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
