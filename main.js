window.addEventListener("load", function () {
  p = console.log
  const canvas = document.querySelector("#canvas")
  const BG_IMG = document.getElementById("background")
  const music = document.createElement("audio")
  music.src = "bgmusic.mp3"
  music.play()
  const ctx = canvas.getContext("2d")
  canvas.width = innerWidth
  canvas.height = 600
  let gameFrame = 0
  let gameOver = false 
  let score= 0 
  let money = 0

  const IMG = {
    TOMA : document.getElementById('toma'),
    DURJOY : document.getElementById('joy'),
    BIRD_IMG: [],
    COIN_IMG: [],
    EXTRA_OBJ_IMG: [],
    INIT() {
      for (let i = 0; i < 8; ++i) {
        if (i <= 1) {
          this.BIRD_IMG.push(document.getElementById(`b${i+1}`))
        }
        this.COIN_IMG.push(document.getElementById(`c${i+1}`))
      }
      this.EXTRA_OBJ_IMG = [this.BIRD_IMG,
        this.COIN_IMG]
    }

  }


  IMG.INIT()
  
function showText (text,x,y,fontSize){
  ctx.fillStyle = "white"
  ctx.font = `${fontSize}px Bangers`
  ctx.fillText(text,x,y)
}
  
  class Ball {
    constructor (game) {
      const o = this
      o.game = game
      o.radius = 10
      o.x = (game.player.x+game.player.width)/2+game.player.width
      o.y = game.player.y-o.radius
      o.velX = 3
      o.velY = -3
      o.speed = 4
    }

    draw(context) {
      context.fillStyle = "red"
      context.beginPath()
      context.arc(this.x, this.y, this.radius, 0, Math.PI*2)
      context.fill()
      context.closePath()
      this.update()

    }

    update () {
      this.ballWallCollision()
      this.ballPlayerCollisoin()
      this.x += this.velX
      this.y += this.velY
    }

    ballWallCollision() {
      if (this.x+this.radius > this.game.canvas_width || this.x-this.radius < 0) {
        this.velX = -this.velX
      }
      if (this.y-this.radius < 0) {
        this.velY = -this.velY
      }
      if (this.y+this.radius > this.game.canvas_height) {
        this.game.LIFE--
        setTimeout(()=> {this.resetBall()}, 3000)
      }
    }

    ballPlayerCollisoin() {
       const player = this.game.player
      if (this.y-this.radius<=player.y+player.height && this.x+this.radius>=player.x && this.y+this.radius>=player.y &&  this.x-this.radius <= player.x+player.width) {
        let collidePoint = this.x - (this.game.player.x+this.game.player.width/2)
        collidePoint = collidePoint/(this.game.player.width/2)
        let angle = collidePoint*Math.PI/3 
        this.velX = Math.sin(angle)*this.speed
        this.velY = -(Math.cos(angle)*this.speed)
      }
    }

    resetBall() {
      this.x = (this.game.player.x + this.game.player.width)*0.5
      this.y = this.game.player.y-this.radius
      this.velX = 3*(Math.random()*2-1)
      this.velY = -3
    }
  }

  class Player {
    constructor (game) {
      const o = this
      o.game = game
      o.width = 80
      o.height = 15
      o.x = (game.canvas_width/2)-(o.width/2)
      o.y = game.canvas_height - o.height
      const colors = ["red",
        "green",
        "yellow"]
      o.color = colors[Math.floor((Math.random()*colors.length))]
      o.velX = 0
    }

    draw (context) {
      context.fillStyle = this.color
      context.fillRect(this.x, this.y, this.width, this.height)
      this.update()
    }

    update() {
      if (this.x+this.width>this.game.canvas_width ) this.x-=2.5 
      if (this.x<0)this.x+=2.5
      if (this.game.control.mouseEvent){
        if (this.game.control.xDown>this.game.control.pos)
        this.velX = 2.5 
        else this.velX = -2.5
      }
      else this.velX = 0
     
      this.x += this.velX
       
    }
  }

  class Control {
    constructor (game) {
      const o = this
      o.game = game
      o.touched = 0
      o.xDown = null
      o.xUp = null 
      o.mouseEvent = null
      o.pos = game.canvas_width*0.5
      window.addEventListener ('touchstart', ({changedTouches}) => {
         this.mouseEvent = true 
         o.xDown=changedTouches[0].pageX
       })
      window.addEventListener ('touchend', ({changedTouches}) => {
        this.mouseEvent = false 
        
       })
    }
    
  }

  class Objects {
    constructor (game,
      x,
      y,
      offsetY) {
      const o = this
      o.game = game
      o.x = x + (game.canvas_width/2)-60
      o.y = y + offsetY 
      o.radius = 15
      o.img = (Math.random()>0.5)?IMG.TOMA:IMG.DURJOY
      o.imgW = 32.64
      o.imgH = 32.64
      o.hasExtraObj = (Math.random() < 0.5) ? true: false
    }

    draw (context) {
      
      context.drawImage(this.img,
        this.x-this.imgW*0.5,
        this.y-this.imgH*0.5,
        this.imgW,
        this.imgH)
    }
  }

  class ExtraObject {
    constructor(game,
      x,
      y) {
      const o = this
      o.game = game
      o.x = x
      o.y = y
      o.width = 10
      o.height = 10
      o.fps = 5
      o.velY = 0
      o.velX = 0
      o.setValue = false
      o.IMG = IMG.EXTRA_OBJ_IMG[Math.floor(Math.random()*IMG.EXTRA_OBJ_IMG.length)]
      o.i = null
      o.max_i = null
      o.imgW = null
      o.imgH = null
      o.bird_i = 0
      o.maxbird_i = 0
      o.bW = 492/10
      o.bH = 409/10
      o.coin_i = 0
      o.maxcoin_i = 6
      o.cW = 20
      o.cH = 20
    }
    draw (context) {
      this.update(context)
    }

    update(context) {
      if (!this.setValue)
        switch (this.IMG) {
        case IMG.BIRD_IMG:
          this.i = this.bird_i
          this.max_i = this.maxbird_i
          this.velX = -2
          this.velY = Math.random()
          this.imgW = this.bW
          this.imgH = this.bH
          break
        case IMG.COIN_IMG:
          this.i = this.coin_i
          this.max_i = this.maxcoin_i
          this.velX = 0
          this.velY = 2
          this.imgW = this.cW
          this.imgH = this.cH
      }
      this.setValue = true
      context.drawImage(this.IMG[this.i], this.x, this.y, this.imgW, this.imgH)
      if (!(gameFrame%this.fps)) {
        (this.i > this.max_i)?this.i = 0: this.i++
      }
      this.x += this.velX
      this.y += this.velY
    }
  }


  class Game {
    static index = 0
    constructor (canvasWidth,
      canvasHeight) {
      const o = this
      o.LIFE = 3
      o.i = 0
      o.canvas_width = canvasWidth
      o.canvas_height = canvasHeight
      o.player = new Player(this)
      o.control = new Control(this)
      o.ball = new Ball(this)
      o.level_patterns = [
        [
          ["$",
            "",
            "$",
            "",
            "$"],
          ["",
            "",
            "",
            "",
            ""],
          ["",
            "",
            "$",
            "",
            ""],
          ["",
            "",
            "",
            "",
            ""],
          ["",
            "",
            "$",
            "",
            ""],
          ["",
            "",
            "",
            "",
            ""],
          ["",
            "",
            "$",
            "",
            ""]

        ],
        [
          ["$",
            "",
            "$",
            "",
            "$",
            "",
            "$"],
          ["",
            "",
            "",
            "",
            "",
            "",
            ""],
          ["$",
            "",
            "$",
            "",
            "$",
            "",
            "$"],
              ["",
            "",
            "",
            "",
            "",
            "",
            ""],
          ["$",
            "",
            "$",
            "",
            "$",
            "",
            "$"]
        ]
      ]
      o.levels = [[],
        []]
      o.max_i = o.levels.length-1
      o.level_patterns.forEach(pattern => {
        o.addLevels(pattern)
    })
    o.extraObjects = []
    o.birds = []
  }

  renderPlayer(context) {
    this.player.draw(context)
  }

  renderBall(context) {
    this.ball.draw(context)
  }

  renderExtraObject(context) {
    this.extraObjects.forEach((exo, i)=> {
      exo.draw(context)
      if (this.checkForCollision(exo, this.player) || exo.x<-50 || exo.y+exo.height >this.canvas_height) {
        this.extraObjects.splice(i, 1)
        if (exo.IMG==IMG.COIN_IMG)
        money+=10
      }
    })
  }

  renderObjects(context) {
    if (!this.levels[this.i].length){
      this.i++
    }
    if(this.i>this.max_i){
      gameOver = true
      showText("GAME OVER",this.canvas_width*0.5,this.canvas_height*0.5,30)
      return 
    }
    this.levels[this.i].forEach((level, i)=> {
      level.draw(context)
      if (Math.hypot(level.x-this.ball.x, level.y-this.ball.y) < level.radius+this.ball.radius) {
        this.ball.velX = (Math.random()>0.5)?-3:3 
        this.ball.velY = (Math.random()>0.5)?3:-3
      
        this.levels[this.i].splice(i, 1)
        score++
        if (level.hasExtraObj)
          this.extraObjects.push(new ExtraObject(this, level.x, level.y))
      }
    })
  }

  addLevels(level_pattern) {
    let offsetY = 50
    level_pattern.forEach((row, i)=> {
      row.forEach((symbol, j)=> {
        switch (symbol) {
        case '$':
          this.levels[Game.index].push(new Objects(this, j*30, i*30, offsetY))
          break
        }
      })
    })
    Game.index++
  }

  checkForCollision (obj1,
    obj2) {
    return (
      obj1.x < obj2.x + obj2.width &&
      obj1.x + obj1.width > obj2.x &&
      obj1.y < obj2.y + obj2.height &&
      obj1.y + obj1.height > obj2.y)
  }

}


  const game = new Game (canvas.width,
    canvas.height)
  function animate() {
    ctx.drawImage(BG_IMG,0,0,canvas.width,canvas.height)
    showText (`SCORE : ${score}`,canvas.width*0.03,canvas.height*0.03,15)
    showText (`MONEY : ${money} $`,canvas.width*0.03,canvas.height*0.07,15)
    game.renderPlayer(ctx)
    game.renderBall(ctx)
    game.renderObjects(ctx)
    game.renderExtraObject(ctx)
    gameFrame++
    
    if(!gameOver)
    requestAnimationFrame (animate)
  }

  animate()
})
