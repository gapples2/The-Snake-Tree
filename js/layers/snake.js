const boardColors = ["#ffffff","#00ff00","#ff0000"]
function addFruit(){
  let b = player.s.board
  let pb = {}
  let maxAmt = 0
  for(let x=0;x<9;x++){
      let k = []
      for(let y=0;y<9;y++){
        if(b[x][y]==0){
          k.push(y)
          maxAmt++
        }
      }
      if(k.length>0)pb[x]=k
  }
  if(maxAmt==0)return;
  let k = Object.keys(pb)
  let r = Math.floor(Math.random()*k.length)
  let t = Math.floor(Math.random()*pb[k[r]].length)
  let applePos = [k[r],pb[k[r]][t]]
  if(b[applePos[0]][applePos[1]]!=0)console.log(JSON.parse(JSON.stringify(b)),pb,r,t)
  b[applePos[0]][applePos[1]]=2
}
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
        lastDi: 0,
        snake:[[4,4]],
        died:false,
        score:new Decimal(0),
        bestScore:new Decimal(0),
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
        let mult = tmp.s.buyables[13].effect
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    layerShown(){return true},
    tabFormat:[
      "main-display",
      ["display-text",function(){return `Score: ${player.s.score}<br>Best Score: ${player.s.bestScore}`}],
      "blank",
      ["display-text","Use WASD or the arrow keys to turn the snake!<br>Eating apples will increase your score.<br>Going into a wall or a part of your snake will end the game and give you snake points based on your score."],
      "grid",
      "blank",
      "buyables"
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
        addFruit()
      }
      if(player.tab=="s")player.s.currentTime+=diff
      if(player.s.currentTime>=0.25&&!player.s.died){
        player.s.currentTime=0
        let pos = [0,0]
        if((player.s.lastDi+2)%4==player.s.di)player.s.di=player.s.lastDi
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
        let bpos = b[cp[0]+pos[0]]||[0,0]
        bpos=bpos[cp[1]+pos[1]]
        if(bpos==undefined)bpos=1
        console.log()
        if(
          (cp[0]+pos[0]>8 || cp[0]+pos[0]<0 ||
          cp[1]+pos[1]>8 || cp[1]+pos[1]<0 ||
          bpos==1) && !(bpos==1&&(cp[0]+pos[0])==s[0][0]&&(cp[1]+pos[1])==s[0][1])
        ){
          player.s.died=true
          return;
        }
        player.s.lastDi=player.s.di
        let newPos = [cp[0]+pos[0],cp[1]+pos[1]]
        let ateApple = false
        if(b[newPos[0]][newPos[1]]==2){
          addFruit()
          ateApple=true
          player.s.score=player.s.score.add(tmp.s.buyables[12].effect)
          player.s.bestScore=player.s.bestScore.max(player.s.score)
        }
        if(!ateApple){
          b[s[0][0]][s[0][1]]=0
          player.s.snake=player.s.snake.slice(1)
        }
        b[newPos[0]][newPos[1]]=1
        player.s.snake.push(newPos)
      }
      if(player.s.currentTime>=1&&player.s.died){
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
        let maxFruits = 0
        for(let x=0;x<9;x++){
          let k = []
          for(let y=0;y<9;y++){
            if(b[x][y]==0){
              k.push(y)
              maxFruits++
            }
          }
          if(k.length>0)pb[x]=k
        }
        let fruitAmt = tmp.s.buyables[11].effect.min(maxFruits)
        let k = Object.keys(pb)
        for(let x=0;x<fruitAmt.toNumber();x++){
          let r = Math.floor(Math.random()*k.length)
          let t = Math.floor(Math.random()*pb[k[r]].length)
          b[k[r]][pb[k[r]][t]]=2
          pb[r].splice(t,1)
          if(pb[r].length==0){
            delete pb[r]
            k=Object.keys(pb)
          }
        }
        player.s.points=player.s.points.add(player.s.score.times(tmp.s.buyables[13].effect))
        player.s.score=new Decimal(0)
      }
    },
    componentStyles:{
      gridable:{borderRadius:"0px",width:"50px",height:"50px",transition:"0s"}
    },
  buyables: {
    11: {
        title: "Apple++",
        cost(x=getBuyableAmount(this.layer,this.id)) { return new Decimal(1.5).pow(x).times(x).add(x).add(10).floor() },
        display() { return `Add another fruit to the board.<br>Currently ${format(tmp[this.layer].buyables[this.id].effect)} apple(s) on the board.<br>Cost: ${format(tmp[this.layer].buyables[this.id].cost)} snake points` },
        canAfford() { return player[this.layer].points.gte(this.cost())&&getBuyableAmount(this.layer,this.id).lt(80) },
        buy() {
            player[this.layer].points = player[this.layer].points.sub(this.cost())
            setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            addFruit()
        },
        effect(x=getBuyableAmount(this.layer,this.id)){
          return x.add(1)
        }
    },
    12: {
        title: "Quality Apples",
        cost(x=getBuyableAmount(this.layer,this.id)) { return new Decimal(1.75).pow(x).times(x).add(x).add(10).pow(1.2).floor() },
        display() { return `Gain 1 more score per apple.<br>+${format(tmp[this.layer].buyables[this.id].effect)} score/apple.<br>Cost: ${format(tmp[this.layer].buyables[this.id].cost)} snake points` },
        canAfford() { return player[this.layer].points.gte(this.cost())&&getBuyableAmount(this.layer,this.id).lt(100) },
        buy() {
            player[this.layer].points = player[this.layer].points.sub(this.cost())
            setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
        },
        effect(x=getBuyableAmount(this.layer,this.id)){
          return x.add(1)
        }
    },
    13: {
        title: "Score Boosting",
        cost(x=getBuyableAmount(this.layer,this.id)) { return new Decimal(2.25).pow(x).add(1).times(750).div(x.add(2)).pow(x.minus(2).div(5).max(0).add(1)).floor() },
        display() { return `Multiply snake point gain by best^0.2.<br>${format(tmp[this.layer].buyables[this.id].effect)}x snake points.<br>Cost: ${format(tmp[this.layer].buyables[this.id].cost)} snake points` },
        canAfford() { return player[this.layer].points.gte(this.cost()) },
        buy() {
            player[this.layer].points = player[this.layer].points.sub(this.cost())
            setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
        },
        effect(x=getBuyableAmount(this.layer,this.id)){
          return player.s.bestScore.pow(0.2).pow(x)
        }
    },
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