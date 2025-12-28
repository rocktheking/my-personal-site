import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';

// --- 全局变量 ---
let scene, camera, renderer, composer, controls;
let tfCoilsGroup, pfCoilsGroup, csCoilGroup, vacuumChamber;
let fieldLinesGroup, plasmaMesh;
let time = 0;
let isBurning = false;

// 状态标志
const STATE = {
    TF_ON: false,
    CS_ON: false,
    PF_ON: false
};

// 参数
const MAJOR_RADIUS = 15; // 大半径 R
const MINOR_RADIUS = 6;  // 小半径 a

init();
animate();

function init() {
    // 1. 场景
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050508);
    scene.fog = new THREE.FogExp2(0x050508, 0.015);

    // 2. 相机
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(30, 25, 30);
    camera.lookAt(0, 0, 0);

    // 3. 渲染器
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    // 灯光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(20, 40, 20);
    scene.add(dirLight);
    
    const blueLight = new THREE.PointLight(0x0088ff, 1, 50);
    blueLight.position.set(0, 10, 0);
    scene.add(blueLight);

    // 4. 后处理
    const renderScene = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
    bloomPass.threshold = 0.2;
    bloomPass.strength = 1.5;
    bloomPass.radius = 0.5;

    composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);

    // 5. 控制器
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.3;

    // 6. 创建组件
    createVacuumChamber();
    createTFCoils(); // 纵场线圈
    createPFCoils(); // 极向场线圈
    createCSCoil();  // 中心螺线管
    createPlasma();  // 等离子体
    createFieldLines(); // 磁感线

    // 7. 事件
    window.addEventListener('resize', onWindowResize);
    setupUIControls();
    
    updateFieldVisualization();
}

function createVacuumChamber() {
    // 真空室：一个半透明的环形，平躺在 XZ 平面上
    // 半径要小于 TF 线圈半径
    const geometry = new THREE.TorusGeometry(MAJOR_RADIUS, MINOR_RADIUS, 64, 128);
    geometry.rotateX(Math.PI / 2); // 旋转90度，使其平躺
    
    // 增加可见度：降低透明度，增加反射
    const material = new THREE.MeshPhysicalMaterial({
        color: 0xaaaaaa, // 浅灰色金属
        metalness: 0.8,
        roughness: 0.2,
        transmission: 0.5, // 降低透光率，让管壁更明显
        transparent: true,
        opacity: 0.4,      // 增加不透明度
        side: THREE.DoubleSide,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1
    });
    
    vacuumChamber = new THREE.Mesh(geometry, material);
    
    // 添加明显的线框结构，强调管壁存在
    const wireGeo = new THREE.WireframeGeometry(geometry);
    const wireMat = new THREE.LineBasicMaterial({ color: 0x444466, transparent: true, opacity: 0.15 });
    const wires = new THREE.LineSegments(wireGeo, wireMat);
    vacuumChamber.add(wires);
    
    scene.add(vacuumChamber);
    
    // 内部发光
    const glowGeo = new THREE.TorusGeometry(MAJOR_RADIUS, MINOR_RADIUS * 0.95, 64, 128);
    glowGeo.rotateX(Math.PI / 2);
    const glowMat = new THREE.MeshBasicMaterial({
        color: 0xff4400,
        transparent: true,
        opacity: 0,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.name = 'chamberGlow';
    vacuumChamber.add(glow);
}

function createTFCoils() {
    tfCoilsGroup = new THREE.Group();
    scene.add(tfCoilsGroup);
    
    // 18个 D 形线圈 (这里用圆形代替，但方向要对)
    // 装置平躺在 XZ 面，TF 线圈应该是竖直的，像切片一样
    // 每个线圈平面应该包含 Y 轴 (垂直轴) 和 径向轴
    
    const count = 18;
    const coilRadius = MINOR_RADIUS + 1.5; 
    
    // 创建 D 形线圈几何体
    // 使用 ExtrudeGeometry 创建真正的 D 形
    const shape = new THREE.Shape();
    // D 的直边在左侧 (靠近中心)
    const R_inner = -coilRadius; // 相对中心的偏移
    const R_outer = coilRadius;
    const height = coilRadius * 2.5; // 拉长一点
    
    // 绘制 D 形 (在 XY 平面绘制)
    // 从下往上画直边
    shape.moveTo(-coilRadius * 0.5, -height/2);
    shape.lineTo(-coilRadius * 0.5, height/2);
    // 画右侧圆弧
    shape.bezierCurveTo(
        coilRadius * 2, height/2, 
        coilRadius * 2, -height/2, 
        -coilRadius * 0.5, -height/2
    );
    
    const extrudeSettings = {
        steps: 2,
        depth: 1,
        bevelEnabled: true,
        bevelThickness: 0.2,
        bevelSize: 0.1,
        bevelSegments: 2
    };
    
    // const coilGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    // 简单起见还是用圆环，先调对方向
    const coilGeo = new THREE.TorusGeometry(coilRadius, 0.8, 16, 64);
    
    const mat = new THREE.MeshStandardMaterial({
        color: 0xcd7f32, // 铜
        metalness: 0.6,
        roughness: 0.4
    });

    for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        
        const coil = new THREE.Mesh(coilGeo, mat);
        
        // 1. 默认 Torus 在 XY 平面。
        // 我们需要它竖直，且包裹住 (MAJOR_RADIUS, 0, 0) 处的真空室截面
        // 在 (R, 0, 0) 处，真空室管子切线是 Z 轴。
        // 所以线圈平面应该是 XY 平面。
        // 所以几何体不需要旋转。
        
        // 2. 移动到大半径处
        coil.position.set(MAJOR_RADIUS, 0, 0);
        
        // 3. 绕 Y 轴 (中心垂直轴) 旋转
        const pivot = new THREE.Group();
        pivot.add(coil);
        pivot.rotation.y = angle;
        
        tfCoilsGroup.add(pivot);
    }
    
    tfCoilsGroup.visible = false;
}

function createPFCoils() {
    pfCoilsGroup = new THREE.Group();
    scene.add(pfCoilsGroup);
    
    const mat = new THREE.MeshStandardMaterial({
        color: 0xaaaaaa, 
        metalness: 0.6,
        roughness: 0.4
    });
    
    // 上下各 3 组，水平圆环 (平行于 XZ 平面)
    const positions = [
        { r: 4, y: 12 }, { r: 10, y: 14 }, { r: 18, y: 10 },
        { r: 4, y: -12 }, { r: 10, y: -14 }, { r: 18, y: -10 }
    ];
    
    positions.forEach(pos => {
        const geo = new THREE.TorusGeometry(pos.r, 0.8, 16, 64);
        geo.rotateX(Math.PI / 2); // 旋转使其水平
        const coil = new THREE.Mesh(geo, mat);
        coil.position.y = pos.y;
        pfCoilsGroup.add(coil);
    });
    
    pfCoilsGroup.visible = false;
}

function createCSCoil() {
    csCoilGroup = new THREE.Group();
    scene.add(csCoilGroup);
    
    // 中心柱状螺线管，沿 Y 轴
    // 增加高度，使其明显突出于 TF 线圈
    const geo = new THREE.CylinderGeometry(3, 3, 35, 32);
    const mat = new THREE.MeshStandardMaterial({
        color: 0xff8800, // 亮橙色/铜色，非常显眼
        metalness: 0.5,
        roughness: 0.4,
        emissive: 0xff4400, // 强烈的橙红自发光
        emissiveIntensity: 1.0, // 提高强度
        side: THREE.DoubleSide,
        transparent: false, // 明确不透明
        opacity: 1.0
    });
    
    // 纹理：高对比度
    const canvas = document.createElement('canvas');
    canvas.width = 64; canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ff8800'; ctx.fillRect(0,0,64,64); // 亮底色
    ctx.fillStyle = '#882200'; ctx.fillRect(0,0,64,16); // 深色条纹，加宽
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 15);
    mat.map = tex;
    
    const cs = new THREE.Mesh(geo, mat);
    // 移除手动 renderOrder，让它作为不透明物体正常参与深度遮挡
    csCoilGroup.add(cs);
    
    csCoilGroup.visible = false;
}

function createPlasma() {
    // 燃烧的等离子体环，平躺
    const geo = new THREE.TorusGeometry(MAJOR_RADIUS, MINOR_RADIUS - 1, 64, 128);
    geo.rotateX(Math.PI / 2); // 平躺
    
    const mat = new THREE.MeshBasicMaterial({
        color: 0xff4400,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending
    });
    
    plasmaMesh = new THREE.Mesh(geo, mat);
    plasmaMesh.name = 'plasma';
    scene.add(plasmaMesh);
    
    // 添加粒子辉光 (蓝色高能粒子)
    const particleCount = 2000; // 增加粒子数量
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(particleCount * 3);
    const pAng = new Float32Array(particleCount); 
    const pPol = new Float32Array(particleCount); 
    const pRad = new Float32Array(particleCount); 
    
    for(let i=0; i<particleCount; i++) {
        pAng[i] = Math.random() * Math.PI * 2;
        pPol[i] = Math.random() * Math.PI * 2;
        pRad[i] = Math.random() * (MINOR_RADIUS - 1.5);
        updateParticlePos(i, pPos, pAng, pPol, pRad);
    }
    
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
        color: 0x00ffff, // 青蓝色
        size: 0.8,       // 增大粒子尺寸
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthTest: false // 关键：禁用深度测试，使其永远显示在最上层
    });
    
    const plasmaParticles = new THREE.Points(pGeo, pMat);
    plasmaParticles.name = 'plasmaParticles';
    // 确保渲染顺序
    plasmaParticles.renderOrder = 2;
    plasmaParticles.userData = { angles: pAng, pols: pPol, rads: pRad };
    scene.add(plasmaParticles);
}

function updateParticlePos(i, posArr, angArr, polArr, radArr) {
    // Torus坐标转换 (XZ平面)
    // x = (R + r*cos(theta)) * cos(phi)
    // z = (R + r*cos(theta)) * sin(phi)
    // y = r * sin(theta)
    
    const R = MAJOR_RADIUS;
    const r = radArr[i];
    const phi = angArr[i];   // 环向角 (绕 Y 轴)
    const theta = polArr[i]; // 极向角
    
    posArr[i*3] = (R + r * Math.cos(theta)) * Math.cos(phi);
    posArr[i*3+1] = r * Math.sin(theta); // Y 轴是垂直的
    posArr[i*3+2] = (R + r * Math.cos(theta)) * Math.sin(phi);
}

function createFieldLines() {
    fieldLinesGroup = new THREE.Group();
    scene.add(fieldLinesGroup);
    // 动态生成，在 updateFieldVisualization 中处理
}

function updateFieldVisualization() {
    // 清除旧的线
    while(fieldLinesGroup.children.length > 0){ 
        const obj = fieldLinesGroup.children[0];
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) obj.material.dispose();
        fieldLinesGroup.remove(obj); 
    }
    
    // 根据状态生成线
    // 1. TF ONLY -> 环形线 (Green)
    // 2. PF/CS ONLY -> 极向线 (Blue)
    // 3. ALL -> 螺旋线 (Gold/Red)
    
    const hasTF = STATE.TF_ON;
    const hasPoloidal = STATE.PF_ON || STATE.CS_ON; // CS 和 PF 都产生极向场
    
    const lineCount = 150;
    
    if (hasTF && !hasPoloidal) {
        // 纯纵场 (Toroidal Field)
        // 磁感线是沿着环向的平行同心圆环 (在 XZ 平面)
        document.getElementById('field-type').innerText = "Toroidal (纵场)";
        document.getElementById('field-type').style.color = "#00ff00";
        
        // 增加不透明度和线宽，确保可见
        const mat = new THREE.LineBasicMaterial({ 
            color: 0x00ff00, 
            transparent: true, 
            opacity: 0.8, // 提高不透明度
            depthTest: false // 关键：禁用深度测试，使其透过真空室可见
        });
        
        const count = 60;
        for(let i=0; i<count; i++) {
            // 随机小半径 r 和极向角 theta
            const r = Math.random() * (MINOR_RADIUS - 0.5);
            const theta = Math.random() * Math.PI * 2;
            
            // 环的大半径
            const R_local = MAJOR_RADIUS + r * Math.cos(theta);
            // 环的高度 (Y)
            const y = r * Math.sin(theta);
            
            // 环位于 XZ 平面，半径 R_local，中心 (0, y, 0)
            const geo = new THREE.TorusGeometry(R_local, 0.05, 4, 128);
            geo.rotateX(Math.PI/2); // 旋转平躺
            
            const line = new THREE.Line(geo, mat);
            line.position.y = y;
            
            fieldLinesGroup.add(line);
        }
    } 
    else if (!hasTF && hasPoloidal) {
        // 纯极向场 (Poloidal Field)
        // 围绕等离子体的小圆环 (垂直于管子切线)
        // 每个环是一个在某个环向角 phi 处的垂直圆环
        document.getElementById('field-type').innerText = "Poloidal (极向场)";
        document.getElementById('field-type').style.color = "#0088ff";
        
        const mat = new THREE.LineBasicMaterial({ 
            color: 0x0088ff, 
            transparent: true, 
            opacity: 0.8,
            depthTest: false
        });
        for(let i=0; i<50; i++) {
            const r = MINOR_RADIUS + (Math.random()-0.5)*4;
            const phi = Math.random() * Math.PI * 2; // 环向角
            
            // 在 phi 处的垂直圆环
            // 半径 r, 中心在大半径圆上 (MAJOR_RADIUS * cos(phi), 0, MAJOR_RADIUS * sin(phi))
            // 环的平面应该包含 Y 轴和 径向矢量
            
            const geo = new THREE.TorusGeometry(r, 0.05, 4, 64);
            const line = new THREE.Line(geo, mat);
            
            // 1. 默认 XY 平面。我们需要它竖直。
            // 2. 移动到大半径处
            line.position.set(MAJOR_RADIUS, 0, 0);
            
            // 3. 绕 Y 轴旋转 phi
            const pivot = new THREE.Group();
            pivot.add(line);
            pivot.rotation.y = phi;
            
            fieldLinesGroup.add(pivot);
        }
    }
    else if (hasTF && hasPoloidal) {
        // 螺旋场 (Helical Field)
        document.getElementById('field-type').innerText = "Helical (螺旋场)";
        document.getElementById('field-type').style.color = "#ffaa00";
        
        const mat = new THREE.LineBasicMaterial({ 
            color: 0xffaa00, 
            transparent: true, 
            opacity: 0.8,
            depthTest: false
        });
        
        const q = 3; 
        
        for(let i=0; i<40; i++) {
            const points = [];
            const r = MINOR_RADIUS * (0.5 + Math.random()*0.5);
            const startPhi = Math.random() * Math.PI * 2;
            const startTheta = Math.random() * Math.PI * 2;
            
            const steps = 300;
            for(let j=0; j<steps; j++) {
                const t = j/steps;
                const phi = startPhi + t * Math.PI * 4; // 绕大环 (XZ平面)
                const theta = startTheta + t * Math.PI * 4 * q; // 绕小环
                
                // 坐标转换 (Y 轴垂直)
                // R_pos = MAJOR_RADIUS + r * cos(theta)
                // x = R_pos * cos(phi)
                // z = R_pos * sin(phi)
                // y = r * sin(theta)
                
                const R_pos = MAJOR_RADIUS + r * Math.cos(theta);
                const x = R_pos * Math.cos(phi);
                const z = R_pos * Math.sin(phi);
                const y = r * Math.sin(theta);
                
                points.push(new THREE.Vector3(x, y, z));
            }
            const g = new THREE.BufferGeometry().setFromPoints(points);
            const l = new THREE.Line(g, mat);
            fieldLinesGroup.add(l);
        }
    }
    else {
        document.getElementById('field-type').innerText = "None (无磁场)";
        document.getElementById('field-type').style.color = "#888";
    }
}

function updatePhysics() {
    if (isBurning) {
        time += 0.02;
        
        // 等离子体扰动
        if (plasmaMesh) {
            // 模拟湍流：通过旋转和缩放
            // 实际上应该用 Shader，这里简单模拟
            plasmaMesh.material.opacity = 0.8 + Math.sin(time * 20) * 0.1;
            plasmaMesh.scale.setScalar(1 + Math.sin(time * 50) * 0.005);
        }
        
        // 粒子流动 - 严格限制在真空室内部
        const particles = scene.getObjectByName('plasmaParticles');
        if (particles) {
            const positions = particles.geometry.attributes.position.array;
            const angs = particles.userData.angles;
            const pols = particles.userData.pols;
            const rads = particles.userData.rads;
            
            for(let i=0; i<angs.length; i++) {
                // 沿磁感线运动 (螺旋)
                // 环向速度快，极向速度慢 (q=3)
                angs[i] += 0.05; // 环向
                pols[i] += 0.05 / 3; // 极向 = 环向/q
                
                // 确保半径限制在真空室内 (MINOR_RADIUS)
                // 增加一点随机抖动模拟高温
                let r = rads[i] + Math.sin(time * 10 + i) * 0.2;
                if (r > MINOR_RADIUS - 0.5) r = MINOR_RADIUS - 0.5;
                
                updateParticlePos(i, positions, angs, pols, rads); // 注意这里用 rads[i] 还是 r? 应该用 r
                
                // 修正 updateParticlePos 逻辑：直接在这里计算位置，避免传参混乱
                const R = MAJOR_RADIUS;
                const phi = angs[i];
                const theta = pols[i];
                
                positions[i*3] = (R + r * Math.cos(theta)) * Math.cos(phi);
                positions[i*3+1] = r * Math.sin(theta);
                positions[i*3+2] = (R + r * Math.cos(theta)) * Math.sin(phi);
            }
            particles.geometry.attributes.position.needsUpdate = true;
            particles.material.opacity = 1.0;
            particles.material.size = 0.8;
        }
        
        document.getElementById('plasma-status').innerText = "Burning (150 MK)";
        document.getElementById('plasma-status').style.color = "#ff4400";
    } else {
        document.getElementById('plasma-status').innerText = "Off";
        document.getElementById('plasma-status').style.color = "#888";
        
        if (plasmaMesh) plasmaMesh.material.opacity *= 0.9;
        const p = scene.getObjectByName('plasmaParticles');
        if (p) p.material.opacity *= 0.9;
    }
}

function setupUIControls() {
    const checkTF = document.getElementById('check-tf');
    const checkPF = document.getElementById('check-pf');
    const checkCS = document.getElementById('check-cs');
    const btnFire = document.getElementById('fab-fire');
    
    const updateState = () => {
        STATE.TF_ON = checkTF.checked;
        STATE.PF_ON = checkPF.checked;
        STATE.CS_ON = checkCS.checked;
        
        tfCoilsGroup.visible = STATE.TF_ON;
        pfCoilsGroup.visible = STATE.PF_ON;
        csCoilGroup.visible = STATE.CS_ON;
        
        updateFieldVisualization();
    };
    
    checkTF.addEventListener('change', updateState);
    checkPF.addEventListener('change', updateState);
    checkCS.addEventListener('change', updateState);
    
    btnFire.addEventListener('click', () => {
        // 必须所有线圈都开启才能点火
        if (STATE.TF_ON && STATE.PF_ON && STATE.CS_ON) {
            isBurning = !isBurning;
            btnFire.style.filter = isBurning ? "hue-rotate(180deg)" : "none";
        } else {
            alert("请先开启所有磁体线圈以形成闭合磁笼！\n(Need All Coils Active)");
        }
    });
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    updatePhysics();
    composer.render();
}
