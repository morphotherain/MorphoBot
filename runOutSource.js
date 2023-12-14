
var utils = require('util')

var addSpawn = require('addSpawn')
var creepManagers = require('creepManagers')
const { moveOverRoomsEX } = require('./util')
var RoomInit = require('Init')
const logger = require('mylog');
const energyManager = require('assignDropEnergy');

var runOutSource = {
    run : function(roomName,roomSourceName){


   var roomBuildings = Memory.rooms[roomName].buildings
   
   if(Game.time % 300000 == 0 || false)
   {
      if(Game.rooms[roomSourceName])
         delete Memory.rooms[roomSourceName].roads
      if(Memory.rooms[roomName].roads)
         delete Memory.rooms[roomName].roads
   }

   if(roomName == "W13N8")
   {
      var roomSourceNames = ["W12N8","W12N7",]
      if( Game.time%300 <150 && Game.time%300 >=0)
         roomSourceName = roomSourceNames[0]
      if( Game.time%300 <300 && Game.time%300 >=150)
         roomSourceName = roomSourceNames[1]
   }

   var creepManage = creepManagers.Manage(roomName)

   if(Game.rooms[roomSourceName]!=undefined){
      //var repair_targets = Game.rooms[roomSourceName].find(FIND_STRUCTURES, {
      //   filter: object => object.hits < object.hitsMax
      //
      //});
      //repair_targets.sort((a,b) =>  (b.hitsMax-b.hits)-(a.hitsMax-a.hits));
   }

    var creepBodys = {
     harvests:{
         1:{'work':1,'carry':1,'move':1},
         2:{'work':3,'carry':1,'move':2},
         3:{'work':5,'carry':1,'move':3},
         4:{'work':5,'carry':1,'move':3},
         5:{'work':5,'carry':1,'move':3},
         6:{'work':5,'carry':1,'move':3},
         7:{'work':5,'carry':1,'move':3},
         8:{'work':5,'carry':1,'move':3},
     priority : creepManage.harvertsOutside.priority
     },
     carrier:{
         1:{"work":0,'carry':3 ,'move':3 },
         2:{"work":0,'carry':5 ,'move':5 },
         3:{"work":1,'carry':9,'move':5 },
         4:{"work":1,'carry':15,'move':8},
         5:{"work":2,'carry':16,'move':10},
         6:{"work":2,'carry':16,'move':10},
         7:{"work":2,'carry':16,'move':10},
         8:{"work":2,'carry':16,'move':10},
         priority : creepManage.carrierOutside.priority
      }
    }

    if((Game.time%1000)%5!=0)
    {
      creepBodys.carrier = 
      {
         1:{"work":0,'carry':3 ,'move':3 },
         2:{"work":0,'carry':6 ,'move':3 },
         3:{"work":0,'carry':10,'move':5 },
         4:{"work":0,'carry':16,'move':8},
         5:{"work":0,'carry':24,'move':12},
         6:{"work":0,'carry':24,'move':12},
         7:{"work":0,'carry':24,'move':12},
         8:{"work":0,'carry':24,'move':12},
         priority : creepManage.carrierOutside.priority
      }
    }


    if(!Memory.hasConstructionSitesOut)
      Memory.hasConstructionSitesOut = {};

    if(Memory.hasConstructionSitesOut[roomSourceName])
    {
      creepBodys.carrier = 
      {
         1:{"work":1,'carry':2 ,'move':2 },
         2:{"work":2,'carry':3 ,'move':3 },
         3:{"work":2,'carry':8,'move':4 },
         4:{"work":2,'carry':14,'move':7},
         5:{"work":2,'carry':16,'move':9},
         6:{"work":2,'carry':16,'move':9},
         7:{"work":2,'carry':16,'move':9},
         8:{"work":2,'carry':16,'move':9},
         priority : creepManage.carrierOutside.priority
      }
    }

 

   
   var level = Memory.level[roomName]
   if(level < 1)return;

   var memory = utils.getRoomMem(roomName);
   memory.sourceOut = undefined

   if(Game.rooms[roomSourceName]!=undefined ){
      memory.sourceOut = 
      {
         sourcesID : RoomInit.getObjectID(roomSourceName,FIND_SOURCES),
         harversts : [("ho"+roomSourceName)],
         harverstsNum : RoomInit.getObjectID(roomSourceName,FIND_SOURCES).length,
         carriers : [("co"+roomSourceName)],
         carriersNum : RoomInit.getObjectID(roomSourceName,FIND_SOURCES).length*0
      }
   }
   else
   {
      memory.sourceOut = 
      {
         sourcesID : undefined,
         harversts : [("ho"+roomSourceName)],
         carriers : [("co"+roomSourceName)],
         harverstsNum : 1,
         carriersNum : 0
      }
   }

   

   var harvest = function(creep,i){

      if(!Memory.hasConstructionSitesOut)
         Memory.hasConstructionSitesOut = {};

      if(Game.time % 10 == 0){
         var hasConstructionSitesOut = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES, {
            filter: function(object) {
                  return ((object.structureType == STRUCTURE_WALL && object.hits<1000 ) || object.structureType != STRUCTURE_RAMPART);
            }})
         if(hasConstructionSitesOut)
            Memory.hasConstructionSitesOut[creep.room.name] = true;
         else
            Memory.hasConstructionSitesOut[creep.room.name] = false;

      }
         

      //console.log(creep.name,i)

   
      if(Game.rooms[roomSourceName]==undefined){      
         var res = utils.moveOverRoomsEX(creep.room.name,roomSourceName,creep)
         if(res == -2)
         {
            const exitDir = creep.room.findExitTo(roomSourceName);
            const exit = creep.pos.findClosestByRange(exitDir);
            creep.moveTo(exit);
         }
         return;
      }

      var sourceID = ""
      if(!creep.memory.sourceId){
         sourceID = memory.sourceOut.sourcesID[i%2]
         creep.memory.sourceId = sourceID
      }
      else{
         sourceID = creep.memory.sourceId
      }
      var source = Game.getObjectById(sourceID);

      var container = source.pos.findClosestByRange(FIND_STRUCTURES, {
         filter: function(object) {
               return (object.structureType == STRUCTURE_CONTAINER && 
                        object.pos.inRangeTo(source,1)
                  );
         }
      });

      
      if(creep.room.name != roomSourceName)
      {
         var res = utils.moveOverRoomsEX(creep.room.name,roomSourceName,creep)
         if(res == -2)
         {
            const exitDir = creep.room.findExitTo(roomSourceName);
            const exit = creep.pos.findClosestByRange(exitDir);
            creep.moveTo(exit);
         }
         return;
      }
      var result = creep.harvest(Game.getObjectById(sourceID))

      if(true){
         if(container != null){
            creep.moveTo(container,{swampCost:1,maxRooms:1})
         }
         else{
            creep.moveTo(source,{swampCost:1,maxRooms:1})
            //console.log("source.id",source.id)
         }
      }


      if(creep.store[RESOURCE_ENERGY]>40)
      {
         if(container != null);
         else if(!(creep.pos.findInRange(FIND_CONSTRUCTION_SITES,2,{
            filter:(s)=>s.structureType == "container"
         }).length>0)) Game.rooms[creep.room.name].createConstructionSite(creep.pos, STRUCTURE_CONTAINER);

         var repair_target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: object => object.hits < object.hitsMax
         });
         
         if(repair_target && creep.pos.inRangeTo(repair_target,3))
            creep.repair(repair_target)
         else{
            var build_target = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES, {
               filter: function(object) {
                     return ((object.structureType == STRUCTURE_WALL && object.hits<1000 ) || object.structureType != STRUCTURE_RAMPART);
               }
            })
            if(build_target)
               if(creep.pos.inRangeTo(build_target,3))
               {
                  creep.build(build_target)
                  return;
               }
         }
      }
   }

   var storeToLink = function(creep){

      if(!Game.flags["LinkOut1"+roomName])Game.rooms[roomName].createFlag(25, 25, "LinkOut1"+roomName);
      var flag = Game.flags["LinkOut1"+roomName]
      
      
      if(flag == undefined)
         return -2;
      const links = flag.pos.findInRange(FIND_STRUCTURES, 1, {
         filter: { structureType: STRUCTURE_LINK }
         });
         
         
      if(links.length == 0 )
         return -3;
      
      if(links[0].store.getFreeCapacity()==0)
         return -4;
      var  result = creep.transfer(links[0],RESOURCE_ENERGY)
      if(result==ERR_NOT_IN_RANGE){
         if(creep.room.name == links[0].room.name){
            creep.moveTo(links[0],{visualizePathStyle:{}})
         }
         else
         {
            utils.moveOverRoomsEX(creep.room.name,links[0].room.name,creep)
         }
      }
      if(result == OK)
         delete creep.memory.cachedPath;
      if(creep.pos.inRangeTo(links[0],1))
         return 1;
      return 0
   
   }

   var store = function(creep,i)
   {

      if(Game.rooms[roomSourceName]==undefined)
         return;

      //var sourceID = memory.sourceOut.sourcesID[i%2]
      //var source = Game.getObjectById(sourceID);
      //var container = source.pos.findClosestByRange(FIND_STRUCTURES, {
      //   filter: function(object) {
      //         return object.structureType == STRUCTURE_CONTAINER;
      //   }
      //});


      var next = false;
      if(creep.store[RESOURCE_ENERGY]==0)creep.memory.full = false;
      if(creep.store.getFreeCapacity()==0)creep.memory.full = true;
      
      if(creep.memory.full)
      {


         if(creep.room.name == roomName)
         {
            var res = -1;
            if(roomSourceName == "W53N26" || roomSourceName == "W53N24"|| roomSourceName == "W55N22"|| roomSourceName == "W54N22"||  roomSourceName == "W54N21" ||  roomSourceName == "")
            {
               res = storeToLink(creep) 
               if(res==1)
                  next = true;
               
            }
            if(res<0)
            {
               if(creep.room.storage){
                  var answer = creep.transfer(creep.room.storage,RESOURCE_ENERGY) 
                  if(answer==ERR_NOT_IN_RANGE)
                     creep.moveTo(creep.room.storage,{visualizePathStyle:{}})
                  if(answer== OK)
                     delete creep.memory.cachedPath;
                  if(creep.pos.inRangeTo(creep.room.storage,1))
                     next = true
               }
               else
               {
                  var container = Game.getObjectById(roomBuildings.Containers[2]);
                  if(container != null)
                  {
                    if(creep.transfer(container,RESOURCE_ENERGY)==ERR_NOT_IN_RANGE){
                        //utils.railwayMove(creep,container,1)
                        creep.moveTo(container)
                        return;
                    }
                    return;
                  }
                  var findEnergyDropoff = function (creep) {
                     return creep.room.find(FIND_MY_CREEPS, {
                         filter: (creep) => {
                             return (creep.name[0]=='u' &&
                                     creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0)
                         }
                     });
                  }      
                  var targets = findEnergyDropoff(creep)
                  if(targets[0] != null)
                  {
                     targets.sort((a,b) => a.store[RESOURCE_ENERGY]  - b.store[RESOURCE_ENERGY] );
                     if(creep.transfer(targets[0],RESOURCE_ENERGY)==ERR_NOT_IN_RANGE)
                        creep.moveTo(targets[0])
                  }
                  else{
                     if(!Game.flags["store"+roomName])Game.rooms[roomName].createFlag(25, 25, "store"+roomName);
                     var flag = Game.flags["store"+roomName]
                     if(creep.pos.isEqualTo(flag))
                        {next = true;creep.drop(RESOURCE_ENERGY);}
                     else
                        creep.moveTo(flag)
                  }
               }
            }
         }
         else
         {
            if(true && creep.getActiveBodyparts(WORK)!=0){
               var repair_target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                  filter: object => object.hits < object.hitsMax
               });
               if(repair_target){
                  creep.repair(repair_target)
                  if(repair_target.hitsMax - repair_target.hits>1000)
                  return;
               }

            }
            utils.moveOverRoomsEX(creep.room.name,roomName,creep)
         }
         if(true && creep.getActiveBodyparts(WORK)!=0)
         {
            var build_target = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES)
            if(build_target && creep.room.name != roomName)
            {
               creep.build(build_target)
               creep.moveTo(build_target,{visualizePathStyle:{}})
               return;
            }
            
         }
         //harvest(creep,sourceID)
         return;
      }
      if(!creep.memory.full || next)
      {

         if(creep.ticksToLive < 50)
         {
            utils.recycleCreep(creep,roomName)
            return;
         }
         
         var spawn = Game.getObjectById(roomBuildings.Spawns[0]);
         const road = creep.pos.lookFor(LOOK_STRUCTURES,{filter:(s)=>s.structureType == "road"})
         const roadc = creep.pos.lookFor(LOOK_CONSTRUCTION_SITES, {filter:(s)=>s.structureType == "road"})
         const hasRoad = ((road && road.length && road.length > 0) || (roadc && roadc.length && roadc.length > 0))
         if(!hasRoad && !creep.spawning)    
            if(spawn)
               utils.createRoadBetween(spawn.pos,source.pos)
 
         if(creep.room.name != roomSourceName)
         {
            var resMove = utils.moveOverRoomsEX(creep.room.name,roomSourceName,creep)
            if(resMove == -2)
            {
               const exitDir = creep.room.findExitTo(roomSourceName);
               const exit = creep.pos.findClosestByRange(exitDir);
               creep.moveTo(exit);
               var sourceID = memory.sourceOut.sourcesID[i%2]
               var source = Game.getObjectById(sourceID);
               if(source != null && !creep.spawning)
               {
                  if(spawn)
                     utils.createRoadBetween(spawn.pos,source.pos)
               }
            }
         }
         else
         {
            var sourceID = memory.sourceOut.sourcesID[i%2]
            var source = Game.getObjectById(sourceID);
            if(source == null )
               return;
            var container = source.pos.findClosestByRange(FIND_STRUCTURES, {
               filter: function(object) {
                     return object.structureType == STRUCTURE_CONTAINER;
               }
            });

            if(container!= null){

               var result = creep.withdraw(container,RESOURCE_ENERGY)
               if(result = OK)
                  delete creep.memory.cachedPath;
               var result = utils.railwayMove(creep,container,1)

               if(creep.pos.inRangeTo(container,1))
                  utils.moveOverRoomsEX(creep.room.name,roomName,creep)//creep.moveTo(creep,{visualizePathStyle:{}})
            }
            else
            {
               energyManager.pickupEnergy(creep)
            }
         }

      }
   }      
   //孵化矿工
   
   var times = 1
   if(level<2)
      times = 2;

   for(var i = 0;i<memory.sourceOut.harverstsNum*times;i++){
      if(Game.creeps[(memory.sourceOut.harversts[0]+i)+"Day"] != undefined)
      {
         var creep = Game.creeps[(memory.sourceOut.harversts[0]+i)+"Day"]
         harvest(creep,i)
      }
      if(Game.creeps[(memory.sourceOut.harversts[0]+i)+"Night"] != undefined)
      {
         var creep = Game.creeps[(memory.sourceOut.harversts[0]+i)+"Night"]
         harvest(creep,i)
      }
      if(true)
         addSpawn(roomName,
            creepBodys.harvests[level],
            (memory.sourceOut.harversts[0]+i),
            creepBodys.harvests.priority)
      
   }
   //孵化搬运工
   var times = 1
   if(level<2)
      times = 0;
   if(level == 2)
   {
      var container = Game.getObjectById(roomBuildings.Containers[2]);
      if(container != null)
      {
         times = 1;   
      }
      else
      {
         times = 0;
      }
                     
   }
   if(level>=3 && level<5)
      times = 2;
   if(roomSourceName == "W53N24" || roomSourceName == "W53N26" || roomSourceName == "W54N22" || roomSourceName == "W54N21")
      times = 2;
   for(var i = 0;i<memory.sourceOut.harverstsNum*times;i++){
      if(memory.sourceOut.harverstsNum == 1 && i==1)
         i++;
      if(Game.creeps[(memory.sourceOut.carriers[0]+i)+"Day"] != undefined)
      {
         var creep = Game.creeps[(memory.sourceOut.carriers[0]+i)+"Day"]
         store(creep,i)
      }
      if(Game.creeps[(memory.sourceOut.carriers[0]+i)+"Night"] != undefined)
      {
         var creep = Game.creeps[(memory.sourceOut.carriers[0]+i)+"Night"]
         store(creep,i)
      }

      if(true)
      {
         addSpawn(
            roomName,
            creepBodys.carrier[level],
            (memory.sourceOut.carriers[0]+i),
            creepBodys.carrier.priority)
      }
   
   }
  }
}


module.exports = runOutSource

