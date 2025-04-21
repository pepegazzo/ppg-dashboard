
import { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import Sidebar from "./Sidebar";
interface DashboardLayoutProps {
  children: ReactNode;
}
const DashboardLayout = ({
  children
}: DashboardLayoutProps) => {
  const {
    user
  } = useAuth();
  return <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-zinc-50">
        <Sidebar />
        <SidebarInset className="bg-zinc-50 text-foreground">
          <div className="w-full py-8 max-w-full mx-auto">
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>;
};
export default DashboardLayout;
