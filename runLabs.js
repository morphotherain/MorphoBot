var utils = require('utilFun')
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
        if(Labs.length<3){
            console.log(`<span style='color: red;'>[runLabs]</span> ${roomName} is short on lab: ${Labs.length}.`);
            return;
        }
        console.log(`<span style='color: green;'>[runLabs]</span> ${roomName} is running.`);

        var memory = utils.getRoomMem(roomName);
        var storage = room.storage
        var terminal = room.terminal

        // if(level == 8 && Labs.length == 10)
        // {
        //     var R = 1
        //     R = this.fillElement(Labs[0], "XKHO2", room, 1250);
        //     if(R == 0)return;
        //     R = this.fillElement(Labs[1], "XGHO2", room, 250);
        //     if(R == 0)return;
        //     R = this.fillElement(Labs[2], "XLHO2", room, 500);
        //     if(R == 0)return;
        //     R = this.fillElement(Labs[3], "XZHO2", room, 1250);
        //     if(R == 0)return;
        //     R = this.fillElement(Labs[4], "XZH2O", room, 1250);
        //     if(R == 0)return;
        // }

        if(!Memory.Lab)Memory.Lab = {sourceA:"", sourceB:"", target:""};
        var sourceA = Memory.Lab.sourceA;
        var sourceB = Memory.Lab.sourceB;
        var target = Memory.Lab.target;
        
        //1. 填充能量
        for(let lab of Labs){
            if(lab.store["energy"]<2000){
                var amount = 2000 - lab.store["energy"];
                carryTask.AddCarryTask(room, "Labs", storage.id, lab.id, 10, {"energy" : amount});
                return;
            }
        }
        if(target == "")return;
        //2. 清空Lab
        for (const resourceType in Labs[0].store) {
            if (resourceType !== sourceA && resourceType !== "energy" && Labs[0].store[resourceType] > 0) {
                R = this.emptyElement(Labs[0], resourceType, room);
                if(R == 0)return;
            }
        }
        
        for (const resourceType in Labs[1].store) {
            if (resourceType !== sourceB && resourceType !== "energy" && Labs[1].store[resourceType] > 0) {
                R = this.emptyElement(Labs[1], resourceType, room);
                if(R == 0)return;
            }
        }

        for(var i = 2;i<Labs.length;i++){
            for (const resourceType in Labs[i].store) {
                if (resourceType !== target && resourceType !== "energy" && Labs[i].store[resourceType] > 0) {
                    R = this.emptyElement(Labs[i], resourceType, room);
                    if(R == 0)return;
                }
            }
        }
        //3. 填充反应物
        
        if(terminal.store[sourceA]>=1000)
        {
            R = this.fillElement(Labs[0], sourceA , room, terminal.store[sourceA]-1000);
            if(R == 0)return;
        }
        
        if(terminal.store[sourceB]>=1000)
        {
            R = this.fillElement(Labs[1], sourceB , room, terminal.store[sourceB]-1000);
            if(R == 0)return;
        }

        //4. 执行反应
        if(Labs[0].store[sourceA]>40 && Labs[1].store[sourceB]>40)
            for(var i = 2;i<Labs.length;i++){
                Labs[i].runReaction(Labs[1], Labs[0])
            }
            
        //5. 回收生成物
        for(var i = 2;i<Labs.length;i++){
            if (Labs[i].store[target] > 300) {
                R = this.emptyElement(Labs[i], target, room);
                if(R == 0)return;
            }
        }

    },
    fillElement : function(lab, element, room, maxAmount){
        if(lab.store[element]<maxAmount){
            console.log(`<span style='color: yellow;'>[runLabs]</span> ${room.name} is transferring ${element} to Lab ${lab.store[element]}.`);
            var amount = Math.min(3000 - lab.store[element], maxAmount);
            carryTask.AddCarryTask(room, "Labs", room.terminal.id, lab.id, 10, {[element] : amount});
            return 0;
        }
        return 1;
    },
    emptyElement : function(lab, element, room, maxAmount){
        if(lab.store[element]>0){
            var amount = lab.store[element];
            carryTask.AddCarryTask(room, "Labs", lab.id, room.terminal.id, 10, {[element] : amount});
            return 0;
        }
        return 1;
    }
}

module.exports = runLabs;