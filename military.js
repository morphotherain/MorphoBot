// military.js


var addSpawn = require('addSpawn')

var military = {
    /** @param {Room} room **/
    run: function(room) {
      // 每个Creep的角色名
      const roleName = 'soldier';
      const roleName2 = 'soldier2';
      // 检查是否需要孵化Creeps
      if (this.needsReinforcement(room, roleName, 4)) {
        //this.spawnCreep(room, roleName);
      }
      if (this.needsReinforcement(room, roleName2, 4)) {
        //this.spawnCreep(room, roleName2);
      }
  
      // 集合到集结点
      this.assembleCreeps(room, roleName, 'RallyPoint');
      //this.assembleCreeps(room, roleName2, 'RallyPoint2');
  
      // 更多的功能将会添加在这里...
      this.executeAttackLogic(room, roleName,'堵门')
      //this.executeAttackLogic(room, roleName2,'堵门2')
    },
    
  
    /** @param {Room} room @param {string} roleName @param {number} quantity **/
    needsReinforcement: function(room, roleName, quantity) {
      // 计算指定角色的Creep数量
      const creepsOfRole = _.filter(Game.creeps, (creep) => creep.memory.role === roleName);
      return creepsOfRole.length < quantity;
    },
  
    /** @param {Room} room @param {string} roleName **/
    spawnCreep: function(room, roleName) {
      // 这里定义Creep的身体部位
      const body = {"tough":2,"move":10,"ranged_attack":4,"heal":4};//{}
  
      addSpawn(room.name ,body, roleName + Game.time, 14, {
            memory: { role: roleName, assembling: true }
        })
    },
  
    /** @param {Room} room @param {string} roleName @param {string} rallyFlag **/
    assembleCreeps: function(room, roleName, rallyFlagName) {
        const rallyPoint = Game.flags[rallyFlagName];

      if (!rallyPoint) {
        return;
      }
      // 找到所有Creep
      const Creeps = _.filter(Game.creeps, (creep) =>
        creep.memory.role === roleName
      );
      
      this.assembleInSquare(Creeps,rallyPoint)

    },
    // 集结Creeps到指定点并形成正方形阵型
    assembleInSquare:function(assemblingCreeps, rallyPoint) {
        // 检查人数
        if (assemblingCreeps.length !== 4  || (!assemblingCreeps.every(creep => creep.memory.ready === true)))
        {
            this.scatterMove(assemblingCreeps, rallyPoint);
            // 设置所有creep的assembled状态为false
            
            assemblingCreeps.forEach(creep => creep.memory.assembled = false);
            return;
        }
        
        if (this.isInSquareFormation(assemblingCreeps)) {
            // 如果已经是正方形阵型，更新状态为集结完毕
            for (const creep of assemblingCreeps) {
                creep.memory.assembled = true; 
            }
            return;
        }
        else{
            
            if(this.checkStopSquare(assemblingCreeps) )
            {
                for (const creep of assemblingCreeps) {
                    creep.memory.assembled = true; 
                }
            }
            else
            {
                for (const creep of assemblingCreeps) {
                    creep.memory.assembled = false; 
                }
            }
            if(assemblingCreeps.every(creep => creep.memory.ready === true) && !this.checkStopSquare(assemblingCreeps) )
            {
                for (const creep of assemblingCreeps) {
                    creep.memory.assembled = false; 
                }
                var Leader =  this.getSquadLeader(assemblingCreeps)
                Leader.say("集结")
               
                this.formSquareFormation(assemblingCreeps,Leader)
                // 如果不是正方形阵型，将所有Creep标记为未集结
            }
            else{
            }

        }
    },
    // 判断小队是否已经是正方形阵型
    isInSquareFormation: function(creeps) {
        if (creeps.length !== 4) return false; // 必须有四个Creep
      
        // 生成所有creeps之间的距离组合
        let distances = [];
        for (let i = 0; i < creeps.length; i++) {
          for (let j = i + 1; j < creeps.length; j++) {
            const distance = creeps[i].pos.getRangeTo(creeps[j]);
            distances.push(distance);
          }
        }
      
        // 计数距离为1和√2的次数
        const ones = distances.filter(d => d === 1).length;
      
        // 正方形的条件是有4个距离为1的边和2个距离为√2的对角线
        return ones === 6;
    },
    formSquareFormation: function(creeps, rallyPoint) {
        if (creeps.length < 4) {
          // 如果creep少于4个，无法形成正方形阵型
          return false;
        }
      
        // 确定正方形的位置
        const topLeft = rallyPoint.pos;
        const topRight = new RoomPosition(rallyPoint.pos.x + 1, rallyPoint.pos.y, rallyPoint.room.name);
        const bottomLeft = new RoomPosition(rallyPoint.pos.x, rallyPoint.pos.y + 1, rallyPoint.room.name);
        const bottomRight = new RoomPosition(rallyPoint.pos.x + 1, rallyPoint.pos.y + 1, rallyPoint.room.name);
      
        // 将每个creep指派到最近的位置
        const positions = [topLeft, topRight, bottomLeft, bottomRight];
        for (const position of positions) {
          // 找到距离当前位置最近的creep
          const closestCreep = creeps.reduce((closest, creep) => {
            if (!closest) return creep;
            if (creep.pos.getRangeTo(position) < closest.pos.getRangeTo(position)) return creep;
            return closest;
          }, null);
      
          if (closestCreep) {
            // 移动到目标位置
            closestCreep.moveTo(position);
            // 从列表中移除这个creep，以便下次迭代不再考虑它
            _.remove(creeps, c => c.name === closestCreep.name);
          }
        }
      
        return true;
    },
    // 新增
    executeAttackLogic: function(room, roleName, flagName) {
        // 根据房间和小队名称获取小队成员
        let squadMembers = this.getSquadMembers(room, roleName);
        
        // 如果小队成员数量不足，直接返回
        if (squadMembers.length < 4) return;
        if (squadMembers[0].memory.assembled == false) return;
        // 检查敌人并执行战斗逻辑
        let hostiles = squadMembers[0].room.find(FIND_HOSTILE_CREEPS,{filter:(creep)=>creep.room.name != "W15N8"});
        if (hostiles.length > 0) {
        // 保持距离并攻击
            this.maintainDistanceAndAttack(squadMembers, hostiles);
        // 修复逻辑
        } else {
            
            // 没有敌人，移动到Flag位置
            this.moveToFlag(squadMembers, flagName);
        }
        
        this.repairMostDamagedCreep(squadMembers);
        // 检查并攻击范围内的敌方建筑
        //this.attackNearbyHostiles(squadMembers);
        
    },
    // 检查并攻击范围内的敌方建筑
    attackNearbyHostileStructures: function(squadMembers) {
        for (const creep of squadMembers) {
            // 找到范围内的敌方建筑
            const targets = creep.pos.findInRange(FIND_HOSTILE_STRUCTURES, 3); // 示例中使用3作为攻击范围
            if (targets.length > 0) {
                // 选择一个目标进行攻击
                creep.rangedAttack(targets[0]);
                return; // 如果已经找到并攻击了目标，无需继续检查其他Creeps
            }
        }
    },
    // 检查并攻击范围内的敌方单位，优先攻击Creeps
    attackNearbyHostiles: function(squadMembers) {
        for (const creep of squadMembers) {
            // 首先寻找范围内的敌方Creeps
            const hostileCreeps = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 3); // 示例中使用3作为攻击范围
            if (hostileCreeps.length > 0) {
                // 攻击敌方Creep
                creep.rangedAttack(hostileCreeps[0]);
                return; // 如果已经找到并攻击了目标，无需继续检查其他Creeps
            }

            // 如果没有敌方Creeps，寻找范围内的敌方建筑
            const hostileStructures = creep.pos.findInRange(FIND_HOSTILE_STRUCTURES, 3);
            if (hostileStructures.length > 0) {
                // 攻击敌方建筑
                creep.rangedAttack(hostileStructures[0]);
                return; // 如果已经找到并攻击了目标，无需继续检查其他Creeps
            }
        }
    },


    // 获取小队成员
    getSquadMembers: function(room, roleName) {
        return _.filter(Game.creeps, (creep) => creep.memory.role === roleName);
    },

        // 保持距离并攻击
    maintainDistanceAndAttack: function(squadMembers, hostiles) {
        let target = this.findClosestHostile(squadMembers, hostiles);

        if (!target || target.room.name == "W15N8") return; // 如果没有找到敌人，不执行任何操作

        // 进行攻击或治疗
        for (let creep of squadMembers) {
            // 如果在攻击范围内，则攻击
            creep.rangedAttack(target)
            
        }
        // 确定是否需要前进、后退或保持位置
        let moveNeeded = false;
        let rangeToTarget = squadMembers[0].pos.getRangeTo(target);

        // 如果距离太远，需要前进
        if (rangeToTarget >= 3) {
        moveNeeded = true;
        } 
        // 如果距离太近，需要后退
        else if (rangeToTarget < 2) {
        moveNeeded = true;
        target = this.getRetreatPosition(squadMembers, target);
        }

        // 如果需要移动，则使用syncMoveTo同步移动
        if (moveNeeded) {
            this.syncMoveTo(squadMembers, target);
        }

    },

    // 找到最近的敌人
    findClosestHostile: function(squadMembers, hostiles) {
        let closestHostile = null;
        let closestRange = Infinity;
        let leader = this.getSquadLeader(squadMembers)
        squadMembers.forEach(squadMember => {
        let range = squadMember.pos.findClosestByRange(hostiles);
        if (range < closestRange) {
            closestRange = range;
            closestHostile = range;
        }
        });
        closestHostile = leader.pos.findClosestByRange(FIND_HOSTILE_CREEPS)
        return closestHostile;
    },

    // 获取后退位置
    getRetreatPosition: function(squadMembers, hostile) {
        // 这里简化处理，只是后退一格
        let dx = squadMembers[0].pos.x - hostile.pos.x;
        let dy = squadMembers[0].pos.y - hostile.pos.y;
        let direction = new RoomPosition(dx, dy, squadMembers[0].room.name).getDirectionTo(hostile);
        return squadMembers[0].pos.getPositionAtDirection((direction + 4) % 8); // 反向移动一格
    },


    // 修复受损最严重的Creep
    repairMostDamagedCreep: function(squadMembers) {
        // 找出受伤最严重的Creep
        let mostDamagedCreep = _.min(squadMembers, (creep) => creep.hits / creep.hitsMax);
        if (mostDamagedCreep.hits === mostDamagedCreep.hitsMax) {
            //return; // 如果没有受伤的Creep，则不执行修复操作
        }

        // 让每个有修复能力的Creep去修复它
        _.forEach(squadMembers, (creep) => {
        if (creep.getActiveBodyparts(HEAL) > 0) {
            if (creep.pos.isNearTo(mostDamagedCreep)) {
            creep.heal(mostDamagedCreep);
            } else if (creep.pos.inRangeTo(mostDamagedCreep, 3)) {
            creep.rangedHeal(mostDamagedCreep);
            }
        }
        });
    },

    // 移动到Flag位置并保持队形
    moveToFlag: function(squadMembers, flagName) {
        let flag = Game.flags[flagName];
        if (!flag) {
            return false; // 如果找不到旗帜，返回错误
        }

        // 确保所有成员都不疲劳
        if (_.some(squadMembers, (creep) => creep.fatigue > 0)) {
            return false; // 如果任何Creep疲劳，就不移动
        }

        // 如果成员已经在旗帜位置，不需要移动
        if (_.every(squadMembers, (creep) => creep.pos.inRangeTo(flag,1))) {
            
            return true; // 成功且无需移动
        }
        this.getSquadLeader(squadMembers).say("前进！")
        this.moveTo(squadMembers, flag)

        
        return true; // 成功启动移动
    },
    maintainStopSquare: function(creeps) {
        // 每个tick递减所有creeps的stopSquare属性
        creeps.forEach(creep => {
            if (creep.memory.stopSquare && creep.memory.stopSquare > 0) {
                creep.memory.stopSquare--;
            }
        });
    },
    increaseStopSquare: function(creeps) {
        // 给所有creeps的stopSquare属性增加10
        creeps.forEach(creep => {
            if (!creep.memory.stopSquare) {
                creep.memory.stopSquare = 0;
            }
            creep.memory.stopSquare = 10;
        });
    },
    checkStopSquare: function(creeps) {
        // 检查所有creeps的stopSquare属性是否大于零
        var exist = false;
        for(const creep of creeps){  
            if( creep.memory.stopSquare >0)
                return true;
        }
        return false;
    },
            
    moveTo: function(creeps, target) {
        // 维护 stopSquare 属性
        this.maintainStopSquare(creeps);
    
        // 如果所有creeps的stopSquare属性都大于零，则执行分散移动
        if (this.checkStopSquare(creeps)) {
            // 分散移动的逻辑
            this.scatterMove(creeps, target);
        } else {
            // 否则，执行同步移动逻辑
            
            this.syncMoveTo(creeps, target);
        }
    },
    // 分散移动模式
    scatterMove: function(creeps, destination) {
        var roomName = ""
        if(destination.name == "RallyPoint2")
            roomName = "W15N8"
        if(destination.name == "RallyPoint")
            roomName = "W13N8"
        if(roomName == "")
            roomName = destination.room.name
        // 遍历每个creep，并移动到目的地
        creeps.forEach(creep => {
            // 如果creep已经在目的地，则不执行任何操作
            if (creep.pos.isEqualTo(destination)) {
                return;
            }
            // 如果creep不在目标房间，则找到并向房间出口移动
            if (creep.room.name !== roomName) {
                const route = Game.map.findRoute(creep.room, roomName);
                if (route.length > 0) {
                    const exitDir = route[0].exit;
                    const exit = creep.pos.findClosestByPath(exitDir);
                    creep.moveTo(exit);
                }
            } else {
                // 如果creep已在目标房间，直接向目标位置移动
                creep.moveTo(destination);
            }
            // 检查Creep是否到达集结点一格范围以内
            if (creep.pos.inRangeTo(destination, 1)) {
                // 到达后，将ready状态设为true
                creep.memory.ready = true;
            }
        });
    },

    syncMoveTo: function(squadMembers, target) {
        const leader =  this.getSquadLeader(squadMembers);
        
        // 确保所有squad成员的疲劳值为0
        if (_.some(squadMembers, (creep) => creep.fatigue > 0)) {
            return false;
        }
    
        // 获取队长的下一步移动方向
        const direction = this.getFormationNextStepDirection(leader, target,squadMembers);
        if (!direction) {
            return false;
        }
    
        // 首先检查所有squad成员是否可以移动到指定方向
        for (const member of squadMembers) {
            if (!this.canMoveToDirection(member, direction)) {
                this.swapCreeps(leader,member)
                return false; // 如果任何成员不能移动，则终止同步移动
            }
        }
    
        // 执行移动
        for (const member of squadMembers) {
            member.move(direction);
        }
    
        return true;
    },
    

    canMoveToDirection: function(creep, direction) {
        const dx = [0,  0,  1, 1, 1, 0, -1, -1, -1]; // x方向的偏移量
        const dy = [0, -1, -1, 0, 1, 1,  1, 0, -1]; // y方向的偏移量
        let targetX = creep.pos.x + dx[direction];
        let targetY = creep.pos.y + dy[direction];
        let targetRoomName = creep.room.name;
    
        // 确保目标位置不越界
        if (targetX < 0 || targetX > 49 || targetY < 0 || targetY > 49) {
            return false;
        }
    
        let targetPos = new RoomPosition(targetX, targetY, targetRoomName);
    
        if (targetPos.lookFor(LOOK_TERRAIN)[0] === 'wall') {
            return false; // 目标位置是墙
        }

        // 检查目标位置是否有建筑物占据
        const structures = targetPos.lookFor(LOOK_STRUCTURES);
        if (structures.length > 0) {
            // 允许在道路上移动，但其他类型的建筑物视为不可移动
            const blockingStructures = structures.filter(structure => structure.structureType !== STRUCTURE_ROAD && structure.structureType !== STRUCTURE_CONTAINER);
            if (blockingStructures.length > 0) {
                return false; // 目标位置被建筑物占据
            }
        }
        return true; // 能够移动
    },
    
    swapCreeps: function(creep1, creep2) {
        creep1.moveTo(creep2)
        creep2.moveTo(creep1)
    },

    getFormationNextStepPositions: function(squadMembers, target) {
        // 假定第一个成员是队长
        const leader = squadMembers[0];
        let nextStepPositions = [];
        leader.say("leader")
        // 获取队长到目标的路径
        const path = leader.room.findPath(leader.pos, target.pos, {
            serialize: false,
            range: 1 // 确保不会走到目标相邻的位置上
        });
    
        // 如果队长在目标房间或路径存在，则使用该路径确定下一步
        if (leader.room.name === target.room.name && path.length > 0) {
            // 计算队伍其他成员基于队长的下一步位置
            const nextStep = path[0];
            if (nextStep.x < 0 || nextStep.x > 49 || nextStep.y < 0 || nextStep.y > 49) {

                return false;
            }
            nextStepPositions.push(new RoomPosition(nextStep.x, nextStep.y, leader.room.name));
    
            // 确定每个成员的下一步位置
            for (let i = 1; i < squadMembers.length; i++) {
                const xOffset = (i % 2) * 1; // 0 or 1
                const yOffset = (i > 1) ? 1 : 0; // 0 for i=1,2 and 1 for i=3,4
                var nextX = nextStep.x + xOffset
                var nextY = nextStep.y + yOffset
                if (nextX < 0 || nextX > 49 || nextY < 0 || nextY > 49) {
                    return false;
                }
                nextStepPositions.push(new RoomPosition(nextX,nextY, leader.room.name));
            }
        } else {
            // 如果队长不在目标房间，找到到下一个房间的路径
            const route = Game.map.findRoute(leader.room, target.room.name);
            if (route.length > 0) {
                // 找到并向出口移动
                const exitDir = route[0].exit;
                const exit = leader.pos.findClosestByPath(exitDir);
                nextStepPositions.push(exit); // 队长的下一步是出口位置
    
                // 计算其他成员的下一步
                for (let i = 1; i < squadMembers.length; i++) {
                    if (exit.x < 0 || exit.x > 49 || exit.y < 0 || exit.y > 49) {

                        return false;
                    }
                    nextStepPositions.push(new RoomPosition(exit.x, exit.y, leader.room.name));
                }
            } else {
                // 如果没有找到路径，保持当前位置
                squadMembers.forEach(creep => {
                    nextStepPositions.push(creep.pos);
                });
            }
        }
    
        return nextStepPositions;
    },
    getFormationNextStepDirection: function(leader, target, creeps) {
        // 获取队长到目标的路径，忽略其他creep
        const path = leader.room.findPath(leader.pos, target.pos, {
            serialize: false,
            range: 1, // 确保不会走到目标相邻的位置上
            ignoreCreeps: false,
            costCallback: function(roomName, costMatrix) {

                // 获取房间内所有己方 Creep
                const roomCreeps = leader.room.find(FIND_MY_CREEPS);
        
                // 遍历所有 Creep 并更新 costMatrix
                for (const thecreep of roomCreeps) {
                    costMatrix.set(thecreep.pos.x, thecreep.pos.y, 0);
                }
            
            }
        });

    
        // 如果队长在目标房间且路径存在，则使用该路径确定下一步方向
        if (leader.room.name === target.pos.roomName && path.length > 0) {
            const nextStepDirection = path[0].direction;
            return nextStepDirection;
        } else {
            // 如果队长不在目标房间，找到到下一个房间的路径
            const route = Game.map.findRoute(leader.room, target.pos.roomName);
            if (route.length > 0) {
                // 找到并向出口移动
                const exitDir = route[0].exit;
                const exit = leader.pos.findClosestByPath(exitDir);
                // 如果接近出口（三格以内），启动分散模式
                if (leader.pos.inRangeTo(exit, 3)) {
                    this.increaseStopSquare(creeps);
                }
                return leader.pos.getDirectionTo(exit);
            }
        }
    
        // 如果没有有效的移动方向，则返回null
        return null;
    },
    // 选择一个队长
    chooseSquadLeader: function(creeps) {
        if (creeps.length === 0) {
            return; // 没有creep可选作队长
        }

        // 选择队长
        const leaderIndex = Math.floor(Math.random() * creeps.length);
        const leader = creeps[leaderIndex];
        leader.memory.isLeader = true; // 在内存中标记为队长
        for (let i = 0; i < creeps.length; i++) {
            if (i !== leaderIndex) {
                creeps[i].memory.isLeader = false; // 确保只有一个队长
            }
        }

        return leader;
    },

    // 获取队长
    getSquadLeader: function(creeps) {
        for (const creep of creeps) {
            if (creep.memory.isLeader) {
                return creep; // 找到队长并返回
            }
        }

        // 如果没有找到队长，选择一个新的
        return this.chooseSquadLeader(creeps);
    },
    
    // ...更多的功能将会添加在这里...
  };
  
  module.exports = military;
  