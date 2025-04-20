
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
    name: string;
    company: string;
    role: string;
    email: string;
    phone: string;
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Client</DialogTitle>
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
