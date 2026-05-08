import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

interface Props {
  seals: any[];
  userEmail: string;
}

export default function ArchiveViewer({ seals, userEmail }: Props) {
  const [urls, setUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    (async () => {
      const out: Record<string, string> = {};
      for (const s of seals) {
        const { data } = await supabase.storage.from("contract-scans").createSignedUrl(s.file_path, 600);
        if (data?.signedUrl) out[s.id] = data.signedUrl;
      }
      setUrls(out);
    })();
  }, [seals]);

  // Disable right-click globally within viewer
  const block = (e: React.SyntheticEvent) => { e.preventDefault(); return false; };

  const watermark = `${userEmail} · ${new Date().toLocaleString()}`;

  return (
    <div className="space-y-3" onContextMenu={block} onDragStart={block}>
      <Card className="p-3 bg-amber-50 dark:bg-amber-950/30 border-amber-300 flex items-center gap-2 text-sm">
        <AlertTriangle className="w-4 h-4 text-amber-600" />
        <span>归档合同仅可查看，禁止下载、复制或截屏。系统已记录访问日志。</span>
      </Card>

      {seals.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">暂无归档的扫描件</Card>
      ) : (
        seals.map((s) => (
          <Card key={s.id} className="p-3 space-y-2">
            <p className="text-sm font-medium">{s.file_name}</p>
            <div
              className="relative overflow-hidden rounded border bg-muted select-none"
              style={{ userSelect: "none" }}
            >
              {urls[s.id] ? (
                /\.(png|jpe?g|gif|webp)$/i.test(s.file_name) ? (
                  <img
                    src={urls[s.id]}
                    alt={s.file_name}
                    className="w-full pointer-events-none"
                    onContextMenu={block}
                    draggable={false}
                  />
                ) : (
                  <iframe
                    src={urls[s.id]}
                    title={s.file_name}
                    className="w-full h-[600px]"
                  />
                )
              ) : (
                <div className="p-8 text-center text-sm text-muted-foreground">加载中…</div>
              )}
              {/* 水印层 */}
              <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-6 opacity-30">
                {Array.from({ length: 18 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-center">
                    <span className="text-xs text-muted-foreground rotate-[-30deg] whitespace-nowrap">
                      {watermark}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
