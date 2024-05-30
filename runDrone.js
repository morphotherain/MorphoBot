
var utils = require('utilFun')

var addSpawn = require('addSpawn')
var creepManagers = require('creepManagers')
var buildingMgr = require('buildingMgr');

const logger = require('mylog');


const BOOST_STATES = {
    INIT: 'init',
    MOVE: 'boost_move',
    HEAL: 'boost_heal',
    RANGED_ATTACK: 'boost_ranged_attack',
    TOUGH: 'boost_tough',
    DONE: 'done'
};


function boostCreep(creep, labs) {
    
    // 初始化状态
    if (!creep.memory.boostState) {
        creep.memory.boostState = BOOST_STATES.INIT;
    }

    switch (creep.memory.boostState) {
        case BOOST_STATES.INIT:
            creep.memory.boostState = BOOST_STATES.MOVE;
            break;
    
        case BOOST_STATES.MOVE:
            if (creep.body.some(part => part.type === MOVE && part.boost)) {
                creep.memory.boostState = BOOST_STATES.HEAL;
            } else {
                boostPart(creep, labs[3]);
            }
            break;
    
        case BOOST_STATES.HEAL:
            if (creep.body.some(part => part.type === HEAL && part.boost)) {
                creep.memory.boostState = BOOST_STATES.RANGED_ATTACK;
            } else {
                boostPart(creep, labs[2]);
            }
            break;
    
        case BOOST_STATES.RANGED_ATTACK:
            if (creep.body.some(part => part.type === RANGED_ATTACK && part.boost)) {
                creep.memory.boostState = BOOST_STATES.TOUGH;
            } else {
                boostPart(creep, labs[0]);
            }
            break;
    
        case BOOST_STATES.TOUGH:
            if (creep.body.some(part => part.type === TOUGH && part.boost)) {
                creep.memory.boostState = BOOST_STATES.DONE;
            } else {
                boostPart(creep, labs[1]);
            }
            break;
    
        case BOOST_STATES.DONE:
            return true; // 全部强化完成，返回true
    }

    return false; // 强化进行中，返回false
}

function boostPart(creep, lab) {
    if (!creep.pos.inRangeTo(lab, 1)) {
        creep.moveTo(lab);
        return false; // 不在范围内，移动过去
    }

    var ans = lab.boostCreep(creep);
    if(ans = OK)
        return true; // 强化进行中
    else
        return false
}

function attackerLogic(creep, Labs) {
    if(!creep)return;
    creep.memory.pathRoom = creep.memory.pathRoom || {}
    let pathRoom = creep.memory.pathRoom;
    if(pathRoom.length == 0)return;
    if(!boostCreep(creep, Labs)) return;
    creep.memory.currentPathIndex = creep.memory.currentPathIndex || 0;
    let currentPathIndex = creep.memory.currentPathIndex; 
    if (currentPathIndex < pathRoom.length) {
        let targetRoom = pathRoom[currentPathIndex];
        if (creep.room.name == targetRoom) {
            creep.memory.currentPathIndex++;
        }
    }
    if (currentPathIndex < pathRoom.length) {
        let targetRoom = pathRoom[currentPathIndex];
        if (creep.room.name !== targetRoom) {
            // 移动到路径中的下一个房间
            let exitDir = creep.room.findExitTo(targetRoom);
            console.log("attackcreep{}:",targetRoom," : ", exitDir)
            let exit = creep.pos.findClosestByRange(exitDir);
            creep.moveTo(exit,{maxRooms:1});
            if (creep.hits < creep.hitsMax) {
                creep.heal(creep);
            }
        } else {
            // 到达当前路径点，前往下一个
            creep.memory.currentPathIndex++;
        }
    } else {
        // 在目标房间内进行攻击和自我维修
        let attackFlag = Game.flags['attack_target'];
        if (!attackFlag) {
            // 如果没有攻击旗帜，则创建一个
            creep.room.createFlag(creep.pos, 'attack_target', COLOR_RED);
            attackFlag.setPosition(new RoomPosition(25, 25, pathRoom[currentPathIndex-1]))
        }
        if(attackFlag.pos.roomName != pathRoom[currentPathIndex-1]){
            attackFlag.setPosition(new RoomPosition(25, 25, pathRoom[currentPathIndex-1]))
        }
        attackFlag = Game.flags['attack_target'];

        let target = attackFlag.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if (!target || !target.pos.inRangeTo(creep,3)) {
            target = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {
                filter: (structure) => structure.structureType !== STRUCTURE_CONTROLLER
            });
        }

        if (target) {
            if (creep.rangedAttack(target) === ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
            }
        }

        if (creep.hits < creep.hitsMax) {
            creep.heal(creep);
        }
    }
    
}


var runDrone = {
    run : function(roomName){
    var creepManage = creepManagers.Manage(roomName)
    var structures = buildingMgr.ManageStructure(roomName)
    var Labs = structures.Labs

    var creepBodys = {
      attackers:{
        8:{'tough':5,'move':10,'ranged_attack':25,'attack':0,'heal':10,},
        priority : creepManage.attacker.priority
      },
      
     }
    var level = Memory.level[roomName]
    if(level < 8)return;
    var memory = utils.getRoomMem(roomName);

    const name = roomName;
    const DayName = name+"Day";
    const NightName = name+"Night";
    if(Game.creeps[DayName]!= undefined)
    {
        attackerLogic(Game.creeps[DayName], Labs)
    }
    if(Game.creeps[NightName]!= undefined)
    {
        attackerLogic(Game.creeps[NightName], Labs)
    }
    if(Labs[0].store['XKHO2'] >= 750 && Labs[1].store['XGHO2'] >= 150 &&Labs[2].store['XLHO2'] >= 300 &&Labs[3].store['XZHO2'] >= 300 && false)
    addSpawn(roomName, creepBodys.attackers[level], name, creepBodys.attackers.priority+1,{});
    
    
  }
}
  
module.exports = runDrone;

