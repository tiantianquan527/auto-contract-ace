import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Building2, ClipboardList, Users, FileText, LogOut, Home } from "lucide-react";
import { useEffect } from "react";

export default function AppLayout() {
  const { user, loading, signOut, hasRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate("/auth", { replace: true });
  }, [user, loading, navigate]);

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">加载中…</div>;
  }

  const navItems = [
    { to: "/app", icon: Home, label: "工作台", show: true, end: true },
    { to: "/app/departments", icon: Building2, label: "部门管理", show: hasRole("admin") },
    { to: "/app/rules", icon: ClipboardList, label: "规则配置", show: hasRole("admin") || hasRole("legal") || hasRole("finance") },
    { to: "/app/users", icon: Users, label: "用户角色", show: hasRole("admin") },
    { to: "/app/review", icon: FileText, label: "合同审核", show: true },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-56 border-r bg-card flex flex-col">
        <div className="p-4 border-b">
          <Link to="/app" className="font-bold text-lg">JobCity 工作台</Link>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {navItems.filter(i => i.show).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive ? "bg-primary text-primary-foreground" : "hover:bg-accent text-foreground"
                }`
              }
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t space-y-2">
          <p className="text-xs text-muted-foreground truncate" title={user.email ?? ""}>{user.email}</p>
          <Button variant="ghost" size="sm" className="w-full justify-start" onClick={async () => { await signOut(); navigate("/"); }}>
            <LogOut className="w-4 h-4 mr-2" /> 退出登录
          </Button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
