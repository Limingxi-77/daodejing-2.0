import Fuse from 'fuse.js';

export interface KnowledgeItem {
  chapter: number;
  content: string;
  annotations: {
    wangbi: string; // 王弼注
    heshanggong: string; // 河上公注
    modern: string; // 现代解读
  };
  keywords: string[];
}

export const knowledgeBase: KnowledgeItem[] = [
  {
    chapter: 1,
    content: "道可道，非常道；名可名，非常名。无名天地之始，有名万物之母。",
    annotations: {
      wangbi: "可道之道，可名之名，指事造形，非其常也。故不可道，不可名也。",
      heshanggong: "道可道：谓经术政教之道也。非常道：非自然长生之道也。常道当以无为养神，无事安民，含光藏晖，灭迹匿端，不可称道。",
      modern: "能够用语言表达的'道'，就不是永恒不变的'道'；能够叫得出来的'名'，就不是永恒不变的'名'。"
    },
    keywords: ["道", "名", "无名", "有名", "第一章", "总纲"]
  },
  {
    chapter: 8,
    content: "上善若水。水善利万物而不争，处众人之所恶，故几于道。",
    annotations: {
      wangbi: "人好上，水好下；人好誉，水好丑。道无水有，故曰几于道。",
      heshanggong: "上善之人，如水之性。水在天为雾露，在地为源泉也。众能方能圆，曲直随形，故不争。",
      modern: "最高的善像水一样。水善于滋润万物而不与万物相争，停留在众人都不喜欢的地方，所以最接近于'道'。"
    },
    keywords: ["上善若水", "不争", "水", "第八章", "处世"]
  },
  {
    chapter: 12,
    content: "五色令人目盲；五音令人耳聋；五味令人口爽；驰骋畋猎，令人心发狂。",
    annotations: {
      wangbi: "失其主也。",
      heshanggong: "贪淫好色，则伤精失明。好听五音，则和气去心。爽，亡也。人嗜于六畜之肉，更令口亡气失味也。",
      modern: "缤纷的色彩，使人眼花缭乱；嘈杂的音乐，使人听觉失灵；丰盛的食物，使人味觉受伤；纵情狩猎，使人心情放荡发狂。"
    },
    keywords: ["五色", "目盲", "五音", "养生", "欲望", "第十二章"]
  },
  {
    chapter: 33,
    content: "知人者智，自知者明。胜人者有力，自胜者强。",
    annotations: {
      wangbi: "知人者，智而已矣。未若自知者，超智之上也。",
      heshanggong: "能知人好恶，不仅名为智，别无所益。能自知，其明乃可谓之明也。",
      modern: "能了解别人的人有智慧，能了解自己的人才算明智。能战胜别人的人有力气，能战胜自己弱点的人才算刚强。"
    },
    keywords: ["自知", "自胜", "智慧", "第三十三章", "修身"]
  },
  {
    chapter: 42,
    content: "道生一，一生二，二生三，三生万物。万物负阴而抱阳，冲气以为和。",
    annotations: {
      wangbi: "万物万形，其归一也。何由致一？由于无也。由无乃一，一可谓无？",
      heshanggong: "道始所生者一也，一生阴与阳也，阴阳生和、清、浊三气，分为天地人也。",
      modern: "道产生统一的元气，元气分化为阴阳二气，阴阳二气交合而生和气，和气产生万物。万物背阴而向阳，阴阳二气互相激荡而成和谐状态。"
    },
    keywords: ["道生一", "阴阳", "万物", "第四十二章", "宇宙论"]
  },
  {
    chapter: 64,
    content: "合抱之木，生于毫末；九层之台，起于累土；千里之行，始于足下。",
    annotations: {
      wangbi: "木生于毫末，其大可知；台起于累土，其高可知；行始于足下，其远可知。言大事皆起于小也。",
      heshanggong: "合抱之木，起于毫末，根本微小也。千里之行，始于足下，进一寸一尺也。",
      modern: "合抱的大树，是从细小的萌芽长起来的；九层的高台，是一筐土一筐土筑起来的；千里的远行，是从脚下第一步开始的。"
    },
    keywords: ["千里之行", "始于足下", "积累", "第六十四章", "做事"]
  }
];

// 简单的搜索函数（向后兼容）
export const searchKnowledge = (query: string): KnowledgeItem | null => {
  const fuse = new Fuse(knowledgeBase, {
    keys: ['content', 'keywords'],
    threshold: 0.4
  });
  
  const result = fuse.search(query);
  return result.length > 0 ? result[0].item : null;
};
