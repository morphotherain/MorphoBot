// terminalManager.js

const logger = require('mylog');

var terminalManager =
{
    manage: function (terminal) {
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
        
        // ...（其他资源的最优化处理）
        // ...
    }
};

module.exports = terminalManager;