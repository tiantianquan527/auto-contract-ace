import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, AppRole } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Users as UsersIcon } from "lucide-react";

interface ProfileRow {
  id: string;
  user_id: string;
  display_name: string | null;
  email: string | null;
  department_id: string | null;
  access_level: "read" | "download" | "modify";
}
interface RoleRow { user_id: string; role: AppRole; }
interface Dept { id: string; name: string; }

const ROLES: AppRole[] = ["admin", "legal", "finance", "employee"];
const labels: Record<AppRole, string> = { admin: "管理员", legal: "法务", finance: "财务", employee: "普通员工" };
const ACCESS_LABELS: Record<"read" | "download" | "modify", string> = {
  read: "仅阅读",
  download: "可下载",
  modify: "可修改",
};

export default function Users() {
  const { hasRole, user, refreshRoles } = useAuth();
  const isAdmin = hasRole("admin");
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [allRoles, setAllRoles] = useState<RoleRow[]>([]);
  const [depts, setDepts] = useState<Dept[]>([]);

  const load = async () => {
    const [{ data: p }, { data: r }, { data: d }] = await Promise.all([
      supabase.from("profiles").select("*"),
      supabase.from("user_roles").select("user_id, role"),
      supabase.from("departments").select("id,name").order("name"),
    ]);
    setProfiles((p ?? []) as ProfileRow[]);
    setAllRoles((r ?? []) as RoleRow[]);
    setDepts(d ?? []);
  };

  useEffect(() => { load(); }, []);

  const userRoles = (uid: string) => allRoles.filter(r => r.user_id === uid).map(r => r.role);

  const toggleRole = async (uid: string, role: AppRole, has: boolean) => {
    if (has) {
      const { error } = await supabase.from("user_roles").delete().eq("user_id", uid).eq("role", role);
      if (error) return toast.error(error.message);
    } else {
      const { error } = await supabase.from("user_roles").insert({ user_id: uid, role });
      if (error) return toast.error(error.message);
    }
    toast.success("已更新");
    if (uid === user?.id) await refreshRoles();
    load();
  };

  const setDept = async (uid: string, deptId: string) => {
    const value = deptId === "none" ? null : deptId;
    const { error } = await supabase.from("profiles").update({ department_id: value }).eq("user_id", uid);
    if (error) return toast.error(error.message);
    toast.success("已更新部门");
    load();
  };

  const setAccess = async (uid: string, level: "read" | "download" | "modify") => {
    const { error } = await supabase.from("profiles").update({ access_level: level }).eq("user_id", uid);
    if (error) return toast.error(error.message);
    toast.success("已更新权限");
    load();
  };

  if (!isAdmin) {
    return <div className="p-8"><p className="text-muted-foreground">仅管理员可访问此页面。</p></div>;
  }

  return (
    <div className="p-8 max-w-6xl space-y-4">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><UsersIcon className="w-6 h-6" /> 用户与角色</h1>
        <p className="text-sm text-muted-foreground mt-1">分配用户的角色、所属部门，以及访问权限（仅阅读 / 可下载 / 可修改）。</p>
      </div>

      {profiles.map(p => {
        const has = userRoles(p.user_id);
        return (
          <Card key={p.id} className="p-4 space-y-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <p className="font-medium">{p.display_name || p.email}</p>
                <p className="text-xs text-muted-foreground">{p.email}</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <div className="min-w-[160px]">
                  <Select value={p.department_id ?? "none"} onValueChange={(v) => setDept(p.user_id, v)}>
                    <SelectTrigger><SelectValue placeholder="选择部门" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">未分配部门</SelectItem>
                      {depts.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="min-w-[140px]">
                  <Select value={p.access_level ?? "read"} onValueChange={(v) => setAccess(p.user_id, v as any)}>
                    <SelectTrigger><SelectValue placeholder="访问权限" /></SelectTrigger>
                    <SelectContent>
                      {(["read","download","modify"] as const).map(k => (
                        <SelectItem key={k} value={k}>{ACCESS_LABELS[k]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {ROLES.map(r => {
                const active = has.includes(r);
                return (
                  <Button
                    key={r}
                    variant={active ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleRole(p.user_id, r, active)}
                  >
                    {active ? "✓ " : "+ "}{labels[r]}
                  </Button>
                );
              })}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
