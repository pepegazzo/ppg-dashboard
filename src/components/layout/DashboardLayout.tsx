import { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { SidebarProvider, SidebarInset, useSidebar } from "@/components/ui/sidebar";
import Sidebar from "./Sidebar";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: ReactNode;
}

const MainContent = ({ children }: { children: ReactNode }) => {
  const { state } = useSidebar();

  return (
    <SidebarInset
      className={cn(
        "flex-grow bg-zinc-50 text-foreground transition-all duration-200",
        state === "collapsed" ? "ml-[3rem]" : "ml-[14rem]"
      )}
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
