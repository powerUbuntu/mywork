// camera.js

import { mat4, vec3, vec2, radians, normalize, cross } from 'gl-matrix';

class Camera {
    constructor(position) {
        this.position = position;

        this.aspectRatio = 1.0;
        this.fov = radians(45.0);
        this.yaw = -90.0;
        this.pitch = 0.0;

        this.movementSpeed = 5.0;
        this.mouseSensitivity = 0.1;

        this.firstMouse = true;
        this.updateCameraVectors();
    }

    move(direction, deltaTime) {
        const right = vec3.fromValues(this.right[0], 0.0, this.right[2]);
        const up = vec3.fromValues(0.0, 1.0, 0.0);
        const front = vec3.normalize(vec3.create(), vec3.cross(vec3.create(), right, up));

        switch (direction) {
            case 'Forward':
                vec2.scaleAndAdd(this.position, this.position, vec2.fromValues(front[0], front[2]), -this.movementSpeed * deltaTime);
                break;
            case 'Backward':
                vec2.scaleAndAdd(this.position, this.position, vec2.fromValues(front[0], front[2]), this.movementSpeed * deltaTime);
                break;
            case 'Left':
                vec2.scaleAndAdd(this.position, this.position, vec2.fromValues(this.right[0], this.right[2]), -this.movementSpeed * deltaTime);
                break;
            case 'Right':
                vec2.scaleAndAdd(this.position, this.position, vec2.fromValues(this.right[0], this.right[2]), this.movementSpeed * deltaTime);
                break;
            case 'Up':
                vec3.scaleAndAdd(this.position, this.position, up, this.movementSpeed * deltaTime);
                break;
            case 'Down':
                vec3.scaleAndAdd(this.position, this.position, up, -this.movementSpeed * deltaTime);
                break;
        }
    }

    rotate(xOffset, yOffset) {
        xOffset *= this.mouseSensitivity;
        yOffset *= this.mouseSensitivity;

        this.yaw += xOffset;
        this.pitch += yOffset;

        if (this.pitch > 89.0) this.pitch = 89.0;
        if (this.pitch < -89.0) this.pitch = -89.0;

        this.updateCameraVectors();
    }

    getViewProjectionMatrix() {
        const viewMatrix = mat4.lookAt(mat4.create(), this.position, vec3.add(vec3.create(), this.position, this.front), this.up);
        const projectionMatrix = mat4.perspective(mat4.create(), this.fov, this.aspectRatio, 0.1, 100.0);

        return mat4.multiply(mat4.create(), projectionMatrix, viewMatrix);
    }

    isFirstMouse() {
        return this.firstMouse;
    }

    unsetFirstMouse() {
        this.firstMouse = false;
    }

    getPosition() {
        return this.position;
    }

    setPosition(pos) {
        this.position = pos;
    }

    getFront() {
        return this.front;
    }

    getRight() {
        return this.right;
    }

    setAspectRatio(width, height) {
        this.aspectRatio = width / height;
    }

    resetSettings() {
        this.movementSpeed = 5.0;
    }

    updateCameraVectors() {
        const direction = vec3.fromValues(
            Math.cos(radians(this.yaw)) * Math.cos(radians(this.pitch)),
            Math.sin(radians(this.pitch)),
            Math.sin(radians(this.yaw)) * Math.cos(radians(this.pitch))
        );

        this.front = vec3.normalize(vec3.create(), direction);
        this.right = vec3.normalize(vec3.create(), vec3.cross(vec3.create(), this.front, vec3.fromValues(0.0, 1.0, 0.0)));
        this.up = vec3.normalize(vec3.create(), vec3.cross(vec3.create(), this.right, this.front));
    }
}

export default Camera;

