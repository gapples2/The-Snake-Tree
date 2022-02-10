const boardColors = ["#ffffff","#00ff00","#ff0000"]
addLayer("s", {
    name: "snake", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "S", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		    points: new Decimal(0),
        total: new Decimal(0),
        currentTime: 0,
        di: 0,
        snake:[[4,4]],
        died:false,
        board: [[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],[0,0,0,0,1,0,0,0,0],[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0]],
        firstLoad: true
    }},
    color: "#00aa00",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "snake points", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    layerShown(){return true},
    tabFormat:[
      "main-display",
      "blank",
      "grid"
    ],
    grid: {
        rows: 9, // If these are dynamic make sure to have a max value as well!
        cols: 9,
        getStartData(id) {
          if(!id)return "no"
            id=id.toString()
            return [Number(id.slice(0,-2))-1,Number(id.slice(id.length-2))-1]
        },
        getUnlocked(id) { // Default
            return true
        },
        getCanClick(data, id) {
            return false
        },
        onClick(data, id) { 
            
        },
        getDisplay(data,id){return ""},
        getStyle(data, id) {
          let k = player.s.snake[player.s.snake.length-1]
            return {backgroundColor:k[0]==data[0]&&k[1]==data[1]?(player.s.died?"#440000":"#004400"):boardColors[player.s.board[data[0]][data[1]]]}
        },
    },
    update(diff){
      if(player.s.firstLoad){
        player.s.firstLoad=false
        let b = sb
        let pb = {}
        for(let x=0;x<9;x++){
          let k = []
          for(let y=0;y<9;y++){
            if(b[x][y]==0)k.push(y)
          }
          if(k.length>0)pb[x]=k
        }
        let k = Object.keys(pb)
        let r = Math.floor(Math.random()*k.length)
        let applePos = [r,pb[k[r]][Math.floor(Math.random()*pb[k[r]].length)]]
        b[applePos[0]][applePos[1]]=2
      }
      player.s.currentTime+=diff
      if(player.s.currentTime>=0.5&&!player.s.died){
        player.s.currentTime=0
        let pos = [0,0]
        switch(player.s.di){
          case 0:
            pos[0]=-1
            break;
          case 1:
            pos[1]=-1
            break;
          case 2:
            pos[0]=1
            break;
          case 3:
            pos[1]=1
            break;
        }
        let s = player.s.snake
        let cp = s[s.length-1]
        let b = player.s.board
        if(
          cp[0]+pos[0]>8 || cp[0]+pos[0]<0 ||
          cp[1]+pos[1]>8 || cp[1]+pos[1]<0 ||
          b[cp[0]+pos[0]][cp[1]+pos[1]]==1
        ){
          player.s.died=true
          return;
        }
        let newPos = [cp[0]+pos[0],cp[1]+pos[1]]
        let ateApple = false
        if(b[newPos[0]][newPos[1]]==2){
          let pb = {}
          for(let x=0;x<9;x++){
            let k = []
            for(let y=0;y<9;y++){
              if(b[x][y]==0)k.push(y)
            }
            if(k.length>0)pb[x]=k
          }
          let k = Object.keys(pb)
          let r = Math.floor(Math.random()*k.length)
          let applePos = [r,pb[k[r]][Math.floor(Math.random()*pb[k[r]].length)]]
          b[applePos[0]][applePos[1]]=2
          ateApple=true
          player.s.points=player.s.points.add(1)
        }
        b[newPos[0]][newPos[1]]=1
        player.s.snake.push(newPos)
        if(!ateApple){
          b[s[0][0]][s[0][1]]=0
          player.s.snake=player.s.snake.slice(1)
        }
      }
      if(player.s.currentTime>=2&&player.s.died){
        player.s.currentTime=0
        let newBoard = []
        for(let x=0;x<9;x++){
          newBoard[x]=[]
          for(let y=0;y<9;y++)newBoard[x][y]=0
        }
        newBoard[4][4]=1
        player.s.board = newBoard
        player.s.died=false
        player.s.snake=[[4,4]]
        let b = player.s.board
        let pb = {}
        for(let x=0;x<9;x++){
          let k = []
          for(let y=0;y<9;y++){
            if(b[x][y]==0)k.push(y)
          }
          if(k.length>0)pb[x]=k
        }
        let k = Object.keys(pb)
        let r = Math.floor(Math.random()*k.length)
        let applePos = [r,pb[k[r]][Math.floor(Math.random()*pb[k[r]].length)]]
        b[applePos[0]][applePos[1]]=2
        player.s.points=new Decimal(0)
      }
    },
    componentStyles:{
      gridable:{borderRadius:"0px"}
    }
})
document.addEventListener("keydown",(key)=>{
  switch(key.key){
    case "w":
    case "ArrowUp":
      if(player.s.di!=2)player.s.di=0
      break;
    case "a":
    case "ArrowLeft":
      if(player.s.di!=3)player.s.di=1
      break;
    case "s":
    case "ArrowDown":
      if(player.s.di!=0)player.s.di=2
      break;
    case "d":
    case "ArrowRight":
      if(player.s.di!=1)player.s.di=3
      break;
  }
})