import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// 模式 B（GitHub project pages）：正式網址 https://yao-care.github.io/www.ttpa.com.tw/
// ⚠ 有 base 時站內連結一律用 import.meta.env.BASE_URL 組，別硬編 /xxx（project pages 最常見斷鏈坑）。
export default defineConfig({
  site: 'https://yao-care.github.io',
  base: '/www.ttpa.com.tw',
  output: 'static',
  build: { format: 'directory' },
  // build.format='directory' 下每個頁面網址都以 / 結尾；filter 濾掉 sitemap 會多塞的
  // 「site+base 無尾斜線」那筆（GitHub Pages 對它回 301，會讓 CI verify job 誤判失敗）。
  integrations: [sitemap({ filter: (page) => page.endsWith('/') })],
});
