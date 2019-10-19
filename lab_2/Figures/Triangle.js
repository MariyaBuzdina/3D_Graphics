class Triangle extends Figure {
    constructor(pointA, pointB, pointC,  color) {
        super(new Point3(0, 0, 0));
        this.name = "Triangle";
        this.pointA = pointA;
        this.pointB = pointB;
        this.pointC = pointC;
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
        this.vertices = this.pointA.toArray().concat(this.pointB.toArray().concat(this.pointC.toArray()));
    }
}