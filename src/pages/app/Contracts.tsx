import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus } from "lucide-react";

const statusLabel: Record<string, string> = {
  draft: "草稿",
  reviewing: "审核中",
  revision_required: "待修订",
  approved: "已通过",
  sealed: "已盖章",
  archived: "已归档",
};
const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  draft: "outline",
  reviewing: "secondary",
  revision_required: "destructive",
  approved: "default",
  sealed: "default",
  archived: "secondary",
};

export default function Contracts() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("contracts")
      .select("*, departments(name)")
      .order("created_at", { ascending: false });
    setList(data ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  return (
    <div className="p-8 max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><FileText className="w-6 h-6" /> 合同管理</h1>
          <p className="text-sm text-muted-foreground mt-1">企业内部合同上传、审核、审批与归档</p>
        </div>
        <Link to="/app/contracts/new">
          <Button><Plus className="w-4 h-4 mr-1" /> 新建合同</Button>
        </Link>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">加载中…</p>
      ) : list.length === 0 ? (
        <Card className="p-10 text-center text-muted-foreground">暂无合同，点击右上角新建。</Card>
      ) : (
        <div className="space-y-2">
          {list.map((c) => (
            <Link key={c.id} to={`/app/contracts/${c.id}`}>
              <Card className="p-4 hover:border-primary transition-colors flex items-center justify-between">
                <div className="min-w-0">
                  <p className="font-medium truncate">{c.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {c.departments?.name || "未指定部门"} · v{c.current_version} · {new Date(c.created_at).toLocaleString()}
                  </p>
                </div>
                <Badge variant={statusVariant[c.status]}>{statusLabel[c.status]}</Badge>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
