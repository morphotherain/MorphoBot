# default

# 概述
MorphoBot是纯js编写的半自动screeps bot, 无需任何配置开箱即用. 

有足够的效率和拓展性, 可在不编写代码的情况下完整体验房间从1级到8级的完全流程.

但是代码风格混乱, 存在大量不良设计, 不建议参考学习或者进行修改. 仅推荐体验游戏内容使用.

bug反馈: qq2494754957(Morpho)

# 操作说明:
手动操作一共分为两种: 放置建筑 移动旗帜 

请阅读所有操作说明后再上传代码到screeps

## 放置建筑:
在房间控制器每次升级后有一些建筑需要手动放置. 其中一些建筑有特殊的位置要求

需要放置多种建筑的, 按照优先级放置更为稳定
### level 1 无需放置

### level 2 放置优先级: 5个extension > 3个container
#### extension
放置在能量矿近处 , 不挡路即可
#### container
第1个. 放置在 以控制器为中心 7x7的正方形外周上 (如图 C为控制器, O为可放置位置)

O O O O O O O

O x x x x x O

O x x x x x O

O x x C x x O

O x x x x x O

O x x x x x O

O O O O O O O

第2-3个. 分别紧贴两个能量矿放置

### level 3 放置优先级: 5个extension > 1个tower

### level 4 放置优先级: 10个extension > 1个storage()

### level 5 放置优先级: 10个extension > 1个Tower > 1个Link

### level 6 放置优先级: 10个extension > 1个Terimeal(可选) > 1个Exator = 1个Container > 3个Lab
#### Exator & Container
Exator放置在房间的元素矿上, Container紧贴Exator放置

建造完成之后自动开始采集元素矿

### level 7 放置优先级: 10个extension > 1个Spawn > 1个Factory(可选) > 3个Lab(可选) > 2Link(可选)
#### Link
两个Link分别紧贴两个能量矿放置

### level 8 放置优先级: 10个extension > 1个Spawn > 1个PowerSpawn = 1个Nuker = 1个Observer > 4个Lab

storage, Link, Terminal, 初始Spawn的放置位置

这四个建筑之间经常转移资源, 因此他们的位置关系最好如下图中的菱形◇(-是空位或road)

- L -

S - S

- T -


## 移动旗帜
MorphoBot设置了一些用于手动操作的旗帜, 它们会在游戏过程中被代码自动创建

### 重要的旗帜
#### refresh+房间名  
获得房间时创建 会出现在左上角

将改旗帜移动到任意位置可以重置当前房间的Memory对象, 可在出现内存故障时使用.

#### carrierSleep+房间名 & Builder+房间名
获得房间时创建 会出现在中心

是搬运工和建筑工没有任务时待机的地方

需要手动移动, 放置在离初始Spawn较近且不挡路的空地上


#### host+房间名
第一次外矿收到攻击时生成 会出现在中心

外矿受到攻击时 creep暂时躲避的地点 

放置在离主干道较近不挡路的空地上

### 不重要的旗帜
#### build+房间名 & extension+房间名
任意时刻生成 会出现在中心

影响填充和建造顺序, 实际位置影响不大, 可以放置在任意位置












