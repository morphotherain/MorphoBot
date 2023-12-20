
var creepManage = require('creepManage')  

//TOTAL [O]:0  [H]:5  [X]:1  [U]:1  [K]:1  [Z]:1  [L]:1 
//WN direct 
// Satori : W3N53[Z]-8
// Satori : W3N56[H]-4
// Utsuho : W17N19[H]-6
// Morpho : W55N21[H]-8
// Morpho : W58N24[K]-6
// Morpho : W53N23[H]-5
// Koishi : W52N25[H]-6
// Koishi : W58N27[U]-6
// Koishi : W56N28[X]-5 


//EN direct
// Rin : E57N34[L]-6


//WS direct

// var creepManager = {
//     "W5N8":creepManageW5N8,
//     "W55N21":creepManageW55N21,
//     "W17N19":creepManageW17N19,
//     "W3N53":creepManageW3N53,
//     "W52N25":creepManageW52N25,
//     "E57N34":creepManageE57N34,
//     "W58N24":creepManageW58N24,
//     "W58N27":creepManageW58N27,
//     "W53N23":creepManageW53N23,
// } 

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