var utils = require('util')
var RoomInit = require('Init')
var buildingMgr = require('buildingMgr');
var carryTask = require('carryTask')


var runLabs = 
 {
    run : function(roomName)
    {
        var level = Memory.level[roomName]
        var room = Game.rooms[roomName]
        if(level<6)
            return;

        var structures = buildingMgr.ManageStructure(roomName)
        var Labs = structures.Labs
        if(Labs.length<0)return;

        var memory = utils.getRoomMem(roomName);
        var storage = room.storage
        var terminal = room.terminal

        for(let lab of Labs){
            if(lab.store["energy"]<2000){
                var amount = 2000 - lab.store["energy"];
                carryTask.AddCarryTask(room, "Labs", storage.id, lab.id, 10, {"energy" : amount});
                return;
            }
        }
        


    }
}

module.exports = runLabs;