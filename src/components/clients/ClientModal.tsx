
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ClientForm from "./ClientForm";

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
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
}

export default function ClientModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}: ClientModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Company / Client</DialogTitle>
        </DialogHeader>
        <ClientForm 
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}
