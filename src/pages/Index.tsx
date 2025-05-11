import DashboardLayout from "@/components/layout/DashboardLayout";

const Index = () => {
  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        <div className="flex flex-col gap-2 mb-8">
          <span className="text-xs font-medium px-2.5 py-1 rounded-full w-fit bg-zinc-100 text-zinc-800">Dashboard</span>
          <h1 className="text-xl font-bold text-zinc-900">Overview</h1>
        </div>
        
        {/* Content area - will be populated later */}
        <div className="border border-dashed border-zinc-300 rounded-lg h-[70vh] flex items-center justify-center">
          <p className="text-zinc-500">Dashboard content will be added here in the next steps</p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
