
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import ChangePasswordForm from "@/components/auth/ChangePasswordForm";
import DashboardLayout from "@/components/layout/DashboardLayout";

const Profile = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login");
    }
  }, [isLoading, user, navigate]);

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 px-4">
        <h1 className="text-3xl font-bold mb-8">My Profile</h1>
        
        <div className="grid gap-6">
          <div className="bg-card rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Account Information</h2>
            <div className="space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p>{user?.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Last Sign In</p>
                  <p>{user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center">
            <ChangePasswordForm />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
