
var addSpawn = require('addSpawn')
var util = require('util')
const logger = require('mylog');

// expansionManager.js
const expansionConfig = {
    targetRoom: '', // 目标房间的名称
    claimerBody: {"claim":1, "move":1}, // 占领creep的身体部件
    builderBody: {"work":6, "carry":6, "move":6}, // 援建creep的身体部件
    claimerName: 'Claimer',
    builderName: 'Builder'
  };
  
  function manageExpansion(roomName) {
    if(roomName != "W58N27" && roomName != "W52N25")return ;
    if(expansionConfig.targetRoom == '')return;
    if (true &&((!Game.rooms[expansionConfig.targetRoom])||!Game.rooms[expansionConfig.targetRoom].controller.my)) {
        
      // 如果目标房间还没有被占领，孵化占领creep
      const claimer = Game.creeps[expansionConfig.claimerName];
      if (!claimer) {
        addSpawn(roomName, expansionConfig.claimerBody, expansionConfig.claimerName,creepManage.expansionClaimer.priority , { role: 'claimer', targetRoom: expansionConfig.targetRoom },true);
      } else {
        
        // 移动到目标房间并占领控制器
        if (claimer.room.name !== expansionConfig.targetRoom) {
          //claimer.moveTo(Game.flags["DropFlag"])
          const exitDir = claimer.room.findExitTo(expansionConfig.targetRoom);
          const exit = claimer.pos.findClosestByRange(exitDir);
          claimer.moveTo(exit);
          //moveToFlags(claimer)
        } else {
          const controller = claimer.room.controller;
          if (controller) {
            if (claimer.claimController(controller) === ERR_NOT_IN_RANGE) {
              claimer.moveTo(controller);
            }
          }
        }
      }
    } else {
      // 目标房间已被占领，孵化援建creep
      for(var i = 0; i<4; i++) //存在第二个矿
      {
        const builder = Game.creeps[expansionConfig.builderName+i];
        
        if (!builder && true) {
            addSpawn(roomName, expansionConfig.builderBody, expansionConfig.builderName+i,creepManage.expansionBuilder.priority, { role: 'builder', targetRoom: expansionConfig.targetRoom },true);
        } else {
          
          if(!builder )
            continue 
          
          // 移动到目标房间并进行建设和修理
          if (builder.room.name !== expansionConfig.targetRoom) {
            //builderRoutine(builder,i)
            //builder.moveTo(Game.flags["DropFlag"])
            //moveToFlags(builder)
            
            const exitDir = builder.room.findExitTo(expansionConfig.targetRoom);
            const exit = builder.pos.findClosestByRange(exitDir);
            builder.moveTo(exit);
          } else {
            if(true)
              builderRoutine(builder,i)
            else
              upgrade(builder)
        // 在这里添加建设和修理逻辑
          }
        }
      }
      
      if(Game.spawns["Spawn2"]!= undefined)
      {
        KeepLife(Game.spawns["Spawn2"])
      }
    }
    {
      // 目标房间已被占领，孵化援建creep

      for(var i = 0; i<1; i++) //存在第二个矿
      {
        const builder = Game.creeps[expansionConfig.builderName+i+"0"];
        if (!builder && false) {
            addSpawn(roomName, expansionConfig.builderBody, expansionConfig.builderName+i+"0",creepManage.expansionBuilder.priority, { role: 'builder', targetRoom: expansionConfig.targetRoom },true);
        } else {
          if(!builder )
            continue 
          if(!builder.memory.building)builder.memory.building = false;
          if (builder.memory.building && builder.store[RESOURCE_ENERGY] === 0) {
            builder.memory.building = false;
          }
          if (!builder.memory.building && builder.store.getFreeCapacity() === 0) {
            builder.memory.building = true;
          }
          if (builder.memory.building) {
            // 移动到目标房间并进行建设和修理
            if (builder.room.name !== "E54S53") {
              builder.moveTo(Game.flags["DropFlag2"])

            } else {
              if(true)
                buildAndUpgrade(builder)

          // 在这里添加建设和修理逻辑
            }
          }
          else{
            
            builder.moveTo(Game.flags["DropFlag2"])
            //if(builder.withdraw(Game.rooms["E56S52"].storage,RESOURCE_ENERGY)==ERR_NOT_IN_RANGE)
            //  builder.moveTo(Game.rooms["E56S52"].storage)
          }
        }
      }
      if(Game.spawns["Spawn2"]!= undefined)
      {
        KeepLife(Game.spawns["Spawn2"])
      }
    }
  }
  
  module.exports = {
    manageExpansion
  };

  function builderRoutine(builder,i) {
    if(!builder.memory.building)builder.memory.building = false;
    if (builder.memory.building && builder.store[RESOURCE_ENERGY] === 0) {
      builder.memory.building = false;
    }
    if (!builder.memory.building && builder.store.getFreeCapacity() === 0) {
      builder.memory.building = true;
    }
  
    if (builder.memory.building) {
      if(Game.spawns["Spawn2"]!= undefined)
      {
        let tranTarget = findClosestEnergyDropoff(builder) 
        if(tranTarget)
        {
          const transferResult = builder.transfer(tranTarget, RESOURCE_ENERGY);
          if (transferResult === ERR_NOT_IN_RANGE) {
            builder.moveTo(tranTarget, { visualizePathStyle: {} });
          } 

          return;
        }
      }
      if(!builder.memory.recycling)
        buildAndUpgrade(builder)
    } else {
      const sources = Game.rooms[expansionConfig.targetRoom].find(FIND_SOURCES);
      if (builder.harvest(sources[i%2]) === ERR_NOT_IN_RANGE) {
        builder.moveTo(sources[i%2], { visualizePathStyle: { stroke: '#ffaa00' } });
      }
    }
  }

  function buildAndUpgrade(builder)
  {
      const targets = Game.rooms[expansionConfig.targetRoom].find(FIND_CONSTRUCTION_SITES);

      // 过滤出spawn和tower的建筑工地
      const priorityTargets = targets.filter(site => site.structureType == "spawn" );

      // 如果有spawn或者tower的建筑工地，则优先选取
      let target;
      if (priorityTargets.length > 0) {
          // 这里我们假设只选取数组中的第一个，也可以根据需要进一步排序
          target = priorityTargets[0];
      } else {
          // 如果没有spawn和tower的建筑工地，则选取其他建筑工地
          target = targets.length > 0 ? targets[0] : null;
      }
    if (target) {
      if (builder.build(target) === ERR_NOT_IN_RANGE) {
        builder.moveTo(target, { visualizePathStyle: { stroke: '#ffffff' } });
      }
    } else {
      if(false){
        const repairTargets = builder.room.find(FIND_STRUCTURES, {
          filter: object => object.hits < object.hitsMax-3000 && object.structureType != STRUCTURE_WALL
        });
        
        repairTargets.sort((a, b) => a.hits - b.hits);
      
        if (repairTargets.length > 10 && false) {
          if (builder.repair(repairTargets[0]) === ERR_NOT_IN_RANGE) {
            builder.moveTo(repairTargets[0], { visualizePathStyle: { stroke: '#ffffff' } });
          }
        }
      }
      else
      {
          if(builder.upgradeController(builder.room.controller)==ERR_NOT_IN_RANGE)
              builder.moveTo(builder.room.controller)
      }
    }
  }
  function KeepLife(spawn)
  {
      var recycling = false
      for(var i = 0; i<4; i++) //存在第二个矿
      {
        const builder = Game.creeps[expansionConfig.builderName+i];
        if(builder)
        {
          if(builder.memory.recycling && builder.memory.recycling == true)
          {
            recycling = true;
          }
          else
          {
            builder.memory.recycling = false 
          }
        }
      }
      for(var i = 0; i<4; i++) //存在第二个矿
      {
        const builder = Game.creeps[expansionConfig.builderName+i];
        if(builder)
        {
          if(builder.memory.recycling)
          {
            builder.moveTo(spawn)
            spawn.renewCreep(builder)
            if(builder.ticksToLive>1400)
              builder.memory.recycling = false;
          }
          else
          {
            if(recycling == false)
            {
              if(builder.ticksToLive<300)
              {
                recycling = true;
                builder.memory.recycling = true;
              }
            }
          }
        }
      }
  }
  
  function moveToFlags(creep) {
    // 如果creep的内存中没有设置currentFlag，则初始化为R1
    if (!creep.memory.currentFlag) {
        creep.memory.currentFlag = 'R1';
    }
    
    if(creep.ticksToLive >= 1490) {
      creep.memory.currentFlag = 'R1';
    }
  
    // 获取当前目标旗子
    let currentFlag = Game.flags[creep.memory.currentFlag];
    // 如果当前旗子存在，移向旗子
    if (currentFlag) {
        // 通过检查范围来确定creep是否已经接近旗子
        if (creep.pos.inRangeTo(currentFlag, 1)) {  // 或者你可以根据需要调整范围
            // 获取下一个旗子编号
            let nextFlagNumber = parseInt(creep.memory.currentFlag.substring(1)) + 1;
            // 设置下一个旗子的名称，假设它是 "R" 加上数字编号
            let nextFlagName = 'R' + nextFlagNumber;
  
            // 检查下一个旗子是否存在，如果存在，更新内存中的currentFlag
            if (Game.flags[nextFlagName]) {
                creep.memory.currentFlag = nextFlagName;
            } else {
                // 如果不存在下一个旗子，表示已经到达最后一个旗子，可以重置或者处理完成逻辑
                // 重置回R1或者进行其他操作
                // creep.memory.currentFlag = 'R1';  // 如果你想让它循环路径
                // 或者清除currentFlag
                // delete creep.memory.currentFlag;  // 如果任务完成
            }
        } else {
            // 向当前旗子移动
            creep.moveTo(currentFlag, { visualizePathStyle: { stroke: '#ffffff' } });
        }
    } else {
    }
  }
  
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


  function upgrade(creep){
    

    var container = Game.getObjectById("")

    creep.moveTo(Game.flags["upgrade"+expansionConfig.targetRoom])
    if(creep.store[RESOURCE_ENERGY] <= 40)
    {
      if(container != undefined){
        if(creep.withdraw(container,RESOURCE_ENERGY)==ERR_NOT_IN_RANGE)
          creep.moveTo(container)
      }

    }

    if(creep.upgradeController(creep.room.controller)==ERR_NOT_IN_RANGE)
      creep.moveTo(creep.room.controller)
  }