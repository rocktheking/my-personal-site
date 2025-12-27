import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';

// --- 全局变量 ---
let scene, camera, renderer, composer, controls;
let plasmaGroup, fieldLinesGroup, coilsGroup;
let time = 0;

// 仿星器参数 (模拟 Wendelstein 7-X 的那种扭曲环形)
const MAJOR_RADIUS = 10;
const MINOR_RADIUS = 2.5;
const TWIST_FACTOR = 5; // 扭曲周期数

// 初始化
init();
animate();

function init() {
    // 1. 场景设置
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050510);
    scene.fog = new THREE.FogExp2(0x050510, 0.02);

    // 2. 相机
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 15, 25);

    // 3. 渲染器
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ReinhardToneMapping;
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    // 添加灯光 (为拟物材质服务)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    const blueLight = new THREE.PointLight(0x0088ff, 2, 50);
    blueLight.position.set(-10, 10, -10);
    scene.add(blueLight);

    const orangeLight = new THREE.PointLight(0xffaa00, 2, 50);
    orangeLight.position.set(10, -10, 10);
    scene.add(orangeLight);

    // 4. 后处理 (辉光效果 Bloom) - 对于展示等离子体至关重要
    const renderScene = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
    bloomPass.threshold = 0;
    bloomPass.strength = 1.5; // 辉光强度
    bloomPass.radius = 0.5;

    composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);

    // 5. 控制器
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;

    // 6. 创建对象
    createStellaratorGeometry();

    // 7. 事件监听
    window.addEventListener('resize', onWindowResize);
    setupUIControls();
}

function createStellaratorGeometry() {
    plasmaGroup = new THREE.Group();
    fieldLinesGroup = new THREE.Group();
    coilsGroup = new THREE.Group();

    scene.add(plasmaGroup);
    scene.add(fieldLinesGroup);
    scene.add(coilsGroup);

    // --- 核心曲线 (Magnetic Axis) ---
    // 使用参数方程生成一个扭曲的闭合曲线
    const curve = new THREE.Curve();
    curve.getPoint = function (t) {
        // t 范围 0-1
        const angle = t * Math.PI * 2;
        // 仿星器的核心是一个扭曲的环
        // 我们在标准圆环的基础上叠加一个垂直方向的振荡
        const R = MAJOR_RADIUS;
        const r_offset = 1.5; // 轴本身的摆动幅度
        
        // 基本环形
        let x = Math.cos(angle) * R;
        let z = Math.sin(angle) * R;
        let y = 0;

        // 添加 3D 扭曲 (模拟仿星器的非平面轴)
        // 这种扭曲是仿星器稳定等离子体的关键
        const twist = 5; // 5个周期
        const verticalOscillation = Math.sin(angle * twist) * r_offset;
        const radialOscillation = Math.cos(angle * twist) * r_offset;

        x += Math.cos(angle) * radialOscillation;
        z += Math.sin(angle) * radialOscillation;
        y += verticalOscillation;

        return new THREE.Vector3(x, y, z);
    };

    // --- A. 等离子体 (Plasma) ---
    // 使用 TubeGeometry 沿着核心曲线生成管道
    const tubeGeometry = new THREE.TubeGeometry(curve, 128, MINOR_RADIUS * 0.8, 16, true);
    
    // 等离子体材质：发光的、流动的
    const plasmaMaterial = new THREE.MeshBasicMaterial({
        color: 0xff5500,
        transparent: true,
        opacity: 0.4,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending, // 叠加混合模式产生发光感
        depthWrite: false
    });

    const plasmaMesh = new THREE.Mesh(tubeGeometry, plasmaMaterial);
    plasmaGroup.add(plasmaMesh);

    // 内部核心 (更亮)
    const coreGeometry = new THREE.TubeGeometry(curve, 128, MINOR_RADIUS * 0.4, 8, true);
    const coreMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });
    plasmaGroup.add(new THREE.Mesh(coreGeometry, coreMaterial));

    // 粒子流 (模拟带电粒子运动)
    const particleCount = 2000;
    const particleGeom = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleData = []; // Store speed, offset, angle, radius

    for(let i=0; i<particleCount; i++) {
        particleData.push({
            speed: 0.001 + Math.random() * 0.002,
            offset: Math.random(), // t (0-1)
            angle: Math.random() * Math.PI * 2, // 围绕磁轴的角度
            radius: Math.random() * MINOR_RADIUS * 0.8 // 距离磁轴的半径
        });
    }
    
    particleGeom.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
        color: 0xffff00,
        size: 0.2,
        transparent: true,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true
    });
    
    const particleSystem = new THREE.Points(particleGeom, particleMat);
    particleSystem.userData = { particleData: particleData, curve: curve };
    plasmaGroup.add(particleSystem);
    plasmaGroup.userData.particleSystem = particleSystem; // 保存引用以便动画更新

    // --- B. 磁感线 (Magnetic Field Lines) ---
    // 磁感线在仿星器中是极其复杂的，它们在环绕大环的同时，也绕着小环旋转（旋转变换）
    const linesCount = 12;
    for (let i = 0; i < linesCount; i++) {
        const linePoints = [];
        const segments = 300;
        const phaseOffset = (i / linesCount) * Math.PI * 2;
        
        for (let j = 0; j <= segments; j++) {
            const t = j / segments;
            const centerPoint = curve.getPoint(t);
            const tangent = curve.getTangent(t);
            const normal = new THREE.Vector3(0, 1, 0).applyAxisAngle(tangent, t * Math.PI * 2 * 2); // 简化的法线计算
            const binormal = new THREE.Vector3().crossVectors(tangent, normal).normalize();
            
            // 磁感线的螺旋：随着 t 增加，角度也要快速增加
            // 这里的 10 是螺旋圈数
            const spiralAngle = t * Math.PI * 2 * 10 + phaseOffset;
            
            // 扭曲截面：仿星器的截面不是圆形的，而是像豆子一样扭曲变化的
            // 这里用简单的椭圆旋转模拟
            const r = MINOR_RADIUS * 1.1; 
            
            // 计算局部坐标系下的偏移
            const cx = Math.cos(spiralAngle) * r;
            const cy = Math.sin(spiralAngle) * r;
            
            // 将偏移应用到世界坐标 (简化版 Frenet 框架)
            // 为了更稳定的框架，通常需要复杂的计算，这里用简单的近似
            const pos = centerPoint.clone()
                .add(normal.clone().multiplyScalar(cx))
                .add(binormal.clone().multiplyScalar(cy));
            
            linePoints.push(pos);
        }
        
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(linePoints);
        const lineMaterial = new THREE.LineBasicMaterial({ 
            color: 0x00d2ff, 
            transparent: true, 
            opacity: 0.5 
        });
        const line = new THREE.Line(lineGeometry, lineMaterial);
        fieldLinesGroup.add(line);
    }

    // --- C. 外部线圈 (Modular Coils) ---
    // 仿星器的线圈形状是不规则的，为了产生扭曲的磁场
    const coilCount = 20;
    
    // 线圈材质 - 铜/金属质感
    const coilMaterial = new THREE.MeshStandardMaterial({
        color: 0xb87333, // 铜色
        metalness: 0.9,
        roughness: 0.2,
    });

    for (let i = 0; i < coilCount; i++) {
        const t = i / coilCount;
        const centerPoint = curve.getPoint(t);
        const tangent = curve.getTangent(t);
        
        // 创建一个稍微大一点的环
        const coilPoints = [];
        const coilSegments = 64; // 增加分段数使圆环更平滑
        
        // 构建局部坐标系
        const up = new THREE.Vector3(0, 1, 0);
        const right = new THREE.Vector3().crossVectors(tangent, up).normalize();
        const actualUp = new THREE.Vector3().crossVectors(right, tangent).normalize();

        for (let j = 0; j < coilSegments; j++) {
            const ang = (j / coilSegments) * Math.PI * 2;
            
            // D形截面或扭曲截面模拟
            let r = MINOR_RADIUS * 1.6;
            // 加上一些基于位置的变形
            r += Math.sin(ang * 2 + t * Math.PI * 4) * 0.5;

            const xOffset = Math.cos(ang) * r;
            const yOffset = Math.sin(ang) * r;
            
            const p = centerPoint.clone()
                .add(right.clone().multiplyScalar(xOffset))
                .add(actualUp.clone().multiplyScalar(yOffset));
            
            coilPoints.push(p);
        }
        
        // 使用 CatmullRomCurve3 创建平滑闭合曲线
        const coilCurve = new THREE.CatmullRomCurve3(coilPoints);
        coilCurve.closed = true;

        // 生成管道几何体
        // TubeGeometry(path, tubularSegments, radius, radialSegments, closed)
        const coilGeo = new THREE.TubeGeometry(coilCurve, 64, 0.4, 16, true);
        const coilMesh = new THREE.Mesh(coilGeo, coilMaterial);
        
        coilsGroup.add(coilMesh);
    }
}

function updateParticles() {
    const sys = plasmaGroup.userData.particleSystem;
    if (!sys) return;

    const positions = sys.geometry.attributes.position.array;
    const { particleData, curve } = sys.userData;

    const up = new THREE.Vector3(0, 1, 0);
    const right = new THREE.Vector3();
    const actualUp = new THREE.Vector3();
    const pos = new THREE.Vector3();

    for (let i = 0; i < particleData.length; i++) {
        const p = particleData[i];

        // 1. 更新沿磁轴的位置 t
        p.offset += p.speed;
        if (p.offset > 1) p.offset -= 1;

        // 2. 更新围绕磁轴的旋转 (螺旋运动)
        p.angle += p.speed * 30; 

        // 3. 计算三维空间位置
        const t = p.offset;
        const centerPoint = curve.getPoint(t);
        const tangent = curve.getTangent(t);
        
        // 构建局部坐标系
        right.crossVectors(tangent, up).normalize();
        actualUp.crossVectors(right, tangent).normalize();
        
        // 计算螺旋位置
        const r = p.radius;
        const xOffset = Math.cos(p.angle) * r;
        const yOffset = Math.sin(p.angle) * r;

        // 叠加到中心点
        pos.copy(centerPoint)
            .addScaledVector(right, xOffset)
            .addScaledVector(actualUp, yOffset);

        positions[i*3] = pos.x; 
        positions[i*3+1] = pos.y;
        positions[i*3+2] = pos.z;
    }
    sys.geometry.attributes.position.needsUpdate = true;
}

function setupUIControls() {
    document.getElementById('toggle-plasma').addEventListener('change', (e) => {
        plasmaGroup.visible = e.target.checked;
    });
    document.getElementById('toggle-field').addEventListener('change', (e) => {
        fieldLinesGroup.visible = e.target.checked;
    });
    document.getElementById('toggle-coils').addEventListener('change', (e) => {
        coilsGroup.visible = e.target.checked;
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

    time += 0.005;

    // 1. 粒子动画
    updateParticles();

    // 2. 整体缓慢旋转展示结构
    // scene.rotation.y += 0.001;
    controls.update();

    // 3. 动态效果：磁感线脉动
    fieldLinesGroup.children.forEach((line, idx) => {
        line.material.opacity = 0.3 + Math.sin(time * 2 + idx) * 0.2;
    });

    // 4. 等离子体脉动
    if (plasmaGroup.children[0]) {
        plasmaGroup.children[0].material.opacity = 0.4 + Math.sin(time * 5) * 0.1;
    }

    // 渲染
    composer.render();
}
