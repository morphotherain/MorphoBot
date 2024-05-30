// terminalManager.js

const logger = require('mylog');
var carryTask = require('carryTask')
var buildingMgr = require('buildingMgr');
const elementLimits = 5000;
const elementMax = 10000;
const elementKey = 1000;
const resourceLimits = {
    'energy':200000,
    'H': 3000, 'L': 3000, 'O': 3000, 'K': 3000, 'Z': 3000, 'U': 3000, 'X': 3000,
    'Z': 3000, 'U': 3000, 'X': 3000,
    'UH': 3000, 'UO': 3000, 'KH': 3000, 'KO': 3000, 'LH': 3000, 'LO': 3000, 'ZH': 3000, 'ZO': 3000, 'GH': 3000, 'GO': 3000,
    'UH2O': 3000, 'UHO2': 3000, 'KH2O': 3000, 'KHO2': 3000, 'LH2O': 3000, 'LHO2': 3000, 'ZH2O': 3000, 'ZHO2': 3000, 'GH2O': 3000, 'GHO2': 3000,
    'XUH2O': 3000, 'XUHO2': 3000, 'XKH2O': 3000, 'XKHO2': 3000, 'XLH2O': 3000, 'XLHO2': 3000, 'XZH2O': 3000, 'XZHO2': 3000, 'XGH2O': 3000, 'XGHO2': 3000,

}
const resourceLimitsMax = {
    'energy':10000000,
    'H': 10000, 'L': 10000, 'O': 10000, 'K': 10000, 'Z': 10000, 'U': 10000, 'X': 10000,
    'Z': 10000, 'U': 10000, 'X': 10000,
    'UH': 10000, 'UO': 10000, 'KH': 10000, 'KO': 10000, 'LH': 10000, 'LO': 10000, 'ZH': 10000, 'ZO': 10000, 'GH': 10000, 'GO': 10000,
    'UH2O': 10000, 'UHO2': 10000, 'KH2O': 10000, 'KHO2': 10000, 'LH2O': 10000, 'LHO2': 10000, 'ZH2O': 10000, 'ZHO2': 10000, 'GH2O': 10000, 'GHO2': 10000,
    'XUH2O': 10000, 'XUHO2': 10000, 'XKH2O': 10000, 'XKHO2': 10000, 'XLH2O': 10000, 'XLHO2': 10000, 'XZH2O': 10000, 'XZHO2': 10000, 'XGH2O': 10000, 'XGHO2': 10000,

}
const resourceKeys = {
    'energy':5000,
    'H': 1000, 'L': 1000, 'O': 1000, 'K': 1000, 'Z': 1000, 'U': 1000, 'X': 1000,
    'Z': 1000, 'U': 1000, 'X': 1000,
    'UH': 1000, 'UO': 1000, 'KH': 1000, 'KO': 1000, 'LH': 1000, 'LO': 1000, 'ZH': 1000, 'ZO': 1000, 'GH': 1000, 'GO': 1000,
    'UH2O': 1000, 'UHO2': 1000, 'KH2O': 1000, 'KHO2': 1000, 'LH2O': 1000, 'LHO2': 1000, 'ZH2O': 1000, 'ZHO2': 1000, 'GH2O': 1000, 'GHO2': 1000,
    'XUH2O': 1000, 'XUHO2': 1000, 'XKH2O': 1000, 'XKHO2': 1000, 'XLH2O': 1000, 'XLHO2': 1000, 'XZH2O': 1000, 'XZHO2': 1000, 'XGH2O': 1000, 'XGHO2': 1000,
}

function getIngredientsByString(compound) {
    // 特殊处理G
    if (compound.length === 1) {
        if (compound === 'G') {
            return ['ZK','UL']; 
        }
        return [];
    }
    
    // 处理长度为2的化合物
    if (compound.length === 2) {
        return [compound[0], compound[1]];
    }
    
    // 处理长度为4的化合物
    if (compound.length === 4) {
        const suffix = compound.slice(1);
        if (suffix === 'H2O') {
            return [compound[0] + 'H', 'OH'];
        }
        if (suffix === 'HO2') {
            return [compound[0] + 'O', 'OH'];
        }
    }
    
    // 处理长度为5的情况
    if (compound.length === 5) {
        return [compound[0], compound.slice(1)];
    }

    return []; // 无法反推
}




var terminalManager =
{
    manage: function () {

        const rooms = Game.rooms;
        const resourceTypes = Object.keys(resourceLimits);
        const totalResourceTypes = resourceTypes.length;


        for (const roomName in rooms) {
            var structures = buildingMgr.ManageStructure(roomName)
            console.log("buildingMgr"+structures)
        }

        Memory.count = Memory.count || {} 
        if(!Memory.count.ResourceIndex)Memory.count.ResourceIndex = 0
        Memory.count.ResourceIndex = Memory.count.ResourceIndex + 1
        const resourceType = resourceTypes[Memory.count.ResourceIndex % totalResourceTypes]
        console.log(`<span style='color: green;'>[TerminalManager]</span> ${resourceType} is processing.`);

        // Step 0: 维护当前要合成的物质
        if(!Memory.Lab)Memory.Lab = {sourceA:"", sourceB:"", target:""};
        if(Memory.Lab.target == ""){
            var sources = getIngredientsByString(resourceType)
            if(sources != []){
                Memory.Lab.target = resourceType;
                Memory.Lab.sourceA = sources[0];
                Memory.Lab.sourceB = sources[1];
            }
        }
        if(resourceType === Memory.Lab.target)
        {

            var AllRoomExcess = false;
            var SourceRunOutA = true;
            var SourceRunOutB = true;
            for (const roomName in rooms) {
                const room = rooms[roomName];
                var structures = buildingMgr.ManageStructure(roomName)
                if (room.storage && room.terminal && structures.Labs.length>=3) {
                    var Labs = structures.Labs
                    if(room.memory.excessResources[resourceType]>1000){ AllRoomExcess = true;} //生成物已达标
                    else{ }                     //生成物未达标
                    if((room.memory.excessResources[Memory.Lab.sourceA] + Labs[0].store[Memory.Lab.sourceA])>3000){SourceRunOutA = false} //反应物A未耗尽
                    else{ }                             //反应物A已耗尽
                    if((room.memory.excessResources[Memory.Lab.sourceB] + Labs[1].store[Memory.Lab.sourceB])>3000){SourceRunOutB = false} //反应物B未耗尽
                    else{ }                             //反应物B已耗尽
                }
            }
            if(AllRoomExcess || SourceRunOutA || SourceRunOutB)
            {
                console.log("runTerminal[LOG]: "+resourceType +" : "+AllRoomExcess + " " + SourceRunOutA + " "+ SourceRunOutB + " ")
                Memory.Lab = {sourceA:"", sourceB:"", target:""};
            }
        }


        // Step 1: 维护每个房间超出上限的资源类型
        for (const roomName in rooms) {
            const room = rooms[roomName];
            if (room.storage && room.terminal) {
                room.memory.excessResources = room.memory.excessResources || {};
                room.memory.overLimitResources = room.memory.overLimitResources || {};
                const terminalAmount = room.terminal.store[resourceType] || 0;
                const storageAmount = room.storage.store[resourceType] || 0;
                const totalAmount = storageAmount + terminalAmount;
                const resourceLimit = resourceLimits[resourceType];
                const resourceLimitMax = resourceLimitsMax[resourceType];

                if (totalAmount > resourceLimit) {
                    room.memory.excessResources[resourceType] = totalAmount - resourceLimit;
                } else {
                    delete room.memory.excessResources[resourceType];
                }

                if (totalAmount > resourceLimitMax) {
                    room.memory.overLimitResources[resourceType] = totalAmount - resourceLimitMax;
                } else {
                    delete room.memory.overLimitResources[resourceType];
                }
            
            }
        }

        // Step 2: 维护每个房间用于发送的能量
        for (const roomName in rooms) {
            const room = rooms[roomName];
            if (room.storage && room.terminal) {
                const terminalEnergyAmount = room.terminal.store["energy"];
                const storageEnergyAmount = room.storage.store["energy"];
        
                // 维护能量任务
                if (storageEnergyAmount >= 20000 && terminalEnergyAmount <= 10000) {
                    carryTask.AddCarryTask(
                        room,
                        "Terminal",
                        room.storage.id,
                        room.terminal.id,
                        6, // 优先级, 越大表示优先程度越高
                        {["energy"]: 10000 - terminalEnergyAmount},
                        "centerCarryTask"
                    );
                    console.log(`<span style='color: yellow;'>[TerminalManager]</span> ${roomName} is transferring energy to terminal.`);
                }
                else{
                    if (terminalEnergyAmount >= 15000) {
                        carryTask.AddCarryTask(
                            room,
                            "Terminal",
                            room.terminal.id,
                            room.storage.id,
                            6, // 优先级, 越大表示优先程度越高
                            {["energy"]: terminalEnergyAmount-15000},
                            "centerCarryTask"
                        );
                    }
                }
            }
        }   

        // Step 2: 在市场上找到价格最高的买单，并卖出超出最大限制的资源
        for (const roomName in rooms) {
            const room = rooms[roomName];
            if(room.memory.cooldown && room.memory.cooldown.marketCheck > 0)
            {
                room.memory.cooldown.marketCheck = room.memory.cooldown.marketCheck - 1;
                continue;
            }
            if (room.terminal && room.memory.overLimitResources) {
                const overLimitResources = room.memory.overLimitResources;
                for (const resourceType in overLimitResources) {
                    // 获取当前资源类型的超出限制数量
                    const excessAmount = overLimitResources[resourceType];

                    // 找到市场上价格最高的买单
                    const orders = Game.market.getAllOrders(order => order.type === ORDER_BUY && order.resourceType === resourceType);
                    if (orders.length > 0) {
                        const highestPriceOrder = _.max(orders, order => order.price);

                        // 计算可以卖出的数量，取超出限制数量和买单需求数量的较小值
                        const amountToSell = Math.min(excessAmount, highestPriceOrder.amount);

                        // 执行交易
                        const result =  Game.market.deal(highestPriceOrder.id, amountToSell, roomName);
                        if (result === OK) {
                            console.log(`Sold ${amountToSell} ${resourceType} at ${highestPriceOrder.price} credits each.`);
                            // 更新超出限制数量
                            room.memory.overLimitResources[resourceType] -= amountToSell;
                        } else {
                            console.log(`Failed to sell ${amountToSell} ${resourceType}: ${result}`);
                            room.memory.cooldown =room.memory.cooldown || {} 
                            room.memory.cooldown.marketCheck = 10;
                        }
                    } else {
                        console.log(`No buy orders found for ${resourceType}.`);
                    }
                }
            }
        }


        // // Step 3: 维护资源从storage到terminal的传输任务
        for (const roomName in rooms) {
            const room = rooms[roomName];
            if (room.storage && room.terminal) {
                for (const resourceType in room.storage.store) {
                    if (resourceType !== "energy" && room.storage.store[resourceType] > 0) {
                        carryTask.AddCarryTask(
                            room,
                            "TerminalToStorage",
                            room.storage.id,
                            room.terminal.id,
                            4, // 优先级, 越大表示优先程度越高
                            { [resourceType]: room.storage.store[resourceType] },
                            "centerCarryTask"
                        );
                        console.log(`<span style='color: yellow;'>[TerminalManager]</span> ${roomName} is transferring ${resourceType} from storage to terminal.`);
                        break; // 同一tick内仅处理第一个符合条件的任务
                    }
                }
            }
        }

        // Step 4: 尝试找到需要资源的房间并发送
        for (const roomName in rooms) {
            if(resourceType == "energy" && roomName != "W58N28")continue;
            const room = rooms[roomName];
            if (room.storage && room.terminal) {
                const terminalAmount = room.terminal.store[resourceType] || 0;
                const storageAmount = room.storage.store[resourceType] || 0;
                const totalAmount = storageAmount + terminalAmount;
                const resourceLimit = resourceLimits[resourceType];
                const resourceKey = resourceKeys[resourceType];

                if (totalAmount < resourceLimit - resourceKey) {
                    // 在其他房间中查找超出上限的资源
                    for (const sourceRoomName in rooms) {
                        const sourceRoom = rooms[sourceRoomName];
                        if (!sourceRoom.controller || !sourceRoom.controller.my || !sourceRoom.storage || !sourceRoom.terminal) {
                            continue; // 跳过不符合条件的房间
                        }
                        if (sourceRoom !== room && sourceRoom.memory.excessResources && sourceRoom.memory.excessResources[resourceType]) {
                            const excessAmount = sourceRoom.memory.excessResources[resourceType];
                            if(excessAmount < resourceKey)continue;//跳过溢出资源过少的房间

                            //不能大于超出数量, 不能大于缺口数量, 不能大于终端剩余容量
                            const sendAmount = Math.min(excessAmount, resourceLimit - totalAmount, sourceRoom.terminal.store.getFreeCapacity()+sourceRoom.terminal.store[resourceType],resourceKey);
                            if(sourceRoom.terminal.store[resourceType] >= sendAmount) {
                                const result = sourceRoom.terminal.send(resourceType, sendAmount, roomName);
                                console.log(`<span style='color: yellow;'>[TerminalManager]</span> Find ${sourceRoomName} sent  ${resourceType} to ${roomName}`);
                                if (result === OK) {
                                    console.log(`<span style='color: green;'>[TerminalManager]</span> ${sourceRoomName} sent ${sendAmount} ${resourceType} to ${roomName}`);
                                } else {
                                    console.log(`<span style='color: red;'>[TerminalManager]</span> ${sourceRoomName} failed to send ${sendAmount} ${resourceType} to ${roomName}. Error: ${result}`);
                                }
                            }
                            else{
                                
                                console.log(`<span style='color: yellow;'>[TerminalManager]</span> Find ${sourceRoomName} prepare  ${resourceType} to ${roomName}`);
                                Memory.OverRoomsTransfer = Memory.OverRoomsTransfer || {}
                                Memory.OverRoomsTransfer.sourceRoomName = sourceRoomName;
                                Memory.OverRoomsTransfer.resourceType = resourceType;
                                carryTask.AddCarryTask(
                                    sourceRoom,
                                    "OverRooms",
                                    sourceRoom.storage.id,
                                    sourceRoom.terminal.id,
                                    5,
                                    {[resourceType] : sendAmount - sourceRoom.terminal.store[resourceType]},
                                    "centerCarryTask");

                            }
                            return; // 发送后立即退出manage过程
                        }
                    }
                    console.log(`<span style='color: red;'>[TerminalManager]</span> Failed to find  ${resourceType} for ${roomName}.`);
                }
                
            }
        }

        
        return;
        
        
    }
};

module.exports = terminalManager;