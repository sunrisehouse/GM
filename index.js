class Circle {
    constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
    }

    renderEle = (ele) => {
        ele.setAttribute('cx', this.x);
        ele.setAttribute('cy', this.y);
        ele.setAttribute('r', this.radius);
    }

    render = (canvasContext) => {
        canvasContext.beginPath();
        canvasContext.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
        canvasContext.closePath();
        canvasContext.fillStyle = this.color;
        canvasContext.fill();
    };
}

class ImageObject {
    constructor(x, y, width, height, imageUrl) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.image = new Image();
        this.image.src = imageUrl;
    }

    render = (canvasContext) => {
        canvasContext.drawImage(this.image, this.x, this.y, this.width, this.height);
    };
}

class Scene {
    SUN_MIN_Y = 100;
    TRAVELER_IMAGE_URLS = [
        './resources/red-car.png',
        './resources/boat.png',
        './resources/red-car.png',
    ]
    IMAGE_OBJECT_SIZES = [
        {leftOffset: 60, topOffset: 114, width: 200, height: 200},
        {leftOffset: 0, topOffset: 67, width: 72, height: 72},
        {leftOffset: 60, topOffset: 114, width: 200, height: 200},
    ]

    constructor(initialWidth, initialHeight, sunEle) {
        this.curImageIdx = 0;
        this.sunEle = sunEle;
        this.sun = new Circle(100, this.SUN_MIN_Y, 25);
        this.sunVelocity = { x: 0, y: 0 };
        this.traveler = this.makeCarTraveler(initialWidth, initialHeight);
        this.travelerVelocity = { x:-0.2, y:0 };
    }

    makeCarTraveler = (width, height) => {
        const imageObject = new ImageObject(
            width - this.IMAGE_OBJECT_SIZES[this.curImageIdx].leftOffset,
            height - this.IMAGE_OBJECT_SIZES[this.curImageIdx].topOffset,
            this.IMAGE_OBJECT_SIZES[this.curImageIdx].width,
            this.IMAGE_OBJECT_SIZES[this.curImageIdx].height,
            this.TRAVELER_IMAGE_URLS[this.curImageIdx]);
        this.curImageIdx += 1;
        if (this.curImageIdx == this.TRAVELER_IMAGE_URLS.length) this.curImageIdx = 0;
        return imageObject;
    };

    render = (canvasContext, delta, onSunArrivedOnGround) => {
        if (this.sun.y > canvasContext.canvas.height && this.sunVelocity.y > 0) {
            this.sunVelocity = { x: 0, y: -0.2 };
            this.traveler = this.makeCarTraveler(canvasContext.canvas.width, canvasContext.canvas.height);
            onSunArrivedOnGround();
        }
        else if (this.sun.y < this.SUN_MIN_Y && this.sunVelocity.y < 0) {
            this.sunVelocity = { x: 0, y: 0 };
        }
        this.sun.x += this.sunVelocity.x * delta;
        this.sun.y += this.sunVelocity.y * delta;

        if (this.traveler && this.traveler.x < -150) {
            this.sunVelocity = {x:0, y:0.2};
        }
        if (this.traveler) {
            this.traveler.x += this.travelerVelocity.x * delta;
            this.traveler.y += this.travelerVelocity.y * delta;
        }
        
        this.sun.renderEle(this.sunEle);
        if (this.traveler) this.traveler.render(canvasContext);
    };
}

class AppearElement {
    constructor(ids) {
        this.elements = ids.map(id => document.getElementById(id));

        this.elements.forEach(ele => {
            ele.classList.add('appear-element')
        });

        window.addEventListener('scroll', this.onScroll);
    }

    onScroll = () => {
        const currentScrollTopY = window.scrollY;
        const currentScrollBottomY = currentScrollTopY + window.innerHeight;

        this.elements.forEach(ele => {
            const elementRect = ele.getBoundingClientRect();
            const elementTopY = currentScrollTopY + elementRect.top;
            const elementBottomY = currentScrollTopY + elementRect.bottom;
    
            if (currentScrollBottomY < elementTopY || currentScrollTopY > elementBottomY) {
                ele.classList.remove('active');
            } else {
                ele.classList.add('active');
            }
        });
    };
}

class Page {
    palletes = [
        {
            mainColor1: '#f8efc7',
            mainColor2: '#f4eb99',
            mainColor3: '#c9db5f',
            mainColor4: '#65b02c',
            mainColor5: '#15902d',
            primaryFontColor1: '#dddddd',
            primaryFontColor2: '#666666',
            primaryFontColor3: '#15902d',
            sunColor: '#f4eb99',
            groundColor: '#c9db5f',
        },
        {
            mainColor1: '#FFA400',
            mainColor2: '#D98C00',
            mainColor3: '#0F00FF',
            mainColor4: '#09009B',
            mainColor5: '#000000',
            primaryFontColor1: '#eeeeee',
            primaryFontColor2: '#cccccc',
            primaryFontColor3: '#09009B',
            sunColor: '#ffa400',
            groundColor: '#0F00FF',
        },
        {
            mainColor1: '#E9E5D6',
            mainColor2: '#ACB992',
            mainColor3: '#464E2E',
            mainColor4: '#362706',
            mainColor5: '#362706',
            primaryFontColor1: '#dddddd',
            primaryFontColor2: '#666666',
            primaryFontColor3: '#15902d',
            sunColor: '#E83A14',
            groundColor: '#064635',
        },
    ]
    constructor() {
        this.sky = document.getElementById('sky-layer');
        this.canvasEle = document.getElementById('scene');
        this.scene = new Scene(this.sky.clientWidth, this.sky.clientHeight, document.getElementById('sun'));
        this.currentPalletIdx = 0;
        new AppearElement(['information-section', 'nft-showing-section'])

        this.matchCanvasToSky();
        this.canvasContext = this.canvasEle.getContext('2d');
        window.addEventListener('resize', this.onResizeCanvas, false);

        this.prevTime = 0;
        this.render(0);
    }

    onResizeCanvas = () => {
        this.matchCanvasToSky();
    };

    matchCanvasToSky = () => {
        this.canvasEle.width = this.sky.clientWidth;
        this.canvasEle.height = this.sky.clientHeight;
    };
    
    onSunArrivedOnGround = () => {
        this.currentPalletIdx += 1;
        if (this.currentPalletIdx == this.palletes.length) this.currentPalletIdx = 0;
        document.documentElement.style.setProperty("--main-color-1", this.palletes[this.currentPalletIdx].mainColor1);
        document.documentElement.style.setProperty("--main-color-2", this.palletes[this.currentPalletIdx].mainColor2);
        document.documentElement.style.setProperty("--main-color-3", this.palletes[this.currentPalletIdx].mainColor3);
        document.documentElement.style.setProperty("--main-color-4", this.palletes[this.currentPalletIdx].mainColor4);
        document.documentElement.style.setProperty("--main-color-5", this.palletes[this.currentPalletIdx].mainColor5);
        document.documentElement.style.setProperty("--primary-font-color-1", this.palletes[this.currentPalletIdx].primaryFontColor1);
        document.documentElement.style.setProperty("--primary-font-color-2", this.palletes[this.currentPalletIdx].primaryFontColor2);
        document.documentElement.style.setProperty("--primary-font-color-3", this.palletes[this.currentPalletIdx].primaryFontColor3);
        document.documentElement.style.setProperty("--sun-color", this.palletes[this.currentPalletIdx].sunColor);
        document.documentElement.style.setProperty("--ground-color", this.palletes[this.currentPalletIdx].groundColor);
    }

    render = (time) => {
        this.canvasContext.clearRect(0, 0, this.canvasEle.width, this.canvasEle.height);
        
        const delta = time - this.prevTime;
        this.scene.render(this.canvasContext, delta, this.onSunArrivedOnGround);
        this.prevTime = time;

        window.requestAnimationFrame(this.render);
    }
}

const page = new Page()