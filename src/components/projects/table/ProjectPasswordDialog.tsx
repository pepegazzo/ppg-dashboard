
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Eye, Key, Link as LinkIcon, Copy, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

// Helper to generate an 8-character alphanumeric password
function generateSimplePassword() {
  return Math.random().toString(36).slice(-8).toUpperCase();
}

interface ProjectPasswordDialogProps {
  projectId: string;
  projectPassword?: string | null;
  projectSlug?: string | null;
  open: boolean;
  setOpen: (show: boolean) => void;
}

export function ProjectPasswordDialog({
  projectId,
  projectPassword,
  projectSlug,
  open,
  setOpen,
}: ProjectPasswordDialogProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState<string>(projectPassword || "");
  const [editedPassword, setEditedPassword] = useState<string>(projectPassword || "");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Sync props to state if dialog is re-opened on different project
  // or password changes externally.
  // UseEffect not required on every input change.
  // Disable exhaustive-deps because only want to react to open.
  // eslint-disable-next-line
  if (open && currentPassword !== (projectPassword || "")) {
    setCurrentPassword(projectPassword || "");
    setEditedPassword(projectPassword || "");
  }

  const handleDialogOpen = async () => {
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
      setEditedPassword(data.portal_password);
      toast({
        title: "Portal password created",
        description: "A password was generated and saved for this project.",
      });
      setLoading(false);
    } else {
      setEditedPassword(currentPassword);
    }
  };

  const handleCopyPassword = () => {
    if (editedPassword) {
      navigator.clipboard.writeText(editedPassword);
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
    setEditedPassword(data.portal_password);
    toast({
      title: "Password regenerated",
      description: "A new password was generated and saved for this project.",
    });
    setLoading(false);
  };

  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedPassword(e.target.value);
  };

  const handleSavePassword = async () => {
    if (!editedPassword) {
      toast({
        title: "Password cannot be empty",
        description: "Please enter a password.",
        variant: "destructive"
      });
      return;
    }
    setSaving(true);
    const { error, data } = await supabase
      .from("projects")
      .update({ portal_password: editedPassword })
      .eq("id", projectId)
      .select("portal_password")
      .single();
    if (error) {
      toast({
        title: "Failed to save password",
        description: error.message,
        variant: "destructive"
      });
      setSaving(false);
      return;
    }
    setCurrentPassword(data.portal_password);
    setEditedPassword(data.portal_password);
    toast({
      title: "Password saved",
      description: "The portal password has been updated.",
    });
    setSaving(false);
  };

  // Fixed the issue by removing onOpenAutoFocus and handling initialization in a different way
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent onPointerDownOutside={() => {}}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            Project Password
          </DialogTitle>
          <DialogDescription>
            Use this password to access the client portal for this project.
            <br />
            <span className="text-xs text-muted-foreground">You can type a custom password or generate one.</span>
          </DialogDescription>
        </DialogHeader>
        <div className="mb-4 mt-2 flex items-center gap-2">
          <input
            type={showPassword ? "text" : "password"}
            value={editedPassword ?? ""}
            onChange={handlePasswordInputChange}
            className="w-full font-mono px-3 py-1.5 border rounded bg-muted text-base"
            placeholder={loading ? "Generating password..." : "No password"}
            aria-label="Project Password"
            disabled={loading || saving}
            autoFocus
            maxLength={32}
            onFocus={() => {
              if (open) {
                handleDialogOpen();
              }
            }}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            type="button"
            disabled={loading || saving}
          >
            <Eye className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopyPassword}
            aria-label="Copy password"
            type="button"
            disabled={loading || saving || !editedPassword}
          >
            <Copy className="w-5 h-5" />
          </Button>
        </div>
        <div className="flex space-x-2 mb-4">
          <Button
            variant="outline"
            onClick={handleRegeneratePassword}
            disabled={loading || saving}
            className="w-full"
            type="button"
          >
            Regenerate Password
            <RefreshCw className="ml-2 w-4 h-4" />
          </Button>
          <Button
            variant="default"
            onClick={handleSavePassword}
            disabled={
              saving ||
              loading ||
              editedPassword === currentPassword ||
              !editedPassword
            }
            className="w-full"
            type="button"
          >
            {saving ? "Saving..." : "Save Password"}
          </Button>
        </div>
        <DialogFooter>
          {projectSlug ? (
            <Link
              to={`/projects/${projectSlug}/portal`}
              className="w-full"
              style={{ textDecoration: "none" }}
              tabIndex={-1}
              target="_blank" // Open in new tab
              rel="noopener"
            >
              <Button
                variant="default"
                className="w-full"
                disabled={loading || saving}
                type="button"
                asChild
              >
                <span>
                  Visit Project Portal
                  <LinkIcon className="ml-2 w-4 h-4" />
                </span>
              </Button>
            </Link>
          ) : (
            <Button variant="default" className="w-full" disabled>
              Visit Project Portal
              <LinkIcon className="ml-2 w-4 h-4" />
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
