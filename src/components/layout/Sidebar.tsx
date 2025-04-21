
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { createContext, useContext, useState, ReactNode } from "react";
import { 
  LayoutDashboard, 
  Briefcase, 
  CheckSquare, 
  Receipt, 
  FolderArchive, 
  FileText, 
  Users, 
  LogOut,
  User,
  LogIn,
  UserPlus,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarContextType {
  collapsed: boolean;
  toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function useSidebarState() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebarState must be used within a SidebarProvider");
  }
  return context;
}

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <SidebarContext.Provider value={{ collapsed, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
}

const menuItems = [
  {
    title: "Overview",
    icon: LayoutDashboard,
    path: "/",
  },
  {
    title: "Projects",
    icon: Briefcase,
    path: "/projects",
  },
  {
    title: "Tasks",
    icon: CheckSquare,
    path: "/tasks",
  },
  {
    title: "Billing",
    icon: Receipt,
    path: "/billing",
  },
  {
    title: "Files & Assets",
    icon: FolderArchive,
    path: "/files",
  },
  {
    title: "Notes",
    icon: FileText,
    path: "/notes",
  },
  {
    title: "Clients",
    icon: Users,
    path: "/clients",
  },
];

const Sidebar = () => {
  const location = useLocation();
  const { user, signOut, isOwner } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const sidebarWidth = collapsed ? "w-[3rem]" : "w-[14rem]";
  const mainMargin = collapsed ? "ml-[3rem]" : "ml-[14rem]";

  return (
    <>
      <aside 
        className={`h-screen bg-zinc-900 fixed left-0 top-0 ${sidebarWidth} transition-all duration-300 ease-in-out border-r border-zinc-800/30 flex flex-col z-40`}
      >
        {/* Header */}
        <div className="h-16 flex items-center px-4 justify-between border-b border-zinc-800/30">
          {!collapsed && (
            <div className="text-amber-500 font-semibold text-xl tracking-tight">
              Creative
            </div>
          )}
          <Button 
            onClick={toggleSidebar}
            className={`
              w-8 h-8 rounded-full flex items-center justify-center 
              text-zinc-400 hover:text-amber-500 hover:bg-zinc-800/50
              transition-all duration-200
              ${collapsed ? 'ml-auto mr-auto' : 'ml-auto'}
            `}
            variant="ghost"
            size="icon"
          >
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </Button>
        </div>
        
        {/* Navigation */}
        <nav className="py-6 px-3 flex-1 overflow-y-auto">
          <ul className="flex flex-col gap-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              
              return (
                <li key={item.path}>
                  <Link 
                    to={item.path}
                    className={`
                      relative flex items-center gap-3 px-3 py-2 text-zinc-400 rounded-md transition-all duration-200 ease-in-out
                      ${isActive ? 'bg-amber-500/10 text-amber-500' : 'hover:bg-zinc-800/50 hover:text-zinc-200'}
                    `}
                  >
                    <item.icon className="w-5 h-5" />
                    {!collapsed && (
                      <span className="font-medium whitespace-nowrap">
                        {item.title}
                      </span>
                    )}
                    {isActive && (
                      <span className="absolute left-0 w-1 h-full bg-amber-500 rounded-r-full" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        
        {/* Footer */}
        <div className="px-3 pb-6 space-y-3">
          {user ? (
            <div className="flex flex-col items-center space-y-3">
              <div className={`
                flex items-center w-full
                ${collapsed ? 'flex-col' : 'gap-3'}
              `}>
                <div className={`
                  w-9 h-9 rounded-full bg-amber-500/20 
                  flex items-center justify-center text-amber-500
                  ${collapsed ? 'mb-2' : ''}
                `}>
                  <User className="w-5 h-5" />
                </div>
                {!collapsed && (
                  <div className="overflow-hidden text-center w-full">
                    <h4 className="text-sm font-medium text-zinc-200 truncate">{user.email}</h4>
                    <p className="text-xs text-zinc-500">
                      {isOwner ? "Owner" : "User"}
                    </p>
                  </div>
                )}
              </div>
              
              <Button 
                onClick={() => signOut()} 
                variant="ghost" 
                className={`
                  w-full justify-center text-zinc-400 hover:text-zinc-100
                  ${collapsed ? 'px-2' : 'px-4'}
                `}
              >
                <LogOut className="w-4 h-4" />
                {!collapsed && <span className="ml-2">Sign Out</span>}
              </Button>
            </div>
          ) : (
            <>
              <Link to="/login">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-zinc-400 hover:text-zinc-100"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  {!collapsed && "Sign In"}
                </Button>
              </Link>
              
              <Link to="/register">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-zinc-400 hover:text-zinc-100"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  {!collapsed && "Register"}
                </Button>
              </Link>
            </>
          )}
        </div>
      </aside>
      <div className={`${mainMargin} transition-all duration-300 flex-1`}>
        {/* This div ensures the main content is pushed to the right */}
      </div>
    </>
  );
};

export default Sidebar;
