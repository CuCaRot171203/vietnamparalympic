# Cập nhật trang bộ môn và thumbnail, giữ dữ liệu cũ

Thay đổi database duy nhất: thêm cột `Sport.thumbnail` (nullable). Migration không xóa bản ghi hoặc sửa icon/nội dung cũ. Không chạy seed, reset, `db push --force-reset`, hay `docker compose down -v`.

## 1. Sao lưu trên VPS

Đứng trong `/opt/vietnam-parasport-web` và giữ nguyên `.env`, thư mục `api-server/uploads`, volume PostgreSQL.

```bash
mkdir -p /root/parasports-backups
docker compose exec -T db pg_dump -U postgres -d vn_paralympic_sport > "/root/parasports-backups/before-sports-$(date +%F-%H%M%S).sql"
```

Kiểm tra lệnh backup thành công trước khi tiếp tục. Backup ảnh upload riêng nếu cần bảo vệ toàn bộ nội dung media.

## 2. Kéo code và build trước khi thay container

```bash
git pull --ff-only origin main
docker compose build api
docker compose build web
```

## 3. Thêm cột trước khi chạy API mới

Nếu database đã được quản lý đầy đủ bằng Prisma migrations:

```bash
docker compose run --rm --no-deps api npx prisma migrate deploy
```

Nếu server trước đây khởi tạo bằng `prisma db push` và chưa có lịch sử migration, không reset database để xử lý P3005. Có thể áp dụng riêng SQL bổ sung an toàn của lần cập nhật này:

```bash
docker compose exec -T db psql -v ON_ERROR_STOP=1 -U postgres -d vn_paralympic_sport < api-server/prisma/migrations/20261117000000_sport_thumbnail/migration.sql
```

Lệnh SQL chỉ thêm cột nếu chưa có; không thiết lập hay thay đổi lịch sử Prisma migrations. Chọn cách phù hợp với cách server đang quản lý schema, không chạy cả hai một cách máy móc.

## 4. Khởi động lại API và FE

```bash
docker compose up -d --no-deps api web
docker compose ps
docker compose logs --tail=80 api web
```

Kiểm tra bài bộ môn cũ vẫn hiển thị, sửa một bộ môn để kiểm tra icon/thumbnail, rồi Ctrl+F5 trên trình duyệt. Bộ môn cũ chưa có thumbnail vẫn sử dụng ảnh dự phòng. Trường tiếng Anh vẫn không bắt buộc.
