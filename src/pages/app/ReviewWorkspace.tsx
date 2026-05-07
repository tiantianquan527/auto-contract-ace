import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

export default function ReviewWorkspace() {
  return (
    <div className="p-8 max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><FileText className="w-6 h-6" /> 合同审核</h1>
        <p className="text-sm text-muted-foreground mt-1">
          企业流程的合同上传、归属部门标记、规则匹配审核将在下一阶段上线。当前可使用快速试用版进行 AI 审核。
        </p>
      </div>
      <Card className="p-6 space-y-3">
        <h2 className="font-semibold">即将推出</h2>
        <ul className="text-sm text-muted-foreground space-y-1.5 list-disc list-inside">
          <li>合同上传时选择归属部门</li>
          <li>一键审核自动匹配本部门规则</li>
          <li>修订、审批、盖章扫描件、归档（仅查看不可下载）</li>
        </ul>
        <Link to="/"><Button variant="outline">前往快速试用版</Button></Link>
      </Card>
    </div>
  );
}
