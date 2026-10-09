# Hướng dẫn đăng write-up CTF lên blog

Tài liệu này hướng dẫn từng bước cách đưa lời giải các challenge của một giải CTF bạn đã thi
lên trang <https://tringuyen17.github.io/Web_Blog/>.

> **Tóm tắt 5 bước**
>
> 1. Tạo thư mục `src/content/writeups/<ten-giai>/`.
> 2. Tạo file `index.md` trong đó (copy từ `templates/writeup.md`).
> 3. Điền phần thông tin đầu file (frontmatter): tên giải, danh sách challenge.
> 4. Viết lời giải: mỗi challenge là một `## Tên challenge`, mỗi bước là một `### ...`.
> 5. Commit + push lên nhánh `main`. Khoảng 1 phút sau bài tự xuất hiện trên web.

Mục lục:

- [1. Hiểu nhanh cách blog hoạt động](#1-hiểu-nhanh-cách-blog-hoạt-động)
- [2. Chọn cách làm: trên GitHub hay trên máy](#2-chọn-cách-làm-trên-github-hay-trên-máy)
- [3. Bước 1 — Tạo thư mục và file bài viết](#3-bước-1--tạo-thư-mục-và-file-bài-viết)
- [4. Bước 2 — Điền frontmatter](#4-bước-2--điền-frontmatter)
- [5. Bước 3 — Viết lời giải từng challenge](#5-bước-3--viết-lời-giải-từng-challenge)
- [6. Bước 4 — Chèn ảnh, code và các thứ khác](#6-bước-4--chèn-ảnh-code-và-các-thứ-khác)
- [7. Bước 5 — Xem trước và kiểm tra lỗi](#7-bước-5--xem-trước-và-kiểm-tra-lỗi)
- [8. Bước 6 — Đăng lên web](#8-bước-6--đăng-lên-web)
- [9. Thêm challenge vào một bài đã đăng](#9-thêm-challenge-vào-một-bài-đã-đăng)
- [10. Lỗi thường gặp và cách sửa](#10-lỗi-thường-gặp-và-cách-sửa)
- [11. Checklist trước khi đăng](#11-checklist-trước-khi-đăng)
- [12. File mẫu đầy đủ để copy](#12-file-mẫu-đầy-đủ-để-copy)

---

## 1. Hiểu nhanh cách blog hoạt động

- **Mỗi giải CTF = một bài viết = một file Markdown** (`index.md`), nằm trong thư mục riêng ở
  `src/content/writeups/`. Ảnh của bài đặt chung thư mục đó.
- Tên thư mục chính là đường dẫn của bài. Ví dụ thư mục `cscv-2025` → bài ở
  `https://tringuyen17.github.io/Web_Blog/writeups/cscv-2025/`.
- Mỗi lần có commit mới trên nhánh **`main`**, GitHub Actions tự build và đăng lại toàn bộ web
  (workflow "Deploy to GitHub Pages"). Bạn không cần làm gì thêm.
- Từ file Markdown, web **tự tạo**: challenge board (bảng các challenge ở đầu bài), mục lục bên
  trái nhóm theo category, badge category/độ khó/điểm, kết quả tìm kiếm, trang tag, RSS, sitemap.
- Nếu bài viết có lỗi (sai cú pháp, thiếu ảnh...), bước build sẽ **thất bại** và web **giữ nguyên
  bản cũ**. Không có chuyện đăng lỗi làm hỏng cả trang, nên cứ yên tâm thử.

## 2. Chọn cách làm: trên GitHub hay trên máy

| | **Cách A — Ngay trên GitHub (trình duyệt)** | **Cách B — Trên máy tính của bạn** |
| --- | --- | --- |
| Cần cài gì | Không cần gì | Git + Node.js **22.12 trở lên** |
| Xem trước giống hệt web | Không (phải đăng mới thấy) | Có (`npm run dev`, tự tải lại khi lưu file) |
| Hợp với | Bài ngắn, sửa nhanh vài chữ | Bài dài, nhiều ảnh, nhiều code |

### Cách A — Làm trên GitHub

1. Mở <https://github.com/TriNguyen17/Web_Blog>, vào thư mục `src/content/writeups`.
2. Bấm **Add file → Create new file**.
3. Ở ô tên file, gõ `ten-giai-2025/index.md`. Khi gõ dấu `/`, GitHub tự tạo thư mục.
4. Dán nội dung bài (lấy khung ở [mục 12](#12-file-mẫu-đầy-đủ-để-copy)), sửa lại cho đúng giải của bạn.
5. Bấm **Commit changes…**, chọn **Commit directly to the `main` branch**, rồi bấm **Commit changes**.
6. **Thêm ảnh:** vào thư mục `src/content/writeups/ten-giai-2025/`, bấm **Add file → Upload files**,
   kéo ảnh vào, rồi commit. Ảnh nằm cạnh `index.md`, nên trong bài viết `![mô tả](./ten-anh.png)`.
7. **Sửa bài sau này:** mở file `index.md` → bấm biểu tượng bút chì ✏️ → sửa → commit.

> **Mẹo:** đang ở trang repo, bấm phím **`.`** (dấu chấm) để mở *github.dev*, một VS Code chạy
> ngay trong trình duyệt. Ở đó tạo thư mục, kéo thả ảnh, sửa nhiều file cùng lúc tiện hơn nhiều,
> rồi commit ở tab **Source Control** (biểu tượng nhánh cây bên trái).

### Cách B — Làm trên máy

Làm một lần duy nhất:

```bash
git clone https://github.com/TriNguyen17/Web_Blog.git
cd Web_Blog
node -v          # phải là v22.12.0 trở lên
npm install
```

Mỗi lần viết bài:

```bash
git pull                  # lấy bản mới nhất về trước khi viết
npm run dev               # mở http://localhost:4321/ để xem trước
```

Trong lúc `npm run dev` đang chạy, mỗi lần bạn lưu file thì trình duyệt tự cập nhật. Bài của bạn
nằm ở `http://localhost:4321/writeups/<ten-giai>/`. Bấm `Ctrl + C` trong terminal để tắt.

## 3. Bước 1 — Tạo thư mục và file bài viết

**Đặt tên thư mục:** chữ thường, không dấu, dùng gạch ngang thay khoảng trắng, nên có năm.
Ví dụ: `cscv-2025`, `kcsc-ctf-2025`, `picoctf-2025`, `hackthebox-cyber-apocalypse-2025`.

Cấu trúc nên có:

```text
src/content/writeups/
└── cscv-2025/
    ├── index.md          ← bài viết
    └── images/           ← ảnh của bài (tuỳ chọn, có thể để ảnh ngay cạnh index.md)
        ├── ida-main.png
        └── burp-request.png
```

Trên máy, tạo nhanh bằng lệnh (chạy ở thư mục gốc của repo):

```bash
mkdir -p src/content/writeups/cscv-2025/images
cp templates/writeup.md src/content/writeups/cscv-2025/index.md
```

## 4. Bước 2 — Điền frontmatter

Frontmatter là phần nằm giữa hai dòng `---` ở **đầu file**. Nó chứa thông tin của bài và danh sách
challenge để web vẽ challenge board.

```yaml
---
title: 'Write-up CSCV 2025'
description: 'Lời giải 4 challenge RE, Forensics, Web và Crypto của CSCV 2025.'
pubDate: 2025-10-20
tags: ['ctf', 'writeup', 'cscv']
ctf:
  name: 'CSCV 2025'
  url: 'https://ctftime.org/event/0000'
  date: '18–19/10/2025'
  format: 'Jeopardy'
  team: 'b0tnet'
  rank: '12/356'
challenges:
  - name: 'baby-rev'
    category: RE
    difficulty: Easy
    points: 100
    solves: 42
    author: 'abc'
  - name: 'web-101'
    category: Web
    difficulty: Medium
    points: 300
---
```

### Thông tin bài viết

| Trường | Bắt buộc? | Ý nghĩa / cách viết |
| --- | --- | --- |
| `title` | ✅ | Tiêu đề bài. |
| `description` | ✅ | 1–2 câu tóm tắt. Hiện trên thẻ bài ở trang chủ, trong kết quả Google và RSS. |
| `pubDate` | ✅ | Ngày đăng, dạng **`YYYY-MM-DD`** (ví dụ `2025-10-20`). Bài mới nhất hiện đầu tiên. |
| `updatedDate` | | Ngày cập nhật gần nhất, cùng định dạng. Thêm vào khi bạn sửa bài. |
| `tags` | | Danh sách tag, ví dụ `['ctf', 'writeup', 'cscv']`. Mỗi tag có trang riêng ở `/tags/`. Nên viết chữ thường. |
| `draft` | | `true` = bài nháp: **không** hiện trên web thật, chỉ hiện khi chạy `npm run dev`. |
| `cover` | | Ảnh đại diện khi chia sẻ link lên Facebook/Discord, ví dụ `'./images/cover.png'`. |

### Thông tin giải (`ctf:`)

| Trường | Bắt buộc? | Ví dụ |
| --- | --- | --- |
| `name` | ✅ | `'CSCV 2025'` |
| `url` | | Link CTFtime hoặc trang giải. **Phải là link đầy đủ** bắt đầu bằng `https://`. |
| `date` | | `'18–19/10/2025'` (viết tự do) |
| `format` | | `'Jeopardy'`, `'Attack-Defense'`... |
| `team` | | Tên team của bạn |
| `rank` | | `'12/356'` |

### Danh sách challenge (`challenges:`)

Mỗi challenge là một khối bắt đầu bằng `- name:`. Thứ tự trong danh sách không quan trọng.

| Trường | Bắt buộc? | Giá trị hợp lệ |
| --- | --- | --- |
| `name` | ✅ | Tên challenge. **Phải giống tiêu đề `## ...` của challenge đó trong bài** (xem mục 5). |
| `category` | ✅ | Chính xác một trong: `RE`, `Forensics`, `Web`, `Crypto`, `Pwn`, `Misc`, `OSINT`, `Blockchain`, `Mobile`, `Hardware` (đúng chữ hoa/thường). |
| `difficulty` | | `Baby`, `Easy`, `Medium`, `Hard`, `Insane` |
| `points` | ✅ | Số điểm, **số nguyên, không để trong dấu nháy**: `points: 100`, không phải `points: '100'`. |
| `solves` | | Số đội giải được (số nguyên). |
| `author` | | Tác giả đề. |
| `id` | | Chỉ cần khi tiêu đề `##` khác `name` (xem [mục 10](#10-lỗi-thường-gặp-và-cách-sửa)). |

### Quy tắc YAML cần nhớ

- Thụt lề bằng **dấu cách**, không dùng phím Tab. Các dòng con thụt vào 2 dấu cách.
- Chữ có dấu `:` hoặc `#` phải bọc trong nháy đơn: `title: 'Write-up: CSCV 2025'`.
- Trong nháy đơn, muốn viết dấu `'` thì gõ hai lần: `'Tri''s team'`.
- Số (`points`, `solves`) và `true`/`false` (`draft`) **không** bọc nháy.

## 5. Bước 3 — Viết lời giải từng challenge

Đây là phần quan trọng nhất. Web dựa vào **cấp tiêu đề** để dựng mục lục và challenge board.

| Bạn viết | Web hiển thị |
| --- | --- |
| `## baby-rev` (trùng `name` trong frontmatter) | Một challenge: có badge category, độ khó, điểm; một mục trong sidebar; thẻ trên challenge board bấm vào sẽ nhảy tới đây. |
| `### Tìm hiểu về challenge`, `### Phân tích`... | Một bước của challenge. Hiện thành mục con trong sidebar (mở/đóng được). |
| `### Flag` | Bước cuối, được **tô xanh nổi bật**. Tiêu đề chỉ cần **bắt đầu bằng chữ "Flag"**. |
| `####`, `#####` | Tiêu đề nhỏ bình thường, không đưa vào sidebar. |
| `## Lời kết` (không có trong `challenges`) | Một phần thường, nằm trong nhóm "Khác" của sidebar. |

**Không dùng `#` (một dấu thăng)** trong bài, vì `title` đã là tiêu đề lớn nhất của trang.

### Cấu trúc gợi ý cho mỗi challenge

Mỗi challenge nên đi theo thứ tự: **Tìm hiểu → Phân tích → Ý tưởng → PoC → Flag**.

````markdown
## baby-rev

### Tìm hiểu về challenge

> Mô tả đề: "Tìm mật khẩu đúng để lấy flag."
> File đính kèm: `baby-rev` (ELF 64-bit).

Chạy thử chương trình, nó hỏi mật khẩu rồi in `Wrong!`.

### Phân tích

Mở bằng IDA, hàm `main` so sánh input với một chuỗi đã XOR với `0x37`:

![Hàm main trong IDA](./images/ida-main.png)

### Ý tưởng khai thác

XOR ngược chuỗi trong binary với `0x37` là ra mật khẩu.

### Proof-of-concept

```python
enc = bytes.fromhex("71647a")
print(bytes(b ^ 0x37 for b in enc))
```

### Flag

`CSCV{x0r_1s_n0t_3ncrypt10n}`
````

Tên các bước `###` bạn đặt tuỳ ý: `### Recon`, `### Lỗ hổng`, `### Khai thác`... đều được.
Chỉ riêng bước flag nên đặt tên bắt đầu bằng **Flag** để được tô xanh.

### Thứ tự challenge trong bài

Sidebar **nhóm challenge theo category**, theo thứ tự category xuất hiện lần đầu trong bài. Vì vậy
nên viết các challenge **cùng category liền nhau** (ví dụ: hết RE rồi mới tới Web), để thứ tự đọc
khớp với thứ tự trong sidebar.

### Tên challenge phải khớp như thế nào?

Tiêu đề `## ...` và `name` được so sánh **không phân biệt hoa/thường** và bỏ qua khoảng trắng thừa.
Vì vậy `## Baby-Rev` vẫn khớp với `name: 'baby-rev'`. Chỉ cần khác một ký tự (`baby_rev`,
`baby-rev 2`, thêm dấu `!`...) là không khớp: challenge mất badge và thẻ trên board không bấm
được. Cách sửa xem [mục 10](#10-lỗi-thường-gặp-và-cách-sửa).

## 6. Bước 4 — Chèn ảnh, code và các thứ khác

### Ảnh

```markdown
![Request bị chặn trong Burp Suite](./images/burp-request.png)
```

- Luôn dùng **đường dẫn tương đối** bắt đầu bằng `./`. **Không** viết `/images/...`, vì web nằm dưới
  `/Web_Blog/` nên đường dẫn đó sẽ hỏng.
- Đặt tên file **không dấu, không khoảng trắng**: `ida-main.png`, không phải `Ảnh IDA 1.png`.
- **Hoa/thường phải khớp tuyệt đối.** Máy chủ build chạy Linux, nên `IDA.png` và `ida.png` là
  hai file khác nhau, kể cả khi trên Windows vẫn mở được.
- Phần trong `[...]` là mô tả ảnh (alt text) cho người dùng trình đọc màn hình. Nên viết rõ ảnh
  đang cho thấy gì.
- PNG, JPG, WebP, GIF đều được. Web tự nén và tạo nhiều kích thước, nên ảnh chụp màn hình gốc cứ
  để nguyên.

### Code

Bọc code trong ba dấu backtick, kèm tên ngôn ngữ để được tô màu:

````markdown
```python
from pwn import *
io = remote("chall.cscv.vn", 1337)
```
````

Một số tên ngôn ngữ hay dùng: `python`, `c`, `cpp`, `asm` (hoặc `nasm`, `x86asm`), `js`, `php`,
`java`, `go`, `rust`, `bash`, `powershell`, `sql`, `json`, `yaml`, `html`, `diff`. Output của
terminal hoặc dữ liệu thô thì dùng `text`. Mỗi khối code tự có nhãn ngôn ngữ và nút **Copy**.

Code ngắn trong câu thì dùng một backtick: `` `strcmp` ``.

### Các định dạng khác

| Muốn có | Viết |
| --- | --- |
| **Đậm**, *nghiêng* | `**đậm**`, `*nghiêng*` |
| Link | `[CTFtime](https://ctftime.org)` |
| Danh sách | `- ý 1` hoặc `1. bước 1` |
| Trích dẫn đề bài | `> Mô tả đề...` |
| Bảng | dùng `\| cột \| cột \|` như các bảng trong file này |
| Chú thích cuối trang | `câu văn[^1]` và ở cuối: `[^1]: nội dung chú thích` |

> **Lưu ý:** blog **không** hiển thị công thức LaTeX (`$...$`, `$$...$$`). Với công thức toán
> trong Crypto, hãy viết trong khối code (` ```text `) hoặc viết bằng chữ thường, ví dụ
> `c = m^e mod n`.

### File đề (binary, pcap, zip...)

Không nên upload file đề lớn vào repo. Hãy dẫn link tới trang giải, CTFtime, hoặc repo GitHub
chứa đề của ban tổ chức.

## 7. Bước 5 — Xem trước và kiểm tra lỗi

*Chỉ áp dụng cho Cách B. Với Cách A, bạn kiểm tra ở bước 6 qua tab Actions.*

1. Chạy `npm run dev`, mở `http://localhost:4321/writeups/<ten-giai>/` và đọc lại toàn bài:
   - Challenge board ở đầu bài có đủ các challenge, bấm vào thẻ có nhảy đúng chỗ không?
   - Sidebar bên trái có đủ các challenge, đúng nhóm category không?
   - Ảnh có hiện hết không? Bước Flag có được tô xanh không?
2. Trước khi đăng, chạy thử bước build giống hệt máy chủ:

   ```bash
   npm run build
   ```

   - Kết thúc bằng `Complete!` là ổn.
   - Có lỗi thì xem [mục 10](#10-lỗi-thường-gặp-và-cách-sửa).
   - Nếu thấy dòng cảnh báo `No "## heading" found for: ...` thì có challenge bị lệch tên
     (xem mục 10).

## 8. Bước 6 — Đăng lên web

**Cách B (trên máy):**

```bash
git add src/content/writeups/cscv-2025
git commit -m "Add CSCV 2025 write-up"
git push
```

Lệnh `git push` phải đẩy lên nhánh **`main`**. Đẩy lên nhánh khác thì web không cập nhật cho tới
khi nhánh đó được merge vào `main` (qua Pull Request).

**Cách A (trên GitHub):** bấm **Commit changes** vào `main` là xong.

**Theo dõi quá trình đăng:**

1. Mở tab **Actions** của repo: <https://github.com/TriNguyen17/Web_Blog/actions>.
2. Lần chạy mới nhất của **Deploy to GitHub Pages** sẽ có:
   - 🟡 vàng: đang chạy (khoảng 1 phút);
   - ✅ xanh: xong. Mở web, bấm `Ctrl + F5` để tải lại không dùng cache;
   - ❌ đỏ: build lỗi, web vẫn giữ bản cũ. Bấm vào lần chạy → job **build** → bước **Build** để xem
     thông báo lỗi, sửa theo [mục 10](#10-lỗi-thường-gặp-và-cách-sửa), rồi commit lại.

Sau khi đăng, bài tự xuất hiện ở trang chủ, trang Write-ups, ô tìm kiếm (`Ctrl + K`), các trang
tag và RSS.

## 9. Thêm challenge vào một bài đã đăng

Ví dụ sau giải, bạn làm lại được thêm một challenge:

1. Mở `src/content/writeups/<ten-giai>/index.md`.
2. Thêm một khối vào `challenges:` trong frontmatter:

   ```yaml
     - name: 'heap-heaven'
       category: Pwn
       difficulty: Hard
       points: 500
   ```

3. Thêm phần `## heap-heaven` cùng các bước `###` vào thân bài. Nên đặt cạnh các challenge cùng
   category.
4. Thêm hoặc sửa `updatedDate: 2025-10-25` trong frontmatter để người đọc biết bài vừa cập nhật.
5. Commit và push như [bước 6](#8-bước-6--đăng-lên-web).

## 10. Lỗi thường gặp và cách sửa

Đọc dòng lỗi đầu tiên trong terminal (hoặc trong log của tab Actions), sau đó đối chiếu bảng dưới.

| Thông báo lỗi (trích) | Nguyên nhân | Cách sửa |
| --- | --- | --- |
| `challenges.0.category: Invalid option: expected one of "RE"\|"Forensics"\|...` | Sai tên category. Số `0` là challenge thứ nhất (đếm từ 0). | Dùng đúng một trong các giá trị ở mục 4, đúng hoa/thường: `RE` chứ không phải `Reverse` hay `re`. |
| `challenges.0.points: Expected type "number", received "string"` | Điểm bị bọc trong dấu nháy. | `points: 100`, không phải `points: '100'`. |
| `Could not find requested image ./images/abc.png` | Sai đường dẫn ảnh, chưa upload ảnh, hoặc sai hoa/thường. | Kiểm tra tên file và thư mục cho khớp tuyệt đối. |
| `Nested mappings are not allowed in compact mappings` | Có dấu `:` trong chữ mà không bọc nháy. Ví dụ `title: Write-up: CSCV`. | Bọc trong nháy đơn: `title: 'Write-up: CSCV'`. |
| `... data does not match collection schema` + `Required` | Thiếu một trường bắt buộc (`title`, `description`, `pubDate`, `ctf.name`, `name`, `category`, `points`). | Thêm trường bị thiếu (tên trường ghi ngay trong lỗi). |
| `ctf.url: Invalid URL` | `ctf.url` không phải link đầy đủ. | Viết đủ `https://...`. |
| Cảnh báo `No "## heading" found for: abc` | Không có tiêu đề `##` nào khớp với challenge `abc`. | Sửa cho tiêu đề `##` giống `name`, hoặc thêm `id` (xem dưới). |
| Build thành công nhưng không thấy bài | Bài đang `draft: true`, hoặc đẩy nhầm nhánh, hoặc trình duyệt còn cache. | Bỏ `draft: true`; kiểm tra đã push vào `main`; bấm `Ctrl + F5`. |

### Khi tiêu đề challenge buộc phải khác `name`

Ví dụ đề tên `baby rev!` nhưng bạn muốn tiêu đề là `## baby rev (phần 2)`:

1. Mở bài (bằng `npm run dev` hoặc trên web), bấm vào challenge đó trong sidebar.
2. Nhìn thanh địa chỉ: phần sau dấu `#` chính là **id** của tiêu đề, ví dụ `#baby-rev-phần-2`.
3. Thêm `id` vào challenge trong frontmatter:

   ```yaml
     - name: 'baby rev!'
       id: 'baby-rev-phần-2'
       category: RE
       points: 100
   ```

Id được tạo từ tiêu đề: chữ thường, khoảng trắng thành `-`, bỏ dấu câu, **giữ nguyên chữ có dấu
tiếng Việt**.

## 11. Checklist trước khi đăng

- [ ] Giải đã **kết thúc**, và luật của giải cho phép công bố write-up.
- [ ] Không để lộ token, mật khẩu, IP/máy chủ riêng tư trong ảnh hoặc code.
- [ ] Mỗi challenge trong `challenges:` có đúng một `## ...` cùng tên trong bài.
- [ ] `category` viết đúng (`RE`, `Forensics`, `Web`, `Crypto`, `Pwn`, `Misc`, `OSINT`, `Blockchain`, `Mobile`, `Hardware`).
- [ ] `points` là số, không bọc nháy.
- [ ] Mỗi challenge có bước `### Flag`.
- [ ] Ảnh dùng đường dẫn `./...`, tên file khớp hoa/thường.
- [ ] Khối code có tên ngôn ngữ.
- [ ] Đã bỏ `draft: true` (nếu muốn đăng thật).
- [ ] `npm run build` chạy xong với `Complete!` (Cách B), hoặc tab Actions báo ✅ (Cách A).

> **Về bài nháp:** `draft: true` chỉ ẩn bài khỏi **trang web**. File vẫn nằm trong repo GitHub, và
> nếu repo để public thì ai cũng đọc được. Đừng commit write-up của giải **đang diễn ra**, kể cả
> dưới dạng nháp. Hãy để file đó trên máy cho tới khi giải kết thúc.

## 12. File mẫu đầy đủ để copy

Copy toàn bộ khối dưới vào `src/content/writeups/<ten-giai>/index.md`, rồi thay nội dung trong
`<...>`. File `templates/writeup.md` trong repo cũng có khung tương tự.

````markdown
---
title: 'Write-up <Tên giải> <Năm>'
description: '<Tóm tắt 1–2 câu: giải gì, mấy challenge, category nào.>'
pubDate: 2025-01-31
tags: ['ctf', 'writeup', '<ten-giai>']
ctf:
  name: '<Tên giải> <Năm>'
  url: 'https://ctftime.org/event/0000'
  date: '30–31/01/2025'
  format: 'Jeopardy'
  team: '<tên team>'
  rank: '10/300'
challenges:
  - name: '<challenge-1>'
    category: RE
    difficulty: Easy
    points: 100
    solves: 50
  - name: '<challenge-2>'
    category: Web
    difficulty: Medium
    points: 300
---

Vài dòng mở đầu (tuỳ chọn): giải diễn ra thế nào, team làm được gì, cảm nhận chung...

## <challenge-1>

### Tìm hiểu về challenge

> <Mô tả đề bài>

<File đính kèm, hành vi ban đầu của chương trình/trang web...>

### Phân tích

<Bạn đã tìm ra điều gì. Chèn ảnh nếu cần:>

![<Mô tả ảnh>](./images/<ten-anh>.png)

### Ý tưởng khai thác

<Hướng giải và lý do.>

### Proof-of-concept

```python
# script giải
```

### Flag

`FLAG{...}`

## <challenge-2>

### Tìm hiểu về challenge

### Phân tích

### Ý tưởng khai thác

### Proof-of-concept

```bash
curl -s "https://chall.example/?q=..."
```

### Flag

`FLAG{...}`

## Lời kết

<Bài học rút ra, lời cảm ơn ban tổ chức...>
````

---

Một bài mẫu hoàn chỉnh có sẵn trong repo để tham khảo cách trình bày:
`src/content/writeups/greenbyte-ctf-2025/index.md` (đang hiển thị tại
<https://tringuyen17.github.io/Web_Blog/writeups/greenbyte-ctf-2025/>).
