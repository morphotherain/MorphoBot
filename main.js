var RoomInit = require('Init')
var utils = require('util')
var dataset = require('data')
var MemoryDataset = require('MemorySystem')


const logger = require('mylog');

var runSource = require('runSource')
var runSpawn = require('runSpawn')
var runController = require('runController')
var runBuilder = require('runBuilder')
var runOutSource = require('runOutSource')
var runDangerSource = require('runDangerSource')
var runReserver = require('runReserver')
var runAttack = require('runAttack')
var runTools = require('runTools')

var military = require('military');

const expansionManager = require('./expansionManager');
const terminalManager = require('runTerminal');
const buildingMgr = require('buildingMgr');
var creepMgr = require('creepManagers')

var runTower = require('runTower')
const runLinks = require('runLinks');
var minerManager = require('runExtrator');


const roomRefuge = require('roomRefuge')



module.exports.loop  = function(){


  if(Game.cpu.generatePixel)
  Game.cpu.generatePixel()


  //-------------------------------------------------------------------------------------
	//房间布局
	//-------------------------------------------------------------------------------------
  //console.log(Game.time) 
  var RoomsDictionary = {}
  var MainRooms = MemoryDataset.getMyRooms()

  if (Game.time % 1500 === 0) {
    cleanUpCreepMemory();
  }
  
  if(!Memory.lowEnergyTime)Memory.lowEnergyTime = {};
  Memory.level = {}

  for(const roomName of MainRooms)
  {
    if(roomName == "W55N22" ||roomName == "W54N22" ||roomName == "W54N21" ||roomName == "W53N25" ||roomName == "E53S51")
      continue;


    try{
      buildingMgr.run(roomName)
    }
    catch(err){console.log(err)}
  
    activateDefense(Game.rooms[roomName])
    console.log(roomName)

    var memory = Game.rooms[roomName].memory
    memory.spawn = {}
    memory.spawn.priority = 0;

    Memory.level[roomName] = utils.getRoomLevel(roomName)

    console.log("level",Memory.level[roomName])

    if(!Memory.lowEnergyTime[roomName])Memory.lowEnergyTime[roomName] = {time : 0};
    if(!Memory.level[roomName] < 6 && Game.rooms[roomName].energyAvailable<550) Memory.lowEnergyTime[roomName].time++;
    if(!Memory.level[roomName] < 6 && Game.rooms[roomName].energyAvailable>=550 ) Memory.lowEnergyTime[roomName].time = 0;
    if(Memory.level[roomName] != 0 && !Memory.level[roomName] < 6 && Memory.lowEnergyTime[roomName].time>500) Memory.level[roomName] = 1;

    if(!Memory.level[roomName] >= 6 && Game.rooms[roomName].energyAvailable<=1500) Memory.lowEnergyTime[roomName].time++;
    if(!Memory.level[roomName] >= 6 && Game.rooms[roomName].energyAvailable> 1500 ) Memory.lowEnergyTime[roomName].time = 0;
    if(!Memory.level[roomName] >= 6 && Memory.lowEnergyTime[roomName].time>200) Memory.level[roomName] = 5;


    console.log("levelaf",Memory.level[roomName])

    if(roomName == "W52N25"){
      attackCore("W53N26")
      attackCore("W53N24")
      //runReserver.run(roomName,"W53N24")
      //runReserver.run(roomName,"W53N26")
    }
    if(roomName == "W55N21"){
      attackCore("W54N22")
      //runReserver.run(roomName,"W54N22")
      //runReserver.run(roomName,"W53N26")
    }


    //console.log("=========================================  "+roomName+"  ==========================================")
  
    creepMgr.run(roomName)

    runSource.run(roomName);
    runBuilder.run(roomName);
    runController.run(roomName);
    runTower.run(roomName);

    try { runLinks.run(Game.rooms[roomName]);}   catch (error) 
      { console.log('Error in manageLinks:', error);}
      
    try { minerManager.run(Game.rooms[roomName]);}   catch (error) 
      { console.log('Error in runExtrator:', error);}

    try { var room = Game.rooms[roomName];
      military.run(room);
    }   catch (error) 
      { console.log('Error in military:', error);}

    try{const room = Game.rooms[roomName];
        if (room.terminal && room.terminal.my && Game.time%100==0) {
            ;//terminalManager.manage(room.terminal);
    }}  catch (error) { console.log('Error in terminalManager:', error);}

    runTools.run(roomName);
    var roomOutNames;
    if(MemoryDataset.roomOutNames[roomName])
      roomOutNames = MemoryDataset.roomOutNames[roomName]
    else
      roomOutNames = utils.findMiningRooms(roomName)
    for(const roomOutName of roomOutNames) {

      if(!Game.rooms[roomOutName])
      {
        if (Memory.outpostStatus && Memory.outpostStatus[roomOutName] > 0)
        {
          runAttack.run(roomName,roomOutName);
        }
      }

      runOutSource.run(roomName, roomOutName);
      runReserver.run(roomName, roomOutName);
    }

    if(MemoryDataset.roomDangerNames[roomName])
    for(const roomDangerName of MemoryDataset.roomDangerNames[roomName]) {
      try {
        runDangerSource.run(roomName,roomDangerName)
      } catch (error) {
          console.log('Error in runDangerSource:', error);
      }
    }



    try {
      roomRefuge.checkAndEvacuate(MemoryDataset.roomOutNames[roomName],roomName)
    } catch (error) {
        console.log('Error in roomRefuge:', error);
    }


    try {
      expansionManager.manageExpansion(roomName);
    } catch (error) {
        console.log('Error in manageExpansion:', error);
    }


    runSpawn.run(roomName);
    //console.log("priority  "+memory.spawn.priority)
  

    
    //initMemory();
    //recordEnergy(roomName);

  
    //if(roomName == "E56S52")
    //  carry()
  }
  //if ((Game.flags["监视显示"].pos.y == Game.flags["On"].pos.y)) {
  //  drawProgress(roomName);
  //}
  //var num = 0;
  //for(const name in Game.creeps)
  //{
  //  num++
    //var creep = Game.creeps[name];
    //if ((Game.flags["位置显示"].pos.y == Game.flags["On"].pos.y)) 
    //  new RoomVisual(creep.room).text(creep.name,creep.pos, {color: 'orange', font: 0.8}); 
  //}
  //console.log("爬爬总数"+num)
  // 每1000 ticks打印一次统计信息
  //if (Game.time % 1000 === 0 || 
  //  (Game.flags["能量统计"].pos.y == Game.flags["On"].pos.y)) {
  //  printEnergyStats();
  //}
}




const INTERVAL = 1500 ;

function initMemory() {
  if (!Memory.stats) {
    Memory.stats = {
      energy: [],
      lastRecordTick: Game.time,
    };
  }
}

function recordEnergy(roomName) {
  const storage = Game.rooms[roomName].storage;
  if (!storage) return;

  const currentTick = Game.time;
  const energy = storage.store[RESOURCE_ENERGY];
  const lastRecordTick = Memory.stats.lastRecordTick;

  if (currentTick - lastRecordTick >= INTERVAL) {
    Memory.stats.energy.push({
      tick: currentTick,
      energy: energy,
    });
    Memory.stats.lastRecordTick = currentTick;

    // 可选：限制记录的数量，防止Memory过大
    if (Memory.stats.energy.length > 100) {
      Memory.stats.energy.shift();
    }
  }
}

function cleanUpCreepMemory() {
  for (var name in Memory.creeps) {
      if (!Game.creeps[name]) {
          delete Memory.creeps[name];
          console.log('清除不存在的Creep内存:', name);
      }
  }
}


function printEnergyStats() {
  console.log('Tick | Energy | Delta | Rate');
  console.log('--------------------');

  const energyStats = Memory.stats.energy;
  var beg = 1
  if(energyStats.length>10)
    beg = energyStats.length-10
  for (let i = beg; i < energyStats.length; i++) {

    const prev = energyStats[i - 1];
    const curr = energyStats[i];
    const delta = curr.energy - prev.energy;
    const rate = delta / INTERVAL;
    console.log(`${curr.tick} | ${curr.energy} | ${delta > 0 ? '+' : ''}${delta} | ${rate.toFixed(1)}/t`);
  }
  console.log('----当前时刻'+Game.time+'---------');

}


function repairMostDamagedCreep(squadMembers) {
  // 找出受伤最严重的Creep
  let mostDamagedCreep = _.min(squadMembers, (creep) => creep.hits / creep.hitsMax);
  if (mostDamagedCreep.hits === mostDamagedCreep.hitsMax) {
      return; // 如果没有受伤的Creep，则不执行修复操作
  }

  // 让每个有修复能力的Creep去修复它
  _.forEach(squadMembers, (creep) => {
  if (creep.getActiveBodyparts(HEAL) > 0) {
      if (creep.pos.isNearTo(mostDamagedCreep)) {
      creep.heal(mostDamagedCreep);
      } else if (creep.pos.inRangeTo(mostDamagedCreep, 3) && false) {
      creep.rangedHeal(mostDamagedCreep);
      }
  }
  });
}

function runTowerEnergy()
{
  
  for(var i = 0;i<2;i++) {
    var tripname = (i==0)?"trip":"trip1"
    var healername = (i==0)?"healer":"healer1"
    var trip = Game.creeps[tripname]
    var healer = Game.creeps[healername]
    if(trip && healer)
    {
      console.log("当前房间："+trip.room.name + " 当前血量："+trip.hits+"/"+trip.hitsMax)
  
      if(trip.hits <= 600 && trip.room.name == "W12N9")
        trip.moveTo(Game.flags["healpoint"]),console.log("move To healer")
  
      if(trip.hits == trip.hitsMax  && trip.room.name == "W13N9")
        trip.moveTo(Game.flags[tripname]),console.log("move To trip")
  
      if(trip.hits > 600  && trip.room.name == "W12N9")
        trip.moveTo(Game.flags[tripname]),console.log("move To trip")
  
      if(trip.hits != trip.hitsMax  && trip.room.name == "W13N9")
        trip.moveTo(Game.flags["healpoint"]),console.log("move To healer")
      
      if(trip.room.name == "W13N8")
        trip.moveTo(Game.flags["healpoint"])
    }
    else{
      if(false)
      if(Game.spawns["Spawn1"].spawnCreep([TOUGH,MOVE,TOUGH,MOVE,TOUGH,MOVE,TOUGH,MOVE,TOUGH,MOVE,TOUGH,MOVE,TOUGH,MOVE,TOUGH,MOVE,TOUGH,MOVE,TOUGH,MOVE,TOUGH,MOVE,TOUGH,MOVE],tripname)==0)
        return;
    }
    if(healer || false)
    {
      var c1 =  Game.creeps["trip"]
      var c2 =  Game.creeps["trip1"]
      healer.moveTo(Game.flags[healername])
      healer.heal(c1)
      healer.heal(c2)
    }
    else
    {
      if(false)
      if(Game.spawns["Spawn1"].spawnCreep([HEAL,HEAL,HEAL,HEAL,MOVE,MOVE,MOVE,MOVE,HEAL,HEAL,MOVE,MOVE],healername)==0)
        return;
    }
    }
}

var carry = function(){
  const CREEP_ROLE = 'carrier';
  var num = 2;

  for (let i = 1; i <= num; i++) {
      let name = CREEP_ROLE + i;
      if (!Game.creeps[name]) {
          Game.spawns['Spawn1'].spawnCreep(
              [MOVE, MOVE, MOVE, MOVE, MOVE,
                MOVE, MOVE, MOVE, MOVE, MOVE,
                 CARRY, CARRY, CARRY, CARRY, 
                 CARRY, CARRY, CARRY, CARRY, 
                 CARRY, CARRY],// 
              name,
              { memory: { role: CREEP_ROLE, working: false } }
          );
      }
  }
for (let i = 1; i <= 2; i++) {

    let creep = Game.creeps[CREEP_ROLE + i];
    if (creep) {
        if (creep.memory.working && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.working = false;
        }
        if (!creep.memory.working && creep.store.getFreeCapacity() == 0) {
            creep.memory.working = true;
        }

        if (creep.memory.working) {
          var Bcreep = Game.creeps["Builder00"];
          if(Bcreep)
          {
              if(creep.transfer(Bcreep,RESOURCE_ENERGY)==ERR_NOT_IN_RANGE)
                creep.moveTo(Bcreep);
              return;
          }
          if(creep.transfer(Game.getObjectById("655eab7e786fa02a85356016"),RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
            creep.moveTo(Game.getObjectById("655eab7e786fa02a85356016"))
        } 
        else {
          let flag = Game.flags['LinkFlag'];
          if (flag) {
              if(creep.room.name != "E55S53")
                creep.moveTo(flag,{
                  costCallback: function(roomName, costMatrix) {
                    costMatrix.set(2, 27, 0);

                    costMatrix.set(12, 35, 0);
                }
                })
              // 查找最近的掉落能量或者 Ruin 中的能量
              let target
              if(Game.rooms["E55S53"])
                target = Game.getObjectById("655e27b10cae23fb74e667cc")

          
              // 优先检查掉落的能量
              if (target ) {
                  if (creep.withdraw(target,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                     creep.moveTo(target,{visualizePathStyle:{},reusePath:50});
                  }
              }
          }
        }
    }
  }
}

var build = function(creep){
  if(creep == undefined) {return;}

  const target = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
  if(target) {
      if(creep.build(target) == ERR_NOT_IN_RANGE) {
          creep.moveTo(target);
      }
      else
      {
        //creep.moveTo(Game.flags[flag_build_name[theRoomName]])  
      }
   } 
  else{

  }
  //creep.moveTo(Game.flags['Flag1'])
 }

 function activateDefense(room) {
  // 获取房间中的敌对 Creeps
  let hostiles = room.find(FIND_HOSTILE_CREEPS, {
      filter: (creep) => {
          // 确保敌人不是 NPC
          return !creep.owner || creep.owner.username !== 'Source Keeper' && creep.owner.username !== 'Invader';
      }
  });

  // 检查是否有具备攻击能力的敌对 Creeps
  let hostileAttackers = hostiles.some(creep => 
      creep.getActiveBodyparts(ATTACK) > 0 || 
      creep.getActiveBodyparts(RANGED_ATTACK) > 0 || 
      creep.getActiveBodyparts(WORK) > 0
  );

  // 如果检测到具备攻击能力的敌对 Creeps，则启动 Safe Mode
  if (hostileAttackers && room.controller && room.controller.safeModeAvailable && !room.controller.safeModeCooldown) {
      room.controller.activateSafeMode();
      console.log('Safe Mode activated in room ' + room.name);
  }
}

var attackCore = function(roomName)
{
  var creep = Game.creeps["attackCore"+roomName]
  console.log("attack Core Beg",creep)
  if(creep)
  {
    
    var Core = creep.pos.findClosestByRange(FIND_STRUCTURES,{filter:(structure)=>structure.structureType == "invaderCore"});
    
    console.log("attack Core Beg",Core)
    if(Core)
    {
      var res = creep.attack(Core);
      console.log("attack Core",res)
      if(res == ERR_NOT_IN_RANGE)
        creep.moveTo(Core)
    }
    else
    {
      creep.moveTo(new RoomPosition(16,40,roomName))
    }
  }
  else
  {
    Game.spawns['Spawn1'].spawnCreep(
      [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
      ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,],// 
      "attackCore"+roomName,
      { memory: {  working: false } }
  );
  }
}

global.removeAllRoadConstructionSites = function(roomName) {
  const room = Game.rooms[roomName];
  if (!room) {
      console.log('房间未找到:', roomName);
      return;
  }

  const constructionSites = room.find(FIND_CONSTRUCTION_SITES);

  constructionSites.forEach(site => {
      if (site.structureType === STRUCTURE_ROAD) {
          site.remove();
      }
  });
};

