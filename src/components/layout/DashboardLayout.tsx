
import { ReactNode } from "react";
import Sidebar from "./Sidebar";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="flex min-h-screen bg-zinc-50">
      <Sidebar />
      <main className="flex-1 ml-64 transition-all duration-300 ease-in-out">
        <div className="container py-8 px-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
