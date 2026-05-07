import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Building2, ClipboardList, Users, FileText } from "lucide-react";
import { Link } from "react-router-dom";

const roleLabels: Record<string, string> = {
  admin: "管理员",
  legal: "法务",
  finance: "财务",
  employee: "普通员工",
};

export default function Dashboard() {
  const { user, roles, hasRole } = useAuth();
  const tiles = [
    { to: "/app/departments", icon: Building2, label: "部门管理", desc: "维护公司部门", show: hasRole("admin") },
    { to: "/app/rules", icon: ClipboardList, label: "规则配置", desc: "为部门配置审核规则", show: hasRole("admin") || hasRole("legal") || hasRole("finance") },
    { to: "/app/users", icon: Users, label: "用户角色", desc: "分配用户角色与部门", show: hasRole("admin") },
    { to: "/app/review", icon: FileText, label: "合同审核", desc: "上传合同进行 AI 审核", show: true },
  ];

  return (
    <div className="p-8 max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">欢迎，{user?.email}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          当前角色：{roles.length ? roles.map(r => roleLabels[r]).join("、") : "暂无角色"}
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tiles.filter(t => t.show).map((t) => (
          <Link key={t.to} to={t.to}>
            <Card className="p-5 hover:border-primary transition-colors">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
                  <t.icon className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold">{t.label}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">{t.desc}</p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
