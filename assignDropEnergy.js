// energyManager.js
const DropEnergyManager = {
    // 初始化或清理内存
    initMemory: function(roomName) {
      if (!Memory.energyTargets) {
        Memory.energyTargets = {};
      }
      if (!Memory.energyTargets[roomName]) {
        Memory.energyTargets[roomName] = {};
      }
      
      for (let name in Memory.energyTargets[roomName]) {
        if (!Game.creeps[name] || !Game.getObjectById(Memory.energyTargets[roomName][name])) {
          delete Memory.energyTargets[roomName][name];
        }
      }
    },
  
    // 分配能量目标
    assignTarget: function(creep, MinNum = 0) {
      const targets = creep.room.find(FIND_DROPPED_RESOURCES, {
        filter: resource => resource.resourceType === RESOURCE_ENERGY
      });
  
      console.log(creep.name, MinNum)
      // 过滤已分配的目标
      const unassignedTargets = targets.filter(
        target => !Object.values(Memory.energyTargets[creep.room.name]).includes(target.id) && 
        target.amount>MinNum);
  
      // 如果没有未分配目标，返回 null
      if (!unassignedTargets.length) {
        return null;
      }
  
      // 对未分配目标进行排序
      unassignedTargets.sort((a, b) => b.amount - a.amount);
  
      // 选择数量最多的目标
      const chosenTarget = unassignedTargets[0];
      Memory.energyTargets[creep.room.name][creep.name] = chosenTarget.id;
      return chosenTarget;
    },
  
    // 执行拾取动作
    pickupEnergy: function(creep, MinNum = 0) {
      
      creep.say("pick!")

      this.initMemory(creep.room.name);
  
      let target = Game.getObjectById(Memory.energyTargets[creep.room.name][creep.name]) ||
                   this.assignTarget(creep, MinNum);
  
      if (target) {
        var ans = creep.pickup(target)
        if (ans === ERR_NOT_IN_RANGE) {
          creep.moveTo(target);
          return 0;
        }
        if(ans === OK)
        {
          delete Memory.energyTargets[creep.room.name][creep.name];
        }
      } else {
        
        return -1;
      }
    }
  };
  
  module.exports = DropEnergyManager;

  
  