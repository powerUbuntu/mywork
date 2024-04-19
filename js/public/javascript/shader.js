// shader.js

class Shader {
    constructor(gl, vertexShaderSource, fragmentShaderSource, geometryShaderSource = null) {
        this.gl = gl;
        this.program = this.createShaderProgram(vertexShaderSource, fragmentShaderSource, geometryShaderSource);
    }

    createShaderProgram(vertexShaderSource, fragmentShaderSource, geometryShaderSource) {
        const program = this.gl.createProgram();

        const vertexShader = this.compileShader(this.gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = this.compileShader(this.gl.FRAGMENT_SHADER, fragmentShaderSource);

        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);

        if (geometryShaderSource) {
            const geometryShader = this.compileShader(this.gl.GEOMETRY_SHADER, geometryShaderSource);
            this.gl.attachShader(program, geometryShader);
        }

        this.gl.linkProgram(program);

        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            const error = this.gl.getProgramInfoLog(program);
            console.error('Error linking shader program:', error);
            this.gl.deleteProgram(program);
            return null;
        }

        return program;
    }

    compileShader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);

        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            const error = this.gl.getShaderInfoLog(shader);
            console.error(`Error compiling shader (type ${type}):`, error);
            this.gl.deleteShader(shader);
            return null;
        }

        return shader;
    }

    use() {
        this.gl.useProgram(this.program);
    }

    setInt(name, value) {
        const location = this.gl.getUniformLocation(this.program, name);
        this.gl.uniform1i(location, value);
    }

    setFloat(name, value) {
        const location = this.gl.getUniformLocation(this.program, name);
        this.gl.uniform1f(location, value);
    }

    setBool(name, value) {
        const location = this.gl.getUniformLocation(this.program, name);
        this.gl.uniform1i(location, value ? 1 : 0);
    }

    setMat4(name, value) {
        const location = this.gl.getUniformLocation(this.program, name);
        this.gl.uniformMatrix4fv(location, false, value);
    }

    setVec3(name, value) {
        const location = this.gl.getUniformLocation(this.program, name);
        this.gl.uniform3fv(location, value);
    }

    setVec2(name, value) {
        const location = this.gl.getUniformLocation(this.program, name);
        this.gl.uniform2fv(location, value);
    }
}

export default Shader;

