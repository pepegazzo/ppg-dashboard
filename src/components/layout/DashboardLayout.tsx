
import { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Sidebar, { useSidebarState } from "./Sidebar";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user } = useAuth();
  const { collapsed } = useSidebarState();

  return (
    <div className="flex min-h-screen bg-zinc-50">
      <Sidebar />
      <main 
        className={`flex-1 py-8 px-[16px] transition-all duration-300 ${
          collapsed ? 'ml-[3rem]' : 'ml-[14rem]'
        }`}
      >
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
