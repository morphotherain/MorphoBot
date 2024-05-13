
var utils = require('util')

var addSpawn = require('addSpawn')
var creepManagers = require('creepManagers')
var RoomInit = require('Init')

var runSource = 

 {
    run : function(roomName)
    {

        var roomBuildings = Memory.rooms[roomName].buildings
        var creepManage = creepManagers.Manage(roomName)
        var creepBodys = {
            harvests:{
            0:{'work':2,'move':1},
            1:{'work':2,'move':1},
            2:{'work':5,'move':1},
            3:{'work':5,'carry':0,'move':3},
            4:{'work':5,'carry':0,'move':3},
            5:{'work':5,'carry':0,'move':3},
            6:{'work':5,'carry':1,'move':3},
            7:{'work':5,'carry':1,'move':3},
            8:{'work':15,'carry':2,'move':8},
            priority : creepManage.harvests.priority
            }
        }
        
        var level = Memory.level[roomName]

        var memory = utils.getRoomMem(roomName);
        if(memory.source == undefined)
        {
            memory.source = 
            {
                sourcesID : RoomInit.getObjectID(roomName,FIND_SOURCES),
                harversts : ["h"]
            }
        }

        memory.source.harversts = ["h"+roomName]

        var harvest = function(creep,i){
            if(memory.source.sourcesID.length == 1)
            i = i*2;
            var containersID = [roomBuildings.Containers[0],roomBuildings.Containers[1]]

            var index = (level>=8)?((Game.time%300)<150?(0):1):(i%2)
            var sourceID = memory.source.sourcesID[index]
            if(creep.harvest(Game.getObjectById(sourceID))==ERR_NOT_IN_RANGE)
                creep.moveTo(Game.getObjectById(sourceID))
            if(Game.getObjectById(containersID[index]))
                creep.moveTo(Game.getObjectById(containersID[index]))
            if(level >= 6)
            {
                var link
                if(creep.memory.LinkId && creep.pos.inRangeTo(Game.getObjectById(creep.memory.LinkId),1))
                    link = Game.getObjectById(creep.memory.LinkId)
                else
                {
                    var LinksID = [roomBuildings.Links[1],roomBuildings.Links[2]]
                    link = Game.getObjectById(LinksID[index])
                    if(link)
                    {
                        creep.memory.LinkId = link.id
                    }
                }
                if(link)
                {
                    if(creep.store[RESOURCE_ENERGY]>30)
                    {
                        creep.transfer(link,RESOURCE_ENERGY)
                    }
                }                     
            }
        }
        var times = 3
        if(level >= 2)
            times = 1;
        if(level == 1)
            times = 3;
        if(level == 0)
            times = 1;
        
        var count =  0;
        
        var source1Num = 0;
        var source2Num = 0;
            
        if(times>1)
        {
            if(memory.source.sourcesID[0])
                source1Num += utils.countAvailableSpacesAroundSource(memory.source.sourcesID[0])
            if(memory.source.sourcesID[1])
                source2Num += utils.countAvailableSpacesAroundSource(memory.source.sourcesID[1])
            count += (source1Num>3)?3:source1Num;
            count += (source2Num>3)?3:source2Num;
        }
        else
        {
            count = memory.source.sourcesID.length*times
        }
                    

        if(level == 8)
            count = 1;
        for(var i = 0;i<6;i++){
            if(times > 1)
                var index = ((i<((source1Num>3)?3:source1Num))?0:1)
            else
                var index = i
            if(Game.creeps[(memory.source.harversts[0]+i)+"Day"] != undefined)
            {
                creepBodys.harvests.priority = creepBodys.harvests.priority - 2;
                var creep = Game.creeps[(memory.source.harversts[0]+i)+"Day"]
                if(level == 2 && i<2 && creep.getActiveBodyparts(WORK)<5) creep.suicide()
                harvest(creep,index)
            }
            if(Game.creeps[(memory.source.harversts[0]+i)+"Night"] != undefined)
            {
                creepBodys.harvests.priority = creepBodys.harvests.priority - 2;
                var creep = Game.creeps[(memory.source.harversts[0]+i)+"Night"]
                if(level == 2 && i<2 && creep.getActiveBodyparts(WORK)<5) creep.suicide()
                harvest(creep,index)
            }
            var creepName = ""
            if(times>1) creepName = (memory.source.harversts[0]+i)
            else        creepName = (memory.source.harversts[0]+i)
            if(i<count)
            addSpawn(roomName,creepBodys.harvests[level],creepName,creepBodys.harvests.priority)
            
        }
    }
}

module.exports = runSource;

function killLowMiners(){
    for(var i = 0;i<6;i++){
        var creepd = Game.creeps[(memory.source.harversts[0]+i)+"Day"]
        var creepn = Game.creeps[(memory.source.harversts[0]+i)+"Night"]
    }
}