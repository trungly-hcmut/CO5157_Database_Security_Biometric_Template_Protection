# Fuzzy Extractors are Practical — Group 3 paper presentation

Bilingual (EN / VI) web slide deck presenting Shukla et al., *Fuzzy Extractors are Practical: Cryptographic Strength Key Derivation from the Iris*, ACM CCS '25 (doi:10.1145/3719027.3765098) — with a 6-question review quiz and a Kahoot join card.

Bộ slide web song ngữ (Anh / Việt) trình bày bài báo trên, kèm 6 câu hỏi ôn tập có hiệu ứng và thẻ tham gia Kahoot.

**Nhóm 3:** Ngô Nhất Toàn · Lê Công Tú · Lý Minh Trung

## Mở và trình chiếu

**Online:** https://trungly-hcmut.github.io/CO5157_Database_Security_Biometric_Template_Protection/paper/

Hoặc mở `index.html` bằng trình duyệt, không cần build hay server.

| Phím | Tác dụng |
|---|---|
| `→` `Space` `PageDown` | Slide tiếp. **Ở câu hỏi ôn tập: bấm lần đầu hiện đáp án, lần sau sang câu kế** |
| `←` `PageUp` | Slide trước |
| `A`–`D` hoặc `1`–`4` | Chọn đáp án |
| `L` | Đổi EN ↔ VI |
| `T` | Sáng / tối |
| `M` | Mục lục |
| `F` | Toàn màn hình |
| `K` hoặc `Enter` | Ở slide clip demo: phát / dừng |

**Tham số URL:** `?lang=vi`, `?theme=dark`, `#/12` (tới slide 12), `#quiz` (tới câu hỏi ôn tập), `?reveal` (hiện sẵn đáp án), `?check` (báo slide bị tràn chữ), `?pin=123456` (mã PIN Kahoot).

**Kahoot:** slide "Câu hỏi ôn tập" có thẻ Kahoot. Khi mở phòng chơi, bấm ✎ cạnh "Mã PIN trò chơi" để nhập PIN (trình duyệt sẽ nhớ), QR tự tạo theo PIN. Hoặc mở link với `?pin=…`.

**Xuất PDF:** nút tải xuống trên thanh công cụ (hoặc `Ctrl/Cmd + P` → *Save as PDF*). Đáp án quiz được hiện sẵn trong PDF.

**Clip demo (phần 6.2):** phát lại một lần chạy thật của feap-demo (output và thời gian thật, đoạn chờ dài hơn 1 s tua nhanh ×4, có ghi chú trên màn hình). Bấm vào một chương trên thanh tiến trình để nhảy tới. Bản video nằm ở `assets/video/feap-demo-en.mp4` và `feap-demo-vi.mp4`. Ghi lại lần chạy mới: trong `feap-demo/` chạy `python3 scripts/record_demo.py ../g3-btp-slides/paper` (cập nhật `assets/js/demo-cast.js`; các con số trong clip tự lấy theo bản ghi mới).

## Chỉnh sửa nội dung

Nội dung nằm trong `src/*.html`, viết song ngữ bằng cú pháp rút gọn:

```html
<p>[[English text||Văn bản tiếng Việt]]</p>
```

Sửa xong thì chạy `python3 build.py` để tạo lại `index.html`. Script báo lỗi nếu còn sót `[[ ]]` hay `||`.

| Muốn sửa | File |
|---|---|
| Nội dung slide | `src/00-front.html` (bìa, mục lục, phần 1–2), `src/10-blocks.html` (phần 3–4), `src/20-results.html` (phần 5–7), `src/30-back.html` (Q&A, ôn tập, tài liệu tham khảo) |
| Câu hỏi ôn tập | `assets/js/quiz.js` (mảng `QUIZ`) |
| Nhãn mục ở đầu slide | `assets/js/deck.js` (`SECTIONS`) |
| Giao diện | `assets/css/paper.css` |
| Hình mống mắt trang bìa | `assets/js/iris.js` |
| Clip demo (chương, chú thích) | `assets/js/clip.js`; dữ liệu ghi lại: `assets/js/demo-cast.js` |

Sau khi sửa, mở `index.html?check` để kiểm tra slide có bị tràn chữ không.

## Hình

- `assets/img/fig*.png` — hình nhóm vẽ trong Raw Report (Hình 2.1–4.6), dùng nguyên bản.
- `assets/img/paper-fig*.png` — hình gốc của paper (Fig. 3a/3b/3c, 4, 5, 6).
- `assets/img/demo-*.png` — hình N1–N4 từ demo của nhóm (`feap-demo/`).

## Nguồn

Nội dung theo *Raw Report – G3 Paper Presentation: Fuzzy Extractors are Practical (final)*. Code của paper: github.com/whyamey/feap (GPL-3.0). Thư viện QR: qrcode-generator (MIT, Kazuhiko Arase).
