
var utils = require('utilFun')

var addSpawn = require('addSpawn')
var creepManagers = require('creepManagers')

const logger = require('mylog');

function sendCreepToAttack(creeps, targetRoomNames) {

  for (let roomName of targetRoomNames) {
      const targetRoom = Game.rooms[roomName];
      
      if (targetRoom && targetRoom.memory.hasInvaderCore) {
          for (let creep of creeps) {
            // Move to the target room
            if (creep.room.name !== roomName) {
                creep.moveTo(new RoomPosition(25, 25, roomName), { visualizePathStyle: { stroke: '#ff0000' } });
            } else {
                // Find the invader core in the room and attack
                const invaderCore = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES, {
                    filter: (structure) => structure.structureType === STRUCTURE_INVADER_CORE
                });
                if (invaderCore) {
                    if (creep.attack(invaderCore) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(invaderCore, { visualizePathStyle: { stroke: '#ff0000' } });
                    }
                }
            }
          }
          return true; // Only attack the first room with an invader core
      }
  }
  return false;
}

var runAttack = {
    run : function(roomOutNames,roomName){
    var creepManage = creepManagers.Manage(roomName)
    var creepBodys = {
      attackers:{
        1:{'attack':2,'move':2},
        2:{'move':4,'attack':4,},
        3:{'tough':2,'move':5,'attack':3,'heal':0,},
        4:{'tough':2,'move':6,'ranged_attack':1,'attack':3,'heal':0,},
        5:{'tough':2,'move':6,'ranged_attack':1,'attack':3,'heal':0,},
        6:{'tough':2,'move':12,'ranged_attack':1,'attack':5,'heal':0,},
        7:{'tough':2,'move':12,'ranged_attack':1,'attack':9,'heal':0,},
        8:{'tough':0,'move':13,'ranged_attack':1,'attack':12,'heal':0,},
        priority : creepManage.attacker.priority
      },
      
     }
    var level = Memory.level[roomName]
    if(level < 3)return;
    var memory = utils.getRoomMem(roomName);
    if(memory.attacker == undefined)
    {
      memory.attacker = 
      {
        attackers : [("a"+roomName)],
        attackersNum : 2,
      }
    }

    var destroy = function(creeps, Num, targetRoom){
      var leader = 0;
      var closestEnemy = 0;
      for (let creep of creeps) {
        // 向目标房间移动，可能没有视野
        var AttackRes = -1;
        if (creep.room.name != targetRoom) {
          creep.moveTo(new RoomPosition(25, 25, targetRoom), { visualizePathStyle: { stroke: '#ffffff' } });
        }
        // 已进入目标房间，开始清理敌人
        else {
          
          if(!leader)leader = creep;
          if(!closestEnemy)closestEnemy = leader.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
          // 如果有敌人
          if (closestEnemy) {
            creep.moveTo(closestEnemy, { visualizePathStyle: { stroke: '#ff0000' } });
            AttackRes = creep.attack(closestEnemy)
            console.log("runAttack[LOG]:attack:"+AttackRes)
            if(AttackRes==ERR_NOT_IN_RANGE)
            {
              creep.rangedAttack(closestEnemy);
              creep.moveTo(closestEnemy)
            }
          } else {
            // 没有敌人时攻击敌对建筑
            let hostileStructures = creep.room.find(FIND_STRUCTURES, { filter: (s) => (s.structureType != STRUCTURE_CONTROLLER && s.structureType != STRUCTURE_WALL) });

            let hostileStructuresf = creep.room.find(FIND_HOSTILE_STRUCTURES);

            console.log("runAttack[LOG]:ReadyNum : ",hostileStructuresf)
            if (hostileStructures.length > 0) {
              creep.moveTo(hostileStructures[0], { visualizePathStyle: { stroke: '#ff0000' } });
              AttackRes = creep.attack(hostileStructures[0]);
            }
          }
          if(AttackRes!=0)     
            creep.heal(creep)
        }
      }
    }
    
    var attack = function (creeps,Num)
    {
      if(memory.attacker.targetRoom)
      {
        if(Memory.outpostStatus[memory.attacker.targetRoom].countdown == 0){
          memory.attacker.targetRoom = 0;
          return;
        }
        destroy(creeps,Num, memory.attacker.targetRoom)
      }
      else
      {
        if(memory.attacker.destroyRoom == undefined)
        {
          memory.attacker.destroyRoom = 'unset'
        }
        if(memory.attacker.destroyRoom != 'unset')
        {
          destroy(creeps,Num,memory.attacker.destroyRoom)
        }
        else{
          if(sendCreepToAttack(creeps,roomOutNames))return;
          if(!Game.flags["host"+roomName])Game.rooms[roomName].createFlag(25, 25, "host"+roomName);
          for (let creep of creeps) {
            creep.moveTo(Game.flags["host"+roomName], { visualizePathStyle: { stroke: '#ffaa00' } });
          }
        }

        for(var roomOutName of roomOutNames){
          if (Memory.outpostStatus[roomOutName].countdown > 0 ) {
            if(level>=6)Num*=2;
            if(level>=8)Num*=2;
            if(Memory.outpostStatus[roomOutName].enemyCount <= Num){
              memory.attacker.targetRoom = roomOutName;
              break;
            }
          }
        }
        
      }

      
    }


    var creeps = []
    var ReadyNum = 0;
    var countA = memory.attacker.attackersNum
    if(level >= 6)countA = 1;
    for(var i = 0;i<(countA>4?countA:4);i++){
      const name = memory.attacker.attackers[0] + i;
      const DayName = name+"Day";
      const NightName = name+"Night";
      if(Game.creeps[DayName]!= undefined)
      {
        if(Game.creeps[DayName].ticksToLive > 0){
          creeps.push(Game.creeps[DayName]); // 将符合条件的 creep 对象添加到数组中
          ReadyNum++;
        }
        else{
          utils.recycleCreep(Game.creeps[DayName],roomName)
        }
      }
      if(Game.creeps[NightName]!= undefined)
      {
        if(Game.creeps[NightName].ticksToLive > 0){
          creeps.push(Game.creeps[NightName]); // 将符合条件的 creep 对象添加到数组中
          ReadyNum++;
        }
        else{
          utils.recycleCreep(Game.creeps[NightName],roomName)
        }
      }

      if(true && i<countA)
        addSpawn(roomName, creepBodys.attackers[level], name, creepBodys.attackers.priority,{});
    }
    
    attack(creeps, ReadyNum);
    
  }
}
  
module.exports = runAttack;

