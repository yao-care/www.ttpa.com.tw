import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// 模式 A（自訂網域）：正式網址 https://www.ttpa.com.tw/
// 2026-08-06 由 project pages（base=/www.ttpa.com.tw）轉自訂網域，base 移除＝站台掛在根路徑。
// 站內連結仍一律用 import.meta.env.BASE_URL 組（此時為 '/'），別硬編——之後若再換掛載點才不會斷。
const BASE = '';

// content collection 的 Markdown 正文（.md body）沒有 import.meta.env.BASE_URL 可用，
// 圖片自託管後（見 public/img/，2026-07-28 由外連 Google/Unsplash 圖片下載改的那輪）
// 內文若用 ![alt](img/xxx.png) 這種相對路徑，讓這個 remark plugin 在渲染時統一補上 base，
// 不在內容檔裡硬編 BASE 字串（單一真實來源＝上面這個常數）。
function remarkContentImageBase() {
  return (tree) => {
    const visit = (node) => {
      if (
        node.type === 'image' &&
        typeof node.url === 'string' &&
        !/^https?:\/\//.test(node.url) &&
        !node.url.startsWith('/')
      ) {
        node.url = `${BASE}/${node.url}`;
      }
      if (Array.isArray(node.children)) {
        node.children.forEach(visit);
      }
    };
    visit(tree);
  };
}

export default defineConfig({
  site: 'https://www.ttpa.com.tw',
  output: 'static',
  build: { format: 'directory' },
  // build.format='directory' 下每個頁面網址都以 / 結尾；filter 濾掉 sitemap 會多塞的
  // 「site+base 無尾斜線」那筆（GitHub Pages 對它回 301，會讓 CI verify job 誤判失敗）。
  integrations: [sitemap({ filter: (page) => page.endsWith('/') })],
  markdown: {
    remarkPlugins: [remarkContentImageBase],
  },
});
