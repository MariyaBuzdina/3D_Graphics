let gl;
let figures = [];
let shaderProgram;
let mvMatrix = mat4.create();
let pMatrix = mat4.create();
let sceneTexture;
let sphereTexture;
let smallSphereTexture;
let textureCube;
let textureCone;

function webGLStart() {
    const canvas = document.getElementById("central_canvas");
    initGL(canvas);
    initShaders();
    figures = {
        cylinder: new Cylinder([0.0, -3.0, 0.0], 10, [10, 1, 10], [130, 130, 130, 255]),
        cube: new Cube([9.0, -2.0, 0.0], 70, [0.4, 0.4, 0.4], [70, 0, 0, 255]),
        cone: new Cone([0, -2, 0], 0, [0.5, 1.0, 0.5], [13, 20, 94, 255]),
        smallSphere: new Sphere([0, -2, 0], 1, 0, [0.5, 0.5, 0.5], [40, 75, 95, 255]),
        bigSphere: new Sphere([0, -0.5, 0], 2, 0, [1, 1, 1], [255, 250, 130, 255]),
    };
    initBuffers();
    gl.clearColor(0.0, 0.5, 1.0, 0.5);
    gl.lineWidth(3);
    gl.enable(gl.DEPTH_TEST);
    document.onkeyup = handleKeyUp;
    document.onkeydown = handleKeyDown;
    sceneTexture  = initTexture('sources/Textures/texture.jpg');
    sphereTexture  = initTexture('sources/Textures/moon.gif');
    smallSphereTexture  = initTexture('sources/Textures/texture2.jpg');
    textureCube = initTexture('sources/Textures/texture1.jpg');
    textureCone = initTexture('sources/Textures/texture3.jpeg');


    drawScene();
}

function initGL(canvas) {
    try {
        gl = canvas.getContext("experimental-webgl");
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
    } catch (e) {
    }
    if (!gl) {
        alert("Could not initialise WebGL, sorry :-(");
    }
}

function getShader(gl, id) {
    const shaderScript = document.getElementById(id);
    if (!shaderScript) {
        alert('No shader programme');
        return null;
    }

    let shader;
    if (shaderScript.type == "x-shader/x-fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderScript.type == "x-shader/x-vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }

    gl.shaderSource(shader, shaderScript.text);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}

function initTexture(url) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 1;
    const height = 1;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    const pixel = new Uint8Array([255, 255, 255, 255]);
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
        width, height, border, srcFormat, srcType,
        pixel);

    const image = new Image();
    image.onload = function() {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
            srcFormat, srcType, image);
        if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
            gl.generateMipmap(gl.TEXTURE_2D);
        } else {
            // Размер не соответствует степени 2.
            // Отключаем MIP'ы и устанавливаем натяжение по краям
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }
    };
    image.src = url;
    return texture;
}

function initShaders() {
    const fragmentShader = getShader(gl, "shader-fs");
    const vertexShader = getShader(gl, "shader-vs");

    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }

    gl.useProgram(shaderProgram);

    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

    shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
    gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);

    shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexNormal");
    gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);

    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
    shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, "uNMatrix");
    shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
    shaderProgram.materialShininessUniform = gl.getUniformLocation(shaderProgram, "uMaterialShininess");
    shaderProgram.showSpecularHighlightsUniform = gl.getUniformLocation(shaderProgram, "uShowSpecularHighlights");
    shaderProgram.useLightingUniform = gl.getUniformLocation(shaderProgram, "uUseLighting");
    shaderProgram.ambientColorUniform = gl.getUniformLocation(shaderProgram, "uAmbientColor");
    shaderProgram.pointLightingLocationUniform = gl.getUniformLocation(shaderProgram, "uPointLightingLocation");
    shaderProgram.pointLightingSpecularColorUniform = gl.getUniformLocation(shaderProgram, "uPointLightingSpecularColor");
    shaderProgram.pointLightingDiffuseColorUniform = gl.getUniformLocation(shaderProgram, "uPointLightingDiffuseColor");
}
function setMatrixUniforms() {
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);

    let normalMatrix = mat3.create();
    mat4.toInverseMat3(mvMatrix, normalMatrix);
    mat3.transpose(normalMatrix);
    gl.uniformMatrix3fv(shaderProgram.nMatrixUniform, false, normalMatrix);
}

function initBuffers() {
    for (let figureName in figures){
        figures[figureName].initBuffers();
    }
}

let mvMatrixStack = [];

function mvPushMatrix() {
    let copy = mat4.create();
    mat4.set(mvMatrix, copy);
    mvMatrixStack.push(copy);
}

function mvPopMatrix() {
    if (mvMatrixStack.length == 0) {
        throw "Invalid popMatrix!";
    }
    mvMatrix = mvMatrixStack.pop();
}

function drawScene() {
    gl.enable(gl.DEPTH_TEST);
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    mat4.perspective(60, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);
    //var specularHighlights = document.getElementById("specular").checked;
    gl.uniform1i(shaderProgram.showSpecularHighlightsUniform, 1);
    mat4.lookAt([xCameraPos, yCameraPos, zCameraPos], [0, 0, 0], [0, 1, 0], mvMatrix);
    // let light = [
    //     parseFloat(document.getElementById("lightPositionX").value),
    //     parseFloat(document.getElementById("lightPositionY").value),
    //     parseFloat(document.getElementById("lightPositionZ").value)];

    //light
    var lighting = document.getElementById("lighting").checked;
    gl.uniform1i(shaderProgram.useLightingUniform, lighting);
    if (lighting) {
        gl.uniform3f(
            shaderProgram.ambientColorUniform,
            parseFloat(document.getElementById("ambientR").value),
            parseFloat(document.getElementById("ambientG").value),
            parseFloat(document.getElementById("ambientB").value)
        );

        gl.uniform3f(
            shaderProgram.pointLightingLocationUniform,
            parseFloat(document.getElementById("lightPositionX").value),
            parseFloat(document.getElementById("lightPositionY").value),
            parseFloat(document.getElementById("lightPositionZ").value)
        );

        gl.uniform3f(
            shaderProgram.pointLightingSpecularColorUniform,
            parseFloat(document.getElementById("specularR").value),
            parseFloat(document.getElementById("specularG").value),
            parseFloat(document.getElementById("specularB").value)
        );
        gl.uniform3f(
            shaderProgram.pointLightingDiffuseColorUniform,
            parseFloat(document.getElementById("diffuseR").value),
            parseFloat(document.getElementById("diffuseG").value),
            parseFloat(document.getElementById("diffuseB").value)
        );
    }

    gl.uniform1f(shaderProgram.materialShininessUniform, parseFloat(document.getElementById("shininess").value));

    //draw scene
    mvPushMatrix();
    mat4.translate(mvMatrix, figures.cylinder.center);
    mat4.scale(mvMatrix, figures.cylinder.scale);
    setBuffersToShaders(
        figures.cylinder.vertexPositionBuffer,
        figures.cylinder.vertexTextureCoordBuffer,
        figures.cylinder.vertexNormalBuffer
    );
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, sceneTexture);
    gl.uniform1i(shaderProgram.samplerUniform, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, figures.cylinder.vertexIndexBuffer);
    setMatrixUniforms();
    gl.drawElements(gl.TRIANGLES, figures.cylinder.vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
    mvPopMatrix();


    //draw cone
    texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    color = new Uint8Array(figures.cone.color);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, color);
    let radius = 9;
    let center = [0, -2, -10];
    for (let i = 0; i < 2 * Math.PI; i += 0.1){
        mvPushMatrix();
        center[0] = radius * Math.cos(i);
        center[2] = radius * Math.sin(i);
        center[1] = center[1];
        mat4.translate(mvMatrix, center);
        mat4.scale(mvMatrix, figures.cone.scale);
        // mat4.rotate(mvMatrix, degToRad(figures.cone.angle), [0, 1, 0]);
        setBuffersToShaders(
            figures.cone.vertexPositionBuffer,
            figures.cone.vertexTextureCoordBuffer,
            figures.cone.vertexNormalBuffer
            );
        gl.bindBuffer(gl.ARRAY_BUFFER, figures.cone.vertexNormalBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, figures.cone.vertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, figures.cone.vertexIndexBuffer);
        setMatrixUniforms();
        gl.drawElements(gl.TRIANGLES, figures.cone.vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
        mvPopMatrix();
    }


    //cube color
    texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    color = new Uint8Array(figures.cube.color);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, color);
    radius = 9;
    center = [0, 0.5, -10];
    for (let i = 0; i < 2 * Math.PI; i += 0.15) {
        mvPushMatrix();
        center[0] = radius * Math.cos(i);
        center[2] = radius * Math.sin(i);
        center[1] = center[1];
        mat4.translate(mvMatrix, center);
        mat4.scale(mvMatrix, figures.cube.scale);
        mat4.rotate(mvMatrix, degToRad(figures.cube.angle), [1, 0, 1]);
        setBuffersToShaders(
            figures.cube.vertexPositionBuffer,
            figures.cube.vertexTextureCoordBuffer,
            figures.cube.vertexNormalBuffer
        );
        // gl.activeTexture(gl.TEXTURE0);
        // gl.bindTexture(gl.TEXTURE_2D, textureCube);
        // gl.uniform1i(shaderProgram.samplerUniform, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, figures.cube.vertexNormalBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, figures.cube.vertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, figures.cube.vertexIndexBuffer);
        setMatrixUniforms();
        gl.drawElements(gl.TRIANGLES, figures.cube.vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
        mvPopMatrix();
    }

    //sphere color
    texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    color = new Uint8Array(figures.smallSphere.color);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, color);
    radius = 9;
    center = [10, 1, 0];
    for (let i = 0; i < 2 * Math.PI; i += 0.11) {
        mvPushMatrix();
        center[0] = radius * Math.cos(i);
        center[2] = radius * Math.sin(i);
        center[1] = center[1];
        mat4.translate(mvMatrix, center);
        mat4.translate(mvMatrix, figures.smallSphere.center);
        mat4.scale(mvMatrix, figures.smallSphere.scale);
        setBuffersToShaders(
            figures.smallSphere.vertexPositionBuffer,
            figures.smallSphere.vertexTextureCoordBuffer,
            figures.smallSphere.vertexNormalBuffer
            );
        // gl.activeTexture(gl.TEXTURE0);
        // gl.bindTexture(gl.TEXTURE_2D, smallSphereTexture);
        // gl.uniform1i(shaderProgram.samplerUniform, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, figures.smallSphere.vertexNormalBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, figures.smallSphere.vertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, figures.smallSphere.vertexIndexBuffer);
        setMatrixUniforms();
        gl.drawElements(gl.TRIANGLES, figures.smallSphere.vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
        mvPopMatrix();
    }

    //sphere color
    // texture = gl.createTexture();
    // gl.bindTexture(gl.TEXTURE_2D, texture);
    // color = new Uint8Array(figures.bigSphere.color);
    // gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, color);
    mvPushMatrix();
    mat4.translate(mvMatrix, figures.bigSphere.center);
    mat4.scale(mvMatrix, figures.bigSphere.scale);
    setBuffersToShaders(
        figures.bigSphere.vertexPositionBuffer,
        figures.bigSphere.vertexTextureCoordBuffer,
        figures.bigSphere.vertexNormalBuffer);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, sphereTexture);
    gl.uniform1i(shaderProgram.samplerUniform, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, figures.bigSphere.vertexIndexBuffer);
    setMatrixUniforms();
    gl.drawElements(gl.TRIANGLES, figures.bigSphere.vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
    mvPopMatrix();

}

function setBuffersToShaders(posBuffer, textureCoordsBuffer, normalBuffer) {
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, posBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER,  textureCoordsBuffer);
    gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, textureCoordsBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, normalBuffer.itemSize, gl.FLOAT, false, 0, 0);
}

function update_scene() {
    let cur_figure = document.getElementById("cur_figure").value;
    let color_list = document.getElementsByName("color");
    let color = [];
    for (let i = 0; i < color_list.length; i++) {
        color.push(color_list[i].value / 255)
    }
    gl.lineWidth(document.getElementById("line_width").value);
    for (let i = 0; i < figures.length; i++) {
        if (cur_figure === figures[i].name) {
            figures[i].color = color;
            figures[i].initBuffers();
        }
    }
    drawScene();
}

let currentlyPressedKeys = {};
let yCameraPos = 7, zCameraPos = 25, xCameraPos = 0;

function handleKeyDown(event) {
    currentlyPressedKeys[event.keyCode] = true;
    handleKeys();
}

function handleKeyUp(event) {
    currentlyPressedKeys[event.keyCode] = false;
}

function handleKeys() {
    if (currentlyPressedKeys[33]) {
        // Page Up
        zCameraPos = zCameraPos < 100 ? zCameraPos + 1 : zCameraPos;
    }
    if (currentlyPressedKeys[34]) {
        // Page Down
        zCameraPos = zCameraPos > -100 ? zCameraPos - 1 : zCameraPos;
    }
    if (currentlyPressedKeys[37]) {
        // Left cursor key
        xCameraPos = xCameraPos < 20 ? xCameraPos + 1 : xCameraPos;
    }
    if (currentlyPressedKeys[39]) {
        // Right cursor key
        xCameraPos = xCameraPos > -20 ? xCameraPos - 1 : xCameraPos;
    }
    if (currentlyPressedKeys[38]) {
        // Up cursor key
        yCameraPos = yCameraPos < 100 ? yCameraPos + 1 : yCameraPos;
    }
    if (currentlyPressedKeys[40]) {
        // Down cursor key
        yCameraPos = yCameraPos > -100 ? yCameraPos - 1 : yCameraPos;
    }
    drawScene();
}