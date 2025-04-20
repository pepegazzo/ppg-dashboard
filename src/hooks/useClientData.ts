
import { useState, useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Client, Project } from "@/types/clients";

export function useClientData() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [nameFilter, setNameFilter] = useState("");
  const [companyFilter, setCompanyFilter] = useState("");
  const [projectFilter, setProjectFilter] = useState("all");
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Client | 'company' | 'email' | 'active_projects';
    direction: 'asc' | 'desc';
  }>({
    key: 'name',
    direction: 'asc'
  });

  useEffect(() => {
    fetchAllProjects();
  }, []);

  const fetchAllProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name')
        .order('name');
      if (error) {
        console.error('Error fetching projects:', error);
        return;
      }
      setAllProjects(data || []);
    } catch (error) {
      console.error('Unexpected error fetching projects:', error);
    }
  };

  const {
    data: rawClients,
    isLoading,
    error
  } = useQuery({
    queryKey: ['clients', nameFilter, companyFilter, projectFilter],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select(`
          *,
          active_projects:projects(id, name, status)
        `)
        .returns<(Client & { active_projects: Project[] | null; })[]>();

      if (error) throw error;

      return data.map(client => ({
        ...client,
        active_projects: client.active_projects || []
      }));
    }
  });

  const filteredAndSortedClients = useMemo(() => {
    if (!rawClients) return [];

    let filteredData = rawClients.filter(client => {
      const nameMatch = client.name.toLowerCase().includes(nameFilter.toLowerCase());
      const companyMatch = client.company.toLowerCase().includes(companyFilter.toLowerCase());
      const projectMatch = projectFilter === 'all' || 
        client.active_projects?.some(project => project.id === projectFilter);
      
      return nameMatch && companyMatch && projectMatch;
    });

    return filteredData.sort((a, b) => {
      if (sortConfig.key === 'active_projects') {
        const aLength = a.active_projects?.length || 0;
        const bLength = b.active_projects?.length || 0;
        const comparison = aLength - bLength;
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      }
      const aValue = String(a[sortConfig.key]);
      const bValue = String(b[sortConfig.key]);
      const comparison = aValue.localeCompare(bValue);
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [rawClients, nameFilter, companyFilter, projectFilter, sortConfig]);

  const handleSort = (key: keyof Client | 'company' | 'email' | 'active_projects') => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const resetFilters = () => {
    setNameFilter("");
    setCompanyFilter("");
    setProjectFilter("all");
  };

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast({
        title: "Refreshed",
        description: "Client information updated"
      });
    } catch (error) {
      toast({
        title: "Error refreshing",
        description: "Could not refresh client data",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const updateClient = async (clientId: string, updates: Partial<Client>) => {
    try {
      const { error: clientUpdateError } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', clientId);
      
      if (clientUpdateError) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to update client information"
        });
        throw clientUpdateError;
      }

      if (updates.name) {
        const { error: projectsUpdateError } = await supabase
          .from('projects')
          .update({
            client_name: updates.name
          })
          .eq('client_id', clientId);
        
        if (projectsUpdateError) {
          console.error("Error updating associated projects:", projectsUpdateError);
          toast({
            variant: "destructive",
            title: "Warning",
            description: "Client updated but failed to update associated projects"
          });
        }
      }

      toast({
        title: "Success",
        description: "Client information updated"
      });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    } catch (error) {
      console.error("Error in updateClient:", error);
    }
  };

  return {
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
  };
}
