import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OutlineEffect } from 'three/addons/effects/OutlineEffect.js';

import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';


let scene, camera, renderer, sceneText;
let controls;

let fiveTone, fourTone, threeTone;

let modelLoader = new GLTFLoader();

let allObjects = new THREE.Group();

let color = [0x3b0000, 0xff80b9, 0xff0000, 0xfceeae, 0xeaffb9];
// let color = [0xb3ffae, 0xf8ffdb, 0xff6464, 0xff7d7d];

let materials = [];

let effect;

let text;

let outlineObjects = [];

let rotate = 0;
let count = 0;

let defaultTextParameter = {
  size: 8,
  height: 0,
  curSegments: 10,
  bevelThickness: 1,
  bevelSize: 1,
  bevelEnabled: false,
  bevelSegments: 10
}

const loader = new FontLoader();
//'fonts/Unbounded_Regular.json' or 'fonts/helvetiker_bold.typeface.json'
loader.load( 'fonts/cartoon.json', function ( font ) {

  //"Lexend_Deca_ExtraBold_Regular.json"
  init( font );

} );

function init(font) {
  scene = new THREE.Scene();
  sceneText = new THREE.Scene();

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.autoClear = false;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
  document.body.appendChild(renderer.domElement);

  let backgroundColor = new THREE.Color(color[0]);
  renderer.setClearColor(backgroundColor);

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  // controls = new OrbitControls(camera, renderer.domElement);

  // camera.position.set(300, 300, 300);
  // camera.lookAt(0, 10, 0);

  camera.position.set(80, 0, 0);
  camera.lookAt(80, 0, -10);

  // add light
  const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
  scene.add(directionalLight);
  directionalLight.position.set(-50, 0, -50);
  directionalLight.lookAt(0, 100, 0);

  // helper functions
  const axesHelper = new THREE.AxesHelper(30);
  // scene.add(axesHelper);
  const gridHelper = new THREE.GridHelper(200, 200);
  // scene.add(gridHelper);

  // outline effect
  effect = new OutlineEffect( renderer );

  loadGradientMap();

  createMaterial();

  addText(font);
  
  for (let i = 0; i < 100; i++) {
    createBall();
  }
  allObjects.position.set(0, 0, 0);
  scene.add(allObjects);

  loop();
}

function addText(font) {
  let geometry = new TextGeometry("AUSTEN LI", {
    font: font,
    
    size: defaultTextParameter.size,
    height: defaultTextParameter.height,
    curSegments: defaultTextParameter.curSegments,

    bevelThickness: defaultTextParameter.bevelThickness,
    bevelSize: defaultTextParameter.bevelSize,
    bevelEnabled: defaultTextParameter.bevelEnabled,
    bevelSegments: defaultTextParameter.bevelSegments
  });

  let fontMaterial = new THREE.MeshBasicMaterial({color: 0xeaffb9});

  text = new THREE.Mesh(geometry, fontMaterial);
  text.position.set(80, 0, -30);
  sceneText.add(text);

}


function createMaterial() {
  for (let i = 1; i < 5; i++) {
    let newMaterail = new THREE.MeshToonMaterial({
      color: color[i],
      gradientMap: fourTone,
      side: THREE.DoubleSide
    });
    materials.push(newMaterail);
  }
}


function createBall() {
  modelLoader.load(
    "./models/deformed_ball.glb",
    function (gltf) {
      let ball = gltf.scene;
      ball.traverse(function (object) {
        if (object.isMesh) {
          // random materials
          object.material = materials[Math.floor(Math.random() * 3)];
        }
      });
      allObjects.add(ball);
      ball.position.set(
        Math.random() * 600 - 300,
        Math.random() * 400 - 200,
        Math.random() * 600 - 300
      );
      let scale = Math.random() * 30 + 10;
      ball.scale.set(scale, scale, scale);
      ball.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI)
      outlineObjects.push(ball);
    },
    undefined,
    function (e) {
      console.error(e);
    }
  );
}

function loadGradientMap() {
  fiveTone = new THREE.TextureLoader().load("./textures/fiveTone.jpg");
  fiveTone.minFilter = THREE.NearestFilter;
  fiveTone.magFilter = THREE.NearestFilter;

  threeTone = new THREE.TextureLoader().load("./textures/threeTone.jpg");
  threeTone.minFilter = THREE.NearestFilter;
  threeTone.magFilter = THREE.NearestFilter;

  fourTone = new THREE.TextureLoader().load("./textures/fourTone.jpg");
  fourTone.minFilter = THREE.NearestFilter;
  fourTone.magFilter = THREE.NearestFilter;
}

function loop() {
  // renderer.render(scene, camera);
  rotate -= Math.PI / 600;
  allObjects.rotation.set(0, rotate, 0);

  count ++;
  camera.position.set(80, Math.sin(count/200) * 40, 0);
  camera.lookAt(80, Math.sin(count/200) * 40, -10);
  text.position.set(50, Math.sin(count/200) * 40, -100);


  // composer.render();
  renderer.clear();
  renderer.render( sceneText, camera);
  effect.render( scene, camera );

  window.requestAnimationFrame(loop);
  
}