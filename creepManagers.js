
var creepManage = require('creepManage')  

var creepManagers = {
    run : function(roomName)
    {
        var room = Game.rooms[roomName]
        var memory = Memory.rooms[roomName]
        var roomBuildings = memory.buildings
        var controller = creepManage.controller
        var builder = creepManage.builder

        let constructureSites = room.find(FIND_CONSTRUCTION_SITES)
        room.memory.constructureSitesNum = constructureSites.length;
        if(constructureSites.length > 0)
        {
            builder.buildersNum = 2;
            builder.carriersNum = 2;
            controller.upgradersNum = 0;
            controller.carriersNum = 0;
            if(room.controller.level < 4)
            {
                builder.buildersNum = 2;
                builder.carriersNum = 4;
            }
        }
        else
        {
            creepManage.builder.buildersNum = 0;
            creepManage.builder.carriersNum = 0;

            var upgraderNums = [2,1,4,3,2,1,1,1,1]
            var carriersNums = [1,1,3,2,2,1,1,1,1]
            var level = Memory.level[roomName]
            creepManage.controller.upgradersNum = upgraderNums[level]
            creepManage.controller.carriersNum = carriersNums[level]

            if(!room.memory.startUpgrade) room.memory.startUpgrade = false; //初始化
     
            if(room.storage && !room.memory.startUpgrade)
            {
                controller.upgradersNum = 0;
                controller.carriersNum = 0;    
            }

            if(room.storage && room.storage.store["energy"]>100000)
            {
                room.memory.startUpgrade = true;
                if(room.storage && room.storage.store["energy"]>200000){
                    if(!memory.controller.containerFull)memory.controller.containerFull = 0;//初始化

                    memory.controller.containerFull++;
                    if(memory.controller.containerFull > 200 && Memory.level[roomName] != 8)
                        if(controller.upgradersNum > 0)
                            controller.upgradersNum += 2
                }
            }
            if(room.memory.AcceptUpgrade == undefined)room.memory.AcceptUpgrade == true;
            if(room.storage && room.storage.store["energy"]<50000 && !room.memory.AcceptUpgrade)
            {
                room.memory.startUpgrade = false;
            }
            var container = Game.getObjectById(roomBuildings.Containers[2])
            if(container && container.store.getFreeCapacity() == 0)
            {
                if(!memory.controller.containerFull)memory.controller.containerFull = 0;//初始化

                memory.controller.containerFull++;
                if(memory.controller.containerFull > 200 && Memory.level[roomName]!=8)
                    if(creepManage.controller.upgradersNum>0)creepManage.controller.upgradersNum = creepManage.controller.upgradersNum + 2
            }
            if(container && container.store.getFreeCapacity() > 500)
            {
                memory.controller.containerFull = 0;
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