class Circle {
    constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
    }

    render = (canvasContext) => {
        canvasContext.beginPath();
        canvasContext.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
        canvasContext.closePath();
        canvasContext.fillStyle = this.color;
        canvasContext.fill();
    };
}

class Scene {
    palletes = [
        {sunColor: '#f4eb99', skyColor: '#ffffff'}
    ];
    SUN_MIN_Y = 100;

    constructor() {
        this.sun = new Circle(100, this.SUN_MIN_Y, 25, this.palletes[0].sunColor);
        this.sunVelocity = { x: 0, y: 0.1 };
    }

    render = (canvasContext, delta) => {
        if (this.sun.y > canvasContext.canvas.height && this.sunVelocity.y > 0) {
            this.sunVelocity = { x: 0, y: -0.1 };
        }
        else if (this.sun.y < this.SUN_MIN_Y && this.sunVelocity.y < 0) {
            this.sunVelocity = { x: 0, y: 0.1 };
        }
        this.sun.x += this.sunVelocity.x * delta;
        this.sun.y += this.sunVelocity.y * delta;
        
        this.sun.render(canvasContext);
    };
}

class Page {
    constructor() {
        this.sky = document.getElementById('sky-layer');
        this.canvasEle = document.getElementById('scene');
        this.matchCanvasToSky();
        this.canvasContext = this.canvasEle.getContext('2d');
        window.addEventListener('resize', this.onResizeCanvas, false);

        this.scene = new Scene()
        this.prevTime = 0;

        this.render(0)
    }

    onResizeCanvas = () => {
        this.matchCanvasToSky();
    };

    matchCanvasToSky = () => {
        this.canvasEle.width = this.sky.clientWidth;
        this.canvasEle.height = this.sky.clientHeight;
    };

    render = (time) => {
        this.canvasContext.clearRect(0, 0, this.canvasEle.width, this.canvasEle.height);
        
        const delta = time - this.prevTime;
        this.scene.render(this.canvasContext, delta);
        this.prevTime = time;

        window.requestAnimationFrame(this.render);
    }
}

const page = new Page()