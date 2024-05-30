
var utils = require('utilFun')

var addSpawn = require('addSpawn')
var creepManagers = require('creepManagers')
var buildingMgr = require('buildingMgr');

const logger = require('mylog');


const BOOST_STATES_WORK = {
    INIT: 'init',
    MOVE: 'boost_move',
    WORK: 'boost_work',
    TOUGH: 'boost_tough',
    DONE: 'done'
};

const BOOST_STATES_HEAL = {
    INIT: 'init',
    HEAL: 'boost_heal',
    TOUGH: 'boost_tough',
    DONE: 'done'
};



function boostWorkCreep(creep, labs) {
    
    // 初始化状态
    if (!creep.memory.boostState) {
        creep.memory.boostState = BOOST_STATES_WORK.INIT;
    }

    switch (creep.memory.boostState) {
        case BOOST_STATES_WORK.INIT:
            creep.memory.boostState = BOOST_STATES_WORK.MOVE;
            break;
    
        case BOOST_STATES_WORK.MOVE:
            if (creep.body.some(part => part.type === MOVE && part.boost)) {
                creep.memory.boostState = BOOST_STATES_WORK.WORK;
            } else {
                boostPart(creep, labs[3]);
            }
            break;
    
        case BOOST_STATES_WORK.WORK:
            if (creep.body.some(part => part.type === HEAL && part.boost)) {
                creep.memory.boostState = BOOST_STATES_WORK.TOUGH;
            } else {
                boostPart(creep, labs[4]);
            }
            break;
    
        case BOOST_STATES_WORK.TOUGH:
            if (creep.body.some(part => part.type === TOUGH && part.boost)) {
                creep.memory.boostState = BOOST_STATES_WORK.DONE;
            } else {
                boostPart(creep, labs[1]);
            }
            break;
    
        case BOOST_STATES_WORK.DONE:
            return true; // 全部强化完成，返回true
    }

    return false; // 强化进行中，返回false
}

function boostHealCreep(creep, labs) {
    
    // 初始化状态
    if (!creep.memory.boostState) {
        creep.memory.boostState = BOOST_STATES_HEAL.INIT;
    }

    switch (creep.memory.boostState) {
        case BOOST_STATES_HEAL.INIT:
            creep.memory.boostState = BOOST_STATES_HEAL.HEAL;
            break;
    
        case BOOST_STATES_HEAL.HEAL:
            if (creep.body.some(part => part.type === HEAL && part.boost)) {
                creep.memory.boostState = BOOST_STATES_HEAL.TOUGH;
            } else {
                boostPart(creep, labs[2]);
            }
            break;

        case BOOST_STATES_HEAL.TOUGH:
            if (creep.body.some(part => part.type === TOUGH && part.boost)) {
                creep.memory.boostState = BOOST_STATES_HEAL.DONE;
            } else {
                boostPart(creep, labs[1]);
            }
            break;
    
        case BOOST_STATES_HEAL.DONE:
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
    if(!boostWorkCreep(creep, Labs)) return;
    creep.memory.currentPathIndex = creep.memory.currentPathIndex || 0;
    let currentPathIndex = creep.memory.currentPathIndex; 
    if (currentPathIndex < pathRoom.length) {
        let targetRoom = pathRoom[currentPathIndex];
        if (creep.room.name !== targetRoom) {
            // 移动到路径中的下一个房间
            let exitDir = creep.room.findExitTo(targetRoom);
            let exit = creep.pos.findClosestByRange(exitDir);
            creep.moveTo(exit);
            if (creep.hits < creep.hitsMax) {
                creep.heal(creep);
            }
        } else {
            // 到达当前路径点，前往下一个
            creep.memory.currentPathIndex++;
        }
    } else {
        // 在目标房间内进行攻击和自我维修
        let attackFlag = Game.flags['dismantle_target'];
        if (!attackFlag) {
            // 如果没有攻击旗帜，则创建一个
            creep.room.createFlag(creep.pos, 'dismantle_target', COLOR_RED);
        }

        attackFlag = Game.flags['dismantle_target'];
        let target = attackFlag.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {
            filter: (structure) => structure.structureType !== STRUCTURE_CONTROLLER
        });
    

        if (target) {
            if (creep.dismantle(target) === ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
            }
        }

    }
}

function healerLogic(creep, Labs, attacker) {
    if(!creep)return;
    if(!boostHealCreep(creep, Labs)) return;
    if(attacker){
        creep.moveTo(attacker);
        var myDamaged = creep.hitsMax - creep.hits
        var attackerDamaged = attacker.hitsMax - attacker.hits
        if((attackerDamaged < myDamaged) && (myDamaged>0))
        {
            creep.heal(creep)
        }
        else
        {
            creep.heal(attacker)
        }
    }
}


var runTeam2 = {
    run : function(roomName){
    var structures = buildingMgr.ManageStructure(roomName)
    var Labs = structures.Labs

    var creepBodys = {
      worker:{
        8:{'tough':5,'move':10,'work':35,'attack':0,'heal':0,},
        priority : 30
      },
      healer:{
        8:{'tough':5,'move':15,'ranged_attack':0,'attack':0,'heal':10,},
        priority : 30
      },
      
    }
    var level = Memory.level[roomName]
    if(level < 8)return;

    var name = roomName+"W";
    var DayName = name+"Day";
    var NightName = name+"Night";
    var attackerCreep = 0; 
    if(Game.creeps[DayName]!= undefined)
    {
        attackerCreep = Game.creeps[DayName];
        attackerLogic(Game.creeps[DayName], Labs)
    }
    if(Game.creeps[NightName]!= undefined)
    {
        
        attackerCreep = Game.creeps[NightName];
        attackerLogic(Game.creeps[NightName], Labs)
    }
    if(Labs[0].store['XZH2O'] >= 1050 && Labs[1].store['XGHO2'] >= 150  &&Labs[3].store['XZHO2'] >= 300 && false)
    addSpawn(roomName, creepBodys.worker[level], name, creepBodys.worker.priority+1,{});

    name = roomName+"H";
    DayName = name+"Day";
    NightName = name+"Night";
    if(Game.creeps[DayName]!= undefined)
    {
        healerLogic(Game.creeps[DayName], Labs, attackerCreep)
    }
    if(Game.creeps[NightName]!= undefined)
    {
        healerLogic(Game.creeps[NightName], Labs, attackerCreep)
    }
    if(Labs[1].store['XGHO2'] >= 150 &&Labs[2].store['XLHO2'] >= 300 && attackerCreep!= 0)
    addSpawn(roomName, creepBodys.healer[level], name, creepBodys.healer.priority+1,{});
    
    
  }
}
  
module.exports = runTeam2;

