import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import './style.css'
// @ts-ignore
import DrawCallInspector from './DrawCallInspector.js'
// @ts-ignore
window.DrawCallInspector = DrawCallInspector; window.THREE = THREE
async function init() {
  const scene = new THREE.Scene();
  new THREE.TextureLoader().load('https://threejs.org/examples/textures/uv_grid_opengl.jpg', texture => {
    scene.background = texture
  })
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

  // const sprite1 = new THREE.Sprite(new THREE.SpriteMaterial({ color: '#69f' }));
  // sprite1.position.set(0, 0, 0);
  // sprite1.scale.set(window.innerWidth / 4, window.innerHeight / 4, 1);
  // uiScene.add(sprite1);

  const width = window.innerWidth / 4;
  const height = window.innerHeight / 4;
  // sprite1.position.set(width, - height, 1); // bottom right

  // video source ./3e792f050ebe8d2a41ba7c3f9cf3f8ea.mp4
  const video = document.createElement('video')
  // video.src = 'd15fbc8c6cf884d2d517e0d933f638d8.mp4'
  // video.src = './3e792f050ebe8d2a41ba7c3f9cf3f8ea.mp4'
  video.src = './f6bdd7db1458c71655ffa51de8168bbe.mp4'
  // video.autoplay = true
  video.loop = true
  video.id = 'video'
  video.crossOrigin = 'anonymous'
  video.playsInline = true
  video.style.display = 'none'
  document.body.appendChild(video)
  const videoState = {
    duration: 0,// 视频时长
    currentTime: 0,// 当前播放时间
    width: 0,// 视频宽度
    height: 0,// 视频高度
    paused: true,// 是否暂停
  }
  video.addEventListener('pause', (e) => {videoState.paused = true})
  video.addEventListener('play', (e) => {videoState.paused = false})
  video.addEventListener('loadedmetadata', (e) => {
    videoState.width = video.videoWidth
    videoState.height = video.videoHeight
    videoState.duration = video.duration

  })
  document.addEventListener('keydown', (e) => {
    // ctrl + shift + space
    if (e.ctrlKey && e.shiftKey && e.code === 'Space') {
      // 翻转播放状态
      console.log('videoState.paused', videoState.paused)
      if(videoState.paused) {
        video.play();
      } else {
        video.pause()
      }
    }
  })
  const shaderVideo = new THREE.VideoTexture(video)
  shaderVideo.minFilter = THREE.NearestFilter;
  // const shaderMaterial = new THREE.MeshBasicMaterial({
  //   map: shaderVideo,
  //   transparent: true,
  //   depthTest: false,
  //   depthWrite: false,
  //   blending: THREE.CustomBlending,
  //   blendEquation: THREE.AddEquation,
  //   blendSrc: THREE.SrcColorFactor,
  //   // blendDst: THREE.OneMinusSrcColorFactor,
  //   blendDst: THREE.OneMinusSrcColorFactor,
  // })

  // 针对绿幕
  const shaderMaterial = new THREE.ShaderMaterial({
    uniforms: {
      videoTexture: { value: shaderVideo },
      backColor: { value: new THREE.Color('#6edd68') },
      // backColor: { value: new THREE.Color('#6edd68') },
      threshold: { value: 0.05 }
    },
    // blending: THREE.AdditiveBlending,
    depthTest: false,
    // depthWrite: false,
    transparent: true,
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
   
	uniform sampler2D videoTexture;
	uniform float threshold;
	varying vec2 vUv;
	void main() {
		vec4 color = texture2D(videoTexture, vUv);
		float greenScreen = color.g - max(color.r, color.b);
		float alpha = 1.0 - smoothstep(threshold - 0.05, threshold + 0.05, greenScreen);
		gl_FragColor = vec4(color.rgb, alpha);
  }
    `
  })

  // const shaderMaterial = new THREE.ShaderMaterial({
  //   uniforms: {
  //     pointTexture: { value: shaderVideo },
  //     backColor:{ value: new THREE.Color('#6edd68') },
  //     u_threshold:{value: 0.5}
  //   },
  //   // blending: THREE.AdditiveBlending,
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
  //   uniform sampler2D pointTexture;
  //   uniform vec3 backColor;//背景色
  //   varying vec2 vUv;
  //   uniform float u_threshold;
  //   float u_clipBlack=0.2;
  //   float u_clipWhite=4.;

  //   float rgb2cb(float r, float g, float b){ return 0.5 + -0.168736*r - 0.331264*g + 0.5*b; } 
  //   float rgb2cr(float r, float g, float b){ return 0.5 + 0.5*r - 0.418688*g - 0.081312*b; } 
  //   float smoothclip(float low, float high, float x){ if (x <= low){ return 0.0; } if(x >= high){ return 1.0; } return (x-low)/(high-low); }
  //   vec4 greenscreen(vec4 colora, float Cb_key,float Cr_key, float tola,float tolb, float clipBlack, float clipWhite)
  //   { 
  //     float cb = rgb2cb(colora.r,colora.g,colora.b); 
  //     float cr = rgb2cr(colora.r,colora.g,colora.b); 
  //     float alpha = distance(vec2(cb, cr), vec2(Cb_key, Cr_key)); 
  //       alpha = smoothclip(tola, tolb, alpha); 
  //       float r = max(gl_FragColor.r - (1.0-alpha)*backColor.r, 0.0); 
  //       float g = max(gl_FragColor.g - (1.0-alpha)*backColor.g, 0.0); 
  //       float b = max(gl_FragColor.b - (1.0-alpha)*backColor.b, 0.0); 
  //       if(alpha < clipBlack){ alpha = r = g = b = 0.0; } 
  //       if(alpha > clipWhite){ alpha = 1.0; } 
  //       if(clipWhite < 1.0){ alpha = alpha/max(clipWhite, 0.9); } 
  //       return vec4(r,g,b, alpha); 
  //   }
  //   void main( void ) {

  //       gl_FragColor = vec4(texture2D(pointTexture, vUv).rgb, 1);

  //       float tola = 0.0; 
  //       float tolb = u_threshold/2.0; 
  //       float cb_key = rgb2cb(backColor.r, backColor.g, backColor.b); 
  //       float cr_key = rgb2cr(backColor.r, backColor.g, backColor.b); 
  //       gl_FragColor = greenscreen(gl_FragColor, cb_key, cr_key, tola, tolb, u_clipBlack, u_clipWhite);

  //   }
  //   `
  // })

  const shaderMesh = new THREE.Mesh(new THREE.PlaneGeometry(720, 1280), shaderMaterial)
  function updateShaderMeshSize() {
    orth.left = - window.innerWidth / 2
    orth.right = window.innerWidth / 2
    orth.top = window.innerHeight / 2
    orth.bottom = - window.innerHeight / 2
    orth.updateProjectionMatrix()
    // 高度为屏幕高度的 50%
    const videoScale = window.innerHeight * 0.5 / 1280
    shaderMesh.scale.set(videoScale, videoScale, 1)
    shaderMesh.position.set(
      (window.innerWidth / 2 - 720 * videoScale / 2) -  window.innerWidth* 0.07,
      -window.innerHeight / 2 + 1280 * videoScale / 2,
      0
    )
  }
  updateShaderMeshSize()
  video.addEventListener('canplay', (e) => {
    // console.log(e.target.videoWidth, e.target.videoHeight)
    // @ts-ignore
    const { width, height } = e.target
    // shaderMesh.scale.set(width*0.2, height*0.2, 1)
  })
  uiScene.add(shaderMesh)

  function animate() {
    requestAnimationFrame(animate);
    controls.update()
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    // dci.update()
    // dci.begin()
    // renderer.clear()
    renderer.render(scene, camera);
    // dci.end()
    // renderer.clearDepth()
    renderer.render(uiScene, orth)
  }

  animate();

  function resize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    updateShaderMeshSize()
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  window.addEventListener('resize', resize)
}

init()