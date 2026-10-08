# Web_Blog — CTF Write-ups & Photo Blog

Blog cá nhân tĩnh (static) cho một sinh viên An toàn thông tin, gồm hai mảng:

- **CTF Write-ups**: mỗi cuộc thi là một trang dài, có **mục lục bám dính** bên trái (nhóm theo
  category, mở/đóng từng challenge, scroll spy), **challenge board** phía trên, và nội dung
  Markdown với syntax highlighting.
- **Photo Blog**: lưới ảnh **masonry**, click mở **lightbox** (caption, ngày, tag, phím ←/→,
  vuốt trên mobile).

Chung: tìm kiếm (`Ctrl K` hoặc `/`), lọc theo category/tag, dark mode mặc định + light mode,
responsive (mục lục thành drawer trên mobile), SEO (meta, Open Graph, sitemap), RSS.

---

## 1. Vì sao chọn Astro?

| Tiêu chí | **Astro** ✅ | Next.js | Hugo |
| --- | --- | --- | --- |
| Blog tĩnh, mặc định 0 KB JavaScript | ✅ chỉ gửi JS cho phần cần tương tác | ❌ luôn kèm React runtime | ✅ |
| Markdown/MDX + kiểm tra frontmatter | ✅ Content Collections + schema (Zod), sai là build báo lỗi | ⚠️ phải tự ráp (MDX, gray-matter...) | ⚠️ không có schema |
| Tối ưu ảnh (WebP, `srcset`, kích thước) | ✅ built-in `astro:assets`, kể cả ảnh trong Markdown | ✅ `next/image` nhưng export tĩnh bị hạn chế | ⚠️ phải viết shortcode |
| Syntax highlighting | ✅ Shiki tích hợp, render lúc build (không tốn JS) | ⚠️ tự cài | ✅ Chroma |
| Plugin remark/rehype | ✅ | ✅ | ❌ |
| Deploy GitHub Pages / Vercel / Netlify | ✅ ra thư mục `dist/` thuần HTML | ⚠️ cần `output: export` | ✅ |
| Viết component (TOC, board, lightbox) | ✅ file `.astro` gần với HTML, TypeScript | ✅ React | ⚠️ Go template |

Tóm lại: Astro là framework sinh ra cho **website nội dung**. Trang write-up dài, nhiều code
và ảnh vẫn ra HTML tĩnh rất nhẹ, chỉ vài KB JavaScript cho mục lục, tìm kiếm và lightbox.
Content Collections bắt lỗi frontmatter ngay lúc build (ví dụ gõ sai `category`), và một plugin
rehype nhỏ tự biến cấu trúc heading thành các section challenge.

**Stack**: Astro 7 · MDX · Shiki (dual theme) · `@astrojs/sitemap` · `@astrojs/rss` ·
Inter + JetBrains Mono (self-host qua Fontsource, có subset tiếng Việt) · CSS thuần (không framework).

---

## 2. Chạy thử

Cần **Node.js ≥ 22.12**.

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # build ra dist/
npm run preview   # xem bản build
```

---

## 3. Cấu trúc thư mục

```text
.
├── .github/workflows/deploy.yml   # CI deploy GitHub Pages
├── astro.config.mjs               # site/base, MDX, sitemap, Shiki, plugin rehype
├── public/                        # copy nguyên trạng: favicon.svg, og-default.png
├── templates/                     # mẫu để copy khi viết bài mới
│   ├── writeup.md
│   └── photo-post.md
└── src/
    ├── config.ts                  # ⭐ tên, giới thiệu, link mạng xã hội, menu
    ├── content.config.ts          # schema frontmatter của write-up & photo
    ├── content/
    │   ├── writeups/<slug>/index.md (+ images/)
    │   └── photos/<slug>/index.md   (+ images/)
    ├── plugins/
    │   └── rehype-ctf-sections.mjs  # ## → section challenge, ### → bước, chèn badge
    ├── lib/
    │   ├── ctf.ts                 # category, độ khó, dựng mục lục & board
    │   ├── posts.ts               # truy vấn bài viết, tag, gallery
    │   └── utils.ts               # url() theo base path, format ngày, slugify...
    ├── layouts/
    │   ├── BaseLayout.astro       # <head> SEO, header, footer, tìm kiếm, theme
    │   ├── WriteupLayout.astro    # ⭐ trang write-up: sidebar + board + nội dung
    │   └── PhotoPostLayout.astro  # trang album ảnh
    ├── components/
    │   ├── BaseHead.astro         # meta, Open Graph, Twitter, canonical, RSS
    │   ├── Header.astro · Footer.astro · ThemeToggle.astro · SearchModal.astro
    │   ├── Hero.astro · PostCard.astro · FilterBar.astro · TagList.astro · Icon.astro
    │   ├── writeup/
    │   │   ├── TableOfContents.astro  # ⭐ sidebar mục lục (sticky / drawer)
    │   │   └── ChallengeBoard.astro   # ⭐ bảng challenge dạng card
    │   └── photo/
    │       ├── PhotoGallery.astro     # lưới masonry
    │       └── Lightbox.astro
    ├── scripts/                   # JS phía client
    │   ├── toc.ts                 # scroll spy, mở/đóng, drawer mobile, % đã đọc
    │   ├── lightbox.ts · search.ts · filter.ts · reveal.ts · code-blocks.ts
    ├── styles/
    │   ├── global.css             # design token (màu dark/light), nút, badge...
    │   ├── prose.css              # style nội dung Markdown
    │   └── code.css               # code block Shiki + nút copy
    └── pages/
        ├── index.astro            # trang chủ: hero + bài mới nhất + lọc
        ├── writeups/index.astro   # danh sách write-up, lọc theo category
        ├── writeups/[...slug].astro
        ├── photos/index.astro     # masonry toàn bộ ảnh, lọc theo tag + danh sách album
        ├── photos/[...slug].astro
        ├── tags/index.astro · tags/[tag].astro
        ├── about.astro · 404.astro
        ├── rss.xml.ts · search.json.ts · robots.txt.ts
```

---

## 4. Viết một CTF write-up mới

Mỗi **cuộc thi = một file**. Cách nhanh nhất là copy `templates/writeup.md`:

```bash
mkdir -p src/content/writeups/cscv-2025/images
cp templates/writeup.md src/content/writeups/cscv-2025/index.md
```

URL sẽ là `/writeups/cscv-2025/` (lấy theo tên thư mục). Bạn cũng có thể dùng `.mdx` nếu muốn
nhúng component.

### 4.1 Frontmatter

```yaml
---
title: 'Write-up CSCV 2025'
description: 'Lời giải 6 challenge RE/Forensics/Web...'
pubDate: 2025-10-20
tags: ['ctf', 'cscv']
ctf:
  name: 'CSCV 2025'
  url: 'https://...'         # tuỳ chọn
  date: '18–19/10/2025'      # tuỳ chọn
  team: 'b0tnet'             # tuỳ chọn
  rank: '12/356'             # tuỳ chọn
challenges:                  # ⭐ dữ liệu cho challenge board
  - name: 'baby-rev'         # PHẢI trùng tiêu đề "## baby-rev"
    category: RE             # RE | Forensics | Web | Crypto | Pwn | Misc | OSINT | Blockchain | Mobile | Hardware
    difficulty: Easy         # Baby | Easy | Medium | Hard | Insane (tuỳ chọn)
    points: 100
    solves: 42               # tuỳ chọn
    author: 'abc'            # tuỳ chọn
---
```

Sai giá trị (ví dụ `category: Reverse`) thì `npm run build` báo lỗi rõ ràng, nên không lo gõ nhầm.

### 4.2 Quy ước heading — phần quan trọng nhất

| Markdown | Trở thành |
| --- | --- |
| `## Tên challenge` | Một **challenge**: một mục trong sidebar, kèm badge category/độ khó/điểm |
| `### Tìm hiểu challenge`, `### Lỗ hổng`... | Một **bước** bên trong challenge, mục con trong sidebar (mở/đóng được) |
| `### Flag` | Bước cuối, được tô xanh nổi bật (viết flag dạng `` `FLAG{...}` ``) |
| `####` trở xuống | Heading thường, không vào sidebar |
| `##` không có trong `challenges` (vd `## Lời kết`) | Section thường, nằm trong nhóm "Khác" của sidebar |

````markdown
## baby-rev

### Tìm hiểu về challenge
...
### Lỗ hổng / Phân tích
...
### Ý tưởng khai thác
...
### Proof-of-concept
```python
...
```
### Flag
`CSCV{...}`

## web-101
...
````

Sidebar **nhóm challenge theo category** theo thứ tự category xuất hiện lần đầu trong bài.
Nên viết các challenge cùng category liền nhau để thứ tự sidebar trùng với thứ tự đọc.

Nếu tên challenge có ký tự đặc biệt khiến heading khác `name`, thêm `id` là id của heading
(chữ thường, khoảng trắng thành `-`), ví dụ `id: 'baby-rev-2'`. Khi build, terminal sẽ cảnh báo nếu
một challenge trong frontmatter không tìm thấy heading tương ứng.

### 4.3 Ảnh, code, bảng...

- **Ảnh**: đặt cạnh bài (`images/`) và tham chiếu tương đối: `![mô tả](./images/ida.png)`.
  Astro tự resize sang WebP. Không dùng đường dẫn `/images/...` (sẽ hỏng trên GitHub Pages vì
  site nằm dưới `/<repo>/`).
- **Code**: ` ```python `, ` ```c `, ` ```asm ` (hoặc `nasm`), ` ```js `, ` ```bash `,
  ` ```sql `, ` ```text `... Shiki hỗ trợ hơn 200 ngôn ngữ. Mỗi block có nhãn ngôn ngữ và nút copy.
- **Bảng, blockquote, danh sách, footnote, task list**: đều hỗ trợ (GitHub Flavored Markdown).
- **Link nội bộ** trong Markdown: dùng đường dẫn tương đối, ví dụ `[About](../../about/)`.
- `draft: true` thì bài chỉ hiện khi chạy `npm run dev`.

---

## 5. Thêm một bài Photo Blog

Mỗi album là một thư mục:

```bash
mkdir -p src/content/photos/hoi-an-2025/images
cp ~/Pictures/hoian/*.jpg src/content/photos/hoi-an-2025/images/
cp templates/photo-post.md src/content/photos/hoi-an-2025/index.md
```

```yaml
---
title: 'Hội An mùa mưa'
description: 'Một câu mô tả ngắn.'
pubDate: 2025-11-02
location: 'Hội An'          # tuỳ chọn
tags: ['travel']            # áp dụng cho mọi ảnh
photos:
  - src: './images/01.jpg'
    alt: 'Mô tả ảnh (cho trình đọc màn hình)'
    caption: 'Caption hiện trong lightbox'
    tags: ['friends']       # tag riêng của ảnh (tuỳ chọn)
    date: 2025-11-01        # mặc định = pubDate
---

Vài dòng kể chuyện (tuỳ chọn), hiện phía trên lưới ảnh.
```

Ảnh gốc cứ để độ phân giải cao (khoảng 2000–3000px là đủ). Astro tự tạo nhiều kích thước WebP
cho lưới ảnh và bản lớn cho lightbox. Ảnh xuất hiện ở trang album và ở `/photos/` (lọc được theo tag).

---

## 6. Tuỳ chỉnh

- **Thông tin cá nhân, link profile** (GitHub, LinkedIn, HackTheBox, picoCTF, CyberDefenders),
  hero, menu: `src/config.ts`. Nhớ thay các handle `your-handle`.
- **Màu sắc**: token trong `src/styles/global.css` (`--accent`, `--bg`, màu từng category `--cat-*`).
- **Thêm category**: thêm vào `CATEGORIES` trong `src/lib/ctf.ts` và một dòng `--cat-<slug>` +
  `[data-cat='<slug>']` trong `global.css`.
- **Ảnh chia sẻ mặc định** (Open Graph): `public/og-default.png` (1200×630).

---

## 7. Deploy

### GitHub Pages (đã cấu hình sẵn)

1. Push code lên nhánh `main`.
2. Trên GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Workflow `.github/workflows/deploy.yml` tự chạy mỗi lần push vào `main` (hoặc chạy tay ở tab
   **Actions**). Site sẽ ở `https://<user>.github.io/<repo>/`.

Workflow tự lấy domain và base path từ `actions/configure-pages`. Dùng repo `<user>.github.io`
hay custom domain thì cũng không phải sửa gì.

### Vercel

1. **Add New → Project →** import repo này. Vercel tự nhận framework *Astro*
   (build `npm run build`, output `dist`).
2. Deploy. Domain production được tự nhận qua biến `VERCEL_PROJECT_PRODUCTION_URL`. Nếu dùng
   custom domain, thêm biến môi trường `SITE_URL=https://domain-cua-ban.com`.

### Netlify

Build command `npm run build`, publish directory `dist`. URL site được lấy tự động từ biến `URL`
của Netlify.

### Host khác

```bash
SITE_URL=https://example.com BASE_PATH=/ npm run build   # rồi upload thư mục dist/
```

`SITE_URL` cần cho sitemap, RSS và Open Graph (URL tuyệt đối). `BASE_PATH` chỉ cần khi site nằm
trong thư mục con.

---

## 8. Ghi chú kỹ thuật

- **Scroll spy**: `src/scripts/toc.ts` lấy heading cuối cùng đã đi qua "vạch kích hoạt" ngay dưới
  header (đọc từ `scroll-padding-top` + `scroll-margin-top` để khớp vị trí khi bấm link).
  Challenge đang đọc tự mở trong sidebar và tự đóng khi đọc sang bài khác, trừ khi bạn đã mở nó bằng tay.
- **Tìm kiếm**: lúc build tạo `/search.json` (mỗi write-up và mỗi challenge là một mục, link thẳng
  tới section). Tìm không dấu ("da lat" ra "Đà Lạt"), gõ `#tag` để lọc theo tag.
- **Không có JavaScript** thì nội dung, mục lục (mở sẵn hết) và mọi link vẫn dùng được.
- **Ảnh mẫu** trong bài Đà Lạt và hai ảnh minh hoạ trong write-up được vẽ bằng code
  (placeholder), cứ thay bằng ảnh thật của bạn. Cuộc thi *GreenByte CTF 2025* là ví dụ hư cấu.
