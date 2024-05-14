var utils = require('util')
var MemoryDataset = require('MemorySystem')

var runSource = require('runSource')
var runSpawn = require('runSpawn')
var runController = require('runController')
var runBuilder = require('runBuilder')
var runOutSource = require('runOutSource')
var runDangerSource = require('runDangerSource')
var runReserver = require('runReserver')
var runAttack = require('runAttack')
var runTools = require('runTools')
var runTower = require('runTower')
var runLinks = require('runLinks');
var runLabs = require('runLabs');

var expansionManager = require('./expansionManager');
var terminalManager = require('runTerminal');
var buildingMgr = require('buildingMgr');
var creepMgr = require('creepManagers')
var minerManager = require('runExtrator');

var military = require('military');
var roomRefuge = require('roomRefuge')



module.exports.loop  = function(){

  Game.cpu.generatePixel()

  var MainRooms = MemoryDataset.getMyRooms()

  if (Game.time % 1500 === 0) {
    cleanUpCreepMemory();
  }
  
  if(!Memory.lowEnergyTime)Memory.lowEnergyTime = {};
  Memory.level = {}
  try{terminalManager.manage()}  catch (error) { console.log('Error in terminalManager:', error)}

  for(const roomName of MainRooms)
  {

    var memory = Game.rooms[roomName].memory
    memory.spawn = {}
    memory.spawn.priority = 0;
    
    lowEnergyRecord(roomName);


    //console.log("=========================================  "+roomName+"  ==========================================")
    try{buildingMgr.run(roomName)}catch(err){console.log("buildingMgr"+err)}
    try{creepMgr.run(roomName)}catch(err){console.log("creepMgr"+err)}
    try{runSource.run(roomName)}catch(err){console.log("runSource"+err)}
    try{runBuilder.run(roomName)}catch(err){console.log("runBuilder"+err)}
    try{runController.run(roomName)}catch(err){console.log("runController"+err)}
    try{runTower.run(roomName)}catch(err){console.log("runTower"+err)}
    try{runLinks.run(roomName)}catch (error){console.log("runLinks"+error)}
    try{runLabs.run(roomName)}catch (error){console.log("runLabs"+error)}
    try{minerManager.run(roomName)}catch(error){console.log("minerManager"+error)}
    try{military.run(roomName)}catch (error){console.log("military"+error)}
    try{runTools.run(roomName)}catch(error){console.log("runTools"+error)}
    try{expansionManager.manageExpansion(roomName);}catch(error){console.log(error)}
    try{runOutMining(roomName)}catch(error){console.log("runOutMining"+error)}

    if(MemoryDataset.roomDangerNames[roomName])
    for(const roomDangerName of MemoryDataset.roomDangerNames[roomName]) {
      try {runDangerSource.run(roomName,roomDangerName)}catch(error) {console.log(error)}
    }

    //最后处理所有孵化请求
    try{runSpawn.run(roomName);}catch(error){console.log("runSpawn"+error)}
    
  }
}

function runOutMining(roomName)
{
  var roomOutNames;
  if(MemoryDataset.roomOutNames[roomName])
    roomOutNames = MemoryDataset.roomOutNames[roomName]
  else{
    var memory = Game.rooms[roomName].memory
    if(!memory.roomOutNames)
    {
      roomOutNames = utils.findMiningRooms(roomName)
      memory.roomOutNames = roomOutNames
    }
    else
    {
      roomOutNames = memory.roomOutNames;
    }
  }
  for(const roomOutName of roomOutNames) {
    try{runOutSource.run(roomName, roomOutName);}catch(error){console.log(error);}
    try{runReserver.run(roomName, roomOutName);}catch(error){console.log(error);}
  }
  try {runAttack.run(roomOutNames,roomName);}catch(error){console.log(error);}
  try {roomRefuge.checkAndEvacuate(roomOutNames,roomName)}catch(error){console.log(error);}
}

function cleanUpCreepMemory() {
  for (var name in Memory.creeps) {
      if (!Game.creeps[name]) {
          delete Memory.creeps[name];
          console.log('清除不存在的Creep内存:', name);
      }
  }
}

function lowEnergyRecord(roomName){
  Memory.level[roomName] = utils.getRoomLevel(roomName)

  if(!Memory.lowEnergyTime[roomName])Memory.lowEnergyTime[roomName] = {time : 0};
  if(!Memory.level[roomName] < 6 && Game.rooms[roomName].energyAvailable<550) Memory.lowEnergyTime[roomName].time++;
  if(!Memory.level[roomName] < 6 && Game.rooms[roomName].energyAvailable>=550 ) Memory.lowEnergyTime[roomName].time = 0;
  if(Memory.level[roomName] != 0 && !Memory.level[roomName] < 6 && Memory.lowEnergyTime[roomName].time>500) Memory.level[roomName] = 1;

  if(!Memory.level[roomName] >= 6 && Game.rooms[roomName].energyAvailable<=1500) Memory.lowEnergyTime[roomName].time++;
  if(!Memory.level[roomName] >= 6 && Game.rooms[roomName].energyAvailable> 1500 ) Memory.lowEnergyTime[roomName].time = 0;
  if(!Memory.level[roomName] >= 6 && Memory.lowEnergyTime[roomName].time>200) Memory.level[roomName] = 5;

}
