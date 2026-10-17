import { defineConfig } from 'astro/config';

// 单页静态站点。没有任何运行时框架、没有 SSR、没有任何客户端依赖。
export default defineConfig({
  site: 'https://xuesj.top',
  output: 'static',
  compressHTML: true,
  build: {
    // 单页样式量很小，内联进 HTML 可以省掉一个首屏请求。
    inlineStylesheets: 'always',
  },
  devToolbar: {
    enabled: false,
  },
});
