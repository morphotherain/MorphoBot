
var utils = require('util')

var addSpawn = require('addSpawn')
var RoomInit = require('Init')

var runTools = 

 {
    run : function(roomName)
    {
        var creepBodys = {
            toolsA:{
                1:{'carry':10,'move':5},
                priority : 7
            },
            toolsupgrade:{
                1:{'work':1,'move':1,'carry':1},
                priority : 6
            }
        }
        var energyCapacityAvailable = Game.rooms[roomName].energyCapacityAvailable;
        var level = 1
        var memory = utils.getRoomMem(roomName);
        if(memory.tools == undefined || Game.time%10==1)
        {
        memory.tools = 
        {
            toolsA : ["t1"],
            toolsupgrade : ["tu"]
        }
        }
        var toolsA = function(creep){
            carry(creep)
        }
        var toolsU = function(creep){
            upgrade(creep)
        }
        var i = 0;
        if(Game.creeps[(memory.tools.toolsA[0]+i)] != undefined)
        {
           
            var creep = Game.creeps[(memory.tools.toolsA[0]+i)]
        
            toolsA(creep)
        }
        else
        {
            if(false)
            addSpawn(roomName,creepBodys.toolsA[level],(memory.tools.toolsA[0]+i),creepBodys.toolsA.priority)
        }
        i = 0;
        if(Game.creeps[(memory.tools.toolsupgrade[0]+i)] != undefined)
        {
           
            var creep = Game.creeps[(memory.tools.toolsupgrade[0]+i)]
        
            toolsU(creep)
        }
        else
        {
            if(false)
            addSpawn(roomName,creepBodys.toolsupgrade[level],(memory.tools.toolsupgrade[0]+i),creepBodys.toolsupgrade.priority)
        }
        
 }
}

module.exports = runTools;

var upgrade = function(creep)
{
    if(creep.store.getUsedCapacity(RESOURCE_ENERGY)==0)
    {
        
        (creep.withdraw(creep.room.storage,RESOURCE_ENERGY)==ERR_NOT_IN_RANGE)
            creep.moveTo(creep.room.storage)
    }
    else{
        
        (creep.upgradeController(creep.room.controller)==ERR_NOT_IN_RANGE)
            creep.moveTo(Game.flags["upgrade"])

    }
    
}

var findEnergyDropoff = function (creep) {
    return creep.room.find(FIND_MY_CREEPS, {
        filter: (creep) => {
            return (creep.name[0]=='b' &&
                    creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0)
        }
    });
  }
   var getEnergy = function(creep)
   {
    const targets = creep.room.find(FIND_DROPPED_RESOURCES);
    targets.sort((a,b) => b.amount-a.amount);

    if(targets.length) {
        creep.name+creep.moveTo(targets[0]);
        creep.pickup(targets[0]);
    }
    
   }
   var saveEnergy = function(creep)
   {
    var targets = findEnergyDropoff(creep)
    
    targets.sort((a,b) => a.store[RESOURCE_ENERGY]  - b.store[RESOURCE_ENERGY] );
    if(targets[0] != null)
    {
      if(creep.transfer(targets[0],RESOURCE_ENERGY)==ERR_NOT_IN_RANGE)
       creep.moveTo(targets[0])
    }
   }
   var carry = function(creep){
    if(creep.store[RESOURCE_ENERGY]>0)
      saveEnergy(creep)
    else
      getEnergy(creep)
   }