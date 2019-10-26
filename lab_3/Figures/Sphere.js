class Sphere extends Figure {
    constructor(center, radius, angle,  scale,  color) {
        super(center, angle,  scale);
        this.name = "Circle";
        this.radius = radius;
        this.color = color;
    }

    initBuffers(){
        this.generateVerticesMatrix();
        this.generateColorMatrix();
        this.initPositionBuffer();
        this.initColorBuffer();
    }

    generateColorMatrix(){
        let colors = [];
        for (let i=0; i < this.vertices.length / 3; i++) {
            colors = colors.concat(this.color);
        }
        this.colors = colors;
    }

    generateVerticesMatrix(){
        let vertices = [];
        let offset = 0.1;
        for (let theta = 0; theta < Math.PI; theta += offset) {
            for (let phi = 0; phi < 2 * Math.PI; phi += offset) {
                let x = this.center[0] + this.radius * Math.sin(theta) * Math.cos(phi);
                let y = this.center[1] + this.radius * Math.sin(theta) * Math.sin(phi);
                let z = this.center[2] + this.radius * Math.cos(theta);
                vertices.push(x, y, z);
            }
        }
        this.vertices = vertices;``
    }
}