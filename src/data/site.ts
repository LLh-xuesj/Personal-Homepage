/**
 * 全站唯一的内容文件。改文案只改这里。
 *
 * 页面是纸本印刷的版式：刊头、入口、作品、编者的话、版权页。
 * 结构见 index.astro，样式见 styles/paper.css。
 */

/** 目录里的一个入口 */
export interface Entry {
  /** 稳定 id，做锚点与 CSS 钩子，不要含空格 */
  id: string;
  /** 大字号的主标题 */
  label: string;
  /** 右栏的一行说明 */
  note: string;
  /** 目标地址 */
  href: string;
  /** 站外链接，会加 rel="noopener" 并在新标签打开 */
  external: boolean;
}

export interface ColophonItem {
  label: string;
  value: string;
}

/** 作品栏里的一件东西。只放做完的，不放进度。 */
export interface Project {
  /** 稳定 id，做 CSS 钩子，不要含空格 */
  id: string;
  /** 作品名，短，两个字到六个字 */
  title: string;
  /** 一句话说清它是什么，超过 40 字说明还没想清 */
  summary: string;
  /** 年份，字符串，按它倒序显示 */
  year: string;
  /** 你在这件事里的角色 */
  role: string;
  /** 线上地址；没有就留空字符串，那一栏入口就不出现 */
  url: string;
  /** 代码仓库；没有就留空字符串 */
  repo: string;
}

export const site = {
  /** 站点地址，用于 canonical 与 og:url */
  url: 'https://xuesj.top',
  /** 刊头的大字 */
  title: 'xuesj',
  /** 刊头左上角的小字 */
  kicker: '个人主页',
  /** 只进 <title> 与社交卡片 */
  description: 'xuesj 的个人主页：博客、Bilibili、GitHub。',

  /** 三个入口，按显示顺序排列 */
  entries: [
    {
      id: 'blog',
      label: '博客',
      note: '文章和题解',
      href: 'https://blog.xuesj.top',
      external: true,
    },
    {
      id: 'bilibili',
      label: 'Bilibili',
      note: '视频和动态',
      href: 'https://space.bilibili.com/662837497',
      external: true,
    },
    {
      id: 'github',
      label: 'GitHub',
      note: '代码和半成品',
      href: 'https://github.com/LLh-xuesj',
      external: true,
    },
  ] satisfies Entry[],

  /**
   * 作品，按年份倒序。首页最多放五件；超过五件就另开一页。
   * 不满四件时，页面会在最后印一个「待印」版位。
   */
  projects: [
    {
      id: 'star-atlas',
      title: '识星',
      summary: '纯本地的认星工具。88 星座、110 个梅西耶、三种测验，双击就能打开。',
      year: '2026',
      role: '独立开发',
      url: '',
      repo: 'https://github.com/LLh-xuesj/star-atlas',
    },
    {
      id: 'zcode-pet',
      title: '桌宠',
      summary: '住在 ZCode 窗口里的像素宠物，顺带报 token、费用和余额。',
      year: '2026',
      role: '独立开发',
      url: '',
      repo: 'https://github.com/LLh-xuesj/zcode-pet',
    },
    {
      id: 'typora-xuan',
      title: '宣纸',
      summary: '给 Typora 写长文用的主题：宣纸底、墨字、朱砂点缀。',
      year: '2026',
      role: '设计 / CSS',
      url: '',
      repo: 'https://github.com/LLh-xuesj/typora-theme-xuan',
    },
    {
      id: 'this-page',
      title: '这一页',
      summary: '这个站本身。一个静态页面，样式手写，连字体两百来 KB。',
      year: '2026',
      role: '设计 / 前端',
      url: 'https://xuesj.top',
      repo: 'https://github.com/LLh-xuesj/Personal-Homepage',
    },
  ] satisfies Project[],

  /** 编者的话：两三句实话，别写成简历，也别解释页面设计 */
  note: {
    label: '编者的话',
    lead: '这个站是我自己搭的，很简单。',
    paragraphs: [
      '博客更新最勤，B 站次之，GitHub 看心情。',
      '有事直接在 B 站或 GitHub 上找我。',
    ],
    signature: 'xuesj',
  },

  colophon: {
    /** 版权年份，跨年了记得改 */
    year: 2026,
    items: [
      { label: '制作', value: 'Astro，样式手写' },
      { label: '字体', value: 'EB Garamond、霞鹜文楷' },
      { label: '其他', value: '不收集访客数据' },
    ] satisfies ColophonItem[],
  },
} as const;

export type Site = typeof site;
