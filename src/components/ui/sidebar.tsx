
import React, { createContext, useContext, useState } from "react";
import { cn } from "@/lib/utils";

// Types
type SidebarState = "expanded" | "collapsed";
type SidebarContextType = {
  state: SidebarState;
  toggleState: () => void;
};

// Create context
const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

// Provider
interface SidebarProviderProps {
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export const SidebarProvider = ({ 
  children, 
  defaultOpen = true 
}: SidebarProviderProps) => {
  const [state, setState] = useState<SidebarState>(
    defaultOpen ? "expanded" : "collapsed"
  );

  const toggleState = () => {
    setState(prev => prev === "expanded" ? "collapsed" : "expanded");
  };

  return (
    <SidebarContext.Provider value={{ state, toggleState }}>
      {children}
    </SidebarContext.Provider>
  );
};

// Hook
export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

// Components
export const SidebarInset = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn("transition-all duration-200", className)}
      {...props}
    >
      {children}
    </div>
  );
};

// Export sidebar components with extended props
interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: string;
  collapsible?: string;
}

export const Sidebar = ({
  className,
  children,
  variant,
  collapsible,
  ...props
}: SidebarProps) => {
  return (
    <div
      className={cn("h-screen fixed top-0 left-0", className)}
      {...props}
    >
      {children}
    </div>
  );
};

export const SidebarContent = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn("overflow-y-auto", className)}
      {...props}
    >
      {children}
    </div>
  );
};

export const SidebarFooter = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn("mt-auto", className)}
      {...props}
    >
      {children}
    </div>
  );
};

export const SidebarHeader = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn("", className)}
      {...props}
    >
      {children}
    </div>
  );
};

export const SidebarMenu = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLUListElement>) => {
  return (
    <ul
      className={cn("space-y-1", className)}
      {...props}
    >
      {children}
    </ul>
  );
};

export const SidebarMenuItem = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLLIElement>) => {
  return (
    <li
      className={cn("", className)}
      {...props}
    >
      {children}
    </li>
  );
};

export const SidebarMenuButton = ({
  className,
  children,
  isActive,
  asChild,
  tooltip,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  isActive?: boolean;
  asChild?: boolean;
  tooltip?: string;
}) => {
  const Comp = asChild ? React.Fragment : "button";
  return (
    <Comp
      className={cn(
        "flex items-center w-full px-3 py-2 rounded-md hover:bg-zinc-800/30 transition-colors",
        isActive && "bg-zinc-800/40",
        className
      )}
      {...props}
    >
      {children}
    </Comp>
  );
};

export const SidebarRail = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn("absolute inset-y-0 left-0 w-1", className)}
      {...props}
    />
  );
};

export const SidebarTrigger = ({
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  const { toggleState } = useSidebar();
  
  return (
    <button
      onClick={toggleState}
      className={cn("", className)}
      {...props}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 6H3" />
        <path d="M10 12H3" />
        <path d="M16 18H3" />
      </svg>
    </button>
  );
};
