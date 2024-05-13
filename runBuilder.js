

const logger = require('mylog');
var utils = require('util')

var addSpawn = require('addSpawn')
var creepManagers = require('creepManagers');
const energyManager = require('assignDropEnergy');

var theRoomName = ''

var maxRamHits = [0,0,0,0,100000,100000,100000,100000,1000000000]


var runBuilder = {
    run : function(roomName){

    if(!Game.flags["BuilderSleep"+roomName])Game.rooms[roomName].createFlag(26, 25, "BuilderSleep"+roomName);

    var creepManage = creepManagers.Manage(roomName)
    var roomBuildings = Memory.rooms[roomName].buildings

    theRoomName = roomName
    var creepBodys = {
      carriers:{
        1:{'carry':3,'move':3},
        2:{'carry':6,'move':3},
        3:{'carry':10,'move':5},
        4:{'carry':10,'move':5},
        5:{'carry':10,'move':5},
        6:{'carry':16,'move':8},
        7:{'carry':16,'move':8},
        8:{'carry':24,'move':12},
        priority : creepManage.carrierForBuilder.priority
      },
      builders:{
        1:{'work':1,'move':2,'carry':1},
        2:{'work':2,'move':3,'carry':4},
        3:{'work':3,'move':5,'carry':5},
        4:{'work':5,'move':5,'carry':5},
        5:{'work':5,'move':5,'carry':15},
        6:{'work':5,'move':5,'carry':15},
        7:{'work':5,'move':5,'carry':15},
        8:{'work':30,'move':15,'carry':5},
        priority : creepManage.builder.priority
      },
      
    }

    var memory = utils.getRoomMem(roomName);
    if(memory.builder == undefined)
    {
      memory.builder = 
      {
        builders : ["b"],
        buildersNum : 1,
        carriers : ["cb"],
        carriersNum : 2
      }
    }
    memory.builder.builders = ["b"+roomName]
    memory.builder.carriers = ["cb"+roomName]
    
    var level = Memory.level[roomName]
    if(level == 0)return;

    creepManage.builder.update(roomName);

    var findEnergyDropoff = function (creep) {
      return creep.room.find(FIND_MY_CREEPS, {
          filter: (creep) => {
              return (creep.name[0]=='b' &&
                      creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0)
          }
      });
    }

    var getEnergy = function(creep,i)
    {
      //if(utils.getEnergyFromRuins(creep)!=-1)
      //  return;
      if(creep.room.storage!=undefined && level>=2){
        if(creep.room.storage.store[RESOURCE_ENERGY]>10000)
          if(creep.withdraw(creep.room.storage,RESOURCE_ENERGY)==ERR_NOT_IN_RANGE)
              creep.moveTo(creep.room.storage,{visualizePathStyle:{}})
      }
      else
      {
        var containersID = [roomBuildings.Containers[0],roomBuildings.Containers[1]]

        var container = Game.getObjectById(containersID[i%2]);

        //if(creep.room.energyAvailable != creep.room.energyCapacityAvailable && Memory.energyTargets[creep.room.name][creep.name])
        //  Memory.energyTargets[creep.room.name][creep.name] = ""
        //if(creep.room.energyAvailable == creep.room.energyCapacityAvailable  && energyManager.pickupEnergy(creep) != -1  )
        // return;
        //console.log(creep.room.energyAvailable,creep.room.energyCapacityAvailable,creep.room.energyAvailable != creep.room.energyCapacityAvailable)
        if(creep.room.energyAvailable != creep.room.energyCapacityAvailable  && energyManager.pickupEnergy(creep,creep.store.getFreeCapacity()) != -1  )
          return;
        if(creep.room.energyAvailable == creep.room.energyCapacityAvailable  && energyManager.pickupEnergy(creep, 0) != -1  )
         return;
        else
        {
          if(container)
          {
            if(creep.room.energyAvailable != creep.room.energyCapacityAvailable && container.store["energy"]<500)
              return;
            if(creep.withdraw(container,RESOURCE_ENERGY)==ERR_NOT_IN_RANGE)
              creep.moveTo(container,{visualizePathStyle:{}});
            if(creep.pos.inRangeTo(container,1))
              ;//creep.moveTo(creep.room.storage,{visualizePathStyle:{}})
            return;
          }
          else
          {
            if(!Game.flags["BuilderSleep"+roomName])Game.rooms[roomName].createFlag(25, 25, "BuilderSleep"+roomName);
              creep.moveTo(Game.flags["BuilderSleep"+roomName])  
          }
        }
      }
    }
    var saveEnergy = function (creep) {
      var targets = findEnergyDropoff(creep)

      targets.sort((a, b) => a.store[RESOURCE_ENERGY] - b.store[RESOURCE_ENERGY]);
      if (targets[0] != null) {
        creep.say("save!")
        if (creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
          creep.moveTo(targets[0])
      }
      else {
        creep.say("sleep!")
        if (!Game.flags["BuilderSleep" + roomName]) Game.rooms[roomName].createFlag(25, 25, "BuilderSleep" + roomName);
          creep.moveTo(Game.flags["BuilderSleep" + roomName])
      }
    }
    var carry = function(creep,i){
      if(creep.store[RESOURCE_ENERGY]>0)
        saveEnergy(creep)
      else
        getEnergy(creep,i)
    
    }

    var buildTarget = 0;
    var build = function(creep,roomName){
      if(creep == undefined) {return;}

      if(buildTarget == 0){
        buildTarget = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES,{filter:(s)=>s.structureType != "road"});
        if(!buildTarget) buildTarget = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES)
      }
      if(buildTarget) {
          if(creep.build(buildTarget) == ERR_NOT_IN_RANGE) {
              creep.moveTo(buildTarget);
          }
          else
          {
            creep.moveTo(buildTarget);
          }
        } 
      else{
        
        if(repairWallsAndRamparts(creep,roomName, maxRamHits[level])==-1){
          
          if(!Game.flags["BuilderSleep"+roomName])Game.rooms[roomName].createFlag(25, 25, "BuilderSleep"+roomName);
          creep.moveTo(Game.flags["BuilderSleep"+roomName])  
        }
      }
    }
    var countB = memory.builder.buildersNum;
    var countC = memory.builder.carriersNum;
    for(var i = 0;i<(countC>4?countC:4);i++){

      if(Game.creeps[(memory.builder.carriers[0]+i)+"Day"] != undefined)
      {
        var creep = Game.creeps[(memory.builder.carriers[0]+i)+"Day"]
        carry(creep,i)
      }
      if(Game.creeps[(memory.builder.carriers[0]+i)+"Night"] != undefined)
      {
        var creep = Game.creeps[(memory.builder.carriers[0]+i)+"Night"]
        carry(creep,i)
      }
      if(true && i<countC)
        addSpawn(roomName,creepBodys.carriers[level],(memory.builder.carriers[0]+i),creepBodys.carriers.priority)
    
    }
    for(var i = 0;i<(countB>4?countB:4);i++){
      if(Game.creeps[(memory.builder.builders[0]+i)+"Day"]!= undefined)
      {
       var creep = Game.creeps[(memory.builder.builders[0]+i)+"Day"]
       build(creep,roomName)
      }
      if(Game.creeps[(memory.builder.builders[0]+i)+"Night"]!= undefined)
      {
       var creep = Game.creeps[(memory.builder.builders[0]+i)+"Night"]
       build(creep,roomName)
      }

      if(true && i<countB)
        addSpawn(roomName,creepBodys.builders[level],(memory.builder.builders[0]+i),creepBodys.builders.priority)
    }
    
  }
}
  
module.exports = runBuilder;

function repairWallsAndRamparts(creep, roomName,maxRamHits) {
  // 初始化或更新修理计数
  if (!Memory.rooms[roomName].repairTarget || !Game.getObjectById(Memory.rooms[roomName].repairTarget) || Memory.rooms[roomName].repairAmount>100000) {
      // 查找血量最低的墙壁或城垛
      let target = creep.room.find(FIND_STRUCTURES, {
          filter: (s) => (s.structureType === STRUCTURE_RAMPART ||s.structureType === STRUCTURE_WALL) && (s.hits<maxRamHits) && !s.isPublic
      }).reduce((lowest, structure) => {
          return (lowest && lowest.hits < structure.hits) ? lowest : structure;
      }, null);

      // 设置新目标
      if (target) {
          Memory.rooms[roomName].repairTarget = target.id;
          Memory.rooms[roomName].repairAmount = 0;
      } else
          return -1;
  }

  let target = Game.getObjectById(Memory.rooms[roomName].repairTarget);

  // 执行修理操作
  if (target) {
      if (creep.repair(target) === ERR_NOT_IN_RANGE) {
          creep.moveTo(target);
      } else {
          // 更新累计修理值
          if (!creep.pos.isNearTo(target))
              creep.moveTo(target);
          Memory.rooms[roomName].repairAmount += creep.getActiveBodyparts(WORK) * REPAIR_POWER;
      }
  }
}

function boostCreep(creep, labId) {
  if(creep.ticksToLive == 1499)
    creep.memory.boosted = false
  // 检查 Creep 是否已经被 Boost
  if (creep.memory.boosted || creep.ticksToLive < 1400 ) {
      return false;
  }

  const lab = Game.getObjectById(labId);
  if (!lab) {
      return false;
  }

  // 检查 Lab 中是否有足够的 XGH2O 和能量
  if (lab.store["XLH2O"] > 30 && lab.energy >= 20) {
      // 移动到 Lab 位置并进行 Boost
      if (creep.pos.isNearTo(lab)) {
          const boostResult = lab.boostCreep(creep);
          if (boostResult === OK) {
              creep.memory.boosted = true;
              creep.memory.boostedresult = boostResult
              return true;
          }
      } else {
          creep.moveTo(lab);
          return true
      }
  } else {
      return false;
  }
  
  return false;
}