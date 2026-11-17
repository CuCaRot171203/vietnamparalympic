"use client";
import { DatePicker, Select } from "antd";
import dayjs from "dayjs";
import viVN from "antd/es/date-picker/locale/vi_VN";
import enGB from "antd/es/date-picker/locale/en_GB";
import { toPostDateInput } from "@/lib/post-dates";

type Draft = {
  id?: string;
  authorId?: string;
  authorName?: string;
  tagIds?: string[];
  createdAt?: string;
  publishedAt?: string;
  updatedAt?: string;
};
export default function PostMetadataFields({
  draft,
  language,
  authors,
  tags,
  onChange,
}: {
  draft: Draft;
  language: string;
  authors: { id: string; fullName: string }[];
  tags: { id: string; name: string }[];
  onChange: (patch: Partial<Draft>) => void;
}) {
  const vi = language === "vi";
  const authorOptions = [
    ...new Map(
      [
        ...authors,
        ...(draft.authorId && draft.authorName
          ? [{ id: draft.authorId, fullName: draft.authorName }]
          : []),
      ].map((author) => [author.id, author]),
    ).values(),
  ];
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            {vi ? "Tác giả" : "Author"}
          </label>
          <Select
            style={{ width: "100%" }}
            getPopupContainer={(trigger) => trigger.parentElement!}
            showSearch
            optionFilterProp="label"
            aria-label={vi ? "Tác giả" : "Author"}
            value={draft.authorId || undefined}
            placeholder={
              vi ? "Mặc định: người tạo bài" : "Default: current author"
            }
            onChange={(authorId) => onChange({ authorId })}
            options={authorOptions.map((author) => ({
              value: author.id,
              label: author.fullName,
            }))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            {vi ? "Thẻ bài viết" : "Tags"}
          </label>
          <Select
            style={{ width: "100%" }}
            getPopupContainer={(trigger) => trigger.parentElement!}
            mode="multiple"
            allowClear
            showSearch
            optionFilterProp="label"
            aria-label={vi ? "Thẻ bài viết" : "Tags"}
            placeholder={vi ? "Chọn thẻ" : "Choose tags"}
            value={draft.tagIds || []}
            onChange={(tagIds) => onChange({ tagIds })}
            options={tags.map((tag) => ({ value: tag.id, label: tag.name }))}
          />
        </div>
      </div>
      <fieldset className="space-y-3 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
        <legend className="px-2 text-sm font-medium">
          {vi ? "Thời gian bài viết · UTC+7" : "Article dates · UTC+7"}
        </legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="post-created-at"
              className="block text-sm font-medium mb-1"
            >
              {vi ? "Thời gian đăng / Ngày tạo" : "Post / creation date"}
            </label>
            <DatePicker
              id="post-created-at"
              style={{ width: "100%" }}
              locale={vi ? viVN : enGB}
              showTime
              format="DD/MM/YYYY HH:mm:ss"
              inputReadOnly
              allowClear={!draft.id}
              placeholder={vi ? "Chọn ngày giờ đăng" : "Select post date"}
              getPopupContainer={(trigger) => trigger.parentElement!}
              value={draft.createdAt ? dayjs(draft.createdAt) : null}
              onChange={(value) =>
                onChange({
                  createdAt: value?.format("YYYY-MM-DDTHH:mm:ss") || "",
                })
              }
            />
          </div>
          <div>
            <label
              htmlFor="post-published-at"
              className="block text-sm font-medium mb-1"
            >
              {vi ? "Thời gian xuất bản" : "Publication date"}
            </label>
            <DatePicker
              id="post-published-at"
              style={{ width: "100%" }}
              locale={vi ? viVN : enGB}
              showTime
              format="DD/MM/YYYY HH:mm:ss"
              inputReadOnly
              allowClear
              placeholder={
                vi ? "Chọn ngày giờ xuất bản" : "Select publication date"
              }
              getPopupContainer={(trigger) => trigger.parentElement!}
              value={draft.publishedAt ? dayjs(draft.publishedAt) : null}
              onChange={(value) =>
                onChange({
                  publishedAt: value?.format("YYYY-MM-DDTHH:mm:ss") || "",
                })
              }
            />
          </div>
        </div>
        <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          {vi
            ? "Ngày tạo để trống khi thêm mới sẽ dùng thời điểm lưu. Thời gian xuất bản để trống sẽ dùng thời điểm chuyển sang Đã xuất bản. Bài đã xuất bản công khai ngay, không hẹn giờ theo mốc này."
            : "An empty creation date defaults to save time for a new post. An empty publication date defaults to the time of publishing. Published posts are public immediately; this date is not a schedule."}
        </p>
        {draft.updatedAt && (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {vi
              ? "Cập nhật gần nhất (tự động): "
              : "Last updated (automatic): "}
            {toPostDateInput(draft.updatedAt).replace("T", " ")}
          </p>
        )}
      </fieldset>
    </>
  );
}
