
const logger = require('mylog');
/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('Init');
 * mod.thing == 'a thing'; // true
 */
var RoomInit = 
{
    InitAll : function(roomName){
        this.InitStructures(roomName,STRUCTURE_CONTAINER)
        this.InitStructures(roomName,STRUCTURE_FACTORY)
        this.InitStructures(roomName,STRUCTURE_LAB)
        this.InitStructures(roomName,STRUCTURE_LINK)
        this.InitStructures(roomName,STRUCTURE_SPAWN)
        this.InitStructures(roomName,STRUCTURE_TOWER)
        this.InitStructures(roomName,STRUCTURE_ROAD)
        this.InitStructures(roomName,STRUCTURE_EXTENSION)

        
        this.InitObject(roomName,FIND_SOURCES)
        this.InitObject(roomName,FIND_CONSTRUCTION_SITES)
        this.InitObject(roomName,FIND_FLAGS)
    },
   

    InitStructures : function(roomName,StructureType)
    {
        //如果memory中不存在就进行创建
        if(Game.rooms[roomName].memory.structures == undefined)
        Game.rooms[roomName].memory.structures = {}

        var structures = Game.rooms[roomName].find(FIND_STRUCTURES, {
            filter: { structureType: StructureType }})
        Game.rooms[roomName].memory.structures[StructureType] = [] 
        for(const structure of structures) {
            Game.rooms[roomName].memory.structures[StructureType].push(structure.id)
        }
    },
    InitObject : function(roomName,ObjectType)
    {
        //如果memory中不存在就进行创建
        if(Game.rooms[roomName].memory.objects == undefined)
        Game.rooms[roomName].memory.objects = {}

        var objects = Game.rooms[roomName].find(ObjectType)
        Game.rooms[roomName].memory.objects[ObjectType] = [] 
        for(const object of objects) {
            Game.rooms[roomName].memory.objects[ObjectType].push(object.id)
        }
    },
    getObjectID : function(roomName,ObjectType)
    {
        var objects = Game.rooms[roomName].find(ObjectType)
        var ObjectID = [] 
        for(const object of objects) {
            ObjectID.push(object.id)
        }
        return ObjectID
    },
    getStructureID : function(roomName,StructureType)
    {
        var structures = Game.rooms[roomName].find(FIND_MY_STRUCTURES, {
            filter: { structureType: StructureType }
        });
        var structureID = [] 
        for(const structure of structures) {
            structureID.push(structure.id)
        }
        return structureID
    },
    GetStructuresID : function(roomName,StructureType)
    {
        if(Game.rooms[roomName].memory.structures == undefined)
            InitAll(roomName)
        if(Game.rooms[roomName].memory.structures[StructureType] == undefined)
            this.InitStructures(roomName,StructureType)
        return Game.rooms[roomName].memory.structures[StructureType]
    },
    GetObjectsID : function(roomName,ObjectType)
    {
        if(Game.rooms[roomName].memory.objects == undefined)
            InitAll(roomName)
        if(Game.rooms[roomName].memory.objects[ObjectType] == undefined)
            this.InitObject(roomName,ObjectType)
        return Game.rooms[roomName].memory.objects[ObjectType]
    }
} 



module.exports = RoomInit;