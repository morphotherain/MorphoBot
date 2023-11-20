var buildingMgr = {
    run: function(roomName) {
        let room = Game.rooms[roomName];
        this.updateBuildingCache(room);
    },

    updateBuildingCache: function(room) {
        if(!Game.flags["refresh"+room.name])Game.rooms[room.name].createFlag(1, 1,"refresh"+room.name)
        else{if(Game.flags["refresh"+room.name].pos.x != 1){
            delete Memory.rooms[room.name].buildings;
            Game.flags["refresh"+room.name].setPosition(1,1)
        }}
        if(!Memory.rooms[room.name].buildings)
            this.refreshBuildingIDs(room);

        // 检测建筑工地数量变化
        if (!room.memory.lastConstructionSiteCount) {
            room.memory.lastConstructionSiteCount = room.find(FIND_CONSTRUCTION_SITES).length;
        } else {
            let currentConstructionSiteCount = room.find(FIND_CONSTRUCTION_SITES).length;
            if (currentConstructionSiteCount < room.memory.lastConstructionSiteCount) {
                this.refreshBuildingIDs(room);
            }
            room.memory.lastConstructionSiteCount = currentConstructionSiteCount;
        }

        // 定期检测
        if (Game.time % 1000 === 0) {
            // 检测 ID 有效性
            if (this.isInvalidIDs(room)) {
                this.refreshBuildingIDs(room);
            }
        }
    },

    refreshBuildingIDs: function(room) {
        // 重置或初始化 Memory 结构
        if (!Memory.rooms[room.name].buildings) {
            Memory.rooms[room.name].buildings ={    
                Spawns : ["","",""],
                Containers : [
                    "","",    //sourceContainer
                    "",       //upgradeContainer
                    "",        //mineralContainer
                    ""        //extensionContainer
                ],
                Links : ["",  //centerLink
                    "","",    //sourceLink
                    "",       //upgraderLink
                    "",""],   //OutLink
                Labs : ["","","",
                        "","","",
                        "","","",
                        "",],
                PowerSpawn : "",
                Factory : "",
                Nuker: "",
                Observer : "",
                Extractor : "",
                Mineral : "",
                Source : ["",""]
            };
        }
        let Spawns = room.find(FIND_MY_STRUCTURES, { filter: (s) => s.structureType === "spawn" });
        Memory.rooms[room.name].buildings["Spawns"] = Spawns.map(b => b.id);

        let Labs = room.find(FIND_MY_STRUCTURES, { filter: (s) => s.structureType === "lab" });
        Memory.rooms[room.name].buildings["Labs"] = Labs.map(b => b.id);

        let PowerSpawn = room.find(FIND_MY_STRUCTURES, { filter: (s) => s.structureType === "powerSpawn" });
        if(PowerSpawn.length > 0)
            Memory.rooms[room.name].buildings["PowerSpawn"] = PowerSpawn[0].id;

        // 遍历建筑类型并更新 ID
        let types = [ 'Factory', 'Nuker', 'Observer', 'Extractor'];
        types.forEach(type => {
            let buildings = room.find(FIND_MY_STRUCTURES, { filter: (s) => s.structureType === type.toLowerCase() });
            if(buildings.length > 0)
                Memory.rooms[room.name].buildings[type] = buildings[0].id;
        });


        //  Containers  //
        let containers = room.find(FIND_STRUCTURES, {
            filter: (s) => s.structureType === STRUCTURE_CONTAINER
        });
        // Controller 3格内的 Containers
        let controllerContainers = containers.filter((container) => {
            return room.controller.pos.inRangeTo(container.pos, 3);
        });
        if(controllerContainers.length > 0)
            Memory.rooms[room.name].buildings["Containers"][2] = controllerContainers[0].id
        
        // Mineral 一格内的 Containers
        let mineralContainers = [];
        let minerals = room.find(FIND_MINERALS);

        Memory.rooms[room.name].buildings["Mineral"] = minerals[0].id

        minerals.forEach((mineral) => {
            let nearbyContainers = containers.filter((container) => {
                return mineral.pos.inRangeTo(container.pos, 1);
            });
            mineralContainers = mineralContainers.concat(nearbyContainers);
        });
        if(mineralContainers.length > 0)
            Memory.rooms[room.name].buildings["Containers"][3] = mineralContainers[0].id
        
        let sources = Memory.rooms[room.name].source.sourcesID.map(s => Game.getObjectById(s)).filter(Boolean); // 过滤掉 null 值
        
        // 每个 Source 一格内的 Containers
        if (!Memory.rooms[room.name] || !Memory.rooms[room.name].source || !Memory.rooms[room.name].source.sourcesID) {
            // 初始化或处理错误
            // 例如: return; 或 Memory.rooms[room.name].source.sourcesID = [];
        }
        else{
            for (var i = 0; i < sources.length; i++) {
                if (!sources[i]) continue; // 检查是否成功获取 source 对象

                let nearbyContainers = containers.filter((container) => {
                    return sources[i].pos.inRangeTo(container.pos, 1);
                });

                if (nearbyContainers.length > 0)
                    Memory.rooms[room.name].buildings["Containers"][i] = nearbyContainers[0].id;
                else
                    Memory.rooms[room.name].buildings["Containers"][i] = "";
            }
        }

        //  Links  //
        let links = room.find(FIND_STRUCTURES, {
            filter: (s) => s.structureType === "link"
        });
        // Controller 3格内的 Links
        let controllerLinks = links.filter((link) => {
            return room.controller.pos.inRangeTo(link.pos, 3);
        });
        if(controllerLinks.length > 0)
            Memory.rooms[room.name].buildings["Links"][3] = controllerLinks[0].id
        
        // 每个 Source 两格内的 Link
        for(var i = 0;i<sources.length ;i++)
        {
            let nearbyLinks = links.filter((link) => {
                return sources[i].pos.inRangeTo(link.pos, 2);
            });
            if(nearbyLinks.length > 0)
                Memory.rooms[room.name].buildings["Links"][i+1] = nearbyLinks[0].id;
            else
                Memory.rooms[room.name].buildings["Links"][i+1] = "";
        }

        if(room.storage)
        {
            let centerLink = links.filter((link) => {
                return room.storage.pos.inRangeTo(link.pos, 2);
            });
            if(centerLink.length > 0)
                Memory.rooms[room.name].buildings["Links"][0] = centerLink[0].id
            else
                Memory.rooms[room.name].buildings["Links"][0] = ""
        }
        else
        {
            Memory.rooms[room.name].buildings["Links"][0] = ""
        }
        


    },

    isInvalidIDs: function(room) {
        // 逻辑来确定是否有无效的 ID
        // 例如遍历 Memory 中的所有 ID 并检查是否还存在对应的建筑
        // ...



    }
};

module.exports = buildingMgr;
