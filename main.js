import * as THREE from "three";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const width = window.innerWidth;
const height = window.innerHeight;

// レンダラーを作成
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(width, height);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement); 

// シーンを作成
const scene = new THREE.Scene();

// 視野角とカメラ距離を計算
const fov = 60;
const fovRad = THREE.MathUtils.degToRad(fov / 2);
const dist = (height / 2) / Math.tan(fovRad);

// カメラを作成
const camera = new THREE.PerspectiveCamera(fov, width / height, 1, dist * 2);
camera.position.z = dist - 600;

// OrbitControlsを設定
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// ライトを作成
const light = new THREE.PointLight(0x07F9FE, 10);
light.position.set(0, 0, 0);
scene.add(light);

const ambientLight = new THREE.AmbientLight(0x07F9FE, 1);
scene.add(ambientLight);

// パーティクルを作成
const particleCount = 10000;
const positions = new Float32Array(particleCount * 3);
const velocities = new Float32Array(particleCount * 3);

const particleMaterial = new THREE.PointsMaterial({ 
  color: 0x07C0FE, 
  size: 1,
  opacity: 0.8,
  transparent: true
});

// パーティクルの生成
for (let i = 0; i < particleCount; i++) {
  positions[i * 3] = Math.random() * 200 - 100;
  positions[i * 3 + 1] = Math.random() * 200 - 100;
  positions[i * 3 + 2] = Math.random() * 200 - 100;

  // ランダムな速度（x, y, z方向）
  velocities[i * 3] = (Math.random() - 0.5) * 0.05;  // x方向
  velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.05;  // y方向
  velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.05;  // z方向
}

const geometry = new THREE.BufferGeometry();
geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3)); 

const particleSystem = new THREE.Points(geometry, particleMaterial);
scene.add(particleSystem);

// マウス座標を取得
const mouse = new THREE.Vector2();

window.addEventListener('mousemove', e => {
  mouse.x = e.clientX - (width / 2);
  mouse.y = -e.clientY + (height / 2);
});

let time = 0;

// アニメーション関数
const animate = () => {
  requestAnimationFrame(animate);

  // パーティクルの位置を更新（ランダムに動かす）
  const positionsArray = geometry.attributes.position.array;
  const velocitiesArray = geometry.attributes.velocity.array;

  for (let i = 0; i < particleCount; i++) {
    // 各パーティクルの位置を速度に基づいて更新
    positionsArray[i * 3] += velocitiesArray[i * 3];
    positionsArray[i * 3 + 1] += velocitiesArray[i * 3 + 1];
    positionsArray[i * 3 + 2] += velocitiesArray[i * 3 + 2];

    // 画面外に出ないようにパーティクルを反対側に戻す（ボーダー制御）
    if (positionsArray[i * 3] > 100 || positionsArray[i * 3] < -100) velocitiesArray[i * 3] *= -1;
    if (positionsArray[i * 3 + 1] > 100 || positionsArray[i * 3 + 1] < -100) velocitiesArray[i * 3 + 1] *= -1;
    if (positionsArray[i * 3 + 2] > 100 || positionsArray[i * 3 + 2] < -100) velocitiesArray[i * 3 + 2] *= -1;
  }

  geometry.attributes.position.needsUpdate = true;  // パーティクルの位置を更新

  // 時間経過で色を変える
  time += 0.0005;
  const color = new THREE.Color();
  color.setHSL((Math.sin(time) + 1) / 2, 1, 0.5);  // HSLで色を変更
  particleMaterial.color.set(color);

  // マウス座標でカメラを動かす
  camera.position.x = -mouse.x;
  camera.position.y = -mouse.y;

  controls.update();

  renderer.render(scene, camera);
};
animate();

// ブラウザのリサイズに対応
window.addEventListener("resize", () => {
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
});
