
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

// For new company creation with one contact (primary)
interface ClientFormProps {
  onSubmit: (clientData: {
    company_name: string;
    company: string;
    website?: string;
    address?: string;
    notes?: string;
    contact: {
      name: string;
      role?: string;
      email?: string;
      phone?: string;
    }
  }) => Promise<void>;
  isSubmitting: boolean;
  onCancel: () => void;
}

export default function ClientForm({ onSubmit, isSubmitting, onCancel }: ClientFormProps) {
  const [company_name, setCompanyName] = useState("");
  const [company, setCompany] = useState("");
  const [website, setWebsite] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  // Primary contact
  const [contactName, setContactName] = useState("");
  const [contactRole, setContactRole] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      company_name,
      company,
      website,
      address,
      notes,
      contact: {
        name: contactName,
        role: contactRole,
        email: contactEmail,
        phone: contactPhone,
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="company_name">Company Name / Brand</Label>
        <Input
          id="company_name"
          value={company_name}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="Enter company/brand name"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="company">Legal Name / Entity (if different)</Label>
        <Input
          id="company"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="e.g. Acme Corporation LLC"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="website">Website</Label>
        <Input
          id="website"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          placeholder="https://company.com"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Address"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Internal Notes</Label>
        <Input
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes about this company"
        />
      </div>

      <div className="border-b my-4" />
      <div>
        <h4 className="mb-2 font-semibold">Primary Contact</h4>
        <div className="space-y-2">
          <Label htmlFor="contactName">Full Name</Label>
          <Input
            id="contactName"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            placeholder="Full name"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contactRole">Role</Label>
          <Input
            id="contactRole"
            value={contactRole}
            onChange={(e) => setContactRole(e.target.value)}
            placeholder="Position (eg. Marketing Manager)"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contactEmail">Email</Label>
          <Input
            id="contactEmail"
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            placeholder="Email address"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contactPhone">Phone</Label>
          <Input
            id="contactPhone"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            placeholder="Contact phone"
          />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Add Company
        </Button>
      </div>
    </form>
  );
}
