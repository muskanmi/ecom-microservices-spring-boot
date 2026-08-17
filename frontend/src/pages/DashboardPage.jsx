import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const DashboardPage = () => {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <p className="font-mono text-xs tracking-widest uppercase text-muted">
          Loading...
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="relative bg-paper w-full max-w-[380px] rounded pt-10 pb-8 px-8 shadow-2xl">
          {/* Ticket dots */}
          <span className="absolute w-[22px] h-[22px] bg-ink rounded-full -left-[11px] top-[96px]" />
          <span className="absolute w-[22px] h-[22px] bg-ink rounded-full -right-[11px] top-[96px]" />

          <p className="font-mono text-[11px] tracking-widest uppercase text-muted mb-1">
            Marketplace · Access Required
          </p>

          <h1 className="font-display font-bold text-3xl leading-tight mb-8">
            You're not signed in
          </h1>

          <div
            className="border-t-2 border-dashed border-black/20 absolute left-0 right-0"
            style={{ top: "107px" }}
          />

          <p className="mt-6 text-sm text-muted leading-relaxed">
            You must be logged in to view your marketplace dashboard.
          </p>

          <button
            onClick={() => navigate("/login")}
            className="mt-6 w-full bg-gold text-ink py-3 rounded font-semibold hover:opacity-90 transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Page Heading */}
        <div className="mb-8">
          <p className="font-mono text-[11px] tracking-widest uppercase text-muted mb-1">
            Marketplace · Member Dashboard
          </p>

          <h1 className="font-display font-bold text-4xl leading-tight">
            Welcome back, {user.name}
          </h1>
        </div>

        {/* Ticket */}
        <div className="relative bg-paper w-full rounded shadow-2xl">
          {/* Ticket Header */}
          <div className="relative pt-10 pb-8 px-8">
            <p className="font-mono text-[11px] tracking-widest uppercase text-muted mb-1">
              Marketplace · Member Pass
            </p>

            <h2 className="font-display font-bold text-3xl leading-tight">
              Your marketplace pass
            </h2>

            {/* Ticket dots */}
            <span className="absolute w-[22px] h-[22px] bg-ink rounded-full -left-[11px] bottom-0 translate-y-1/2" />
            <span className="absolute w-[22px] h-[22px] bg-ink rounded-full -right-[11px] bottom-0 translate-y-1/2" />
          </div>

          {/* Dashed Divider */}
          <div className="border-t-2 border-dashed border-black/20" />

          {/* User Information */}
          <div className="px-8 py-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            {/* Name */}
            <div>
              <p className="font-mono text-[10px] tracking-widest uppercase text-muted mb-2">
                Name
              </p>

              <p className="font-display font-semibold text-lg">{user.name}</p>
            </div>

            {/* Email */}
            <div>
              <p className="font-mono text-[10px] tracking-widest uppercase text-muted mb-2">
                Email
              </p>

              <p className="font-mono text-sm break-all">{user.email}</p>
            </div>

            {/* Role */}
            <div>
              <p className="font-mono text-[10px] tracking-widest uppercase text-muted mb-2">
                Role
              </p>

              <span className="inline-block bg-ink text-white px-3 py-1 rounded font-mono text-[10px] tracking-widest uppercase">
                {user.role}
              </span>
            </div>

            {/* Status */}
            <div>
              <p className="font-mono text-[10px] tracking-widest uppercase text-muted mb-2">
                Status
              </p>

              <span className="inline-flex items-center gap-2 font-mono text-xs">
                <span className="w-2 h-2 rounded-full bg-green-600" />
                Active Member
              </span>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t-2 border-dashed border-black/20 px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] tracking-widest uppercase text-muted">
                Marketplace Access
              </p>

              <p className="font-display font-semibold mt-1">You're all set.</p>
            </div>

            {/* Gold Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full sm:w-auto bg-gold text-ink px-8 py-3 rounded font-semibold hover:opacity-90 transition"
            >
              Log Out
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center mt-6 font-mono text-[10px] tracking-widest uppercase text-muted">
          Marketplace · Member Access
        </p>
      </div>
    </div>
  );
};

export default DashboardPage;
