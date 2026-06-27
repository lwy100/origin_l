// 旅行数据按“区域清单 + 推荐池”组织，方便后续继续添加。
// 新增地点时保持字段一致：{ province, city, name, tag, visited, kind }

const sourcePlaces = [
  // 东北：东北、华北、内蒙古、北京天津河北山东
  { province:"北京", city:"北京", name:"故宫博物院", tag:"5A · 世界遗产", visited:false, kind:"heritage" },
  { province:"北京", city:"北京", name:"天坛公园", tag:"5A · 世界遗产", visited:false, kind:"heritage" },
  { province:"北京", city:"北京", name:"颐和园", tag:"5A · 世界遗产", visited:false, kind:"heritage" },
  { province:"北京", city:"北京", name:"八达岭长城", tag:"5A · 世界遗产", visited:false, kind:"heritage" },
  { province:"北京", city:"北京", name:"北京中轴线", tag:"世界遗产 · 城市漫游", visited:false, kind:"heritage" },
  { province:"天津", city:"天津", name:"古文化街·津门故里", tag:"5A · 老城散步", visited:false, kind:"5a" },
  { province:"天津", city:"天津", name:"盘山风景名胜区", tag:"5A · 山野", visited:false, kind:"5a" },
  { province:"河北", city:"秦皇岛", name:"山海关景区", tag:"5A · 长城入海", visited:false, kind:"5a" },
  { province:"河北", city:"承德", name:"承德避暑山庄及周围寺庙", tag:"5A · 世界遗产", visited:false, kind:"heritage" },
  { province:"山西", city:"大同", name:"云冈石窟", tag:"5A · 世界遗产", visited:false, kind:"heritage" },
  { province:"山西", city:"忻州", name:"五台山", tag:"5A · 世界遗产", visited:false, kind:"heritage" },
  { province:"山西", city:"晋中", name:"平遥古城", tag:"世界遗产 · 古城", visited:false, kind:"heritage" },
  { province:"辽宁", city:"沈阳", name:"沈阳故宫", tag:"世界遗产 · 宫殿", visited:false, kind:"heritage" },
  { province:"辽宁", city:"大连", name:"老虎滩海洋公园", tag:"5A · 海边", visited:false, kind:"5a" },
  { province:"吉林", city:"长白山", name:"长白山景区", tag:"5A · 火山天池", visited:false, kind:"5a" },
  { province:"吉林", city:"长春", name:"伪满皇宫博物院", tag:"5A · 历史", visited:false, kind:"5a" },
  { province:"黑龙江", city:"哈尔滨", name:"太阳岛公园", tag:"5A · 冰城", visited:false, kind:"5a" },
  { province:"黑龙江", city:"哈尔滨", name:"中华巴洛克街区", tag:"小众城市漫游", visited:false, kind:"niche" },
  { province:"山东", city:"泰安", name:"泰山", tag:"5A · 世界遗产", visited:false, kind:"heritage" },
  { province:"山东", city:"济宁", name:"曲阜三孔", tag:"5A · 世界遗产", visited:false, kind:"heritage" },
  { province:"山东", city:"威海", name:"那香海与火炬八街", tag:"高热海边漫游", visited:false, kind:"hot" },
  { province:"内蒙古", city:"阿拉善", name:"巴丹吉林沙漠", tag:"世界遗产 · 沙漠湖泊", visited:false, kind:"heritage" },

  // 东南：上海、江苏、浙江、安徽、福建、江西、广东、海南、港澳
  { province:"上海", city:"上海", name:"武康路-安福路街区", tag:"城市漫游 · 咖啡散步", visited:false, kind:"city" },
  { province:"上海", city:"上海", name:"东方明珠广播电视塔", tag:"5A · 城市地标", visited:false, kind:"5a" },
  { province:"江苏", city:"南京", name:"钟山风景名胜区", tag:"5A · 城市山林", visited:false, kind:"5a" },
  { province:"江苏", city:"南京", name:"秦淮河夫子庙", tag:"5A · 夜游", visited:false, kind:"city" },
  { province:"江苏", city:"苏州", name:"苏州古典园林", tag:"5A · 世界遗产", visited:false, kind:"heritage" },
  { province:"江苏", city:"苏州", name:"平江路历史街区", tag:"城市漫游 · 江南", visited:false, kind:"city" },
  { province:"江苏", city:"无锡", name:"鼋头渚", tag:"高热赏樱地", visited:false, kind:"hot" },
  { province:"浙江", city:"杭州", name:"西湖风景名胜区", tag:"5A · 世界遗产", visited:false, kind:"heritage" },
  { province:"浙江", city:"杭州", name:"西溪湿地", tag:"5A · 城市自然", visited:false, kind:"city" },
  { province:"浙江", city:"湖州", name:"莫干山", tag:"高热周末度假", visited:false, kind:"hot" },
  { province:"浙江", city:"舟山", name:"东极岛", tag:"小众海岛", visited:false, kind:"niche" },
  { province:"浙江", city:"温州", name:"雁荡山", tag:"5A · 山海", visited:false, kind:"5a" },
  { province:"安徽", city:"黄山", name:"黄山风景区", tag:"5A · 世界遗产", visited:false, kind:"heritage" },
  { province:"安徽", city:"黄山", name:"西递宏村", tag:"世界遗产 · 古村", visited:false, kind:"heritage" },
  { province:"安徽", city:"池州", name:"九华山", tag:"5A · 名山", visited:false, kind:"5a" },
  { province:"福建", city:"厦门", name:"鼓浪屿", tag:"5A · 世界遗产", visited:false, kind:"heritage" },
  { province:"福建", city:"平潭", name:"平潭岛", tag:"高热海岛", visited:false, kind:"hot" },
  { province:"福建", city:"宁德", name:"霞浦滩涂", tag:"小众摄影地", visited:false, kind:"niche" },
  { province:"福建", city:"泉州", name:"泉州古城", tag:"世界遗产 · 城市漫游", visited:false, kind:"heritage" },
  { province:"江西", city:"九江", name:"庐山", tag:"5A · 世界遗产", visited:false, kind:"heritage" },
  { province:"江西", city:"上饶", name:"婺源篁岭", tag:"5A · 高热晒秋", visited:false, kind:"hot" },
  { province:"江西", city:"上饶", name:"望仙谷", tag:"高热山谷夜景", visited:false, kind:"hot" },
  { province:"广东", city:"广州", name:"永庆坊", tag:"城市漫游 · 老城新活力", visited:false, kind:"city" },
  { province:"广东", city:"深圳", name:"盐田海滨栈道", tag:"城市漫游 · 看海", visited:false, kind:"city" },
  { province:"广东", city:"江门", name:"赤坎华侨古镇", tag:"高热侨乡", visited:false, kind:"hot" },
  { province:"广东", city:"江门", name:"开平碉楼与村落", tag:"世界遗产", visited:false, kind:"heritage" },
  { province:"海南", city:"三亚", name:"南山文化旅游区", tag:"5A · 海岛", visited:false, kind:"5a" },
  { province:"海南", city:"万宁", name:"日月湾", tag:"高热冲浪", visited:false, kind:"hot" },
  { province:"澳门", city:"澳门", name:"澳门历史城区", tag:"世界遗产 · 城市漫游", visited:false, kind:"heritage" },

  // 中部：河南、湖北、湖南、广西
  { province:"河南", city:"洛阳", name:"龙门石窟", tag:"5A · 世界遗产", visited:false, kind:"heritage" },
  { province:"河南", city:"登封", name:"嵩山少林景区", tag:"5A · 世界遗产", visited:false, kind:"heritage" },
  { province:"河南", city:"焦作", name:"云台山", tag:"5A · 峡谷", visited:false, kind:"5a" },
  { province:"湖北", city:"武汉", name:"黄鹤楼公园", tag:"5A · 城市地标", visited:false, kind:"5a" },
  { province:"湖北", city:"十堰", name:"武当山", tag:"世界遗产 · 道教名山", visited:false, kind:"heritage" },
  { province:"湖北", city:"神农架", name:"神农架", tag:"世界遗产 · 森林", visited:false, kind:"heritage" },
  { province:"湖南", city:"张家界", name:"武陵源", tag:"5A · 世界遗产", visited:false, kind:"heritage" },
  { province:"湖南", city:"湘西", name:"凤凰古城", tag:"高热古城", visited:false, kind:"hot" },
  { province:"湖南", city:"长沙", name:"橘子洲", tag:"5A · 城市地标", visited:false, kind:"city" },
  { province:"广西", city:"桂林", name:"漓江景区", tag:"5A · 世界级山水", visited:false, kind:"5a" },
  { province:"广西", city:"崇左", name:"左江花山岩画", tag:"世界遗产", visited:false, kind:"heritage" },
  { province:"广西", city:"崇左", name:"明仕田园", tag:"小众田园", visited:false, kind:"niche" },

  // 西南：重庆、四川、贵州、云南、西藏
  { province:"重庆", city:"重庆", name:"洪崖洞与山城步道", tag:"高热城市漫游", visited:false, kind:"city" },
  { province:"重庆", city:"重庆", name:"大足石刻", tag:"5A · 世界遗产", visited:false, kind:"heritage" },
  { province:"四川", city:"成都", name:"青城山-都江堰", tag:"5A · 世界遗产", visited:false, kind:"heritage" },
  { province:"四川", city:"阿坝", name:"九寨沟", tag:"5A · 世界遗产", visited:false, kind:"heritage" },
  { province:"四川", city:"甘孜", name:"稻城亚丁", tag:"高热雪山徒步", visited:false, kind:"hot" },
  { province:"四川", city:"阿坝", name:"四姑娘山", tag:"高热户外", visited:false, kind:"hot" },
  { province:"贵州", city:"安顺", name:"黄果树大瀑布", tag:"5A · 瀑布", visited:false, kind:"5a" },
  { province:"贵州", city:"铜仁", name:"梵净山", tag:"世界遗产 · 山野", visited:false, kind:"heritage" },
  { province:"贵州", city:"黔东南", name:"西江千户苗寨", tag:"高热苗寨", visited:false, kind:"hot" },
  { province:"云南", city:"大理", name:"大理古城与洱海", tag:"高热湖畔骑行", visited:false, kind:"hot" },
  { province:"云南", city:"丽江", name:"玉龙雪山", tag:"5A · 世界遗产", visited:false, kind:"heritage" },
  { province:"云南", city:"香格里拉", name:"独克宗古城与普达措", tag:"高热雪山草甸", visited:false, kind:"hot" },
  { province:"云南", city:"红河", name:"哈尼梯田", tag:"世界遗产 · 梯田", visited:false, kind:"heritage" },
  { province:"西藏", city:"拉萨", name:"布达拉宫", tag:"世界遗产 · 高原", visited:false, kind:"heritage" },

  // 西北：陕西、甘肃、青海、宁夏、新疆
  { province:"陕西", city:"西安", name:"秦始皇兵马俑", tag:"5A · 世界遗产", visited:false, kind:"heritage" },
  { province:"陕西", city:"西安", name:"大唐不夜城", tag:"高热夜游", visited:false, kind:"city" },
  { province:"陕西", city:"延安", name:"黄帝陵", tag:"5A · 人文", visited:false, kind:"5a" },
  { province:"甘肃", city:"敦煌", name:"莫高窟", tag:"世界遗产 · 石窟", visited:false, kind:"heritage" },
  { province:"甘肃", city:"敦煌", name:"鸣沙山月牙泉", tag:"5A · 高热沙漠", visited:false, kind:"hot" },
  { province:"甘肃", city:"嘉峪关", name:"嘉峪关文物景区", tag:"5A · 长城", visited:false, kind:"5a" },
  { province:"青海", city:"海西", name:"茶卡盐湖", tag:"高热盐湖", visited:false, kind:"hot" },
  { province:"青海", city:"玉树", name:"可可西里", tag:"世界遗产 · 荒野", visited:false, kind:"heritage" },
  { province:"宁夏", city:"中卫", name:"沙坡头", tag:"5A · 沙漠黄河", visited:false, kind:"5a" },
  { province:"宁夏", city:"银川", name:"西夏陵", tag:"世界遗产", visited:false, kind:"heritage" },
  { province:"新疆", city:"阿勒泰", name:"喀纳斯", tag:"5A · 北疆", visited:false, kind:"5a" },
  { province:"新疆", city:"阿勒泰", name:"禾木村", tag:"高热北疆村落", visited:false, kind:"hot" },
  { province:"新疆", city:"伊犁", name:"赛里木湖", tag:"高热湖泊", visited:false, kind:"hot" },
  { province:"新疆", city:"伊犁", name:"那拉提草原", tag:"5A · 草原", visited:false, kind:"hot" }
];

export const regionOrder = ["西南", "西北", "中部", "东北", "东南"];

export const provinceToRegion = {
  重庆:"西南", 四川:"西南", 贵州:"西南", 云南:"西南", 西藏:"西南",
  陕西:"西北", 甘肃:"西北", 青海:"西北", 宁夏:"西北", 新疆:"西北",
  河南:"中部", 湖北:"中部", 湖南:"中部", 广西:"中部",
  北京:"东北", 天津:"东北", 河北:"东北", 山西:"东北", 山东:"东北", 辽宁:"东北", 吉林:"东北", 黑龙江:"东北", 内蒙古:"东北",
  上海:"东南", 江苏:"东南", 浙江:"东南", 安徽:"东南", 福建:"东南", 江西:"东南", 广东:"东南", 海南:"东南", 澳门:"东南", 香港:"东南", 台湾:"东南"
};

export const placesByRegion = regionOrder.reduce((acc, region) => ({...acc, [region]: []}), {});
for (const place of sourcePlaces) {
  const region = provinceToRegion[place.province] || "东南";
  placesByRegion[region].push(place);
}

export const hotDestinations = sourcePlaces.filter(place => ["hot", "heritage", "5a"].includes(place.kind));

export const cityWalks = [
  { province:"上海", city:"上海", name:"武康路-安福路街区", tag:"咖啡散步 · 梧桐区", match:["上海"] },
  { province:"上海", city:"上海", name:"苏州河沿线", tag:"小众城市漫游", match:["上海"] },
  { province:"北京", city:"北京", name:"鼓楼-什刹海", tag:"胡同散步", match:["北京"] },
  { province:"北京", city:"北京", name:"亮马河夜游", tag:"城市夜风", match:["北京"] },
  { province:"浙江", city:"杭州", name:"西溪湿地", tag:"城市自然", match:["浙江", "杭州"] },
  { province:"浙江", city:"杭州", name:"馒头山社区", tag:"小众老街", match:["浙江", "杭州"] },
  { province:"江苏", city:"苏州", name:"平江路历史街区", tag:"江南慢走", match:["江苏", "苏州"] },
  { province:"江苏", city:"南京", name:"颐和路", tag:"民国街区", match:["江苏", "南京"] },
  { province:"广东", city:"广州", name:"永庆坊", tag:"老城新活力", match:["广东", "广州"] },
  { province:"广东", city:"深圳", name:"盐田海滨栈道", tag:"看海散步", match:["广东", "深圳"] },
  { province:"四川", city:"成都", name:"玉林路与芳草街", tag:"松弛城市漫游", match:["四川", "成都"] },
  { province:"重庆", city:"重庆", name:"山城步道", tag:"立体城市", match:["重庆"] },
  { province:"湖南", city:"长沙", name:"潮宗街", tag:"老街新店", match:["湖南", "长沙"] },
  { province:"陕西", city:"西安", name:"大唐不夜城", tag:"夜景漫游", match:["陕西", "西安"] },
  { province:"福建", city:"泉州", name:"泉州古城", tag:"世遗街巷", match:["福建", "泉州"] },
  { province:"云南", city:"大理", name:"洱海生态廊道", tag:"骑行看风", match:["云南", "大理"] },
  { province:"山东", city:"威海", name:"火炬八街", tag:"海边坡道", match:["山东", "威海"] },
  { province:"湖北", city:"武汉", name:"黎黄陂路", tag:"老租界街区", match:["湖北", "武汉"] }
];
