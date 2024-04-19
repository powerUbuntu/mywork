// water.js

class Water {
    constructor(gl) {
        this.gl = gl;
        this.waterLevel = 0.055;
        this.color = [0.0, 188.0, 255.0]; // Color in RGB (converted to [0, 1] range)
        this.VAO = null;
        this.VBO = null;
        this.EBO = null;
        this.setupMesh();
    }

    setupMesh() {
        const waterMesh = [
            0.5, 0.0, 0.5, 1.0, 1.0,
            0.5, 0.0, -0.5, 1.0, 0.0,
            -0.5, 0.0, -0.5, 0.0, 0.0,
            -0.5, 0.0, 0.5, 0.0, 1.0,
        ];

        const waterIndices = [
            0, 1, 2,
            0, 2, 3,
        ];

        this.VAO = gl.createVertexArray();
        this.gl.bindVertexArray(this.VAO);

        this.VBO = gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.VBO);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(waterMesh), this.gl.STATIC_DRAW);

        this.EBO = gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.EBO);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(waterIndices), this.gl.STATIC_DRAW);

        this.gl.vertexAttribPointer(0, 3, this.gl.FLOAT, false, 5 * Float32Array.BYTES_PER_ELEMENT, 0);
        this.gl.enableVertexAttribArray(0);

        this.gl.vertexAttribPointer(1, 2, this.gl.FLOAT, false, 5 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);
        this.gl.enableVertexAttribArray(1);

        this.gl.bindVertexArray(null);
    }

    draw(shader, camera, light, width, height) {
        shader.use();

        shader.setVec3('color', this.color.map(c => c / 255)); // Convert color to [0, 1] range
        shader.setVec3('light_color', light.getColor());

        const model = mat4.create();
        mat4.translate(model, model, [width / 2.0, -0.1, height / 2.0]);
        mat4.scale(model, model, [15.0, 1.0, 15.0]);
        shader.setMat4('model', model);
        shader.setMat4('vp', camera.getVPMatrix());
        shader.setFloat('water_level', this.waterLevel);

        this.gl.bindVertexArray(this.VAO);
        this.gl.drawElements(this.gl.TRIANGLES, 6, this.gl.UNSIGNED_INT, 0);
        this.gl.bindVertexArray(null);
    }
}

export default Water;

