// terrain.js

class Terrain {
    constructor(gl, width, height, subdivisions) {
        this.gl = gl;
        this.seed = 314159265;
        this.width = width;
        this.height = height;
        this.subdivisions = subdivisions;
        this.meshVertices = [];
        this.VAO = null;
        this.VBO = null;
        this.resetSettings();
        this.generateMesh();
    }

    generateMesh() {
        for (let z = 0.0; z < this.height; z += this.height / this.subdivisions) {
            for (let x = 0.0; x < this.width; x += this.width / this.subdivisions) {
                // First triangle
                this.meshVertices.push(x, 0.0, z);
                this.meshVertices.push(x, 0.0, z + this.height / this.subdivisions);
                this.meshVertices.push(x + this.width / this.subdivisions, 0.0, z);

                // Second triangle
                this.meshVertices.push(x + this.width / this.subdivisions, 0.0, z);
                this.meshVertices.push(x, 0.0, z + this.height / this.subdivisions);
                this.meshVertices.push(x + this.width / this.subdivisions, 0.0, z + this.height / this.subdivisions);
            }
        }

        this.VAO = this.gl.createVertexArray();
        this.gl.bindVertexArray(this.VAO);

        this.VBO = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.VBO);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.meshVertices), this.gl.STATIC_DRAW);

        this.gl.vertexAttribPointer(0, 3, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(0);

        this.gl.bindVertexArray(null);
    }

    draw(shader, camera, light) {
        const model = mat4.create();

        shader.use();
        shader.setMat4('model', model);
        shader.setMat4('vp', camera.getVPMatrix());
        shader.setFloat('x_pos', camera.getPosition()[0]);
        shader.setFloat('z_pos', camera.getPosition()[2]);

        shader.setFloat('amp', this.amplitude);
        shader.setFloat('freq', this.frequency);
        shader.setFloat('gain', this.gain);
        shader.setFloat('lacunarity', this.lacunarity);
        shader.setFloat('fudge', this.contrast);
        shader.setInt('seed', this.seed);

        shader.setVec3('light_pos', light.getPosition());
        shader.setVec3('light_color', light.getColor());

        this.gl.bindVertexArray(this.VAO);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, this.meshVertices.length / 3);
        this.gl.bindVertexArray(null);
    }

    resetSettings() {
        // Set defaults
        this.amplitude = 1.0;
        this.frequency = 1.0;
        this.gain = 0.5;
        this.lacunarity = 2.0;
        this.contrast = 1.2;
    }
}

export default Terrain;

