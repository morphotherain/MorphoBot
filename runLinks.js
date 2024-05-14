
var utils = require('util')

var addSpawn = require('addSpawn')
var creepManage = require('creepManage')
var RoomInit = require('Init')
var carryTask = require('carryTask')

const logger = require('mylog');
const { runCarry } = require('./carryTask')
const { roomNames } = require('./MemorySystem')

var structures = 
{
    centerLink : "",
    exitLinks : [],
    sourceLinks : [],
    upgradeLink : "",
}
var ManageStructure = function(roomName)
{
    
    var roomBuildings = Memory.rooms[roomName].buildings
    var LinkId = roomBuildings.Links

    var centerLinkID = LinkId[0]
    var exitLinkIDs =  [LinkId[4],LinkId[5]]
    var sourceLinkIDs =  [LinkId[1],LinkId[2]]
    var upgradeLinkID =  LinkId[3]
    structures.centerLink = Game.getObjectById(centerLinkID);
    structures.exitLinks = exitLinkIDs.map(id => Game.getObjectById(id));
    structures.sourceLinks = sourceLinkIDs.map(id => Game.getObjectById(id));
    structures.upgradeLink = Game.getObjectById(upgradeLinkID);
}




const roleCarrierStorage = {
    /** @param {Creep} creep **/
    run: function(creep) {
        // 如果身上没有能量，去中心Link旁边取能量
        var storage = creep.room.storage;
        var terminal = creep.room.terminal;
        var centerLink = structures.centerLink

        if(Game.time %10 ==0 && storage && !creep.pos.isNearTo(storage))
            creep.moveTo(storage)
        if(Game.time %10 ==0 && terminal && !creep.pos.isNearTo(terminal))
            creep.moveTo(terminal)
        if(Game.time %10 ==0 && centerLink && !creep.pos.isNearTo(centerLink))
            creep.moveTo(centerLink)
        if(terminal)
            var priorityEnergy = (terminal.store.getFreeCapacity()<10000)?20:2
        var amount = centerLink.store[RESOURCE_ENERGY]
        var priority = (amount > 10)?10:0
        carryTask.AddCarryTask(creep.room, "Links", centerLink.id, storage.id, priority, {"energy" : amount}, "centerCarryTask");
        try{carryTask.runCarry(creep, false, "centerCarryTask")}catch(error){console.log("runCarry"+error)}
        return;
    }
};


 
const runLinks = {

    run: function(roomName) {
        // 假设我们已经在Room的memory中存储了links的id
        var room = Game.rooms[roomName];
        ManageStructure(roomName)

        if(structures.centerLink == undefined || structures.centerLink.length==0)
            return;
        // 检查每个出口Link，如果能量满了就传送到中心Link
        structures.exitLinks.forEach(link => {
            if (link && structures.centerLink && link.store.getUsedCapacity(RESOURCE_ENERGY) > 400) {
                if(structures.upgradeLink && structures.upgradeLink.store.getUsedCapacity(RESOURCE_ENERGY) < 50)
                    link.transferEnergy(structures.upgradeLink);
                else
                    link.transferEnergy(structures.centerLink);
            }
        });
        structures.sourceLinks.forEach(link => {
            if (link && structures.centerLink && link.store.getUsedCapacity(RESOURCE_ENERGY) > 400) {
                if(structures.upgradeLink && structures.upgradeLink.store.getUsedCapacity(RESOURCE_ENERGY) < 50)
                    link.transferEnergy(structures.upgradeLink);
                else
                    link.transferEnergy(structures.centerLink);
            }
        });
        var link = structures.centerLink
        if (link && structures.upgradeLink && link.store.getUsedCapacity(RESOURCE_ENERGY) > 400 && structures.upgradeLink.store.getUsedCapacity(RESOURCE_ENERGY) < 700) {
            link.transferEnergy(structures.upgradeLink);
        }
        this.assignCreeps(room)
    },

    assignCreeps: function(room) {
        // 找到所有的carrierStorage和carrierLink
        // 计算当前Creep数量
        const creep1 = Game.creeps["carrierStorage"+room.name+"Day"]
        const creep2 = Game.creeps["carrierStorage"+room.name+"Night"]

        // 运行每个carrierStorage的行为
        if(creep1)
            roleCarrierStorage.run(creep1)
        if(creep2)
            roleCarrierStorage.run(creep2)
        
        const body = {"carry":16,"move":1} ;
        addSpawn(room.name,body,"carrierStorage"+room.name, creepManage.Linker.priority,{
            memory: { working: false }
        })
    },

};

module.exports = runLinks;

var findEnergyDropoff = function (creep) {
    return creep.room.find(FIND_MY_CREEPS, {
        filter: (creep) => {
            return (creep.name[0]=='b' &&
                    creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0)
        }
    });
  }