"use client";

import { useRef, useState } from "react";
import { Button, Checkbox, Empty, Grid, Popover, Table, Tooltip } from "antd";
import type { TableColumnsType } from "antd";
import { Columns3, X } from "lucide-react";
import { useLanguage } from "@/hooks/useTranslation";
import type { DataTableProps } from "@/components/ui/DataTable/DataTable";
import { TableToolbar } from "@/components/ui/DataTable/TableToolbar";

export default function AdminDataTable<T>(props: DataTableProps<T>) {
  type Row = T & Record<string, unknown>;
  const { language } = useLanguage();
  const vi = language === "vi";
  const screens = Grid.useBreakpoint();
  const [visibility, setVisibility] = useState<Record<string, boolean>>({});
  const [selected, setSelected] = useState<React.Key[]>([]);
  const [columnsOpen, setColumnsOpen] = useState(false);
  const fallbackKeys = useRef(new WeakMap<object, string>());
  const nextKey = useRef(0);
  const visible = props.columns.filter(
    (column) => visibility[column.key] ?? !column.hidden,
  );
  const clearSelection = () => setSelected([]);
  const rowKey = (row: Row) => {
    if (props.getRowId) return props.getRowId(row);
    if (row.id != null) return String(row.id);
    if (!fallbackKeys.current.has(row))
      fallbackKeys.current.set(row, `row-${++nextKey.current}`);
    return fallbackKeys.current.get(row)!;
  };
  const columns: TableColumnsType<Row> = visible.map((column) => ({
    key: column.key,
    dataIndex: column.key,
    title: column.title,
    fixed: column.key === "actions" && screens.md ? "right" : undefined,
    width: column.key === "actions" ? 190 : undefined,
    sorter: column.sortable && !!props.onSort,
    sortOrder:
      props.sortKey === column.key
        ? props.sortDirection === "asc"
          ? "ascend"
          : props.sortDirection === "desc"
            ? "descend"
            : null
        : null,
    render: (_value: unknown, row: Row, index: number) =>
      column.render ? column.render(row, index) : String(row[column.key] ?? ""),
  }));
  const columnVisibility = (
    <Popover
      placement="bottomRight"
      trigger="click"
      open={columnsOpen}
      onOpenChange={setColumnsOpen}
      title={vi ? "Cột hiển thị" : "Visible columns"}
      content={
        <div
          style={{
            display: "grid",
            gap: 12,
            maxHeight: 320,
            overflowY: "auto",
            paddingBlock: 8,
          }}
        >
          {props.columns.map((column) => (
            <Checkbox
              key={column.key}
              checked={visibility[column.key] ?? !column.hidden}
              onChange={(event) =>
                setVisibility((previous) => ({
                  ...previous,
                  [column.key]: event.target.checked,
                }))
              }
            >
              {column.title}
            </Checkbox>
          ))}
        </div>
      }
    >
      <Tooltip title={vi ? "Chọn cột hiển thị" : "Choose columns"}>
        <Button
          className="admin-columns-trigger"
          aria-label={vi ? "Chọn cột hiển thị" : "Choose columns"}
          icon={<Columns3 size={16} />}
        />
      </Tooltip>
    </Popover>
  );
  return (
    <div className="admin-data-table">
      <TableToolbar
        searchPlaceholder={props.searchPlaceholder}
        searchValue={props.searchValue}
        onSearchChange={
          props.onSearchChange
            ? (value) => {
                props.onPageChange(1);
                props.onSearchChange?.(value);
              }
            : undefined
        }
        filterNodes={props.filterNodes}
        onCreate={props.onCreate}
        createLabel={props.createLabel}
        onExport={props.onExport}
        exportNode={props.exportNode}
        columnVisibilityNode={columnVisibility}
      />
      {props.selectable && props.bulkActions && selected.length > 0 && (
        <div className="admin-table-bulk">
          <strong>
            {selected.length} {vi ? "đã chọn" : "selected"}
          </strong>
          {props.bulkActions(selected.map(String), clearSelection)}
          <Button
            type="text"
            size="small"
            icon={<X size={14} />}
            onClick={clearSelection}
          >
            {vi ? "Bỏ chọn" : "Clear"}
          </Button>
        </div>
      )}
      <Table<Row>
        rowKey={rowKey}
        columns={columns}
        dataSource={props.data as Row[]}
        loading={props.isLoading}
        scroll={{ x: "max-content" }}
        showSorterTooltip={false}
        rowSelection={
          props.selectable
            ? {
                selectedRowKeys: selected,
                onChange: (keys) => setSelected(keys),
                preserveSelectedRowKeys: true,
                columnWidth: 48,
              }
            : undefined
        }
        onRow={(row) => ({
          onClick: (event) => {
            if (
              !event.currentTarget.contains(event.target as Node) ||
              (event.target as HTMLElement).closest(
                "button,a,input,select,textarea,label,[role=checkbox],[role=switch],[role=combobox]",
              )
            )
              return;
            props.onRowClick?.(event, row);
          },
          style: props.onRowClick ? { cursor: "pointer" } : undefined,
        })}
        onChange={(_pagination, _filters, sorter, extra) => {
          if (extra.action === "sort") {
            const item = Array.isArray(sorter) ? sorter[0] : sorter;
            if (item.columnKey) props.onSort?.(String(item.columnKey));
          }
        }}
        pagination={{
          current: props.page,
          pageSize: props.pageSize,
          total: props.totalRecords,
          showSizeChanger: true,
          pageSizeOptions: [...new Set([10, 20, 50, 100, props.pageSize])].sort(
            (a, b) => a - b,
          ),
          showQuickJumper: true,
          showLessItems: true,
          onChange: (page: number, size: number) => {
            if (size !== props.pageSize) {
              props.onPageSizeChange(size);
              props.onPageChange(1);
            } else props.onPageChange(page);
          },
          showTotal: (total: number, range: [number, number]) =>
            vi
              ? `${total ? range[0] : 0}–${range[1]} / ${total.toLocaleString("vi-VN")} bản ghi`
              : `${total ? range[0] : 0}–${range[1]} of ${total.toLocaleString("en-GB")} records`,
        }}
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                vi ? "Không có dữ liệu phù hợp" : "No matching records"
              }
            />
          ),
          triggerAsc: vi ? "Sắp xếp tăng dần" : "Sort ascending",
          triggerDesc: vi ? "Sắp xếp giảm dần" : "Sort descending",
          cancelSort: vi ? "Bỏ sắp xếp" : "Clear sorting",
        }}
      />
    </div>
  );
}
