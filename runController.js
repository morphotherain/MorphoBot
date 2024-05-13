
var utils = require('util')

var addSpawn = require('addSpawn')
var creepManagers = require('creepManagers')
const energyManager = require('assignDropEnergy');

var theRoomName = ''

var runController = {
    run : function(roomName){
    var creepManage = creepManagers.Manage(roomName)
    var roomBuildings = Memory.rooms[roomName].buildings

    theRoomName = roomName
    var creepBodys = {
      carriers:{
        0:{'carry':2,'move':2 },
        1:{'carry':3,'move':3},
        2:{'carry':6,'move':3},
        3:{'carry':10,'move':5},
        4:{'carry':16,'move':8},
        5:{'carry':16,'move':8},
        6:{'carry':16,'move':8},
        7:{'carry':24,'move':12},
        8:{'carry':2,'move':1},
        priority : creepManage.carrierForUpgrade.priority
      },
      upgraders:{
        0:{'work':1,'move':1,'carry':1},
        1:{'work':1,'move':1,'carry':1},
        2:{'work':4,'move':1,'carry':2},
        3:{'work':6,'move':2,'carry':2},
        4:{'work':10,'move':2,'carry':4},
        5:{'work':15,'move':3,'carry':3},
        6:{'work':15,'move':8,'carry':4},
        7:{'work':15,'move':10,'carry':4},
        8:{'work':1,'move':1,'carry':4},
        priority : creepManage.upgraders.priority
      },
    }

    var level = Memory.level[roomName]
    if(Game.rooms[roomName].controller.level == 8 )
      level = 8;

    var memory = utils.getRoomMem(roomName);
    if(memory.controller == undefined)
    {
      memory.controller = 
      {
        upgraders : ["u"],
        upgradersNum : 3,
        carriers : ["cu"],
        carriersNum : 3
      }
    }

    memory.controller.upgraders = ["u"+roomName]
    memory.controller.carriers = ["cu"+roomName]
    
    
    creepManage.controller.update(roomName)

    SetRoadBetweenContainerAndSpawn(roomName,roomBuildings)

    var findEnergyDropoff = function (creep) {
    return creep.room.find(FIND_MY_CREEPS, {
        filter: (creep) => {
            return (creep.name[0]=='u' &&
                    creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0)
        }
    });
    }
    
    var ignoreCreep = true;
    if(memory.constructureSitesNum > 0)ignoreCreep = false
    var getEnergy = function(creep,i)
    {
      if(utils.getEnergyFromRuins(creep)!=-1)
        return;
      if(creep.room.storage!=undefined && creep.room.storage.store[RESOURCE_ENERGY]<=50000)
        return; 
      if(creep.room.storage!=undefined && creep.room.storage.store[RESOURCE_ENERGY]>50000) 
      {
          if(creep.withdraw(creep.room.storage,RESOURCE_ENERGY)==ERR_NOT_IN_RANGE)
            creep.moveTo(creep.room.storage)
      }
      else{
        if(creep.room.energyAvailable != creep.room.energyCapacityAvailable  && energyManager.pickupEnergy(creep,creep.store.getFreeCapacity()) != -1  )
          return;
        if(creep.room.energyAvailable == creep.room.energyCapacityAvailable  && energyManager.pickupEnergy(creep, 0) != -1  )
          return;
        else
        {
          var containersID = [roomBuildings.Containers[0],roomBuildings.Containers[1]]
          var container = Game.getObjectById(containersID[i%2]);

          if(container)
          {
            if(creep.room.energyAvailable != creep.room.energyCapacityAvailable && container.store["energy"]<500)
              return;
            if(creep.withdraw(container,RESOURCE_ENERGY)==ERR_NOT_IN_RANGE)
              creep.moveTo(container,{visualizePathStyle:{},reusePath:50,ignoreCreeps: ignoreCreep});
            if(creep.pos.inRangeTo(container,1))
              ;//creep.moveTo(creep.room.storage,{visualizePathStyle:{}})
            return;
          }
        }
      }

    }
    var saveEnergy = function(creep)
    {

      var container = Game.getObjectById(roomBuildings.Containers[2]);
      if(container != null)
      {
        if(creep.transfer(container,RESOURCE_ENERGY)==ERR_NOT_IN_RANGE){
            creep.moveTo(container,{ignoreCreeps: ignoreCreep})
        }
      }
      else{
        var targets = findEnergyDropoff(creep)
        if(targets[0] != null)
        {
          targets.sort((a,b) => a.store[RESOURCE_ENERGY]  - b.store[RESOURCE_ENERGY] );
          if(creep.transfer(targets[0],RESOURCE_ENERGY)==ERR_NOT_IN_RANGE)
            creep.moveTo(targets[0])
        }
      }
    }


    var carry = function(creep,i){
      if(creep.store[RESOURCE_ENERGY]>0)
        saveEnergy(creep)
      else
        getEnergy(creep,i)
    }


    var upgrade = function(creep){

      //if(creep.room.name == "W55N21"){
      //  if(boostCreep(creep,roomBuildings.Labs))
      //    return;
        //if(!unboostCreep(creep))
        //  return;
      //}

      var container = Game.getObjectById( roomBuildings.Containers[2] )
      var link = Game.getObjectById( roomBuildings.Links[3] )

      if(link && container)
      {
        if(link.store[RESOURCE_ENERGY]>container.store[RESOURCE_ENERGY])
          container = link;
      }

      if(creep.store[RESOURCE_ENERGY] <= 20)
      {
        if(container != undefined){
          if(container.store[RESOURCE_ENERGY]<20){
            if(!creep.pos.inRangeTo(creep.room.controller, 2))
              creep.moveTo(creep.room.controller)
          }
          else{
            if(creep.withdraw(container,RESOURCE_ENERGY)==ERR_NOT_IN_RANGE)
              creep.moveTo(container)
            else
              creep.moveTo(container)
          }
        }
        else
        {
          creep.moveTo(creep.room.controller)
        }
      } 
      if(creep.upgradeController(creep.room.controller)==ERR_NOT_IN_RANGE)
        creep.moveTo(creep.room.controller)
      
      if(!Game.flags["upgrade"+theRoomName])Game.rooms[theRoomName].createFlag(creep.room.controller.pos.x, creep.room.controller.pos.y, "upgrade"+theRoomName);
      if(creep.pos.getRangeTo(Game.flags["upgrade"+theRoomName],0) == 1)
        creep.moveTo(Game.flags["upgrade"+theRoomName])
    }

    var countC = memory.controller.carriersNum
    for(var i = 0;i<(countC>4?countC:4);i++){
      if(Game.creeps[(memory.controller.carriers[0]+i)+"Day"] != undefined)
      {
        var creep = Game.creeps[(memory.controller.carriers[0]+i)+"Day"]
        carry(creep,i)
      }
      if(Game.creeps[(memory.controller.carriers[0]+i)+"Night"] != undefined)
      {
        var creep = Game.creeps[(memory.controller.carriers[0]+i)+"Night"]
        carry(creep,i)
      }


      if(true && i<memory.controller.carriersNum){
        addSpawn(roomName,creepBodys.carriers[level],(memory.controller.carriers[0]+i),creepBodys.carriers.priority)
      }
       
    }
    var countU = memory.controller.upgradersNum
    for(var i = 0;i<(countU>4?countU:4);i++){
      var name = (memory.controller.upgraders[0]+i)
      if(Game.creeps[name+"Day"] != undefined)
      {
        var creep = Game.creeps[name+"Day"]
        upgrade(creep)
        if(i == 3)
          creep.say(((creep.room.controller.progress / creep.room.controller.progressTotal)*100).toFixed(2)+"%")
      }
      if(Game.creeps[name+"Night"] != undefined)
      {
       var creep = Game.creeps[name+"Night"]
       upgrade(creep)
       if(i == 3)
        creep.say(((creep.room.controller.progress / creep.room.controller.progressTotal)*100).toFixed(2)+"%")
      }

      if(true && i<memory.controller.upgradersNum)
        addSpawn(roomName,creepBodys.upgraders[level],(memory.controller.upgraders[0]+i),creepBodys.upgraders.priority)
    
    }
    
  }
}

  
module.exports = runController;

var build = function(creep){
  if(creep == undefined) {return;}
  const target = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
  if(target) {
      
      if(creep.build(target) == ERR_NOT_IN_RANGE) {
          creep.moveTo(target);
      }
      else
      {
        creep.moveTo(target);
        //creep.moveTo(Game.flags[flag_build_name[theRoomName]])  
      }
   } 
  else{
  }
  //creep.moveTo(Game.flags['Flag1'])
 }


 function boostCreep(creep, labs) {
  if(creep.ticksToLive == 1499)
    creep.memory.boosted = false
  // 检查 Creep 是否已经被 Boost
  if (creep.memory.boosted || creep.ticksToLive < 1400 ) {
      return false;
  }

  const lab0 = Game.getObjectById(labs[0]);
  const lab1 = Game.getObjectById(labs[1]);
  const lab2 = Game.getObjectById(labs[2]);
  if (!lab0) {
      return false;
  }


  var flag = true;
  if(!checkAndBoost(lab0,creep)){
    if(!checkAndBoost(lab1,creep)){
      if(!checkAndBoost(lab2,creep))
      {
        flag = false;
  }}}
  return flag;  
}

function checkAndBoost(lab,creep)
{
  // 检查 Lab 中是否有足够的 XGH2O 和能量
  if (lab.store[RESOURCE_CATALYZED_GHODIUM_ACID] > 1050 && lab.energy >= 700) {
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
}


const lab1 = Game.getObjectById("6552ce448735af6774ae030d");
const lab2 = Game.getObjectById("6552de07beca3ef0f71dac1a");
const lab3 = Game.getObjectById("6552cd418af01bc4942eb8e2");

const lab4 = Game.getObjectById("");
const lab5 = Game.getObjectById("");
const lab6 = Game.getObjectById("");




function unboostCreep(creep) {
  // 检查 Creep 是否已经被 Boost
  
  
  if (!creep.memory.boosted || creep.ticksToLive > 50  ) {
      return true;
  }
  var lab = 0;
  if(lab1.cooldown === 0)
    lab = lab1;
  if(lab2.cooldown === 0)
    lab = lab2;
  if(lab3.cooldown === 0)
    lab = lab3;
  if(lab4 && lab4.cooldown === 0)
    lab = lab4;
  if(lab5 && lab5.cooldown === 0)
    lab = lab5;
  if(lab6 && lab6.cooldown === 0)
    lab = lab6;
  if(lab == 0){
    creep.memory.unboostState = "Unboost Creep:没有找到可用Lab"
    return true
  }
  var container = Game.getObjectById("6552d0d26d21987aec13d1f3")
  if(creep.ticksToLive < 50)
    creep.moveTo(container);

  var result = -1
  if(creep.pos.isEqualTo(container.pos))
    result = lab.unboostCreep(creep)
  if(result === OK ){
    creep.memory.boosted = false;
    return false;
  }
  return false;
}

function SetRoadBetweenContainerAndSpawn(roomName,roomBuildings)
{
  var memory = utils.getRoomMem(roomName);
  if(memory.controller.hasSetRoad)return;
  var containersID = roomBuildings.Containers[2]
  var room = Game.rooms[roomName]
  if(Game.time % 100 == 0)
  {
    var container0 = Game.getObjectById(containersID)
    if(container0)
    {
      let structure = room.lookForAt(LOOK_STRUCTURES, container0.pos.x, container0.pos.y);
      let constructionSite = room.lookForAt(LOOK_CONSTRUCTION_SITES, container0.pos.x, container0.pos.y);
      let hasRoad = structure.some(s => s.structureType === STRUCTURE_ROAD);
      let hasRoadSite = constructionSite.some(s => s.structureType === STRUCTURE_ROAD);

      // 如果没有道路和道路工地，则考虑创建
      if (!hasRoad && !hasRoadSite) {
        utils.createRoadBetween(Game.getObjectById(roomBuildings.Spawns[0]).pos,container0.pos)
        memory.controller.hasSetRoad = true;
      }
    }
  }
}