// 內容集合定義（Astro 7 content layer，glob() loader）。
//
// 資料夾（下一輪 agent 於此新增 .md 項目檔；本輪只建骨架，不建項目）：
//   src/content/events/*.md         ← 對照 .source/21~24-event-*.md（4 篇既有子頁）
//   src/content/courses/*.md        ← 對照 .source/31~32-course-*.md（2 篇既有子頁）
//   src/content/announcements/*.md  ← /news/ 手動公告區（無對應 .source 子頁，協會日後自行增修）
//
// 欄位設計依 .source/_ia-plan.md § 2.1／2.2 建議 schema 為準，並逐篇比對
// 21-24/31-32 六個既有子頁的實際欄位後定案（見各欄位註解出處）。
// 原則：只忠實對應 .source 已出現過的欄位，缺的留 optional，不發明欄位；
// 議程表／講師陣容／費用方案等重內容一律留在 body（Markdown 正文），不硬拆成 schema。
//
// /news/ 混合式（見交辦說明）：featured:true 的 events/courses 項目 + announcements
// 集合，依 date 合併排序。`date` 為排序用的機器可讀日期（由建立項目檔的 agent
// 依 dateLabel 換算，如 21-event-ai-highschool.md 的「115年 07/25(六)」換算為
// 2026-07-25），非原站新增文案；`dateLabel` 才是原樣保留的展示文字。
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const events = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/events' }),
  schema: z.object({
    title: z.string(), // 標題，如 21-event-ai-highschool.md:4
    subtitle: z.string().optional(), // 梯次/副標，如 21:12
    dateLabel: z.string(), // 日期文字，原樣保留，如 21:26「115年 07/25(六) - 07/26(日)」
    date: z.coerce.date().optional(), // 排序用機器日期（見檔頭說明），非原站文案
    location: z.string().optional(), // 地點，如 21:27
    status: z.string().optional(), // 狀態徽章文字，原樣保留，如 10-news.md:26「🚀 熱烈招募中」、23:26「[已結束]」
    category: z.string().optional(), // 分類標籤，僅 10-news.md 出現過（10-news.md:22,32,42,52,62）
    summary: z.string(), // 摘要文字，供列表卡片與 /news/ 混合列表用
    registrationLink: z.string().url().optional(), // 報名連結，如 21-event-ai-highschool.md:14
    registrationNote: z.string().optional(), // 無 registrationLink 時的說明文字（如僅限院內同仁報名之官方說法，見 A7）
    contactName: z.string().optional(),
    contactPhone: z.string().optional(),
    contactEmail: z.string().optional(),
    image: z.string().optional(), // 首圖/海報
    featured: z.boolean().default(false), // true 才會被 /news/ 混合列表撈出
    sourceSlug: z.string(), // 對照 .source 檔名，供追溯，如 "21-event-ai-highschool"
  }),
});

const courses = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/courses' }),
  schema: z.object({
    title: z.string(),
    dateLabel: z.string(), // 含時間，如 31-course-0418.md:41「115年04月18日 (六) 晚上 19:00-20:00」
    date: z.coerce.date().optional(), // 排序用機器日期，非原站文案
    format: z.string().optional(), // 如 31:42「線上遠距教學」
    fee: z.string().optional(), // 如 31:43「TTPA會員及高效工作坊校友完全免費」
    instructorName: z.string().optional(),
    instructorTitle: z.string().optional(),
    instructorPhoto: z.string().optional(),
    registrationLink: z.string().url().optional(),
    capacityLimit: z.string().optional(), // 如 31:49「限額 40 人」
    status: z.string().optional(), // 狀態徽章文字（沿用活動頁慣例，供已結束課程標記）
    summary: z.string().optional(), // 摘要文字，供列表卡片與 /news/ 混合列表用
    image: z.string().optional(),
    featured: z.boolean().default(false), // true 才會被 /news/ 混合列表撈出
    sourceSlug: z.string(), // 對照 .source 檔名，供追溯，如 "31-course-0418"
  }),
});

const announcements = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/announcements' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(), // 公告為協會日後手動新增，需有明確日期供排序
    summary: z.string(),
    link: z.string().url().optional(), // 對外或站內公告連結
    status: z.string().optional(), // 狀態徽章文字（沿用原站慣例）
  }),
});

export const collections = { events, courses, announcements };
