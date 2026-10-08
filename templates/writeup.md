---
# Copy file này vào src/content/writeups/<ten-cuoc-thi>/index.md
title: 'Write-up <Tên cuộc thi> <Năm>'
description: 'Mô tả ngắn 1–2 câu (hiện trên card, SEO, RSS).'
pubDate: 2025-01-31
# updatedDate: 2025-02-02
# draft: true                  # true = chỉ hiện khi chạy `npm run dev`
tags: ['ctf', 'writeup']
# cover: './images/cover.png'  # ảnh Open Graph (tuỳ chọn)
ctf:
  name: '<Tên cuộc thi> <Năm>'
  url: 'https://ctftime.org/event/0000'
  date: '30–31/01/2025'
  format: 'Jeopardy'
  team: '<tên team>'
  rank: '10/300'
# Bảng challenge. `name` PHẢI trùng với tiêu đề `## ...` của challenge bên dưới.
# category: RE | Forensics | Web | Crypto | Pwn | Misc | OSINT | Blockchain | Mobile | Hardware
# difficulty (tuỳ chọn): Baby | Easy | Medium | Hard | Insane
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

Đoạn mở đầu (tuỳ chọn): nói chung về giải, team, cảm nhận...

## ten-challenge-1

### Tìm hiểu về challenge

Đề bài, file đính kèm, hành vi ban đầu...

### Lỗ hổng / Phân tích

![Mô tả ảnh](./images/ten-anh.png)

### Ý tưởng khai thác

...

### Proof-of-concept

```python
print("solve")
```

### Flag

`FLAG{...}`

## ten-challenge-2

### Phân tích challenge

### Lỗ hổng

### Khai thác

### Proof-of-concept

### Flag

`FLAG{...}`

## Lời kết

Một `##` không có trong `challenges` sẽ hiện ở nhóm "Khác" của mục lục.
