
import DashboardLayout from "@/components/layout/DashboardLayout";

const Notes = () => {
  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        <div className="flex flex-col gap-2 mb-8">
          <span className="text-xs font-medium px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full w-fit">Workspace</span>
          <h1 className="text-3xl font-bold text-zinc-900">Notes</h1>
        </div>
        
        {/* Content area - will be populated later */}
        <div className="border border-dashed border-zinc-300 rounded-lg h-[70vh] flex items-center justify-center">
          <p className="text-zinc-500">Notes content will be added here in the next steps</p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Notes;
