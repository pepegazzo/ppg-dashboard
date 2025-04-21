
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LayoutDashboard, Briefcase, CheckSquare, Receipt, FolderArchive, FileText, Users, LogOut, User, LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
const menuItems = [{
  title: "Overview",
  icon: LayoutDashboard,
  path: "/"
}, {
  title: "Projects",
  icon: Briefcase,
  path: "/projects"
}, {
  title: "Tasks",
  icon: CheckSquare,
  path: "/tasks"
}, {
  title: "Billing",
  icon: Receipt,
  path: "/billing"
}, {
  title: "Files & Assets",
  icon: FolderArchive,
  path: "/files"
}, {
  title: "Notes",
  icon: FileText,
  path: "/notes"
}, {
  title: "Clients",
  icon: Users,
  path: "/clients"
}];
const Sidebar = () => {
  const location = useLocation();
  const {
    user,
    signOut,
    isOwner
  } = useAuth();
  return <aside className="h-screen bg-zinc-900 fixed left-0 top-0 w-[12rem] border-r border-zinc-800/30 flex flex-col z-40">
      {/* Header */}
      <div className="h-16 flex items-center px-3 border-b border-zinc-800/30">
        <div className="text-amber-500 font-semibold text-lg tracking-tight">
          Creative
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="py-5 px-2 flex-1 overflow-y-auto">
        <ul className="flex flex-col gap-2"> {/* Increased gap from 1 to 2 */}
          {menuItems.map(item => {
          const isActive = location.pathname === item.path;
          return <li key={item.path}>
                <Link to={item.path} className={`
                    relative flex items-center gap-2 px-2 py-1 text-zinc-400 rounded-md transition-all duration-200 ease-in-out text-sm
                    ${isActive ? 'bg-amber-500/10 text-amber-500' : 'hover:bg-zinc-800/50 hover:text-zinc-200'}
                  `}>
                  <item.icon className="w-4 h-4" />
                  <span className="font-medium truncate">
                    {item.title}
                  </span>
                  {isActive && <span className="absolute left-0 w-1 h-full bg-amber-500 rounded-r-full" />}
                </Link>
              </li>;
        })}
        </ul>
      </nav>
      
      {/* Footer */}
      <div className="px-3 pb-5 space-y-2">
        {user ? <div className="flex flex-col items-center space-y-2">
            <div className="flex items-center w-full gap-2">
              
              <div className="overflow-hidden text-center w-full">
                <h4 className="text-xs font-medium text-zinc-200 truncate">{user.email}</h4>
                <p className="text-xs text-zinc-500 truncate">
                  {isOwner ? "Owner" : "Admin"}
                </p>
              </div>
            </div>
            
            <Button onClick={() => signOut()} variant="ghost" className="w-full justify-center text-zinc-400 hover:text-zinc-100 px-3 text-xs h-7">
              <LogOut className="w-3 h-3" />
              <span className="ml-1">Sign Out</span>
            </Button>
          </div> : <>
            <Link to="/login">
              <Button variant="ghost" className="w-full justify-start text-zinc-400 hover:text-zinc-100 text-xs h-7 px-3">
                <LogIn className="w-3 h-3 mr-1" />
                Sign In
              </Button>
            </Link>
            
            <Link to="/register">
              <Button variant="ghost" className="w-full justify-start text-zinc-400 hover:text-zinc-100 text-xs h-7 px-3">
                <UserPlus className="w-3 h-3 mr-1" />
                Register
              </Button>
            </Link>
          </>}
      </div>
    </aside>;
};
export default Sidebar;
