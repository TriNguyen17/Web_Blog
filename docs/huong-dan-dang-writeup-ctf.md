# Hướng dẫn đăng write-up CTF lên blog

Tài liệu này hướng dẫn từng bước cách đưa lời giải các challenge của một giải CTF bạn đã thi
lên trang <https://tringuyen17.github.io/Web_Blog/>.

> **Tóm tắt 6 bước** (chi tiết ở các mục "Bước 1" → "Bước 6" bên dưới)
>
> 1. Tạo thư mục `src/content/writeups/<ten-giai>/` và file `index.md` trong đó.
> 2. Điền phần thông tin đầu file (frontmatter): tên giải, danh sách challenge.
> 3. Viết lời giải: mỗi challenge là một `## Tên challenge`, mỗi bước là một `### ...`.
> 4. Chèn ảnh, code.
> 5. Xem trước và kiểm tra lỗi.
> 6. Đăng: commit vào nhánh `main`. Khoảng 1–2 phút sau bài tự xuất hiện trên web.

Mục lục:

- [1. Hiểu nhanh cách blog hoạt động](#1-hiểu-nhanh-cách-blog-hoạt-động)
- [2. Chuẩn bị: làm trên GitHub hay trên máy](#2-chuẩn-bị-làm-trên-github-hay-trên-máy)
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

- **Mỗi giải CTF = một bài viết = một file Markdown** (`index.md`) nằm trong thư mục riêng ở
  `src/content/writeups/`. Ảnh của bài đặt chung thư mục đó.
- Tên thư mục chính là đường dẫn của bài. Ví dụ thư mục `cscv-2025` thì bài nằm ở
  `https://tringuyen17.github.io/Web_Blog/writeups/cscv-2025/`.
- Từ file Markdown, web **tự tạo** những thứ sau:
  - challenge board, tức bảng các challenge ở đầu bài;
  - **sidebar**, tức mục lục bên trái, nhóm các challenge theo category;
  - badge category, độ khó và điểm;
  - kết quả tìm kiếm, trang tag, RSS.
- Mỗi lần có commit mới trên nhánh **`main`**, GitHub Actions tự build và đăng lại toàn bộ web
  (workflow "Deploy to GitHub Pages"). Bạn không cần làm gì thêm.
- **Lỗi nặng thì không làm hỏng web.** Frontmatter sai hoặc thiếu ảnh làm bước build **thất bại**,
  và web **giữ nguyên bản cũ** cho tới khi bạn sửa xong.
- **Lỗi nhẹ thì vẫn được đăng.** Gõ sai Markdown hoặc tên challenge lệch với tiêu đề không làm build
  thất bại: bài vẫn lên web, chỉ hiển thị sai. Vì vậy sau mỗi lần đăng, hãy mở bài ra xem lại.
- Repo này đang để **public**: file nào đã commit thì ai cũng đọc được trên GitHub, kể cả bài nháp.
  Chỉ commit write-up khi giải **đã kết thúc**.

Vài từ sẽ gặp:

- **commit**: lưu một mốc thay đổi, kèm một dòng ghi chú.
- **push**: gửi các commit từ máy lên GitHub. Làm trên GitHub thì không cần bước này.
- **build**: biến các file Markdown thành trang web.
- **nhánh `main`**: bản chính của repo, cũng là bản được đăng lên web.

## 2. Chuẩn bị: làm trên GitHub hay trên máy

| | **Cách A — Ngay trên GitHub (trình duyệt)** | **Cách B — Trên máy tính của bạn** |
| --- | --- | --- |
| Cần cài gì | Không cần gì | Git + Node.js **22.12 trở lên** |
| Xem trước trước khi đăng | Không (đăng xong mới thấy) | Có (`npm run dev`, tự tải lại khi lưu file) |
| Báo lỗi | Trong tab Actions sau khi đăng | Ngay trên máy, trước khi đăng |
| Hợp với | Bài ngắn, sửa nhanh vài chữ | Bài dài, nhiều ảnh, nhiều code |

### Cách A — Làm trên GitHub

**Cách dễ nhất là dùng github.dev** (VS Code chạy trong trình duyệt):

1. Mở <https://github.com/TriNguyen17/Web_Blog>, bấm phím **`.`** (dấu chấm).
2. Ở cây thư mục bên trái, chuột phải vào `src/content/writeups` → **New Folder** → đặt tên thư mục
   (ví dụ `cscv-2025`). Trong thư mục đó, chuột phải → **New File** → `index.md`.
3. Dán khung bài ở [mục 12](#12-file-mẫu-đầy-đủ-để-copy) và viết bài.
4. Kéo thả ảnh từ máy vào thư mục bài (có thể tạo thư mục con `images/`).
5. Bấm biểu tượng **Source Control** (hình nhánh cây) ở thanh bên trái, gõ ghi chú vào ô
   Message, rồi bấm **Commit & Push**. Bài, ảnh và mọi thay đổi được đăng cùng lúc.

**Hoặc dùng giao diện GitHub thường:**

1. Vào thư mục `src/content/writeups`, bấm **Add file → Create new file**.
2. Ở ô tên file, gõ `cscv-2025/index.md`. Gõ dấu `/` thì GitHub tự tạo thư mục.
3. Dán khung bài ở [mục 12](#12-file-mẫu-đầy-đủ-để-copy), sửa cho đúng giải của bạn. **Chưa chèn ảnh
   ở bước này**, vì ảnh chưa được upload. Để dòng ảnh lúc này thì lần build đó sẽ báo lỗi ❌.
4. Bấm **Commit changes…**, chọn **Commit directly to the `main` branch**, bấm **Commit changes**.
5. **Upload ảnh:** mở thư mục `src/content/writeups/cscv-2025/`, bấm **Add file → Upload files**,
   kéo ảnh vào, rồi commit. Ảnh sẽ nằm **ngay cạnh** `index.md` (không có thư mục `images/`), nên
   trong bài phải viết `![mô tả](./ten-anh.png)`, **không** phải `./images/ten-anh.png`.
6. Mở `index.md` → bấm biểu tượng bút chì ✏️ → thêm các dòng ảnh → commit.

### Cách B — Làm trên máy

**Cài đặt (một lần duy nhất):**

1. Cài **Git**: <https://git-scm.com/downloads>.
2. Cài **Node.js** bản LTS: <https://nodejs.org/> (cần 22.12 trở lên).
3. Mở **terminal** (cửa sổ gõ lệnh):
   - Windows: mở **Git Bash**, được cài kèm Git, tìm trong menu Start. Đừng dùng CMD, vì CMD không
     chạy được các lệnh như `cp`, `mkdir -p` trong tài liệu này. Trong Git Bash, dán bằng
     `Shift + Insert` hoặc chuột phải → Paste.
   - macOS/Linux: mở app **Terminal**.
   - Gõ từng dòng rồi Enter. Phần sau dấu `#` chỉ là ghi chú, không cần gõ.
4. Khai báo tên và email cho git (dùng email của tài khoản GitHub). Thiếu bước này thì lần
   `git commit` đầu tiên sẽ báo `Author identity unknown`.

   ```bash
   git config --global user.name "Tên của bạn"
   git config --global user.email "email-tai-khoan-github@example.com"
   git config --global rebase.autoStash true   # để git pull --rebase không bị chặn khi đang sửa dở
   ```

5. Tải repo về và cài thư viện:

   ```bash
   git clone https://github.com/TriNguyen17/Web_Blog.git
   cd Web_Blog
   node -v          # phải in ra v22.12.0 trở lên
   npm install
   ```

**Mỗi lần viết bài:**

```bash
cd Web_Blog          # vào thư mục repo (mỗi lần mở terminal mới)
git pull --rebase    # lấy bản mới nhất từ GitHub về trước khi viết
npm run dev          # chạy web trên máy để xem trước
```

`npm run dev` in ra một địa chỉ, thường là `http://localhost:4321/`. Bài của bạn nằm ở
`http://localhost:4321/writeups/<ten-giai>/`.

- Mỗi lần lưu file, trình duyệt tự cập nhật.
- `npm run dev` chiếm luôn cửa sổ terminal đó. Muốn gõ lệnh khác thì mở **thêm một cửa sổ terminal**
  và `cd Web_Blog` ở đó. Bấm `Ctrl + C` để tắt `npm run dev`.
- **Nếu sửa mà trình duyệt không thay đổi**, hãy nhìn terminal. Khi frontmatter bị lỗi, trình duyệt
  vẫn hiện bản cũ mà không báo gì; lỗi chỉ in ra trong terminal.
- Nếu báo `Another astro dev server is already running`, nghĩa là một cửa sổ terminal khác đang chạy
  nó rồi: dùng luôn địa chỉ đó, hoặc tắt nó đi.
- Nếu sau `git pull` mà `npm run dev` báo `Cannot find module` hay `Cannot find package`, chạy lại
  `npm install`.

## 3. Bước 1 — Tạo thư mục và file bài viết

**Đặt tên thư mục:** chữ thường, không dấu, gạch ngang thay khoảng trắng, nên có năm. Ví dụ:
`cscv-2025`, `kcsc-ctf-2025`, `picoctf-2025`.

```text
src/content/writeups/
└── cscv-2025/
    ├── index.md          ← bài viết
    └── images/           ← ảnh của bài (tuỳ chọn, có thể để ảnh ngay cạnh index.md)
        ├── ida-main.png
        └── burp-request.png
```

- Trong `src/content/writeups/` **chỉ để** `index.md` và ảnh. File `.md`/`.mdx` nào khác (ghi chú,
  README của đề...) cũng bị coi là một bài viết riêng và làm build lỗi.

**Cách B:** tạo nhanh bằng lệnh dưới, chạy trong thư mục `Web_Blog` (thư mục có file
`package.json`). Nhớ đổi `cscv-2025` thành tên thư mục của bạn:

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
| `pubDate` | ✅ | Ngày đăng, **bắt buộc dạng `YYYY-MM-DD`** (năm-tháng-ngày), ví dụ `2025-10-20`. Viết `20/10/2025` sẽ bị báo lỗi. Bài mới nhất hiện đầu tiên. |
| `updatedDate` | | Ngày cập nhật gần nhất, cũng dạng `YYYY-MM-DD`. Thêm vào khi sửa bài. |
| `tags` | | Danh sách tag, ví dụ `['ctf', 'writeup', 'cscv']`. Mỗi tag có trang riêng ở `/tags/`. Nên viết chữ thường. |
| `draft` | | `true` là bài nháp: **không** hiện trên web, chỉ hiện khi chạy `npm run dev`. |
| `cover` | | Ảnh đại diện, hiện trên thẻ bài (trang chủ, trang Write-ups, trang tag) và khi chia sẻ link lên Facebook/Discord. Ví dụ `'./images/cover.png'`. File phải có thật. |

### Thông tin giải (`ctf:`)

Chỉ `name` là bắt buộc. Các dòng `url`, `date`, `format`, `team`, `rank` không dùng thì xoá.
Riêng `url` phải là link đầy đủ, bắt đầu bằng `https://`.

### Danh sách challenge (`challenges:`)

Mỗi challenge là một khối bắt đầu bằng `- name:`. Trong cùng một category, các thẻ trên challenge
board xếp theo thứ tự của danh sách này, nên hãy liệt kê **theo đúng thứ tự bạn viết trong bài**.

| Trường | Bắt buộc? | Giá trị hợp lệ |
| --- | --- | --- |
| `name` | ✅ | Tên challenge. **Phải giống tiêu đề `## ...` của challenge đó trong bài** (xem [Bước 3](#5-bước-3--viết-lời-giải-từng-challenge)). |
| `category` | ✅ | Chính xác một trong: `RE`, `Forensics`, `Web`, `Crypto`, `Pwn`, `Misc`, `OSINT`, `Blockchain`, `Mobile`, `Hardware`. Đúng chữ hoa/thường. |
| `difficulty` | | Chính xác một trong: `Baby`, `Easy`, `Medium`, `Hard`, `Insane`. Đúng chữ hoa/thường: viết `easy` sẽ bị báo lỗi. |
| `points` | ✅ | Số điểm, **số nguyên, không bọc nháy**: `points: 100`. Viết `'100'` hay `100 pts` đều bị báo lỗi. |
| `solves` | | Số đội giải được (số nguyên). |
| `author` | | Tác giả đề. |
| `id` | | Chỉ cần khi tiêu đề `##` buộc phải khác `name` (xem [mục 10](#10-lỗi-thường-gặp-và-cách-sửa)). |

### Quy tắc YAML cần nhớ

- Thụt lề bằng **dấu cách**, không dùng phím Tab. Mỗi cấp thụt vào 2 dấu cách. Các dòng `- name:`
  phải thẳng cột với nhau.
- **Chữ thì luôn bọc nháy đơn**, kể cả khi toàn số: `name: '2048'`, `rank: '12'`. Viết `rank: 12`
  sẽ bị báo lỗi.
- **Số** (`points`, `solves`) và `true`/`false` (`draft`) thì **không** bọc nháy.
- Chữ có dấu `:` hoặc `#` bắt buộc phải bọc nháy. Quên với `:` thì build báo lỗi. Quên với `#` thì
  **không** báo lỗi, nhưng mất luôn phần từ `#` trở đi (`title: CTF #1` thành `CTF`).
- Trong nháy đơn, muốn viết dấu `'` thì gõ hai lần: `'Tri''s team'`. Hoặc bọc bằng nháy kép:
  `"Tri's team"`.

## 5. Bước 3 — Viết lời giải từng challenge

Đây là phần quan trọng nhất. Web dựa vào **cấp tiêu đề** để dựng sidebar và challenge board.

| Bạn viết | Web hiển thị |
| --- | --- |
| `## baby-rev` (trùng `name` trong frontmatter) | Một challenge, có badge category, độ khó, điểm. Nó là một mục trong sidebar, và thẻ trên challenge board bấm vào sẽ nhảy tới đây. |
| `### Tìm hiểu về challenge`, `### Phân tích`... | Một bước của challenge, hiện thành mục con trong sidebar (mở/đóng được). |
| `### Flag` | Bước cuối, được **tô xanh nổi bật**. |
| `####`, `#####` | Tiêu đề nhỏ bình thường, không đưa vào sidebar. |
| `## Lời kết` (không có trong `challenges`) | Một phần thường, nằm trong nhóm "Khác" của sidebar. |

**Không dùng `#` (một dấu thăng)** trong bài, vì `title` đã là tiêu đề lớn nhất của trang.

### Cấu trúc gợi ý cho mỗi challenge

Mỗi challenge nên đi theo thứ tự: **Tìm hiểu → Phân tích → Ý tưởng → PoC → Flag**.

````markdown
## baby-rev

### Tìm hiểu về challenge

> Mô tả đề: "Tìm mật khẩu đúng để lấy flag."
>
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

**Bước Flag** có hai quy tắc:

- Tiêu đề phải bắt đầu bằng **từ "Flag"**, hoa/thường đều được: `### Flag`, `### Flag:`, `### flag 1`.
  Còn `### Flags`, `### Lấy flag` hay `### 🚩 Flag` thì **không** được tô xanh.
- Viết flag trong cặp backtick, ví dụ `` `CSCV{...}` ``. Như vậy flag mới nằm trong khung xanh và
  giữ nguyên từng ký tự. Viết trơn thì web có thể tự đổi `--` thành `—`, hay `'` thành `’`.

### Thứ tự challenge trong bài

Sidebar **nhóm challenge theo category**, theo thứ tự category xuất hiện lần đầu trong bài. Vì vậy
nên viết các challenge **cùng category liền nhau** (ví dụ hết RE rồi mới tới Web), để thứ tự đọc khớp
với thứ tự trong sidebar.

### Tên challenge phải khớp như thế nào?

Tiêu đề `## ...` và `name` được so sánh **không phân biệt hoa/thường**. Khi so sánh, web bỏ qua
khoảng trắng thừa và các dấu nháy (`'`, `"`). Vì vậy `## Baby-Rev` vẫn khớp với `name: 'baby-rev'`,
và `## Baby's First Pwn` khớp với `name: "Baby's First Pwn"`.

Ngoài những trường hợp đó, chỉ cần khác một ký tự (`baby_rev`, `baby-rev 2`, thêm dấu `!`...) là
không khớp. Khi đó:

- challenge không có badge;
- thẻ trên board bị mờ và không bấm được;
- trong sidebar, challenge rơi xuống nhóm "Khác".

Cách sửa xem [mục 10](#10-lỗi-thường-gặp-và-cách-sửa).

## 6. Bước 4 — Chèn ảnh, code và các thứ khác

### Ảnh

```markdown
![Request bị chặn trong Burp Suite](./images/burp-request.png)
```

- Luôn dùng **đường dẫn tương đối** bắt đầu bằng `./` (ảnh trong `images/` thì `./images/...`, ảnh
  ngay cạnh `index.md` thì `./ten-anh.png`).
- **Không** viết `/images/...`. Build vẫn báo `Complete!`, nhưng ảnh bị vỡ trên web.
- Đặt tên file **không dấu, không khoảng trắng**: `ida-main.png`, không phải `Ảnh IDA 1.png`. Tên có
  khoảng trắng thì ảnh không hiện, chỉ hiện nguyên dòng chữ `![...](...)`, và build cũng không báo
  lỗi.
- **Hoa/thường phải khớp tuyệt đối.** Máy chủ build chạy Linux, nên `IDA.png` và `ida.png` là hai
  file khác nhau. Trên Windows/macOS, `npm run build` vẫn có thể chạy được dù sai, nhưng máy chủ
  sẽ báo lỗi.
- Muốn đổi tên file mà chỉ khác hoa/thường, dùng lệnh `git mv IDA.png ida.png`. Đổi trong File
  Explorer hay Finder thì git không nhận ra.
- Phần trong `[...]` là mô tả ảnh (alt text) cho người dùng trình đọc màn hình. Nên viết rõ ảnh
  đang cho thấy gì.
- PNG, JPG, WebP, GIF, AVIF, SVG đều được. Khi build, web tự chuyển ảnh sang WebP cho nhẹ, nên ảnh
  chụp màn hình cứ để nguyên.

### Code

Bọc code trong ba dấu backtick, kèm tên ngôn ngữ để được tô màu:

````markdown
```python
from pwn import *
io = remote("chall.cscv.vn", 1337)
```
````

Một số tên ngôn ngữ hay dùng: `python`, `c`, `cpp`, `asm` (hoặc `nasm`, `x86asm`), `js`, `php`,
`java`, `go`, `rust`, `bash`, `powershell`, `sql`, `json`, `yaml`, `html`, `diff`.

- Output của terminal hoặc dữ liệu thô thì dùng `text`.
- Mỗi khối code tự có nhãn ngôn ngữ và nút **Copy**.
- Tên ngôn ngữ lạ (ví dụ `sage`, `gdb`) không làm hỏng build, chỉ khiến khối code hiện không màu.
  Với SageMath có thể dùng `python`.
- Code ngắn trong câu thì dùng một backtick: `` `strcmp` ``.

### Các định dạng khác

| Muốn có | Viết |
| --- | --- |
| **Đậm**, *nghiêng* | `**đậm**`, `*nghiêng*` |
| Link ra ngoài | `[CTFtime](https://ctftime.org)` |
| Link tới bài khác trong blog | `[bài GreenByte](../greenbyte-ctf-2025/)`. **Không** viết `/writeups/...`, vì lên web sẽ lỗi 404. |
| Danh sách | `- ý 1` hoặc `1. bước 1` |
| Trích dẫn đề bài | `> Mô tả đề...`. Muốn xuống dòng trong trích dẫn thì chèn một dòng chỉ có `>`. |
| Chú thích cuối trang | `câu văn[^1]`, và ở cuối bài: `[^1]: nội dung chú thích`. |
| Bảng | xem ví dụ ngay dưới đây |

```markdown
| Cột 1 | Cột 2 |
| --- | --- |
| a | b |
```

Dòng `| --- | --- |` là bắt buộc, thiếu nó thì bảng không hiện.

> **Lưu ý:** blog **không** hiển thị công thức LaTeX (`$...$`, `$$...$$`). Với công thức toán
> trong Crypto, hãy viết trong khối code (` ```text `) hoặc viết bằng chữ thường, ví dụ
> `c = m^e mod n`.

### File đề (binary, pcap, zip...)

Không nên upload file đề lớn vào repo. Hãy dẫn link tới trang giải, CTFtime, hoặc repo GitHub chứa
đề của ban tổ chức.

## 7. Bước 5 — Xem trước và kiểm tra lỗi

**Kiểm tra bằng mắt.** Ý này áp dụng cho cả hai cách: Cách B xem trên `npm run dev`; Cách A đợi tab
Actions báo ✅ ([Bước 6](#8-bước-6--đăng-lên-web)) rồi mở bài trên web.

- Challenge board ở đầu bài có đủ các challenge không? Thẻ nào **mờ** là challenge đó lệch tên.
- Bấm từng thẻ, xem có nhảy đúng chỗ không.
- Sidebar có đủ các challenge, đúng nhóm category không?
- Ảnh có hiện hết không? Bước Flag có được tô xanh không?

**Chạy thử build (chỉ Cách B).** Trước khi đăng, chạy bước build giống máy chủ:

```bash
npm run build
```

- Kết thúc bằng `Complete!` nghĩa là **không có lỗi nặng**. Nếu có lỗi, xem [mục 10](#10-lỗi-thường-gặp-và-cách-sửa).
- Riêng cảnh báo `No "## heading" found for: ...` thì **không** làm build dừng, và rất dễ bị trôi
  giữa log. Nó dính ngay sau dòng `/writeups/<ten-giai>/index.html`. Hãy kéo lên tìm dòng này.

## 8. Bước 6 — Đăng lên web

**Cách A:** bấm **Commit changes** (hoặc **Commit & Push** trong github.dev) vào nhánh `main` là xong.

**Cách B:** chạy lần lượt (nhớ đổi `cscv-2025` thành thư mục của bạn):

```bash
git add src/content/writeups/cscv-2025
git commit -m "Add CSCV 2025 write-up"
git pull --rebase    # lấy thay đổi mới trên GitHub (nếu có) về trước
git push
```

- Repo clone về đã ở sẵn nhánh **`main`**. Muốn chắc thì chạy `git status`: dòng đầu phải là
  `On branch main`. Đẩy lên nhánh khác thì web không cập nhật.
- **Lần `git push` đầu tiên**, Git sẽ hỏi đăng nhập GitHub.
  - Trên Windows, một cửa sổ đăng nhập sẽ hiện ra: đăng nhập là xong.
  - Nếu terminal hỏi `Username`/`Password`, **đừng** nhập mật khẩu GitHub, vì GitHub không nhận
    mật khẩu ở đây. Có hai cách:
    - Tạo token ở GitHub → **Settings → Developer settings → Personal access tokens → Tokens
      (classic)** (chọn quyền `repo`), rồi dán token vào ô `Password`.
    - Hoặc cài GitHub CLI (<https://cli.github.com/>) và chạy `gh auth login` một lần.
- Nếu `git push` báo `! [rejected] main -> main (fetch first)`, nghĩa là trên GitHub có commit mà
  máy bạn chưa có (ví dụ bạn vừa sửa bài trên web). Chạy `git pull --rebase` rồi `git push` lại.
- Nếu `git pull --rebase` báo `CONFLICT`, nghĩa là cùng một đoạn đã bị sửa ở cả hai nơi. Cách xử lý:
  1. Mở file được nêu tên, tìm đoạn nằm giữa `<<<<<<<` và `>>>>>>>`.
  2. Giữ lại nội dung đúng, xoá 3 dòng đánh dấu.
  3. Chạy `git add <tên-file>`, rồi `git -c core.editor=true rebase --continue`, rồi `git push`.

**Theo dõi quá trình đăng:**

1. Mở tab **Actions** của repo: <https://github.com/TriNguyen17/Web_Blog/actions>.
2. Xem lần chạy mới nhất của **Deploy to GitHub Pages**:
   - 🟡 vàng: đang chạy (khoảng 1–2 phút).
   - ✅ xanh: xong. Mở bài trên web và bấm `Ctrl + F5` (macOS: `Cmd + Shift + R`) để tải lại không
     dùng cache. Kiểm tra lại bằng mắt như ở [Bước 5](#7-bước-5--xem-trước-và-kiểm-tra-lỗi).
   - ❌ đỏ: build lỗi, web vẫn giữ bản cũ. Bấm vào lần chạy → job **build** → bước **Build** để xem
     thông báo lỗi. Sửa theo [mục 10](#10-lỗi-thường-gặp-và-cách-sửa) rồi commit lại.

Sau khi đăng, bài tự xuất hiện ở trang chủ, trang Write-ups, ô tìm kiếm (`Ctrl + K`), các trang tag
và RSS.

## 9. Thêm challenge vào một bài đã đăng

Ví dụ sau giải, bạn làm lại được thêm một challenge:

1. Mở `src/content/writeups/<ten-giai>/index.md`.
2. Thêm một khối vào **cuối** danh sách `challenges:`, ngay **trên** dòng `---` thứ hai. Giữ 2 dấu
   cách ở đầu dòng `- name:` để dấu `-` thẳng cột với các challenge cũ:

   ```yaml
     - name: 'heap-heaven'
       category: Pwn
       difficulty: Hard
       points: 500
   ```

3. Thêm phần `## heap-heaven` cùng các bước `###` vào thân bài, đặt cạnh các challenge cùng category.
4. Thêm (hoặc sửa) dòng `updatedDate: 2025-10-25` ngay dưới dòng `pubDate`, **sát lề trái** (không
   đặt trong `ctf:` hay `challenges:`), để người đọc biết bài vừa cập nhật.
5. Đăng như [Bước 6](#8-bước-6--đăng-lên-web).

## 10. Lỗi thường gặp và cách sửa

Đọc dòng lỗi đầu tiên trong terminal (hoặc trong log của tab Actions), rồi đối chiếu bảng dưới.

- Lỗi YAML thường ghi kèm `at line X, column Y`: X là số dòng trong file `index.md` của bạn.
- Lỗi kiểu `challenges.0...` thì số `0` là challenge thứ nhất trong danh sách (đếm từ 0).

| Thông báo lỗi (trích) | Nguyên nhân | Cách sửa |
| --- | --- | --- |
| `challenges.0.category: Invalid option: expected one of "RE"\|"Forensics"\|...` | Sai tên category. | Dùng đúng một trong các giá trị ở [Bước 2](#4-bước-2--điền-frontmatter), đúng hoa/thường: `RE` chứ không phải `Reverse` hay `re`. |
| `challenges.0.difficulty: Invalid option: expected one of "Baby"\|"Easy"\|...` | Sai độ khó hoặc sai hoa/thường (`easy`). | Dùng đúng `Baby`, `Easy`, `Medium`, `Hard`, `Insane`. |
| ``challenges.0.points: Expected type `"number"`, received `"string"` `` | Điểm bị bọc nháy hoặc có chữ (`'100'`, `100 pts`). | `points: 100`. |
| ``ctf.rank: Expected type `"string"`, received `"number"` `` | Trường chữ toàn số mà không bọc nháy (`rank: 12`, `name: 2048`...). | Bọc nháy đơn: `rank: '12'`. |
| `pubDate: Ngày phải viết dạng YYYY-MM-DD` | Ngày viết sai dạng, ví dụ `20/10/2025`. | `pubDate: 2025-10-20`. |
| `title: Required`, `description: Required`... | Thiếu một trường bắt buộc. | Thêm trường đó. Nếu báo thiếu **cùng lúc nhiều trường** dù bạn đã viết đủ, nghĩa là thiếu dòng `---` ở đầu hoặc cuối frontmatter. |
| `ctf.url: Invalid URL` | `ctf.url` không phải link đầy đủ. | Viết đủ `https://...`. |
| `Could not find requested image ./images/abc.png` | Sai đường dẫn ảnh, chưa upload ảnh, hoặc sai hoa/thường. | Kiểm tra tên file và thư mục cho khớp tuyệt đối (xem [Bước 4](#6-bước-4--chèn-ảnh-code-và-các-thứ-khác)). |
| `Nested mappings are not allowed in compact mappings` | Có dấu `:` trong chữ mà không bọc nháy, ví dụ `title: Write-up: CSCV`. | Bọc nháy đơn: `title: 'Write-up: CSCV'`. |
| `Tabs are not allowed as indentation` | Thụt lề bằng phím Tab. | Xoá Tab, thụt lề bằng dấu cách (2 dấu cách mỗi cấp). |
| `A block sequence may not be used as an implicit map key` hoặc `All sequence items must start at the same column` | Dòng `- name:` thụt lề lệch so với các challenge khác (hay gặp khi thêm challenge mới). | Cho dấu `-` thẳng cột với các dòng `- name:` khác. |
| `Unexpected scalar at node end` | Có dấu `'` bên trong chuỗi bọc nháy đơn, ví dụ `'Tri's team'`. | Gõ hai lần `'Tri''s team'`, hoặc dùng nháy kép `"Tri's team"`. |
| Cảnh báo `No "## heading" found for: abc` (build **vẫn thành công**) | Không có tiêu đề `##` nào khớp với challenge `abc`. Thẻ trên board bị mờ. | Sửa tiêu đề `##` cho giống `name`, hoặc thêm `id` (xem dưới). |
| Tab Actions báo ✅ (hoặc không có lần chạy mới) nhưng không thấy bài | Bài đang `draft: true`; đẩy nhầm nhánh (khi đó workflow không chạy); hoặc trình duyệt còn cache. | Bỏ `draft: true`; kiểm tra đã push vào `main`; bấm `Ctrl + F5`. |

### Khi tiêu đề challenge buộc phải khác `name`

Ví dụ đề tên `baby rev!` nhưng bạn muốn tiêu đề là `## baby rev (phần 2)`:

1. Mở bài (bằng `npm run dev` hoặc trên web). Vì tiêu đề chưa khớp nên nó nằm trong nhóm **Khác** ở
   cuối sidebar. Bấm vào nó.
2. Nhìn thanh địa chỉ: phần sau dấu `#` chính là **id** của tiêu đề, ví dụ `#baby-rev-phần-2`.
   - Nếu copy ra dạng `baby-rev-ph%E1%BA%A7n-2`, đó là chữ có dấu bị trình duyệt mã hoá. Đừng dán
     nguyên như vậy, hãy gõ lại bằng chữ có dấu: `phần`.
3. Thêm `id` vào challenge trong frontmatter, **không** có dấu `#` ở đầu:

   ```yaml
     - name: 'baby rev!'
       id: 'baby-rev-phần-2'
       category: RE
       points: 100
   ```

4. Xem lại: cảnh báo biến mất và challenge chuyển về đúng nhóm category trong sidebar là xong.

Mẹo: đặt tiêu đề challenge **không dấu** thì id dễ đoán hơn nhiều.

## 11. Checklist trước khi đăng

- [ ] Giải đã **kết thúc**, và luật của giải cho phép công bố write-up.
- [ ] Không để lộ token, mật khẩu, IP/máy chủ riêng tư trong ảnh hoặc code.
- [ ] `pubDate` viết dạng `YYYY-MM-DD`.
- [ ] Mỗi challenge trong `challenges:` có một `## ...` cùng tên trong bài (hoặc có `id` trỏ đúng
  tiêu đề), và trên challenge board không có thẻ nào bị mờ.
- [ ] `category`, `difficulty` viết đúng hoa/thường; `points` là số, không bọc nháy.
- [ ] Mỗi challenge có bước `### Flag`, flag nằm trong cặp backtick.
- [ ] Ảnh dùng đường dẫn `./...`, tên file không dấu, không khoảng trắng, khớp hoa/thường.
- [ ] Khối code có tên ngôn ngữ.
- [ ] Đã bỏ `draft: true` (nếu muốn đăng thật).
- [ ] `npm run build` chạy xong với `Complete!` (Cách B), hoặc tab Actions báo ✅ (Cách A).
- [ ] Đã mở bài trên web, bấm thử các thẻ trên board và xem ảnh.

## 12. File mẫu đầy đủ để copy

Bấm nút **Copy** ở góc phải khối dưới, rồi dán vào `src/content/writeups/<ten-giai>/index.md`. Sau
đó:

- thay mọi chữ VIẾT HOA (`TEN-GIAI`, `TEN-TEAM`...) và `ten-challenge-...` bằng nội dung của bạn;
- sửa **cả các giá trị mẫu**: `pubDate`, `url`, `date`, `rank`, `points`, `solves`. Dòng nào không
  dùng thì xoá, riêng `points` là bắt buộc;
- dòng ảnh mẫu đang nằm trong comment `<!-- ... -->`. Khi có ảnh thật, xoá hai dòng `<!--` và `-->`
  bao quanh nó.

File `templates/writeup.md` trong repo có khung tương tự.

````markdown
---
title: 'Write-up TEN-GIAI 2025'
description: 'TÓM TẮT 1–2 CÂU: giải gì, mấy challenge, category nào.'
pubDate: 2025-01-31
tags: ['ctf', 'writeup']
ctf:
  name: 'TEN-GIAI 2025'
  url: 'https://ctftime.org/event/0000'
  date: '30–31/01/2025'
  format: 'Jeopardy'
  team: 'TEN-TEAM'
  rank: '10/300'
challenges:
  - name: 'ten-challenge-1'
    category: RE
    difficulty: Easy
    points: 100
    solves: 50
  - name: 'ten-challenge-2'
    category: Web
    difficulty: Medium
    points: 300
---

Vài dòng mở đầu (tuỳ chọn): giải diễn ra thế nào, team làm được gì, cảm nhận chung...

## ten-challenge-1

### Tìm hiểu về challenge

> Mô tả đề bài...

File đính kèm, hành vi ban đầu của chương trình/trang web...

### Phân tích

Bạn đã tìm ra điều gì...

<!--
![Mô tả ảnh](./images/ten-anh.png)
-->

### Ý tưởng khai thác

Hướng giải và lý do...

### Proof-of-concept

```python
# script giải
```

### Flag

`FLAG{...}`

## ten-challenge-2

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

Bài học rút ra, lời cảm ơn ban tổ chức...
````

---

Một bài mẫu hoàn chỉnh có sẵn trong repo để tham khảo cách trình bày:
`src/content/writeups/greenbyte-ctf-2025/index.md` (đang hiển thị tại
<https://tringuyen17.github.io/Web_Blog/writeups/greenbyte-ctf-2025/>).
