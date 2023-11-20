
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
        creepManage = creepManagers.Manage(roomName)
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
        var reserver = function(creep){

            
            if(Game.rooms[roomSourceName] && Game.rooms[roomSourceName].controller) {
                if(creep.room.name != roomSourceName)
                {
                    if(roomSourceName == "W54N21")
                    {
                        creep.moveTo(Game.rooms[roomSourceName].controller)
                        return;
                    }
                    utils.moveOverRoomsEX(creep.room.name,roomSourceName,creep)
                    return;
                }
                if(roomSourceName == "W54N21" ||roomSourceName == "W54N22" ||roomSourceName == "W55N22" ||roomSourceName == "E53S51" )
                {
                    if(creep.claimController(Game.rooms[roomSourceName].controller)==ERR_NOT_IN_RANGE)
                    {
                        creep.moveTo(Game.rooms[roomSourceName].controller, {reusePath: 50})

                    }
                    return;   
                }

                
                {
                    var ans = creep.reserveController(Game.rooms[roomSourceName].controller)
                    if(ans==ERR_NOT_IN_RANGE)
                    {
                        creep.moveTo(Game.rooms[roomSourceName].controller, {
                            costCallback: function(roomName, costMatrix) {

                              for (var i =0;i < 50;i++ ) {

                                costMatrix.set(0, i, 255);
                                costMatrix.set(49, i, 255);
                                
                                costMatrix.set(i, 0, 255);
                                costMatrix.set(i, 49, 255);

                              }
                          
                          },
                          reusePath : 50
                          })
                        console.log(creep.pos)
                        if(creep.pos.x == 49){
                            console.log(creep.pos,creep.move(LEFT))
                            return;
                        }
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
                    utils.moveOverRoomsEX(creep.room.name,roomSourceName,creep)
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

            if( (Game.rooms[roomSourceName] != undefined) &&(
                (Game.rooms[roomSourceName].controller.reservation == undefined ||
                 Game.rooms[roomSourceName].controller.reservation.ticksToEnd<1000)
                )&&
                ((!Game.rooms[roomSourceName])||!Game.rooms[roomSourceName].controller.my)
                )
                if( (Memory.outpostStatus[roomSourceName] == 0))
                    addSpawn(roomName,creepBodys.reservers[level],(memory.reserver.reservers[0]+i),creepBodys.reservers.priority)

        }
 }
}

module.exports = runReserver;

