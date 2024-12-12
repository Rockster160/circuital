import Keyboard from "components/keyboard";

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)
const lawOfCosines_c = (a, b, C) => Math.sqrt(a**2 + b**2 + (2 * a * b * Math.cos(C))) // c
const lawOfCosines_C = (a, b, c) => Math.acos((a**2 + b**2 - c**2) / (2 * a * b)) // aC
const lawOfCosines_B = (a, b, c) => Math.acos((a**2 + c**2 - b**2) / (2 * a * c)) // aC

export default class Player {
  static #instance = null
  static get instance() { return Player.getInstance() }
  static getInstance() {
    if (Player.#instance === null) {
      Player.#instance = new Player()
    }
    return Player.#instance
  }

  constructor() {
    this.x = 0
    this.y = 0
    this.width = 10
    this.facingAngle = 0
    this.momentumAngle = 0
    this.momentum = 0
    this.maxSpeed = 5
    this.acceleration = 0.1;
    this.friction = 0.03;
    this.brakes = 0.07;

    this.thrust = 0
  }

  static tick(ctx) {
    const player = Player.instance

    if (Keyboard.isPressed("→")) { player.facingAngle = (player.facingAngle + 0.1) % (Math.PI*2) }
    if (Keyboard.isPressed("←")) { player.facingAngle = (player.facingAngle - 0.1) % (Math.PI*2) }
    if (Keyboard.isPressed("↑")) {
      player.thrust = 1
    } else if (Keyboard.isPressed("↓")) {
      player.thrust = -1
    } else {
      player.thrust = 0
    }

    player.move()

    player.draw(ctx)
  }

  applyForce(force, direction) {
    const v1 = { x: Math.cos(this.momentumAngle) * this.momentum, y: Math.sin(this.momentumAngle) * this.momentum }
    const v2 = { x: Math.cos(direction) * force, y: Math.sin(direction) * force }
    const v = { x: v1.x + v2.x, y: v1.y + v2.y }

    this.momentumAngle = Math.atan2(v.y, v.x)
    this.momentum = Math.hypot(v.x, v.y)
    this.momentum = clamp(this.momentum, 0, this.maxSpeed)
  }

  move() {
    const player = this
    if (player.thrust == 1) {
      player.applyForce(player.acceleration, player.facingAngle)
    } else if (player.thrust == -1) {
      if (player.momentum > 0) {
        player.applyForce(-player.brakes, player.momentumAngle)
      }
    }

    player.x += Math.cos(player.momentumAngle) * player.momentum
    player.y += Math.sin(player.momentumAngle) * player.momentum

    if (player.momentum > 0) {
      player.applyForce(-player.friction, player.momentumAngle)
    }
  }

  forwardCoord(distance) {
    const player = this
    return {
      x: player.x + Math.cos(player.facingAngle) * distance,
      y: player.y + Math.sin(player.facingAngle) * distance,
    }
  }

  draw(ctx) {
    const player = this

    ctx.font = "20px Arial";
    ctx.fillStyle = "#FFF";
    ctx.fillText(`momentum: ${player.momentum}, direction: ${player.momentumAngle.toFixed(2)}`, 10, 30)
    ctx.fillText(`thrust: ${player.thrust}, facing: ${player.facingAngle.toFixed(2)}`, 10, 60)

    ctx.fillStyle = "#0160FF";
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.width, 0, 2 * Math.PI);
    ctx.fill();

    ctx.strokeStyle = "#EEEEEE";
    ctx.beginPath()
    ctx.moveTo(player.x, player.y)
    const faceCoord = player.forwardCoord(player.width * 1.5)
    ctx.lineTo(faceCoord.x, faceCoord.y)
    ctx.stroke()
  }
}
