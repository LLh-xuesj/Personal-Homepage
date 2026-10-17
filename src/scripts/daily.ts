/**
 * 「今日一字」与期号。
 *
 * 期号就是当天的年内序号（1 月 1 日是第 1 期），所以每天翻一页。
 * 字由年月日算哈希取，同一天全世界看到同一个字，刷新不会变。
 * 服务器渲染时先按构建那天填一份，客户端脚本再用访客本地时间改写。
 */

export const GLYPHS = [...'山川风月云雨雪松竹梅兰石泉溪江海舟桥灯书茶酒花鸟鱼虫晨昏夜昼春夏秋冬光影声静远近归行坐望'];

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

const pad = (n: number) => String(n).padStart(2, '0');

export interface Daily {
  /** 年内第几天，从 1 开始 */
  doy: number;
  /** 星期几的汉字 */
  weekday: string;
  /** 2026.10.17 */
  iso: string;
  /** 2026 年 10 月 17 日 */
  cn: string;
  /** 今日一字 */
  glyph: string;
  /** ISO 日期，给 <time datetime> 用 */
  date: string;
}

export function dailyInfo(now: Date = new Date()): Daily {
  const y = now.getFullYear();
  const m = now.getMonth() + 1;
  const d = now.getDate();
  const doy = Math.round((Date.UTC(y, m - 1, d) - Date.UTC(y, 0, 1)) / 86400000) + 1;
  const seed = y * 372 + m * 31 + d;

  return {
    doy,
    weekday: WEEKDAYS[now.getDay()],
    iso: `${y}.${pad(m)}.${pad(d)}`,
    cn: `${y} 年 ${m} 月 ${d} 日`,
    glyph: GLYPHS[seed % GLYPHS.length],
    date: `${y}-${pad(m)}-${pad(d)}`,
  };
}
