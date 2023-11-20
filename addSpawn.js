
const logger = require('mylog');


var addSpawn = function(roomName,creepBody,creepName,priority,mem = {},fullwork = false)
{
  if(fullwork)
  {
    addSpawnTask(roomName,creepBody,(creepName),priority,mem)
    return;
  }
  var creep1 = Game.creeps[creepName+"Day"]
  var creep2 = Game.creeps[creepName+"Night"]
  var delay = 0
  for(var i in creepBody)
    delay+= creepBody[i]
  delay += 10
  if((creep1 && creep1.ticksToLive < delay && !creep2 )  || ((!creep1) && (!creep2)))
  {
    
    addSpawnTask(roomName,creepBody,(creepName+"Night"),priority,mem)
  }
  else
  {
    if(creep2 && creep2.ticksToLive < delay && !creep1)
    {
      addSpawnTask(roomName,creepBody,(creepName+"Day"),priority,mem)
    }
  }
}

var addSpawnTask = function(roomName,creepBody,creepName,priority,mem)
{

  logger.debug(priority+creepName)
  var spawns = Game.rooms[roomName].find(FIND_MY_SPAWNS);
  var allSpawning = true;

  for (var i = 0; i < spawns.length; i++) {
      var spawn = spawns[i];
      if (!spawn.spawning) {
          allSpawning = false;
          break; // 找到一个不在孵化状态的 Spawn，停止检查
      }
  }

  if (allSpawning) {
      // 所有 Spawn 都在孵化，退出函数
      ("spawn is busy")
      return;
  }
  var memory = Game.rooms[roomName].memory
  if(!memory.spawn || priority > memory.spawn.priority)
  {
    memory.spawn = {}
    memory.spawn.priority  = priority
    memory.spawn.creepBody = creepBody
    memory.spawn.creepName = creepName
    memory.spawn.creepMem = mem
  }
  else
    return;
}
module.exports = addSpawn;