
function processLyrics(inputText) {
    // 分割文本成行
    const lines = inputText.split('\n').filter(line => line.trim() !== '');

    // 初始化两个数组用于存放日语和中文歌词
    const lyrics_JP = [];
    const lyrics_CN = [];

    // 遍历每行歌词并按照日语和中文分组
    for (let i = 0; i < lines.length; i += 2) {
        lyrics_JP.push(lines[i]);
        lyrics_CN.push(lines[i + 1]);
    }

    return { lyrics_JP, lyrics_CN };
}

// 示例使用
const inputText = `流れてく
流逝着的
時の中ででも
时空之中
気だるさが
令人疲倦的
ほらグルグル廻って
这样呼噜呼噜转个不停
私から
我的那颗
離れる心も
失去的心
見えないわそう
看不见的话
知らない？
这样也能知道吗？
自分から
就算自己
動く事もなく
什么也不做
時の隙間に
时间的裂缝里
流され続けて
流逝仍在继续
知らないわ
什么也不知道
周りの事など
周围的一切
私は私
我就是我
それだけ
仅此而已
夢見てる？
梦见了吗？
何も見てない？
什么也没看见吗？
語るも無駄な
说什么也无用了的
自分の言葉？
自己的话语
悲しむなんて
“悲伤”什么的
疲れるだけよ
只是徒增疲劳
何も感じず
装作什么也感受不到
過ごせばいいの
就这样虚度算了
戸惑う言葉
困惑的话语
与えられても
即使被给予
自分の心
自己的心
ただ上の空
停留在半空
もし私から
如果我这样
動くのならば
试着去做的话
すべて変えるのなら
如果全部改变的话
黒にする
都将化作黑暗
こんな自分に
这样的我
未来はあるの？
能有未来吗？
こんな世界に
这样的世界
私はいるの？
有我存在吗？
今切ないの？
现在难受吗？
今悲しいの？
现在悲伤吗？
自分の事も
连自己的事情也
わからないのまま
什么都不明白了
歩む事さえ
“前行”这种事
疲れるだけよ
只是徒增疲劳
人の事など
与他人相关的事
知りもしないわ
装作一无所知好了
こんな私も
这样的我也
変われるもなら
能够改变的话
もし変われるのなら
如果真的改变的话
白になる？
能否变得洁白无瑕？
流れてく
流逝着的
時の中ででも
时空之中
気だるさが
令人疲倦的
ほらグルグル廻って
这样呼噜呼噜转个不停
私から
我的那颗
離れる心も
失去的心
見えないわそう
看不见的话
知らない？
这样也能知道吗？
自分から
就算自己
動く事もなく
什么也不做
時の隙間に
时间的裂缝里
流され続けて
流逝仍在继续
知らないわ
什么也不知道
周りの事など
周围的一切
私は私
我就是我
それだけ
仅此而已
夢見てる？
梦见了吗？
何も見てない？
什么也没看见吗？
語るも無駄な
说什么也无用了的
自分の言葉？
自己的话语
悲しむなんて
“悲伤”什么的
疲れるだけよ
只是徒增疲劳
何も感じず
装作什么也感受不到
過ごせばいいの
就这样虚度算了
戸惑う言葉
困惑的话语
与えられても
即使被给予
自分の心
自己的心
ただ上の空
停留在半空
もし私から
如果我这样
動くのならば
试着去做的话
すべて変えるのなら
如果全部改变的话
黒する
都将化作黑暗
無駄な時間に
在蹉跎的时间中
未来はあるの？
未来真的存在吗？
こんな所に
在这样的地方中
私はいるの？
我真的存在吗
私の事を
关于我自己
言いたいならば
如果要说的话
言葉にするの
用言语表达
なら「ろくでなし」
就是“无用之物”
こんな所に
在这样的地方中
私はいるの？
我真的存在吗？
こんな時間に
在这样的时间中
私はいるの？
有我存在吗？
こんな私も
这样的我也
変われるもなら
能够改变的话
もし変われるのなら
如果真的改变的话
白になる？
是否能变得洁白无瑕？
今夢見てる？
现在梦见了吗？
何も見てない？
什么也没看见吗？
語るも無駄な
说什么也无用了的
自分の言葉
自己的话语
悲しむなんて
“悲伤”什么的
疲れるだけよ
只是徒增疲劳
何も感じず
装作什么也感受不到
過ごせばいいの
就这样虚度算了
戸惑う言葉
困惑的话语
与えられても
即使被给予
自分の心
自己的心
ただ上の空
停留在半空
もし私から
如果我这样
動くのならば
试着去做的话
すべて変えるのなら
如果全部改变的话
黒にする
都将化作黑暗
動くのならば
试着去做的话
動くのならば
试着去做的话
すべて壊すわ
一切都将崩坏
すべて壊すわ
一切都将崩坏
悲しむならば
如果能够悲伤的话
悲しむならば
如果能够悲伤的话
私の心
我的心
白く変われる？
是否能变回洁白无瑕
貴方の事も
不管是你的事
私の事も
我的事
全ての事も
所有的事
まだ知らないの
全都不清楚了
重い睑を
沉重的眼皮
開けたのならば
如果打开的话
すべて壊すのなら
既然全都崩坏的话
黒になれ！！
干脆化作黑暗吧！！`;

const { lyrics_JP, lyrics_CN } = processLyrics(inputText);


var sing = {
    runSing: function(creep, language) {
        // 检查creep对象上是否有currentLyricIndex属性，如果没有，则初始化为0
        if (typeof creep.memory.currentLyricIndex === 'undefined') {
            creep.memory.currentLyricIndex = 0;
        }


        let lyricsArrayJP = lyrics_JP; // 假设歌词数组叫 lyrics_JP

        let lyricsArrayCN = lyrics_CN; // 假设歌词数组叫 lyrics_CN



        // 获取当前歌词
        const currentLyricCN = lyricsArrayCN[creep.memory.currentLyricIndex];
        const currentLyricJP = lyricsArrayJP[creep.memory.currentLyricIndex];

        // 说出当前歌词
        creep.say(currentLyricJP);

        // 在creep的当前位置绘制歌词（创建泡泡效果）
        creep.room.visual.text(currentLyricCN, creep.pos.x, creep.pos.y, {
            align: 'center',
            opacity: 2.8,
            color:'#FFFFFF' // 设置歌词颜色
        });

        // 更新currentLyricIndex，如果达到数组末尾则重置为0
        creep.memory.currentLyricIndex++;
        if (creep.memory.currentLyricIndex >= lyricsArrayCN.length) {
            creep.memory.currentLyricIndex = 0;
        }
    }
}

module.exports = sing;