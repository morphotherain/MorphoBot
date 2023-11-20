var creepManage = 
{
    builder :
    {
        buildersNum : 0,
        carriersNum : 0,
        update : function(roomName)
        {
            var memory = Game.rooms[roomName].memory
            memory.builder.buildersNum = this.buildersNum
            memory.builder.carriersNum = this.carriersNum
        },

        priority:12
    },
    carrierForBuilder :{
        priority:11
    },
    controller :
    {
        upgradersNum : 0,
        carriersNum : 0,
        update : function(roomName)
        {
            this.process(roomName)
            var memory = Game.rooms[roomName].memory
            memory.controller.upgradersNum = this.upgradersNum
            memory.controller.carriersNum = this.carriersNum
        },
        process : function(roomName)
        {
            
        },
        priority:0
    },
    attacker :
    {
        attackersNum :1,
        update : function(roomName)
        {
            this.process(roomName)
            var memory = Game.rooms[roomName].memory
            memory.attacker.attackersNum = this.attackersNum
        },
        process : function(roomName)
        {
            
        },
        priority:15
    },
    repairer :{
        priority:10
    },
    reserver :{
        priority:1
    },
    carrierForUpgrade :{
        priority:7
    },
    upgraders :{
        priority:6
    },
    harvertsOutside :{
        priority:4
    },
    carrierOutside :{
        priority:3
    },
    harvests :{
        priority:36
    },
    carriers :{
        priority:35
    },
    Ecarriers :{
        priority:40
    },
    expansionBuilder :{
        priority:21
    },
    expansionClaimer :{
        priority:21
    },
    Linker:{
        priority:18
    },
    harvestForMineral:{
        priority:12
    },
    carrierForMineral:{
        priority:11
    },
    
}

module.exports = creepManage;