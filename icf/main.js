import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';

// --- 全局变量 ---
let scene, camera, renderer, composer, controls;
let hohlraumGroup, capsuleGroup, laserGroup, plasmaGroup, shockwaveGroup;
let time = 0;

// 状态机
const STATE = {
    READY: 0,
    LASER_ENTRY: 1, // 激光射入
    XRAY_BATH: 2,   // X射线产生
    IMPLOSION: 3,   // 靶丸内爆
    IGNITION: 4,    // 点火
    EXPANSION: 5    // 燃烧膨胀
};
let currentState = STATE.READY;
let animTimer = 0;

// 参数
const HOHLRAUM_RADIUS = 15;
const HOHLRAUM_HEIGHT = 45;
const CAPSULE_RADIUS = 4;

init();
animate();

function init() {
    // 1. 场景
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000005);
    scene.fog = new THREE.FogExp2(0x000005, 0.01);

    // 2. 相机
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(40, 20, 40);
    camera.lookAt(0, 0, 0);

    // 3. 渲染器
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    // 灯光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4); // 0.2 -> 0.4
    scene.add(ambientLight);
    
    // 添加半球光，模拟实验室环境反射，防止背光面全黑
    const hemiLight = new THREE.HemisphereLight(0x444488, 0x000000, 0.5);
    scene.add(hemiLight);

    // 补光灯，照亮 Hohlraum
    const spotLight = new THREE.SpotLight(0xffffff, 2);
    spotLight.position.set(50, 50, 50);
    spotLight.lookAt(0, 0, 0);
    scene.add(spotLight);
    
    // Hohlraum 内部光 (X射线模拟)
    const innerLight = new THREE.PointLight(0xffaa00, 0, 40);
    innerLight.position.set(0, 0, 0);
    innerLight.name = 'innerLight';
    scene.add(innerLight);

    // 4. 后处理 (Bloom)
    const renderScene = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
    bloomPass.threshold = 0.1; // 降低阈值，让激光更容易发光
    bloomPass.strength = 1.2;
    bloomPass.radius = 0.5;

    composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);

    // 5. 控制器
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.2; // 减慢旋转

    // 6. 创建几何体
    createTargetChamber(); // 新增：靶室
    createHohlraum();
    createHohlraumDebris(); // 新增：Hohlraum 碎片粒子系统
    createCapsule();
    createLasers();
    createEffects();

    // 7. 事件
    window.addEventListener('resize', onWindowResize);
    setupUIControls();
    
    updateUI("SYSTEM READY", 0, "Solid", 0, 0);
}

function createHohlraumDebris() {
    // 创建一个与 Hohlraum 形状一致的粒子系统，用于毁灭动画
    // 圆筒侧面
    const count = 3000;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    
    for(let i=0; i<count; i++) {
        const h = (Math.random() - 0.5) * HOHLRAUM_HEIGHT;
        const theta = Math.random() * Math.PI * 2;
        const r = HOHLRAUM_RADIUS + (Math.random()-0.5) * 1; // 略微有厚度
        
        const x = Math.cos(theta) * r;
        const z = Math.sin(theta) * r;
        
        positions[i*3] = x;
        positions[i*3+1] = h;
        positions[i*3+2] = z;
        
        // 爆炸速度：主要是沿径向向外
        const speed = 0.5 + Math.random() * 1.5;
        velocities[i*3] = Math.cos(theta) * speed;
        velocities[i*3+1] = (Math.random()-0.5) * speed; // 少量上下飞散
        velocities[i*3+2] = Math.sin(theta) * speed;
    }
    
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
        color: 0xffd700, // 金色碎片
        size: 0.4,
        transparent: true,
        opacity: 0, // 初始不可见
        blending: THREE.AdditiveBlending
    });
    
    const debris = new THREE.Points(geo, mat);
    debris.name = 'hohlraumDebris';
    debris.userData = { velocities: velocities, active: false };
    scene.add(debris);
}

function createTargetChamber() {
    const chamberGroup = new THREE.Group();
    scene.add(chamberGroup);
    
    // 10米直径靶室 (比例缩小)
    const radius = 60;
    
    // 线框球体
    const geo = new THREE.IcosahedronGeometry(radius, 2);
    const wireframe = new THREE.WireframeGeometry(geo);
    const line = new THREE.LineSegments(wireframe);
    line.material.color.setHex(0x112244);
    line.material.transparent = true;
    line.material.opacity = 0.3;
    chamberGroup.add(line);
    
    // 激光端口 (Ports)
    // 在球面上分布一些圆圈表示端口
    const portGeo = new THREE.RingGeometry(1, 1.5, 16);
    const portMat = new THREE.MeshBasicMaterial({ color: 0x4488ff, side: THREE.DoubleSide });
    
    // 对应激光位置的端口
    const beamCount = 16;
    for(let i=0; i<beamCount; i++) {
        // 上半球端口
        const angle = (i / beamCount) * Math.PI * 2;
        const portTop = new THREE.Mesh(portGeo, portMat);
        // 计算位置：大约对应激光射入角度
        // 激光起点 y = HOHLRAUM_HEIGHT * 1.5 ~ 67.5, r = 12
        // 方向向量 (r, 67.5, 0) -> (0, targetY, 0)
        // 简化：直接放在球面上对应的极角
        const phi = Math.PI / 6; // 30度
        
        portTop.position.setFromSphericalCoords(radius, phi, angle);
        portTop.lookAt(0, 0, 0);
        chamberGroup.add(portTop);
        
        // 下半球端口
        const portBottom = new THREE.Mesh(portGeo, portMat);
        portBottom.position.setFromSphericalCoords(radius, Math.PI - phi, angle + Math.PI/beamCount);
        portBottom.lookAt(0, 0, 0);
        chamberGroup.add(portBottom);
    }
}

function createHohlraum() {
    hohlraumGroup = new THREE.Group();
    scene.add(hohlraumGroup);

    // 金圆筒 (Gold Cylinder) - 透明化处理
    // 使用 MeshPhysicalMaterial 获得更好的玻璃/透明金属质感
    const geometry = new THREE.CylinderGeometry(HOHLRAUM_RADIUS, HOHLRAUM_RADIUS, HOHLRAUM_HEIGHT, 32, 1, true, 0, Math.PI * 2); // 闭合圆筒 (不再剖切，因为透明了)
    const material = new THREE.MeshPhysicalMaterial({
        color: 0xffd700, // 金色
        metalness: 0.1,  // 降低金属度以增加透明感
        roughness: 0.1,  // 光滑
        transmission: 0.9, // 高透光率
        thickness: 0.5,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.3,    // 基础不透明度低
        emissive: 0xffd700,
        emissiveIntensity: 0.1 // 微弱轮廓发光
    });
    const mesh = new THREE.Mesh(geometry, material);
    hohlraumGroup.add(mesh);
    
    // 线框 (Wireframe) - 增强轮廓感，否则透明物体太难看清形状
    const wireGeo = new THREE.EdgesGeometry(geometry);
    const wireMat = new THREE.LineBasicMaterial({ color: 0xffaa00, transparent: true, opacity: 0.5 });
    const wireframe = new THREE.LineSegments(wireGeo, wireMat);
    mesh.add(wireframe);
    
    // 内壁发光材质 (X-ray) - 保持不变，但透明度控制要精细
    const glowGeo = new THREE.CylinderGeometry(HOHLRAUM_RADIUS*0.9, HOHLRAUM_RADIUS*0.9, HOHLRAUM_HEIGHT*0.9, 32, 1, true);
    const glowMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false // 关键：防止遮挡内部粒子
    });
    const glowMesh = new THREE.Mesh(glowGeo, glowMat);
    glowMesh.name = 'innerGlow';
    hohlraumGroup.add(glowMesh);
}

function createCapsule() {
    capsuleGroup = new THREE.Group();
    scene.add(capsuleGroup);

    // 靶丸外壳 (Ablator)
    const shellGeo = new THREE.SphereGeometry(CAPSULE_RADIUS, 64, 64);
    const shellMat = new THREE.MeshPhysicalMaterial({
        color: 0x3366ff,
        metalness: 0.1,
        roughness: 0.2,
        transmission: 0.5, // 半透明
        thickness: 1.0,
        transparent: true,
        opacity: 0.8,
        emissive: 0x001133, // 微弱发光
        emissiveIntensity: 0.2
    });
    const shell = new THREE.Mesh(shellGeo, shellMat);
    shell.name = 'ablator';
    capsuleGroup.add(shell);
    
    // 内部燃料
    const fuelGeo = new THREE.SphereGeometry(CAPSULE_RADIUS * 0.8, 32, 32);
    const fuelMat = new THREE.MeshBasicMaterial({
        color: 0xaaccff,
        transparent: true,
        opacity: 0.6
    });
    const fuel = new THREE.Mesh(fuelGeo, fuelMat);
    fuel.name = 'fuel';
    capsuleGroup.add(fuel);
}

function createLasers() {
    laserGroup = new THREE.Group();
    scene.add(laserGroup);
    
    // 创建多束激光，从上下两端射入
    const beamCount = 16; // 简化数量
    const beamGeo = new THREE.CylinderGeometry(0.2, 0.2, 40, 8);
    // 旋转使其沿 Z 轴
    beamGeo.rotateX(Math.PI / 2);
    const beamMat = new THREE.MeshBasicMaterial({
        color: 0x0088ff, // 紫外激光
        transparent: true,
        opacity: 0, // 初始隐藏
        blending: THREE.AdditiveBlending
    });

    // 上部激光
    for(let i=0; i<beamCount; i++) {
        const angle = (i / beamCount) * Math.PI * 2;
        const beam = new THREE.Mesh(beamGeo, beamMat);
        
        // 目标点是内壁某一圈
        // 起点是上方远外侧
        const targetY = HOHLRAUM_HEIGHT * 0.2;
        const startY = HOHLRAUM_HEIGHT * 1.5;
        const r = HOHLRAUM_RADIUS * 0.8;
        
        // 简单的几何计算，让光束穿过顶端开口打在内壁
        beam.position.set(
            Math.cos(angle) * r, 
            (targetY + startY) / 2, 
            Math.sin(angle) * r
        );
        beam.lookAt(0, targetY - 10, 0); // 稍微向内倾斜
        
        laserGroup.add(beam);
        
        // 引导光束 (Guide Beam) - 始终微弱可见
        const guideGeo = new THREE.CylinderGeometry(0.05, 0.05, 40, 4);
        guideGeo.rotateX(Math.PI / 2);
        const guideMat = new THREE.MeshBasicMaterial({ color: 0x004488, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending });
        const guide = new THREE.Mesh(guideGeo, guideMat);
        guide.position.copy(beam.position);
        guide.quaternion.copy(beam.quaternion);
        laserGroup.add(guide);
    }
    
    // 下部激光 (镜像)
    for(let i=0; i<beamCount; i++) {
        const angle = (i / beamCount) * Math.PI * 2 + (Math.PI/beamCount); // 交错
        const beam = new THREE.Mesh(beamGeo, beamMat);
        
        const targetY = -HOHLRAUM_HEIGHT * 0.2;
        const startY = -HOHLRAUM_HEIGHT * 1.5;
        const r = HOHLRAUM_RADIUS * 0.8;
        
        beam.position.set(
            Math.cos(angle) * r, 
            (targetY + startY) / 2, 
            Math.sin(angle) * r
        );
        beam.lookAt(0, targetY + 10, 0);
        
        laserGroup.add(beam);
        
        // 引导光束
        const guideGeo = new THREE.CylinderGeometry(0.05, 0.05, 40, 4);
        guideGeo.rotateX(Math.PI / 2);
        const guideMat = new THREE.MeshBasicMaterial({ color: 0x004488, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending });
        const guide = new THREE.Mesh(guideGeo, guideMat);
        guide.position.copy(beam.position);
        guide.quaternion.copy(beam.quaternion);
        laserGroup.add(guide);
    }
}

function createEffects() {
    plasmaGroup = new THREE.Group();
    scene.add(plasmaGroup);
    
    // 烧蚀产生的等离子体云 (向外喷射)
    const pCount = 2000;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    const pVel = new Float32Array(pCount * 3); // 速度方向 (单位向量)
    
    for(let i=0; i<pCount; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        
        const x = Math.sin(phi) * Math.cos(theta);
        const y = Math.sin(phi) * Math.sin(theta);
        const z = Math.cos(phi);
        
        pPos[i*3] = x * CAPSULE_RADIUS;
        pPos[i*3+1] = y * CAPSULE_RADIUS;
        pPos[i*3+2] = z * CAPSULE_RADIUS;
        
        pVel[i*3] = x;
        pVel[i*3+1] = y;
        pVel[i*3+2] = z;
    }
    
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
        color: 0x88ccff,
        size: 0.3,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending
    });
    const plasma = new THREE.Points(pGeo, pMat);
    plasma.name = 'ablationPlasma';
    plasma.userData = { initialPos: pPos.slice(), velocities: pVel };
    plasmaGroup.add(plasma);
    
    // 冲击波环 (Shockwave)
    shockwaveGroup = new THREE.Mesh(
        new THREE.SphereGeometry(1, 32, 32),
        new THREE.MeshBasicMaterial({ color: 0xffaa00, transparent: true, opacity: 0, blending: THREE.AdditiveBlending })
    );
    scene.add(shockwaveGroup);
}

function updatePhysics() {
    const innerLight = scene.getObjectByName('innerLight');
    const innerGlow = hohlraumGroup.getObjectByName('innerGlow');
    const ablator = capsuleGroup.getObjectByName('ablator');
    const fuel = capsuleGroup.getObjectByName('fuel');
    const ablationPlasma = plasmaGroup.getObjectByName('ablationPlasma');
    
    if (currentState === STATE.READY) return;

    // 1. 激光射入
    if (currentState === STATE.LASER_ENTRY) {
        animTimer++;
        const progress = Math.min(animTimer / 30, 1);
        
        // 激光渐亮
        laserGroup.children.forEach(beam => beam.material.opacity = progress * 0.8);
        
        updateUI("LASER INJECTION", progress * 1.8, "Solid", 0, 0); // 1.8 MJ
        
        if (progress >= 1) {
            currentState = STATE.XRAY_BATH;
            animTimer = 0;
        }
    }
    
    // 2. X射线浴
    else if (currentState === STATE.XRAY_BATH) {
        animTimer++;
        const progress = Math.min(animTimer / 60, 1);
        
        // 内壁发光变白
        innerGlow.material.opacity = progress * 0.8;
        innerLight.intensity = progress * 20;
        
        // 靶丸表面开始受热变色
        ablator.material.color.lerpColors(new THREE.Color(0x3366ff), new THREE.Color(0xffffff), 0.05);
        ablator.material.emissive.setHex(0x555555);
        ablator.material.emissiveIntensity = progress * 2;

        updateUI("X-RAY GENERATION", 1.9, "Heating", 0, 0);

        if (progress >= 1) {
            currentState = STATE.IMPLOSION;
            animTimer = 0;
        }
    }
    
    // 3. 内爆 (Implosion)
    else if (currentState === STATE.IMPLOSION) {
        animTimer++;
        const t = animTimer / 200; // 减慢速度，从 100 改为 200，展示更清晰的压缩过程
        
        // 激光关闭
        laserGroup.children.forEach(child => {
            // 只关闭主激光 beam (MeshBasicMaterial且初始opacity为0的那个)，保留 guide beam
            if (child.geometry.parameters.radiusTop === 0.2) { 
                child.material.opacity *= 0.9;
            }
        });
        
        // 靶丸压缩：半径急剧缩小
        // r = r0 * (1 - t^2)
        const scale = Math.max(1 - t * 0.95, 0.05); // 压缩到 5%
        ablator.scale.setScalar(scale);
        fuel.scale.setScalar(scale);
        
        // 烧蚀等离子体向外喷射 (Rocket Effect)
        ablationPlasma.material.opacity = Math.min(t * 2, 0.8);
        const pPos = ablationPlasma.geometry.attributes.position.array;
        const pVel = ablationPlasma.userData.velocities;
        
        for(let i=0; i<pVel.length/3; i++) {
            // 粒子从当前半径向外飞
            const rCurrent = CAPSULE_RADIUS * scale;
            const dist = rCurrent + t * 50 * (0.5 + Math.random()); // 向外飞
            
            pPos[i*3] = pVel[i*3] * dist;
            pPos[i*3+1] = pVel[i*3+1] * dist;
            pPos[i*3+2] = pVel[i*3+2] * dist;
        }
        ablationPlasma.geometry.attributes.position.needsUpdate = true;
        
        updateUI("IMPLOSION", 0, "Super Critical", t * 350, 0); // 350 km/s

        if (t >= 1) {
            currentState = STATE.IGNITION;
            animTimer = 0;
        }
    }
    
    // 4. 点火 (Ignition)
    else if (currentState === STATE.IGNITION) {
        animTimer++;
        
        // 核心瞬间变亮
        fuel.scale.setScalar(0.05); // 保持压缩态
        fuel.material.color.setHex(0xffaa00);
        fuel.material.opacity = 1;
        
        // 冲击波生成
        shockwaveGroup.visible = true;
        shockwaveGroup.scale.setScalar(0.1 + animTimer * 0.5); // 快速膨胀
        shockwaveGroup.material.opacity = 1.0 - (animTimer / 20);
        
        // 强光爆发
        innerLight.color.setHex(0xffaa00);
        innerLight.intensity = 50;
        composer.passes[1].strength = 3.0 + Math.random();
        
        updateUI("IGNITION !", 0, "Burning Plasma", 0, 100 + Math.random()*50); // High Yield

        if (animTimer > 20) {
            currentState = STATE.EXPANSION;
            animTimer = 0;
        }
    }
    
    // 5. 膨胀 (Expansion)
    else if (currentState === STATE.EXPANSION) {
        animTimer++;
        
        // Hohlraum 毁灭效果 (Vaporization)
        // 剧烈发光 -> 切换为粒子 -> 粒子飞散
        hohlraumGroup.children.forEach(child => {
             if (child.name === 'innerGlow') return;
             
             // 1. 先瞬间变亮白
             if (animTimer < 5 && child.material) {
                 child.material.emissive.setHex(0xffffff);
                 child.material.emissiveIntensity = 5.0;
             }
             // 2. 然后隐藏本体，激活粒子
             else if (animTimer === 5) {
                 child.visible = false; // 隐藏圆筒
                 
                 const debris = scene.getObjectByName('hohlraumDebris');
                 if (debris) {
                     debris.userData.active = true;
                     debris.material.opacity = 1;
                 }
             }
        });
        
        // 更新碎片粒子
        const debris = scene.getObjectByName('hohlraumDebris');
        if (debris && debris.userData.active) {
            const pos = debris.geometry.attributes.position.array;
            const vel = debris.userData.velocities;
            
            for(let i=0; i<vel.length/3; i++) {
                pos[i*3] += vel[i*3];
                pos[i*3+1] += vel[i*3+1];
                pos[i*3+2] += vel[i*3+2];
            }
            debris.geometry.attributes.position.needsUpdate = true;
            
            // 逐渐消失
            debris.material.opacity *= 0.96;
        }

        // 残骸消散
        shockwaveGroup.visible = false;
        ablationPlasma.material.opacity *= 0.95;
        innerGlow.material.opacity *= 0.8; 
        innerLight.intensity *= 0.9;
        composer.passes[1].strength *= 0.95;
        
        updateUI("HOHLRAUM DESTROYED", 0, "Vaporized", 0, 0);
        
        if (animTimer > 120) {
            resetSimulation();
        }
    }
}

function updateUI(status, energy, density, velocity, yieldVal) {
    document.getElementById('status-text').innerText = status;
    document.getElementById('energy-display').innerText = energy.toFixed(1) + " MJ";
    document.getElementById('density-display').innerText = density;
    document.getElementById('velocity-display').innerText = velocity.toFixed(0) + " km/s";
    
    const yieldEl = document.getElementById('yield-display');
    if (yieldVal > 0) {
        yieldEl.innerText = yieldVal.toFixed(1) + " MJ";
        yieldEl.style.color = "#ffaa00";
    } else {
        yieldEl.innerText = "0";
        yieldEl.style.color = "#fff";
    }
}

function resetSimulation() {
    currentState = STATE.READY;
    animTimer = 0;
    
    // 重置物体状态
    laserGroup.children.forEach(child => {
        // 只重置主激光 beam
        if (child.geometry.parameters.radiusTop === 0.2) {
             child.material.opacity = 0;
        }
    });
    
    hohlraumGroup.getObjectByName('innerGlow').material.opacity = 0;
    
    // 重置 Hohlraum 状态
    hohlraumGroup.children.forEach(child => {
        if (child.name !== 'innerGlow') {
            child.visible = true; // 重新显示
            child.scale.setScalar(1);
            child.rotation.set(0, 0, 0);
            if (child.material) {
                child.material.color.setHex(0xffd700);
                child.material.emissive.setHex(0xffd700);
                child.material.emissiveIntensity = 0.1;
                child.material.opacity = 0.3;
            }
        }
    });
    
    // 重置碎片粒子
    const debris = scene.getObjectByName('hohlraumDebris');
    if (debris) {
        debris.userData.active = false;
        debris.material.opacity = 0;
        // 重置位置 (需要保存初始位置，这里简化直接重新计算或归位)
        // 简单归位：其实 createHohlraumDebris 里生成的初始位置是固定的随机值，
        // 这里需要恢复它。最简单的方法是 remove 再 add，或者在 userData 存一份 initPos
        scene.remove(debris);
        createHohlraumDebris(); // 重新创建一份新的
    }
    
    const ablator = capsuleGroup.getObjectByName('ablator');
    ablator.scale.setScalar(1);
    ablator.material.color.setHex(0x3366ff);
    ablator.material.emissiveIntensity = 0.2; // 恢复微弱发光
    
    const fuel = capsuleGroup.getObjectByName('fuel');
    fuel.scale.setScalar(1);
    fuel.material.color.setHex(0xaaccff); // 恢复初始颜色
    fuel.material.opacity = 0.6;
    
    const plasma = plasmaGroup.getObjectByName('ablationPlasma');
    plasma.material.opacity = 0;
    
    scene.getObjectByName('innerLight').intensity = 0;
    composer.passes[1].strength = 1.5;
    
    updateUI("SYSTEM READY", 0, "Solid", 0, 0);
}

function setupUIControls() {
    document.getElementById('btn-fire').addEventListener('click', () => {
        if (currentState === STATE.READY) currentState = STATE.LASER_ENTRY;
    });
    document.getElementById('btn-reset').addEventListener('click', resetSimulation);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    time += 0.01;
    controls.update();
    updatePhysics();
    composer.render();
}
