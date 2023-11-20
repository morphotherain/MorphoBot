var MemoryDataset = {
    roomNames : [],
    roomOutNames : {
        "W55N21":["W55N22"],//,"W54N22","W54N21"
        "W3N53":["W3N54","W2N53","W3N52","W3N55"],//"E53S51",
        "W17N19":["W18N19","W16N19","W17N18","W18N18"],
        "W52N25":["W53N25","W53N24"],
        "E57N34":["E58N34"],
        "W58N27":["W58N28","W59N27"],
        "W58N24":["W59N24"],
        "W53N23":[],
    },
    roomDangerNames : {
        "W55N21":[],//
        "W3N53" :[],//"E53S51",
        "W17N19":[],
        "W52N25":[],
        "E57N34":[],
        "W58N27":[],
        "W58N24":[],
        "W53N23":[],
    },
    roomBuildings : {
        
        "W55N21":{    
            Spawns : ["65657d27663ebc0012dd3aa7","656e855d81bf2c130a713caf","656f4fc40dc02b27ca8d2dc9"],
            Containers : [
                "6566299052ba349f1d378698","656622f18c43c13d5576ec5f",    //sourceContainer
                "656594cf28a707002de6b783",       //upgradeContainer
                "656ad399be528e7b6d9ce8cc",        //mineralContainer
                ""        //extensionContainer
            ],
            Links : ["6567e4472ab3a27f35f3a595",  //centerLink
                "656f3d12fa2c92bbeb5f3652","656feb961cfacad2dcee2423",    //sourceLink
                "",       //upgraderLink
                "65680618f451b6573cf1d893",""],   //OutLink
            Labs : ["656b0bd13ca737d16e4d6474","656b1b8fca0b821e31f9447a","656b29c0fa2c9217f95e285e",
                    "","","",
                    "","","",
                    "",],
            PowerSpawn : "656f69551d3a4e58096ca936",
            Factory : "656f80f90c0db1a3d2aa0504",
            Nuker: "656f908e35eb0a05b449abce",
            Observer : "656f89e4d13bf94da6e59c65",
            Extractor : "656ad4cd83f16e5de5624a30",
            Mineral : "5bbcb11e40062e4259e92b46",
            Source : [""]
        },
        "W17N19":{    
            Spawns : ["65652f94663ebc0012dd2f7c","",""],
            Containers : [
                "656598e030724485cca2f44d","656597076fe3b8400eb2daa9",    //sourceContainer
                "65659dcfc8ea533b861837eb",       //upgradeContainer
                "656c936cff484f2c99ade284",        //mineralContainer
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
            Extractor : "656c99a86b0e8d3fe056930d",
            Mineral : "5bbcb24040062e4259e9381f",
            Source : ["",""]
        },
        "W52N25":{    
            Spawns : ["6565806cd44fa200128d2bce","",""],
            Containers : [
                "6566209712c1700ba7435490","65661c23c8ea536a60185b13",    //sourceContainer
                "656598ce080d79b40dab8b79",       //upgradeContainer
                "656ca7872e3f4633c21735db",        //mineralContainer
                ""        //extensionContainer
            ],
            Links : ["6567d8107e88079744a8ecbd",  //centerLink
                "","",    //sourceLink
                "",       //upgraderLink
                "6567e97872f418c46a33211e",""],   //OutLink
            Labs : ["","","",
                    "","","",
                    "","","",
                    "",],
            PowerSpawn : "",
            Factory : "",
            Nuker: "",
            Observer : "",
            Extractor : "656cadde3947dc7cbead6d9d",
            Mineral : "5bbcb13340062e4259e92c4a",
            Source : ["",""]
        },
        "W3N53":{    
            Spawns : ["655bf6981776170013f49cc8","6565238ead05e43e307b8dcd","656aa3fbb182af4f77070474"],
            Containers : [
                "655c345527b6ed3bca16efd2","655c3cef7a1329762c261973",    //sourceContainer
                "655ec5d5c530ab106cf466a7",       //upgradeContainer
                "65626d2b345cfd7d38dc0352",        //mineralContainer
                ""        //extensionContainer
            ],
            Links : ["655ec4a26c30397ebdad15f6",  //centerLink
                "656b08a96a317c5086e37458","656b0f28c180a945a1ccfb69",    //sourceLink
                "656af352cceacd47753329e3",       //upgraderLink
                "655ee01e4d612a8159d442ac",""],   //OutLink
            Labs : ["65624242bc342f85e9e6379c","6562508a32534e53f9fb623c","656258be26d1c274bb958681",
                    "65654942c2818c4582ffec86","6565557552091612457b10bd","6565625d845a2851f8ef1f05",
                    "656a9bed3947dcfcb2ace2fd","656abd5b889f61562045fe11","656ad967fabd778505192405",
                    "656b0de0e93570f31057a810",],
            PowerSpawn : "656ae97d8c0b85d8969936fb",
            Factory : "65653c7e7af288e73312992f",
            Nuker: "656b514f1d3a4e20126b94d5",
            Observer : "656aa844bc60b962297829ab",
            Extractor : "65627108dd101075aafac73d",
            Mineral : "5bbcb2b240062e4259e93ca5",
            Source : ["",""]
        },
        "E57N34":{    
            Spawns : ["656160956292b80012ef04e8","",""],
            Containers : [
                "6561ca2e91257433ed5fe79e","6561b76d10f1cb3835c1b08e",    //sourceContainer
                "6561ab976c310dea3aee3dd5",       //upgradeContainer
                "6568362a3e4b0720799aa70c",        //mineralContainer
                ""        //extensionContainer
            ],
            Links : ["65654d92ceed4b652c863bde",  //centerLink
                "","",    //sourceLink
                "",       //upgraderLink
                "",""],   //OutLink
            Labs : ["65686ee6dd1cbd7815eec436","65687ae796a889495866ac51","65688681a1e06d63eeb3b1d5",
                    "","","",
                    "","","",
                    "",],
            PowerSpawn : "",
            Factory : "",
            Nuker: "",
            Observer : "",
            Extractor : "656845106af6dc7a4fb03005",
            Mineral : "5bbcb71ad867df5e54207d2c",
            Source : ["",""]
        },
        "W58N24":{    
            Spawns : ["65695d34a9cfa60276521b0c","",""],
            Containers : [
                "6569f0f4e935700269575ee3","6569f5a4080d790828aca0bb",    //sourceContainer
                "6569ff2d9f7ae0f52669423b",       //upgradeContainer
                "657160b7fbb33f2e0be0b477",        //mineralContainer
                ""        //extensionContainer
            ],
            Links : ["65713ff6fdc4e13255bf1f0b",  //centerLink
                "65714186f73fe8369b91764c","657143af2f5e58607341edaa",    //sourceLink
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
            Extractor : "6571624bcc37a77b71fc0885",
            Mineral : "5bbcb10640062e4259e92a2f",
            Source : ["",""]
        }, 
        "W58N27":{    
            Spawns : ["656941ec42e4505ca596ba98","",""],
            Containers : [
                "6569cc307661a4fbd59da421","6569d6ef889f61694e45c20b",    //sourceContainer
                "6569d2f3eed957517c9a1e5d",       //upgradeContainer
                "6570231dbc66262f4043ff97",        //mineralContainer
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
            Extractor : "65703a9c141b4816072556b4",
            Mineral : "5bbcb10640062e4259e92a2c",
            Source : ["",""]
        }, 
        "W53N23":{    
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
        },
    },
    getMyRooms:function() {
        let myRooms = [];
        for (let roomName in Game.rooms) {
            const room = Game.rooms[roomName];
            if (room.controller && room.controller.my) {
                myRooms.push(roomName);
                //if(!Memory.roomBuildings)Memory.roomBuildings = {};
                if(!Memory.roomOutNames)Memory.roomOutNames = {};
                //if(this.roomBuildings[roomName])
                //    Memory.rooms[roomName].buildings = this.roomBuildings[roomName];
                if(this.roomOutNames[roomName])
                    Memory.roomOutNames[roomName] = this.roomOutNames[roomName];

            }
        }
        return myRooms;
    }
}
module.exports = MemoryDataset