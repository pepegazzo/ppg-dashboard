import { useState, useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Client, Project, Contact } from "@/types/clients";

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

  // Fetch all projects
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

  // MAIN QUERY: Fetch clients (companies) including contacts (people) and their projects
  const {
    data: rawClients,
    isLoading,
    error
  } = useQuery({
    queryKey: ['clients', nameFilter, companyFilter, projectFilter],
    queryFn: async () => {
      // Get company data
      const { data: companiesData, error: clientsError } = await supabase
        .from('clients')
        .select('*, contacts:contacts(*), client_project_assignments:client_project_assignments(project_id), projects:projects(id, name, status)')
        .order('company_name');

      if (clientsError) throw clientsError;

      // For compatibility with old code: fetch active projects for each company
      const companiesWithExtras = await Promise.all(
        companiesData.map(async (company) => {
          // fetch projects assigned to this company (as before)
          const { data: assignments, error: assignmentsError } = await supabase
            .from('client_project_assignments')
            .select(`
              project_id,
              projects (id, name, status)
            `)
            .eq('client_id', company.id);

          // Fetch all contacts for this company
          const { data: companyContacts } = await supabase
            .from('contacts')
            .select('*')
            .eq('company_id', company.id)
            .order('is_primary', { ascending: false });

          if (assignmentsError) {
            console.error("Error fetching client projects:", assignmentsError);
            return {
              ...company,
              contacts: companyContacts ?? [],
              active_projects: [],
            };
          }

          return {
            ...company,
            contacts: companyContacts ?? [],
            active_projects: assignments?.map(a => a.projects) || []
          };
        })
      );

      return companiesWithExtras;
    }
  });

  const filteredAndSortedClients = useMemo(() => {
    if (!rawClients) return [];

    let filteredData = rawClients.filter(client => {
      const nameMatch = (client.company_name ?? "").toLowerCase().includes(nameFilter.toLowerCase());
      const companyMatch = (client.company ?? "").toLowerCase().includes(companyFilter.toLowerCase());
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
      // Use company_name for sorting
      const aValue = String(a[sortConfig.key] ?? a.company_name);
      const bValue = String(b[sortConfig.key] ?? b.company_name);
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

      if (updates.company_name) {
        // Update any projects where this client is the primary client
        const { error: projectsUpdateError } = await supabase
          .from('projects')
          .update({
            client_name: updates.company_name
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
