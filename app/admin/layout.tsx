import { getSession } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import SeasonPicker from "@/components/SeasonPicker";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-transparent text-ice-50 font-mono flex relative">
      {/* Top Right Theme Picker */}
      <div className="absolute top-6 right-6 md:top-10 md:right-10 z-50">
        <SeasonPicker />
      </div>

      {/* Two-Level Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto z-10">
        {children}
      </div>
    </div>
  );
}
