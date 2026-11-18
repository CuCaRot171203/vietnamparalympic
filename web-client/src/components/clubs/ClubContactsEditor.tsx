"use client";
import { Plus, Trash2 } from "lucide-react";
import type { ClubContact } from "@/lib/organizations";

export default function ClubContactsEditor({
  value,
  onChange,
  language,
}: {
  value: ClubContact[];
  onChange: (value: ClubContact[]) => void;
  language: string;
}) {
  const vi = language === "vi";
  const update = (index: number, patch: Partial<ClubContact>) =>
    onChange(
      value.map((contact, i) =>
        i === index ? { ...contact, ...patch } : contact,
      ),
    );
  const input =
    "w-full min-w-0 rounded-xl border border-[var(--club-border,#e5e7eb)] bg-[var(--club-surface,var(--background))] px-3 py-2 text-sm text-[var(--club-text,var(--foreground))]";
  return (
    <fieldset className="space-y-3 rounded-2xl border border-[var(--club-border,#e5e7eb)] p-4">
      <legend className="px-2 text-sm font-semibold">
        {vi ? "Người phụ trách câu lạc bộ" : "Club coordinators"}
      </legend>
      <p className="text-xs text-[var(--club-muted,var(--muted-foreground))]">
        {vi
          ? "Mỗi người có tên, vai trò và số điện thoại riêng. Thông tin này sẽ hiển thị công khai trên trang CLB."
          : "Add each person’s name, role and phone. These details appear publicly on the club page."}
      </p>
      {value.map((contact, index) => (
        <div
          key={index}
          className="space-y-2 rounded-xl border border-[var(--club-border,#e5e7eb)] p-3"
        >
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-medium">
              {vi ? "Người phụ trách" : "Coordinator"} {index + 1}
            </span>
            <button
              type="button"
              onClick={() => onChange(value.filter((_, i) => i !== index))}
              aria-label={`${vi ? "Xóa người phụ trách" : "Remove coordinator"} ${index + 1}`}
              className="p-2 text-red-600"
            >
              <Trash2 size={16} />
            </button>
          </div>
          <label className="block text-xs">
            {vi ? "Họ và tên" : "Full name"}
            <input
              required
              maxLength={160}
              className={input}
              value={contact.name}
              onChange={(e) => update(index, { name: e.target.value })}
            />
          </label>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <label className="block text-xs">
              {vi ? "Vai trò / chức vụ" : "Role"}
              <input
                maxLength={160}
                className={input}
                value={contact.role}
                onChange={(e) => update(index, { role: e.target.value })}
              />
            </label>
            <label className="block text-xs">
              {vi ? "Số điện thoại" : "Phone"}
              <input
                required
                type="tel"
                maxLength={40}
                className={input}
                value={contact.phone}
                onChange={(e) => update(index, { phone: e.target.value })}
              />
            </label>
          </div>
        </div>
      ))}
      <button
        type="button"
        disabled={value.length >= 20}
        onClick={() => onChange([...value, { name: "", role: "", phone: "" }])}
        className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm disabled:opacity-50"
      >
        <Plus size={16} />
        {vi ? "Thêm người phụ trách" : "Add coordinator"}
      </button>
    </fieldset>
  );
}
