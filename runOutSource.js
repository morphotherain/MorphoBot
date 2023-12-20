
var utils = require('util')

var addSpawn = require('addSpawn')
var creepManagers = require('creepManagers')
const { moveOverRoomsEX } = require('./util')
var RoomInit = require('Init')
const logger = require('mylog');
const energyManager = require('assignDropEnergy');


var runOutSource = {
   run : function(roomName,roomSourceName){
   var level = Memory.level[roomName]
   if(level < 1)return;
      

   var roomBuildings = Memory.rooms[roomName].buildings
   
   if(Game.time % 300000 == 0 || false)
   {
      if(Game.rooms[roomSourceName])
         delete Memory.rooms[roomSourceName].roads
      if(Memory.rooms[roomName].roads)
         delete Memory.rooms[roomName].roads
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

   

   
   
   var memory = utils.getRoomMem(roomName);

   //memory.sourceOut = undefined
   if(!Memory.sourceOut) Memory.sourceOut = {};
   if(!Memory.sourceOut[roomSourceName])Memory.sourceOut[roomSourceName] = {}
   
   if(!Memory.sourceOut[roomSourceName].harverstsNum)
   {
      Memory.sourceOut[roomSourceName] = 
      {
         sourcesID : [],
         sources : {},
         harverstsNum : 1,
         carriersNum : 0,
      }
   }

   var sourceRoom = Game.rooms[roomSourceName]
   var sourcesID = []
   if(sourceRoom)
   {
      if(Memory.sourceOut[roomSourceName].sourcesID.length == 0)
         Memory.sourceOut[roomSourceName].sourcesID = RoomInit.getObjectID(roomSourceName, FIND_SOURCES)
      
      sourcesID = Memory.sourceOut[roomSourceName].sourcesID

      Memory.sourceOut[roomSourceName].harverstsNum = sourcesID.length 
      Memory.sourceOut[roomSourceName].carriersNum = 0;

      for(let sourceID of sourcesID){
         var source = Game.getObjectById(sourceID)
         if(!source)continue
         
         if(!Memory.sourceOut[roomSourceName].sources[sourceID] || Memory.sourceOut[roomSourceName].sources[sourceID].route.length == 0)
         {

            Memory.sourceOut[roomSourceName].sources[sourceID] = {
               route : [],       //记录沿途每一个点
               containerID : "", //忽略
               roomExitIn : {},  //前往时需要经过的房间出口位置
               roomExitOut : {}  //返回时需要经过的房间出口位置
            }
            const spawn = Game.getObjectById(Memory.rooms[roomName].buildings.Spawns[0])
            const pathResult = PathFinder.search(spawn.pos, { pos: source.pos, range: 1 }, {
               // 忽略道路成本
               plainCost: 4,
               swampCost: 5,
         
               roomCallback: function (roomName) {
                 let room = Game.rooms[roomName];
                 if (!room) return;
                 let costs = new PathFinder.CostMatrix;
                 var roads = room.find(FIND_STRUCTURES, { filter: (s) => s.structureType === STRUCTURE_ROAD })
                 for (var i of roads)
                   costs.set(i.pos.x, i.pos.y, 1);
                 room.find(FIND_STRUCTURES).forEach(function (struct) {
                   if (struct.structureType === STRUCTURE_ROAD) {
                     // 已存在的道路成本较低
                     costs.set(struct.pos.x, struct.pos.y, 1);
                   } else if (struct.structureType !== STRUCTURE_CONTAINER &&
                     (struct.structureType !== STRUCTURE_RAMPART ||
                       !struct.my)) {
                     // 不能穿过非自己的建筑
                     costs.set(struct.pos.x, struct.pos.y, 0xff);
                   }
                 });
                 room.find(FIND_CONSTRUCTION_SITES).forEach(function (struct) {
                   if (struct.structureType === STRUCTURE_ROAD) {
                     // 已存在的道路成本较低
                     costs.set(struct.pos.x, struct.pos.y, 1);
                   }
                 });
                 // 获取房间内所有己方 Creep
                 const roomCreeps = room.find(FIND_MY_CREEPS);
         
                 // 遍历所有 Creep 并更新 costs
                 for (const thecreep of roomCreeps) {
                   costs.set(thecreep.pos.x, thecreep.pos.y, 1);
                 }
         
                 return costs;
               }
            })
            const path = pathResult.path 
            // 遍历路径点  
            let previousRoomName = spawn.pos.roomName;
            let prevPos = spawn.pos
            for (let i = 0; i < path.length; i++) {
               let step = path[i];
               Memory.sourceOut[roomSourceName].sources[sourceID].route.push({ x: step.x, y: step.y, roomName: step.roomName });

               if (step.roomName !== previousRoomName) {
                  // 我们正在穿越到一个新房间
                  
                  console.log(previousRoomName,prevPos)
                  if (!Memory.sourceOut[roomSourceName].sources[sourceID].roomExitOut[previousRoomName]) {
                        // 记录离开上一个房间的位置
                        Memory.sourceOut[roomSourceName].sources[sourceID].roomExitOut[previousRoomName] = { x: prevPos.x, y: prevPos.y };
                  }
                  var x = prevPos.x 
                  x = (x == 49)?0:x;
                  x = (x == 0) ?49:x;
                  var y = prevPos.y 
                  y = (y == 49)?0:y;
                  y = (y == 0) ?49:y; 
                  if (!Memory.sourceOut[roomSourceName].sources[sourceID].roomExitIn[step.roomName]) {
                        // 记录进入新房间的位置
                        Memory.sourceOut[roomSourceName].sources[sourceID].roomExitIn[step.roomName] = { x: x, y: y };
                  }

               }
               previousRoomName = step.roomName;
               prevPos = step
            }

            // 也许需要添加路径的最后一个点（source位置）作为最后一个房间的出口
            let lastStep = path[path.length - 1];
            if (!Memory.sourceOut[roomSourceName].sources[sourceID].roomExitOut[lastStep.roomName]) {
               Memory.sourceOut[roomSourceName].sources[sourceID].roomExitOut[lastStep.roomName] = { x: lastStep.x, y: lastStep.y };
            }

         }
         var container = Game.getObjectById(Memory.sourceOut[roomSourceName].sources[sourceID].containerID)
         
         if(!container)
         {
            var containerForSource = source.pos.findClosestByRange(FIND_STRUCTURES, {
               filter: function(object) {
                     return (object.structureType == STRUCTURE_CONTAINER && 
                              object.pos.inRangeTo(source,1)
                        );
               }
            });
            if(containerForSource)
               Memory.sourceOut[roomSourceName].sources[sourceID].containerID = containerForSource.id; 
         }
      }
      if(!Memory.sourceOut[roomSourceName].checkTime) Memory.sourceOut[roomSourceName].checkTime = 50;
      if(Game.time % Memory.sourceOut[roomSourceName].checkTime == 0 && level>=2)
      {
         sourcesID = Memory.sourceOut[roomSourceName].sourcesID
         var i = 0
         for(let sourceID of sourcesID){
            // 假设这是你的Memory结构
            if((Game.time / Memory.sourceOut[roomSourceName].checkTime)/2 == i)continue;
            i++
            if (!Memory.sourceOut[roomSourceName].sources[sourceID].currentCheckIndex) {
               Memory.sourceOut[roomSourceName].sources[sourceID].currentCheckIndex = 0;
            }

            // 每个tick只检查一个点
            let currentIndex = Memory.sourceOut[roomSourceName].sources[sourceID].currentCheckIndex;
            let currentPoint = Memory.sourceOut[roomSourceName].sources[sourceID].route[currentIndex];

            // 获取当前点的房间对象
            let room = Game.rooms[currentPoint.roomName];
            if (room) {
               // 检查当前点是否有道路或道路建筑工地
               let structures = room.lookForAt(LOOK_STRUCTURES, currentPoint.x, currentPoint.y);
               let constructionSites = room.lookForAt(LOOK_CONSTRUCTION_SITES, currentPoint.x, currentPoint.y);

               let hasRoad = structures.some(s => s.structureType === STRUCTURE_ROAD);
               let hasRoadSite = constructionSites.some(s => s.structureType === STRUCTURE_ROAD);

               // 如果没有道路和道路工地，则考虑创建
               if (!hasRoad && !hasRoadSite) {
                  // 检查建筑工地数量是否未达到上限
                  Memory.sourceOut[roomSourceName].checkTime = 10;
                  if (Object.keys(Game.constructionSites).length < 80 ) {
                     room.createConstructionSite(currentPoint.x, currentPoint.y, STRUCTURE_ROAD);
                  }
               }
               else
               {
                  Memory.sourceOut[roomSourceName].checkTime = 50;
               }
            }
      
            // 更新当前检查的索引
            Memory.sourceOut[roomSourceName].sources[sourceID].currentCheckIndex++;
            if (Memory.sourceOut[roomSourceName].sources[sourceID].currentCheckIndex >= Memory.sourceOut[roomSourceName].sources[sourceID].route.length) {
               // 如果路径检查完成，重置索引
               Memory.sourceOut[roomSourceName].sources[sourceID].currentCheckIndex = 0;
            }
         }
      }
   }


   /* if (Game.rooms[roomSourceName] != undefined) {
      memory.sourceOut =
      {
         sourcesID: RoomInit.getObjectID(roomSourceName, FIND_SOURCES),
         harversts: [("ho" + roomSourceName)],
         harverstsNum: RoomInit.getObjectID(roomSourceName, FIND_SOURCES).length,
         carriers: [("co" + roomSourceName)],
         carriersNum: RoomInit.getObjectID(roomSourceName, FIND_SOURCES).length * 0
      }
   }
   else {
      memory.sourceOut =
      {
         sourcesID: undefined,
         harversts: [("ho" + roomSourceName)],
         carriers: [("co" + roomSourceName)],
         harverstsNum: 1,
         carriersNum: 0
      }
   } */
   var findEnergyDropoff = function (creep) {
      return creep.room.find(FIND_MY_CREEPS, {
          filter: (creep) => {
              return (creep.name[0]=='b' &&
                      creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0)
          }
      });
    }
   

   var harvest = function(creep,i){

      if(!Memory.hasConstructionSitesOut)
         Memory.hasConstructionSitesOut = {};

      if(Game.time % 10 == 0){
         var hasConstructionSitesOut = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES)
         if(hasConstructionSitesOut)
            Memory.hasConstructionSitesOut[creep.room.name] = true;
         else
            Memory.hasConstructionSitesOut[creep.room.name] = false;

      }
         
      var sourceID = ""
      if(!creep.memory.sourceId){
         if(sourcesID.length > 0)
            sourceID = sourcesID[i%2]
         else sourceID = ""
         creep.memory.sourceId = sourceID
      }
      else{
         sourceID = creep.memory.sourceId
      }
      var source = Game.getObjectById(sourceID);
   
      if(Game.rooms[roomSourceName]==undefined){      
         var ExitPos
         if(Memory.sourceOut[roomSourceName].sources[sourceID])
            ExitPos = Memory.sourceOut[roomSourceName].sources[sourceID].roomExitOut[creep.room.name]
         if(!ExitPos)
         {
            const exitDir = creep.room.findExitTo(roomSourceName);
            const exit = creep.pos.findClosestByRange(exitDir);
            creep.moveTo(exit);
         }
         else
         {
            creep.moveTo(new RoomPosition(ExitPos.x,ExitPos.y,creep.room.name))
         }
         return;
      }


      var container = Game.getObjectById(Memory.sourceOut[roomSourceName].sources[sourceID].containerID)
      if(container)Memory.sourceOut[roomSourceName].carriersNum++;

      
      if(creep.room.name != roomSourceName)
      {
         var ExitPos
         if(Memory.sourceOut[roomSourceName].sources[sourceID])
            ExitPos = Memory.sourceOut[roomSourceName].sources[sourceID].roomExitOut[creep.room.name]
         if(!ExitPos)
         {
            const exitDir = creep.room.findExitTo(roomSourceName);
            const exit = creep.pos.findClosestByRange(exitDir);
            creep.moveTo(exit);
         }
         else
         {
            creep.moveTo(new RoomPosition(ExitPos.x,ExitPos.y,creep.room.name))
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
         if(container == null && !(creep.pos.findInRange(FIND_CONSTRUCTION_SITES,2,{
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

      var next = false;
      if(creep.store[RESOURCE_ENERGY]==0)creep.memory.full = false;
      if(creep.store.getFreeCapacity()==0)creep.memory.full = true;
      
      var sourceID = sourcesID[i%2]
      var source = Game.getObjectById(sourceID);

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
                  var target = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES,{filter:(s)=>s.structureType != "road"});
                  if(!target) target = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES)
                  if(target && creep.getActiveBodyparts(WORK)>0) {
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
                     var container = Game.getObjectById(roomBuildings.Containers[2]);
                     if(container != null && container.store.getFreeCapacity()>0)
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
                              return ((creep.name[0]=='u'||creep.name[0]=='b') &&
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
         }
         else
         {
            if(true && creep.getActiveBodyparts(WORK)!=0){
               var repair_target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                  filter: object => object.hits < object.hitsMax && object.pos.inRangeTo(creep,2)
               });
               if(repair_target){
                  creep.repair(repair_target)
                  if(repair_target.hitsMax - repair_target.hits>1000)
                     return;
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

            }
            if(Memory.sourceOut[roomSourceName].sources[sourceID])
               ExitPos = Memory.sourceOut[roomSourceName].sources[sourceID].roomExitIn[creep.room.name]
            if(!ExitPos)
            {
               const exitDir = creep.room.findExitTo(roomSourceName);
               const exit = creep.pos.findClosestByRange(exitDir);
               creep.moveTo(exit);
            }
            else
            {
               creep.moveTo(new RoomPosition(ExitPos.x,ExitPos.y,creep.room.name))
            }
         }
         
      }
      if(!creep.memory.full || next)
      {

         if(creep.ticksToLive < 50)
         {
            utils.recycleCreep(creep,roomName)
            return;
         }
         
         if(creep.room.name != roomSourceName)
         {
            var ExitPos
            if(Memory.sourceOut[roomSourceName].sources[sourceID])
               ExitPos = Memory.sourceOut[roomSourceName].sources[sourceID].roomExitOut[creep.room.name]
            if(!ExitPos)
            {
               const exitDir = creep.room.findExitTo(roomSourceName);
               const exit = creep.pos.findClosestByRange(exitDir);
               creep.moveTo(exit);
            }
            else
            {
               creep.moveTo(new RoomPosition(ExitPos.x,ExitPos.y,creep.room.name))
            }
            return;
         }
         else
         {
            var sourceID = sourcesID[i%2]
            var source = Game.getObjectById(sourceID);
            if(source == null )
               return;

            var container = Game.getObjectById(Memory.sourceOut[roomSourceName].sources[sourceID].containerID)
            if(container!= null){

               var result = creep.withdraw(container,RESOURCE_ENERGY)
               if(result = OK)
                  delete creep.memory.cachedPath;
               var result = utils.railwayMove(creep,container,1)

               //if(creep.pos.inRangeTo(container,1))
               //   utils.moveOverRoomsEX(creep.room.name,roomName,creep)//creep.moveTo(creep,{visualizePathStyle:{}})
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


   for(var i = 0;i<Memory.sourceOut[roomSourceName].harverstsNum*times;i++){
      if(Memory.sourceOut[roomSourceName].harverstsNum == 1 && i == 1) i = 2

      var dayName = (("ho"+roomSourceName)+i)+"Day"
      var nightName = (("ho"+roomSourceName)+i)+"Night"
      
      if(Game.creeps[dayName] != undefined)
      {
         var creep = Game.creeps[dayName]
         harvest(creep,i)
      }
      if(Game.creeps[nightName] != undefined)
      {
         var creep = Game.creeps[nightName]
         harvest(creep,i)
      }
      if(true)
         addSpawn(roomName,
            creepBodys.harvests[level],
            (("ho"+roomSourceName)+i),
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

   for(var i = 0;i<Memory.sourceOut[roomSourceName].harverstsNum*times;i++){
      var dayName = (("co"+roomSourceName)+i)+"Day"
      var nightName = (("co"+roomSourceName)+i)+"Night"
      if(Memory.sourceOut[roomSourceName].harverstsNum == 1 && i==1)
         i++;
      if(Game.creeps[dayName] != undefined)
      {
         var creep = Game.creeps[dayName]
         store(creep,i)
      }
      if(Game.creeps[nightName] != undefined)
      {
         var creep = Game.creeps[nightName]
         store(creep,i)
      }

      if(true)
      {
         addSpawn(
            roomName,
            creepBodys.carrier[level],
            (("co"+roomSourceName)+i),
            creepBodys.carrier.priority)
      }
   
   }
  }
}


module.exports = runOutSource

