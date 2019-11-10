class Sphere extends Figure {
    constructor(center, radius, angle,  scale,  color) {
        super(center, angle,  scale, color);
        this.radius = radius;
        this.latitudeBands = 30;
        this.longitudeBands = 30;
    }

    initBuffers(){
        this.generateVerticesMatrix();
        this.generateIndexesMatrix();

        this.initPositionBuffer();
        this.initIndexBuffer();
        this.initTextureCoordsBuffer();
        this.initNormalesBuffer();
        this.initColorBuffer();
    }

    generateColorMatrix(){
        let colors = [];
        for (let i=0; i < this.vertices.length / 3; i++) {
            colors = colors.concat(this.color);
        }
        this.colors = colors;
    }

    generateIndexesMatrix(){
        for (let latNumber = 0; latNumber < this.latitudeBands; latNumber++) {
            for (let longNumber = 0; longNumber < this.longitudeBands; longNumber++) {
                let first = (latNumber * (this.longitudeBands + 1)) + longNumber;
                let second = first + this.longitudeBands + 1;
                this.indices.push(first);
                this.indices.push(second);
                this.indices.push(first + 1);
                this.indices.push(second);
                this.indices.push(second + 1);
                this.indices.push(first + 1);
            }
        }
    }

    generateVerticesMatrix(){
        for (let latNumber=0; latNumber <= this.latitudeBands; latNumber++) {
            let theta = latNumber * Math.PI / this.latitudeBands;
            let sinTheta = Math.sin(theta);
            let cosTheta = Math.cos(theta);
            for (let longNumber=0; longNumber <= this.longitudeBands; longNumber++) {
                let phi = longNumber * 2 * Math.PI / this.longitudeBands;
                let sinPhi = Math.sin(phi);
                let cosPhi = Math.cos(phi);
                let x = cosPhi * sinTheta;
                let y = cosTheta;
                let z = sinPhi * sinTheta;
                let u = 1 - (longNumber / this.longitudeBands);
                let v = 1 - (latNumber / this.latitudeBands);
                this.vertexNormales.push(x);
                this.vertexNormales.push(y);
                this.vertexNormales.push(z);
                this.textureCoords.push(u);
                this.textureCoords.push(v);
                this.vertices.push(this.radius * x);
                this.vertices.push(this.radius * y);
                this.vertices.push(this.radius * z);
            }
        }

    }
}