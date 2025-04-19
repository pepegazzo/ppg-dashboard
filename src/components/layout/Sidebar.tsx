
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
  LogOut,
  LogIn,
  UserPlus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail,
  SidebarTrigger,
  useSidebar
} from "@/components/ui/sidebar";

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
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <ShadcnSidebar
      className="bg-sidebar border-sidebar-border" 
      variant="sidebar"
      collapsible="icon"
    >
      <SidebarRail />
      <SidebarHeader className="h-16 flex items-center px-4 justify-between border-b border-zinc-800/30">
        {!isCollapsed && (
          <div className="text-amber-500 font-semibold text-xl tracking-tight">
            Creative
          </div>
        )}
        <SidebarTrigger 
          className={`
            w-8 h-8 rounded-full flex items-center justify-center 
            text-zinc-400 hover:text-amber-500 hover:bg-zinc-800/50
            transition-all duration-200
            ${isCollapsed ? 'ml-auto mr-auto' : 'ml-auto'}
          `}
        />
      </SidebarHeader>
      
      <SidebarContent className="py-6 px-3">
        <SidebarMenu>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            
            return (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={isCollapsed ? item.title : undefined}
                  className={`
                    menu-item
                    ${isActive ? 'menu-item-active' : ''}
                  `}
                >
                  <Link to={item.path}>
                    <item.icon className="menu-item-icon" />
                    {!isCollapsed && (
                      <span className="font-medium">
                        {item.title}
                      </span>
                    )}
                    {isActive && (
                      <span className="absolute left-0 w-1 h-full bg-amber-500 rounded-r-full" />
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
      
      <SidebarFooter className="px-3 pb-6 space-y-3">
        {user ? (
          <>
            <div className={`
              flex items-center gap-3 p-3 
              rounded-lg bg-zinc-800/30 
              border border-zinc-700/30
              ${isCollapsed ? 'justify-center' : ''}
            `}>
              <div className="w-9 h-9 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500">
                {user.email?.charAt(0).toUpperCase() || "U"}
              </div>
              {!isCollapsed && (
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
              {!isCollapsed && "Sign Out"}
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
                {!isCollapsed && "Sign In"}
              </Button>
            </Link>
            
            <Link to="/register">
              <Button 
                variant="ghost" 
                className="w-full justify-start text-zinc-400 hover:text-zinc-100"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                {!isCollapsed && "Register"}
              </Button>
            </Link>
          </>
        )}
      </SidebarFooter>
    </ShadcnSidebar>
  );
};

export default Sidebar;
