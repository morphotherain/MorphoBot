
var utils = require('utilFun')
var RoomInit = require('Init')

var runTower = 

 {
    run : function(roomName)
    {
        if(Game.time%10!=0)return;
        var memory = utils.getRoomMem(roomName);
        if(memory.tower == undefined || Game.time%100==0)
        {
            memory.tower = 
            {
                towerID : RoomInit.getStructureID(roomName,STRUCTURE_TOWER),
            }
        }
        var controller = Game.rooms[roomName].controller
        if(!controller)return;
        var closestDamagedStructure = controller.pos.findClosestByRange(FIND_STRUCTURES, {filter: function(object) {
            return ((object.hits < object.hitsMax &&(object.hitsMax- object.hits)>20000  &&
                !(object.structureType == STRUCTURE_WALL || object.structureType == STRUCTURE_RAMPART))||
                 (((object.structureType == STRUCTURE_WALL || object.structureType == STRUCTURE_RAMPART) && object.hits<2000)) );
           }
        });
        if(!closestDamagedStructure){
            closestDamagedStructure = controller.pos.findClosestByRange(FIND_STRUCTURES, {filter: function(object) {
                return (((object.hitsMax- object.hits)>2000  &&  
                    !(object.structureType == STRUCTURE_WALL || object.structureType == STRUCTURE_RAMPART))||
                    (((object.structureType == STRUCTURE_WALL || object.structureType == STRUCTURE_RAMPART) && object.hits<2000 && !object.isPublic)) );
            }
            });
        }
        var closestHostile = controller.pos.findClosestByRange(FIND_HOSTILE_CREEPS ,{filter : function(creep){
            return creep.owner.username != "joe95" || creep.owner.username != "MerlinMan5" ||  creep.owner.username != "IceDream"
        }});
        var TowerOperator = function(towerID){
            var tower = Game.getObjectById(towerID)
            if(closestHostile) {
                tower.attack(closestHostile);
                return;
            }
            if(tower == undefined)
                return -1;

            if(closestDamagedStructure && true) {
                tower.repair(closestDamagedStructure);
            }
            
        }

        for(var i = 0;i<memory.tower.towerID.length;i++){
            TowerOperator(memory.tower.towerID[i])
        }
 }
}

module.exports = runTower;