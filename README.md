# CO5157 · Database Security — Biometric Template Protection (Group 3)

**Slides:** https://trungly-hcmut.github.io/CO5157_Database_Security_Biometric_Template_Protection/

Bilingual (EN / VI) web slide deck for Group 3, Database Security: Biometric Template Protection, with an interactive 15-question quiz (VietBank scenario) at the end.

Bộ slide web song ngữ (Anh / Việt) của Nhóm 3 môn Bảo mật CSDL về chủ đề Bảo vệ mẫu sinh trắc học, cuối deck có quiz tương tác 15 câu (kịch bản VietBank).

**Group:** Ngô Nhất Toàn · Lê Công Tú · Lý Minh Trung

---

## Bật GitHub Pages

1. Vào **Settings → Pages → Build and deployment** của repo, chọn *Deploy from a branch*, branch `main`, folder `/ (root)`, rồi bấm **Save**.
2. Sau khoảng 1 phút, trang có tại https://trungly-hcmut.github.io/CO5157_Database_Security_Biometric_Template_Protection/

Không cần build. Có thể mở trực tiếp `index.html` bằng trình duyệt để xem thử.

## Trình chiếu

| Phím | Tác dụng |
|---|---|
| `→` `Space` `PageDown` | Slide tiếp. **Ở câu quiz: lần bấm đầu hiện đáp án, lần sau mới sang câu kế** |
| `←` `PageUp` | Slide trước |
| `A`–`D` hoặc `1`–`4` | Chọn đáp án ở câu quiz |
| `R` | Hiện đáp án |
| `L` | Đổi EN ↔ VI |
| `T` | Sáng / tối |
| `M` | Mục lục |
| `F` | Toàn màn hình |
| `Home` / `End` | Slide đầu / cuối |

Bút trình chiếu (clicker) dùng được luôn, vì nó gửi phím `PageDown` / `PageUp`. Thanh công cụ ở góc dưới phải sẽ tự ẩn khi không di chuột.

**Tham số URL:** `?lang=vi`, `?theme=dark`, `#/12` (tới slide 12), `#quiz` (tới phần quiz), `?reveal` (hiện sẵn mọi đáp án), `?check` (báo slide bị tràn chữ, xem trong console).

**Xuất PDF:** bấm nút tải xuống trên thanh công cụ (hoặc `Ctrl/Cmd + P`), chọn *Save as PDF*, khổ giấy tự đặt 16:9. Trong bản PDF, đáp án quiz được hiện sẵn.

**Điện thoại:** tự chuyển sang chế độ cuộn dọc. Nút ▭▭ trên thanh công cụ cũng bật/tắt chế độ này trên máy tính.

## Chỉnh sửa nội dung

| Muốn sửa | File |
|---|---|
| Nội dung slide | `index.html`: mỗi đoạn có cặp `<span class="en">…</span><span class="vi">…</span>` |
| Câu hỏi quiz | `assets/js/quiz.js` (mảng `QUIZ`, mỗi câu có `en` và `vi`) |
| Nhãn mục ở đầu mỗi slide | `assets/js/deck.js` (`SECTIONS`) |
| Biểu đồ và hình vẽ | `assets/js/figures.js` (SVG sinh bằng JS, tự đổi màu theo giao diện sáng/tối) |
| Giao diện | `assets/css/deck.css` |

Sau khi sửa, mở `index.html?check` để kiểm tra slide có bị tràn không.

## Cấu trúc

```
index.html              78 slides (63 slide cố định + 15 câu quiz do quiz.js chèn vào)
assets/css/deck.css     giao diện, chế độ điện thoại, in PDF, animation quiz
assets/js/deck.js       điều hướng, EN/VI, sáng/tối, mục lục
assets/js/figures.js    hình SVG: FAR/FRR, Cartesian/Polar/Functional, Fuzzy Vault, biểu đồ kết quả
assets/js/quiz.js       dữ liệu và logic quiz
assets/img/             biểu đồ xuất từ notebook G3_BTP_demo.ipynb
```

## Nguồn

Nội dung theo báo cáo nhóm (bản Outlines mới nhất) và `quiz.pdf`. Danh mục tài liệu tham khảo nằm ở slide *References*. Số liệu thực nghiệm lấy từ notebook `G3_BTP_demo.ipynb` (Google Colab, seed 2026).

cd "/Users/lyminhtrung/VSCode/Database Security/g3-btp-slides"
git config --global user.name "Lý Minh Trung"
git config --global user.email "trung3566@gmail.com"
git commit -m "Add G3 Biometric Template Protection slide deck"
git push