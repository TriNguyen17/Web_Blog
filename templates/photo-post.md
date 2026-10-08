---
# Copy file này vào src/content/photos/<ten-album>/index.md
# và đặt ảnh vào src/content/photos/<ten-album>/images/
title: 'Tên album'
description: 'Một câu mô tả ngắn.'
pubDate: 2025-01-31
location: 'Hà Nội'            # tuỳ chọn
tags: ['daily']               # áp dụng cho mọi ảnh trong album
# cover: './images/01.jpg'    # mặc định = ảnh đầu tiên
photos:
  - src: './images/01.jpg'
    alt: 'Mô tả ảnh cho người dùng trình đọc màn hình'
    caption: 'Caption hiển thị trong lightbox.'
    tags: ['friends']         # tag riêng của ảnh này (tuỳ chọn)
    date: 2025-01-30          # mặc định = pubDate
  - src: './images/02.jpg'
    alt: '...'
    caption: '...'
---

Phần thân (tuỳ chọn): vài dòng kể chuyện, hiện phía trên lưới ảnh.
