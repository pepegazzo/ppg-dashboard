
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Trash2, Edit } from "lucide-react";
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
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<ContactForm | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

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

  const handleDelete = async (contactId: string, contactName: string) => {
    setDeletingId(contactId);
    try {
      const { error } = await supabase.from("contacts").delete().eq("id", contactId);
      if (error) throw error;
      toast({
        title: "Contact removed",
        description: `${contactName} has been deleted.`,
      });
      onChanged();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  };

  const startEditing = (contact: Contact) => {
    setEditingId(contact.id);
    setEditForm({
      name: contact.name,
      role: contact.role ?? "",
      email: contact.email ?? "",
      phone: contact.phone ?? ""
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm(editForm => ({
      ...editForm!,
      [name]: value
    }));
  };

  const saveEdit = async (contactId: string) => {
    if (!editForm) return;
    setIsUpdating(true);
    try {
      if (!editForm.name) throw new Error("Name is required");
      const { error } = await supabase.from("contacts").update({
        name: editForm.name,
        role: editForm.role || null,
        email: editForm.email || null,
        phone: editForm.phone || null
      }).eq("id", contactId);
      if (error) throw error;
      toast({
        title: "Contact updated",
        description: `${editForm.name} has been updated.`,
      });
      cancelEditing();
      onChanged();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsUpdating(false);
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
                    <div key={contact.id} className="border rounded-md p-4 bg-muted/5 flex items-start justify-between gap-4 relative">
                      {editingId === contact.id ? (
                        <form
                          className="flex-1 space-y-2"
                          onSubmit={e => {
                            e.preventDefault();
                            saveEdit(contact.id);
                          }}
                        >
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label htmlFor={`edit_name_${contact.id}`}>Name*</Label>
                              <Input
                                id={`edit_name_${contact.id}`}
                                name="name"
                                value={editForm?.name ?? ""}
                                onChange={handleEditChange}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor={`edit_role_${contact.id}`}>Role</Label>
                              <Input
                                id={`edit_role_${contact.id}`}
                                name="role"
                                value={editForm?.role ?? ""}
                                onChange={handleEditChange}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`edit_email_${contact.id}`}>Email</Label>
                              <Input
                                id={`edit_email_${contact.id}`}
                                name="email"
                                type="email"
                                value={editForm?.email ?? ""}
                                onChange={handleEditChange}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`edit_phone_${contact.id}`}>Phone</Label>
                              <Input
                                id={`edit_phone_${contact.id}`}
                                name="phone"
                                value={editForm?.phone ?? ""}
                                onChange={handleEditChange}
                              />
                            </div>
                          </div>
                          <div className="flex mt-2 gap-2">
                            <Button
                              type="submit"
                              disabled={isUpdating}
                              className="h-7 px-3 text-xs"
                            >
                              {isUpdating ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : null}
                              Save
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              className="h-7 px-3 text-xs"
                              onClick={cancelEditing}
                              disabled={isUpdating}
                            >
                              Cancel
                            </Button>
                          </div>
                        </form>
                      ) : (
                        <>
                          <div>
                            <span className="font-medium text-foreground">{contact.name}</span>
                            <div className="grid gap-1 mt-2 text-sm">
                              {contact.role && <div className="text-muted-foreground">Role: {contact.role}</div>}
                              {contact.email && <div className="text-muted-foreground">Email: {contact.email}</div>}
                              {contact.phone && <div className="text-muted-foreground">Phone: {contact.phone}</div>}
                            </div>
                          </div>
                          <div className="flex flex-col gap-1 items-end">
                            <button
                              type="button"
                              aria-label="Edit contact"
                              className="text-primary hover:bg-primary/10 rounded-full p-1 transition-colors flex items-center disabled:opacity-50"
                              onClick={() => startEditing(contact)}
                              tabIndex={0}
                              disabled={editingId !== null || deletingId === contact.id}
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              aria-label="Delete contact"
                              className="text-destructive hover:bg-destructive/10 rounded-full p-1 transition-colors flex items-center disabled:opacity-50"
                              disabled={deletingId === contact.id || editingId !== null}
                              onClick={() => handleDelete(contact.id, contact.name)}
                              tabIndex={0}
                            >
                              {deletingId === contact.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </>
                      )}
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
                disabled={!!editingId}
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
                disabled={!!editingId}
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
                disabled={!!editingId}
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
                disabled={!!editingId}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={!!editingId}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !!editingId}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Add Contact
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
