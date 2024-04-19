// point_light.js

class PointLight {
    constructor() {
        this.resetSettings();
    }

    resetSettings() {
        this.color = [1.0, 1.0, 1.0];   // White color by default
        this.position = [3.0, 10.0, -4.0]; // Default position
    }

    getColor() {
        return this.color;
    }

    setColor(r, g, b) {
        this.color = [r, g, b];
    }

    getPosition() {
        return this.position;
    }

    setPosition(x, y, z) {
        this.position = [x, y, z];
    }
}

export default PointLight;

