/**
 * 「今日一字」「今日一言」与期号。
 *
 * 期号就是当天的年内序号（1 月 1 日是第 1 期），所以每天翻一页。
 * 字先按日期取，句子再按这个字的主题取，同一天所有人看到同一份，刷新不会变。
 * 服务器渲染时先按构建那天填一份，客户端脚本再用访客本地时间改写。
 */

export const GLYPHS = [...'山川风月云雨雪松竹梅兰石泉溪江海舟桥灯书茶酒花鸟鱼虫晨昏夜昼春夏秋冬光影声静远近归行坐望'];

export interface Quote {
  text: string;
  by: string;
}

/** 每个字归到一个主题，句子按主题取，所以一言总跟今天的字对得上 */
type Theme =
  | 'mountain'
  | 'water'
  | 'wind'
  | 'moon'
  | 'sky'
  | 'plant'
  | 'season'
  | 'travel'
  | 'quiet'
  | 'book'
  | 'drink'
  | 'creature';

const THEME_OF: Record<string, Theme> = {
  山: 'mountain',
  石: 'mountain',
  川: 'water',
  泉: 'water',
  溪: 'water',
  江: 'water',
  海: 'water',
  风: 'wind',
  月: 'moon',
  夜: 'moon',
  昏: 'moon',
  云: 'sky',
  雨: 'sky',
  雪: 'sky',
  光: 'sky',
  影: 'sky',
  松: 'plant',
  竹: 'plant',
  梅: 'plant',
  兰: 'plant',
  花: 'plant',
  晨: 'season',
  昼: 'season',
  春: 'season',
  夏: 'season',
  秋: 'season',
  冬: 'season',
  舟: 'travel',
  桥: 'travel',
  远: 'travel',
  近: 'travel',
  归: 'travel',
  行: 'travel',
  望: 'travel',
  声: 'quiet',
  静: 'quiet',
  坐: 'quiet',
  书: 'book',
  灯: 'book',
  茶: 'drink',
  酒: 'drink',
  鸟: 'creature',
  鱼: 'creature',
  虫: 'creature',
};

/** 都在公有领域，收短句，不收段子 */
const QUOTES: Record<Theme, Quote[]> = {
  mountain: [
    { text: '相看两不厌，只有敬亭山。', by: '李白' },
    { text: '空山新雨后，天气晚来秋。', by: '王维' },
    { text: '会当凌绝顶，一览众山小。', by: '杜甫' },
    { text: '横看成岭侧成峰，远近高低各不同。', by: '苏轼' },
  ],
  water: [
    { text: '问渠那得清如许？为有源头活水来。', by: '朱熹' },
    { text: '星垂平野阔，月涌大江流。', by: '杜甫' },
    { text: '海内存知己，天涯若比邻。', by: '王勃' },
    { text: '明月松间照，清泉石上流。', by: '王维' },
  ],
  wind: [
    { text: '风来疏竹，风过而竹不留声。', by: '洪应明' },
    { text: '沾衣欲湿杏花雨，吹面不寒杨柳风。', by: '志南' },
    { text: '长风破浪会有时，直挂云帆济沧海。', by: '李白' },
    { text: '解落三秋叶，能开二月花。', by: '李峤' },
  ],
  moon: [
    { text: '举杯邀明月，对影成三人。', by: '李白' },
    { text: '明月几时有？把酒问青天。', by: '苏轼' },
    { text: '月落乌啼霜满天，江枫渔火对愁眠。', by: '张继' },
    { text: '缺月挂疏桐，漏断人初静。', by: '苏轼' },
  ],
  sky: [
    { text: '云在青天水在瓶。', by: '李翱' },
    { text: '水光潋滟晴方好，山色空蒙雨亦奇。', by: '苏轼' },
    { text: '山光悦鸟性，潭影空人心。', by: '常建' },
    { text: '晚来天欲雪，能饮一杯无？', by: '白居易' },
  ],
  plant: [
    { text: '落花无言，人淡如菊。', by: '司空图' },
    { text: '疏影横斜水清浅，暗香浮动月黄昏。', by: '林逋' },
    { text: '竹外桃花三两枝，春江水暖鸭先知。', by: '苏轼' },
    { text: '采菊东篱下，悠然见南山。', by: '陶渊明' },
  ],
  season: [
    { text: '山中何事？松花酿酒，春水煎茶。', by: '张可久' },
    { text: '春眠不觉晓，处处闻啼鸟。', by: '孟浩然' },
    { text: '接天莲叶无穷碧，映日荷花别样红。', by: '杨万里' },
    { text: '自古逢秋悲寂寥，我言秋日胜春朝。', by: '刘禹锡' },
  ],
  travel: [
    { text: '人生天地间，忽如远行客。', by: '《古诗十九首》' },
    { text: '一蓑烟雨任平生。', by: '苏轼' },
    { text: '两岸猿声啼不住，轻舟已过万重山。', by: '李白' },
    { text: '近乡情更怯，不敢问来人。', by: '宋之问' },
  ],
  quiet: [
    { text: '此心安处是吾乡。', by: '苏轼' },
    { text: '水流心不竞，云在意俱迟。', by: '杜甫' },
    { text: '蝉噪林逾静，鸟鸣山更幽。', by: '王籍' },
    { text: '宠辱不惊，闲看庭前花开花落。', by: '洪应明' },
  ],
  book: [
    { text: '读书破万卷，下笔如有神。', by: '杜甫' },
    { text: '书卷多情似故人，晨昏忧乐每相亲。', by: '于谦' },
    { text: '青灯有味似儿时。', by: '陆游' },
    { text: '半亩方塘一鉴开，天光云影共徘徊。', by: '朱熹' },
  ],
  drink: [
    { text: '寒夜客来茶当酒，竹炉汤沸火初红。', by: '杜耒' },
    { text: '醉后不知天在水，满船清梦压星河。', by: '唐珙' },
    { text: '晚来天欲雪，能饮一杯无？', by: '白居易' },
    { text: '山中何事？松花酿酒，春水煎茶。', by: '张可久' },
  ],
  creature: [
    { text: '山光悦鸟性，潭影空人心。', by: '常建' },
    { text: '春眠不觉晓，处处闻啼鸟。', by: '孟浩然' },
    { text: '竹外桃花三两枝，春江水暖鸭先知。', by: '苏轼' },
    { text: '江南可采莲，莲叶何田田。鱼戏莲叶间。', by: '《江南》' },
  ],
};

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
  /** 今日一言，跟字同一个主题 */
  quote: Quote;
  /** ISO 日期，给 <time datetime> 用 */
  date: string;
}

export function dailyInfo(now: Date = new Date()): Daily {
  const y = now.getFullYear();
  const m = now.getMonth() + 1;
  const d = now.getDate();
  const doy = Math.round((Date.UTC(y, m - 1, d) - Date.UTC(y, 0, 1)) / 86400000) + 1;
  const seed = y * 372 + m * 31 + d;
  const glyph = GLYPHS[seed % GLYPHS.length];
  const pool = QUOTES[THEME_OF[glyph]] ?? QUOTES.quiet;

  return {
    doy,
    weekday: WEEKDAYS[now.getDay()],
    iso: `${y}.${pad(m)}.${pad(d)}`,
    cn: `${y} 年 ${m} 月 ${d} 日`,
    glyph,
    quote: pool[(seed * 7 + 3) % pool.length],
    date: `${y}-${pad(m)}-${pad(d)}`,
  };
}
