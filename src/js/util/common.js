import * as THREE from "three";


function createPerspectiveCamera(fov = 60, aspect = 1, near = 0.1, far = 2000) {
    return new THREE.PerspectiveCamera(fov, aspect, near, far);
}


function createWebGLRenderer(canvas, width, height, clearColor = 0xffffff) {
    const renderer =  new THREE.WebGLRenderer({
        canvas,
        antialias: true
    });
    renderer.setClearColor(clearColor, 1);
    renderer.setSize(width, height);
    return renderer;
}

function createOrbitControls(camera, canvas) {
    const OrbitControls = require('three-orbit-controls')(THREE)
    return new OrbitControls(camera, canvas);
}

function createVector3(x, y, z) {
    return new THREE.Vector3(x, y, z);
}

function shouldResize(renderer) {
    const canvas = renderer.domElement;
    const resize = canvas.clientWidth !== canvas.width || canvas.clientHeight !== canvas.height;
    if (resize) {
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        return true;
    }
    return resize;
}

export {createWebGLRenderer, createPerspectiveCamera, createOrbitControls, createVector3, shouldResize};