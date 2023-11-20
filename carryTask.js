var carryTask = 
{
    Tasks : [{type:"", source : "", target :"", targetAmount :0,priority:0}],
    runCarry : function(creep,spawn = false){
        var next = true;
        var spawnState = -1
        if(spawn)
            spawnState = EsaveEnergy(creep)
        if(spawnState != -1)
            return;
        next = false;
        task = this.getHighestPriorityTask(creep)
        creep.memory.task = task
        


        if(!task || task == null ){
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
            return;

        }

        var tranSource = null
        var tranTarget = null
        var tranAmount = null
    
        if (task.targetAmount < task.target.store[task.type])
        {
            tranSource = task.target
            tranTarget = task.source
            tranAmount = task.target.store[task.type] - task.targetAmount
            creep.memory.send = false
            
        }
        if (task.targetAmount > task.target.store[task.type])
        {
            tranSource = task.source
            tranTarget = task.target    
            tranAmount = task.targetAmount - task.target.store[task.type]
            creep.memory.send = true
            
        }
        if (task.targetAmount == task.target.store[task.type] ){
            if(creep.store[task.type]!=0)
            {
                if(creep.memory.send)
                {
                    tranSource = task.source 
                    tranTarget = task.target
                    tranAmount = creep.store[task.type]
                    creep.memory.send = true
                }
                else
                {
                    tranSource = task.target
                    tranTarget = task.source    
                    tranAmount = creep.store[task.type]
                    creep.memory.send = false
                }
            }

        }
        
        if(tranSource == null || tranTarget == null)
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
            return;
        }
        
        {
            if(creep.store.getUsedCapacity() > creep.store[task.type])
            {
                var target = creep.room.storage;
                if(target) {
                    for(const resourceType in creep.store) {
                        if(resourceType == task.type)
                            continue
                        if(creep.transfer(target, resourceType) === ERR_NOT_IN_RANGE) {
                            creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                        }
                    }
                }
                return;
            }
            if(!creep.memory.storeFull)
                creep.memory.storeFull = false;
            if(creep.store.getFreeCapacity()==creep.store.getCapacity())
                creep.memory.storeFull = false;
            if(creep.store.getUsedCapacity()==creep.store.getCapacity())
                creep.memory.storeFull = true;
            if(!creep.memory.storeFull)
            {
                var amount = Math.min(tranAmount, creep.store.getFreeCapacity(), tranTarget.store.getFreeCapacity(),tranSource.store[task.type] )
                var ans = creep.withdraw(tranSource,task.type, amount)
                if(ans == ERR_NOT_IN_RANGE){
                    creep.moveTo(tranSource)
                    next = false
                }
                if(ans == OK){
                    next = true;
                    creep.memory.storeFull = true;
                }

            }
            else
            {
                var ans = creep.transfer(tranTarget,task.type)
                if(ans == ERR_NOT_IN_RANGE){
                    creep.moveTo(tranTarget)
                    next = false
                }
                if(ans == OK){
                    next = true;
                    creep.memory.storeFull = false;
                }
            }

        }
        

    },
    getHighestPriorityTask: function(creep) {
        if (this.Tasks.length === 0) {
            return null; // 没有任务
        }
        var highestPriorityTask = this.Tasks[0]; // 初始假设第一个任务优先级最高
        if(highestPriorityTask.targetAmount == highestPriorityTask.target.store[highestPriorityTask.type]
            ||(highestPriorityTask.targetAmount > highestPriorityTask.target.store[highestPriorityTask.type] && (highestPriorityTask.source.store[highestPriorityTask.type] == 0 && creep.store[highestPriorityTask.type]==0))
          )
        {
            if(this.Tasks.length <= 1 )
                return null;
            else
            {
                highestPriorityTask.priority = 0;
            } 
        }

        for (var i = 1; i < this.Tasks.length; i++) {
            
            var currentTask = this.Tasks[i];

            if(currentTask.target && currentTask.source && creep){
                if(currentTask.targetAmount > currentTask.target.store[currentTask.type] && (currentTask.source.store[currentTask.type] == 0 && creep.store[currentTask.type]==0))
                {
                    continue;
                }
            }
            else
            {
                console.log(currentTask.target , currentTask.source , creep)
                continue;

            }
            if (currentTask.targetAmount != currentTask.target.store[currentTask.type] || (creep.store[currentTask.type]!=0 && !creep.memory.send)){
                var currentPriority = (Math.abs(currentTask.targetAmount-currentTask.target.store[currentTask.type])>1000)?(currentTask.priority * 10):(currentTask.priority)
                var highestPriorityTaskPriority = (Math.abs(highestPriorityTask.targetAmount-highestPriorityTask.target.store[highestPriorityTask.type])>1000)?(highestPriorityTask.priority * 10):(highestPriorityTask.priority);
           
                if (currentPriority > highestPriorityTaskPriority) {
                    highestPriorityTask = currentTask; // 找到更高优先级的任务
                }
            }
        }
        return highestPriorityTask;
    },
}

module.exports = carryTask

const STRUCTURES_TO_ENERGY_DROP = [
    STRUCTURE_EXTENSION, 
    STRUCTURE_SPAWN, 
    STRUCTURE_TOWER
  ];
  
    
  function getEnergyStoreCapacity(structure) {
    if (structure.structureType === STRUCTURE_TOWER) {
      return structure.store.getFreeCapacity(RESOURCE_ENERGY) > 900 
        ? structure.store.getFreeCapacity(RESOURCE_ENERGY) 
        : 0;
    }
    return structure.store.getFreeCapacity(RESOURCE_ENERGY);
  }
  
function EsaveEnergy(creep) {


    let target = findClosestEnergyDropoff(creep) 
  
    if (!target) {
      return -1;
    }
    
    removeAllStoreWithoutEnergy(creep)
    if(creep.store[RESOURCE_ENERGY]==0)
    {
        if(creep.withdraw(creep.room.storage,RESOURCE_ENERGY)==ERR_NOT_IN_RANGE)
            creep.moveTo(creep.room.storage)
        return;
    }
  
    let tranTarget = findClosestEnergyDropoff(creep) 

    const transferResult = creep.transfer(tranTarget, RESOURCE_ENERGY);
    if (transferResult === ERR_NOT_IN_RANGE) {
      creep.moveTo(target, { visualizePathStyle: {} });
    } else if (transferResult === OK) {
      // After a successful transfer, we immediately look for the next target.
      target = findNextClosestEnergyDropoff(creep,creep.pos,tranTarget) 
      
      // If there's a new target and it's not in the close range, move to it.
      if (target && !creep.pos.inRangeTo(target, 1)) {
        creep.moveTo(target, { visualizePathStyle: {} });
      }
    }
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


  function removeAllStoreWithoutEnergy(creep)
  {
    if(creep.store.getUsedCapacity()!=0)
    {
        var target = creep.room.storage;
        if(target) {
            var count = 0;
            for(const resourceType in creep.store) {
                if(resourceType == RESOURCE_ENERGY)
                    continue;
                count++
                if(creep.transfer(target, resourceType) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                    break;
                }
            }
            return count;
        }
    }
  }
