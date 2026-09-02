import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

const canvas = document.getElementById("stadium3d");

if (!canvas) {
    console.warn("Canvas 3D introuvable.");
} else {

    const scene = new THREE.Scene();

    scene.fog = new THREE.FogExp2(0x020617, 0.018);

    const camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );

    camera.position.set(0, 4, 18);

    const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true
    });

    renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, 2)
    );

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );

    renderer.shadowMap.enabled = true;

    /* =========================
       LUMIÈRES
    ========================= */

    const ambient = new THREE.AmbientLight(
        0xffffff,
        1.5
    );

    scene.add(ambient);

    const light = new THREE.PointLight(
        0xffffff,
        180,
        100
    );

    light.position.set(0, 12, 5);

    light.castShadow = true;

    scene.add(light);

    const blueLight = new THREE.PointLight(
        0x2563eb,
        120,
        80
    );

    blueLight.position.set(-15, 4, -10);

    scene.add(blueLight);

    const purpleLight = new THREE.PointLight(
        0x7c3aed,
        120,
        80
    );

    purpleLight.position.set(15, 4, -10);

    scene.add(purpleLight);

    /* =========================
       SOL DU STADE
    ========================= */

    const fieldGeometry =
        new THREE.PlaneGeometry(45, 30);

    const fieldMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x071a12,
            roughness: 0.8,
            metalness: 0.1
        });

    const field =
        new THREE.Mesh(
            fieldGeometry,
            fieldMaterial
        );

    field.rotation.x = -Math.PI / 2;

    field.position.y = -3;

    field.receiveShadow = true;

    scene.add(field);

    /* =========================
       LIGNES DU TERRAIN
    ========================= */

    const lineMaterial =
        new THREE.LineBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.45
        });

    function createLine(points) {

        const geometry =
            new THREE.BufferGeometry()
                .setFromPoints(points);

        const line =
            new THREE.Line(
                geometry,
                lineMaterial
            );

        line.position.y = -2.96;

        scene.add(line);
    }

    createLine([
        new THREE.Vector3(-20, 0, -12),
        new THREE.Vector3(20, 0, -12),
        new THREE.Vector3(20, 0, 12),
        new THREE.Vector3(-20, 0, 12),
        new THREE.Vector3(-20, 0, -12)
    ]);

    createLine([
        new THREE.Vector3(0, 0, -12),
        new THREE.Vector3(0, 0, 12)
    ]);

    /* =========================
       BALLE 3D
    ========================= */

    const ballGroup =
        new THREE.Group();

    const ballGeometry =
        new THREE.IcosahedronGeometry(
            2.1,
            4
        );

    const ballMaterial =
        new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.35,
            metalness: 0.25
        });

    const ball =
        new THREE.Mesh(
            ballGeometry,
            ballMaterial
        );

    ball.castShadow = true;

    ballGroup.add(ball);

    ballGroup.position.set(
        0,
        1,
        5
    );

    scene.add(ballGroup);

    /* =========================
       PARTICULES
    ========================= */

    const particleCount = 900;

    const particleGeometry =
        new THREE.BufferGeometry();

    const positions =
        new Float32Array(
            particleCount * 3
        );

    for (
        let i = 0;
        i < particleCount;
        i++
    ) {

        positions[i * 3] =
            (Math.random() - 0.5) * 80;

        positions[i * 3 + 1] =
            Math.random() * 35 - 3;

        positions[i * 3 + 2] =
            (Math.random() - 0.5) * 70;
    }

    particleGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(
            positions,
            3
        )
    );

    const particleMaterial =
        new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.055,
            transparent: true,
            opacity: 0.65
        });

    const particles =
        new THREE.Points(
            particleGeometry,
            particleMaterial
        );

    scene.add(particles);

    /* =========================
       INTERACTION SOURIS
    ========================= */

    let mouseX = 0;
    let mouseY = 0;

    window.addEventListener(
        "mousemove",
        event => {

            mouseX =
                (event.clientX /
                    window.innerWidth - 0.5);

            mouseY =
                (event.clientY /
                    window.innerHeight - 0.5);
        }
    );

    /* =========================
       ANIMATION
    ========================= */

    const clock =
        new THREE.Clock();

    function animate() {

        requestAnimationFrame(
            animate
        );

        const time =
            clock.getElapsedTime();

        ball.rotation.x =
            time * 0.25;

        ball.rotation.y =
            time * 0.45;

        ballGroup.position.y =
            1 +
            Math.sin(time * 1.5) * 0.35;

        particles.rotation.y =
            time * 0.015;

        camera.position.x +=
            (
                mouseX * 2 -
                camera.position.x
            ) * 0.025;

        camera.position.y +=
            (
                4 -
                mouseY * 1.5 -
                camera.position.y
            ) * 0.025;

        camera.lookAt(
            0,
            0,
            0
        );

        renderer.render(
            scene,
            camera
        );
    }

    animate();

    /* =========================
       RESPONSIVE
    ========================= */

    window.addEventListener(
        "resize",
        () => {

            camera.aspect =
                window.innerWidth /
                window.innerHeight;

            camera.updateProjectionMatrix();

            renderer.setSize(
                window.innerWidth,
                window.innerHeight
            );
        }
    );
}
