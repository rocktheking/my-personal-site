const poems = [
    {
        title: '沁园春-游武汉长江一桥',
        subtitle: '',
        body: `风过汉水，云灼楚天，月漾高秋。\n望一桥虬劲，两山静穆，三镇灯火，万千重楼。\n黄鹤归去，芳草含羞，大江自古向东流。\n忆千年，问波涛洗尽，谁家吴钩。\n\n梦回鹦鹉洲头，随昔年星海少年游。\n答人间换了，世界当惊，雄关漫道，浪涌飞舟。\n有志同学，无姓王侯，十亿神州竞自由。\n当自强，虽千帆共逐，我立潮头。`,
        imageUrl: 'https://r2.flowith.net/files/8bc32a4b-b597-4551-af99-e424e06bbc8a/1751351528027-%E6%B2%81%E5%9B%AD%E6%98%A5%C2%B7%E6%B8%B8%E6%AD%A6%E6%B1%89%E9%95%BF%E6%B1%9F%E4%B8%80%E6%A1%A5@1440x1080.jpg'
    },
    {
        title: '七律-过大别山',
        subtitle: '（党庆日，过大别山，谒烈士陵，见王步文与妻诀别书，心潮澎湃，歌以咏之。）',
        body: `铁铸苍山峰如炬，玉染竹林浪千层。\n无边大地埋忠骨，浩荡浮云颂英魂。\n身世浮沉家国爱，肝胆昆仑主义真。\n莫道英雄空热血，亦是多情亦凡人。`,
        imageUrl: 'https://r2.flowith.net/files/8bc32a4b-b597-4551-af99-e424e06bbc8a/1751351503571-%E4%B8%83%E5%BE%8B%C2%B7%E8%BF%87%E5%A4%A7%E5%88%AB%E5%B1%B1@1024x1556.jpg'
    },
    {
        title: '送祖母老安人入南昌宫歌',
        subtitle: '（癸卯岁末，祖母老安人驾鹤仙逝，追思先人，悲不能已，呜呼哀哉，长歌当泣。遂作送祖母老安人入南昌宫歌，歌曰：）',
        body: `槛外黄鹤空悲泣，榻前白冠缓低吟。\n青山白云悄送客，脱蜕凡躯入幽冥。\n彼岸花畔黄泉路，三途河前望乡亭。\n桥头孟婆惊作揖，殿内阎罗喜相迎。\n自言本是乱世女，生长汉水乐楚音。\n曾见山河成火海，也闻人命草芥轻。\n天命伟人开盛世，诸公夙寐谋安宁。\n长命百岁自喜乐，寿终正寝无憾情。\n崔判恭对波劫尽，自当还复旧姓名。\n驾六龙兮入瑶池，直上五城白玉京。\n腾蛇凤凰齐颂祷，风伯雨师舞雷霆。\n返本还源得自我，洗尽铅华复真灵。\n三清四御皆作客，赐宴昆仑松柏青。\n蟠桃琼浆溢金樽，玄女麻姑击玉罄。\n八仙九曜齐贺寿，七宝龙珠羊脂瓶。\n还杯真武笑雍容，执手东王泪语盈。\n曾见精卫能填海，尝闻嫦娥夜夜心。\n此去凡尘九十载，风雪从容踏莎行。\n万古神话尘与土，百年茶饭天共云。\n天若有爱天亦老，人间何日无真晴。\n噫吁兮复噫吁兮，送老安人踏莎行。\n噫吁兮复噫吁兮，故园行行重行行。\n佑我国家多昌盛，怜汝子孙少灾病。\n清明寒食多加餐，于梦萦处寄叮咛。`,
        imageUrl: 'https://r2.flowith.net/files/8bc32a4b-b597-4551-af99-e424e06bbc8a/1751351451517-%E9%80%81%E7%A5%96%E6%AF%8D%E8%80%81%E5%AE%89%E4%BA%BA%E5%85%A5%E5%8D%97%E6%98%8C%E5%AE%AB%E6%AD%8C@769x500.jpg'
    },
    {
        title: '忆秦娥·北京',
        subtitle: '',
        body: `西风咽，落木萧萧又一年，\n又一年，玉盘有缺，春梦难圆。\n\n长安不见朔方雪，\n酒醒应有凌云月，\n凌云月，曾有少年，壮怀激烈。`,
        imageUrl: 'https://r2.flowith.net/files/8bc32a4b-b597-4551-af99-e424e06bbc8a/1751351452104-%E5%BF%86%E7%A7%A6%E5%A8%A5%C2%B7%E5%8C%97%E4%BA%AC@1080x1329.jpeg'
    },
    {
        title: '渔家傲-中场-孟晚舟回国',
        subtitle: '',
        body: `千日羁旅在绝地，家国不离人不弃。\n英刀美斧混不惧，莫悲泣，晚舟虽远终归去。\n使馆烽火火未熄，南海忠骨骨犹立，\n族恨国耻终未洗，需自强，十亿愚公移山易。`,
        imageUrl: 'https://r2.flowith.net/files/8bc32a4b-b597-4551-af99-e424e06bbc8a/1751351503410-%E6%B8%94%E5%AE%B6%E5%82%B2%C2%B7%E4%B8%AD%E5%9C%BA%C2%B7%E5%AD%9F%E6%99%9A%E8%88%9F%E5%9B%9E%E5%9B%BD@800x600.jpg'
    },
    {
        title: '七律党庆献礼',
        subtitle: '',
        body: `百年波折别歧路，万里萧疏觅新途。\n卫此青山荐碧血，守我沧海献头颅。\n粉身碎骨家零落，披肝沥胆国兴复。\n自古创业多悲壮，敢问浮沉复谁主。`,
        imageUrl: 'https://r2.flowith.net/files/8bc32a4b-b597-4551-af99-e424e06bbc8a/1751351451975-%E4%B8%83%E5%BE%8B%E5%85%9A%E5%BA%86%E7%8C%AE%E7%A4%BC@1200x800.jpeg'
    },
    {
        title: '过汶川',
        subtitle: '',
        body: `九龙入南海，双桥笑飞舟。\n经帆浮云过，羌山楼外楼。\n白石水中走，青莲天上游。\n汶川今如何，国人当长留。`,
        imageUrl: 'https://r2.flowith.net/files/8bc32a4b-b597-4551-af99-e424e06bbc8a/1751351503832-%E8%BF%87%E6%B1%B6%E5%B7%9D@1440x1080.jpg'
    },
    {
        title: '京城骤雨',
        subtitle: '',
        body: `独上小楼听秋水，重回大都望春潮。\n雷自星河勾银树，雨从沧海化碧涛。\n金瓯浩荡风驱鬼，玉宇澄清云捕妖。\n黑山墨岭同瘟去，明烛纸船照天烧。`,
        imageUrl: 'https://r2.flowith.net/files/8bc32a4b-b597-4551-af99-e424e06bbc8a/1751351503395-%E4%BA%AC%E5%9F%8E%E9%AA%A4%E9%9B%A8@1124x638.jpg'
    },
    {
        title: '过四姑娘山',
        subtitle: '',
        body: `锦官城外山之巅，怪石凌空舞翩跹。\n千里蜿蜒龙负雪，万丈狰狞虎啸天。\n常听罡风翻绿浪，更有巧云卧山前。\n莫叹穿山路修远，斜阳耀处是新年。`,
        imageUrl: 'https://github.com/rocktheking/pic/blob/main/%E8%BF%87%E5%9B%9B%E5%A7%91%E5%A8%98%E5%B1%B1.jpg?raw=true'
    },
    {
        title: '祭李文亮',
        subtitle: '',
        body: `昨夜神州皆祝祷，今朝华夏祭楚风；\n江城雪雨曾潇洒，泉台江月应从容；\n引兵壮士手中哨，布阵珞珈山上松；\n任重道远当弘毅，莫道凡人非英雄。`,
        imageUrl: 'https://r2.flowith.net/files/8bc32a4b-b597-4551-af99-e424e06bbc8a/1751351451627-%E7%A5%AD%E6%9D%8E%E6%96%87%E4%BA%AE@575x901.jpeg'
    },
    {
        title: '采桑子·除夕',
        subtitle: '（2020年除夕，疫情遍地、困于南粤；武汉封城，独过除夕。心情激荡，作《采桑子》一首，以寄忧思。）',
        body: `江城夜冷人亦冷\n岁岁团圆\n今不团圆\n战时家国两难全\n\n虎兕脱匣谁之罪\n苦也人间\n怒也人间\n欲贺新年却无言`,
        imageUrl: 'https://r2.flowith.net/files/8bc32a4b-b597-4551-af99-e424e06bbc8a/1751351451785-%E9%87%87%E6%A1%91%E5%AD%90%C2%B7%E9%99%A4%E5%A4%95@849x1280.jpeg'
    },
    {
        title: '鼓浪屿谒郑成功像',
        subtitle: '',
        body: `鼓浪屿外海波柔，临风望岛登重楼。\n手揽长锋震夷寇，足跨玄岩慑敌酋。\n三帆昨日惊世界，五洋明朝入华流。\n一国何堪分两岸，七十年来几白头？`,
        imageUrl: 'https://r2.flowith.net/files/8bc32a4b-b597-4551-af99-e424e06bbc8a/1751351527916-%E9%BC%93%E6%B5%AA%E5%B1%BF%E8%B0%92%E9%83%91%E6%88%90%E5%8A%9F%E5%83%8F@1440x1080.jpg'
    }
];

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('poems-container');
    if (!container) return;

    poems.forEach((poem, index) => {
        const poemContainer = document.createElement('div');
        poemContainer.className = 'poem-container bg-white p-6 sm:p-10 rounded-xl shadow-lg shadow-stone-200/50 border border-stone-200/50 mb-16 lg:mb-24';

        const poemGrid = document.createElement('div');
        poemGrid.className = 'grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 items-center';

        const imageSide = document.createElement('div');
        if (poem.imageUrl) {
            imageSide.innerHTML = `<img src="${poem.imageUrl}" alt="配图：${poem.title}" class="w-full aspect-[4/3] sm:aspect-square object-cover rounded-lg shadow-md shadow-stone-300/40">`;
        } else {
            imageSide.innerHTML = `<div class="w-full aspect-[4/3] sm:aspect-square bg-stone-100/80 border border-dashed border-stone-300 rounded-lg flex items-center justify-center"><span class="text-7xl text-stone-400 font-ma-shan-zheng">詩</span></div>`;
        }

        const textSide = document.createElement('div');
        textSide.innerHTML = `
            <h2 class="text-4xl lg:text-5xl font-ma-shan-zheng mb-3 text-stone-800">${poem.title}</h2>
            ${poem.subtitle ? `<p class="text-base text-stone-500 mb-6 italic font-sans">${poem.subtitle}</p>` : ''}
            <div class="text-lg lg:text-xl leading-relaxed lg:leading-loose text-stone-700 whitespace-pre-line">${poem.body}</div>
        `;

        if (index % 2 !== 0) {
            poemGrid.appendChild(textSide);
            poemGrid.appendChild(imageSide);
        } else {
            poemGrid.appendChild(imageSide);
            poemGrid.appendChild(textSide);
        }

        poemContainer.appendChild(poemGrid);
        container.appendChild(poemContainer);
    });
});
