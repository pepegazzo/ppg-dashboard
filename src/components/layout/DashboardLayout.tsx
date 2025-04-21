
import { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { SidebarProvider, SidebarInset, useSidebar } from "@/components/ui/sidebar";
import Sidebar from "./Sidebar";

interface DashboardLayoutProps {
  children: ReactNode;
}

const MainContent = ({ children }: { children: ReactNode }) => {
  const { state } = useSidebar();

  return (
    <SidebarInset
      className="bg-zinc-50 text-foreground transition-[margin,padding] duration-200"
    >
      <div className="w-full py-8 px-4">
        {children}
      </div>
    </SidebarInset>
  );
};

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user } = useAuth();

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        <Sidebar />
        <MainContent>{children}</MainContent>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
