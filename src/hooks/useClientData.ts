
import { useState, useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Client, Project, Contact } from "@/types/clients";

export function useClientData() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [nameFilter, setNameFilter] = useState("");
  const [projectFilter, setProjectFilter] = useState("all");
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Client | 'company' | 'email' | 'active_projects';
    direction: 'asc' | 'desc';
  }>({
    key: 'company_name',
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
    error,
    refetch
  } = useQuery({
    queryKey: ['clients', nameFilter, projectFilter],
    queryFn: async () => {
      console.log('Fetching clients data...');
      
      // Get company data with contacts
      const { data: companiesData, error: clientsError } = await supabase
        .from('clients')
        .select('*, contacts:contacts(*)');

      if (clientsError) {
        console.error('Error fetching clients:', clientsError);
        throw clientsError;
      }

      // For compatibility with old code: fetch active projects for each company
      const companiesWithExtras = await Promise.all(
        companiesData.map(async (company) => {
          // Fetch all projects associated with this client through client_project_assignments
          const { data: projectAssignments, error: assignmentsError } = await supabase
            .from('client_project_assignments')
            .select(`
              project_id,
              projects:projects(id, name, status)
            `)
            .eq('client_id', company.id);

          if (assignmentsError) {
            console.error("Error fetching client project assignments:", assignmentsError);
            return {
              ...company,
              contacts: company.contacts || [],
              active_projects: [],
            };
          }

          // Map the projects from assignments
          const activeProjects = projectAssignments
            ? projectAssignments.map(assignment => assignment.projects).filter(Boolean)
            : [];

          // Fetch all contacts for this company
          const { data: companyContacts, error: contactsError } = await supabase
            .from('contacts')
            .select('*')
            .eq('company_id', company.id)
            .order('is_primary', { ascending: false });

          if (contactsError) {
            console.error("Error fetching contacts:", contactsError);
          }

          return {
            ...company,
            contacts: companyContacts || [],
            active_projects: activeProjects
          };
        })
      );

      console.log('Clients data fetched:', companiesWithExtras);
      return companiesWithExtras;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const filteredAndSortedClients = useMemo(() => {
    if (!rawClients) return [];

    let filteredData = rawClients.filter(client => {
      const nameMatch = (client.company_name ?? "").toLowerCase().includes(nameFilter.toLowerCase());
      const projectMatch = projectFilter === 'all' || 
        client.active_projects?.some(project => project.id === projectFilter);

      return nameMatch && projectMatch;
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
  }, [rawClients, nameFilter, projectFilter, sortConfig]);

  const resetFilters = () => {
    setNameFilter("");
    setProjectFilter("all");
  };

  const handleSort = (key: keyof Client | 'company' | 'email' | 'active_projects') => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['clients'] }),
        queryClient.invalidateQueries({ queryKey: ['client-assigned-projects'] }),
        queryClient.invalidateQueries({ queryKey: ['client-available-projects'] }),
        fetchAllProjects()
      ]);
      
      await refetch();
      
      toast({
        title: "Refreshed",
        description: "Client information updated"
      });
    } catch (error) {
      console.error("Error refreshing client data:", error);
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
      queryClient.invalidateQueries({ queryKey: ['client-assigned-projects'] });
      queryClient.invalidateQueries({ queryKey: ['client-available-projects'] });
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
    projectFilter,
    setProjectFilter,
    allProjects,
    resetFilters,
    handleSort,
    sortConfig,
    updateClient,
  };
}
