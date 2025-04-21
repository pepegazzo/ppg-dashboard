
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Eye, Key, Copy, Link as LinkIcon, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface ProjectPasswordDialogProps {
  projectId: string;
  open: boolean;
  setOpen: (show: boolean) => void;
}

export function ProjectPasswordDialog({
  projectId,
  open,
  setOpen,
}: ProjectPasswordDialogProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState<string>("");
  const [editedPassword, setEditedPassword] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [slug, setSlug] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch project data when dialog opens
  useEffect(() => {
    if (open) {
      fetchProjectData();
    }
  }, [open, projectId]);

  const fetchProjectData = async () => {
    if (!open) return;
    
    setLoading(true);
    
    try {
      console.log("Fetching project with ID:", projectId);
      
      const { data, error } = await supabase
        .from("projects")
        .select("slug, portal_password")
        .eq("id", projectId)
        .single();

      if (error) {
        console.error("Error fetching project:", error);
        toast({
          title: "Error",
          description: "Failed to load project details",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      console.log("Fetched project data:", data);
      console.log("Fetched slug:", data.slug);
      
      // Set the slug state from DB data
      if (data.slug) {
        console.log("Setting slug state to:", data.slug);
        setSlug(data.slug);
      } else {
        console.error("No slug found for project");
        toast({
          title: "Error",
          description: "This project doesn't have a portal URL configured",
          variant: "destructive",
        });
      }
      
      // Handle password
      if (data.portal_password) {
        setPassword(data.portal_password);
        setEditedPassword(data.portal_password);
      } else {
        // Generate password if not exists
        generateAndSavePassword();
      }
    } catch (err) {
      console.error("Error in fetchProjectData:", err);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateAndSavePassword = async () => {
    setLoading(true);
    const newPassword = generateSimplePassword();
    
    try {
      const { data, error } = await supabase
        .from("projects")
        .update({ portal_password: newPassword })
        .eq("id", projectId)
        .select("portal_password")
        .single();

      if (error) {
        toast({
          title: "Error",
          description: "Failed to generate password",
          variant: "destructive",
        });
      } else {
        setPassword(data.portal_password);
        setEditedPassword(data.portal_password);
        toast({
          title: "Success",
          description: "Password generated successfully",
        });
      }
    } catch (err) {
      console.error("Error generating password:", err);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPassword = () => {
    if (!editedPassword) return;
    navigator.clipboard.writeText(editedPassword);
    toast({
      title: "Copied",
      description: "Password copied to clipboard",
    });
  };

  const handleCopyPortalLink = () => {
    if (!slug) {
      toast({
        title: "No Slug",
        description: "This project doesn't have a portal URL configured",
        variant: "destructive",
      });
      return;
    }
    
    const portalUrl = `${window.location.origin}/${slug}`;
    console.log("Copying portal URL:", portalUrl);
    navigator.clipboard.writeText(portalUrl);
    toast({
      title: "Copied",
      description: "Portal link copied to clipboard",
    });
  };

  const handleRegeneratePassword = async () => {
    setLoading(true);
    const newPassword = generateSimplePassword();

    try {
      const { data, error } = await supabase
        .from("projects")
        .update({ portal_password: newPassword })
        .eq("id", projectId)
        .select("portal_password")
        .single();

      if (error) {
        toast({
          title: "Error",
          description: "Failed to regenerate password",
          variant: "destructive",
        });
      } else {
        setPassword(data.portal_password);
        setEditedPassword(data.portal_password);
        toast({
          title: "Success",
          description: "Password regenerated successfully",
        });
      }
    } catch (err) {
      console.error("Error regenerating password:", err);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedPassword(e.target.value);
  };

  const handleSavePassword = async () => {
    if (!editedPassword) {
      toast({
        title: "Error",
        description: "Password cannot be empty",
        variant: "destructive",
      });
      return;
    }
    
    setSaving(true);
    
    try {
      const { data, error } = await supabase
        .from("projects")
        .update({ portal_password: editedPassword })
        .eq("id", projectId)
        .select("portal_password")
        .single();

      if (error) {
        toast({
          title: "Error",
          description: "Failed to save password",
          variant: "destructive",
        });
      } else {
        setPassword(data.portal_password);
        toast({
          title: "Success",
          description: "Password saved successfully",
        });
      }
    } catch (err) {
      console.error("Error saving password:", err);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePortalAccess = () => {
    if (!slug) {
      toast({
        title: "No Slug",
        description: "This project doesn't have a portal URL configured",
        variant: "destructive",
      });
      return;
    }
    
    console.log("Navigating to portal with slug:", slug);
    setOpen(false);
    navigate(`/${slug}`);
  };

  const getPortalUrl = () => {
    if (!slug) return "No portal URL configured";
    const url = `${window.location.origin}/${slug}`;
    console.log("Generated portal URL:", url);
    return url;
  };

  function generateSimplePassword() {
    return Math.random().toString(36).slice(-8).toUpperCase();
  }

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
        
        {/* Password input field */}
        <div className="mb-4 mt-2 flex items-center gap-2">
          <input
            type={showPassword ? "text" : "password"}
            value={editedPassword}
            onChange={handlePasswordInputChange}
            className="w-full font-mono px-3 py-1.5 border rounded bg-muted text-base"
            placeholder={loading ? "Loading..." : "No password"}
            aria-label="Project Password"
            disabled={loading || saving}
            autoFocus
            maxLength={32}
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
        
        {/* Portal URL display */}
        <div className="mb-4 p-3 bg-muted rounded-md">
          <p className="text-sm font-medium mb-1">Portal URL:</p>
          <p className="text-sm font-mono break-all">
            {getPortalUrl()}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {slug ? `Using slug: "${slug}"` : "No slug configured"}
          </p>
        </div>
        
        {/* Copy Portal Link Button */}
        <div className="flex justify-end mb-6">
          <Button
            variant="outline"
            type="button"
            className="w-full flex items-center gap-2"
            onClick={handleCopyPortalLink}
            disabled={!slug}
            aria-label="Copy portal link"
          >
            <Copy className="w-4 h-4" />
            Copy Portal Link
          </Button>
        </div>
        
        {/* Password actions */}
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
            disabled={saving || loading || editedPassword === password || !editedPassword}
            className="w-full"
            type="button"
          >
            {saving ? "Saving..." : "Save Password"}
          </Button>
        </div>
        
        {/* Portal access button */}
        <DialogFooter>
          <Button
            variant="default"
            className="w-full"
            disabled={loading || saving || !slug}
            type="button"
            onClick={handlePortalAccess}
          >
            Visit Project Portal
            <LinkIcon className="ml-2 w-4 h-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
