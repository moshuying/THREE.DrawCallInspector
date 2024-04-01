import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import './style.css'
// @ts-ignore
import DrawCallInspector from './DrawCallInspector.js'
// @ts-ignore
window.DrawCallInspector = DrawCallInspector; window.THREE = THREE
async function init() {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

  const renderer = new THREE.WebGLRenderer({
    // alpha: true,
  });
  renderer.autoClear = false
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);
  const cube2 = new THREE.Mesh(geometry, material);
  cube2.position.x = 2
  scene.add(cube2);

  const sphere = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 32), new THREE.MeshStandardMaterial({
    map: new THREE.TextureLoader().load('https://threejs.org/examples/textures/brick_diffuse.jpg')
  }))
  sphere.position.x = -10
  cube2.add(sphere)

  for (let i = 0; i < 100; i++) {
    const sphere = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 32), new THREE.MeshBasicMaterial({ color: 'red' }))
    sphere.position.x = Math.random() * 10
    sphere.position.y = Math.random() * 10
    sphere.position.z = Math.random() * 10
    cube2.add(sphere)
  }

  const dci = new DrawCallInspector(renderer, scene, camera)
  dci.mount()
  const controls = new OrbitControls(camera, renderer.domElement);
  camera.position.z = 5;

  const orth = new THREE.OrthographicCamera(- window.innerWidth / 2, window.innerWidth / 2, window.innerHeight / 2, - window.innerHeight / 2, 1, 10)
  orth.position.z = 10
  const uiScene = new THREE.Scene()

  const sprite1 = new THREE.Sprite(new THREE.SpriteMaterial({ color: '#69f' }));
  sprite1.position.set(0, 0, 0);
  sprite1.scale.set(window.innerWidth/4, window.innerHeight/4, 1);
  uiScene.add(sprite1);

  const width = window.innerWidth / 4;
  const height = window.innerHeight / 4;
  sprite1.position.set( width, - height, 1 ); // bottom right

  // video source ./3e792f050ebe8d2a41ba7c3f9cf3f8ea.mp4
  const video = document.createElement('video')
  video.src = './5a34493b897ab41ee8d2ea675739c39a.mp4'
  // video.src = './3e792f050ebe8d2a41ba7c3f9cf3f8ea.mp4'
  video.autoplay = true
  video.loop = true
  video.id = 'video'
  video.crossOrigin = 'anonymous'
  video.playsInline = true
  video.style.display = 'none'
  document.body.appendChild(video)

  const shaderVideo = new THREE.VideoTexture(video)
  shaderVideo.minFilter = THREE.NearestFilter;
  const shaderMaterial = new THREE.MeshBasicMaterial({
    map: shaderVideo,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  })
  // const shaderMaterial = new THREE.ShaderMaterial({
  //   uniforms: {
  //     map: { value: shaderVideo }
  //   },
  //   blending: THREE.AdditiveBlending,
  //   depthTest: false,
  //   // depthWrite: false,
  //   transparent: true,
  //   vertexShader: `
  //     varying vec2 vUv;
  //     void main() {
  //       vUv = uv;
  //       gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  //     }
  //   `,
  //   fragmentShader: `
  //   uniform sampler2D map;

  //   varying vec2 vUv;

  //   void main() {

  //     vec4 color = texture2D( map, vUv );
  //     gl_FragColor = vec4( color.r, color.g, color.b, color.a );

  //   }
  //   `
  // })
  const shaderMesh = new THREE.Mesh(new THREE.PlaneGeometry(720, 1280), shaderMaterial)
  const videoScale = 0.2
  shaderMesh.scale.set(videoScale,videoScale,1)
  shaderMesh.position.set(
    window.innerWidth / 2 - 720 / 2 * videoScale,
    window.innerHeight / 2 - 1280 / 2 * videoScale,
    0
  )
  video.addEventListener('canplay', (e) => {
    // console.log(e.target.videoWidth, e.target.videoHeight)
    // @ts-ignore
    const {width,height} = e.target
    // shaderMesh.scale.set(width*0.2, height*0.2, 1)
  })
  uiScene.add(shaderMesh)

  function animate() {
    requestAnimationFrame(animate);
    controls.update()
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    dci.update()
    dci.begin()
    // renderer.clear()
    renderer.render(scene, camera);
    dci.end()
    // renderer.clearDepth()
    renderer.render(uiScene, orth)
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