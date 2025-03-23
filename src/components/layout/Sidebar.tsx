
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { 
  LayoutDashboard, 
  Briefcase, 
  CheckSquare, 
  Receipt, 
  FolderArchive, 
  FileText, 
  Users, 
  ChevronLeft, 
  ChevronRight,
  LogOut,
  LogIn,
  UserPlus
} from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { user, signOut, isOwner } = useAuth();

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div 
      className={`
        fixed left-0 top-0 bottom-0 z-40 
        sidebar-glass
        transition-all duration-300 ease-in-out
        ${collapsed ? 'w-20' : 'w-64'}
      `}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-4 h-16 border-b border-zinc-800/30">
          {!collapsed && (
            <div className="text-amber-500 font-semibold text-xl tracking-tight animate-fade-in">
              Creative
            </div>
          )}
          <button 
            onClick={toggleSidebar} 
            className={`
              w-8 h-8 rounded-full flex items-center justify-center 
              text-zinc-400 hover:text-amber-500 hover:bg-zinc-800/50
              transition-all duration-200
              ${collapsed ? 'ml-auto mr-auto' : 'ml-auto'}
            `}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-3">
          <nav>
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`
                        menu-item
                        ${isActive ? 'menu-item-active' : ''}
                      `}
                    >
                      <item.icon className="menu-item-icon" />
                      {!collapsed && (
                        <span className="font-medium transition-opacity duration-200">
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
        </div>
        
        <div className="px-3 pb-6 space-y-3">
          {user ? (
            <>
              <div className={`
                flex items-center gap-3 p-3 
                rounded-lg bg-zinc-800/30 
                border border-zinc-700/30
                ${collapsed ? 'justify-center' : ''}
              `}>
                <div className="w-9 h-9 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500">
                  {user.email?.charAt(0).toUpperCase() || "U"}
                </div>
                {!collapsed && (
                  <div className="overflow-hidden">
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
                className="w-full justify-start text-zinc-400 hover:text-zinc-100"
              >
                <LogOut className="w-4 h-4 mr-2" />
                {!collapsed && "Sign Out"}
              </Button>
            </>
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
      </div>
    </div>
  );
};

export default Sidebar;
