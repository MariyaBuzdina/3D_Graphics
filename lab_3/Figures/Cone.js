class Cone extends Figure {
    constructor(center, angle, scale, color) {
        super(center, angle, scale);
        this.name = "Cone";
        this.radius = 1;
        this.height = 1;
        this.x = 1;
        this.y = 1;
        this.z = 1;
        this.color = color;
    }
    initBuffers() {
        this.generateVerticesMatrix();
        this.generateColorMatrix();
        this.initPositionBuffer();
        this.initColorBuffer();
    }

    // Special color like on picture
    generateColorMatrix(){
        let colors = [];
        for (let i=0; i < this.vertices.length / 3; i++) {
            colors = colors.concat(this.color);
        }
        this.colors = colors;
    }

    generateVerticesMatrix() {
        let thetaOffset = 0.01;
        let vertices = [this.center[0], this.center[1] + 1/2 * this.height, this.center[2]];
        let radius = this.radius;
        for(let theta = 0; theta < 2 * Math.PI; theta += thetaOffset) {
            let x1  = radius * Math.cos(theta);
            let z1 =  radius * Math.sin(theta);
            vertices.push(this.center[0] + x1, this.center[1] - 1/2 * this.height, this.center[2] + z1);
        }
        this.vertices = vertices;
    }
}