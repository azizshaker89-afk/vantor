"use client";
import { useTransition } from "react";
import { MailCheck, MailOpen, Reply, Trash2 } from "lucide-react";
import { deleteMessage, setMessageRead } from "@/actions/admin/misc";

export function MessageActions({ id, read, email, name }: { id: string; read: boolean; email: string; name: string }) {
  const [pending, start] = useTransition();
  const b = "flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-smoke hover:text-ink disabled:opacity-40";
  return (
    <div className="flex flex-wrap items-center gap-1">
      <a href={`mailto:${email}?subject=${encodeURIComponent("رد من VANTOR")}&body=${encodeURIComponent(`أهلًا ${name}،\n\n`)}`} onClick={() => !read && start(() => setMessageRead(id, true))} className={b}><Reply className="size-3.5" />رد</a>
      <button disabled={pending} onClick={() => start(() => setMessageRead(id, !read))} className={b}>{read ? <><MailOpen className="size-3.5" />علّمها جديدة</> : <><MailCheck className="size-3.5" />اتقرت</>}</button>
      <button disabled={pending} onClick={() => confirm("حذف الرسالة؟") && start(() => deleteMessage(id))} className={`${b} hover:!text-sale`}><Trash2 className="size-3.5" />حذف</button>
    </div>
  );
}
