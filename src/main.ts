import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import './style.css'
// @ts-ignore
import DrawCallInspector from './DrawCallInspector.js'
// @ts-ignore
window.DrawCallInspector = DrawCallInspector;window.THREE = THREE
async function init() {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);
  const cube2 = new THREE.Mesh(geometry, material);
  cube2.position.x = 2
  scene.add(cube2);

  const dci = new DrawCallInspector(renderer, scene, camera)
  dci.mount()
  const controls = new OrbitControls(camera, renderer.domElement);
  camera.position.z = 5;

  function animate() {
    requestAnimationFrame(animate);
    controls.update()
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    dci.update()
    dci.begin()
    renderer.render(scene, camera);
    dci.end()
  }

  animate();

  function resize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  window.addEventListener('resize', resize)
}

init()