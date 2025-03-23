
import { ReactNode, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Sidebar from "./Sidebar";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [sidebarWidth, setSidebarWidth] = useState(256); // 64 = 16rem (w-64)
  const { user } = useAuth();

  // Listen for sidebar toggle events
  useEffect(() => {
    const handleResize = () => {
      const sidebar = document.querySelector('.sidebar-glass');
      if (sidebar) {
        setSidebarWidth(sidebar.clientWidth);
      }
    };

    // Initial size
    handleResize();

    // Create a MutationObserver to watch for changes to the sidebar's width
    const observer = new MutationObserver(handleResize);
    const sidebar = document.querySelector('.sidebar-glass');
    
    if (sidebar) {
      observer.observe(sidebar, { 
        attributes: true, 
        attributeFilter: ['style', 'class']
      });
    }

    // Add window resize handler
    window.addEventListener('resize', handleResize);
    
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="flex min-h-screen bg-zinc-50">
      <Sidebar />
      <main 
        className="flex-1 transition-all duration-300 ease-in-out"
        style={{ marginLeft: sidebarWidth + 'px' }}
      >
        <div className="container py-8 px-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
