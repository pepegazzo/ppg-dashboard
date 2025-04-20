import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Contact } from "@/types/clients";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

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
        <div className="mb-2">
          <div className="flex flex-col">
            {currentContacts.length === 0 && (
              <span className="text-muted-foreground mb-3 text-xs">No contacts for this company.</span>
            )}
            {currentContacts.length > 0 && (
              <div className="mb-4">
                <Label className="text-sm mb-2 block">Contacts</Label>
                <div className="space-y-2">
                  {currentContacts.map(contact => (
                    <div key={contact.id} className="bg-muted/20 rounded px-3 py-2 flex flex-col gap-0.5">
                      <span className="font-medium">{contact.name}</span>
                      {contact.role && <span className="text-xs">{contact.role}</span>}
                      {contact.email && <span className="text-xs text-muted-foreground">{contact.email}</span>}
                      {contact.phone && <span className="text-xs text-muted-foreground">{contact.phone}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <form onSubmit={handleAdd} className="space-y-2 border-t pt-3 mt-2">
          <div className="font-semibold text-sm mb-2 flex items-center gap-1">
            <Plus className="h-4 w-4" /> Add Contact
          </div>
          <div className="space-y-2">
            <div>
              <Label htmlFor="contact_name">Name*</Label>
              <Input id="contact_name" name="name" value={form.name} onChange={handleChange} required placeholder="Contact Name" />
            </div>
            <div>
              <Label htmlFor="contact_role">Role</Label>
              <Input id="contact_role" name="role" value={form.role} onChange={handleChange} placeholder="Role" />
            </div>
            <div>
              <Label htmlFor="contact_email">Email</Label>
              <Input id="contact_email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email" />
            </div>
            <div>
              <Label htmlFor="contact_phone">Phone</Label>
              <Input id="contact_phone" name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Close</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-3 w-3 mr-2 animate-spin" />}
              Add Contact
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
