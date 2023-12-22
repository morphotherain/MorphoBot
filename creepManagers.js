
var creepManage = require('creepManage')  

var creepManagers = {
    run : function(roomName)
    {
        var roomBuildings = Memory.rooms[roomName].buildings
        let constructureSites = Game.rooms[roomName].find(FIND_CONSTRUCTION_SITES)
        if(constructureSites.length > 0)
        {

            creepManage.builder.buildersNum = 2;
            creepManage.builder.carriersNum = 2;
            creepManage.controller.upgradersNum = 0;
            creepManage.controller.carriersNum = 0;
            if(Game.rooms[roomName].controller.level < 4)
            {
                creepManage.builder.buildersNum = 2;
                creepManage.builder.carriersNum = 4;
            }
        }
        else
        {
            creepManage.builder.buildersNum = 0;
            creepManage.builder.carriersNum = 0;

            if(!Game.rooms[roomName].memory.startUpgrade) Game.rooms[roomName].memory.startUpgrade = false;
            switch(Memory.level[roomName])
            {
                case 0:{
                    creepManage.controller.upgradersNum = 2;
                    creepManage.controller.carriersNum = 1; 
                    break;          
                }
                case 1:{
                    creepManage.controller.upgradersNum = 0;
                    creepManage.controller.carriersNum = 0;
                    break;           
                }
                case 2:{
                    creepManage.controller.upgradersNum = 4;
                    creepManage.controller.carriersNum = 3;
                    break;           
                }
                case 3:{
                    creepManage.controller.upgradersNum = 3;
                    creepManage.controller.carriersNum = 2;
                    break;           
                }
                case 4:{
                    creepManage.controller.upgradersNum = 2;
                    creepManage.controller.carriersNum = 2;
                    break;           
                }
                case 5:{
                    creepManage.controller.upgradersNum = 1;
                    creepManage.controller.carriersNum = 1;
                    break;           
                }
                case 6:{
                    creepManage.controller.upgradersNum = 1;
                    creepManage.controller.carriersNum = 1;
                    break;           
                }
                case 7:{
                    creepManage.controller.upgradersNum = 1;
                    creepManage.controller.carriersNum = 1;
                    break;           
                }
                case 8:{
                    creepManage.controller.upgradersNum = 1;
                    creepManage.controller.carriersNum = 1;
                    break;           
                }
            }
            
            if(!Game.rooms[roomName].storage || Game.rooms[roomName].memory.startUpgrade){
            }
            else
            {
                creepManage.controller.upgradersNum = 0;
                creepManage.controller.carriersNum = 0;    
            }

            if(Game.rooms[roomName].storage && Game.rooms[roomName].storage.store["energy"]>100000)
            {
                Game.rooms[roomName].memory.startUpgrade = true;
                if(Game.rooms[roomName].storage && Game.rooms[roomName].storage.store["energy"]>200000){
                    if(!Memory.rooms[roomName].controller.containerFull)Memory.rooms[roomName].controller.containerFull = 0;
                        Memory.rooms[roomName].controller.containerFull++;
                    if(Memory.rooms[roomName].controller.containerFull > 200)
                        if(creepManage.controller.upgradersNum>0)creepManage.controller.upgradersNum = creepManage.controller.upgradersNum + 2
                }
            }
            if(Game.rooms[roomName].storage && Game.rooms[roomName].storage.store["energy"]<50000)
            {
                Game.rooms[roomName].memory.startUpgrade = false;
            }
            var container = Game.getObjectById(roomBuildings.Containers[2])
            if(container && container.store.getFreeCapacity() == 0)
            {
                if(!Memory.rooms[roomName].controller.containerFull)Memory.rooms[roomName].controller.containerFull = 0;
                Memory.rooms[roomName].controller.containerFull++;
                if(Memory.rooms[roomName].controller.containerFull > 200)
                    if(creepManage.controller.upgradersNum>0)creepManage.controller.upgradersNum = creepManage.controller.upgradersNum + 2
            }
            if(container && container.store.getFreeCapacity() > 500)
            {
                Memory.rooms[roomName].controller.containerFull = 0;
            }
            
        }
        
    },
    Manage : function(roomName)
    {
        
        return creepManage;
        //var res = creepManager[roomName] 
        //return (res)?(res):console.log("没有找到creepManage文件!!!!");
        
    }
}



module.exports = creepManagers;