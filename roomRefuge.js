const UNSAFE_TICKS_THRESHOLD = 10;
var utils = require('util')

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

            // 检查房间视野
            if (room) {
                const hostiles = room.find(FIND_HOSTILE_CREEPS);
                let hostileCreepsWithAttackParts = hostiles.filter((creep) => 
                    creep.body.some((part) => part.type === ATTACK || part.type === RANGED_ATTACK)
                );
                if (hostileCreepsWithAttackParts.length > 0 ) {
                    // 如果发现敌人，增加倒计时
                    Memory.outpostStatus[outpostName] = (Memory.outpostStatus[outpostName] || 0) + 1500; // 假设危险持续1500 ticks
                    if(Memory.outpostStatus[outpostName] && Memory.outpostStatus[outpostName] > 1500)
                        Memory.outpostStatus[outpostName] = 1500;
                } else {
                    // 没有敌人则重置倒计时
                    Memory.outpostStatus[outpostName] = 0;
                }
            }
                
            var flag = false;
            for (let roomName of rooms) {
                const room = Game.rooms[roomName];

                if (!room) continue;
                if(room.memory.unsafeTicks)
                    flag = true;
            }


            if(Memory.outpostStatus["W53N25"] && Memory.outpostStatus["W53N25"]>0)
            {
                Memory.outpostStatus["W53N24"] = Memory.outpostStatus["W53N25"];
                Memory.outpostStatus["W53N26"] = Memory.outpostStatus["W53N25"];
            } 
            if(Memory.outpostStatus["W17N18"] && Memory.outpostStatus["W17N18"]>0)
            {
                Memory.outpostStatus["W18N18"] = Memory.outpostStatus["W18N18"];
            }

            // 如果房间是不安全的，则将在该房间内、不具备ATTACK部件的Creep移动到主房间的host旗帜处
            if (Memory.outpostStatus[outpostName] > 0 ) {
                Memory.outpostStatus[outpostName]--;
                for (let creepName in Game.creeps) {
                    const creep = Game.creeps[creepName];
                    const room = creep.room;
        
                    // 检查Creep名字是否包含当前房间名
                    if (creepName.includes(outpostName) && creep.getActiveBodyparts(ATTACK)==0) {
                        
                        if(!Game.flags["host"+mainRoomName])Game.rooms[mainRoomName].createFlag(25, 25, "host"+mainRoomName);
                        creep.moveTo(Game.flags["host"+mainRoomName], { visualizePathStyle: { stroke: '#ffaa00' } });

                    
                    }
                }
            }
            else
            {
                for (let creepName in Game.creeps) {
                    const creep = Game.creeps[creepName];
                    const room = creep.room;
                    // 检查Creep名字是否包含当前房间名
                    if (creepName.includes(outpostName) && creep.getActiveBodyparts(ATTACK)>0) {
                        creep.heal(creep)
                        //utils.recycleCreep(creep, mainRoomName)
                    }
                }
            }
        })
    }
}


module.exports = roomRefuge