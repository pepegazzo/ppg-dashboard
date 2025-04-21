
import { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Sidebar from "./Sidebar";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen bg-zinc-50">
      <Sidebar />
      <main className="flex-1 ml-[14rem] transition-all duration-300 py-8 px-[16px]">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
