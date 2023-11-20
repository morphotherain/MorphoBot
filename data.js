var dataset =
{
    bodycosts :
    {
        WORK  : 100,
        CARRY : 50,
        MOVE : 50,
        CLAIM : 600,
        ATTACK : 80,
        RANGED_ATTACK : 150,
        HEAL : 250,
        TOUGH : 10,
    },

    createCreepBodys : function(creepBodys)
    {
        var bodys = []
        var types = creepBodys
        for(const body in types)
        {
            for(var i = 0; i < types[body];i++)
            {
                bodys.push(body)
            }        
        }
        return bodys
    },
    getCreepCosts : function(creepBodys)
    {
        var costs = 0
        for(const body of creepBodys)
        {
            costs += this.bodycosts[body]
        }
        return costs
    },
    getCreepTimeCosts : function(creepBodys)
    {
        var costs = creepBodys.length*3
        return costs
    },
    
}

module.exports = dataset