const UNSAFE_TICKS_THRESHOLD = 10;
var utils = require('utilFun')

const logger = require('mylog');


var roomRefuge =
{
    checkAndEvacuate: function(rooms, mainRoomName) {
        // 在全局Memory对象中初始化外矿房间状态
        if (!Memory.outpostStatus) {
            Memory.outpostStatus = {};
        }
        if(rooms && rooms.length)
        rooms.forEach(outpostName => {
            const room = Game.rooms[outpostName];
            Memory.outpostStatus[outpostName] = Memory.outpostStatus[outpostName] || {};
            if (room) {
                const hostiles = room.find(FIND_HOSTILE_CREEPS);
                let enemyCount = 0;
            
                // 统计敌人数量
                for (const creep of hostiles) {
                    if (creep.body.some((part) => part.type === ATTACK || part.type === RANGED_ATTACK)) {
                        // 如果敌人拥有 ATTACK 或 RANGED_ATTACK 部件
                        if (creep.body.some((part) => part.boost)) {
                            // 如果敌人拥有 Boost 部件，算作两个敌人
                            enemyCount += 2;
                        } else {
                            enemyCount += 1;
                        }
                    }
                }
            
                // 存储敌人数量到 Memory 中
                Memory.outpostStatus[outpostName].enemyCount = enemyCount;
            
                // 如果发现敌人，增加倒计时
                if (enemyCount > 0) {
                    Memory.outpostStatus[outpostName].countdown = (Memory.outpostStatus[outpostName].countdown || 0) + 1500; // 假设危险持续1500 ticks
                    if (Memory.outpostStatus[outpostName].countdown > 1500)
                        Memory.outpostStatus[outpostName].countdown = 1500;
                } else {
                    // 没有敌人则重置倒计时
                    Memory.outpostStatus[outpostName].countdown = 0;
                }
            }


            // 如果房间是不安全的，则将在该房间内、不具备ATTACK部件的Creep移动到主房间的host旗帜处
            if (Memory.outpostStatus[outpostName].countdown > 0 ) {
                Memory.outpostStatus[outpostName].countdown--;
                for (let creepName in Game.creeps) {
                    const creep = Game.creeps[creepName];
        
                    // 检查Creep名字是否包含当前房间名
                    if (creepName.includes(outpostName) && creep.getActiveBodyparts(ATTACK)==0) {
                        
                        if(!Game.flags["host"+mainRoomName])Game.rooms[mainRoomName].createFlag(25, 25, "host"+mainRoomName);
                        creep.moveTo(Game.flags["host"+mainRoomName], { visualizePathStyle: { stroke: '#ffaa00' } });
                    }
                }
            }
        })
    }
}


module.exports = roomRefuge