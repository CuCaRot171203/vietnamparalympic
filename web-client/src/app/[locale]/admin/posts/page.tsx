"use client";

import { apiClient } from "@/lib/api-client";
import { getApiUrl } from "@/utils/api";

import { useSession } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/hooks/useTranslation";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { generateSlug } from "@/lib/utils";
import dynamic from "next/dynamic";
const TiptapEditor = dynamic(
  () => import("@/components/TiptapEditor").then((m) => m.TiptapEditor),
  {
    ssr: false,
    loading: () => (
      <div className="h-40 bg-gray-100 animate-pulse rounded-md border border-gray-200"></div>
    ),
  },
);
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  X,
  Loader2,
  Upload,
  MessageSquare,
} from "lucide-react";
import { DataTable, ColumnDef } from "@/components/ui/DataTable";
import PostMetadataFields from "@/components/admin/PostMetadataFields";
import { toPostDateInput, fromPostDateInput } from "@/lib/post-dates";
import PostEditorDrawer from "@/components/admin/PostEditorDrawer";
import { Input } from "@/components/ui/Input";
import { Select as AntSelect } from "antd";
import { Textarea } from "@/components/ui/Textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { CommentsModal } from "@/components/admin/CommentsModal";

// next/image available for migration — add unoptimized for dynamic URLs
const translations: Record<string, Record<string, any>> = {
  vi: {
    loading: "Đang tải...",
    searchPlaceholder: "Tìm kiếm tiêu đề hoặc slug...",
    statusFilter: "Tất cả trạng thái",
    statusDraft: "Bản nháp",
    statusPublished: "Đã xuất bản",
    thTitle: "Tiêu đề",
    thStatus: "Trạng thái",
    thDate: "Ngày tạo",
    thActions: "Thao tác",
    alertSaveError: "Có lỗi xảy ra khi lưu bài viết.",
    alertConnError: "Lỗi kết nối máy chủ.",
    colToggle: "Hiển thị cột",
    colChoose: "Chọn cột hiển thị",
    pageSizeLabel: "Hiển thị",
    pageSizeSuffix: "dòng mỗi trang",
    pageDisplay: (start: number, end: number, total: number) =>
      `Hiển thị ${start} - ${end} trên ${total} dòng`,
    noResults: "Không tìm thấy bài viết nào phù hợp.",
    addPost: "Viết bài mới",
    editPost: "Sửa Bài Viết",
    newPost: "Thêm Bài Viết Mới",
    titleLabel: "Tiêu đề",
    slugLabel: "Slug (URL)",
    categoryLabel: "Danh mục",
    statusLabel: "Trạng thái",
    thumbnailLabel: "Ảnh đại diện (Thumbnail)",
    excerptLabel: "Đoạn trích (Mô tả ngắn)",
    contentLabel: "Nội dung (Hỗ trợ HTML)",
    btnCancel: "Hủy",
    btnSave: "Lưu bài viết",
    thSTT: "STT",
    btnDeleteSelected: "Xóa đã chọn",
    confirmBulkDelete: (count: number) =>
      `Bạn có chắc chắn muốn xóa ${count} bài viết đã chọn?`,
  },
  en: {
    loading: "Loading...",
    searchPlaceholder: "Search by title or slug...",
    statusFilter: "All Statuses",
    statusDraft: "Draft",
    statusPublished: "Published",
    thTitle: "Title",
    thStatus: "Status",
    thDate: "Created Date",
    thActions: "Actions",
    alertSaveError: "An error occurred while saving the post.",
    alertConnError: "Server connection error.",
    colToggle: "Show columns",
    colChoose: "Choose columns",
    pageSizeLabel: "Show",
    pageSizeSuffix: "rows per page",
    pageDisplay: (start: number, end: number, total: number) =>
      `Showing ${start} - ${end} of ${total} rows`,
    noResults: "No matching posts found.",
    addPost: "Write new post",
    editPost: "Edit Post",
    newPost: "Add New Post",
    titleLabel: "Title",
    slugLabel: "Slug (URL)",
    categoryLabel: "Category",
    statusLabel: "Status",
    thumbnailLabel: "Thumbnail Image",
    excerptLabel: "Excerpt (Short description)",
    contentLabel: "Content (HTML supported)",
    btnCancel: "Cancel",
    btnSave: "Save post",
    thSTT: "No.",
    btnDeleteSelected: "Delete Selected",
    confirmBulkDelete: (count: number) =>
      `Are you sure you want to delete ${count} selected posts?`,
  },
};

export default function AdminPostsPage() {
  const { data: session, status } = useSession();
  const { language } = useLanguage();
  const tStr = translations[language] || translations.vi;

  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [selectedPostForComments, setSelectedPostForComments] =
    useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentPost, setCurrentPost] = useState<any>({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    categoryId: "",
    status: "DRAFT",
    thumbnail: "",
    tagIds: [],
    authorId: "",
    createdAt: "",
    publishedAt: "",
  });
  const [categories, setCategories] = useState<any[]>([]);
  const [tags, setTags] = useState<{ id: string; name: string }[]>([]);
  const [authors, setAuthors] = useState<{ id: string; fullName: string }[]>(
    [],
  );

  // Modal state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [alertInfo, setAlertInfo] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "danger" | "warning" | "info";
  }>({ isOpen: false, title: "", message: "", type: "danger" });

  // Table tools state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    "title",
    "status",
    "date",
  ]);
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc" | null;
  }>({
    key: "",
    direction: null,
  });

  const handleSort = (key: string) => {
    let direction: "asc" | "desc" | null = "asc";
    if (sortConfig.key === key) {
      if (sortConfig.direction === "asc") {
        direction = "desc";
      } else if (sortConfig.direction === "desc") {
        direction = null;
      }
    }
    setSortConfig({ key, direction });
  };

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === "authenticated") {
      fetchPosts();
      fetchCategories();
      fetchEditorOptions();
    }
  }, [status]);

  // Click outside for column visibility dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowColumnDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset pagination on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, pageSize]);

  const fetchPosts = async () => {
    try {
      const res = await apiClient.request("/posts/admin/all", {
        headers: { Authorization: `Bearer ${(session as any)?.accessToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await apiClient.request("/categories");
      if (res.ok) setCategories(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const fetchEditorOptions = async () => {
    const results = await Promise.allSettled([
      apiClient.request("/tags"),
      apiClient.request("/posts/authors", {
        headers: { Authorization: `Bearer ${(session as any)?.accessToken}` },
      }),
    ]);
    for (let index = 0; index < results.length; index++) {
      const result = results[index];
      if (result.status !== "fulfilled" || !result.value.ok) continue;
      const data = await result.value.json();
      if (Array.isArray(data)) {
        if (index === 0) setTags(data);
        else setAuthors(data);
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const form = new FormData();
    form.append("file", file);

    try {
      const res = await apiClient.request("/media/upload?isPublic=true", {
        method: "POST",
        body: form,
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentPost((prev: any) => ({ ...prev, thumbnail: data.url }));
      } else {
        const errData = await res.json().catch(() => ({}));
        const defaultMsg =
          language === "vi"
            ? "Tải ảnh lên thất bại."
            : "Failed to upload image.";
        const msg = errData.message || defaultMsg;
        setAlertInfo({
          isOpen: true,
          title: "Lỗi tải ảnh",
          message: typeof msg === "object" ? msg[0] : msg,
          type: "danger",
        });
      }
    } catch (err) {
      console.error("Upload error:", err);
      setAlertInfo({
        isOpen: true,
        title: "Lỗi kết nối",
        message:
          language === "vi"
            ? "Lỗi kết nối khi tải ảnh."
            : "Connection error when uploading image.",
        type: "danger",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const isNew = !currentPost.id;
    const url = isNew
      ? getApiUrl("/posts")
      : getApiUrl(`/posts/${currentPost.id}`);
    const method = isNew ? "POST" : "PUT";
    if (!currentPost.categoryId) {
      setAlertInfo({
        isOpen: true,
        title: language === "vi" ? "Thiếu thông tin" : "Missing information",
        message:
          language === "vi"
            ? "Vui lòng chọn danh mục bài viết."
            : "Please choose an article category.",
        type: "warning",
      });
      return;
    }
    setAlertInfo((previous) => ({ ...previous, isOpen: false }));
    setActionLoading(currentPost.id || "new");

    try {
      const payload: any = {
        title: currentPost.title,
        slug: currentPost.slug,
        excerpt: currentPost.excerpt,
        content: currentPost.content,
        status: currentPost.status,
        thumbnail: currentPost.thumbnail || null,
        tagIds: currentPost.tagIds || [],
        ...(currentPost.authorId ? { authorId: currentPost.authorId } : {}),
        ...(currentPost.createdAt
          ? {
              createdAt: fromPostDateInput(
                currentPost.createdAt,
                currentPost.originalCreatedAt,
              ),
            }
          : {}),
        publishedAt:
          fromPostDateInput(
            currentPost.publishedAt || "",
            currentPost.originalPublishedAt,
          ) || null,
      };

      if (currentPost.categoryId) {
        payload.categoryId = currentPost.categoryId;
      }

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${(session as any)?.accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsEditModalOpen(false);
        fetchPosts();
      } else {
        const body = await res.json().catch(() => null);
        const message = Array.isArray(body?.message)
          ? body.message.join(", ")
          : body?.message || body?.error || tStr.alertSaveError;
        setAlertInfo({
          isOpen: true,
          title: "Lỗi lưu bài viết",
          message,
          type: "danger",
        });
      }
    } catch (e) {
      setAlertInfo({
        isOpen: true,
        title: "Lỗi kết nối",
        message: tStr.alertConnError,
        type: "danger",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const requestDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await apiClient.request(`/posts/${deleteId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${(session as any)?.accessToken}` },
      });
      if (res.ok) fetchPosts();
    } catch (e) {
      console.error(e);
    } finally {
      setDeleteId(null);
    }
  };

  const handleBulkDelete = async (
    selectedIds: string[],
    clearSelection: () => void,
  ) => {
    if (
      confirm(
        tStr.confirmBulkDelete
          ? tStr.confirmBulkDelete(selectedIds.length)
          : `Bạn có chắc muốn xóa ${selectedIds.length} mục đã chọn?`,
      )
    ) {
      try {
        const res = await apiClient.request("/posts/bulk-delete", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${(session as any)?.accessToken}`,
          },
          body: JSON.stringify({ ids: selectedIds }),
        });
        if (res.ok) {
          clearSelection();
          fetchPosts();
        } else {
          setAlertInfo({
            isOpen: true,
            title: "Lỗi xóa bài viết",
            message: "Có lỗi xảy ra khi xóa hàng loạt.",
            type: "danger",
          });
        }
      } catch (e) {
        console.error(e);
        setAlertInfo({
          isOpen: true,
          title: "Lỗi",
          message: tStr.alertConnError,
          type: "danger",
        });
      }
    }
  };

  const openEditor = (post?: any) => {
    if (post) {
      setCurrentPost({
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt || "",
        content: post.content,
        categoryId: post.categoryId,
        status: post.status,
        thumbnail: post.thumbnail || "",
        tagIds: (post.tags || []).map((tag: { id: string }) => tag.id),
        authorId: post.authorId || post.author?.id || "",
        authorName: post.author?.fullName || "",
        createdAt: toPostDateInput(post.createdAt),
        publishedAt: toPostDateInput(post.publishedAt),
        originalCreatedAt: post.createdAt,
        originalPublishedAt: post.publishedAt,
        updatedAt: post.updatedAt,
      });
    } else {
      setCurrentPost({
        title: "",
        slug: "",
        excerpt: "",
        content: "",
        categoryId: categories[0]?.id || "",
        status: "DRAFT",
        thumbnail: "",
        tagIds: [],
        authorId: "",
        createdAt: "",
        publishedAt: "",
      });
    }
    setAlertInfo((previous) => ({ ...previous, isOpen: false }));
    setIsEditModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  // Filter posts
  const filteredPosts = posts.filter((post) => {
    const searchLower = searchQuery.toLowerCase();
    const matchSearch =
      post.title.toLowerCase().includes(searchLower) ||
      post.slug.toLowerCase().includes(searchLower);

    const matchStatus =
      statusFilter === "all" ? true : post.status === statusFilter;

    return matchSearch && matchStatus;
  });

  if (sortConfig.key) {
    filteredPosts.sort((a, b) => {
      let aVal: any = "";
      let bVal: any = "";

      switch (sortConfig.key) {
        case "title":
          aVal = a.title || "";
          bVal = b.title || "";
          break;
        case "status":
          aVal = a.status || "";
          bVal = b.status || "";
          break;
        case "date":
          aVal = new Date(a.createdAt).getTime();
          bVal = new Date(b.createdAt).getTime();
          break;
        default:
          aVal = a[sortConfig.key] || "";
          bVal = b[sortConfig.key] || "";
      }

      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }

  // Pagination calculations
  const totalItems = filteredPosts.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedPosts = filteredPosts.slice(startIndex, endIndex);

  const columns: ColumnDef<any>[] = [
    {
      key: "title",
      title: tStr.thTitle,
      sortable: true,
      render: (post) => (
        <div>
          <div className="font-semibold text-blue-600 dark:text-blue-400 line-clamp-1">
            {post.title}
          </div>
          <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            {post.slug}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      title: tStr.thStatus,
      sortable: true,
      render: (post) =>
        post.status === "PUBLISHED" ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            {tStr.statusPublished}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            {post.status === "PENDING"
              ? language === "vi"
                ? "Chờ duyệt"
                : "Pending review"
              : tStr.statusDraft}
          </span>
        ),
    },
    {
      key: "date",
      title: tStr.thDate,
      sortable: true,
      render: (post) => (
        <span className="whitespace-nowrap">
          {new Date(post.createdAt).toLocaleDateString(
            language === "vi" ? "vi-VN" : "en-US",
            { timeZone: "Asia/Ho_Chi_Minh" },
          )}
        </span>
      ),
    },
    {
      key: "actions",
      title: tStr.thActions,
      render: (post) => (
        <div
          className="flex justify-end gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => setSelectedPostForComments(post)}
            className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/30 rounded-lg transition cursor-pointer border-none bg-transparent"
            title="Bình luận"
          >
            <MessageSquare size={16} />
          </button>
          <button
            onClick={() => openEditor(post)}
            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition cursor-pointer border-none bg-transparent"
            title="Sửa"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => requestDelete(post.id)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition cursor-pointer border-none bg-transparent"
            title="Xóa"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  const filterNodes = (
    <Select
      value={statusFilter}
      onValueChange={(value: string) => setStatusFilter(value)}
    >
      <SelectTrigger className="w-full md:w-auto">
        <SelectValue placeholder={tStr.statusFilter} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{tStr.statusFilter}</SelectItem>
        <SelectItem value="DRAFT">{tStr.statusDraft}</SelectItem>
        <SelectItem value="PENDING">
          {language === "vi" ? "Chờ duyệt" : "Pending review"}
        </SelectItem>
        <SelectItem value="PUBLISHED">{tStr.statusPublished}</SelectItem>
      </SelectContent>
    </Select>
  );

  return (
    <div className="space-y-6">
      <DataTable
        data={paginatedPosts}
        columns={columns}
        totalRecords={totalItems}
        page={currentPage}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        sortKey={sortConfig.key}
        sortDirection={sortConfig.direction}
        onSort={handleSort}
        searchPlaceholder={tStr.searchPlaceholder}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        filterNodes={filterNodes}
        onCreate={() => openEditor()}
        createLabel={tStr.addPost}
        isLoading={loading}
        selectable={true}
        getRowId={(row) => row.id}
        bulkActions={(selectedIds, clearSelection) => (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleBulkDelete(selectedIds, clearSelection)}
          >
            <Trash2 size={16} className="mr-2" />
            {tStr.btnDeleteSelected || "Xóa đã chọn"} ({selectedIds.length})
          </Button>
        )}
      />

      <PostEditorDrawer
        key={currentPost.id || "new"}
        open={isEditModalOpen}
        title={currentPost.id ? tStr.editPost : tStr.newPost}
        language={language}
        post={{
          ...currentPost,
          createdAt: fromPostDateInput(
            currentPost.createdAt || "",
            currentPost.originalCreatedAt,
          ),
          publishedAt: fromPostDateInput(
            currentPost.publishedAt || "",
            currentPost.originalPublishedAt,
          ),
          authorName:
            authors.find((author) => author.id === currentPost.authorId)
              ?.fullName ||
            currentPost.authorName ||
            session?.user?.name ||
            "",
        }}
        category={
          categories.find((category) => category.id === currentPost.categoryId)
            ?.name
        }
        saving={actionLoading !== null}
        uploading={uploading}
        error={alertInfo.isOpen ? alertInfo.message : undefined}
        onClose={() => {
          setIsEditModalOpen(false);
          setAlertInfo((previous) => ({ ...previous, isOpen: false }));
        }}
        onSave={handleSave}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              {tStr.titleLabel}
            </label>
            <Input
              required
              type="text"
              value={currentPost.title}
              onChange={(e) => {
                const newTitle = e.target.value;
                if (
                  !currentPost.id &&
                  currentPost.slug === generateSlug(currentPost.title)
                ) {
                  setCurrentPost((previous: any) => ({
                    ...previous,
                    title: newTitle,
                    slug: generateSlug(newTitle),
                  }));
                } else if (!currentPost.slug) {
                  setCurrentPost((previous: any) => ({
                    ...previous,
                    title: newTitle,
                    slug: generateSlug(newTitle),
                  }));
                } else {
                  setCurrentPost((previous: any) => ({
                    ...previous,
                    title: newTitle,
                  }));
                }
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              {tStr.slugLabel}
            </label>
            <Input
              required
              type="text"
              value={currentPost.slug}
              onChange={(e) =>
                setCurrentPost((previous: any) => ({
                  ...previous,
                  slug: e.target.value,
                }))
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              {tStr.categoryLabel}
            </label>
            <AntSelect
              style={{ width: "100%" }}
              aria-label={tStr.categoryLabel}
              showSearch
              optionFilterProp="label"
              placeholder={
                language === "vi" ? "Chọn danh mục" : "Choose category"
              }
              getPopupContainer={(trigger) => trigger.parentElement!}
              value={currentPost.categoryId || undefined}
              onChange={(categoryId) =>
                setCurrentPost((previous: any) => ({ ...previous, categoryId }))
              }
              options={categories.map((category) => ({
                value: category.id,
                label: category.name,
              }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              {tStr.statusLabel}
            </label>
            <AntSelect
              style={{ width: "100%" }}
              aria-label={tStr.statusLabel}
              getPopupContainer={(trigger) => trigger.parentElement!}
              value={currentPost.status}
              onChange={(status) =>
                setCurrentPost((previous: any) => ({ ...previous, status }))
              }
              options={[
                { value: "DRAFT", label: tStr.statusDraft },
                {
                  value: "PENDING",
                  label: language === "vi" ? "Chờ duyệt" : "Pending review",
                },
                { value: "PUBLISHED", label: tStr.statusPublished },
              ]}
            />
          </div>
        </div>

        <PostMetadataFields
          draft={currentPost}
          language={language}
          authors={authors}
          tags={tags}
          onChange={(patch) =>
            setCurrentPost((previous: any) => ({ ...previous, ...patch }))
          }
        />

        <div className="space-y-1">
          <label className="block text-sm font-medium mb-1">
            {tStr.thumbnailLabel}
          </label>
          <Input
            type="text"
            aria-label={
              language === "vi" ? "Đường dẫn ảnh đại diện" : "Thumbnail URL"
            }
            placeholder="/uploads/public/..."
            value={currentPost.thumbnail || ""}
            onChange={(event) =>
              setCurrentPost((previous: any) => ({
                ...previous,
                thumbnail: event.target.value,
              }))
            }
            className="mb-3"
          />
          {currentPost.thumbnail ? (
            <div className="relative w-full h-40 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-900 flex items-center justify-center group shadow-inner max-w-md">
              <img
                src={currentPost.thumbnail}
                alt="Thumbnail preview"
                className="max-h-full max-w-full object-contain"
              />
              <button
                type="button"
                onClick={() =>
                  setCurrentPost({ ...currentPost, thumbnail: "" })
                }
                className="absolute top-2 right-2 p-1.5 bg-rose-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition shadow-md hover:bg-rose-700 cursor-pointer border-none"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <label className="border-2 border-dashed border-slate-205 dark:border-slate-750 hover:border-[color:var(--hover-border-strong)] dark:hover:border-[color:var(--hover-border-strong)] rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition text-slate-500 dark:text-slate-400 max-w-md">
              {uploading ? (
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
              ) : (
                <Upload className="w-8 h-8 text-slate-400 mb-2" />
              )}
              <span className="text-xs font-bold">
                {language === "vi"
                  ? "Tải lên ảnh đại diện"
                  : "Upload thumbnail image"}
              </span>
              <span className="text-[10px] text-slate-400 mt-1">
                {language === "vi"
                  ? "Click để chọn file ảnh"
                  : "Click to select image file"}
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            {tStr.excerptLabel}
          </label>
          <Textarea
            rows={2}
            value={currentPost.excerpt || ""}
            onChange={(e) =>
              setCurrentPost((previous: any) => ({
                ...previous,
                excerpt: e.target.value,
              }))
            }
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            {tStr.contentLabel}
          </label>
          <TiptapEditor
            value={currentPost.content}
            onChange={(html) =>
              setCurrentPost((previous: any) => ({
                ...previous,
                content: html,
              }))
            }
          />
        </div>
      </PostEditorDrawer>

      {/* Modals */}
      <ConfirmModal
        isOpen={deleteId !== null}
        title={language === "vi" ? "Xác nhận xóa" : "Confirm deletion"}
        message={
          language === "vi"
            ? "Bạn có chắc chắn muốn xóa bài viết này? Hành động này không thể hoàn tác."
            : "Are you sure you want to delete this post? This action cannot be undone."
        }
        confirmText={language === "vi" ? "Xóa" : "Delete"}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
        type="danger"
      />

      <ConfirmModal
        isOpen={alertInfo.isOpen && !isEditModalOpen}
        title={alertInfo.title}
        message={alertInfo.message}
        type={alertInfo.type}
        isAlert={true}
        onConfirm={() => setAlertInfo({ ...alertInfo, isOpen: false })}
        onCancel={() => setAlertInfo({ ...alertInfo, isOpen: false })}
      />

      <CommentsModal
        isOpen={!!selectedPostForComments}
        onClose={() => setSelectedPostForComments(null)}
        entityId={selectedPostForComments?.id || ""}
        entityTitle={selectedPostForComments?.title || ""}
        apiEndpoint={getApiUrl(
          `/comments?postId=${selectedPostForComments?.id}`,
        )}
      />
    </div>
  );
}
