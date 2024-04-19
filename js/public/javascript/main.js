// WebGL shader loading utility functions
function loadShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

function createShaderProgram(gl, vertexShaderSource, fragmentShaderSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    if (!vertexShader || !fragmentShader) {
        return null;
    }

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Program linking error:', gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
    }

    return program;
}

// Utility function for processing continuous input
function processInput(camera, deltaTime) {
    // Movement Controls
    if (cameraMode) {
        if (keys['KeyW']) camera.move(Direction.Forward, deltaTime);
        if (keys['KeyS']) camera.move(Direction.Backward, deltaTime);
        if (keys['KeyA']) camera.move(Direction.Left, deltaTime);
        if (keys['KeyD']) camera.move(Direction.Right, deltaTime);
        if (keys['Space']) camera.move(Direction.Up, deltaTime);
        if (keys['ShiftLeft']) camera.move(Direction.Down, deltaTime);
    }
}

// Event callback for keyboard input
function keyCallback(event) {
    const keyState = event.type === 'keydown';
    keys[event.code] = keyState;

    // Toggles Camera Movement Mode (F key)
    if (event.code === 'KeyF' && keyState) {
        cameraMode = !cameraMode;
        if (cameraMode) {
            document.pointerLockElement = canvas;
        } else {
            document.exitPointerLock();
        }
    }

    // Close the program (Escape key)
    if (event.code === 'Escape' && keyState) {
        document.exitPointerLock();
    }
}

// Event callback for mouse movement
function mouseCallback(event) {
    if (camera.firstMouse) {
        lastX = event.clientX;
        lastY = event.clientY;
        camera.firstMouse = false;
    }

    const xOffset = event.clientX - lastX;
    const yOffset = lastY - event.clientY;
    lastX = event.clientX;
    lastY = event.clientY;

    if (cameraMode) {
        camera.rotate(xOffset, yOffset);
    }
}

// WebGL initialization
function main() {
    const canvas = document.getElementById('canvas');
    const gl = canvas.getContext('webgl');

    if (!gl) {
        console.error('WebGL context not available');
        return;
    }
    // Corrected fragment shader source code
    var terrainFragmentShaderSource = `


            precision mediump float;

            // Output color
            out vec4 FragColor;

            // Input from the vertex shader
            in vec3 norm;
            in vec3 fragment_position;
            in vec3 color;

            // Uniforms (values passed from JavaScript)
            uniform vec3 light_pos;
            uniform vec3 light_color;

            void main() {
                // Calculate light direction and normalize it
                vec3 light_direction = normalize(light_pos - fragment_position);

                // Calculate diffuse factor using Lambert's cosine law
                float diffuse_factor = max(dot(norm, light_direction), 0.0);

                // Calculate diffuse lighting contribution
                vec3 diffuse_lighting = diffuse_factor * light_color;

                // Ambient color (adjust as needed)
                vec3 ambient_color = vec3(0.3);

                // Final color with ambient and diffuse lighting
                vec3 final_color = (ambient_color + diffuse_lighting) * color;

                // Output the final color with full opacity
                FragColor = vec4(final_color, 1.0);
            }
    `;


    var terrainVertexShaderSource=`
    
            #version 330 core

            #define PI 3.141592
            #define FNLfloat float

            layout (location = 0) in vec3 aPos;
            out vec3 color;

            uniform mat4 model;
            uniform mat4 vp;
            uniform float x_pos;
            uniform float z_pos;

            uniform float amp;
            uniform float freq;
            uniform float gain;
            uniform float lacunarity;
            uniform float fudge;
            uniform int seed;

            // Beginning of FastNoiseLite Code
            const int PRIME_X = 501125321;
            const int PRIME_Y = 1136930381;
            const float GRADIENTS_2D[256] = float[](
                0.130526192220052f, 0.99144486137381f, 0.38268343236509f, 0.923879532511287f, 0.608761429008721f, 0.793353340291235f, 0.793353340291235f, 0.608761429008721f,
                0.923879532511287f, 0.38268343236509f, 0.99144486137381f, 0.130526192220051f, 0.99144486137381f, -0.130526192220051f, 0.923879532511287f, -0.38268343236509f,
                0.793353340291235f, -0.60876142900872f, 0.608761429008721f, -0.793353340291235f, 0.38268343236509f, -0.923879532511287f, 0.130526192220052f, -0.99144486137381f,
                -0.130526192220052f, -0.99144486137381f, -0.38268343236509f, -0.923879532511287f, -0.608761429008721f, -0.793353340291235f, -0.793353340291235f, -0.608761429008721f,
                -0.923879532511287f, -0.38268343236509f, -0.99144486137381f, -0.130526192220052f, -0.99144486137381f, 0.130526192220051f, -0.923879532511287f, 0.38268343236509f,
                -0.793353340291235f, 0.608761429008721f, -0.608761429008721f, 0.793353340291235f, -0.38268343236509f, 0.923879532511287f, -0.130526192220052f, 0.99144486137381f,
                0.130526192220052f, 0.99144486137381f, 0.38268343236509f, 0.923879532511287f, 0.608761429008721f, 0.793353340291235f, 0.793353340291235f, 0.608761429008721f,
                0.923879532511287f, 0.38268343236509f, 0.99144486137381f, 0.130526192220051f, 0.99144486137381f, -0.130526192220051f, 0.923879532511287f, -0.38268343236509f,
                0.793353340291235f, -0.60876142900872f, 0.608761429008721f, -0.793353340291235f, 0.38268343236509f, -0.923879532511287f, 0.130526192220052f, -0.99144486137381f,
                -0.130526192220052f, -0.99144486137381f, -0.38268343236509f, -0.923879532511287f, -0.608761429008721f, -0.793353340291235f, -0.793353340291235f, -0.608761429008721f,
                -0.923879532511287f, -0.38268343236509f, -0.99144486137381f, -0.130526192220052f, -0.99144486137381f, 0.130526192220051f, -0.923879532511287f, 0.38268343236509f,
                -0.793353340291235f, 0.608761429008721f, -0.608761429008721f, 0.793353340291235f, -0.38268343236509f, 0.923879532511287f, -0.130526192220052f, 0.99144486137381f,
                0.130526192220052f, 0.99144486137381f, 0.38268343236509f, 0.923879532511287f, 0.608761429008721f, 0.793353340291235f, 0.793353340291235f, 0.608761429008721f,
                0.923879532511287f, 0.38268343236509f, 0.99144486137381f, 0.130526192220051f, 0.99144486137381f, -0.130526192220051f, 0.923879532511287f, -0.38268343236509f,
                0.793353340291235f, -0.60876142900872f, 0.608761429008721f, -0.793353340291235f, 0.38268343236509f, -0.923879532511287f, 0.130526192220052f, -0.99144486137381f,
                -0.130526192220052f, -0.99144486137381f, -0.38268343236509f, -0.923879532511287f, -0.608761429008721f, -0.793353340291235f, -0.793353340291235f, -0.608761429008721f,
                -0.923879532511287f, -0.38268343236509f, -0.99144486137381f, -0.130526192220052f, -0.99144486137381f, 0.130526192220051f, -0.923879532511287f, 0.38268343236509f,
                -0.793353340291235f, 0.608761429008721f, -0.608761429008721f, 0.793353340291235f, -0.38268343236509f, 0.923879532511287f, -0.130526192220052f, 0.99144486137381f,
                0.130526192220052f, 0.99144486137381f, 0.38268343236509f, 0.923879532511287f, 0.608761429008721f, 0.793353340291235f, 0.793353340291235f, 0.608761429008721f,
                0.923879532511287f, 0.38268343236509f, 0.99144486137381f, 0.130526192220051f, 0.99144486137381f, -0.130526192220051f, 0.923879532511287f, -0.38268343236509f,
                0.793353340291235f, -0.60876142900872f, 0.608761429008721f, -0.793353340291235f, 0.38268343236509f, -0.923879532511287f, 0.130526192220052f, -0.99144486137381f,
                -0.130526192220052f, -0.99144486137381f, -0.38268343236509f, -0.923879532511287f, -0.608761429008721f, -0.793353340291235f, -0.793353340291235f, -0.608761429008721f,
                -0.923879532511287f, -0.38268343236509f, -0.99144486137381f, -0.130526192220052f, -0.99144486137381f, 0.130526192220051f, -0.923879532511287f, 0.38268343236509f,
                -0.793353340291235f, 0.608761429008721f, -0.608761429008721f, 0.793353340291235f, -0.38268343236509f, 0.923879532511287f, -0.130526192220052f, 0.99144486137381f,
                0.130526192220052f, 0.99144486137381f, 0.38268343236509f, 0.923879532511287f, 0.608761429008721f, 0.793353340291235f, 0.793353340291235f, 0.608761429008721f,
                0.923879532511287f, 0.38268343236509f, 0.99144486137381f, 0.130526192220051f, 0.99144486137381f, -0.130526192220051f, 0.923879532511287f, -0.38268343236509f,
                0.793353340291235f, -0.60876142900872f, 0.608761429008721f, -0.793353340291235f, 0.38268343236509f, -0.923879532511287f, 0.130526192220052f, -0.99144486137381f,
                -0.130526192220052f, -0.99144486137381f, -0.38268343236509f, -0.923879532511287f, -0.608761429008721f, -0.793353340291235f, -0.793353340291235f, -0.608761429008721f,
                -0.923879532511287f, -0.38268343236509f, -0.99144486137381f, -0.130526192220052f, -0.99144486137381f, 0.130526192220051f, -0.923879532511287f, 0.38268343236509f,
                -0.793353340291235f, 0.608761429008721f, -0.608761429008721f, 0.793353340291235f, -0.38268343236509f, 0.923879532511287f, -0.130526192220052f, 0.99144486137381f,
                0.38268343236509f, 0.923879532511287f, 0.923879532511287f, 0.38268343236509f, 0.923879532511287f, -0.38268343236509f, 0.38268343236509f, -0.923879532511287f,
                -0.38268343236509f, -0.923879532511287f, -0.923879532511287f, -0.38268343236509f, -0.923879532511287f, 0.38268343236509f, -0.38268343236509f, 0.923879532511287f
            );

            float _fnlLerp(float a, float b, float t) { return mix(a, b, t); }
            int _fnlFastFloor(FNLfloat f) { return int(floor(f)); }
            float _fnlInterpQuintic(float t) { return t * t * t * (t * (t * 6.0 - 15.0) + 10.0); }
            
            int _fnlHash2D(int seed, int xPrimed, int yPrimed) {
                int hash = seed ^ xPrimed ^ yPrimed;
                hash *= 0x27d4eb2d;
                return hash;
            }

            float _fnlGradCoord2D(int seed, int xPrimed, int yPrimed, float xd, float yd) {
                int hash = _fnlHash2D(seed, xPrimed, yPrimed);
                hash ^= hash >> 15;
                hash &= 127 << 1;
                return xd * GRADIENTS_2D[hash] + yd * GRADIENTS_2D[hash | 1];
            }

            float _fnlSinglePerlin2D(int seed, FNLfloat x, FNLfloat y) {
                int x0 = _fnlFastFloor(x);
                int y0 = _fnlFastFloor(y);
                float xd0 = x - float(x0);
                float yd0 = y - float(y0);
                float xd1 = xd0 - 1.0;
                float yd1 = yd0 - 1.0;

                float xs = _fnlInterpQuintic(xd0);
                float ys = _fnlInterpQuintic(yd0);

                x0 *= PRIME_X;
                y0 *= PRIME_Y;
                int x1 = x0 + PRIME_X;
                int y1 = y0 + PRIME_Y;

                float xf0 = _fnlLerp(_fnlGradCoord2D(seed, x0, y0, xd0, yd0), _fnlGradCoord2D(seed, x1, y0, xd1, yd0), xs);
                float xf1 = _fnlLerp(_fnlGradCoord2D(seed, x0, y1, xd0, yd1), _fnlGradCoord2D(seed, x1, y1, xd1, yd1), xs);

                return _fnlLerp(xf0, xf1, ys) * 1.4247691104677813;
            }
            // End of FastNoiseLite Code

            out vertex_shader_out {
                vec3 fragment_position;
            } vs_out;

            void main() {
                float total = 0.0;
                float amp_tracker = amp;
                float freq_tracker = freq;
            
                vec3 terrain = vec3(aPos.x, 0.0, aPos.z);
                
                for (int i = 0; i < 6; i++) {
                    terrain.y += amp_tracker * _fnlSinglePerlin2D(seed + i, (aPos.x + x_pos) * freq_tracker, (aPos.z + z_pos) * freq_tracker);
                    total += amp_tracker;
                    freq_tracker *= lacunarity;
                    amp_tracker *= gain;
                }
            
                terrain.y /= total;
                terrain.y = (terrain.y * fudge) * (terrain.y * fudge) * (terrain.y * fudge);
            
                gl_Position = vp * model * vec4(terrain, 1.0);
                vs_out.fragment_position = vec3(model * vec4(terrain, 1.0));
            }
            
    
    `;





    var terrainGeomShaderSource=`

            #version 330 core

            layout (triangles) in;
            layout (triangle_strip, max_vertices = 3) out;
            
            in vertex_shader_out {
                vec3 fragment_position;
            } gs_in[];
            
            out vec3 fragment_position;
            out vec3 color;
            out vec3 norm;
            
            vec3 compute_color(float height) {
                if (height >= 0.3) {
                    return vec3(200.0, 200.0, 200.0) / 255.0;
                } else if (height >= 0.02) {
                    return vec3(100.0, 100.0, 100.0) / 255.0;
                } else if (height >= -0.01) {
                    return vec3(36.0, 140.0, 64.0) / 255.0;
                } else {
                    return vec3(255.0, 224.0, 138.0) / 255.0;
                }
            }
            
            void main() {
                // flat shading
                vec3 edge1 = gs_in[1].fragment_position - gs_in[0].fragment_position;
                vec3 edge2 = gs_in[2].fragment_position - gs_in[0].fragment_position;
                norm = normalize(cross(edge1, edge2));
            
                for (int i = 0; i < 3; ++i) {
                    gl_Position = gl_in[i].gl_Position;
                    fragment_position = gs_in[i].fragment_position;
                    color = compute_color(gs_in[i].fragment_position.y);
                    EmitVertex();
                }
            
                EndPrimitive();
            }
            
    
    `;

    // var waterVertexShaderSource="shaders/water/waterVert.glsl"
    // var waterFragmentShaderSource="shaders/water/waterFrag.glsl"

    // Shader programs
    const terrainShader = createShaderProgram(gl, terrainVertexShaderSource, terrainFragmentShaderSource,terrainGeomShaderSource);
    const waterShader = createShaderProgram(gl, waterVertexShaderSource, waterFragmentShaderSource);

    if (!terrainShader || !waterShader) {
        console.error('Shader program creation failed');
        return;
    }

    // Initialize objects
    const terrain = new Terrain(15.0, 15.0, 1200);
    const water = new Water();
    const camera = new Camera(vec3.fromValues(0.0, 0.0, 0.0));
    const light = new PointLight();

    // Event listeners
    document.addEventListener('keydown', keyCallback);
    document.addEventListener('keyup', keyCallback);
    canvas.addEventListener('mousemove', mouseCallback);

    // Main render loop
    let prevTime = performance.now();

    function render() {
        const currentTime = performance.now();
        const deltaTime = (currentTime - prevTime) / 1000.0;
        prevTime = currentTime;

        processInput(camera, deltaTime);

        gl.clearColor(0.1, 0.1, 0.1, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        terrain.draw(gl, terrainShader, camera, light);
        water.draw(gl, waterShader, camera, light, terrain.width, terrain.height);

        requestAnimationFrame(render);
    }

    render();
}

// Start WebGL main function when DOM content is loaded
document.addEventListener('DOMContentLoaded', main);

