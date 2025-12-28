import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';

// --- 全局变量 ---
let scene, camera, renderer, composer, controls;
let wireGroup, currentArrowsGroup, magneticFieldGroup, forceArrowsGroup, plasmaColumn;
let time = 0;

// 状态机
const STATE = {
    READY: 0,
    ABLATION: 1,    // 烧蚀：金属丝变成等离子体
    IMPLOSION: 2,   // 内爆：向中心加速
    STAGNATION: 3,  // 滞止：中心高密度柱
    INSTABILITY: 4, // 不稳定性 (Sausage/Kink)
    DONE: 5
};
let currentState = STATE.READY;
let animTimer = 0;

// Z-Pinch 参数
const ARRAY_RADIUS = 10;
const ARRAY_HEIGHT = 25;
const WIRE_COUNT = 32;

init();
animate();

function init() {
    // 1. 场景
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050508);
    scene.fog = new THREE.FogExp2(0x050508, 0.02);

    // 2. 相机
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(25, 20, 25);
    camera.lookAt(0, 0, 0);

    // 3. 渲染器
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    // renderer.toneMapping = THREE.ReinhardToneMapping; // 旧：可能导致过暗
    renderer.toneMapping = THREE.ACESFilmicToneMapping; // 新：更现代的映射
    renderer.toneMappingExposure = 1.2; // 增加曝光
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    // 灯光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // 0.2 -> 0.5
    scene.add(ambientLight);
    
    // 上下电极板的发光
    const topLight = new THREE.PointLight(0x00ffff, 2, 100); // 强度 1->2, 距离 50->100
    topLight.position.set(0, 15, 0);
    scene.add(topLight);
    const bottomLight = new THREE.PointLight(0x00ffff, 2, 100);
    bottomLight.position.set(0, -15, 0);
    scene.add(bottomLight);
    
    // 补光灯，防止死角
    const fillLight = new THREE.DirectionalLight(0xffffff, 1);
    fillLight.position.set(10, 10, 10);
    scene.add(fillLight);

    // 4. 后处理 (Bloom) - Z-Pinch 需要强烈的电弧光感
    const renderScene = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
    bloomPass.threshold = 0.1;
    bloomPass.strength = 2.0; // 强辉光
    bloomPass.radius = 0.5;

    composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);

    // 5. 控制器
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;

    // 6. 创建几何体
    createElectrodes();
    createWireArray();
    createVisualizations(); 
    createPlasmaColumn();
    createTarget(); // 新增：靶丸
    createFusionBurst(); // 新增：聚变爆发粒子
    createCurrentParticles(); 

    // 7. 事件
    window.addEventListener('resize', onWindowResize);
    setupUIControls();
    
    updateUI("就绪 (READY)", 0, 0, "Solid");
}

function createFusionBurst() {
    // 聚变产物粒子系统
    const count = 1000;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    
    for(let i=0; i<count; i++) {
        positions[i*3] = 0;
        positions[i*3+1] = 0;
        positions[i*3+2] = 0;
        
        // 随机向外飞散
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const speed = 0.5 + Math.random() * 1.5;
        
        velocities[i*3] = speed * Math.sin(phi) * Math.cos(theta);
        velocities[i*3+1] = speed * Math.sin(phi) * Math.sin(theta);
        velocities[i*3+2] = speed * Math.cos(phi);
    }
    
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
        color: 0xffeeaa, // 金白色高能粒子
        size: 0.4,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending
    });
    
    const burst = new THREE.Points(geo, mat);
    burst.name = 'fusionBurst';
    burst.userData = { velocities: velocities, active: false };
    scene.add(burst);

    // 冲击波球体
    const shockGeo = new THREE.SphereGeometry(1, 32, 32);
    const shockMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide
    });
    const shockwave = new THREE.Mesh(shockGeo, shockMat);
    shockwave.name = 'shockwave';
    shockwave.visible = false;
    scene.add(shockwave);
}

function updateFusionBurst() {
    const burst = scene.getObjectByName('fusionBurst');
    const shockwave = scene.getObjectByName('shockwave');
    if (!burst || !burst.userData.active) return;
    
    // 更新粒子
    const positions = burst.geometry.attributes.position.array;
    const velocities = burst.userData.velocities;
    
    for(let i=0; i<velocities.length/3; i++) {
        positions[i*3] += velocities[i*3];
        positions[i*3+1] += velocities[i*3+1];
        positions[i*3+2] += velocities[i*3+2];
    }
    burst.geometry.attributes.position.needsUpdate = true;
    
    // 粒子逐渐消失
    if (burst.material.opacity > 0) {
        burst.material.opacity *= 0.96;
    }
    
    // 更新冲击波
    if (shockwave && shockwave.visible) {
        shockwave.scale.multiplyScalar(1.15); // 快速膨胀
        if (shockwave.material.opacity > 0) {
            shockwave.material.opacity *= 0.9;
        } else {
            shockwave.visible = false;
        }
    }
}

function createTarget() {
    // 位于中心的靶丸 (Fuel Pellet)
    const geo = new THREE.SphereGeometry(1.5, 32, 32);
    const mat = new THREE.MeshStandardMaterial({
        color: 0xffaa00, // 金色
        metalness: 0.8,
        roughness: 0.2,
        emissive: 0xaa5500,
        emissiveIntensity: 0.2
    });
    const target = new THREE.Mesh(geo, mat);
    target.name = 'targetPellet';
    scene.add(target);
}

function createCurrentParticles() {
    // 粒子流，从上到下，限制在电极之间
    const particleCount = 2000;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const speeds = new Float32Array(particleCount);
    
    for(let i=0; i<particleCount; i++) {
        // 初始位置随机分布在圆柱面上
        const angle = Math.random() * Math.PI * 2;
        const r = ARRAY_RADIUS;
        const y = (Math.random() - 0.5) * ARRAY_HEIGHT;
        
        positions[i*3] = Math.cos(angle) * r;
        positions[i*3+1] = y;
        positions[i*3+2] = Math.sin(angle) * r;
        
        speeds[i] = 0.5 + Math.random() * 0.5;
    }
    
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
        color: 0x00ffff,
        size: 0.2,
        transparent: true,
        opacity: 0, // 初始隐藏
        blending: THREE.AdditiveBlending
    });
    
    const particles = new THREE.Points(geo, mat);
    particles.userData = { speeds: speeds, active: false };
    currentArrowsGroup.add(particles); // 复用组
    currentArrowsGroup.userData.particles = particles;
}

function updateCurrentParticles(isActive, implosionRadius = ARRAY_RADIUS) {
    const particles = currentArrowsGroup.userData.particles;
    if (!particles) return;
    
    if (!isActive) {
        particles.material.opacity = 0;
        return;
    }
    
    particles.material.opacity = 0.6;
    const positions = particles.geometry.attributes.position.array;
    const speeds = particles.userData.speeds;
    const heightHalf = ARRAY_HEIGHT / 2;
    
    for(let i=0; i<speeds.length; i++) {
        // 向下流动 (Y 减小)
        positions[i*3+1] -= speeds[i];
        
        // 循环：如果超出底部电极，回到顶部电极
        if (positions[i*3+1] < -heightHalf) {
            positions[i*3+1] = heightHalf;
            
            // 重置半径位置 (跟随内爆)
            // 简单的将粒子重置到当前的圆柱面上
            const angle = Math.random() * Math.PI * 2;
            positions[i*3] = Math.cos(angle) * implosionRadius;
            positions[i*3+2] = Math.sin(angle) * implosionRadius;
        } else {
            // 保持在当前半径上 (如果是内爆过程中，需要更新 X/Z)
            // 简单处理：计算当前角度，更新半径
            const x = positions[i*3];
            const z = positions[i*3+2];
            const angle = Math.atan2(z, x);
            positions[i*3] = Math.cos(angle) * implosionRadius;
            positions[i*3+2] = Math.sin(angle) * implosionRadius;
        }
    }
    particles.geometry.attributes.position.needsUpdate = true;
}

function createElectrodes() {
    const geo = new THREE.CylinderGeometry(14, 14, 1, 32);
    const mat = new THREE.MeshStandardMaterial({ 
        color: 0x333333, 
        metalness: 0.9, 
        roughness: 0.2,
        emissive: 0x004444,
        emissiveIntensity: 0.2
    });
    
    const topPlate = new THREE.Mesh(geo, mat);
    topPlate.position.y = ARRAY_HEIGHT / 2 + 0.5;
    scene.add(topPlate);
    
    const bottomPlate = new THREE.Mesh(geo, mat);
    bottomPlate.position.y = -ARRAY_HEIGHT / 2 - 0.5;
    scene.add(bottomPlate);
    
    // 新增：连接导线 (Power Feed)
    const feedGeo = new THREE.CylinderGeometry(4, 4, 10, 16);
    // 改成亮白色金属，带自发光，确保在深色背景下可见
    const feedMat = new THREE.MeshStandardMaterial({ 
        color: 0xffffff, 
        metalness: 0.5, 
        roughness: 0.2,
        emissive: 0x222222,
        emissiveIntensity: 0.5
    });
    
    const topFeed = new THREE.Mesh(feedGeo, feedMat);
    topFeed.position.y = ARRAY_HEIGHT / 2 + 0.5 + 5; 
    scene.add(topFeed);
    
    const bottomFeed = new THREE.Mesh(feedGeo, feedMat);
    bottomFeed.position.y = -ARRAY_HEIGHT / 2 - 0.5 - 5;
    scene.add(bottomFeed);
}

function createWireArray() {
    wireGroup = new THREE.Group();
    scene.add(wireGroup);

    // 创建一圈“韭菜面”状的金属片
    for (let i = 0; i < WIRE_COUNT; i++) {
        const angle = (i / WIRE_COUNT) * Math.PI * 2;
        const x = Math.cos(angle) * ARRAY_RADIUS;
        const z = Math.sin(angle) * ARRAY_RADIUS;
        
        // 改用 BoxGeometry 创建扁平长条 (Ribbon)
        // 宽度 1.5, 高度 ARRAY_HEIGHT, 厚度 0.05
        // 默认 Box 宽是 X 轴，高是 Y 轴，深是 Z 轴
        const geometry = new THREE.BoxGeometry(1.5, ARRAY_HEIGHT, 0.05);
        const material = new THREE.MeshBasicMaterial({ 
            color: 0xaaaaaa, // 银色金属片
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 1.0
        });
        
        const wire = new THREE.Mesh(geometry, material);
        wire.position.set(x, 0, z);
        
        // 旋转逻辑：
        // 1. 默认 geometry 宽面法线是 Z 轴 (0,0,1)
        // 2. 我们希望宽面正对圆心 (0,0,0)
        // 3. 当前位置 (x, 0, z) 对应的角度是 angle
        // 4. lookAt(0,0,0) 会让 Z 轴 (宽面) 指向圆心，这正是我们想要的
        // 之前用的 wire.rotation.y = -angle 是让物体本身的局部坐标系旋转
        
        // 修正：宽面 (X-Y平面，法线Z) 需要正对圆心
        // 方法一：计算旋转角度
        // 初始法线 (0,0,1)。目标法线 (-x, 0, -z) 即 (-cos(angle), 0, -sin(angle))
        // 需要绕 Y 轴旋转。
        // 当 angle=0 (x=R, z=0), 目标法线 (-1, 0, 0)。初始 (0,0,1) 转到 (-1,0,0) 需要转 -90度 (-PI/2)
        // 让我们直接用 lookAt，简单且正确
        wire.lookAt(0, 0, 0);
        
        // 保存初始位置
        wire.userData = { 
            initX: x, 
            initZ: z, 
            angle: angle,
            radius: ARRAY_RADIUS,
            initRotY: wire.rotation.y // 保存初始旋转
        };
        
        wireGroup.add(wire);
    }
}

function createPlasmaColumn() {
    // 中心高密度等离子体柱 (Stagnation Column)
    const geometry = new THREE.CylinderGeometry(0.5, 0.5, ARRAY_HEIGHT, 32);
    const material = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0, // 初始不可见
        blending: THREE.AdditiveBlending
    });
    plasmaColumn = new THREE.Mesh(geometry, material);
    plasmaColumn.scale.set(0.1, 1, 0.1); // 初始很细
    scene.add(plasmaColumn);
}

function createVisualizations() {
    currentArrowsGroup = new THREE.Group();
    magneticFieldGroup = new THREE.Group();
    forceArrowsGroup = new THREE.Group();
    
    scene.add(currentArrowsGroup);
    scene.add(magneticFieldGroup);
    scene.add(forceArrowsGroup);
    
    // 1. 轴向电流 (J) - 沿着金属丝向下的箭头 (或向上，这里假设向下)
    // 移除旧的大箭头
    /*
    const arrowGeo = new THREE.ConeGeometry(2, 4, 16);
    const arrowMat = new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.3, depthWrite: false });
    const mainCurrentArrow = new THREE.Mesh(arrowGeo, arrowMat);
    mainCurrentArrow.position.y = 0;
    mainCurrentArrow.rotation.x = Math.PI; // 向下
    mainCurrentArrow.visible = false; // 初始隐藏
    currentArrowsGroup.add(mainCurrentArrow);
    currentArrowsGroup.userData.mainArrow = mainCurrentArrow;
    */

    // 2. 角向磁场 (B) - 环绕圆柱的环
    const ringCount = 5;
    for(let i=0; i<ringCount; i++) {
        const y = (i / (ringCount-1)) * ARRAY_HEIGHT * 0.8 - ARRAY_HEIGHT * 0.4;
        const curve = new THREE.EllipseCurve(0, 0, ARRAY_RADIUS + 2, ARRAY_RADIUS + 2, 0, 2 * Math.PI, false, 0);
        const points = curve.getPoints(64);
        const lineGeo = new THREE.BufferGeometry().setFromPoints(points.map(p => new THREE.Vector3(p.x, y, p.y)));
        const lineMat = new THREE.LineBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0 });
        const ring = new THREE.Line(lineGeo, lineMat);
        ring.userData = { initRadius: ARRAY_RADIUS + 2 };
        magneticFieldGroup.add(ring);
    }

    // 3. 洛伦兹力 (F) - 指向中心的箭头
    // 我们在磁场环上分布一些向内的箭头
    for(let i=0; i<8; i++) {
        const angle = (i/8) * Math.PI * 2;
        const arrow = new THREE.ArrowHelper(
            new THREE.Vector3(-Math.cos(angle), 0, -Math.sin(angle)), // dir (inward)
            new THREE.Vector3(Math.cos(angle)*12, 0, Math.sin(angle)*12), // origin
            3, // length
            0xff00ff // color (Magenta)
        );
        arrow.visible = false;
        forceArrowsGroup.add(arrow);
    }
}

function updatePhysics() {
    if (currentState === STATE.READY) return;

    // 烧蚀阶段
    if (currentState === STATE.ABLATION) {
        animTimer++;
        const progress = Math.min(animTimer / 60, 1); // 1秒烧蚀
        
        // 颜色变化：灰 -> 红 -> 亮白
        const color = new THREE.Color().lerpColors(new THREE.Color(0x888888), new THREE.Color(0x00ffff), progress);
        wireGroup.children.forEach(wire => {
            wire.material.color = color;
            // 稍微膨胀一点变成等离子体壳
            // 修正：只膨胀半径 (X, Z)，保持高度 (Y) 不变，防止穿透电极
            const scale = 1 + progress * 2;
            wire.scale.set(scale, 1, scale); 
            wire.material.opacity = 0.8;
        });
        
        // 显示场和力
        // currentArrowsGroup.userData.mainArrow.visible = true; // 旧
        // currentArrowsGroup.userData.mainArrow.material.opacity = progress * 0.5; // 旧
        updateCurrentParticles(true, ARRAY_RADIUS);
        
        magneticFieldGroup.children.forEach(ring => ring.material.opacity = progress * 0.5);
        forceArrowsGroup.children.forEach(arrow => arrow.visible = true);

        updateUI("烧蚀 (ABLATION)", progress * 10, 0, "Plasma Shell");

        if (progress >= 1) {
            currentState = STATE.IMPLOSION;
            animTimer = 0;
            
            // 烧蚀完成，将金属丝替换为粒子云 (Imploding Plasma)
            wireGroup.visible = false;
            createImplodingPlasma();
        }
    }
    
    // 内爆阶段
    else if (currentState === STATE.IMPLOSION) {
        animTimer++;
        // J x B 力导致加速内缩
        const t = animTimer / 100; // 速度因子
        const currentRadius = ARRAY_RADIUS * (1 - t*t); 
        
        // 更新电流粒子位置跟随内爆
        updateCurrentParticles(true, currentRadius);

        if (currentRadius <= 0.5) {
            currentState = STATE.STAGNATION;
            animTimer = 0;
            // 隐藏内爆粒子，显示中心柱
            const implosionSys = scene.getObjectByName('implosionPlasma');
            if(implosionSys) implosionSys.visible = false;
            
            plasmaColumn.material.opacity = 1;
            plasmaColumn.scale.set(1, 1, 1);
            return;
        }

        // 更新内爆粒子位置
        updateImplodingPlasma(currentRadius, t);

        // 更新磁场环大小
        magneticFieldGroup.children.forEach(ring => {
            const s = (currentRadius + 2) / (ARRAY_RADIUS + 2);
            ring.scale.setScalar(s);
        });
        
        // 更新力箭头位置
        forceArrowsGroup.children.forEach((arrow, idx) => {
            const angle = (idx/8) * Math.PI * 2;
            arrow.position.set(Math.cos(angle)*(currentRadius+2), 0, Math.sin(angle)*(currentRadius+2));
        });

        updateUI("内爆 (IMPLOSION)", 20 + t*100, t*500, "Compressing");
    }
    
    // 滞止阶段
    else if (currentState === STATE.STAGNATION) {
        animTimer++;
        
        updateCurrentParticles(true, 0.5); 
        updateFusionBurst(); // 更新聚变粒子和冲击波

        // 剧烈闪烁
        plasmaColumn.material.color.setHex(Math.random() > 0.5 ? 0xffffff : 0x00ffff);
        plasmaColumn.scale.set(
            1 + Math.sin(time*50)*0.2, 
            1, 
            1 + Math.sin(time*50)*0.2
        );
        
        // 靶丸压缩/点火效果
        const target = scene.getObjectByName('targetPellet');
        if (target) {
            // 靶丸被压缩到极小，然后发光
            if (animTimer < 30) {
                // 压缩阶段 (0-30帧)
                const s = 1 - (animTimer/30) * 0.9; // 压缩到 0.1
                target.scale.setScalar(Math.max(s, 0.1));
                target.material.emissiveIntensity = 0.5 + animTimer/10;
            } else if (animTimer === 30) {
                // 点火瞬间 (Ignition)
                target.scale.setScalar(0.3); // 稍微热膨胀
                target.material.emissive.setHex(0xffffff); // 白炽
                target.material.emissiveIntensity = 10;
                
                // 触发粒子爆发和冲击波
                const burst = scene.getObjectByName('fusionBurst');
                if(burst) {
                    burst.userData.active = true;
                    burst.material.opacity = 1;
                    // 重置粒子位置到中心
                    const pos = burst.geometry.attributes.position.array;
                    for(let i=0; i<pos.length; i++) pos[i] = 0;
                    burst.geometry.attributes.position.needsUpdate = true;
                }
                
                const shock = scene.getObjectByName('shockwave');
                if(shock) {
                    shock.visible = true;
                    shock.scale.setScalar(0.1);
                    shock.material.opacity = 0.8;
                }
                
            } else {
                // 燃烧阶段 (30+帧)
                target.scale.setScalar(0.3 + Math.sin(time*50)*0.05);
                target.material.emissiveIntensity = 5 + Math.sin(time*30)*2;
            }
        }

        // X射线爆发 (Bloom 增强)
        if (animTimer > 30) {
            composer.passes[1].strength = 4.0 + Math.sin(time*20);
        } else {
            composer.passes[1].strength = 2.0 + animTimer/15;
        }
        
        updateUI("滞止 (STAGNATION)", 25, 0, "High Density (Fusion)");
        
        if (animTimer > 120) { // 维持2秒
            currentState = STATE.INSTABILITY;
            animTimer = 0;
        }
    }
    
    // 不稳定性解体
    else if (currentState === STATE.INSTABILITY) {
        animTimer++;
        
        updateCurrentParticles(false); // 停止电流

        // 模拟 Sausage (m=0) 不稳定性：柱子变成一串球然后消失
        const progress = animTimer / 60;
        
        plasmaColumn.material.opacity = 1 - progress;
        plasmaColumn.scale.y = 1 + progress; // 拉断
        plasmaColumn.scale.x = 1 + Math.random() * progress * 5;
        
        composer.passes[1].strength = 2.0 * (1-progress);
        
        updateUI("解体 (INSTABILITY)", 0, 0, "Disrupting");
        
        if (progress >= 1) {
            resetSimulation();
        }
    }
}

function createImplodingPlasma() {
    // 替代 solid wires，用粒子云表示内爆等离子体
    const particleCount = 4000;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const angles = new Float32Array(particleCount); // 记住初始角度
    const heights = new Float32Array(particleCount);
    
    for(let i=0; i<particleCount; i++) {
        // 初始分布在 WIRE_COUNT 根丝的位置附近，增加一些随机扩散
        const wireIndex = Math.floor(Math.random() * WIRE_COUNT);
        const baseAngle = (wireIndex / WIRE_COUNT) * Math.PI * 2;
        const angleVar = (Math.random() - 0.5) * 0.1; // 角度扩散
        
        const r = ARRAY_RADIUS + (Math.random() - 0.5) * 0.5;
        const y = (Math.random() - 0.5) * ARRAY_HEIGHT;
        
        const finalAngle = baseAngle + angleVar;
        positions[i*3] = Math.cos(finalAngle) * r;
        positions[i*3+1] = y;
        positions[i*3+2] = Math.sin(finalAngle) * r;
        
        angles[i] = finalAngle;
        heights[i] = y;
    }
    
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
        color: 0xff00ff, // 洋红色/紫色等离子体
        size: 0.25,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });
    
    const sys = new THREE.Points(geo, mat);
    sys.name = 'implosionPlasma';
    sys.userData = { angles: angles, heights: heights };
    scene.add(sys);
}

function updateImplodingPlasma(currentRadius, t) {
    const sys = scene.getObjectByName('implosionPlasma');
    if(!sys) return;
    
    const positions = sys.geometry.attributes.position.array;
    const angles = sys.userData.angles;
    const heights = sys.userData.heights;
    const heightLimit = ARRAY_HEIGHT / 2;
    
    for(let i=0; i<angles.length; i++) {
        // 半径收缩
        const r = currentRadius + (Math.random()-0.5) * t * 2; // 随着内爆增加随机性(厚度)
        
        positions[i*3] = Math.cos(angles[i]) * r;
        // Y轴方向加上一些不稳定性，但严格限制在电极内
        let newY = heights[i] + (Math.random()-0.5) * t;
        if (newY > heightLimit) newY = heightLimit;
        if (newY < -heightLimit) newY = -heightLimit;
        
        positions[i*3+1] = newY;
        positions[i*3+2] = Math.sin(angles[i]) * r;
    }
    sys.geometry.attributes.position.needsUpdate = true;
}

function updateUI(status, current, velocity, density) {
    document.getElementById('status-text').innerText = status;
    document.getElementById('current-display').innerText = current.toFixed(1);
    document.getElementById('velocity-display').innerText = velocity.toFixed(0);
    document.getElementById('density-display').innerText = density;
}

function resetSimulation() {
    currentState = STATE.READY;
    animTimer = 0;
    
    wireGroup.visible = true;
    wireGroup.children.forEach(wire => {
        wire.position.set(wire.userData.initX, 0, wire.userData.initZ);
        // wire.scale.set(1, 1, 1); // 旧
        wire.scale.set(1, 1, 1); // 恢复初始大小 (注意 geometry 是 box)
        // BoxGeometry 的初始大小已经定好了，scale 设为 1 即可
        // 旋转角度保持不变
        wire.rotation.y = -wire.userData.angle;
        
        wire.material.color.setHex(0xaaaaaa); // 恢复银色
        wire.material.opacity = 1.0;
    });
    
    // 重置靶丸
    const target = scene.getObjectByName('targetPellet');
    if (target) {
        target.scale.setScalar(1);
        target.material.emissive.setHex(0xaa5500);
        target.material.emissiveIntensity = 0.2;
    }

    // 清理内爆等离子体
    const implosionSys = scene.getObjectByName('implosionPlasma');
    if(implosionSys) {
        scene.remove(implosionSys);
        implosionSys.geometry.dispose();
        implosionSys.material.dispose();
    }
    
    plasmaColumn.material.opacity = 0;
    plasmaColumn.scale.set(0.1, 1, 0.1);
    
    // currentArrowsGroup.userData.mainArrow.visible = false; // 旧
    updateCurrentParticles(false); // 隐藏电流粒子

    magneticFieldGroup.children.forEach(ring => {
        ring.material.opacity = 0;
        ring.scale.setScalar(1);
    });
    forceArrowsGroup.children.forEach(arrow => arrow.visible = false);
    
    composer.passes[1].strength = 1.5; // 重置光效
    
    updateUI("就绪 (READY)", 0, 0, "Solid");
}

function setupUIControls() {
    document.getElementById('btn-fire').addEventListener('click', () => {
        if (currentState === STATE.READY) currentState = STATE.ABLATION;
    });
    document.getElementById('btn-reset').addEventListener('click', resetSimulation);
    
    document.getElementById('toggle-wires').addEventListener('change', e => wireGroup.visible = e.target.checked);
    document.getElementById('toggle-current').addEventListener('change', e => currentArrowsGroup.visible = e.target.checked);
    document.getElementById('toggle-magnetic').addEventListener('change', e => magneticFieldGroup.visible = e.target.checked);
    document.getElementById('toggle-force').addEventListener('change', e => forceArrowsGroup.visible = e.target.checked);
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
