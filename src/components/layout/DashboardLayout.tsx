
import { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { SidebarProvider, SidebarInset, useSidebar } from "@/components/ui/sidebar";
import Sidebar from "./Sidebar";

interface DashboardLayoutProps {
  children: ReactNode;
}

const MainContent = ({ children }: { children: ReactNode }) => {
  const { state } = useSidebar();

  // Remove margins and padding on main content so no gap between sidebar and content.
  return (
    <SidebarInset
      className={`bg-zinc-50 text-foreground transition-[margin,padding] duration-200 ${
        state === "collapsed"
          ? "md:ml-0"
          : "md:ml-0"
      }`}
    >
      <div className="w-full py-8 px-0"> {/* Remove horizontal padding */}
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
