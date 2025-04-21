
import { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { SidebarProvider, SidebarInset, useSidebar } from "@/components/ui/sidebar";
import Sidebar from "./Sidebar";

interface DashboardLayoutProps {
  children: ReactNode;
}

const MainContent = ({ children }: { children: ReactNode }) => {
  const { state } = useSidebar();

  // When collapsed, reduce left margin/padding; when expanded, keep it as normal.
  // On smaller screens the sidebar overlays so we don't need margin.
  return (
    <SidebarInset
      className={`bg-zinc-50 text-foreground transition-[margin,padding] duration-200 ${
        state === "collapsed"
          ? "md:ml-0" // Remove the margin when collapsed
          : "md:ml-0" // Remove the margin when expanded too
      }`}
    >
      <div className="w-full py-8 px-[16px]">
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
