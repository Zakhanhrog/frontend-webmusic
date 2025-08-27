# Interview Q&A

## 📌 Câu hỏi

### 1. Java Core
- Hãy giải thích sự khác biệt giữa `abstract class` và `interface` trong Java. Cho ví dụ thực tế khi bạn sẽ chọn cái nào.

### 2. Spring Boot
- Bạn hãy mô tả cơ chế Dependency Injection trong Spring Boot và cho biết Spring Boot quản lý vòng đời Bean như thế nào.

### 3. React
- React Hook là gì? Hãy giải thích cụ thể cách hoạt động của `useEffect` và một ví dụ khi dùng sai `useEffect` sẽ gây ra bug gì.

### 4. Tổng hợp (Back-end)
- Trong Spring Boot, khi bạn viết API thì sẽ xử lý Exception như thế nào để trả về thông điệp rõ ràng cho client?

### 5. Tổng hợp (Fullstack)
- Nếu API của Spring Boot trả dữ liệu lớn (ví dụ: danh sách hàng chục nghìn bản ghi), bạn sẽ tối ưu hiển thị ở React và tối ưu query ở Spring Boot như thế nào?

---

## 📌 Câu trả lời

### 1. Java Core
`abstract class` có thể chứa cả phương thức abstract và non-abstract, có thể có state (biến instance), còn `interface` chỉ chứa khai báo hành vi (từ Java 8 trở đi có default và static method). Dùng `abstract class` khi các lớp con có quan hệ gần gũi và chia sẻ state/logic chung; dùng `interface` khi muốn định nghĩa hợp đồng cho nhiều lớp không liên quan.

Ví dụ: `Animal` (abstract class) có sẵn biến `age`, còn `Comparable` (interface) chỉ định nghĩa hành vi `compareTo()`.

---

### 2. Spring Boot
Dependency Injection (DI) là cơ chế Spring tự động tạo và cung cấp dependency cho Bean thay vì developer phải new thủ công. Spring Boot quản lý vòng đời Bean qua **IoC Container**, Bean được tạo (instantiate) → dependency được inject → Bean sẵn sàng dùng → cuối cùng được destroy khi container tắt. Các scope (`singleton`, `prototype`, `request`, `session`) quyết định vòng đời cụ thể.

---

### 3. React
React Hook là các hàm đặc biệt giúp functional component có state và lifecycle. `useEffect` chạy side-effect (fetch API, DOM manipulation, subscription...).
- Nếu truyền mảng rỗng `[]` → chạy 1 lần khi mount.
- Nếu không truyền dependency → chạy sau mỗi render.
- Nếu truyền `[var]` → chạy khi `var` thay đổi.

Bug thường gặp: quên truyền dependency, dẫn đến vòng lặp render vô hạn khi `setState` trong `useEffect`.

---

### 4. Tổng hợp (Back-end)
Trong Spring Boot, Exception Handling có thể dùng `@ControllerAdvice` kết hợp `@ExceptionHandler` để bắt và trả về JSON thông báo rõ ràng. Ví dụ: nếu `UserNotFoundException` được ném, controller advice sẽ trả `ResponseEntity` với HTTP status 404 và message: `{ "error": "User not found" }`. Điều này giúp client hiểu lỗi thay vì nhận stacktrace.

---

### 5. Tổng hợp (Fullstack)
- **Spring Boot (Back-end):** dùng phân trang (`Pageable`), giới hạn số bản ghi trả về, thêm filter, caching.
- **React (Front-end):** hiển thị lazy load hoặc infinite scroll, chỉ render phần dữ liệu nhìn thấy, dùng virtualization (ví dụ: `react-window`, `react-virtualized`).

Nhờ vậy client không bị treo vì DOM quá lớn, server không bị quá tải vì trả dữ liệu khổng lồ.
