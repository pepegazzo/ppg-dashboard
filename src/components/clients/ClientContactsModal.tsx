import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Contact } from "@/types/clients";

interface ClientContactsModalProps {
  clientId: string;
  currentContacts: Contact[];
  onClose: () => void;
  onChanged: () => void;
}

type ContactForm = {
  name: string;
  role?: string;
  email?: string;
  phone?: string;
};

export default function ClientContactsModal({ clientId, currentContacts, onClose, onChanged }: ClientContactsModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [form, setForm] = useState<ContactForm>({ name: "", role: "", email: "", phone: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(f => ({
      ...f,
      [name]: value
    }));
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (!form.name) throw new Error("Name is required");
      const { error } = await supabase.from("contacts").insert({
        company_id: clientId,
        name: form.name,
        role: form.role || null,
        email: form.email || null,
        phone: form.phone || null
      });
      if (error) throw error;
      toast({
        title: "Contact added",
        description: `${form.name} was added to this company.`
      });
      setForm({ name: "", role: "", email: "", phone: "" });
      onChanged();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Manage Contacts</DialogTitle>
        </DialogHeader>
        <div className="mb-4">
          <div className="flex flex-col">
            {currentContacts.length === 0 && (
              <div className="text-muted-foreground text-sm border rounded-md p-4 bg-muted/5">
                No contacts added yet for this company
              </div>
            )}
            {currentContacts.length > 0 && (
              <div className="space-y-4">
                <Label className="text-sm block">Current Contacts</Label>
                <div className="space-y-2">
                  {currentContacts.map(contact => (
                    <div key={contact.id} className="border rounded-md p-4 bg-muted/5">
                      <span className="font-medium text-foreground">{contact.name}</span>
                      <div className="grid gap-1 mt-2 text-sm">
                        {contact.role && <div className="text-muted-foreground">Role: {contact.role}</div>}
                        {contact.email && <div className="text-muted-foreground">Email: {contact.email}</div>}
                        {contact.phone && <div className="text-muted-foreground">Phone: {contact.phone}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <form onSubmit={handleAdd} className="space-y-4 border-t pt-4">
          <div className="font-medium text-md mb-2">Add New Contact</div>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="contact_name">Name*</Label>
              <Input 
                id="contact_name" 
                name="name" 
                value={form.name} 
                onChange={handleChange} 
                required 
                placeholder="Contact Name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_role">Role</Label>
              <Input 
                id="contact_role" 
                name="role" 
                value={form.role} 
                onChange={handleChange} 
                placeholder="Position or role"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_email">Email</Label>
              <Input 
                id="contact_email" 
                name="email" 
                type="email" 
                value={form.email} 
                onChange={handleChange} 
                placeholder="Email address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_phone">Phone</Label>
              <Input 
                id="contact_phone" 
                name="phone" 
                value={form.phone} 
                onChange={handleChange} 
                placeholder="Phone number"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Add Contact
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
