
var utils = require('util')

var addSpawn = require('addSpawn')
var creepManage = require('creepManage')
var RoomInit = require('Init')

var structures = 
{

    mineral : "",
    container : "",
    extrator : ""
}
var ManageStructure = function(roomName)
{
    var roomBuildings = Memory.rooms[roomName].buildings
    var ExtractorID = roomBuildings.Extractor;
    var MineralID = roomBuildings.Mineral;
    var ContainerID = roomBuildings.Containers[3]

    structures.mineral = Game.getObjectById(MineralID);
    structures.container = Game.getObjectById(ContainerID)
    structures.extrator = Game.getObjectById(ExtractorID)
}

// harvester.js
var roleHarvester = {
    run: function(creep) {
        var mineral = structures.mineral
        var container = structures.container
        if(creep.harvest(mineral) === ERR_NOT_IN_RANGE) {
        }
        creep.moveTo(container, {visualizePathStyle: {stroke: '#ffaa00'}});
    }
};


// carrier.js
var roleCarrier = {
    run: function(creep) {
        
        var container = structures.container
        if(container)
        {
            if(creep.store.getFreeCapacity() > 0) {
                
                for(const resourceType in container.store) {
                    if(container.store[resourceType]>creep.store.getFreeCapacity())
                    if(creep.withdraw(container, resourceType) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(container, {visualizePathStyle: {stroke: '#ffffff'}});
                    }
                }

            } else {
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

    }
};


var minerManager = {
    run: function(room) {
        // 定义harvester和carrier的数量
        ManageStructure(room.name)
        if(!structures.extrator || !structures.mineral || structures.mineral.mineralAmount==0 || (room.storage && room.storage.store.getFreeCapacity()< 200000 ))
            return;
        var harvesterNight = Game.creeps['HM'+room.name+"Night"]
        var carrierNight = Game.creeps['CM'+room.name+"Night"];
        var harvesterDay = Game.creeps['HM'+room.name+"Day"]
        var carrierDay = Game.creeps['CM'+room.name+"Day"];

        this.spawnCreep(room,'MinHarvester')
    
        
        // 如果carrier数量低于预期，孵化一个carrier

        this.spawnCreep(room,'MinCarrier')
    

        if(harvesterNight)
            roleHarvester.run(harvesterNight);
        if(harvesterDay)
            roleHarvester.run(harvesterDay);    
        if(carrierNight)
            roleCarrier.run(carrierNight);
        if(carrierDay)
            roleCarrier.run(carrierDay);

    },
    // 孵化函数
    spawnCreep: function(room, role) {

        const newName = role === 'MinHarvester' ? 'HM'+room.name: 'CM'+room.name;
        const body = role === 'MinHarvester' ? {"work":20,"move":5} : {"carry":8,"move":4}; // 为不同的角色指定不同的身体部件
        const pro = role === 'MinHarvester' ? creepManage.harvestForMineral.priority : creepManage.carrierForMineral.priority
        addSpawn(room.name,body,newName, pro)
    
    }
};

module.exports = minerManager;
