import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Building2, Plus, Trash2 } from "lucide-react";

interface Dept { id: string; name: string; description: string | null; created_at: string; }

export default function Departments() {
  const { hasRole, user } = useAuth();
  const isAdmin = hasRole("admin");
  const [list, setList] = useState<Dept[]>([]);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const { data, error } = await supabase.from("departments").select("*").order("created_at", { ascending: false });
    if (error) return toast.error(error.message);
    setList(data ?? []);
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!name.trim()) return toast.error("请输入部门名称");
    setLoading(true);
    const { error } = await supabase.from("departments").insert({
      name: name.trim(),
      description: desc.trim() || null,
      created_by: user?.id,
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("已创建");
    setName(""); setDesc(""); load();
  };

  const remove = async (id: string) => {
    if (!confirm("删除该部门？")) return;
    const { error } = await supabase.from("departments").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("已删除"); load();
  };

  return (
    <div className="p-8 max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Building2 className="w-6 h-6" /> 部门管理</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {isAdmin ? "新增、查看公司部门。规则配置、用户分配会引用这里的部门。" : "您当前为只读权限。"}
        </p>
      </div>

      {isAdmin && (
        <Card className="p-5 space-y-3">
          <h2 className="font-semibold">新增部门</h2>
          <Input placeholder="部门名称（如：法务部）" value={name} onChange={(e) => setName(e.target.value)} maxLength={50} />
          <Textarea placeholder="部门简介（可选）" value={desc} onChange={(e) => setDesc(e.target.value)} maxLength={300} />
          <Button onClick={create} disabled={loading}><Plus className="w-4 h-4 mr-1" /> 添加</Button>
        </Card>
      )}

      <div className="space-y-2">
        {list.length === 0 && <p className="text-muted-foreground text-sm">暂无部门</p>}
        {list.map((d) => (
          <Card key={d.id} className="p-4 flex items-start justify-between gap-4">
            <div>
              <h3 className="font-medium">{d.name}</h3>
              {d.description && <p className="text-sm text-muted-foreground mt-1">{d.description}</p>}
            </div>
            {isAdmin && (
              <Button variant="ghost" size="sm" onClick={() => remove(d.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
