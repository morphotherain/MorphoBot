
var utils = require('util')

var addSpawn = require('addSpawn')
var creepManagers = require('creepManagers')

const logger = require('mylog');

var runAttack = {
    run : function(roomName,roomOutName){
    return;
    creepManage = creepManagers.Manage(roomName)
    var creepBodys = {
      attackers:{
        1:{'attack':2,'move':2},
        2:{'move':5,'attack':5,},
        3:{'tough':2,'move':6,'ranged_attack':1,'attack':2,'heal':1,},
        4:{'tough':2,'move':6,'ranged_attack':1,'attack':2,'heal':1,},
        5:{'tough':2,'move':6,'ranged_attack':1,'attack':2,'heal':1,},
        6:{'tough':2,'move':12,'ranged_attack':4,'attack':4,'heal':2,},
        priority : creepManage.attacker.priority
      },
      
     }
     var level = Memory.level[roomName]
     if(level<6)return;
     if(roomName == "W13N4" || roomName == "W15N9")return;
     var memory = utils.getRoomMem(roomName);
     if(memory.attacker == undefined || true)
     {
        memory.attacker = 
        {
          attackers : [("a"+roomOutName)],
          attackersNum : 2,
        }
     }


     

     if(Game.rooms[roomOutName]!=undefined)
     {
      const hostiles = Game.rooms[roomOutName].find(FIND_HOSTILE_CREEPS);
          if(hostiles.length > 1)
            memory.attacker.attackersNum = 3;
          else
            {creepManage.attacker.update(roomName);}
      }
      else
      {

      }
    var attack = function (creep,i)
    {
      
      if( memory.attacker.attackersNum > 1)
      {
        if (memory.attacker.ready) {
          if(creep.room.name != roomOutName){
            
            utils.moveOverRooms(creep.room.name,roomOutName,creep)
          }
          else
          {
          const target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
          if(target) {
            repairNearestDamagedCreep(creep);
            logger.warn(creep.name+"ra"+creep.rangedAttack(target));
            //logger.warn(creep.name+"a"+creep.attack(target));
              if(creep.rangedAttack(target) == ERR_NOT_IN_RANGE) {
                  ;//creep.moveTo(target);
                }
            //  if(creep.attack(target) == ERR_NOT_IN_RANGE) {
            //      creep.moveTo(target);}
              if(false){
                let randomDirection = Math.floor(Math.random() * 8) + 1;

                let tries = 0;
                while (!isSafeToMove(creep, randomDirection) && tries < 8) {
                    randomDirection = Math.floor(Math.random() * 8) + 1;
                    tries++;
                }
                logger.error("attack"+creep.move(randomDirection));
                if (tries < 8) {
                  logger.error("attack"+creep.move(randomDirection));
                } else {
                    logger.error(`Creep ${creep.name} is trapped and can't move without getting too close to the edge.`);
                }
              }       
              creep.moveTo(target)
              if(i!=0)
              {
                if(Game.creeps[(memory.attacker.attackers[0]+0)]!=undefined)
                  creep.moveTo(Game.creeps[(memory.attacker.attackers[0]+0)])
              }
            }
          }
        }
      }
      else{
        if(creep.room.name != roomOutName)
          utils.moveOverRooms(creep.room.name,roomOutName,creep)
        else
        {
        const target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if(target) {
          logger.warn(creep.name+"heal"+creep.heal(creep));
          logger.warn(creep.name+"ra"+creep.rangedAttack(target));
          //logger.warn(creep.name+"a"+creep.attack(target));
            if(creep.rangedAttack(target) == ERR_NOT_IN_RANGE) {
                ;//creep.moveTo(target);
              }
          //  if(creep.attack(target) == ERR_NOT_IN_RANGE) {
          //      creep.moveTo(target);}
            if(true){
              let randomDirection = Math.floor(Math.random() * 8) + 1;

              let tries = 0;
              while (!isSafeToMove(creep, randomDirection) && tries < 8) {
                  randomDirection = Math.floor(Math.random() * 8) + 1;
                  tries++;
              }
              logger.error("attack"+creep.move(randomDirection));
              if (tries < 8) {
                logger.error("attack"+creep.move(randomDirection));
              } else {
                  logger.error(`Creep ${creep.name} is trapped and can't move without getting too close to the edge.`);
              }
            }       
            if(i!=0)
            {
              if(Game.creeps[(memory.attacker.attackers[0]+0)]!=undefined)
                creep.moveTo(Game.creeps[(memory.attacker.attackers[0]+0)])
            }
          }
        }
      }
    }

    memory.attacker.ready =  true
    // 主循环中的代码
    for(var i = 0; i < memory.attacker.attackersNum; i++){
      const name = memory.attacker.attackers[0] + i;
      const creep = Game.creeps[name];
      if(!creep)
        return;
      if(creep.memory.ready == undefined) creep.memory.ready = false;
      if(checkAllRallied(memory)) creep.memory.ready = true;
      if(creep) {
        if( !creep.memory.ready && memory.attacker.attackersNum > 1) {
          // 如果没有集合完毕，移动到集合点
          creep.moveTo(Game.flags['RallyPoint'].pos);
        } else {
          // 所有creeps已经集合
          memory.attacker.ready = true;
          // 执行攻击函数
          attack(creep, i);
        }
      } else {
        // 如果creep不存在，加入生成队列
        addSpawn(roomName, creepBodys.attackers[level], name, creepBodys.attackers.priority,{},fullwork = true);
      }
    }

    
  }
}
  
module.exports = runAttack;

function isSafeToMove(creep, direction) {
  const pos = nextPosition(creep.pos, direction);
  return pos.x > 1 && pos.x < 48 && pos.y > 1 && pos.y < 48;
}


function repairNearestDamagedCreep(creep) {
  // 查找距离当前creep最近的受损creep
  const nearestDamagedCreep = creep.pos.findClosestByRange(FIND_MY_CREEPS, {
    filter: (c) => c.hits < c.hitsMax
  });

  // 如果存在受损的creep并且在范围内，则修复它
  if (nearestDamagedCreep) {
    if (creep.pos.isNearTo(nearestDamagedCreep)) {
      creep.heal(nearestDamagedCreep);
    } else {
      // 移动到需要修复的creep
      creep.moveTo(nearestDamagedCreep);
    }
  } else {
    // 如果当前creep受损，则自我修复
    if (creep.hits < creep.hitsMax) {
      creep.heal(creep);
    }
  }
}
// 检查是否所有creeps都集合在集合点

function checkAllRallied(memory) {
  for (let i = 0; i < memory.attacker.attackersNum; i++) {
    const name = memory.attacker.attackers[0]+i;
    const creep = Game.creeps[name];
    if (creep && !creep.pos.inRangeTo(Game.flags['RallyPoint'].pos, 1)) {
      // 如果有creep不在集合点，立即返回false
      return false;
    }
  }
  // 如果所有creep都在集合点，返回true
  return true;
}

function nextPosition(currentPos, direction) {
  // 基于方向，计算下一个位置
  let dx = 0;
  let dy = 0;

  switch (direction) {
    case TOP:
      dy = -1;
      break;
    case TOP_RIGHT:
      dx = 1;
      dy = -1;
      break;
    case RIGHT:
      dx = 1;
      break;
    case BOTTOM_RIGHT:
      dx = 1;
      dy = 1;
      break;
    case BOTTOM:
      dy = 1;
      break;
    case BOTTOM_LEFT:
      dx = -1;
      dy = 1;
      break;
    case LEFT:
      dx = -1;
      break;
    case TOP_LEFT:
      dx = -1;
      dy = -1;
      break;
  }

  var x = (currentPos.x + dx)<49?(currentPos.x + dx):49
  x = (x)>0?(x):1
  var y = (currentPos.y + dy)<49?(currentPos.y + dy):49
  y = (y)>0?(y):1
  return new RoomPosition(x, y, currentPos.roomName);
}
