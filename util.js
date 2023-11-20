const logger = require('mylog');

var utils = 
{
    getRoomMem : function(roomName)
    {
        return Game.rooms[roomName].memory
    },
    
    getRoomLevel : function(roomName)
    {
      var energyCapacityAvailable = Game.rooms[roomName].energyCapacityAvailable;
      var rcl = Game.rooms[roomName].controller.level

      var level = (energyCapacityAvailable>=12900)?(8):
                  (energyCapacityAvailable>=5000)?(7):
                  (energyCapacityAvailable>=2300)?(6):
                  (energyCapacityAvailable>=1800)?(5):
                  (energyCapacityAvailable>=1300)?(4):
                  (energyCapacityAvailable>=800)?(3):
                  (energyCapacityAvailable>=550)?(2):
                  (energyCapacityAvailable>=300)?(1):(0)
      if(rcl == 1)level = 0;
      return level;
    },

    moveOverRooms : function(begin,end,creep)
    {
        var flag = begin+'-'+end;
        if(Game.flags[flag])
          creep.moveTo(Game.flags[flag])
        else{
          const exitDir = creep.room.findExitTo(end);
          const exit = creep.pos.findClosestByRange(exitDir);
          creep.moveTo(exit);
    
        }
    },
    //return :
    //-2 Not suitable exitPos with road
    //-1 creep has reach endRoom
    moveOverRoomsEX : function (beginRoomName, endRoomName, creep) {
      
      if(!Memory.roomExits)Memory.roomExits = {}
      // 检查或计算出口位置
      const exitKey = `${beginRoomName}-${endRoomName}`;
      let exitPos = Memory.roomExits[exitKey];
  
      if (!exitPos) {
          // 在内存中没有找到出口，需要计算
          console.log("在内存中没有找到出口，需要计算",exitKey)
          exitPos = this.findExitWithRoad(beginRoomName, endRoomName);
          if (exitPos) {
              // 存储出口位置到内存
              Memory.roomExits[exitKey] = exitPos;
          } else {
              // 没有找到合适的出口
              return -2;
          }
      }
      
      // 判断Creep是否已经在目标房间
      if (creep.room.name === endRoomName) {
          return;
      } else {
          this.railwayMove(creep, exitPos, 0);
      }
    },
  
    findExitWithRoad : function (beginRoomName, endRoomName) {
      const room = Game.rooms[beginRoomName];
      const route = Game.map.findRoute(beginRoomName, endRoomName);
      let closestExit = null;
      if (route.length > 0) {
          const exitDir = route[0].exit;
          const exitPoses = room.find(exitDir);
          

          let minDistance = Number.MAX_SAFE_INTEGER;
  
          // 遍历出口位置
          for (const exitPos of exitPoses) {
            // 查找出口周围的道路
            var roads = exitPos.findInRange(FIND_STRUCTURES, 1, {
                filter: { structureType: STRUCTURE_ROAD }
            });

            // 如果找到道路，更新最近的出口
            if (roads.length > 0 && (roads[0].pos.x == exitPos.x || roads[0].pos.y == exitPos.y )) {
              var road = 0;
              for(var i = 0;i < roads.length;i++)
              {
                if((roads[i].pos.x == exitPos.x || roads[i].pos.y == exitPos.y ))
                {
                  var roadsnear = roads[i].pos.findInRange(FIND_STRUCTURES, 1, {
                    filter: { structureType: STRUCTURE_ROAD }
                  })
                  var roadconstruction = roads[i].pos.findInRange(FIND_CONSTRUCTION_SITES, 1, {
                    filter: { structureType: STRUCTURE_ROAD }
                  })
                  console.log("exitPos",exitPos,roadsnear.length + roadconstruction.length)
                  if((roadsnear.length + roadconstruction.length) == 1)
                    return exitPos;
                }
              }

            }
            roads = exitPos.findInRange(FIND_CONSTRUCTION_SITES, 1, {
              filter: { structureType: STRUCTURE_ROAD }
            });

            // 如果找到道路，更新最近的出口
            if (roads.length > 0 && (roads[0].pos.x == exitPos.x || roads[0].pos.y == exitPos.y )) {
              var road = 0;
              for(var i = 0;i < roads.length;i++)
              {
                if((roads[i].pos.x == exitPos.x || roads[i].pos.y == exitPos.y ))
                {
                  var roadsnear = roads[i].pos.findInRange(FIND_STRUCTURES, 1, {
                    filter: { structureType: STRUCTURE_ROAD }
                  })
                  var roadconstruction = roads[i].pos.findInRange(FIND_CONSTRUCTION_SITES, 1, {
                    filter: { structureType: STRUCTURE_ROAD }
                  })
                  if((roadsnear.length + roadconstruction.length) == 1)
                  console.log("exitPos2",exitPos,roadsnear.length + roadconstruction.length)
                    return exitPos;
                }
              }

            }
          }
          console.log("closestExit",closestExit)
          return closestExit;
      }
  
      return null; // 没有找到合适的出口
    },
    createRoadBetween : function(pos1, pos2) {
      const path = PathFinder.search(pos1, { pos: pos2, range: 1 }, {
          // 忽略道路成本
          plainCost: 2,
          swampCost: 2,
  
          roomCallback: function(roomName) {
              let room = Game.rooms[roomName];
              if (!room) return;
              let costs = new PathFinder.CostMatrix;
  
              room.find(FIND_STRUCTURES).forEach(function(struct) {
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
              room.find(FIND_CONSTRUCTION_SITES).forEach(function(struct) {
                if (struct.structureType === STRUCTURE_ROAD) {
                    // 已存在的道路成本较低
                    costs.set(struct.pos.x, struct.pos.y, 1);
                }
            });
  
              return costs;
          }
        });
  
      for (let i = 0; i < path.path.length; i++) {
          let pos = path.path[i];
          Game.rooms[pos.roomName].createConstructionSite(pos, STRUCTURE_ROAD);
      }
      return path;
    },
  
    railwayMove: function (creep, target ,i) {

        if(creep.spawning)return
        //console.log("target",target.x,target.y,target)
        if(target.pos)
          target = target.pos
        var exitPosition = new RoomPosition(target.x,target.y,creep.room.name)
        target = exitPosition;
        
        //console.log("targetPos",target.x,target.y,target)

        const roadPosKey = `${creep.pos.x},${creep.pos.y}`;
        const targetPosKey = `${target.x},${target.y}`;
        //console.log("targetPosKey",targetPosKey,"target",target.x,target.y,creep.name,creep.memory.cachedPath)
        // 检查 Creep 当前位置是否有道路
        const road = creep.pos.lookFor(LOOK_STRUCTURES,{filter:(s)=>s.structureType == "road"})
        const roadc = creep.pos.lookFor(LOOK_CONSTRUCTION_SITES, {filter:(s)=>s.structureType == "road"})
        const hasRoad = ((road && road.length && road.length > 0) || (roadc && roadc.length && roadc.length > 0))



        // 1. Creep 在 road 上且内存中有预选缓存路径
        if (creep.memory.cachedPath) {
           var result =  creep.moveByPath(creep.memory.cachedPath);
            if(result != OK)
            {
              delete creep.memory.cachedPath;
            }
        }
        // 2. Creep 不在 road 上
        else if (!hasRoad) {
            creep.moveTo(target, { visualizePathStyle: { stroke: '#ffffff' } });
        }
        // 3. Creep 在 road 上但内存中没有缓存路径
        else {
            // 检查当前位置是否有缓存路径
            if (Memory.rooms[creep.room.name] && Memory.rooms[creep.room.name].roads && Memory.rooms[creep.room.name].roads[roadPosKey] && Memory.rooms[creep.room.name].roads[roadPosKey][targetPosKey]) {
                // 读取缓存路径并行走
                const cachedPath = Memory.rooms[creep.room.name].roads[roadPosKey][targetPosKey];
                creep.memory.cachedPath = cachedPath;
                creep.moveByPath(cachedPath);
            } else {
                // 没有缓存路径，重新寻路并缓存路径
                const path = Room.serializePath(creep.room.findPath(creep.pos, target,{
                  costCallback: function(roomName, costMatrix) {

                    // 获取房间内所有己方 Creep
                    const roomCreeps = creep.room.find(FIND_MY_CREEPS);
            
                    // 遍历所有 Creep 并更新 costMatrix
                    for (const thecreep of roomCreeps) {
                        const range = creep.pos.getRangeTo(thecreep);
                        if (range <= 5) {
                            // 如果 Creep 在 5 格以内，设置成本为 255
                            costMatrix.set(thecreep.pos.x, thecreep.pos.y, 255);
                        } else {
                            // 如果 Creep 在 5 格以外，设置成本为 0
                            costMatrix.set(thecreep.pos.x, thecreep.pos.y, 0);
                        }
                    }
                    creep.room.find(FIND_CONSTRUCTION_SITES).forEach(function(struct) {
                      if (struct.structureType === STRUCTURE_ROAD) {
                          // 已存在的道路成本较低
                          costMatrix.set(struct.pos.x, struct.pos.y, 1);
                      }
                    });
                
                }
                }));
                //console.log("creep.pos",creep.pos,"target",typeof(target),"path",path)
                creep.memory.cachedPath = path;
                
                creep.moveByPath(path)
                // 存储路径到房间内存
                if (!Memory.rooms[creep.room.name])Memory.rooms[creep.room.name] = []
                if (!Memory.rooms[creep.room.name].roads) {
                    Memory.rooms[creep.room.name] = { roads: {} };
                }
                Memory.rooms[creep.room.name].roads[roadPosKey] = {targetPosKey: path};
            }
        }

        // 确定何时重置 Creep 缓存的路径字符串
        if (i != 0 && creep.pos.inRangeTo(target,i)) {
            delete creep.memory.cachedPath;
        }
        this.managePath(creep,target)
    },

    managePath : function(creep,target)
    {
      const roadPosKey = `${creep.pos.x},${creep.pos.y}`;
      const targetPosKey = `${target.x},${target.y}`;
    // 在 Creep 的逻辑中
    if (!creep.memory.lastPos) {
      creep.memory.lastPos = { x: creep.pos.x, y: creep.pos.y, stuckCount: 0 };
    } else {
      // 检查 Creep 是否移动
      if (creep.memory.lastPos.x === creep.pos.x && creep.memory.lastPos.y === creep.pos.y) {
          // Creep 没有移动，增加 stuck 计数
          creep.memory.lastPos.stuckCount++;
          // 连续两个 tick 没有移动，则清除缓存路径
          if (creep.memory.lastPos.stuckCount >= 10) {
              delete creep.memory.cachedPath;
              if(Memory.rooms[creep.room.name].roads[roadPosKey] && Memory.rooms[creep.room.name].roads[roadPosKey][targetPosKey])
                delete Memory.rooms[creep.room.name].roads[roadPosKey][targetPosKey];
              creep.cancelOrder("move")
              creep.moveTo(creep.room.controller)
          }
      } else {
          // Creep 移动了，重置 stuck 计数
          creep.memory.lastPos = { x: creep.pos.x, y: creep.pos.y, stuckCount: 0 };
      }
    }
    },

    recycleCreep : function(creep,roomName)
    {
        creep.say("Go die!")
        if(creep.room.name != roomName)
        {
            this.moveOverRoomsEX(creep.room.name,roomName,creep)
            return;
        }
        var spawn1 = Game.rooms[roomName].find(STRUCTURE_SPAWN)
        if(spawn1.length>0)
        {
          if(spawn.recycleCreep(creep)==ERR_NOT_IN_RANGE)
            creep.moveTo(spawn)
          return;

        }
        var spawn = Game.spawns["Spawn1"]
        if(spawn.recycleCreep(creep)==ERR_NOT_IN_RANGE)
            creep.moveTo(spawn)
    },
    logc : function(message, color = 'green') {
        const error = new Error();
        const stackLine = error.stack.split("\n")[2];
        const match = stackLine.match(/(?:\w+:\/\/)?(?:[^/]+\/)*([^:]+):\d+:\d+/);
        const fileName = match ? match[1] : "unknown file";
        
        const output = `<span style="color: ${color}">${fileName}: ${message}</span><br>`;
        //console.log(output);
    },
    withdrawEnergyFromOthers : function(creep) {
      // 查找房间中所有不属于自己的建筑，且建筑中有能量
      const targets = creep.room.find(FIND_STRUCTURES, {
          filter: (structure) => {
              return structure.structureType === STRUCTURE_CONTAINER ||
                     structure.structureType === STRUCTURE_STORAGE   ||
                     structure.structureType === STRUCTURE_EXTENSION  &&
                     structure.store.getUsedCapacity(RESOURCE_ENERGY) > 0 &&
                     !structure.my; // 确保建筑不属于你
          }
      });
  
      // 如果找到这样的建筑，尝试从中提取能量
      if (targets.length > 0) {
          if (creep.withdraw(targets[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
              creep.moveTo(targets[0], { visualizePathStyle: { stroke: '#ffaa00' } });
          }
          return OK;
      } else {
          // 如果没有找到或没有建筑有能量，返回 -1
          return -1;
      }
  },
  getEnergyFromRuins:function(creep) {
    // 寻找房间中的废墟
    const ruins = creep.room.find(FIND_RUINS, {
        filter: (ruin) => ruin.store[RESOURCE_ENERGY] > 0 && !ruin.my
    });

    // 如果找到了废墟
    if (ruins.length > 0) {
        // 找到最近的废墟
        const closestRuin = creep.pos.findClosestByPath(ruins);

        if (closestRuin) {
            // 如果 Creep 不在废墟位置，则向废墟移动
            if (creep.pos.isNearTo(closestRuin)) {
                creep.withdraw(closestRuin, RESOURCE_ENERGY);
            } else {
                creep.moveTo(closestRuin, { visualizePathStyle: { stroke: '#ffaa00' } });
            }
        }
        return OK;  // 表示已找到废墟并执行了相应操作
    } else {
        return -1;  // 没有找到废墟
    }
  },
  getResourceFromRuinsAndStore:function(creep) {
    // 寻找房间中的废墟
    if(!creep.memory.full){
      const ruins = creep.room.find(FIND_RUINS, {
          filter: (ruin) => ruin.store.getUsedCapacity() > 0 && !ruin.my
      });

      // 如果找到了废墟
      if (ruins.length > 0) {
          // 找到最近的废墟
          const closestRuin = creep.pos.findClosestByPath(ruins);

          if (closestRuin) {
            // 如果 Creep 不在废墟位置，则向废墟移动
            if (creep.pos.isNearTo(closestRuin)) {
                for(const resourceType in closestRuin.store) {
                  if(creep.withdraw(target, resourceType) === ERR_NOT_IN_RANGE) {
                      creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                  }
              }
            } else {
                creep.moveTo(closestRuin, { visualizePathStyle: { stroke: '#ffaa00' } });
            }
          }
          return OK;  // 表示已找到废墟并执行了相应操作
      } else {
          return -1;  // 没有找到废墟
      }
    }
    if(creep.memory.full)
    {
      if(creep.store.getUsedCapacity()!=0)
      {
        var target = creep.room.storage;
        if(target) {
            for(const resourceType in creep.store) {
                if(creep.transfer(target, resourceType) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
        }
      }
    }
  },
  countAvailableSpacesAroundSource: function(sourceID) {
    let source = Game.getObjectById(sourceID) 
    
    if(!source)
      return 0;
    if(!Memory.sources)
      Memory.sources = {}
    if(!Memory.sources[sourceID])
      Memory.sources[sourceID] = {}
    if(Memory.sources[sourceID].space)
      return Memory.sources[sourceID].space;
    let spaces = 0;
    const terrain = Game.map.getRoomTerrain(source.room.name);
    
    // 检查矿周围的所有位置
    for (let x = source.pos.x - 1; x <= source.pos.x + 1; x++) {
        for (let y = source.pos.y - 1; y <= source.pos.y + 1; y++) {
            // 排除矿自身的位置
            
            if (x === source.pos.x && y === source.pos.y) continue;

            // 检查位置是否可以通行（不是墙）

            if (terrain.get(x, y) !== TERRAIN_MASK_WALL) {
                spaces++;
            }
        }
    }
    Memory.sources[sourceID].space = spaces;
    return spaces;
  },
  isHighwayRoom : function(roomName) {
    const coords = roomName.match(/\d+/g).map(Number);
    return coords[0] % 10 === 0 || coords[1] % 10 === 0;
  },
  isCenterRoom : function(roomName) {
    const coords = roomName.match(/\d+/g).map(Number);
    return (coords[0] % 10 >= 4)&&(coords[0] % 10 <= 6) && (coords[1] % 10 >= 4)&&(coords[1] % 10 <= 6);
  },

  findMiningRooms : function(currentRoomName, _4or_8 = true) {
    if(!Memory.outMiningRooms) Memory.outMiningRooms = {}
    if(!Memory.outMiningRooms[currentRoomName]) Memory.outMiningRooms[currentRoomName] = []
    else return Memory.outMiningRooms[currentRoomName]
    
    if(_4or_8)
      var directions = ['N', 'E', 'S', 'W'];
    else
      var directions = ['N', 'E', 'S', 'W', 'EN', 'ES', 'WN', 'WS'];
    
      let roomsToCheck = [];

    const coords = currentRoomName.match(/([NESW])(\d+)([NESW])(\d+)/);
    const xDir = coords[1];
    const xVal = parseInt(coords[2], 10);
    const yDir = coords[3];
    const yVal = parseInt(coords[4], 10);

    directions.forEach(dir => {
        let roomName;
        switch (dir) {
            case 'N': roomName = xDir + xVal + yDir + (yVal - 1); break;
            case 'E': roomName = xDir + (xVal + 1) + yDir + yVal; break;
            case 'S': roomName = xDir + xVal + yDir + (yVal + 1); break;
            case 'W': roomName = xDir + (xVal - 1) + yDir + yVal; break;

            case 'EN': roomName = xDir + (xVal + 1) + yDir + (yVal - 1); break;
            case 'ES': roomName = xDir + (xVal + 1) + yDir + (yVal + 1); break;
            case 'WN': roomName = xDir + (xVal - 1) + yDir + (yVal + 1); break;
            case 'WS': roomName = xDir + (xVal - 1) + yDir + (yVal - 1); break;
        }

        if (!this.isHighwayRoom(roomName) && !(this.isCenterRoom(roomName))) {
          var route = Game.map.findRoute(currentRoomName, roomName);
          if (route != -2 && route.length <= 2) {
            roomsToCheck.push(roomName);
          }
        }
    });
    Memory.outMiningRooms[currentRoomName] = roomsToCheck;
    return roomsToCheck;
  },
  calculateCarrierBodys : function(roomName, sourceID)
  {
    let source = Game.getObjectById(sourceID) 
    if(!source)
    return 0;
    if(!Memory.sources)
      Memory.sources = {}
    if(!Memory.sources[sourceID])
      Memory.sources[sourceID] = {}
    if(Memory.sources[sourceID].bodysCarrier)
      return Memory.sources[sourceID].bodysCarrier;

    const spawn = Game.getObjectById(Memory.rooms[roomName].buildings.Spawns[0])
    const path = PathFinder.search(spawn.pos, { pos: source.pos, range: 1 });
    const distanceToSource = path.path.length * 2 + 1;
  
    var carryCount = (distanceToSource + 5 - distanceToSource % 5)/5;
    Memory.sources[sourceID].bodysCarrier = carryCount

    return carryCount
  },
  removeAllRoadConstructionSites : function(roomName) {
    const room = Game.rooms[roomName];
    if (!room) {
        console.log('房间未找到:', roomName);
        return;
    }

    const constructionSites = room.find(FIND_CONSTRUCTION_SITES);

    constructionSites.forEach(site => {
        if (site.structureType === STRUCTURE_ROAD) {
            site.remove();
        }
    });
  },




  

        
}


//W15N9  (0 ,20)  W14N9  (0 ,41)  W13N9  (49,41)  W12N9
//(40,49)        (xx,xx)         (15,0 )         (xx,xx)
//W15N8  (0 ,23)  W14N8  (0 ,17)  W13N8  (49,44)  W12N8
//(40,49)        (xx,xx)         (42,49)         (5 ,49)
//W15N7  (0 ,15)  W14N7  (0 ,6 )  W13N7  (xx,xx)  W12N7



function destroyAllConstructionSites(creep) {
  // 查找最近的非己方建筑工地
  const closestEnemySite = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES, {
    filter: (site) => !site.my
  });


  if (closestEnemySite && !closestEnemySite.my) {
      creep.moveTo(closestEnemySite);
      // 处理一个建筑工地后，跳出循环，避免多个creeps聚集在同一个工地
      
  }
}

module.exports  = utils

