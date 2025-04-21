import { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import Sidebar from "./Sidebar";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user } = useAuth();

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen w-full bg-zinc-50 text-foreground">
        <Sidebar />
        <SidebarInset className="w-full pl-[var(--sidebar-width)]">
          <div className="w-full py-8 px-[16px]">
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
