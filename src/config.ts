/**
 * Site-wide settings. Edit this file to personalise the blog.
 */
export const SITE = {
  /** Shown in <title>, RSS and Open Graph. */
  title: 'Tri Nguyen — CTF Write-ups & Photos',
  /** Short name used in the header prompt: `~/<brand> $`. */
  brand: 'tringuyen',
  author: 'Tri Nguyen',
  description:
    'Blog cá nhân của một sinh viên An toàn thông tin: CTF write-ups (Reverse, Forensics, Web, Crypto, Pwn) và những khoảnh khắc đời thường.',
  lang: 'vi',
  locale: 'vi_VN',
  /** Default Open Graph image, inside /public. */
  ogImage: '/og-default.png',
  /** Number of posts per type on the home page. */
  homePostsPerType: 6,
} as const;

export const HERO = {
  greeting: 'Xin chào, mình là Tri 👋',
  intro:
    'Sinh viên ngành An toàn thông tin. Mình chơi CTF — chủ yếu là Reverse Engineering và Forensics — và ghi lại lời giải ở đây. Thỉnh thoảng cũng đăng vài tấm ảnh đời thường.',
  /** Lines typed in the terminal box of the hero section. */
  terminal: [
    { cmd: 'whoami', out: 'infosec student · CTF player' },
    { cmd: 'cat interests.txt', out: 'reverse engineering, forensics, web, photography' },
    { cmd: 'ls ~/blog', out: 'writeups/  photos/  about.md' },
  ],
};

export type Social = { name: string; url: string; handle: string; icon: SocialIcon };
export type SocialIcon = 'github' | 'linkedin' | 'htb' | 'picoctf' | 'cyberdefenders' | 'mail' | 'rss';

/** Replace the placeholder handles with your own profiles. Entries still
 *  holding a placeholder ('your-…', '000000') are left out of the site. */
const ALL_SOCIALS: Social[] = [
  { name: 'GitHub', url: 'https://github.com/TriNguyen17', handle: 'TriNguyen17', icon: 'github' },
  { name: 'LinkedIn', url: 'https://www.linkedin.com/in/your-handle', handle: 'your-handle', icon: 'linkedin' },
  { name: 'HackTheBox', url: 'https://app.hackthebox.com/profile/000000', handle: 'your-htb-name', icon: 'htb' },
  { name: 'picoCTF', url: 'https://play.picoctf.org/users/your-handle', handle: 'your-handle', icon: 'picoctf' },
  { name: 'CyberDefenders', url: 'https://cyberdefenders.org/p/your-handle', handle: 'your-handle', icon: 'cyberdefenders' },
];

const isPlaceholder = (s: Social) => /your-/.test(s.url) || /your-/.test(s.handle) || /\/0{6}\/?$/.test(s.url);
export const SOCIALS: Social[] = ALL_SOCIALS.filter((s) => !isPlaceholder(s));

export const NAV = [
  { label: 'Home', href: '/' },
  { label: 'Write-ups', href: '/writeups/' },
  { label: 'Photos', href: '/photos/' },
  { label: 'Tags', href: '/tags/' },
  { label: 'About', href: '/about/' },
];
