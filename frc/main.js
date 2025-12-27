import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';

// --- 全局变量 ---
let scene, camera, renderer, composer, controls;
let leftPlasmaGroup, rightPlasmaGroup, mergedPlasmaGroup;
let internalFieldGroup, externalFieldGroup, coilsGroup;
let fusionParticlesGroup;
let time = 0;

// 状态机
const STATE = {
    READY: 0,
    ACCELERATING: 1,
    COLLIDING: 2,
    MERGING: 3,
    STABLE: 4,
    FADING: 5
};
let currentState = STATE.READY;
let animationTime = 0; // 状态内计时

// FRC 参数
const PLASMA_LENGTH = 12;
const PLASMA_RADIUS = 3.5;
const COIL_RADIUS = 5.5;
const COIL_COUNT = 24; // 增加线圈数量以覆盖更长的加速轨道
const TRACK_LENGTH = 100; // 轨道总长

// 初始位置偏移
const START_OFFSET = 40;

init();
animate();

function init() {
    // 1. 场景
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b0b10); // 深色工程背景
    scene.fog = new THREE.FogExp2(0x0b0b10, 0.015);

    // 2. 相机 (正侧视，X轴方向看Z轴)
    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(120, 0, 0); // 侧面
    camera.lookAt(0, 0, 0);

    // 3. 渲染器
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ReinhardToneMapping;
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    // 灯光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(10, 50, 20);
    scene.add(dirLight);
    
    // 中心点光源 (聚变时变亮)
    const centerLight = new THREE.PointLight(0xff0055, 0, 100);
    centerLight.position.set(0, 0, 0);
    centerLight.name = "centerLight";
    scene.add(centerLight);

    // 4. 后处理 (Bloom)
    const renderScene = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
    bloomPass.threshold = 0.1;
    bloomPass.strength = 1.2;
    bloomPass.radius = 0.5;
    bloomPass.name = "bloomPass";

    composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);

    // 5. 控制器
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    
    // 6. 创建几何体
    createEnvironment(); // 线圈、背景
    createPlasmoids();   // 左右两个 FRC
    createFusionParticles(); // 聚变产物粒子系统

    // 7. 事件
    window.addEventListener('resize', onWindowResize);
    setupUIControls();
    
    resetSimulation();
}

function createEnvironment() {
    coilsGroup = new THREE.Group();
    externalFieldGroup = new THREE.Group();
    scene.add(coilsGroup);
    scene.add(externalFieldGroup);

    // 外部线圈 (Solenoid Coils) - 覆盖整个加速轨道
    const coilMaterial = new THREE.MeshStandardMaterial({
        color: 0x888888, // 恢复浅灰色金属
        metalness: 0.8,
        roughness: 0.3
    });

    for (let i = 0; i < COIL_COUNT; i++) {
        // 均匀分布在 Z 轴上 (-50 到 50)
        const z = (i / (COIL_COUNT - 1)) * TRACK_LENGTH - TRACK_LENGTH / 2;
        
        // 中间的线圈大一点 (反应室)，两边的做加速器
        let r = COIL_RADIUS;
        let scale = 1;
        if (Math.abs(z) < 10) {
            r = COIL_RADIUS * 1.5; // 中心腔室
            scale = 1.5;
        }

        const coilGeometry = new THREE.TorusGeometry(r, 0.3 * scale, 16, 64);
        const coil = new THREE.Mesh(coilGeometry, coilMaterial);
        coil.position.z = z;
        coilsGroup.add(coil);
    }
    
    // 添加外部开放磁场线 (External Open Field Lines)
    // 之前丢失的部分，现在补回来
    const externalLinesCount = 12;
    for (let i = 0; i < externalLinesCount; i++) {
        const angle = (i / externalLinesCount) * Math.PI * 2;
        const linePoints = [];
        
        // 沿着 Z 轴生成线条，穿过线圈中心
        for (let z = -TRACK_LENGTH/2 - 10; z <= TRACK_LENGTH/2 + 10; z += 1) {
            let r = COIL_RADIUS * 0.8; // 稍微在线圈内部
            
            // 在中间反应室区域膨胀
            if (Math.abs(z) < 15) {
                r = COIL_RADIUS * 1.2;
            }
            // 两端发散 (Divertor)
            else if (Math.abs(z) > 45) {
                r += (Math.abs(z) - 45) * 0.5;
            }

            linePoints.push(new THREE.Vector3(
                Math.cos(angle) * r,
                Math.sin(angle) * r,
                z
            ));
        }
        
        const geometry = new THREE.BufferGeometry().setFromPoints(linePoints);
        const material = new THREE.LineBasicMaterial({ 
            color: 0x00aaff, // 青蓝色
            transparent: true, 
            opacity: 0.3 
        });
        externalFieldGroup.add(new THREE.Line(geometry, material));
    }
    
    // 简单的中心腔室外壳 (透明)
    // 移除旧的 sphere chamber
    // scene.add(new THREE.Mesh(chamberGeo, chamberMat));

    createRealisticVessel();
}

function createRealisticVessel() {
    // 使用 LatheGeometry 创建 C-2 风格的真空室
    // 轮廓点 (Z, R) -> 这里 Lathe 是绕 Y 轴旋转，所以我们构建 (R, Y) 然后旋转网格
    const points = [];
    
    // 1. 中心 Confinement (大肚子)
    // Z: -15 到 15, R: 10
    points.push(new THREE.Vector2(10, -15));
    points.push(new THREE.Vector2(10, 15));
    
    // 2. 过渡到 Pinch (锥形)
    // Z: 15 到 20, R: 10 -> 4
    points.push(new THREE.Vector2(4, 20));
    
    // 3. Formation/Pinch (细管)
    // Z: 20 到 45, R: 4
    points.push(new THREE.Vector2(4, 45));
    
    // 4. Divertor (膨胀端)
    // Z: 45 到 55, R: 4 -> 12
    points.push(new THREE.Vector2(12, 50)); // 膨胀
    points.push(new THREE.Vector2(12, 55)); // 封头前
    points.push(new THREE.Vector2(0, 58));  // 封头 (闭合)

    // 对称部分 (负 Z)
    const profilePoints = [];
    profilePoints.push(new THREE.Vector2(0, -58));
    profilePoints.push(new THREE.Vector2(12, -55));
    profilePoints.push(new THREE.Vector2(12, -50));
    profilePoints.push(new THREE.Vector2(4, -45));
    profilePoints.push(new THREE.Vector2(4, -20));
    profilePoints.push(new THREE.Vector2(10, -15));
    profilePoints.push(new THREE.Vector2(10, 15));
    profilePoints.push(new THREE.Vector2(4, 20));
    profilePoints.push(new THREE.Vector2(4, 45));
    profilePoints.push(new THREE.Vector2(12, 50));
    profilePoints.push(new THREE.Vector2(12, 55));
    profilePoints.push(new THREE.Vector2(0, 58));

    // LatheGeometry: points (Vector2 x=R, y=Y)
    const vesselGeo = new THREE.LatheGeometry(profilePoints, 64);
    
    // 材质：更透明，颜色更深，适应亮背景
    const vesselMat = new THREE.MeshPhysicalMaterial({
        color: 0x88ccff,
        metalness: 0.1,
        roughness: 0.1,
        transmission: 0.9,
        transparent: true,
        opacity: 0.15, // 稍微增加一点
        side: THREE.DoubleSide,
        depthWrite: false
    });
    
    const vessel = new THREE.Mesh(vesselGeo, vesselMat);
    // 旋转 90度，使 Y 轴对齐 Z 轴
    vessel.rotation.x = -Math.PI / 2;
    scene.add(vessel);
    
    // 添加线框以增强轮廓可见性 (深色线框)
    const wireframe = new THREE.LineSegments(
        new THREE.WireframeGeometry(vesselGeo),
        new THREE.LineBasicMaterial({ color: 0x4488ff, transparent: true, opacity: 0.3 })
    );
    vessel.add(wireframe);
    
    // 添加文字标签 (使用 HTML 覆盖)
    addLabel("South Formation", -35, 15);
    addLabel("North Formation", 35, 15);
    addLabel("Confinement Vessel", 0, 18);
    addLabel("Divertor", -52, 18);
    addLabel("Divertor", 52, 18);
}

function addLabel(text, z, yOffset) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 512;
    canvas.height = 128;
    
    // ctx.fillStyle = "rgba(0, 0, 0, 0)";
    // ctx.fillRect(0, 0, 512, 128);
    
    ctx.font = "bold 40px Arial";
    ctx.fillStyle = "#ffffff"; // 恢复白色文字
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    // ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
    // ctx.lineWidth = 2;
    
    // ctx.strokeText(text, 256, 64);
    ctx.fillText(text, 256, 64);
    
    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMat);
    
    sprite.position.set(0, yOffset, z); 
    sprite.scale.set(20, 5, 1);
    
    scene.add(sprite);
}

function createSinglePlasmoid(color) {
    const group = new THREE.Group();
    
    // 1. 等离子体外壳 (Sphere拉伸)
    const plasmaGeometry = new THREE.SphereGeometry(PLASMA_RADIUS, 64, 64);
    plasmaGeometry.scale(1, 1, PLASMA_LENGTH / (PLASMA_RADIUS * 2));
    
    const plasmaMaterial = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    const plasmaMesh = new THREE.Mesh(plasmaGeometry, plasmaMaterial);
    group.add(plasmaMesh);

    // 2. 内部高亮核心
    const coreGeometry = new THREE.SphereGeometry(PLASMA_RADIUS * 0.6, 32, 32);
    coreGeometry.scale(1, 1, (PLASMA_LENGTH * 0.7) / (PLASMA_RADIUS * 1.2));
    const coreMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });
    group.add(new THREE.Mesh(coreGeometry, coreMaterial));

    // 3. 内部磁场线 (Closed Field Lines)
    const linesGroup = new THREE.Group();
    linesGroup.name = 'internalLines'; // 命名以便控制
    const internalLinesCount = 5;
    for (let i = 0; i < internalLinesCount; i++) {
        const progress = (i + 1) / (internalLinesCount + 1);
        const rBase = PLASMA_RADIUS * progress;
        const zLimit = (PLASMA_LENGTH / 2) * Math.sqrt(1 - progress * progress) * 0.8;
        
        const curve = new THREE.EllipseCurve(0, 0, zLimit, rBase, 0, 2 * Math.PI, false, 0);
        const points = curve.getPoints(64);
        
        // 旋转几个角度
        [0, Math.PI/2, Math.PI, 3*Math.PI/2].forEach(angle => {
            const linePoints = points.map(p => new THREE.Vector3(Math.cos(angle) * p.y, Math.sin(angle) * p.y, p.x));
            const geo = new THREE.BufferGeometry().setFromPoints(linePoints);
            // 亮色线条
            const mat = new THREE.LineBasicMaterial({ color: 0x00ffcc, transparent: true, opacity: 0.6 });
            linesGroup.add(new THREE.Line(geo, mat));
        });
    }
    group.add(linesGroup);
    
    // 4. 粒子系统
    const particleCount = 1000;
    const pPos = new Float32Array(particleCount * 3);
    const pData = [];
    for(let i=0; i<particleCount; i++) {
        let x, y, z;
        while(true) {
            x = (Math.random()-0.5)*2*PLASMA_RADIUS;
            y = (Math.random()-0.5)*2*PLASMA_RADIUS;
            z = (Math.random()-0.5)*PLASMA_LENGTH;
            if ((x*x+y*y)/(PLASMA_RADIUS*PLASMA_RADIUS) + (z*z)/((PLASMA_LENGTH/2)**2) <= 1) break;
        }
        pPos[i*3] = x; pPos[i*3+1] = y; pPos[i*3+2] = z;
        pData.push({ angle: Math.atan2(y, x), radius: Math.sqrt(x*x+y*y), z: z, speed: 0.05+Math.random()*0.05 });
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    // 在亮色背景下，AdditiveBlending 的白色粒子不可见，改用 Emissive 或普通混合深色
    // 但为了保持等离子体感，我们用较浓的颜色
    const pMat = new THREE.PointsMaterial({ 
        color: 0xff3366, 
        size: 0.3, 
        transparent: true,
        opacity: 0.8,
        // blending: THREE.AdditiveBlending // 亮色背景下不用 Additive
    });
    const pSys = new THREE.Points(pGeo, pMat);
    pSys.userData = { pData: pData };
    group.add(pSys);
    group.userData.particleSystem = pSys;

    return group;
}

function createPlasmoids() {
    // 左侧 FRC (颜色更深)
    leftPlasmaGroup = createSinglePlasmoid(0xff0044);
    scene.add(leftPlasmaGroup);

    // 右侧 FRC
    rightPlasmaGroup = createSinglePlasmoid(0xff0044);
    scene.add(rightPlasmaGroup);
    
    // 合并后的 FRC (初始隐藏)
    // 聚变后颜色变青白->在亮色背景下用深蓝/紫色核心表示高温
    mergedPlasmaGroup = createSinglePlasmoid(0x0044ff); 
    mergedPlasmaGroup.scale.set(1.5, 1.5, 0.8);
    mergedPlasmaGroup.visible = false;
    scene.add(mergedPlasmaGroup);
}

function createFusionParticles() {
    fusionParticlesGroup = new THREE.Group();
    scene.add(fusionParticlesGroup);
    
    // 聚变产物 (中子等) 
    // 修改：不飞溅到到处都是，而是限制在反应腔附近
    const count = 2000; 
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    
    for(let i=0; i<count; i++) {
        positions[i*3] = 0;
        positions[i*3+1] = 0;
        positions[i*3+2] = 0;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
        color: 0xffdd44, // 金黄色产物
        size: 0.3,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending
    });
    
    const points = new THREE.Points(geometry, material);
    points.userData = {
        velocities: [],
        active: false
    };
    
    // 初始化速度向量
    for(let i=0; i<count; i++) {
        // 随机方向
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const speed = 0.2 + Math.random() * 0.3; // 速度降低，限制范围
        
        points.userData.velocities.push({
            x: speed * Math.sin(phi) * Math.cos(theta),
            y: speed * Math.sin(phi) * Math.sin(theta),
            z: speed * Math.cos(phi)
        });
    }
    
    fusionParticlesGroup.add(points);
}

function updateParticles(group) {
    if (!group.visible) return;
    const sys = group.userData.particleSystem;
    const positions = sys.geometry.attributes.position.array;
    const data = sys.userData.pData;

    for (let i = 0; i < data.length; i++) {
        const p = data[i];
        p.angle += p.speed;
        positions[i*3] = Math.cos(p.angle) * p.radius;
        positions[i*3+1] = Math.sin(p.angle) * p.radius;
        positions[i*3+2] = p.z;
    }
    sys.geometry.attributes.position.needsUpdate = true;
}

function updateFusionParticles() {
    const points = fusionParticlesGroup.children[0];
    if (!points.userData.active) return;
    
    const positions = points.geometry.attributes.position.array;
    const velocities = points.userData.velocities;
    
    for(let i=0; i<velocities.length; i++) {
        // 限制范围，使其在一定范围内循环或反弹，不飞出
        let x = positions[i*3] + velocities[i].x;
        let y = positions[i*3+1] + velocities[i].y;
        let z = positions[i*3+2] + velocities[i].z;
        
        // 严格限制在 Confinement Vessel 内
        const limitR = 9;  // 略小于 R=10
        const limitZ = 14; // 略小于 Z=15

        // 简单的软边界限制 -> 改为强边界反弹
        if (x*x + y*y > limitR*limitR) {
             // 径向反弹
             const r = Math.sqrt(x*x + y*y);
             x = (x / r) * limitR * 0.95; 
             y = (y / r) * limitR * 0.95;
             velocities[i].x *= -0.8;
             velocities[i].y *= -0.8;
        }
        if (Math.abs(z) > limitZ) {
             // 轴向反弹
             z = Math.sign(z) * limitZ * 0.95;
             velocities[i].z *= -0.8;
        }
        
        positions[i*3] = x;
        positions[i*3+1] = y;
        positions[i*3+2] = z;
    }
    points.geometry.attributes.position.needsUpdate = true;
    
    // 配合 FADING 状态逐渐消失
    if (currentState === STATE.FADING && points.material.opacity > 0) {
        points.material.opacity -= 0.02;
    }
}

function triggerFusionBurst() {
    const points = fusionParticlesGroup.children[0];
    points.userData.active = true;
    points.material.opacity = 1.0;
    
    // 重置位置
    const positions = points.geometry.attributes.position.array;
    for(let i=0; i<positions.length; i++) positions[i] = 0;
    points.geometry.attributes.position.needsUpdate = true;
}

function updateUI(status, velocity, temp, fusion) {
    document.getElementById('status-text').innerText = status;
    document.getElementById('velocity-display').innerText = velocity.toFixed(0);
    document.getElementById('temp-display').innerText = temp.toFixed(1);
    document.getElementById('fusion-display').innerText = fusion.toFixed(0);
    
    const statusEl = document.getElementById('status-text');
    if (status === "FUSION IGNITION!") {
        statusEl.style.color = "#ff0055";
        statusEl.style.textShadow = "0 0 10px #ff0055";
    } else {
        statusEl.style.color = "#00d2ff";
        statusEl.style.textShadow = "none";
    }
}

function resetSimulation() {
    currentState = STATE.READY;
    animationTime = 0;
    
    leftPlasmaGroup.visible = true;
    rightPlasmaGroup.visible = true;
    mergedPlasmaGroup.visible = false;
    
    leftPlasmaGroup.position.z = -START_OFFSET;
    rightPlasmaGroup.position.z = START_OFFSET;
    
    scene.getObjectByName("centerLight").intensity = 0;
    
    // Reset fusion particles
    const points = fusionParticlesGroup.children[0];
    points.userData.active = false;
    points.material.opacity = 0;
    
    updateUI("就绪 (READY)", 0, 0.1, 0);
}

function setupUIControls() {
    document.getElementById('btn-fire').addEventListener('click', () => {
        if (currentState === STATE.READY || currentState === STATE.STABLE || currentState === STATE.FADING) {
            currentState = STATE.ACCELERATING;
        }
    });
    
    document.getElementById('btn-reset').addEventListener('click', resetSimulation);
    
    document.getElementById('toggle-plasma').addEventListener('change', (e) => {
        // 控制等离子体网格和粒子
        // 需要遍历 group 找到 mesh 和 points
        [leftPlasmaGroup, rightPlasmaGroup, mergedPlasmaGroup].forEach(group => {
            if (!group) return;
            // 只要不是 internalLines 就显示/隐藏
            group.children.forEach(child => {
                if (child.name !== 'internalLines') {
                    child.visible = e.target.checked;
                }
            });
        });
        
        // 特殊处理 mergedPlasmaGroup，因为它的 visible 属性也被状态机控制
        // 如果状态机说隐藏，那就隐藏；如果状态机说显示，才受 toggle 影响
        // 这里简化：Toggle 只影响可见性，不影响逻辑。
        // 为了避免冲突，我们在 animate 中更新 group.visible 时要考虑 checkbox
        // 更好的做法：把 visible 逻辑放在 animate 中统一管理
    });
    
    document.getElementById('toggle-internal-field').addEventListener('change', (e) => {
        // 在 group 中查找名为 internalLines 的子对象
        [leftPlasmaGroup, rightPlasmaGroup, mergedPlasmaGroup].forEach(group => {
            if (group) {
                const lines = group.getObjectByName('internalLines');
                if (lines) lines.visible = e.target.checked;
            }
        });
        // 确保 internalFieldGroup 存在
        if (internalFieldGroup) internalFieldGroup.visible = e.target.checked;
    });
    
    document.getElementById('toggle-external-field').addEventListener('change', (e) => {
        externalFieldGroup.visible = e.target.checked;
    });
    
    document.getElementById('toggle-coils').addEventListener('change', (e) => coilsGroup.visible = e.target.checked);
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
    
    // 粒子动画
    updateParticles(leftPlasmaGroup);
    updateParticles(rightPlasmaGroup);
    updateParticles(mergedPlasmaGroup);
    updateFusionParticles();
    
    controls.update();

    // 状态机逻辑
    const centerLight = scene.getObjectByName("centerLight");
    
    switch (currentState) {
        case STATE.READY:
            // 闲置晃动
            leftPlasmaGroup.position.z = -START_OFFSET + Math.sin(time) * 0.5;
            rightPlasmaGroup.position.z = START_OFFSET - Math.sin(time) * 0.5;
            
            // 确保完全可见且大小正常
            leftPlasmaGroup.scale.set(1, 1, 1);
            rightPlasmaGroup.scale.set(1, 1, 1);
            leftPlasmaGroup.visible = true;
            rightPlasmaGroup.visible = true;
            mergedPlasmaGroup.visible = false;
            
            // 渐入效果 (如果是自动重置回来的)
            if (leftPlasmaGroup.children[0].material.opacity < 0.3) {
                leftPlasmaGroup.children.forEach(c => { if(c.material) c.material.opacity += 0.01 });
                rightPlasmaGroup.children.forEach(c => { if(c.material) c.material.opacity += 0.01 });
            }
            break;
            
        case STATE.ACCELERATING:
            // 加速向中心 - 减慢速度，展示压缩过程
            const speed = 0.2 + animationTime * 0.005; // 速度大大降低
            leftPlasmaGroup.position.z += speed;
            rightPlasmaGroup.position.z -= speed;
            
            // 压缩效果：随着接近中心 (z=0)，体积变小 (密度变大)
            const dist = Math.abs(leftPlasmaGroup.position.z);
            const maxDist = START_OFFSET;
            // 从 1.0 压缩到 0.3 (更显著的压缩)
            const compression = 0.3 + 0.7 * (dist / maxDist);
            leftPlasmaGroup.scale.setScalar(compression);
            rightPlasmaGroup.scale.setScalar(compression);

            animationTime += 1;
            updateUI("加速压缩中 (COMPRESSING)", speed * 100, 1.0 + animationTime * 0.1, 0);
            
            // 碰撞检测
            if (leftPlasmaGroup.position.z >= -2) { // 接近中心
                currentState = STATE.COLLIDING;
                animationTime = 0;
            }
            break;
            
        case STATE.COLLIDING:
            // 碰撞瞬间
            leftPlasmaGroup.position.z = 0;
            rightPlasmaGroup.position.z = 0;
            leftPlasmaGroup.visible = false;
            rightPlasmaGroup.visible = false;
            
            // 剧烈震动
            scene.position.x = (Math.random() - 0.5) * 0.5;
            scene.position.y = (Math.random() - 0.5) * 0.5;
            
            animationTime += 1;
            
            // 闪光
            centerLight.intensity = 5 + Math.random() * 5;
            updateUI("撞击! (IMPACT)", 0, 50, 10);

            if (animationTime > 10) {
                currentState = STATE.MERGING;
                scene.position.set(0, 0, 0); // 停止震动
                mergedPlasmaGroup.visible = true;
                // 初始状态是压缩的
                mergedPlasmaGroup.scale.set(0.6, 0.6, 0.6); 
                triggerFusionBurst();
            }
            break;
            
        case STATE.MERGING:
            // 热膨胀: 从 0.6 膨胀到 1.2，但被限制在反应腔内
            const targetScale = 1.2;
            mergedPlasmaGroup.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale * 0.6), 0.1);
            
            centerLight.intensity = 3;
            
            animationTime += 1;
            updateUI("融合中 (MERGING)", 0, 80, 500);
            
            if (animationTime > 30) {
                currentState = STATE.STABLE;
                animationTime = 0; // 重置计时用于稳定燃烧
            }
            break;
            
        case STATE.STABLE:
            // 稳定燃烧 (2秒左右 -> 60fps * 2 = 120帧)
            const stablePulse = Math.sin(time * 10) * 0.05 + 1.2;
            mergedPlasmaGroup.scale.set(stablePulse, stablePulse, stablePulse * 0.6);
            centerLight.intensity = 2 + Math.sin(time * 5);
            
            updateUI("聚变点火! (IGNITION)", 0, 100, 1000 + Math.random()*100);
            
            animationTime++;
            if (animationTime > 180) { // 3秒后熄灭
                currentState = STATE.FADING;
                animationTime = 0;
            }
            break;

        case STATE.FADING:
            // 聚变结束，等离子体消失
            mergedPlasmaGroup.children.forEach(c => {
                 if(c.material && c.material.opacity > 0) c.material.opacity -= 0.02;
            });
            centerLight.intensity *= 0.9;
            
            updateUI("反应结束 (FINISHED)", 0, 10, 0);
            
            animationTime++;
            if (animationTime > 100) {
                // 重置循环
                resetSimulation();
                // 自动让两侧出现
                leftPlasmaGroup.children.forEach(c => { if(c.material) c.material.opacity = 0 });
                rightPlasmaGroup.children.forEach(c => { if(c.material) c.material.opacity = 0 });
            }
            break;
    }

    composer.render();
}
