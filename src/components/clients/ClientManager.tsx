
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Client } from "@/types/clients";
import { EmptyState } from "@/components/clients/EmptyState";
import { ClientFilter } from "@/components/clients/ClientFilter";
import { ClientsTable } from "@/components/clients/ClientsTable";
import { SelectedClientsActions } from "@/components/clients/SelectedClientsActions";
import ClientModal from "@/components/clients/ClientModal";
import { DeleteClientsDialog } from "./DeleteClientsDialog";
import { useClientData } from "@/hooks/useClientData";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ClientManagerProps {
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
}

export function ClientManager({ isModalOpen, setIsModalOpen }: ClientManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const {
    filteredAndSortedClients,
    isLoading,
    error,
    handleRefresh,
    isRefreshing,
    nameFilter,
    setNameFilter,
    companyFilter,
    setCompanyFilter,
    projectFilter,
    setProjectFilter,
    allProjects,
    resetFilters,
    handleSort,
    sortConfig,
    updateClient,
  } = useClientData();

  const createClient = async (clientData: {
    name: string;
    company: string;
    role: string;
    email: string;
    phone: string;
  }) => {
    try {
      setIsSubmitting(true);
      const { data, error } = await supabase.from('clients').insert(clientData).select();
      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to create client"
        });
        throw error;
      }
      toast({
        title: "Success",
        description: "New client created"
      });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error in createClient:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleClientSelection = (clientId: string) => {
    setSelectedClients(prev => {
      if (prev.includes(clientId)) {
        return prev.filter(id => id !== clientId);
      } else {
        return [...prev, clientId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedClients.length === filteredAndSortedClients?.length) {
      setSelectedClients([]);
    } else {
      setSelectedClients(filteredAndSortedClients?.map(client => client.id) || []);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">Error loading clients</div>;
  }

  return (
    <>
      {filteredAndSortedClients && filteredAndSortedClients.length === 0 ? (
        <EmptyState 
          setIsCreating={() => setIsModalOpen(true)} 
          handleRefreshClients={() => queryClient.invalidateQueries({ queryKey: ['clients'] })}
          testCreateClient={async () => {
            await createClient({
              name: "Test Client",
              company: "Test Company",
              role: "Test Role",
              email: "test@example.com",
              phone: "123-456-7890"
            });
          }} 
        />
      ) : (
        <>
          <ClientFilter 
            nameFilter={nameFilter}
            setNameFilter={setNameFilter}
            companyFilter={companyFilter}
            setCompanyFilter={setCompanyFilter}
            projectFilter={projectFilter}
            setProjectFilter={setProjectFilter}
            projects={allProjects}
            resetFilters={resetFilters}
          />
          
          <div className="space-y-4">
            <SelectedClientsActions 
              selectedCount={selectedClients.length}
              isDeleting={false}
              onDelete={() => setShowDeleteModal(true)}
            />
            
            <ClientsTable 
              filteredAndSortedClients={filteredAndSortedClients}
              selectedClients={selectedClients}
              toggleClientSelection={toggleClientSelection}
              handleSelectAll={handleSelectAll}
              updateClient={updateClient}
              handleSort={handleSort}
              sortConfig={sortConfig}
            />
          </div>
        </>
      )}
      
      <ClientModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={createClient} 
        isSubmitting={isSubmitting} 
      />

      <DeleteClientsDialog
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        selectedClients={selectedClients}
        onSuccess={() => {
          setSelectedClients([]);
          queryClient.invalidateQueries({ queryKey: ['clients'] });
        }}
      />
    </>
  );
}
