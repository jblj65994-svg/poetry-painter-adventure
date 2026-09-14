window.V3_GUIDANCE = {
  "version": "17.0",
  "audience": "4-6岁，以4岁、不识字儿童可独立完成为基准",
  "globalRules": {
    "completionPrinciple": "每关一个实体物件、一个动作、一个明确结果；遮住文字仍能完成",
    "narrationTiming": "进入任务先播放温柔旁白提问，提问结束后再开放操作",
    "interactionUnlock": "afterNarratorQuestionOrTapToSkip",
    "repeatQuestionButton": true,
    "narratorVoice": {
      "role": "温柔旁白",
      "tone": "亲切、带微笑感，像幼儿园老师蹲下来和孩子说话",
      "pace": "每秒约3.5-4.5个汉字，句尾自然上扬",
      "duration": "单题约3-6秒",
      "avoid": "播音腔、催促感、夸张娃娃音"
    },
    "idleHintSeconds": 4,
    "hintFlow": [
      "3秒未操作：播放hint1，同时让正确目标轻轻发光",
      "再等3秒：播放hint2，同时出现半透明小手完整演示",
      "仍未完成：角色陪伴完成，不扣星、不出现失败页"
    ],
    "allowedGestures": [
      "tap",
      "drag"
    ],
    "screenCopyRule": "childPrompt只作家长辅助，保持8-12个汉字；玩法不依赖识字",
    "feedbackRule": "首次触摸100毫秒内出现实体反馈；结果直接发生在主画面"
  },
  "worlds": {
    "lushan": {
      "title": "会变样子的山",
      "poemTitle": "题西林壁",
      "author": "宋·苏轼",
      "poem": [
        "横看成岭侧成峰",
        "远近高低各不同",
        "不识庐山真面目",
        "只缘身在此山中"
      ],
      "storyOpening": "小黑觉得自己最懂山，却发现唐韵和小夫子眼里的庐山都不一样。宝贝老师请孩子带小黑换位置观察。",
      "storyEnding": "小黑明白庐山没有偷偷变形，站的位置不同，看到的样子就会不同。大家一起展开《题西林壁》诗卷。",
      "steps": [
        {
          "step": 0,
          "learningGoal": "从不同方向观察，同一座山会呈现不同形状",
          "childPrompt": "送小黑去小亭子",
          "narratorQuestion": "按住小黑，把他送到小亭子吧。",
          "gesture": "drag",
          "visualInstruction": "小黑和小亭子都是大号实体物件；拖近亭子自动吸附，随后自然切换横看山岭与侧看山峰两个真实视角。",
          "hint1": "小亭子的旗子在招手呢。",
          "hint2": "按住小黑，拖到右边的小亭子。",
          "successVoice": "换了位置，长山岭变成尖山峰啦！",
          "storyBeat": "小黑走到新观景台，先看见长长的山岭，又看见高高的山峰。"
        },
        {
          "step": 1,
          "learningGoal": "理解远近会改变看到的范围和细节",
          "childPrompt": "点小船去远处",
          "narratorQuestion": "点点湖边的小船，我们去远处看山。",
          "gesture": "tap",
          "visualInstruction": "湖面上的木船轻轻起伏；点击整艘船即可，镜头跟着小船平稳拉远。",
          "hint1": "小船正在湖面上轻轻摇呀。",
          "hint2": "点一下湖边的木头小船。",
          "successVoice": "站远一点，整座庐山都看见啦！",
          "storyBeat": "小船划远后，群山、湖水和瀑布一起出现在眼前。"
        },
        {
          "step": 2,
          "learningGoal": "归纳视角不同、所见不同的诗意",
          "childPrompt": "点白鹤飞出群山",
          "narratorQuestion": "点点栏杆上的白鹤，跟它飞到山外吧。",
          "gesture": "tap",
          "visualInstruction": "白鹤是唯一可点目标；点击后展翅飞过云层，镜头升到群山之外。",
          "hint1": "白鹤在栏杆上拍翅膀呢。",
          "hint2": "点一下白白的大鸟。",
          "successVoice": "飞到山外，终于看清整座山啦！",
          "storyBeat": "小黑明白了，人在山里面时，很难一次看见山的全貌。"
        }
      ]
    },
    "xuemei": {
      "title": "谁更厉害呢",
      "poemTitle": "雪梅",
      "author": "宋·卢梅坡",
      "poem": [
        "梅雪争春未肯降",
        "骚人搁笔费评章",
        "梅须逊雪三分白",
        "雪却输梅一段香"
      ],
      "storyOpening": "白雪和梅花都说自己最棒，越争越不开心。宝贝老师请孩子帮它们寻找各自的闪光点。",
      "storyEnding": "白雪得到洁白徽章，梅花得到香气徽章。它们发现各有所长，握手装点同一座美丽花园。",
      "steps": [
        {
          "step": 0,
          "learningGoal": "通过视觉比较发现白雪更白",
          "childPrompt": "点雪云请雪落下",
          "narratorQuestion": "点点雪云，请白雪落下来吧。",
          "gesture": "tap",
          "visualInstruction": "点击有体积的雪云，真实雪晶分层落下并在梅枝、石桥和屋檐上积雪。",
          "hint1": "雪云鼓鼓的，里面藏着白雪。",
          "hint2": "点一下天空中的大雪云。",
          "successVoice": "白雪把山谷盖得白白的！",
          "storyBeat": "白雪轻轻落下，让整个梅园变得洁白明亮。"
        },
        {
          "step": 1,
          "learningGoal": "借助动态香气线索理解梅花更香",
          "childPrompt": "点花苞闻闻梅香",
          "narratorQuestion": "点点红花苞，闻闻梅花香不香。",
          "gesture": "tap",
          "visualInstruction": "一枚真实花苞轻轻起伏；点击后五瓣梅花分层绽放，角色凑近闻香，只出现少量柔焦花粉。",
          "hint1": "红花苞正在轻轻摇呢。",
          "hint2": "点一下枝头最大的红花苞。",
          "successVoice": "梅花开啦，闻起来真香！",
          "storyBeat": "梅花绽放了，唐韵闭上眼睛闻到了淡淡的花香。"
        },
        {
          "step": 2,
          "learningGoal": "理解事物各有所长，不做单一高低判断",
          "childPrompt": "把白雪送给梅枝",
          "narratorQuestion": "把白雪送到梅枝上，让它们做朋友吧。",
          "gesture": "drag",
          "visualInstruction": "拖动有颗粒和阴影的雪团到真实梅枝；大磁吸区域覆盖整段梅枝。",
          "hint1": "梅枝正在向白雪招手呢。",
          "hint2": "按住白雪，拖到红梅花上。",
          "successVoice": "雪更白，梅更香，它们都很棒！",
          "storyBeat": "白雪落在梅枝上，雪晶闪亮，梅花也开得更美了。"
        }
      ]
    },
    "flowers": {
      "title": "落花的新旅行",
      "poemTitle": "己亥杂诗·其五",
      "author": "清·龚自珍",
      "poem": [
        "浩荡离愁白日斜",
        "吟鞭东指即天涯",
        "落红不是无情物",
        "化作春泥更护花"
      ],
      "storyOpening": "唐韵看见花瓣落下，以为花儿要永远离开花园。小夫子告诉她，落花还有一段帮助新生命的旅行。",
      "storyEnding": "落花变成春泥，春泥照顾嫩芽，新花再次盛开。唐韵明白离开也能化作新的守护。",
      "steps": [
        {
          "step": 0,
          "learningGoal": "知道落花会落入泥土并开始转化",
          "childPrompt": "把落花送进木箱",
          "narratorQuestion": "把落花篮送进木箱，做成花肥吧。",
          "gesture": "drag",
          "visualInstruction": "拖动装满落花的竹篮到打开的木质堆肥箱；靠近箱口自动吸附并倾倒。",
          "hint1": "木箱打开盖子，在等落花呢。",
          "hint2": "按住竹篮，拖到右边的木箱。",
          "successVoice": "落花没有消失，它变成了有营养的花肥！",
          "storyBeat": "落花倒进木箱，和泥土混在一起，变成了花圃的新养分。"
        },
        {
          "step": 1,
          "learningGoal": "用时间变化理解落花化泥的过程",
          "childPrompt": "点花肥喂饱土地",
          "narratorQuestion": "点点花肥袋，给土地吃得饱饱的。",
          "gesture": "tap",
          "visualInstruction": "点击实体花肥袋，袋子自动倾斜，深色花肥均匀落入三条土沟。",
          "hint1": "花肥袋鼓鼓的，里面有新泥土。",
          "hint2": "点一下装满泥土的小袋子。",
          "successVoice": "土地吃饱啦，可以照顾新种子了！",
          "storyBeat": "花肥铺进土地，花圃变得松软又肥沃。"
        },
        {
          "step": 2,
          "learningGoal": "理解春泥滋养新生命，形成生命循环",
          "childPrompt": "点水壶浇开新花",
          "narratorQuestion": "点点水壶，给花圃喝水吧。",
          "gesture": "tap",
          "visualInstruction": "点击大水壶后自动浇水；土地变深，种子破土，双叶展开，最后真实花朵开放。",
          "hint1": "水壶嘴上有一颗小水滴。",
          "hint2": "点一下蓝色的大水壶。",
          "successVoice": "春泥保护种子，新花开出来啦！",
          "storyBeat": "春泥、清水和阳光一起照顾种子，新花终于开了。"
        }
      ]
    },
    "study": {
      "title": "亲手试一试",
      "poemTitle": "冬夜读书示子聿",
      "author": "宋·陆游",
      "poem": [
        "古人学问无遗力",
        "少壮工夫老始成",
        "纸上得来终觉浅",
        "绝知此事要躬行"
      ],
      "storyOpening": "冬夜里，小黑只看了一遍种植书，就说自己已经会种花。小夫子请孩子陪他把书里的方法亲手做一遍。",
      "storyEnding": "小黑看懂方法、种下种子并照顾嫩芽，终于把书本知识变成本领，也明白学习需要积累和实践。",
      "steps": [
        {
          "step": 0,
          "learningGoal": "先从图画书中找到行动方法",
          "childPrompt": "点图画书找办法",
          "narratorQuestion": "点点图画书，看看种子怎样长大。",
          "gesture": "tap",
          "visualInstruction": "桌面只有一本厚实图画书；点击整本书，三页大图依次自动翻动。",
          "hint1": "蓝色图画书的书角翘起来了。",
          "hint2": "点一下桌面上的蓝色大书。",
          "successVoice": "书里告诉我们，要种下去，还要浇水。",
          "storyBeat": "小黑看懂图画书，抱着种子来到花盆边。"
        },
        {
          "step": 1,
          "learningGoal": "亲手执行种植动作，理解实践",
          "childPrompt": "把种子放进小坑",
          "narratorQuestion": "按住种子，把它放进花盆的小坑里。",
          "gesture": "drag",
          "visualInstruction": "种子和花盆都足够大；整只花盆都是磁吸区，接近盆口后自动落入并盖土。",
          "hint1": "花盆中间有一个小小的坑。",
          "hint2": "按住种子，拖到右边的花盆。",
          "successVoice": "亲手把种子种好，真的学会啦！",
          "storyBeat": "种子种好了，还要浇水，耐心等待。"
        },
        {
          "step": 2,
          "learningGoal": "通过连续照顾完成实践，感受耐心积累",
          "childPrompt": "点水壶照顾种子",
          "narratorQuestion": "点点水壶，照顾我们种下的种子。",
          "gesture": "tap",
          "visualInstruction": "点击大水壶后自动浇水；窗外从冬夜变清晨，盆土鼓起，嫩芽破土。",
          "hint1": "水壶正在桌边轻轻摇呢。",
          "hint2": "点一下蓝色的大水壶。",
          "successVoice": "看书再亲手做，真的学会啦！",
          "storyBeat": "嫩芽钻出泥土，小黑终于把书本知识变成了本领。"
        }
      ]
    }
  }
}
;
