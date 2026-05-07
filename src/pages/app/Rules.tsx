import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ClipboardList, Plus, Trash2, X } from "lucide-react";

interface Dept { id: string; name: string; }
interface Rule {
  id: string; name: string; tags: string[]; description: string;
  department_id: string | null; category: string | null; is_active: boolean;
  created_by: string | null;
}

export default function Rules() {
  const { hasRole, user } = useAuth();
  const canEdit = hasRole("admin") || hasRole("legal") || hasRole("finance");
  const [depts, setDepts] = useState<Dept[]>([]);
  const [rules, setRules] = useState<Rule[]>([]);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [deptId, setDeptId] = useState<string>("none");
  const [category, setCategory] = useState("legal");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const load = async () => {
    const [{ data: d }, { data: r }] = await Promise.all([
      supabase.from("departments").select("id,name").order("name"),
      supabase.from("review_rules").select("*").order("created_at", { ascending: false }),
    ]);
    setDepts(d ?? []);
    setRules((r ?? []) as Rule[]);
  };

  useEffect(() => { load(); }, []);

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput("");
  };

  const create = async () => {
    if (!name.trim()) return toast.error("请输入规则名称");
    if (!desc.trim()) return toast.error("请填写规则描述");
    const { error } = await supabase.from("review_rules").insert({
      name: name.trim(),
      description: desc.trim(),
      tags,
      category,
      department_id: deptId === "none" ? null : deptId,
      created_by: user?.id,
    });
    if (error) return toast.error(error.message);
    toast.success("规则已创建");
    setName(""); setDesc(""); setTags([]); setDeptId("none"); load();
  };

  const remove = async (id: string) => {
    if (!confirm("删除该规则？")) return;
    const { error } = await supabase.from("review_rules").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("已删除"); load();
  };

  const deptName = (id: string | null) => depts.find(d => d.id === id)?.name ?? "通用（不限部门）";

  return (
    <div className="p-8 max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><ClipboardList className="w-6 h-6" /> 规则配置</h1>
        <p className="text-sm text-muted-foreground mt-1">
          法务/财务/管理员可创建审核规则。规则会按所属部门匹配到合同审核流程中。
        </p>
      </div>

      {canEdit && (
        <Card className="p-5 space-y-3">
          <h2 className="font-semibold">新增规则</h2>
          <Input placeholder="规则名称（如：违约金不得超过合同金额20%）" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} />
          <Textarea placeholder="规则描述（AI 审核时将作为提示词使用）" value={desc} onChange={(e) => setDesc(e.target.value)} maxLength={1000} />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">所属部门</label>
              <Select value={deptId} onValueChange={setDeptId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">通用（不限部门）</SelectItem>
                  {depts.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">规则分类</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="legal">法务</SelectItem>
                  <SelectItem value="finance">财务</SelectItem>
                  <SelectItem value="general">通用</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">结构化标签</label>
            <div className="flex gap-2">
              <Input placeholder="输入标签后回车" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())} />
              <Button type="button" variant="outline" onClick={addTag}>添加</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map(t => (
                <Badge key={t} variant="secondary" className="gap-1">
                  {t}
                  <button onClick={() => setTags(tags.filter(x => x !== t))}><X className="w-3 h-3" /></button>
                </Badge>
              ))}
            </div>
          </div>
          <Button onClick={create}><Plus className="w-4 h-4 mr-1" /> 创建规则</Button>
        </Card>
      )}

      <div className="space-y-2">
        <h2 className="font-semibold">现有规则（{rules.length}）</h2>
        {rules.length === 0 && <p className="text-sm text-muted-foreground">暂无规则</p>}
        {rules.map(r => (
          <Card key={r.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-medium">{r.name}</h3>
                  <Badge variant="outline" className="text-xs">{deptName(r.department_id)}</Badge>
                  {r.category && <Badge variant="secondary" className="text-xs">{r.category}</Badge>}
                  {!r.is_active && <Badge variant="destructive" className="text-xs">已停用</Badge>}
                </div>
                <p className="text-sm text-muted-foreground mt-2">{r.description}</p>
                {r.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {r.tags.map(t => <Badge key={t} variant="outline" className="text-xs">#{t}</Badge>)}
                  </div>
                )}
              </div>
              {(hasRole("admin") || r.created_by === user?.id) && (
                <Button variant="ghost" size="sm" onClick={() => remove(r.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
