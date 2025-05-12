import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Briefcase, Receipt, Users, LogOut, User, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";

const menuItems = [{
  title: "Projects",
  icon: Briefcase,
  path: "/projects"
}, {
  title: "Billing",
  icon: Receipt,
  path: "/billing"
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
  
  return <aside className="min-h-[calc(100vh-2rem)] bg-zinc-900 fixed left-0 top-0 w-64 rounded-2xl rounded-b-2xl m-4 mb-4 flex flex-col z-40 shadow-xl p-6">
      {/* Header */}
      <div className="h-16 flex items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-lime-300 rounded-full p-2">
            <span className="font-bold text-lg text-zinc-900">L</span>
          </div>
          <span className="text-2xl font-bold text-white">Lovable.Dev</span>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto">
        <ul className="flex flex-col gap-2">
          {menuItems.map(item => {
          const isActive = location.pathname === item.path;
          return <li key={item.path}>
                <Link to={item.path} className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-base font-medium
                    ${isActive ? 'bg-lime-300/90 text-zinc-900 shadow font-semibold' : 'text-zinc-200 hover:bg-zinc-800/60 hover:text-white'}
                  `}>
                  <item.icon className="w-5 h-5" />
                  <span>{item.title}</span>
                </Link>
              </li>;
        })}
        </ul>
      </nav>
      
      {/* Footer */}
      <div className="mt-auto pt-8">
        {user ? <div className="flex flex-col items-center space-y-2">
            <Link to="/profile" className="flex items-center w-full gap-2 px-3 py-2 rounded-lg transition-all hover:bg-zinc-800/50 group" title="View Profile">
              <User className="w-5 h-5 text-zinc-500 group-hover:text-zinc-300" />
              <div className="overflow-hidden text-left w-full">
                <h4 className="text-sm font-medium text-zinc-200 truncate group-hover:text-zinc-100">{user.email}</h4>
                <p className="text-xs text-zinc-500 truncate group-hover:text-zinc-400">
                  {isOwner ? "Owner" : "Admin"}
                </p>
              </div>
            </Link>
            
            <Button onClick={() => signOut()} variant="ghost" className="w-full justify-center text-zinc-400 hover:text-zinc-100 px-3 text-xs h-9 rounded-lg">
              <LogOut className="w-4 h-4" />
              <span className="ml-1">Sign Out</span>
            </Button>
          </div> : <>
            <Link to="/login">
              <Button variant="ghost" className="w-full justify-start text-zinc-400 hover:text-zinc-100 text-xs h-9 px-3 rounded-lg">
                <LogIn className="w-4 h-4 mr-1" />
                Sign In
              </Button>
            </Link>
          </>}
      </div>
    </aside>;
};

export default Sidebar;
