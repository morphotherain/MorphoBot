// terminalManager.js

const logger = require('mylog');
var carryTask = require('carryTask')

var terminalManager =
{
    resourceLimits: {
        'H': 5000,
        'L': 5000,
        // 继续添加其他资源及其下限
    },
    resourceKeys: {
        'H': 1000,
        'L': 1000,
        // 继续添加其他资源及其下限
    },
    manage: function () {
        const rooms = Game.rooms;
        
        // Step 1: 维护每个房间超出上限的资源类型
        for (const roomName in rooms) {
            const room = rooms[roomName];
            if (room.storage && room.terminal) {
                room.memory.excessResources = room.memory.excessResources || {};
                for (const resourceType in this.resourceLimits) {
                    const terminalAmount = room.terminal.store[resourceType] || 0;
                    const storageAmount = room.storage.store[resourceType] || 0;
                    const totalAmount = storageAmount + terminalAmount;
                    const resourceLimit = this.resourceLimits[resourceType];

                    if (totalAmount > resourceLimit) {
                        room.memory.excessResources[resourceType] = totalAmount - resourceLimit;
                    } else {
                        delete room.memory.excessResources[resourceType];
                    }
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

        // Step 4: 维护资源从terminal到storage的传输任务
        for (const roomName in rooms) {
            const room = rooms[roomName];
            if (room.storage && room.terminal) {
                for (const resourceType in room.terminal.store) {
                    if (resourceType !== "energy" && room.terminal.store[resourceType] > 0) {
                        carryTask.AddCarryTask(
                            room,
                            "TerminalToStorage",
                            room.terminal.id,
                            room.storage.id,
                            4, // 优先级, 越大表示优先程度越高
                            { [resourceType]: room.terminal.store[resourceType] },
                            "centerCarryTask"
                        );
                        console.log(`<span style='color: yellow;'>[TerminalManager]</span> ${roomName} is transferring ${resourceType} from terminal to storage.`);
                        break; // 同一tick内仅处理第一个符合条件的任务
                    }
                }
            }
        }

        // Step 3: 尝试找到需要资源的房间并发送
        for (const roomName in rooms) {
            const room = rooms[roomName];
            if (room.storage && room.terminal) {
                for (const resourceType in this.resourceLimits) {
                    const terminalAmount = room.terminal.store[resourceType] || 0;
                    const storageAmount = room.storage.store[resourceType] || 0;
                    const totalAmount = storageAmount + terminalAmount;
                    const resourceLimit = this.resourceLimits[resourceType];
                    const resourceKey = this.resourceKeys[resourceType];

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
                                const sendAmount = Math.min(excessAmount, resourceLimit - totalAmount, sourceRoom.terminal.store.getFreeCapacity()+sourceRoom.terminal.store[resourceType]);
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
        }

        
        return;
        var terminal = Game.rooms[roomName].terminal
        if(!terminal || Game.time%100 != 0)return;
        // 用户定义的规则
        const ORDER_RULES = {
            'O': {
                amount: 10000,
                sell: true,
                price: 60,
                useExistingOrder: true, // 新增参数，用于决定是使用现有订单还是创建新订单
            },
            'XGH2O': {
                amount: 50000,
                buy: true,
                price: 492,
                useExistingOrder: false,
            }
            // ...（其他资源的规则）
        };

        // 处理每种资源的规则
        for (let resourceType in ORDER_RULES) {
            const rule = ORDER_RULES[resourceType];
            const availableAmount = terminal.store[resourceType] || 0;
            // 卖出逻辑
            if (rule.sell && availableAmount >= rule.amount) {
                if (rule.useExistingOrder) {
                    // 找到市场上最合适的订单并接受它
                    const orders = Game.market.getAllOrders(order => order.resourceType === resourceType && order.type === ORDER_BUY && order.price >= rule.price);
                    const bestOrder = _.max(orders, o => o.price);
                
                    // 确保找到了最佳订单
                    if (bestOrder && bestOrder.id && bestOrder.price && !terminal.cooldown) {
                        const amountToSell = Math.min(rule.amount, availableAmount);
                        Game.market.deal(bestOrder.id, amountToSell, terminal.room.name);
                        logger.info(`[Terminal] Selling ${amountToSell} of ${resourceType} to order ${bestOrder.id} at price ${bestOrder.price}`);
                    } else {
                        logger.info(`[Terminal] No suitable buy order found for ${resourceType} at price ${rule.price} or higher.`);
                    }
                } else {
                    // 创建新订单
                    const pre_existingOrder = _.find(Game.market.orders, o => o.resourceType === resourceType && o.type === ORDER_SELL);
                    if(pre_existingOrder && pre_existingOrder.remainingAmount < rule.amount)
                        Game.market.extendOrder(pre_existingOrder.id, rule.amount - pre_existingOrder.remainingAmount);
                    const existingOrder = _.find(Game.market.orders, o => o.resourceType === resourceType && o.type === ORDER_SELL && o.remainingAmount  != 0);
                    if (!existingOrder && !terminal.cooldown) {
                        Game.market.createOrder({
                            type: ORDER_SELL,
                            resourceType: resourceType,
                            price: rule.price,
                            totalAmount: rule.amount,
                            roomName: terminal.room.name
                        });
                        logger.info(`[Terminal] Created a sell order for ${resourceType} at price ${rule.price}`);
                    } else if (existingOrder) {
                        logger.info(`[Terminal] Existing sell order found for ${resourceType}, not creating a new one.`);
                    }
                }
            }

            // 买入逻辑
            if (rule.buy && (terminal.store.getFreeCapacity() > rule.amount || availableAmount < rule.amount)) {
                if (rule.useExistingOrder) {
                    // 找到市场上最合适的订单并接受它
                    const orders = Game.market.getAllOrders(order => order.resourceType === resourceType && order.type === ORDER_SELL && order.price <= rule.price);
                    const bestOrder = _.min(orders, o => o.price);
            
                    // 确保找到了最佳订单
                    if (bestOrder && bestOrder.id && bestOrder.price && !terminal.cooldown) {
                        const amountToBuy = Math.max(rule.amount - availableAmount, 0);
                        Game.market.deal(bestOrder.id, amountToBuy, terminal.room.name);
                        logger.info(`[Terminal] Buying ${amountToBuy} of ${resourceType} from order ${bestOrder.id} at price ${bestOrder.price}`);
                    } else {
                        logger.info(`[Terminal] No suitable sell order found for ${resourceType} at price ${rule.price} or lower.`);
                }
                } else {
                    // 创建新订单
                    const pre_existingOrder = _.find(Game.market.orders, o => o.resourceType === resourceType && o.type === ORDER_BUY);

                    if(pre_existingOrder && pre_existingOrder.remainingAmount < rule.amount && pre_existingOrder.price === rule.price){
                        Game.market.extendOrder(pre_existingOrder.id, (rule.amount/100) - pre_existingOrder.remainingAmount);

                        return
                    }
                    const existingOrder = _.find(Game.market.orders, o => o.resourceType === resourceType && o.type === ORDER_BUY && o.price === rule.price);
                    if (!existingOrder && !terminal.cooldown) {
                        Game.market.createOrder({
                            type: ORDER_BUY,
                            resourceType: resourceType,
                            price: rule.price,
                            totalAmount: rule.amount/100,
                            roomName: terminal.room.name
                        });
                        logger.info(`[Terminal] Created a buy order for ${resourceType} at price ${rule.price}`);
                    } else if (existingOrder) {
                        logger.info(`[Terminal] Existing buy order found for ${resourceType}, not creating a new one.`);
                    }
                }
            }

        }
        
    }
};

module.exports = terminalManager;