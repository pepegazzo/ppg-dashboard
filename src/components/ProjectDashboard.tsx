import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";
import { DollarSign, TrendingUp, Briefcase, Users, ChevronLeft, ChevronRight, LayoutDashboard, FolderKanban, FileText, UsersRound, Plus, Trash2, Edit, MoreVertical, X, Calendar as CalendarIcon, Receipt, Building, Mail, Phone, Eye, Download, Clock } from "lucide-react";
import { baseUrl } from "../lib/base-url";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Project {
  id: string;
  name: string;
  client: string;
  contactId?: string | null;
  status: 'active' | 'completed' | 'on-hold' | 'planning' | 'cancelled';
  budget: number;
  spent: number;
  startDate: string;
  endDate: string;
  progress: number;
}

interface Invoice {
  id: string;
  projectId: string;
  projectName: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  dueDate: string;
  issueDate: string;
  items?: InvoiceItem[];
  subtotal?: number;
  retention?: number;
  notes?: string;
  currency?: 'PEN' | 'USD';
  exchangeRate?: number;
}

interface InvoiceItem {
  id: string;
  serviceName: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Contact {
  id: string;
  name: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  role: string;
  projects: string[];
}

export default function ProjectDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [activeTab, setActiveTab] = useState("summary");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; type: 'contact' | 'project' | 'invoice' | null; id: string | null; name: string }>({
    open: false,
    type: null,
    id: null,
    name: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState('summary');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; type: 'contact' | 'project' | 'invoice' | null; id: string | null; name: string }>({
    open: false,
    type: null,
    id: null,
    name: ''
  });
  const [projectForm, setProjectForm] = useState({
    name: '',
    company: '',
    contactId: '',
    status: 'planning',
    startDate: '',
    endDate: ''
  });
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [prefilledProjectId, setPrefilledProjectId] = useState<string>('');
  const [isAddInvoiceOpen, setIsAddInvoiceOpen] = useState(false);
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([
    { id: '1', serviceName: '', description: '', unitPrice: 0, quantity: 1, total: 0 }
  ]);
  const [invoiceNotes, setInvoiceNotes] = useState('');
  const [invoiceCurrency, setInvoiceCurrency] = useState<'PEN' | 'USD'>('PEN');
  const [exchangeRate, setExchangeRate] = useState(3.75); // Default exchange rate
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [contactForm, setContactForm] = useState({
    id: '',
    name: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    role: ''
  });
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState<{ projectId: string; field: 'startDate' | 'endDate' } | null>(null);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [projectsRes, invoicesRes, contactsRes] = await Promise.all([
          fetch(`${baseUrl}/api/projects`),
          fetch(`${baseUrl}/api/invoices`),
          fetch(`${baseUrl}/api/contacts`)
        ]);

        if (!projectsRes.ok || !invoicesRes.ok || !contactsRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const [projectsData, invoicesData, contactsData] = await Promise.all([
          projectsRes.json(),
          invoicesRes.json(),
          contactsRes.json()
        ]);

        setProjects(projectsData);
        setInvoices(invoicesData);
        setContacts(contactsData.map((c: any) => {
          try {
            return {
              ...c,
              projects: Array.isArray(c.projects) ? c.projects : (c.projects ? JSON.parse(c.projects) : [])
            };
          } catch (error) {
            console.error('Error parsing projects for contact:', c.id, error);
            return {
              ...c,
              projects: []
            };
          }
        }));
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        alert('Error al cargar los datos. Por favor recarga la página.');
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const getContactsByCompany = (company: string) => {
    const filtered = contacts.filter(contact => contact.company === company);
    console.log('Filtering contacts for company:', company, 'Found:', filtered);
    return filtered;
  };

  const resetProjectForm = () => {
    setProjectForm({
      name: '',
      company: '',
      contactId: '',
      status: 'planning',
      startDate: '',
      endDate: ''
    });
  };

  const handleAddProject = async () => {
    if (!projectForm.name || !projectForm.contactId || !projectForm.startDate || !projectForm.endDate) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    try {
      const contact = contacts.find(c => c.id === projectForm.contactId);
      const response = await fetch(`${baseUrl}/api/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: projectForm.name,
          client: contact ? contact.company : 'Cliente desconocido',
          contactId: projectForm.contactId,
          budget: 0,
          spent: 0,
          progress: 0,
          status: projectForm.status || 'planning',
          startDate: projectForm.startDate,
          endDate: projectForm.endDate
        })
      });

      if (response.ok) {
        const createdProject = await response.json() as Project;
        setProjects([...projects, createdProject]);
        
        // Update the contact's projects array
        const contact = contacts.find(c => c.id === projectForm.contactId);
        if (contact) {
          const updatedProjects = [...(contact.projects || []), createdProject.id];
          const updateResponse = await fetch(`${baseUrl}/api/contacts/${contact.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: contact.name,
              lastName: contact.lastName,
              email: contact.email,
              phone: contact.phone,
              company: contact.company,
              role: contact.role,
              projects: updatedProjects
            })
          });
          
          if (updateResponse.ok) {
            const updatedContact = await updateResponse.json() as Contact;
            setContacts(contacts.map(c => c.id === updatedContact.id ? updatedContact : c));
          }
        }
        
        setIsAddProjectOpen(false);
        resetProjectForm();
      }
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Error al crear el proyecto');
    }
  };

  const handleInvoiceStatusChange = async (invoiceId: string, newStatus: 'paid' | 'pending' | 'overdue') => {
    try {
      // Update in database
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        const updatedInvoice = await response.json() as Invoice;
        // Update local state
        setInvoices(invoices.map(inv => 
          inv.id === invoiceId ? updatedInvoice : inv
        ));
      }
    } catch (error) {
      console.error('Error updating invoice status:', error);
    }
  };

  const handleProjectStatusChange = async (projectId: string, newStatus: 'active' | 'completed' | 'on-hold' | 'planning' | 'cancelled') => {
    try {
      const project = projects.find(p => p.id === projectId);
      if (!project) return;

      const response = await fetch(`${baseUrl}/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: project.name,
          client: project.client,
          status: newStatus,
          budget: project.budget,
          spent: project.spent,
          startDate: project.startDate,
          endDate: project.endDate
        })
      });
      
      if (response.ok) {
        const updatedProject = await response.json() as Project;
        setProjects(projects.map(p => 
          p.id === projectId ? updatedProject : p
        ));
      }
    } catch (error) {
      console.error('Error updating project status:', error);
    }
  };

  const openQuotationFromProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setSelectedProject(projectId);
      setPrefilledProjectId(projectId);
      setIsAddInvoiceOpen(true);
    }
  };

  const handleCreateQuotation = async () => {
    if (!selectedProject || invoiceItems.length === 0) {
      alert('Por favor completa todos los campos');
      return;
    }

    // Validate that all items have at least service name and unit price
    const hasInvalidItems = invoiceItems.some(item => !item.serviceName || item.unitPrice <= 0);
    if (hasInvalidItems) {
      alert('Por favor completa todos los items con nombre de servicio y precio');
      return;
    }

    try {
      const project = projects.find(p => p.id === selectedProject);
      if (!project) return;

      const totals = calculateInvoiceTotals();
      
      const response = await fetch(`${baseUrl}/api/invoices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: selectedProject,
          projectName: project.name,
          amount: totals.total,
          status: 'pending',
          issueDate: new Date().toISOString().split('T')[0],
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
          items: invoiceItems,
          subtotal: totals.subtotal,
          retention: totals.retention,
          notes: invoiceNotes,
          currency: invoiceCurrency,
          exchangeRate: exchangeRate
        })
      });

      if (response.ok) {
        const newInvoice = await response.json() as Invoice;
        setInvoices([...invoices, newInvoice]);
        setIsAddInvoiceOpen(false);
        resetInvoiceForm();
      }
    } catch (error) {
      console.error('Error creating quotation:', error);
      alert('Error al crear la cotización');
    }
  };

  const addInvoiceItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      serviceName: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0
    };
    setInvoiceItems([...invoiceItems, newItem]);
  };

  const removeInvoiceItem = (id: string) => {
    if (invoiceItems.length > 1) {
      setInvoiceItems(invoiceItems.filter(item => item.id !== id));
    }
  };

  const updateInvoiceItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setInvoiceItems(invoiceItems.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          updated.total = updated.quantity * updated.unitPrice;
        }
        return updated;
      }
      return item;
    }));
  };

  const calculateInvoiceTotals = () => {
    const subtotal = invoiceItems.reduce((sum, item) => sum + item.total, 0);
    // Para recibir el subtotal después de la retención del 8%:
    // Total a facturar = Subtotal / 0.92
    // Porque: Total × 0.92 = Subtotal (lo que recibes después de 8% de retención)
    const totalToInvoice = subtotal / 0.92;
    const retention = totalToInvoice - subtotal; // Esto será el 8% del total
    return { subtotal, retention, total: totalToInvoice };
  };

  const resetInvoiceForm = () => {
    setSelectedProject('');
    setInvoiceItems([{ id: '1', serviceName: '', description: '', unitPrice: 0, quantity: 1, total: 0 }]);
    setInvoiceNotes('');
    setInvoiceCurrency('PEN');
    setExchangeRate(3.75);
  };

  // Contact handlers
  const resetContactForm = () => {
    setContactForm({
      id: '',
      name: '',
      lastName: '',
      email: '',
      phone: '',
      company: '',
      role: ''
    });
    setIsEditingContact(false);
  };

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contactForm.name || !contactForm.lastName || !contactForm.email || !contactForm.phone || !contactForm.company || !contactForm.role) {
      alert('Por favor completa todos los campos');
      return;
    }

    try {
      const response = await fetch(`${baseUrl}/api/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...contactForm,
          projects: [] // Empty projects array initially
        })
      });

      if (response.ok) {
        const createdContact = await response.json() as Contact;
        setContacts([...contacts, createdContact]);
        setIsAddContactOpen(false);
        resetContactForm();
      }
    } catch (error) {
      console.error('Error creating contact:', error);
      alert('Error al crear el contacto');
    }
  };

  const handleEditContact = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const contactToUpdate = contacts.find(c => c.id === contactForm.id);
      const response = await fetch(`${baseUrl}/api/contacts/${contactForm.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: contactForm.name,
          lastName: contactForm.lastName,
          email: contactForm.email,
          phone: contactForm.phone,
          company: contactForm.company,
          role: contactForm.role,
          projects: contactToUpdate?.projects || []
        })
      });
      
      if (response.ok) {
        const updatedContact = await response.json() as Contact;
        setContacts(contacts.map(c => c.id === updatedContact.id ? updatedContact : c));
        setIsAddContactOpen(false);
        resetContactForm();
      }
    } catch (error) {
      console.error('Error updating contact:', error);
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (!deleteDialog.id) return;
    
    try {
      const response = await fetch(`${baseUrl}/api/contacts/${deleteDialog.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Error al eliminar contacto');

      setContacts(contacts.filter(c => c.id !== deleteDialog.id));
      setDeleteDialog({ open: false, type: null, id: null, name: '' });
    } catch (error) {
      console.error('Error deleting contact:', error);
      alert('Error al eliminar el contacto');
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!deleteDialog.id) return;
    
    try {
      const response = await fetch(`${baseUrl}/api/projects/${deleteDialog.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Error al eliminar proyecto');

      setProjects(projects.filter(p => p.id !== deleteDialog.id));
      setDeleteDialog({ open: false, type: null, id: null, name: '' });
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Error al eliminar el proyecto');
    }
  };

  const handleDeleteInvoice = async (id: string) => {
    if (!deleteDialog.id) return;
    
    try {
      const response = await fetch(`${baseUrl}/api/invoices/${deleteDialog.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Error al eliminar cotización');

      setInvoices(invoices.filter(i => i.id !== deleteDialog.id));
      setDeleteDialog({ open: false, type: null, id: null, name: '' });
    } catch (error) {
      console.error('Error deleting invoice:', error);
      alert('Error al eliminar la cotización');
    }
  };

  const confirmDelete = () => {
    if (deleteDialog.type === 'contact') {
      handleDeleteContact(deleteDialog.id!);
    } else if (deleteDialog.type === 'project') {
      handleDeleteProject(deleteDialog.id!);
    } else if (deleteDialog.type === 'invoice') {
      handleDeleteInvoice(deleteDialog.id!);
    }
  };

  const getProjectQuotation = (projectId: string) => {
    return invoices.find(inv => inv.projectId === projectId);
  };

  const getUniqueCompanies = () => {
    const companies = contacts.map(c => c.company).filter(Boolean);
    return Array.from(new Set(companies)).sort();
  };

  const openEditContact = (contact: Contact) => {
    setContactForm({
      id: contact.id,
      name: contact.name,
      lastName: contact.lastName,
      email: contact.email,
      phone: contact.phone,
      company: contact.company,
      role: contact.role
    });
    setIsEditingContact(true);
    setIsAddContactOpen(true);
  };

  // Calculate statistics
  const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
  const totalSpent = projects.reduce((sum, p) => sum + p.spent, 0);
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0);
  const pendingRevenue = invoices.filter(i => i.status === 'pending' || i.status === 'overdue').reduce((sum, i) => sum + i.amount, 0);

  const getStatusBadge = (status: string) => {
    const statusLabels: Record<string, string> = {
      active: 'Activo',
      completed: 'Completado',
      'on-hold': 'En Espera',
      planning: 'Planificación',
      cancelled: 'Cancelado',
      paid: 'Pagado',
      pending: 'Pendiente',
      overdue: 'Vencido'
    };

    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', className: string }> = {
      active: { variant: 'default', className: 'bg-blue-500 hover:bg-blue-600 text-white' },
      completed: { variant: 'default', className: 'bg-green-500 hover:bg-green-600 text-white' },
      'on-hold': { variant: 'default', className: 'bg-yellow-500 hover:bg-yellow-600 text-white' },
      planning: { variant: 'outline', className: '' },
      cancelled: { variant: 'default', className: 'bg-red-500 hover:bg-red-600 text-white' },
      paid: { variant: 'default', className: 'bg-green-500 hover:bg-green-600 text-white' },
      pending: { variant: 'default', className: 'bg-yellow-500 hover:bg-yellow-600 text-white' },
      overdue: { variant: 'destructive', className: '' }
    };
    const config = variants[status] || { variant: 'default' as const, className: '' };
    return <Badge variant={config.variant} className={config.className}>{statusLabels[status] || status}</Badge>;
  };

  const calculateDaysRemaining = (endDate: string): { days: number; status: 'overdue' | 'urgent' | 'normal' | 'none' } => {
    if (!endDate) return { days: 0, status: 'none' };
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);
    
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { days: Math.abs(diffDays), status: 'overdue' };
    if (diffDays <= 7) return { days: diffDays, status: 'urgent' };
    return { days: diffDays, status: 'normal' };
  };

  const getPriorityBadge = (endDate: string) => {
    if (!endDate) {
      return <Badge variant="outline" className="text-gray-500">Baja</Badge>;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);
    
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Si ya pasó la fecha (vencido)
    if (diffDays < 0) {
      return <Badge variant="destructive">Vencido</Badge>;
    }
    
    // Menos de 7 días (1 semana)
    if (diffDays < 7) {
      return <Badge variant="destructive">Alta</Badge>;
    }
    
    // Entre 7 y 30 días (1 semana a 1 mes)
    if (diffDays < 30) {
      return <Badge className="bg-yellow-500 text-white">Media</Badge>;
    }
    
    // Más de 30 días (más de 1 mes)
    return <Badge variant="outline" className="text-gray-500">Baja</Badge>;
  };

  const handleProjectDateChange = async (projectId: string, field: 'startDate' | 'endDate', newDate: Date | undefined) => {
    if (!newDate) return;
    
    try {
      const project = projects.find(p => p.id === projectId);
      if (!project) return;

      const dateString = format(newDate, 'yyyy-MM-dd');

      const response = await fetch(`${baseUrl}/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: project.name,
          client: project.client,
          status: project.status,
          budget: project.budget,
          spent: project.spent,
          startDate: field === 'startDate' ? dateString : project.startDate,
          endDate: field === 'endDate' ? dateString : project.endDate
        })
      });
      
      if (response.ok) {
        const updatedProject = await response.json() as Project;
        setProjects(projects.map(p => 
          p.id === projectId ? updatedProject : p
        ));
        setDatePickerOpen(null);
      }
    } catch (error) {
      console.error('Error updating project date:', error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Navigation */}
      <div 
        className={`fixed left-0 top-0 h-full bg-card border-r border-border transition-all duration-300 z-50 ${
          isSidebarOpen ? 'w-64' : 'w-16'
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          {isSidebarOpen && (
            <h2 className="font-heading font-bold text-lg">Panel de Control</h2>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="ml-auto"
          >
            {isSidebarOpen ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation Menu */}
        <nav className="p-2 space-y-1">
          <button
            onClick={() => setActiveView('summary')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              activeView === 'summary'
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-accent text-foreground'
            }`}
          >
            <LayoutDashboard className="h-5 w-5 flex-shrink-0" />
            {isSidebarOpen && <span className="font-medium">Resumen</span>}
          </button>

          <button
            onClick={() => setActiveView('projects')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              activeView === 'projects'
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-accent text-foreground'
            }`}
          >
            <FolderKanban className="h-5 w-5 flex-shrink-0" />
            {isSidebarOpen && <span className="font-medium">Proyectos</span>}
          </button>

          <button
            onClick={() => setActiveView('billing')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              activeView === 'billing'
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-accent text-foreground'
            }`}
          >
            <Receipt className="h-5 w-5 flex-shrink-0" />
            {isSidebarOpen && <span className="font-medium">Facturación</span>}
          </button>

          <button
            onClick={() => setActiveView('contacts')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              activeView === 'contacts'
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-accent text-foreground'
            }`}
          >
            <Users className="h-5 w-5 flex-shrink-0" />
            {isSidebarOpen && <span className="font-medium">Clientes</span>}
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div 
        className={`flex-1 transition-all duration-300 ${
          isSidebarOpen ? 'ml-64' : 'ml-16'
        }`}
      >
        <div className="p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-heading font-bold text-foreground">Panel de Gestión de Proyectos</h1>
                <p className="text-muted-foreground mt-2">Administra tus proyectos, facturación y contactos</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Última actualización</p>
                <p className="text-sm font-medium">{new Date().toLocaleDateString('es-ES')}</p>
              </div>
            </div>

            {/* Loading State */}
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center space-y-4">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  <p className="text-muted-foreground">Cargando datos...</p>
                </div>
              </div>
            ) : (
              <>
                {/* Summary View - Stats Cards */}
                {activeView === 'summary' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Presupuesto Total</CardTitle>
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">${totalBudget.toLocaleString()}</div>
                          <p className="text-xs text-muted-foreground mt-1">
                            ${totalSpent.toLocaleString()} gastado ({Math.round((totalSpent / totalBudget) * 100)}%)
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Proyectos Activos</CardTitle>
                          <FolderKanban className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{activeProjects}</div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {projects.length} proyectos totales
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Ingresos</CardTitle>
                          <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
                          <p className="text-xs text-muted-foreground mt-1">
                            ${pendingRevenue.toLocaleString()} pendientes
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Clientes</CardTitle>
                          <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{contacts.length}</div>
                          <p className="text-xs text-muted-foreground mt-1">
                            En {new Set(contacts.map(c => c.company)).size} empresas
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Quick Overview */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle>Proyectos Recientes</CardTitle>
                          <CardDescription>Actividad reciente de proyectos</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {projects.slice(0, 3).map((project) => (
                              <div key={project.id} className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium">{project.name}</p>
                                  <p className="text-sm text-muted-foreground">{project.client}</p>
                                </div>
                                {getStatusBadge(project.status)}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Facturas Recientes</CardTitle>
                          <CardDescription>Actividad reciente de facturación</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {invoices.slice(0, 3).map((invoice) => (
                              <div key={invoice.id} className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium">{invoice.id}</p>
                                  <p className="text-sm text-muted-foreground">${invoice.amount.toLocaleString()}</p>
                                </div>
                                {getStatusBadge(invoice.status)}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}

                {/* Projects View */}
                {activeView === 'projects' && (
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle>Proyectos</CardTitle>
                          <CardDescription>Gestiona y rastrea tus proyectos</CardDescription>
                        </div>
                        <Dialog open={isAddProjectOpen} onOpenChange={(open) => {
                          setIsAddProjectOpen(open);
                          if (!open) resetProjectForm();
                        }}>
                          <DialogTrigger asChild>
                            <Button>
                              <Plus className="mr-2 h-4 w-4" />
                              Agregar Proyecto
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Agregar Nuevo Proyecto</DialogTitle>
                              <DialogDescription>Crear un nuevo proyecto</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid gap-2">
                                <Label htmlFor="project-name">Nombre del Proyecto</Label>
                                <Input 
                                  id="project-name" 
                                  placeholder="Ingresa el nombre del proyecto"
                                  value={projectForm.name}
                                  onChange={(e) => setProjectForm({...projectForm, name: e.target.value})}
                                  required
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="company">Empresa</Label>
                                <Select 
                                  value={projectForm.company}
                                  onValueChange={(value) => setProjectForm({...projectForm, company: value, contactId: ''})}
                                  required
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecciona una empresa" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {getUniqueCompanies().map(company => (
                                      <SelectItem key={company} value={company}>
                                        {company}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              {projectForm.company && (
                                <div className="grid gap-2">
                                  <Label htmlFor="contact">Contacto</Label>
                                  <Select 
                                    value={projectForm.contactId}
                                    onValueChange={(value) => setProjectForm({...projectForm, contactId: value})}
                                    required
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecciona un contacto" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {getContactsByCompany(projectForm.company).map(c => (
                                        <SelectItem key={c.id} value={c.id}>
                                          {c.name} {c.lastName || ''} {c.role ? `- ${c.role}` : ''}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              )}
                              <div className="grid gap-2">
                                <Label htmlFor="start-date">Fecha de Inicio</Label>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant="outline"
                                      className="w-full justify-start text-left font-normal"
                                    >
                                      <CalendarIcon className="mr-2 h-4 w-4" />
                                      {projectForm.startDate ? (
                                        format(new Date(projectForm.startDate), 'dd/MM/yyyy')
                                      ) : (
                                        <span className="text-muted-foreground">Selecciona una fecha</span>
                                      )}
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                      mode="single"
                                      selected={projectForm.startDate ? new Date(projectForm.startDate) : undefined}
                                      onSelect={(date) => {
                                        if (date) {
                                          setProjectForm({...projectForm, startDate: format(date, 'yyyy-MM-dd')});
                                        }
                                      }}
                                      locale={es}
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="end-date">Fecha de Entrega</Label>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant="outline"
                                      className="w-full justify-start text-left font-normal"
                                    >
                                      <CalendarIcon className="mr-2 h-4 w-4" />
                                      {projectForm.endDate ? (
                                        format(new Date(projectForm.endDate), 'dd/MM/yyyy')
                                      ) : (
                                        <span className="text-muted-foreground">Selecciona una fecha</span>
                                      )}
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                      mode="single"
                                      selected={projectForm.endDate ? new Date(projectForm.endDate) : undefined}
                                      onSelect={(date) => {
                                        if (date) {
                                          setProjectForm({...projectForm, endDate: format(date, 'yyyy-MM-dd')});
                                        }
                                      }}
                                      locale={es}
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button type="button" variant="outline" onClick={() => {
                                setIsAddProjectOpen(false);
                                resetProjectForm();
                              }}>
                                Cancelar
                              </Button>
                              <Button type="button" onClick={handleAddProject}>
                                Agregar Proyecto
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="w-full overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[220px]">Proyecto</TableHead>
                              <TableHead className="w-[160px]">Empresa</TableHead>
                              <TableHead className="w-[180px]">Contacto</TableHead>
                              <TableHead className="w-[120px]">Estado</TableHead>
                              <TableHead className="w-[110px]">Precio</TableHead>
                              <TableHead className="w-[130px]">Fecha de Inicio</TableHead>
                              <TableHead className="w-[130px]">Fecha de Entrega</TableHead>
                              <TableHead className="w-[100px]">Prioridad</TableHead>
                              <TableHead className="text-right w-[60px]">
                                <MoreVertical className="h-4 w-4 ml-auto" />
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {projects.map((project) => {
                              const quotation = getProjectQuotation(project.id);
                              const contact = contacts.find(c => c.id === project.contactId);
                              return (
                                <TableRow key={project.id}>
                                  <TableCell className="font-medium max-w-[220px] break-words whitespace-normal">{project.name}</TableCell>
                                  <TableCell className="max-w-[160px] break-words whitespace-normal">{project.client}</TableCell>
                                  <TableCell className="max-w-[180px]">
                                    {contact ? (
                                      <Select
                                        value={project.contactId || ''}
                                        onValueChange={async (value) => {
                                          try {
                                            const response = await fetch(`${baseUrl}/api/projects/${project.id}`, {
                                              method: 'PUT',
                                              headers: { 'Content-Type': 'application/json' },
                                              body: JSON.stringify({ 
                                                name: project.name,
                                                client: project.client,
                                                contactId: value,
                                                status: project.status,
                                                budget: project.budget,
                                                spent: project.spent,
                                                startDate: project.startDate,
                                                endDate: project.endDate
                                              })
                                            });
                                            
                                            if (response.ok) {
                                              const updatedProject = await response.json() as Project;
                                              setProjects(projects.map(p => 
                                                p.id === project.id ? updatedProject : p
                                              ));
                                            }
                                          } catch (error) {
                                            console.error('Error updating contact:', error);
                                          }
                                        }}
                                      >
                                        <SelectTrigger className="h-8 w-full">
                                          <SelectValue>
                                            <span className="truncate">{contact.name} {contact.lastName || ''}</span>
                                          </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                          {getContactsByCompany(project.client).map(c => (
                                            <SelectItem key={c.id} value={c.id}>
                                              <div className="flex flex-col">
                                                <span className="font-medium">{c.name} {c.lastName}</span>
                                                <span className="text-xs text-muted-foreground">{c.role}</span>
                                              </div>
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    ) : (
                                      <Select
                                        value={project.contactId || ''}
                                        onValueChange={async (value) => {
                                          try {
                                            const response = await fetch(`${baseUrl}/api/projects/${project.id}`, {
                                              method: 'PUT',
                                              headers: { 'Content-Type': 'application/json' },
                                              body: JSON.stringify({ 
                                                name: project.name,
                                                client: project.client,
                                                contactId: value,
                                                status: project.status,
                                                budget: project.budget,
                                                spent: project.spent,
                                                startDate: project.startDate,
                                                endDate: project.endDate
                                              })
                                            });
                                            
                                            if (response.ok) {
                                              const updatedProject = await response.json() as Project;
                                              setProjects(projects.map(p => 
                                                p.id === project.id ? updatedProject : p
                                              ));
                                            }
                                          } catch (error) {
                                            console.error('Error updating contact:', error);
                                          }
                                        }}
                                      >
                                        <SelectTrigger className="h-8 w-full">
                                          <SelectValue placeholder="Asignar contacto" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {getContactsByCompany(project.client).map(c => (
                                            <SelectItem key={c.id} value={c.id}>
                                              <div className="flex flex-col">
                                                <span className="font-medium">{c.name} {c.lastName}</span>
                                                <span className="text-xs text-muted-foreground">{c.role}</span>
                                              </div>
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    {quotation ? (
                                      <Select
                                        value={project.status}
                                        onValueChange={(value: 'active' | 'completed' | 'on-hold' | 'planning' | 'cancelled') => 
                                          handleProjectStatusChange(project.id, value)
                                        }
                                      >
                                        <SelectTrigger className="w-[140px] h-8">
                                          <SelectValue>
                                            {getStatusBadge(project.status)}
                                          </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="active">
                                            <div className="flex items-center gap-2">
                                              <span className="inline-block w-2 h-2 rounded-full bg-blue-500"></span>
                                              Activo
                                            </div>
                                          </SelectItem>
                                          <SelectItem value="on-hold">
                                            <div className="flex items-center gap-2">
                                              <span className="inline-block w-2 h-2 rounded-full bg-yellow-500"></span>
                                              En Espera
                                            </div>
                                          </SelectItem>
                                          <SelectItem value="completed">
                                            <div className="flex items-center gap-2">
                                              <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                                              Completado
                                            </div>
                                          </SelectItem>
                                          <SelectItem value="cancelled">
                                            <div className="flex items-center gap-2">
                                              <span className="inline-block w-2 h-2 rounded-full bg-red-500"></span>
                                              Cancelado
                                            </div>
                                          </SelectItem>
                                        </SelectContent>
                                      </Select>
                                    ) : (
                                      <Badge variant="outline" className="cursor-not-allowed bg-gray-100">
                                        Inactivo
                                      </Badge>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    {quotation ? (
                                      <div className="font-semibold text-green-600">
                                        S/ {quotation.amount.toLocaleString()}
                                      </div>
                                    ) : (
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => openQuotationFromProject(project.id)}
                                      >
                                        <FileText className="h-4 w-4 mr-1" />
                                        Cotizar
                                      </Button>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <Popover 
                                      open={datePickerOpen?.projectId === project.id && datePickerOpen?.field === 'startDate'}
                                      onOpenChange={(open) => {
                                        if (open) {
                                          setDatePickerOpen({ projectId: project.id, field: 'startDate' });
                                        } else {
                                          setDatePickerOpen(null);
                                        }
                                      }}
                                    >
                                      <PopoverTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          className="w-full justify-start text-left font-normal hover:bg-accent"
                                        >
                                          <CalendarIcon className="mr-2 h-4 w-4" />
                                          {format(new Date(project.startDate), 'dd/MM/yyyy')}
                                        </Button>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                          mode="single"
                                          selected={new Date(project.startDate)}
                                          onSelect={(date) => handleProjectDateChange(project.id, 'startDate', date)}
                                          locale={es}
                                          initialFocus
                                        />
                                      </PopoverContent>
                                    </Popover>
                                  </TableCell>
                                  <TableCell>
                                    <Popover 
                                      open={datePickerOpen?.projectId === project.id && datePickerOpen?.field === 'endDate'}
                                      onOpenChange={(open) => {
                                        if (open) {
                                          setDatePickerOpen({ projectId: project.id, field: 'endDate' });
                                        } else {
                                          setDatePickerOpen(null);
                                        }
                                      }}
                                    >
                                      <PopoverTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          className="w-full justify-start text-left font-normal hover:bg-accent"
                                        >
                                          <CalendarIcon className="mr-2 h-4 w-4" />
                                          {project.endDate ? (
                                            format(new Date(project.endDate), 'dd/MM/yyyy')
                                          ) : (
                                            <span className="text-muted-foreground italic">Seleccionar fecha</span>
                                          )}
                                        </Button>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                          mode="single"
                                          selected={project.endDate ? new Date(project.endDate) : undefined}
                                          onSelect={(date) => handleProjectDateChange(project.id, 'endDate', date)}
                                          locale={es}
                                          initialFocus
                                        />
                                      </PopoverContent>
                                    </Popover>
                                  </TableCell>
                                  <TableCell>
                                    {getPriorityBadge(project.endDate)}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <Button variant="ghost" size="sm" onClick={() => setDeleteDialog({
                                      open: true,
                                      type: 'project',
                                      id: project.id,
                                      name: project.name
                                    })}>
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Billing View */}
                {activeView === 'billing' && (
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle>Facturas</CardTitle>
                          <CardDescription>Rastrea y gestiona facturas creadas desde Proyectos</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[120px]">ID Factura</TableHead>
                            <TableHead className="w-[180px]">Proyecto</TableHead>
                            <TableHead className="w-[100px]">Monto</TableHead>
                            <TableHead className="w-[130px]">Estado</TableHead>
                            <TableHead className="w-[140px]">Fecha de Emisión</TableHead>
                            <TableHead className="w-[140px]">Fecha de Vencimiento</TableHead>
                            <TableHead className="text-right w-[60px]">
                              <MoreVertical className="h-4 w-4 ml-auto" />
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {invoices.map((invoice) => (
                            <TableRow key={invoice.id}>
                              <TableCell className="font-medium max-w-[120px] break-words whitespace-normal">{invoice.id}</TableCell>
                              <TableCell className="max-w-[180px] break-words whitespace-normal">{invoice.projectName}</TableCell>
                              <TableCell>
                                {invoice.currency === 'USD' ? '$' : 'S/'} {invoice.amount.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </TableCell>
                              <TableCell>
                                <Select
                                  value={invoice.status}
                                  onValueChange={(value: 'paid' | 'pending' | 'overdue') => 
                                    handleInvoiceStatusChange(invoice.id, value)
                                  }
                                >
                                  <SelectTrigger className="w-[130px] h-8">
                                    <SelectValue>
                                      {getStatusBadge(invoice.status)}
                                    </SelectValue>
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="paid">
                                      <div className="flex items-center gap-2">
                                        <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                                        Pagado
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="pending">
                                      <div className="flex items-center gap-2">
                                        <span className="inline-block w-2 h-2 rounded-full bg-yellow-500"></span>
                                        Pendiente
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="overdue">
                                      <div className="flex items-center gap-2">
                                        <span className="inline-block w-2 h-2 rounded-full bg-red-500"></span>
                                        Vencido
                                      </div>
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1 text-sm">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(invoice.issueDate).toLocaleDateString('es-ES')}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1 text-sm">
                                  <Clock className="h-3 w-3" />
                                  {new Date(invoice.dueDate).toLocaleDateString('es-ES')}
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button variant="ghost" size="sm">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm">
                                    <Download className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm" onClick={() => setDeleteDialog({
                                    open: true,
                                    type: 'invoice',
                                    id: invoice.id,
                                    name: invoice.id
                                  })}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                )}

                {/* Contacts View */}
                {activeView === 'contacts' && (
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle>Clientes</CardTitle>
                          <CardDescription>Gestiona información de clientes</CardDescription>
                        </div>
                        <Dialog open={isAddContactOpen} onOpenChange={(open) => {
                          setIsAddContactOpen(open);
                          if (!open) resetContactForm();
                        }}>
                          <DialogTrigger asChild>
                            <Button>
                              <Plus className="mr-2 h-4 w-4" />
                              Agregar Cliente
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>{isEditingContact ? 'Editar Cliente' : 'Agregar Cliente'}</DialogTitle>
                              <DialogDescription>
                                {isEditingContact ? 'Actualizar información del cliente' : 'Agregar un nuevo cliente'}
                              </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={isEditingContact ? handleEditContact : handleAddContact}>
                              <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="grid gap-2">
                                    <Label htmlFor="contact-name">Nombre</Label>
                                    <Input 
                                      id="contact-name" 
                                      placeholder="Nombre" 
                                      value={contactForm.name}
                                      onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                                      required
                                    />
                                  </div>
                                  <div className="grid gap-2">
                                    <Label htmlFor="contact-lastname">Apellido</Label>
                                    <Input 
                                      id="contact-lastname" 
                                      placeholder="Apellido" 
                                      value={contactForm.lastName}
                                      onChange={(e) => setContactForm({...contactForm, lastName: e.target.value})}
                                      required
                                    />
                                  </div>
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="email">Correo Electrónico</Label>
                                  <Input 
                                    id="email" 
                                    type="email" 
                                    placeholder="correo@ejemplo.com" 
                                    value={contactForm.email}
                                    onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                                    required
                                  />
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="phone">Teléfono</Label>
                                  <Input 
                                    id="phone" 
                                    type="tel" 
                                    placeholder="+51 999 999 999" 
                                    value={contactForm.phone}
                                    onChange={(e) => setContactForm({...contactForm, phone: e.target.value})}
                                    required
                                  />
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="company">Empresa</Label>
                                  <Input 
                                    id="company" 
                                    placeholder="Nombre de la empresa" 
                                    value={contactForm.company}
                                    onChange={(e) => setContactForm({...contactForm, company: e.target.value})}
                                    required
                                  />
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="role">Cargo</Label>
                                  <Input 
                                    id="role" 
                                    placeholder="Título del puesto" 
                                    value={contactForm.role}
                                    onChange={(e) => setContactForm({...contactForm, role: e.target.value})}
                                    required
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => {
                                  setIsAddContactOpen(false);
                                  resetContactForm();
                                }}>
                                  Cancelar
                                </Button>
                                <Button type="submit">
                                  {isEditingContact ? 'Actualizar Cliente' : 'Agregar Cliente'}
                                </Button>
                              </DialogFooter>
                            </form>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {contacts.map((contact) => (
                          <Card key={contact.id}>
                            <CardHeader>
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium">{contact.name} {contact.lastName}</p>
                                  <p className="text-sm text-muted-foreground">{contact.role}</p>
                                </div>
                                <div className="flex gap-1">
                                  <Button variant="ghost" size="sm" onClick={() => openEditContact(contact)}>
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm" onClick={() => setDeleteDialog({
                                    open: true,
                                    type: 'contact',
                                    id: contact.id,
                                    name: `${contact.name} ${contact.lastName}`
                                  })}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div className="flex items-center gap-2 text-sm">
                                <Building className="h-4 w-4 text-muted-foreground" />
                                <span>{contact.company}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <a href={`mailto:${contact.email}`} className="text-primary hover:underline">
                                  {contact.email}
                                </a>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <a href={`tel:${contact.phone}`} className="text-primary hover:underline">
                                  {contact.phone}
                                </a>
                              </div>
                              <div className="pt-2 border-t">
                                <p className="text-xs text-muted-foreground mb-2">Proyectos Asociados:</p>
                                <div className="flex flex-wrap gap-1">
                                  {projects.filter(p => p.contactId === contact.id && (p.status === 'active' || p.status === 'on-hold')).map(project => (
                                    <Badge key={project.id} variant="outline" className="text-xs">
                                      {project.name}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Delete Confirmation Dialog */}
                <AlertDialog open={deleteDialog.open} onOpenChange={(open) => !open && setDeleteDialog({ open: false, type: null, id: null, name: '' })}>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                      <AlertDialogDescription>
                        {deleteDialog.type === 'contact' && `Esto eliminará permanentemente el contacto "${deleteDialog.name}". Esta acción no se puede deshacer.`}
                        {deleteDialog.type === 'project' && `Esto eliminará permanentemente el proyecto "${deleteDialog.name}" y todas sus facturas asociadas. Esta acción no se puede deshacer.`}
                        {deleteDialog.type === 'invoice' && `Esto eliminará permanentemente la factura "${deleteDialog.name}". Esta acción no se puede deshacer.`}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => {
                        if (deleteDialog.type === 'contact') handleDeleteContact(deleteDialog.id!);
                        else if (deleteDialog.type === 'project') handleDeleteProject(deleteDialog.id!);
                        else if (deleteDialog.type === 'invoice') handleDeleteInvoice(deleteDialog.id!);
                      }}>
                        Eliminar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                {/* Quotation Modal */}
                <Dialog open={isAddInvoiceOpen} onOpenChange={setIsAddInvoiceOpen}>
                  <DialogContent className="!max-w-[95vw] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Nueva Cotización</DialogTitle>
                      <DialogDescription>
                        Crea una cotización para el proyecto seleccionado
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-6">
                      {/* Project Information - Read Only */}
                      <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                        <h3 className="font-semibold text-sm">Información del Proyecto</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs text-muted-foreground">Proyecto</label>
                            <p className="font-medium">{projects.find(p => p.id === selectedProject)?.name || 'No seleccionado'}</p>
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground">Cliente</label>
                            <p className="font-medium">{projects.find(p => p.id === selectedProject)?.client || '-'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Client Details */}
                      <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                        <h3 className="font-semibold text-sm">Datos del Cliente</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs text-muted-foreground">Nombre</label>
                            <p className="font-medium">
                              {(() => {
                                const project = projects.find(p => p.id === selectedProject);
                                const contact = contacts.find(c => c.id === project?.contactId);
                                return contact ? `${contact.name} ${contact.lastName || ''}` : '-';
                              })()}
                            </p>
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground">Empresa</label>
                            <p className="font-medium">
                              {(() => {
                                const project = projects.find(p => p.id === selectedProject);
                                const contact = contacts.find(c => c.id === project?.contactId);
                                return contact?.company || '-';
                              })()}
                            </p>
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground">Email</label>
                            <p className="font-medium text-sm">
                              {(() => {
                                const project = projects.find(p => p.id === selectedProject);
                                const contact = contacts.find(c => c.id === project?.contactId);
                                return contact?.email || '-';
                              })()}
                            </p>
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground">Teléfono</label>
                            <p className="font-medium">
                              {(() => {
                                const project = projects.find(p => p.id === selectedProject);
                                const contact = contacts.find(c => c.id === project?.contactId);
                                return contact?.phone || '-';
                              })()}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Currency Selection */}
                      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-3">
                        <h3 className="font-semibold text-sm">Moneda y Tipo de Cambio</h3>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="currency">Moneda de Facturación</Label>
                            <Select
                              value={invoiceCurrency}
                              onValueChange={(value: 'PEN' | 'USD') => setInvoiceCurrency(value)}
                            >
                              <SelectTrigger id="currency">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="PEN">Soles (S/)</SelectItem>
                                <SelectItem value="USD">Dólares ($)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="exchange-rate">Tipo de Cambio (S/ por $1)</Label>
                            <Input
                              id="exchange-rate"
                              type="number"
                              step="0.001"
                              min="0"
                              placeholder="3.750"
                              value={exchangeRate}
                              onChange={(e) => setExchangeRate(parseFloat(e.target.value) || 3.75)}
                            />
                          </div>
                          <div className="flex items-end">
                            <p className="text-sm text-muted-foreground">
                              {invoiceCurrency === 'PEN' 
                                ? `$1 USD = S/ ${exchangeRate.toFixed(3)}`
                                : `S/ 1 = $${(1/exchangeRate).toFixed(4)}`
                              }
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Service Items */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <h3 className="font-semibold text-sm">Items del Servicio</h3>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setInvoiceItems([...invoiceItems, { id: Date.now().toString(), serviceName: '', description: '', unitPrice: 0, quantity: 1, total: 0 }])}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Agregar Item
                          </Button>
                        </div>

                        <div className="border rounded-lg overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-12">#</TableHead>
                                <TableHead className="w-[200px]">Item</TableHead>
                                <TableHead className="min-w-[250px]">Descripción</TableHead>
                                <TableHead className="w-[130px]">Precio Unit. (S/)</TableHead>
                                <TableHead className="w-[100px]">Cantidad</TableHead>
                                <TableHead className="w-[130px]">Total (S/)</TableHead>
                                <TableHead className="w-12"></TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {invoiceItems.map((item, index) => (
                                <TableRow key={index}>
                                  <TableCell className="font-medium text-center">{index + 1}</TableCell>
                                  <TableCell>
                                    <input
                                      type="text"
                                      className="w-full p-2 border rounded-md text-sm"
                                      placeholder="Nombre del servicio"
                                      value={item.serviceName}
                                      onChange={(e) => {
                                        const updated = [...invoiceItems];
                                        updated[index].serviceName = e.target.value;
                                        setInvoiceItems(updated);
                                      }}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <textarea
                                      className="w-full p-2 border rounded-md text-sm"
                                      rows={2}
                                      placeholder="Descripción del servicio..."
                                      value={item.description}
                                      onChange={(e) => {
                                        const updated = [...invoiceItems];
                                        updated[index].description = e.target.value;
                                        setInvoiceItems(updated);
                                      }}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <input
                                      type="number"
                                      className="w-full p-2 border rounded-md text-sm"
                                      placeholder="0.00"
                                      step="0.01"
                                      value={item.unitPrice || ''}
                                      onChange={(e) => {
                                        const updated = [...invoiceItems];
                                        updated[index].unitPrice = parseFloat(e.target.value) || 0;
                                        updated[index].total = updated[index].unitPrice * updated[index].quantity;
                                        setInvoiceItems(updated);
                                      }}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <input
                                      type="number"
                                      className="w-full p-2 border rounded-md text-sm"
                                      placeholder="1"
                                      min="1"
                                      value={item.quantity || ''}
                                      onChange={(e) => {
                                        const updated = [...invoiceItems];
                                        updated[index].quantity = parseInt(e.target.value) || 1;
                                        updated[index].total = updated[index].unitPrice * updated[index].quantity;
                                        setInvoiceItems(updated);
                                      }}
                                    />
                                  </TableCell>
                                  <TableCell className="font-semibold">
                                    {item.total.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </TableCell>
                                  <TableCell>
                                    {invoiceItems.length > 1 && (
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setInvoiceItems(invoiceItems.filter((_, i) => i !== index))}
                                      >
                                        <X className="h-4 w-4 text-destructive" />
                                      </Button>
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>

                        {/* Summary Section */}
                        {invoiceItems.length > 0 && invoiceItems.some(item => item.unitPrice > 0) && (
                          <div className="border rounded-lg p-4 bg-muted/30">
                            <div className="flex justify-end">
                              <div className="w-[500px] space-y-3">
                                <div className="text-sm font-semibold text-muted-foreground mb-2">
                                  Moneda de Facturación: {invoiceCurrency === 'PEN' ? 'Soles Peruanos (S/)' : 'Dólares Americanos ($)'}
                                </div>
                                
                                {/* Primary Currency */}
                                <div className="space-y-2 pb-3 border-b">
                                  <div className="flex justify-between text-sm">
                                    <span>Subtotal:</span>
                                    <span className="font-medium">
                                      {invoiceCurrency === 'PEN' ? 'S/' : '$'} {calculateInvoiceTotals().subtotal.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                  </div>
                                  <div className="flex justify-between text-sm text-muted-foreground">
                                    <span>Retención (8%):</span>
                                    <span>
                                      {invoiceCurrency === 'PEN' ? 'S/' : '$'} {calculateInvoiceTotals().retention.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                  </div>
                                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                                    <span>Monto a Facturar:</span>
                                    <span className="text-primary">
                                      {invoiceCurrency === 'PEN' ? 'S/' : '$'} {calculateInvoiceTotals().total.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    * Después de la retención del 8%, recibirás: {invoiceCurrency === 'PEN' ? 'S/' : '$'} {calculateInvoiceTotals().subtotal.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </p>
                                </div>

                                {/* Converted Currency */}
                                <div className="space-y-2 bg-blue-50 dark:bg-blue-950/20 p-3 rounded-md">
                                  <div className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-2">
                                    Equivalente en {invoiceCurrency === 'PEN' ? 'Dólares ($)' : 'Soles (S/)'}
                                    <span className="ml-2 font-normal text-muted-foreground">
                                      (T.C: {invoiceCurrency === 'PEN' ? `$1 = S/ ${exchangeRate.toFixed(3)}` : `S/ 1 = $${(1/exchangeRate).toFixed(4)}`})
                                    </span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span>Subtotal:</span>
                                    <span className="font-medium">
                                      {invoiceCurrency === 'PEN' 
                                        ? `$ ${(calculateInvoiceTotals().subtotal / exchangeRate).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                        : `S/ ${(calculateInvoiceTotals().subtotal * exchangeRate).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                      }
                                    </span>
                                  </div>
                                  <div className="flex justify-between text-sm text-muted-foreground">
                                    <span>Retención (8%):</span>
                                    <span>
                                      {invoiceCurrency === 'PEN' 
                                        ? `$ ${(calculateInvoiceTotals().retention / exchangeRate).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                        : `S/ ${(calculateInvoiceTotals().retention * exchangeRate).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                      }
                                    </span>
                                  </div>
                                  <div className="flex justify-between font-bold text-blue-700 dark:text-blue-400">
                                    <span>Monto a Facturar:</span>
                                    <span>
                                      {invoiceCurrency === 'PEN' 
                                        ? `$ ${(calculateInvoiceTotals().total / exchangeRate).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                        : `S/ ${(calculateInvoiceTotals().total * exchangeRate).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                      }
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Notes */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Notas Adicionales (Opcional)</label>
                        <textarea
                          className="w-full p-2 border rounded-md"
                          rows={3}
                          placeholder="Condiciones, términos de pago, etc..."
                          value={invoiceNotes}
                          onChange={(e) => setInvoiceNotes(e.target.value)}
                        />
                      </div>
                    </div>

                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => {
                        setIsAddInvoiceOpen(false);
                        resetInvoiceForm();
                      }}>
                        Cancelar
                      </Button>
                      <Button type="button" onClick={handleCreateQuotation}>Crear Cotización</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}







































































































