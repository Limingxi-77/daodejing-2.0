<template>
  <div class="min-h-screen pt-4 pb-20 px-4 md:px-8">
    <div class="container mx-auto max-w-6xl">
      <!-- Header -->
      <div class="text-center mb-12 animate-fade-in">
        <h1 class="text-4xl font-bold text-primary mb-4 font-serif">小小道童 · 智慧绘本</h1>
        <p class="text-lg text-gray-600 italic">
          "道可道，非常道" —— 让孩子也能听懂的东方智慧
        </p>
      </div>

      <!-- Story Selector -->
      <div v-if="!currentStory" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-slide-up">
        <div 
          v-for="story in stories" 
          :key="story.id"
          @click="startStory(story)"
          class="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl border border-secondary/10 group"
        >
          <div class="h-48 bg-primary/10 relative overflow-hidden">
             <!-- Placeholder Art -->
             <div class="absolute inset-0 flex items-center justify-center opacity-20 group-hover:scale-110 transition-transform duration-700">
               <i :class="story.icon" class="text-9xl text-primary"></i>
             </div>
             <div class="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/50 to-transparent">
               <span class="text-white font-bold text-lg"><i class="fas fa-book-open mr-2"></i> {{ story.chapter }}</span>
             </div>
          </div>
          <div class="p-6">
            <h3 class="text-xl font-bold text-dark mb-2 group-hover:text-primary transition-colors">{{ story.title }}</h3>
            <p class="text-gray-600 text-sm line-clamp-3 mb-4">{{ story.summary }}</p>
            <div class="flex items-center justify-between">
              <span class="text-xs px-2 py-1 bg-accent/10 text-accent rounded-full font-bold">适合年龄: {{ story.age }}</span>
              <span class="text-primary text-sm font-bold flex items-center group-hover:translate-x-1 transition-transform">
                开始阅读 <i class="fas fa-arrow-right ml-1"></i>
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Story Reader -->
      <div v-else class="max-w-4xl mx-auto animate-fade-in">
        <!-- Reader Controls -->
        <div class="flex justify-between items-center mb-6">
          <button @click="exitStory" class="text-gray-500 hover:text-primary flex items-center transition-colors">
            <i class="fas fa-chevron-left mr-2"></i> 返回书架
          </button>
          <div class="text-lg font-bold text-primary font-serif">
            {{ currentStory.title }} <span class="text-sm font-normal text-gray-400 mx-2">|</span> 第 {{ currentPage + 1 }} / {{ currentStory.pages.length }} 页
          </div>
          <button @click="toggleAutoPlay" class="text-primary hover:text-accent transition-colors" :title="isAutoPlay ? '暂停自动播放' : '自动播放'">
            <i :class="isAutoPlay ? 'fas fa-pause' : 'fas fa-play'"></i>
          </button>
        </div>

        <!-- Book Content -->
        <div class="bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-primary/10 relative aspect-[4/3] md:aspect-[16/9]">
          <!-- Page Transition Group -->
          <transition name="page-flip" mode="out-in">
            <div :key="currentPage" class="absolute inset-0 flex flex-col md:flex-row h-full">
              
              <!-- Left: Illustration -->
              <div class="w-full md:w-1/2 h-1/2 md:h-full bg-primary/5 relative overflow-hidden flex items-center justify-center p-8">
                 <div class="absolute inset-0 opacity-10">
                    <img src="https://s.coze.cn/image/H5ri4Ya3YII/" alt="texture" class="w-full h-full object-cover grayscale" loading="lazy" decoding="async" fetchpriority="low" />
                 </div>
                 
                 <!-- Dynamic Visual Element (Simulated AI Art) -->
                 <div class="relative z-10 text-center transform transition-all duration-1000 scale-100" :class="{'scale-105': isAutoPlay}">
                   <i :class="currentStory.pages[currentPage].icon" class="text-[8rem] md:text-[12rem] text-primary/80 drop-shadow-xl animate-float"></i>
                 </div>
              </div>

              <!-- Right: Text -->
              <div class="w-full md:w-1/2 h-1/2 md:h-full p-8 md:p-12 flex flex-col justify-center bg-white relative">
                 <div class="absolute top-4 right-4 opacity-20">
                   <i class="fas fa-yin-yang text-4xl text-secondary"></i>
                 </div>
                 
                 <div class="mb-6">
                   <span class="inline-block px-3 py-1 bg-accent/10 text-accent text-xs font-bold rounded-full mb-4">
                     原文：{{ currentStory.pages[currentPage].quote }}
                   </span>
                   <p class="text-xl md:text-2xl font-bold text-dark leading-relaxed font-serif">
                     {{ currentStory.pages[currentPage].text }}
                   </p>
                 </div>

                 <div class="mt-auto">
                    <div class="p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                      <p class="text-sm text-gray-600 flex items-start">
                        <i class="fas fa-lightbulb text-yellow-500 mt-1 mr-2 flex-shrink-0"></i>
                        <span>{{ currentStory.pages[currentPage].insight }}</span>
                      </p>
                    </div>
                 </div>
              </div>

            </div>
          </transition>

          <!-- Navigation Buttons -->
          <button 
            @click="prevPage" 
            class="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 rounded-full bg-white/80 backdrop-blur-sm shadow-lg flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all z-20"
            :disabled="currentPage === 0"
            :class="{'opacity-0 pointer-events-none': currentPage === 0}"
          >
            <i class="fas fa-chevron-left"></i>
          </button>
          
          <button 
            @click="nextPage" 
            class="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 rounded-full bg-white/80 backdrop-blur-sm shadow-lg flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all z-20"
            :disabled="currentPage === currentStory.pages.length - 1"
            :class="{'opacity-0 pointer-events-none': currentPage === currentStory.pages.length - 1}"
          >
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>

        <!-- Progress Bar -->
        <div class="mt-6 flex items-center justify-center space-x-2">
          <button 
            v-for="(_, idx) in currentStory.pages" 
            :key="idx"
            @click="currentPage = idx"
            class="w-3 h-3 rounded-full transition-all duration-300"
            :class="currentPage === idx ? 'bg-primary w-8' : 'bg-gray-300 hover:bg-gray-400'"
          ></button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'

interface Page {
  text: string
  quote: string
  insight: string
  icon: string
}

interface Story {
  id: number
  title: string
  chapter: string
  summary: string
  age: string
  icon: string
  pages: Page[]
}

const stories: Story[] = [
  {
    id: 1,
    title: '牙齿与舌头的故事',
    chapter: '第七十六章',
    summary: '为什么坚硬的牙齿会掉光，而柔软的舌头却能一直存在？通过这个故事，让孩子理解“柔弱胜刚强”的道理。',
    age: '3-6岁',
    icon: 'fas fa-smile',
    pages: [
      {
        text: '很久很久以前，嘴巴里住着两个邻居：一个是坚硬的牙齿大哥，一个是柔软的舌头小弟。牙齿大哥总是嘲笑舌头：“看我多强壮，甚至能咬碎骨头！”',
        quote: '人之生也柔弱，其死也坚强。',
        insight: '刚出生的小草是柔软的，枯死的大树是僵硬的。柔软代表着生命力。',
        icon: 'fas fa-tooth'
      },
      {
        text: '可是有一天，老爷爷年纪大了。坚硬的牙齿大哥一颗一颗地掉光了，最后只剩下空空的牙床。',
        quote: '坚强处下，柔弱处上。',
        insight: '过于刚强的东西容易折断，不懂得退让反而会受到伤害。',
        icon: 'fas fa-skull'
      },
      {
        text: '而那个看起来软软的舌头小弟，却依然健康地住在嘴巴里，每天快乐地品尝美食，帮老爷爷说话。',
        quote: '天下之至柔，驰骋天下之至坚。',
        insight: '舌头虽然柔软，却比牙齿更长久。这就是“以柔克刚”的智慧。',
        icon: 'fas fa-comments'
      },
      {
        text: '小朋友，做人也要像舌头一样，温和待人，不随意发脾气。这样不仅能交到更多朋友，自己也会更快乐哦！',
        quote: '柔弱胜刚强。',
        insight: '真正的强大不是靠拳头，而是靠一颗包容和温和的心。',
        icon: 'fas fa-heart'
      }
    ]
  },
  {
    id: 2,
    title: '江海爷爷的智慧',
    chapter: '第六十六章',
    summary: '大海为什么能成为所有河流的王者？因为它懂得处于低处。教导孩子学会谦虚和包容。',
    age: '5-8岁',
    icon: 'fas fa-water',
    pages: [
      {
        text: '小溪流问江海爷爷：“为什么所有的河流都要流向您？您有什么魔法吗？”',
        quote: '江海所以能为百谷王者，以其善下之。',
        insight: '每个人都想往高处走，但真正伟大的人懂得放低姿态。',
        icon: 'fas fa-tint'
      },
      {
        text: '江海爷爷笑着说：“因为我总是呆在最低的地方呀。我不和高山争高，也不和云朵比美，我只是张开怀抱接纳每一滴水。”',
        quote: '故能为百谷王。',
        insight: '因为愿意处于低位，所以能汇聚所有的力量。',
        icon: 'fas fa-hand-holding-water'
      },
      {
        text: '小溪流明白了，原来谦虚不是软弱，而是一种巨大的力量。它开心地奔向大海的怀抱，变成了广阔海洋的一部分。',
        quote: '欲上民，必以言下之。',
        insight: '想要得到别人的支持，首先要懂得尊重和谦让。',
        icon: 'fas fa-users'
      },
      {
        text: '小朋友，我们在学校里也要像大海一样，不骄傲自大，愿意倾听别人的意见，这样大家都会喜欢和你玩。',
        quote: '圣人处上而民不重，处前而民不害。',
        insight: '谦虚的人，大家都愿意推举他；骄傲的人，大家都想远离他。',
        icon: 'fas fa-child'
      }
    ]
  },
  {
    id: 3,
    title: '不争第一的小蜗牛',
    chapter: '第八章',
    summary: '水滋润万物却不争功劳。通过小蜗牛的故事，告诉孩子默默奉献和不争不抢的快乐。',
    age: '4-7岁',
    icon: 'fas fa-leaf',
    pages: [
      {
        text: '森林里举行赛跑，大家都争着当第一。只有小蜗牛慢吞吞地在路边爬，它看见渴了的小花，就给它浇点水。',
        quote: '上善若水。',
        insight: '最好的品德就像水一样，滋润万物。',
        icon: 'fas fa-seedling'
      },
      {
        text: '它看见路脏了，就帮忙扫一扫。虽然它最后一名到达终点，但大家都围过来感谢它。',
        quote: '水善利万物而不争。',
        insight: '帮助别人而不求回报，不与人争抢利益。',
        icon: 'fas fa-broom'
      },
      {
        text: '老虎虽然跑了第一，但它推倒了小树，踩坏了花草，大家都不喜欢它。小蜗牛虽然慢，但它收获了最多的朋友。',
        quote: '夫唯不争，故无尤。',
        insight: '正因为不争抢，所以不会招来怨恨和烦恼。',
        icon: 'fas fa-angry'
      },
      {
        text: '就像水一样，流到哪里，哪里就充满生机。做一个像水一样善良、乐于助人的孩子吧！',
        quote: '故几于道。',
        insight: '这种品质最接近于”道”的境界。',
        icon: 'fas fa-star'
      }
    ]
  },
  {
    id: 4,
    title: '空碗的魔法',
    chapter: '第十一章',
    summary: '一只空碗有什么用？正是因为它是空的，才能装下美味的饭菜。让孩子理解”无”的价值。',
    age: '4-7岁',
    icon: 'fas fa-bowl-food',
    pages: [
      {
        text: '小猴子捡到一只漂亮的碗，可是碗里空空的，什么也没有。它失望地说：”空碗有什么用呢？”',
        quote: '三十辐共一毂，当其无，有车之用。',
        insight: '车轮中心是空的，正因为空，轮子才能转动。空也是一种力量。',
        icon: 'fas fa-circle-notch'
      },
      {
        text: '兔妈妈笑着说：”来，把碗放在桌上。”她往空碗里盛满了香喷喷的米饭和蔬菜。',
        quote: '埏埴以为器，当其无，有器之用。',
        insight: '陶工把泥土捏成中空的碗，正因为空，才能盛放东西。',
        icon: 'fas fa-utensils'
      },
      {
        text: '小猴子又问：”那如果碗装满了呢？”兔妈妈说：”装满了就不能再装了。空碗才能不断装入新的美食呀。”',
        quote: '凿户牖以为室，当其无，有室之用。',
        insight: '房子因为有空间才能住人。保持”空”的状态，才能不断接受新东西。',
        icon: 'fas fa-house'
      },
      {
        text: '小猴子明白了：原来”空”不是没用，而是最有用的！就像学习时，要保持一颗空杯心态，才能学到更多知识。',
        quote: '故有之以为利，无之以为用。',
        insight: '”有”给我们便利，”无”才是真正发挥作用的地方。保持谦虚好学的心吧！',
        icon: 'fas fa-lightbulb'
      }
    ]
  },
  {
    id: 5,
    title: '月亮变变变',
    chapter: '第二章',
    summary: '月亮从弯弯的月牙变成圆圆的满月，又变回去。告诉孩子世间万物都在变化，好事坏事也会互相转换。',
    age: '3-6岁',
    icon: 'fas fa-moon',
    pages: [
      {
        text: '小兔子抬头看天，月亮弯弯的像一只小船。它叹气说：”月亮好小呀，我想要大大的圆月亮。”',
        quote: '有无相生。',
        insight: '有了”小”才有”大”，有了”弯”才有”圆”。一切都是相互依存的。',
        icon: 'fas fa-moon'
      },
      {
        text: '猫头鹰爷爷说：”别着急，等一等。”过了好多天，月亮真的变圆了，像一个银色的大盘子挂在天上！',
        quote: '难易相成。',
        insight: '困难和容易是互相成就的。耐心等待，难的事也会变容易。',
        icon: 'fas fa-circle'
      },
      {
        text: '可是又过了几天，月亮又变回了弯弯的月牙。小兔子着急了：”月亮消失了怎么办？”',
        quote: '长短相形，高下相倾。',
        insight: '长和短、高和低都是相对的。没有一成不变的事物。',
        icon: 'fas fa-minus-circle'
      },
      {
        text: '猫头鹰爷爷笑着说：”放心，月亮从来没有消失。它只是躲在太阳背后休息，过几天又会回来的。变化，才是世界的规律呀。”',
        quote: '万物作而弗始，生而弗有。',
        insight: '万物自然生长变化，不必强求。接受变化，才能看到更多美好。',
        icon: 'fas fa-infinity'
      }
    ]
  },
  {
    id: 6,
    title: '风和石头谁更厉害',
    chapter: '第四十三章',
    summary: '大风吹不动石头，但小小的水滴却能穿透岩石。世界上最强大的力量，往往是最柔软的。',
    age: '5-8岁',
    icon: 'fas fa-wind',
    pages: [
      {
        text: '狂风对石头喊：”我力气最大！看我把你吹倒！”它使劲地吹啊吹，可石头纹丝不动。',
        quote: '天下之至柔，驰骋天下之至坚。',
        insight: '天下最柔软的东西，能穿透最坚硬的东西。',
        icon: 'fas fa-mountain'
      },
      {
        text: '旁边的小水滴听见了，它轻轻地落在石头上，一滴、两滴、三滴……每天都落在同一个地方。',
        quote: '无有入无间。',
        insight: '没有形状的东西，能进入没有缝隙的地方。水虽无形，却无处不在。',
        icon: 'fas fa-droplet'
      },
      {
        text: '一年、两年、十年过去了。石头上竟然被小水滴穿出了一个小洞！狂风看得目瞪口呆。',
        quote: '天下莫柔弱于水，而攻坚强者莫之能胜。',
        insight: '天下没有比水更柔弱的东西，但攻克坚硬的东西却没有什么能胜过它。',
        icon: 'fas fa-bullseye'
      },
      {
        text: '小水滴笑着说：”我从来不和石头比力气，我只是坚持做自己该做的事。坚持和柔软，就是我最大的力量。”',
        quote: '弱之胜强，柔之胜刚。',
        insight: '柔软能战胜刚强，坚持能战胜困难。每天进步一点点，就能创造奇迹！',
        icon: 'fas fa-hands-holding-child'
      }
    ]
  },
  {
    id: 7,
    title: '知足的小松鼠',
    chapter: '第四十六章',
    summary: '小松鼠只收集够吃的松果，不多也不少。它为什么这么快乐？因为它懂得”知足”。',
    age: '4-7岁',
    icon: 'fas fa-paw',
    pages: [
      {
        text: '秋天到了，松鼠们都忙着收集松果。小松鼠乐乐只收集了一小筐，够冬天吃就行了。',
        quote: '天下有道，却走马以粪。',
        insight: '当天下有道的时候，人们安居乐业，不会过度索取。',
        icon: 'fas fa-basket-shopping'
      },
      {
        text: '隔壁的松鼠囤囤却收集了满满十大筐！它累得腰酸背痛，还不满足，说：”还要更多！”',
        quote: '祸莫大于不知足。',
        insight: '最大的灾祸就是不知道满足。贪心会让人失去快乐。',
        icon: 'fas fa-warehouse'
      },
      {
        text: '冬天下了大雪。囤囤的松果太多吃不完，很多都坏掉了。而乐乐每天吃得刚刚好，还能在雪地里开心地玩耍。',
        quote: '咎莫大于欲得。',
        insight: '最大的过错就是贪得无厌。适度拥有，才能真正享受生活。',
        icon: 'fas fa-snowflake'
      },
      {
        text: '春天来了，乐乐精神饱满地迎接新的一年。囤囤却因为整个冬天都在担心松果而疲惫不堪。知足的人，才是最富有的人。',
        quote: '知足之足，常足矣。',
        insight: '知道满足的那种满足，才是永远的满足。学会珍惜眼前拥有的，你就是最快乐的人！',
        icon: 'fas fa-face-smile'
      }
    ]
  },
  {
    id: 8,
    title: '认识自己的小刺猬',
    chapter: '第三十三章',
    summary: '小刺猬总想变成别人，后来才发现做自己才是最好的。帮助孩子学会认识自己、接纳自己。',
    age: '3-6岁',
    icon: 'fas fa-feather-pointed',
    pages: [
      {
        text: '小刺猬看到小猫被主人抱着，很羡慕。它也想被抱，可是它的刺总是扎到别人。',
        quote: '知人者智，自知者明。',
        insight: '了解别人是聪明，了解自己才是真正的智慧。',
        icon: 'fas fa-cat'
      },
      {
        text: '它看到小鸟会飞，也想飞。它用树叶做了翅膀，从山坡上跳下去，结果摔了个四脚朝天。',
        quote: '胜人者有力，自胜者强。',
        insight: '能战胜别人是有力量，能战胜自己才是真正的强大。',
        icon: 'fas fa-dove'
      },
      {
        text: '刺猬妈妈摸摸它的头说：”你不需要变成别人呀。你的刺能保护自己，还能背果子回家，这是别的动物做不到的。”',
        quote: '知足者富。',
        insight: '知道自己拥有什么并且感到满足，就是真正的富有。',
        icon: 'fas fa-shield-halved'
      },
      {
        text: '小刺猬终于明白了：它不需要变成小猫或小鸟，做一只快乐的小刺猬就很好！每个人都是独一无二的，学会爱自己，才是最大的智慧。',
        quote: '强行者有志，不失其所者久。',
        insight: '努力前行的人有志气，不迷失自我的人才能长久。做最好的自己！',
        icon: 'fas fa-heart'
      }
    ]
  },
  {
    id: 9,
    title: '彩虹为什么有七种颜色',
    chapter: '第四十一章',
    summary: '大雨过后出现了一道美丽的彩虹。每种颜色都很重要，少了哪一种都不完整。告诉孩子世界的多样之美。',
    age: '5-8岁',
    icon: 'fas fa-rainbow',
    pages: [
      {
        text: '大雨过后，天空出现了彩虹。红色骄傲地说：”我最鲜艳，彩虹少了我肯定不好看！”',
        quote: '大方无隅。',
        insight: '最大的方正没有棱角。真正伟大的事物，不会刻意彰显自己。',
        icon: 'fas fa-palette'
      },
      {
        text: '蓝色不服气：”天空和大海都是我的颜色，我才是最重要的！”每种颜色都觉得自己最厉害，吵成了一团。',
        quote: '大音希声。',
        insight: '最大的声音反而听不见。真正的力量不需要大声喧哗。',
        icon: 'fas fa-volume-xmark'
      },
      {
        text: '太阳公公笑着说：”你们每一种颜色都很美，但只有合在一起，才能变成彩虹呀。如果只有一种颜色，那还叫彩虹吗？”',
        quote: '大象无形。',
        insight: '最大的形象反而没有固定的形状。真正的伟大包容一切形态。',
        icon: 'fas fa-sun'
      },
      {
        text: '颜色们听了都不好意思地笑了。它们手拉手，变成了一道七彩的虹桥。世界上每个人都不一样，正因为不同，世界才这么美丽！',
        quote: '道隐无名，夫唯道，善贷且成。',
        insight: '”道”默默无闻地帮助万物成长。每个人都有自己的价值，合作才能创造最美的风景！',
        icon: 'fas fa-people-group'
      }
    ]
  }
]

const currentStory = ref<Story | null>(null)
const currentPage = ref(0)
const isAutoPlay = ref(false)
let autoPlayInterval: number | null = null

const startStory = (story: Story) => {
  currentStory.value = story
  currentPage.value = 0
  isAutoPlay.value = false
}

const exitStory = () => {
  stopAutoPlay()
  currentStory.value = null
}

const nextPage = () => {
  if (currentStory.value && currentPage.value < currentStory.value.pages.length - 1) {
    currentPage.value++
  } else {
    stopAutoPlay() // Stop at the end
  }
}

const prevPage = () => {
  if (currentPage.value > 0) {
    currentPage.value--
  }
}

const toggleAutoPlay = () => {
  if (isAutoPlay.value) {
    stopAutoPlay()
  } else {
    startAutoPlay()
  }
}

const startAutoPlay = () => {
  isAutoPlay.value = true
  autoPlayInterval = window.setInterval(() => {
    nextPage()
  }, 5000) // 5 seconds per page
}

const stopAutoPlay = () => {
  isAutoPlay.value = false
  if (autoPlayInterval) {
    clearInterval(autoPlayInterval)
    autoPlayInterval = null
  }
}

onUnmounted(() => {
  stopAutoPlay()
})
</script>

<style scoped>
.page-flip-enter-active,
.page-flip-leave-active {
  transition: all 0.6s cubic-bezier(0.4, 0.0, 0.2, 1);
}

.page-flip-enter-from {
  opacity: 0;
  transform: rotateY(-90deg);
  transform-origin: left center;
}

.page-flip-leave-to {
  opacity: 0;
  transform: rotateY(90deg);
  transform-origin: right center;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}

/* Zen Mode Support */
:global(html.zen-mode) .bg-white {
  background-color: #2c2c2e;
  border-color: #3f3f46;
}

:global(html.zen-mode) .text-primary {
  color: #d4b483;
}

:global(html.zen-mode) .text-dark {
  color: #d1d5db;
}

:global(html.zen-mode) .text-gray-600,
:global(html.zen-mode) .text-gray-500 {
  color: #9ca3af;
}

:global(html.zen-mode) .bg-primary\/5,
:global(html.zen-mode) .bg-primary\/10 {
  background-color: rgba(212, 180, 131, 0.1);
}

:global(html.zen-mode) .bg-yellow-50 {
  background-color: rgba(234, 179, 8, 0.1);
  border-color: rgba(234, 179, 8, 0.2);
}

:global(html.zen-mode) .text-yellow-500 {
  color: #fbbf24;
}
</style>
