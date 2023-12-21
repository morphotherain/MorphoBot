
var utils = require('util')

var addSpawn = require('addSpawn')
var creepManagers = require('creepManagers')
var RoomInit = require('Init')

var runReserver = 

 {
    run : function(roomName,roomSourceName)
    {
        var level = Memory.level[roomName]
        if(level<3) return;
        var creepManage = creepManagers.Manage(roomName)
        var creepBodys = {
            reservers:{
            3:{'claim':1,'move':4},
            4:{'claim':2,'move':2},
            5:{'claim':2,'move':2},
            6:{'claim':3,'move':3},
            7:{'claim':7,'move':7},
            8:{'claim':8,'move':8},
            priority : creepManage.reserver.priority
            }
        }
        

        var memory = utils.getRoomMem(roomName);
        if(memory.reserver == undefined || true)
        {
            memory.reserver = 
            {
                reservers : ["r"+roomSourceName]
            }
        }
        var sourcesID = Memory.sourceOut[roomSourceName].sourcesID
        var reserver = function(creep){

            if(Game.rooms[roomSourceName] && Game.rooms[roomSourceName].controller) {
                if(creep.room.name != roomSourceName)
                {
                    var ExitPos
                    if(Memory.sourceOut[roomSourceName].sources[sourcesID[0]])
                        ExitPos = Memory.sourceOut[roomSourceName].sources[sourcesID[0]].roomExitOut[creep.room.name]
                    if(!ExitPos)
                    {
                        const exitDir = creep.room.findExitTo(roomSourceName);
                        const exit = creep.pos.findClosestByRange(exitDir);
                        creep.moveTo(exit);
                    }
                    else
                    {
                        creep.moveTo(new RoomPosition(ExitPos.x,ExitPos.y,creep.room.name))
                    }
                    return;
                }
                
                {
                    var ans = creep.reserveController(Game.rooms[roomSourceName].controller)
                    if(ans==ERR_NOT_IN_RANGE)
                    {
                        creep.moveTo(Game.rooms[roomSourceName].controller, {
                          reusePath : 50
                          })
                        
                    }   
                    if(ans == -7)
                    {
                        if(creep.attackController(Game.rooms[roomSourceName].controller)==ERR_NOT_IN_RANGE)
                        {
                            creep.moveTo(Game.rooms[roomSourceName].controller, {reusePath: 50})
                        }
                    }
                }
            }
            else
            {
                if(creep.room.name != roomSourceName)
                {
                    var ExitPos
                    if(Memory.sourceOut[roomSourceName].sources[sourcesID[0]])
                        ExitPos = Memory.sourceOut[roomSourceName].sources[sourcesID[0]].roomExitOut[creep.room.name]
                    if(!ExitPos)
                    {
                        const exitDir = creep.room.findExitTo(roomSourceName);
                        const exit = creep.pos.findClosestByRange(exitDir);
                        creep.moveTo(exit);
                    }
                    else
                    {
                        creep.moveTo(new RoomPosition(ExitPos.x,ExitPos.y,creep.room.name))
                    }
                    return;
                }
                    
            }
        }
        var num = 0;
        if(level == 3 )
            num = 2
        else
        {
            num = 1
        }
        for(var i = 0;i<num;i++){
            if(Game.creeps[(memory.reserver.reservers[0]+i)+"Day"] != undefined)
            {   
                var creep = Game.creeps[(memory.reserver.reservers[0]+i)+"Day"]
                reserver(creep)
            }
            if(Game.creeps[(memory.reserver.reservers[0]+i)+"Night"] != undefined)
            {   
                var creep = Game.creeps[(memory.reserver.reservers[0]+i)+"Night"]
                reserver(creep)
            }
            if( (Game.rooms[roomSourceName] != undefined) 
                &&
                ((Game.rooms[roomSourceName].controller.reservation == undefined ||
                 Game.rooms[roomSourceName].controller.reservation.ticksToEnd<1000))
                &&
                ( (!Game.rooms[roomSourceName]) || !Game.rooms[roomSourceName].controller.my )
            )
                addSpawn(roomName,creepBodys.reservers[level],(memory.reserver.reservers[0]+i),creepBodys.reservers.priority)

        }
 }
}

module.exports = runReserver;

