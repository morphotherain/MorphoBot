var utils = require('utilFun')
var addSpawn = require('addSpawn')
var dataset = require('data')
var creepManagers = require('creepManagers')
var buildingMgr = require('buildingMgr');
var energyManager = require('assignDropEnergy');
var sing = require('lyrics');
var carryTask = require('carryTask');


var runSpawn = 
{
  run : function(roomName)
  {
    if(roomName == Memory.expansionConfig.targetRoom && Memory.level[roomName]<2)return ;
    if(!Game.flags["carrierSleep"+roomName])Game.rooms[roomName].createFlag(25, 25, "carrierSleep"+roomName);

    var creepManage = creepManagers.Manage(roomName)
    var structures = buildingMgr.ManageStructure(roomName)
    var roomBuildings = Memory.rooms[roomName].buildings

    var creepBodys = {
      carriers:{
        0:{'carry':1,'move':1},
        1:{'carry':3,'move':3},
        2:{'carry':6,'move':3},
        3:{'carry':6,'move':3},
        4:{'carry':4,'move':3},
        5:{'carry':4,'move':3},
        6:{'carry':4,'move':3},
        7:{'carry':4,'move':3},
        8:{'carry':4,'move':3},
        priority : creepManage.carriers.priority
      },
      Ecarriers:{
        0:{'carry':1,'move':1},
        1:{'carry':4,'move':2},
        2:{'carry':10,'move':5},
        3:{'carry':10,'move':5},
        4:{'carry':10,'move':5},
        5:{'carry':8,'move':4},
        6:{'carry':10,'move':5},
        7:{'carry':10,'move':5},
        8:{'carry':10,'move':5},
        priority : creepManage.Ecarriers.priority*2
      },
      AdvanceCarriers:{
        5:{'carry':20,'move':10},
        6:{'carry':20,'move':10},
        7:{'carry':28,'move':14},
        8:{'carry':28,'move':14},
        priority : 39
      }
    }

    if(Memory.rooms[roomName].source && Memory.rooms[roomName].source.sourcesID)
      var sources = Memory.rooms[roomName].source.sourcesID; // 过滤掉 null 值
    else
      var sources = [];
    var moveCount = [0,0];
    var carryCount = [0,0];
    for (var i = 0; i < sources.length; i++) {
      if (!sources[i]) continue; // 检查是否成功获取 source 对象

      carryCount[i] = utils.calculateCarrierBodys(roomName ,sources[i] );
      moveCount[i] = (carryCount[i] + carryCount[i] % 2)/2;
    }


    var energyAvailable = Game.rooms[roomName].energyAvailable;
    
    var level = Memory.level[roomName]

    var memory = utils.getRoomMem(roomName);
    var ignoreCreep = false;
    delete memory.spawns
    if(memory.spawns == undefined || Game.time%10==2)
    {
      memory.spawns = 
      {
        carriers : ["c"],
        carriersNum : level>=4?2:2,
        Ecarriers : ["ec"],
        EcarriersNum : level>=4?2:1,
        AdvaceCarriers : ["Ac"],
        AdvaceCarriersAccept : false
      }
    }

    memory.spawns.carriers = ["c"+roomName]
    memory.spawns.Ecarriers = ["ec"+roomName]

    if(level >= 6 && Game.rooms[roomName].terminal != undefined )
    {
      ignoreCreep = false;
      memory.spawns.EcarriersNum = 0;
      memory.spawns.AdvaceCarriersAccept = true;
    }

    if(level <= 4 && Game.rooms[roomName].storage == undefined)
    {
      memory.spawns.EcarriersNum = 0;
    }

    SetRoadBetweenContainerAndSpawn(roomName,roomBuildings)
    var getEnergy = function(creep)
    {
      if(utils.getEnergyFromRuins(creep)!=-1)
        return;
      
      var containersID = [roomBuildings.Containers[0],roomBuildings.Containers[1]]
      var container = Game.getObjectById(containersID[i%2]);
      if(container)
      {
        var result = undefined;
        // 检查容器内的能量和 creep 的剩余空间
        if (container.store[RESOURCE_ENERGY] > creep.store.getFreeCapacity()) {
          // 提取能量
          var result = creep.withdraw(container, RESOURCE_ENERGY);
          if (result == ERR_NOT_IN_RANGE) {
            // 如果不在范围内，移动到容器附近
            if(creep.room.memory.constructureSitesNum > 0)ignoreCreep = false
            creep.moveTo(container,{visualizePathStyle:{},reusePath:50,ignoreCreeps: ignoreCreep});
          }
        }
        if(creep.pos.inRangeTo(container,1))
          ;//creep.moveTo(creep.room.storage,{visualizePathStyle:{}})
        return;
      }
      else
      {
        energyManager.pickupEnergy(creep)
        return;
      }


    }


     var saveEnergy = function(creep,i)
     {
      if(creep.room.storage!=undefined)
      {
        if(creep.transfer(creep.room.storage,RESOURCE_ENERGY)==ERR_NOT_IN_RANGE)
          creep.moveTo(creep.room.storage,{visualizePathStyle:{}})
      }
      else{
        EsaveEnergy(creep,i, roomName)
      }
     }



     var carry = function(creep,i){
      if(creep.store[RESOURCE_ENERGY]>0)
      {
        if((energyAvailable<750)&&creep.room.storage!=undefined)
          EsaveEnergy(creep,i, roomName)
        else
          saveEnergy(creep,i)
      }
      else
        getEnergy(creep,i)
     }


     var Ecarry = function(creep,i){
      //let target = (i % 2 === 0) 
      //? findClosestEnergyDropoff(creep) 
      //: findClosestEnergyDropoff(creep, Game.flags["extension"+roomName].pos);
  
      //if (!target) 
      //{
      //  transferResourcesToStorage(creep)
      //  return;
      //}
      for(const resourceType in creep.store) {
        if(resourceType != RESOURCE_ENERGY)
          if(creep.transfer(creep.room.storage, resourceType) === ERR_NOT_IN_RANGE) {
              creep.moveTo(creep.room.storage, {visualizePathStyle: {stroke: '#ffffff'}});
          }
      }
      if(creep.store[RESOURCE_ENERGY]>0)
        EsaveEnergy(creep,i,roomName)
      else
      {
        var tombs = creep.pos.findClosestByRange(FIND_TOMBSTONES, {
          filter: (tombs) => tombs.store.length !=0
        })
        if(tombs!=null && tombs.store[RESOURCE_ENERGY]!=0)
        {
          var result = "反正不等于0"
          for(const resourceType in tombs.store) {
            if(resourceType != RESOURCE_ENERGY){
              result = creep.withdraw(tombs, resourceType);
              if(result === ERR_NOT_IN_RANGE) {
                creep.moveTo(tombs, {visualizePathStyle: {stroke: '#ffffff'}});
              }
            }
          }
          if(result != OK)
            if(creep.withdraw(tombs, RESOURCE_ENERGY)==ERR_NOT_IN_RANGE)
              creep.moveTo(tombs)
        }
        else{
          if(creep.withdraw(creep.room.storage,RESOURCE_ENERGY)==ERR_NOT_IN_RANGE)
              creep.moveTo(creep.room.storage,{visualizePathStyle:{}})
            }
        }
    }
    var times = 1
    if(level >= 2)
        times = 1;
    if(level == 1)
        times = 2;
    if(level == 0)
        times = 2;
    var count = memory.spawns.carriersNum*times

    var creep1 = Game.creeps[(memory.spawns.AdvaceCarriers[0])+roomName+"Day"]
    var creep2 = Game.creeps[(memory.spawns.AdvaceCarriers[0])+roomName+"Night"]
    if(!creep1 && !creep2 && memory.spawns.AdvaceCarriersAccept)
      memory.spawns.EcarriersNum = 1;

    if(level == 8 || (structures.centerLink && structures.sourceLinks[0] && structures.sourceLinks[1])){
      count = 0;
    }

    var maxCarrier = (level<=2)?4:2;

    for(var i = 0;i<(maxCarrier<count?count:maxCarrier);i++){
       if(Game.creeps[(memory.spawns.carriers[0]+i)+"Day"] != undefined)
       {
          creepBodys.carriers.priority = creepBodys.carriers.priority-2 
          var creep = Game.creeps[(memory.spawns.carriers[0]+i)+"Day"]
            carry(creep,i)
       }
       if(Game.creeps[(memory.spawns.carriers[0]+i)+"Night"] != undefined)
       {
          creepBodys.carriers.priority = creepBodys.carriers.priority-2
          var creep = Game.creeps[(memory.spawns.carriers[0]+i)+"Night"]
            carry(creep,i)
       }
      var carrierBody = {}
      if(level <= 3)
        carrierBody = creepBodys.carriers[level]
      else
        carrierBody = {'carry':carryCount[i],'move': moveCount[i]}
      if(i<count)
        addSpawn(roomName,carrierBody,(memory.spawns.carriers[0]+i),creepBodys.carriers.priority)
      
    }

    for(var i = 0;i<2;i++){
      if(Game.creeps[(memory.spawns.Ecarriers[0]+i)+"Day"] != undefined)
      {
        var creep = Game.creeps[(memory.spawns.Ecarriers[0]+i)+"Day"]
        Ecarry(creep,i)
      }
      if(Game.creeps[(memory.spawns.Ecarriers[0]+i)+"Night"] != undefined)
      {
        var creep = Game.creeps[(memory.spawns.Ecarriers[0]+i)+"Night"]
        Ecarry(creep,i)
      }
      if(!((energyAvailable<=300)&& level>=4) && i<memory.spawns.EcarriersNum)
         addSpawn(roomName,creepBodys.Ecarriers[(energyAvailable>750)?2:1],(memory.spawns.Ecarriers[0]+i),creepBodys.Ecarriers.priority)
      
    }
    if(memory.spawns.AdvaceCarriersAccept)
    {
      var creep1 = Game.creeps[(memory.spawns.AdvaceCarriers[0])+roomName+"Day"]
      var creep2 = Game.creeps[(memory.spawns.AdvaceCarriers[0])+roomName+"Night"]

      addSpawn(roomName,creepBodys.AdvanceCarriers[level],((memory.spawns.AdvaceCarriers[0])+roomName),creepBodys.AdvanceCarriers.priority)
  
      var terminal = Game.rooms[roomName].terminal
      var storage = Game.rooms[roomName].storage
      var PowerSpawn = structures.PowerSpawn
      var Nuker = structures.Nuker
      var Labs = structures.Labs
      var Factory = structures.Factory
      if(Factory && !(Factory.cooldown>0))
        Factory.produce("battery")
      var TaskList = []
      
      if(creep1)
      {
        sing.runSing(creep1);
        carryTask.runCarry(creep1,true);
      }
      if(creep2)
      {
        sing.runSing(creep2);
        carryTask.runCarry(creep2,true);
      }

    }
    //console.log("runSpawn.js[LOG]: "+"memory.spawn.priority",memory.spawn.priority)
    if(memory.spawn.priority != 0)
    { 
      console.log("runSpawn.js[LOG]:"+dataset.createCreepBodys(memory.spawn.creepBody),"silver")
      console.log("runSpawn.js[LOG]:"+memory.spawn.creepName,"green")
      var result
      for(var i = 0;i<roomBuildings.Spawns.length;i++){
        if(Game.getObjectById(roomBuildings.Spawns[i]))
        result = Game.getObjectById(roomBuildings.Spawns[i]).spawnCreep(
              dataset.createCreepBodys(memory.spawn.creepBody),
              memory.spawn.creepName,
              memory.spawn.creepMem)
        if(result == OK)
          break;
      }
      
      console.log("runSpawn.js[LOG]:"+"result"+result,"green")
      
    }
  }
}
module.exports = runSpawn;


const STRUCTURES_TO_ENERGY_DROP = [
  STRUCTURE_EXTENSION, 
  STRUCTURE_SPAWN, 
  STRUCTURE_TOWER
];

function getEnergyStoreCapacity(structure) {
  if (structure.structureType === STRUCTURE_TOWER) {
    return structure.store.getFreeCapacity(RESOURCE_ENERGY) > 500 
      ? structure.store.getFreeCapacity(RESOURCE_ENERGY) 
      : 0;
  }
  return structure.store.getFreeCapacity(RESOURCE_ENERGY);
}

function findClosestEnergyDropoff(creep, referencePoint = creep.pos) {
  return referencePoint.findClosestByRange(FIND_MY_STRUCTURES, {
    filter: (structure) => 
      STRUCTURES_TO_ENERGY_DROP.includes(structure.structureType) &&
      getEnergyStoreCapacity(structure) > 0
  });
}
function findNextClosestEnergyDropoff(creep, referencePoint = creep.pos,now) {
  return referencePoint.findClosestByRange(FIND_MY_STRUCTURES, {
    filter: (structure) => 
      STRUCTURES_TO_ENERGY_DROP.includes(structure.structureType) &&
      getEnergyStoreCapacity(structure) > 0 && structure.id != now.id
  });
}

function EsaveEnergy(creep, i, roomName) {
  if(!Game.flags["extension"+roomName])Game.rooms[roomName].createFlag(25, 25, "extension"+roomName);
  let target = (i % 2 === 0) 
    ? findClosestEnergyDropoff(creep) 
    : findClosestEnergyDropoff(creep, Game.flags["extension"+roomName].pos);

  if (!target) {
    {
      transferResourcesToStorage(creep)
      if(!Game.flags["carrierSleep"+roomName])Game.rooms[roomName].createFlag(creep.pos.x, creep.pos.y, "carrierSleep"+roomName);
        creep.moveTo(Game.flags["carrierSleep"+roomName], { visualizePathStyle: {} });
    }
    return;
  }

  let tranTarget = findClosestEnergyDropoff(creep) 

  const transferResult = creep.transfer(tranTarget, RESOURCE_ENERGY);
  if (transferResult === ERR_NOT_IN_RANGE) {
    creep.moveTo(target, { visualizePathStyle: {} });
  } else if (transferResult === OK) {
    // After a successful transfer, we immediately look for the next target.
    target = (i % 2 === 0) 
      ? findNextClosestEnergyDropoff(creep,creep.pos,tranTarget) 
      : findNextClosestEnergyDropoff(creep, Game.flags["extension"+roomName].pos,tranTarget);
    
    // If there's a new target and it's not in the close range, move to it.
    if (target && !creep.pos.inRangeTo(target, 1)) {
      creep.moveTo(target, { visualizePathStyle: {} });
    }
  }
}

function transferResourcesToStorage(creep) {
  // 检查Creep是否已满载
  if (creep.store.getFreeCapacity() === 0) {
      // 如果已满载，前往Storage并转移资源
      const storage = creep.room.storage;
      if (storage) {
        for (const resourceType in creep.store) {
          if (creep.transfer(storage, resourceType) === ERR_NOT_IN_RANGE) {
              // 移动到废墟位置
              creep.moveTo(storage, { visualizePathStyle: { stroke: '#ffaa00' } });
              break;
          }
      if(creep.store[RESOURCE_ENERGY]>0)
        creep.transfer(storage, RESOURCE_ENERGY)
      }
      }
  } else {
    const target = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES);//,{filter:(drop)=>drop.resourceType == "XGH2O"}
    if(target) {
        if(creep.pickup(target) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target);
        }
    }
  }
}

function SetRoadBetweenContainerAndSpawn(roomName,roomBuildings)
{
  var memory = utils.getRoomMem(roomName);
  if(memory.controller.hasSetRoad == 2)return;
  if(!memory.controller.hasSetRoad) memory.controller.hasSetRoad = 0;
  var containersID = [roomBuildings.Containers[0],roomBuildings.Containers[1]]
  var room = Game.rooms[roomName]
  if(Game.time % 100 == 0)
  {
    var container0 = Game.getObjectById(containersID[0])
    var container1 = Game.getObjectById(containersID[1])
    if(container0)
    {
      let structure = room.lookForAt(LOOK_STRUCTURES, container0.pos.x, container0.pos.y);
      let constructionSite = room.lookForAt(LOOK_CONSTRUCTION_SITES, container0.pos.x, container0.pos.y);
      let hasRoad = structure.some(s => s.structureType === STRUCTURE_ROAD);
      let hasRoadSite = constructionSite.some(s => s.structureType === STRUCTURE_ROAD);

      // 如果没有道路和道路工地，则考虑创建
      if (!hasRoad && !hasRoadSite) {
        utils.createRoadBetween(Game.getObjectById(roomBuildings.Spawns[0]).pos,container0.pos)
        memory.controller.hasSetRoad = memory.controller.hasSetRoad+1
      }
    }
    if(container1)
    {
      let structure = room.lookForAt(LOOK_STRUCTURES, container1.pos.x, container1.pos.y);
      let constructionSite = room.lookForAt(LOOK_CONSTRUCTION_SITES, container1.pos.x, container1.pos.y);
      let hasRoad = structure.some(s => s.structureType === STRUCTURE_ROAD);
      let hasRoadSite = constructionSite.some(s => s.structureType === STRUCTURE_ROAD);

      // 如果没有道路和道路工地，则考虑创建
      if (!hasRoad && !hasRoadSite) {
        utils.createRoadBetween(Game.getObjectById(roomBuildings.Spawns[0]).pos,container1.pos)
        memory.controller.hasSetRoad = memory.controller.hasSetRoad+1
      }
    }
  }
}