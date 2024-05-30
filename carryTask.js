const { min } = require("lodash");

var carryTask =
{
    Tasks: [{ type: "", source: "", target: "", targetAmount: 0, priority: 0 }],
    runCarry: function (creep, spawn = false, taskName = "carryTask") {
        var next = true;
        var spawnState = -1
        if (spawn)
            spawnState = EsaveEnergy(creep)
        if (spawnState != -1)
            return;
        next = false;

        try{task = this.getHighestPriorityTask(creep, taskName)}catch(error){console.log("rungetHighestPriorityTaskCarry"+error)}


        if (!task || task == null) {
            if (creep.store.getUsedCapacity() != 0) {
                var target = creep.room.storage;
                if (target) {
                    for (const resourceType in creep.store) {
                        if (creep.transfer(target, resourceType) === ERR_NOT_IN_RANGE) {
                            creep.moveTo(target, { visualizePathStyle: { stroke: '#ffffff' } });
                        }
                    }
                }
            }
            return;
        }

        var tranSource = Game.getObjectById(task.source)
        var tranTarget = Game.getObjectById(task.target)
        var tranType = Object.keys(task.resourceType)[0];
        var tranAmount = Math.min(tranSource.store[tranType], task.resourceType[tranType]);
        var tranAmount = Math.min(creep.store.getFreeCapacity(), tranAmount);

        // 存储 creep 内存中的资源到 storage 中
        for (let resourceType in creep.store) {
            if (resourceType !== tranType) {
                creep.moveTo(creep.room.storage)
                creep.transfer(creep.room.storage, resourceType);
                return;
            }
        }

        //console.log("carryTask[LOG]:", creep.name, "  ", tranSource, " ", tranTarget, " ", tranType);

        var moveTarget = 0

        if (creep.store[tranType] == 0 && creep.ticksToLive > 30) creep.memory.full = false;
        else creep.memory.full = true;
        if (creep.memory.full) {
            var ans = creep.transfer(tranTarget, tranType);
            //console.log("carryTask[LOG]:", creep.name, " ans ", ans);
            if (ans == ERR_NOT_IN_RANGE)
                moveTarget = tranTarget
            if (ans == OK)
            {
                var host = task.Taskhost;                
                creep.room.memory[taskName][host].recent_changed_cooldown = 0;
                task.priority = 0;
            }
        }
        else {
            var ans = creep.withdraw(tranSource, tranType, tranAmount)
            if (creep.withdraw(tranSource, tranType, tranAmount) == ERR_NOT_IN_RANGE)
                moveTarget = tranSource
            //console.log("carryTask[LOG]:",creep.name, "  ", tranSource, " ", tranAmount);


        }
        creep.moveTo(moveTarget)

        return;




    },
    getHighestPriorityTask: function (creep, taskName = "carryTask") {
        var Tasks = creep.room.memory[taskName];
        if (!Tasks) Tasks = {};
        if (Object.keys(Tasks).length === 0) {
            return null; // 没有任务
        }

        Memory.OverRoomsTransfer = Memory.OverRoomsTransfer || {};

        var TaskKeys = Object.keys(Tasks)
        var highestPriorityTask = Tasks[TaskKeys[0]]; // 初始假设第一个任务优先级最高

        //console.log("carryTask[LOG]:", TaskKeys[0], "  ", Object.keys(highestPriorityTask.resourceType)[0]);

        if(Tasks["OverRooms"] && Tasks["OverRooms"].priority)
        {
            if(creep.room.name != Memory.OverRoomsTransfer.sourceRoomName)
                Tasks["OverRooms"].priority = 0;
        }

        // 用于存储符合条件的任务键
        var matchingTaskKeys = [];
        var tranType = Object.keys(creep.store)[0]; // 获取 Creep 当前持有的资源类型

        // 迭代所有任务，检查资源类型是否匹配
        for (var i = 0; i < TaskKeys.length; i++) {
            var taskId = TaskKeys[i];
            var task = Tasks[taskId];
            
            // 检查任务是否需要与 Creep 当前持有的资源类型匹配
            if (task.resourceType && Object.keys(task.resourceType)[0] === tranType) {
                matchingTaskKeys.push(taskId); // 将匹配的任务键存储起来
            }
        }

        if(matchingTaskKeys.length > 0)
        {
            //console.log("!!!!!matchingTaskKeys"+matchingTaskKeys.length)
            highestPriorityTask =  Tasks[matchingTaskKeys[0]];
            for (var i = 1; i < matchingTaskKeys.length; i++) {

                var currentTask = Tasks[matchingTaskKeys[i]];
                if (currentTask.target && currentTask.source && creep) {
                }
                else {
                    //console.log(currentTask.target, currentTask.source, creep)
                    continue;
    
                }
                var currentPriority = (currentTask.priority)
                var highestPriority = (highestPriorityTask.priority);
    
                if (currentPriority > highestPriority) {
                    highestPriorityTask = currentTask; // 找到更高优先级的任务
                }
                
            }
            return highestPriorityTask;
        }

        for (var i = 1; i < TaskKeys.length; i++) {

            var currentTask = Tasks[TaskKeys[i]];

            if (currentTask.target && currentTask.source && creep) {

            }
            else {
                //console.log(currentTask.target, currentTask.source, creep)
                continue;

            }
            var currentPriority = (currentTask.priority)
            var highestPriority = (highestPriorityTask.priority);

            if (currentPriority > highestPriority) {
                highestPriorityTask = currentTask; // 找到更高优先级的任务
            }
            
        }
        if(highestPriorityTask.priority > 0)
            return highestPriorityTask;
        return null;
    },
    AddCarryTask: function (room, _Taskhost, _source, _target, _priority, _resourceType, taskName = "carryTask") {
        if (!room.memory.carryTask) room.memory.carryTask = {}
        task = {
            source: _source,
            target: _target,
            priority: _priority,
            resourceType: _resourceType,
            recent_changed_cooldown: (_priority==0)?0:100,
            Taskhost : _Taskhost
        }
        if (!room.memory[taskName]) room.memory[taskName] = {}
        if (!room.memory[taskName][_Taskhost]){
            room.memory[taskName][_Taskhost] = (task)
            return;
        }
        if(room.memory[taskName][_Taskhost].recent_changed_cooldown > 0)
        {
            room.memory[taskName][_Taskhost].recent_changed_cooldown = room.memory[taskName][_Taskhost].recent_changed_cooldown - 1;
            return;
        }
        room.memory[taskName][_Taskhost] = (task)
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
    if (creep.store[RESOURCE_ENERGY] == 0) {
        if (creep.withdraw(creep.room.storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
            creep.moveTo(creep.room.storage)
        return;
    }

    let tranTarget = findClosestEnergyDropoff(creep)

    const transferResult = creep.transfer(tranTarget, RESOURCE_ENERGY);
    if (transferResult === ERR_NOT_IN_RANGE) {
        creep.moveTo(target, { visualizePathStyle: {} });
    } else if (transferResult === OK) {
        // After a successful transfer, we immediately look for the next target.
        target = findNextClosestEnergyDropoff(creep, creep.pos, tranTarget)

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
function findNextClosestEnergyDropoff(creep, referencePoint = creep.pos, now) {
    return referencePoint.findClosestByRange(FIND_MY_STRUCTURES, {
        filter: (structure) =>
            STRUCTURES_TO_ENERGY_DROP.includes(structure.structureType) &&
            getEnergyStoreCapacity(structure) > 0 && structure.id != now.id
    });
}


function removeAllStoreWithoutEnergy(creep) {
    if (creep.store.getUsedCapacity() != 0) {
        var target = creep.room.storage;
        if (target) {
            var count = 0;
            for (const resourceType in creep.store) {
                if (resourceType == RESOURCE_ENERGY)
                    continue;
                count++
                if (creep.transfer(target, resourceType) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, { visualizePathStyle: { stroke: '#ffffff' } });
                    break;
                }
            }
            return count;
        }
    }
}
