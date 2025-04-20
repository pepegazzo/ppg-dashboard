
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
  const [isPrimaryChanging, setIsPrimaryChanging] = useState(false);
  const { toast } = useToast();
  const [form, setForm] = useState<ContactForm>({ name: "", role: "", email: "", phone: "" });
  const [primaryContactId, setPrimaryContactId] = useState<string | null>(
    currentContacts.find(contact => contact.is_primary)?.id || null
  );

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
      
      // Check if this is the first contact (make it primary by default)
      const makePrimary = currentContacts.length === 0;
      
      // Add the new contact
      const { data, error } = await supabase.from("contacts").insert({
        company_id: clientId,
        name: form.name,
        role: form.role || null,
        email: form.email || null,
        phone: form.phone || null,
        is_primary: makePrimary
      }).select();
      
      if (error) throw error;
      
      // If this was made primary, update state
      if (makePrimary && data && data[0]) {
        setPrimaryContactId(data[0].id);
      }
      
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

  const handlePrimaryChange = async (contactId: string) => {
    if (contactId === primaryContactId) return;
    
    setIsPrimaryChanging(true);
    try {
      // First, remove primary flag from all contacts
      await supabase
        .from("contacts")
        .update({ is_primary: false })
        .eq("company_id", clientId);
      
      // Then set the selected contact as primary
      await supabase
        .from("contacts")
        .update({ is_primary: true })
        .eq("id", contactId);
      
      setPrimaryContactId(contactId);
      toast({
        title: "Primary contact updated",
        description: "The primary contact for this company has been updated."
      });
      onChanged();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsPrimaryChanging(false);
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
                <Label className="text-sm mb-2 block">Primary Contact</Label>
                <RadioGroup
                  value={primaryContactId || undefined}
                  onValueChange={handlePrimaryChange}
                  className="space-y-1"
                  disabled={isPrimaryChanging}
                >
                  {currentContacts.map(contact => (
                    <div key={contact.id} className={`bg-muted/20 rounded px-3 py-2 mb-2 flex items-start gap-2 ${contact.id === primaryContactId ? 'border border-primary' : ''}`}>
                      <RadioGroupItem value={contact.id} id={`radio-${contact.id}`} className="mt-1" />
                      <div className="flex flex-col gap-0.5 flex-1">
                        <label htmlFor={`radio-${contact.id}`} className="font-medium cursor-pointer">
                          {contact.name} {contact.is_primary && <Badge className="ml-2" variant="secondary">Primary</Badge>}
                        </label>
                        {contact.role && <span className="text-xs">{contact.role}</span>}
                        {contact.email && <span className="text-xs text-muted-foreground">{contact.email}</span>}
                        {contact.phone && <span className="text-xs text-muted-foreground">{contact.phone}</span>}
                      </div>
                    </div>
                  ))}
                </RadioGroup>
                {isPrimaryChanging && (
                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" /> Updating primary contact...
                  </div>
                )}
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
