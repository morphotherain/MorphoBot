
var utils = require('utilFun')

var addSpawn = require('addSpawn')
var creepManagers = require('creepManagers')
const { moveOverRoomsEX } = require('./utilFun')
var RoomInit = require('Init')
const logger = require('mylog');
const energyManager = require('assignDropEnergy');

var sources = [];

var runOutSource = {
    run : function(roomName,roomSourceName){

   
    var level = Memory.level[roomName]
    if(level < 6)return;

    var creepManage = creepManagers.Manage(roomName)

    var creepBodys = {
        harvests:{
            5:{'work':7,'carry':1,'move':3},
            6:{'work':7,'carry':1,'move':3},
            7:{'work':7,'carry':1,'move':3},
            8:{'work':7,'carry':1,'move':3},
        priority : creepManage.harvertsOutside.priority
        },
        carrier:{
            5:{"work":2,'carry':16,'move':10},
            6:{"work":2,'carry':16,'move':10},
            7:{"work":2,'carry':16,'move':10},
            8:{"work":2,'carry':16,'move':10},
            priority : creepManage.carrierOutside.priority
        },
        drones:{
            5:{"move":5,'ranged_attack':7,'heal':2},
            6:{},
            7:{},
            8:{},
            priority : creepManage.harvertsOutside.priority+1
        }
    }

    if((Game.time%1000)%7!=0)
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
         5:{"work":2,'carry':16,'move':10},
         6:{"work":2,'carry':16,'move':10},
         7:{"work":2,'carry':16,'move':10},
         8:{"work":2,'carry':16,'move':10},
         priority : creepManage.carrierOutside.priority
      }
    }

 


   var memory = utils.getRoomMem(roomName);
   memory.sourceDangerOut = undefined

   if(Game.rooms[roomSourceName]!=undefined ){
        memory.sourceDangerOut = 
        {
            sourcesID : RoomInit.getObjectID(roomSourceName,FIND_SOURCES),
            harversts : [("ho"+roomSourceName)],
            harverstsNum : 0,//RoomInit.getObjectID(roomSourceName,FIND_SOURCES).length*0,
            carriers : [("co"+roomSourceName)],
            carriersNum : RoomInit.getObjectID(roomSourceName,FIND_SOURCES).length*0,
            drones : [("dr"+roomSourceName)],
            dronesNum : 1//RoomInit.getObjectID(roomSourceName,FIND_SOURCES).length*0
        }
   }
   else
   {
      memory.sourceDangerOut = 
      {
         sourcesID : undefined,
         harversts : [("ho"+roomSourceName)],
         carriers : [("co"+roomSourceName)],
         drones : [("dr"+roomSourceName)],
         harverstsNum : 0,
         carriersNum : 0,
         dronesNum : 1
      }
   }

   var runDefend = function(creep,i)
   {
        console.log('beg')
        if(Game.rooms[roomSourceName]==undefined){      
            utils.moveOverRoomsEX(creep.room.name,roomSourceName,creep)
            console.log('moveTo undefind room')
            return;
        }
        if(creep.room.name != roomSourceName)
        {
            utils.moveOverRoomsEX(creep.room.name,roomSourceName,creep)
            console.log('moveTo defind room')
            return;
        }
        else
        {
            console.log("defend ")
            defend(creep,i)
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
            utils.moveOverRoomsEX(creep.room.name,roomSourceName,creep)
            return;
        }

        var sourceID = ""
        if(!creep.memory.sourceId){
            sourceID = memory.sourceDangerOut.sourcesID[i]
            creep.memory.sourceId = sourceID
        }
        else{
            sourceID = creep.memory.sourceId
        }
        var source = Game.getObjectById(sourceID);
        // 找到指定序号的能量矿
        const targetSource = source;

        // 寻找距离该能量矿最近的敌方 Creep
        const closestHostile = targetSource.pos.findInRange(FIND_HOSTILE_CREEPS,5);
        if(closestHostile != null){
            console.log("closestHostile there",closestHostile.name,typeof(closestHostile))
            return;
            retreatFromEnemy(creep, closestHostile);
            return;
        }
        var container = source.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: function(object) {
                return (object.structureType == STRUCTURE_CONTAINER && 
                            object.pos.inRangeTo(source,1)
                    );
            }
        });

      
        if(creep.room.name != roomSourceName)
        {
            utils.moveOverRoomsEX(creep.room.name,roomSourceName,creep)
            return;
        }

      

      var result = creep.harvest(Game.getObjectById(sourceID))

      if(true){
         if(container != null){
            creep.moveTo(container)
         }
         else{
            creep.moveTo(source)
         }
      }


      if(creep.store[RESOURCE_ENERGY]>40)
      {
      
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

      if(!Game.flags["LinkOut"+roomSourceName+roomName])Game.rooms[roomName].createFlag(25, 25, "LinkOut1"+roomName);
      var flag = Game.flags["LinkOut"+roomSourceName+roomName]
      
      
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
      
      if(creep.memory.full)
      {


         if(creep.room.name == roomName)
         {
            var res = -1;
            if(roomSourceName == "E53S53" || roomSourceName == "W13N7"|| roomSourceName == "W12N8"|| roomSourceName == "W12N7"||  roomSourceName == "W13N3" ||  roomSourceName == "W14N9")
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
            if(true){
               var repair_target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                  filter: object => object.hits < object.hitsMax
               
               });
               if(repair_target)
                  creep.repair(repair_target)
            }
            utils.moveOverRoomsEX(creep.room.name,roomName,creep)
         }
         if(true && creep.getActiveBodyparts(WORK)!=0)
         {
            var build_target = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES)
            if(build_target )
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
         if(creep.room.name != roomSourceName)
         {
            if(creep.room.name == "E54S53")
            {
               creep.moveTo(Game.flags.test)
            }
            else
               utils.moveOverRoomsEX(creep.room.name,roomSourceName,creep)
         }
         else
         {

            var sourceID = memory.sourceDangerOut.sourcesID[i%2]
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
    if(level == 5)  
    {
        memory.sourceDangerOut.dronesNum = 3;
    }    
    for(var i = 0;i<memory.sourceDangerOut.dronesNum;i++){
        if(Game.creeps[(memory.sourceDangerOut.drones[0]+i)+"Day"] != undefined)
        {
            var creep = Game.creeps[(memory.sourceDangerOut.drones[0]+i)+"Day"]
            if(level == 5)  
                runDefend(creep,0)
            else
                runDefend(creep,i)
        }
        if(Game.creeps[(memory.sourceDangerOut.drones[0]+i)+"Night"] != undefined)
        {
            var creep = Game.creeps[(memory.sourceDangerOut.drones[0]+i)+"Night"]
            if(level == 5)  
                runDefend(creep,0)
            else
                runDefend(creep,i)
        }

        if(true)
        {
            addSpawn(
                roomName,
                creepBodys.drones[level],
                (memory.sourceDangerOut.drones[0]+i),
                creepBodys.drones.priority)
        }
    }
   //孵化矿工
   
   for(var i = 0;i<memory.sourceDangerOut.harverstsNum;i++){
      if(Game.creeps[(memory.sourceDangerOut.harversts[0]+i)+"Day"] != undefined)
      {
         var creep = Game.creeps[(memory.sourceDangerOut.harversts[0]+i)+"Day"]
         harvest(creep,i)
      }
      if(Game.creeps[(memory.sourceDangerOut.harversts[0]+i)+"Night"] != undefined)
      {
         var creep = Game.creeps[(memory.sourceDangerOut.harversts[0]+i)+"Night"]
         harvest(creep,i)
      }
      if(true)
         addSpawn(roomName,
            creepBodys.harvests[level],
            (memory.sourceDangerOut.harversts[0]+i),
            creepBodys.harvests.priority)
      
   }
    //孵化搬运工


    for(var i = 0;i<memory.sourceDangerOut.harverstsNum;i++){
        if(memory.sourceDangerOut.harverstsNum == 1 && i==1)
            i++;
        if(Game.creeps[(memory.sourceDangerOut.carriers[0]+i)+"Day"] != undefined)
        {
            var creep = Game.creeps[(memory.sourceDangerOut.carriers[0]+i)+"Day"]
            store(creep,i)
        }
        if(Game.creeps[(memory.sourceDangerOut.carriers[0]+i)+"Night"] != undefined)
        {
            var creep = Game.creeps[(memory.sourceDangerOut.carriers[0]+i)+"Night"]
            store(creep,i)
        }

        if(true)
        {
            addSpawn(
                roomName,
                creepBodys.carrier[level],
                (memory.sourceDangerOut.carriers[0]+i),
                creepBodys.carrier.priority)
        }
    }

  }
}


module.exports = runOutSource

function retreatFromEnemy(creep, hostile) {
    // 计算远离敌人的方向
    const path = PathFinder.search(creep.pos, { pos: hostile.pos, range: 5 }, {
        flee: true,
        roomCallback: function(roomName) {
            let room = Game.rooms[roomName];
            if (!room) return;
            let costs = new PathFinder.CostMatrix;

            //room.find(FIND_STRUCTURES).forEach(function(struct) {
            //    if (struct.structureType === STRUCTURE_ROAD) {
                    // 相对于平原，道路的移动成本更低
            //        costs.set(struct.pos.x, struct.pos.y, 1);
            //    } else if (struct.structureType !== STRUCTURE_CONTAINER &&
            //               (struct.structureType !== STRUCTURE_RAMPART ||
            //                !struct.my)) {
            //        // 不能走过非自己的 rampart 和 container
            //        costs.set(struct.pos.x, struct.pos.y, 0xff);
            //    }
            //  });

            return costs;
        }
    });

    // 移动到计算出的路径上的第一个位置
    if (path.path.length > 0) {
        creep.moveByPath(path.path);
    } else {
        // 如果没有找到路径，尝试随机移动
        creep.move(Math.ceil(Math.random() * 8));
    }
}


function defend(creep, i) {
    
    // 获取房间中的所有能量矿
    const sources = creep.room.find(FIND_SOURCES);

    // 确保提供的索引 i 在 sources 数组的长度范围内
    if (i >= sources.length) {
        console.log('提供的索引超出能量矿数量范围');
        return;
    }

    // 找到指定序号的能量矿
    const targetSource = sources[i];

    // 寻找距离该能量矿最近的敌方 Creep
    const closestHostile = targetSource.pos.findClosestByRange(FIND_HOSTILE_CREEPS);

    console.log("closestHostile",closestHostile)
    if (closestHostile) {
        // 计算与敌方 Creep 的距离
        const rangeToHostile = creep.pos.getRangeTo(closestHostile);

        // 警戒值设定
        const alertHitpoints = creep.hitsMax - 400; // 例如，生命值低于 50% 时

        // 如果血量低于警戒值，保持距离并治疗
        if (creep.hits < alertHitpoints) {
            creep.memory.danger = true;
            if (rangeToHostile < 4) {
                // 尽量保持距离在4格以上
                retreatFromEnemy(creep, closestHostile);
            }
            creep.heal(creep);
        } else {
            // 生命值安全，进入战斗位置
            if (!creep.memory.danger) creep.memory.danger = true;
            if (creep.hits == creep.hitsMax) creep.memory.danger = false;
            if (rangeToHostile > 3 && ! creep.memory.danger) {
                // 移动到距离敌人3格远的位置
                creep.moveTo(closestHostile);
            } else if (rangeToHostile === 3) {
                // 当距离是3时进行攻击
                creep.rangedAttack(closestHostile);
            }
            creep.heal(creep);

        }
    } else {
        // 没有找到敌人时的行为，例如返回一个安全的位置
        creep.moveTo(creep.room.controller);
        creep.heal(creep);
    }
}
