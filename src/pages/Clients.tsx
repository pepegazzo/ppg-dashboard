
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, RefreshCw } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { ClientManager } from "@/components/clients/ClientManager";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const Clients = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Invalidate all client-related queries to force a fresh fetch
      await queryClient.invalidateQueries({ queryKey: ['clients'] });
      await queryClient.invalidateQueries({ queryKey: ['client-assigned-projects'] });
      await queryClient.invalidateQueries({ queryKey: ['client-available-projects'] });
      
      toast({
        title: "Refreshed",
        description: "Client information updated successfully"
      });
    } catch (error) {
      console.error("Error refreshing client data:", error);
      toast({
        title: "Error",
        description: "Failed to refresh client data",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        <div className="flex flex-col gap-2 mb-8">
          <span className="text-xs font-medium px-2.5 py-1 rounded-full w-fit bg-zinc-100 text-zinc-800">Relationships</span>
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-zinc-900">Clients</h1>
            <div className="flex gap-2">
              <Button onClick={() => setIsModalOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Client
              </Button>
              <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
                {isRefreshing ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                Refresh
              </Button>
            </div>
          </div>
        </div>

        <ClientManager 
          isModalOpen={isModalOpen} 
          setIsModalOpen={setIsModalOpen} 
          onRefresh={handleRefresh}
        />
      </div>
    </DashboardLayout>
  );
};

export default Clients;
