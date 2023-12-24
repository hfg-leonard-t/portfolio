gsap.registerPlugin(ScrollTrigger);
let sceneInitialized = false;

const scrollTriggerElement = document.getElementsByClassName("scene-container");

ScrollTrigger.create({
  trigger: scrollTriggerElement,
  onEnter: () => {
    initializeScene();
  },
});

const initializeScene = () => {
  if (!sceneInitialized) {
    const { AmmoPhysics, PhysicsLoader } = ENABLE3D;
    const modelPaths = [
      "./assets/glb/aileronMount.glb",
      "./assets/glb/bellShield.glb",
      "./assets/glb/bikeBacklightMount.glb",
      "./assets/glb/buttonInterface.glb",
      "./assets/glb/chickenFlapSpool.glb",
      "./assets/glb/clothingHook.glb",
      "./assets/glb/headphoneHook.glb",
      "./assets/glb/irMount.glb",
      "./assets/glb/jet.glb",
      "./assets/glb/keyShelf.glb",
      "./assets/glb/leanFoot.glb",
      "./assets/glb/pullupAdapter.glb",
      "./assets/glb/remoteMount.glb",
      "./assets/glb/role.glb",
      "./assets/glb/shelf.glb",
      "./assets/glb/showerMount.glb",
      "./assets/glb/showerScrew.glb",
      "./assets/glb/spongeHolder.glb",
      // "./assets/glb/thirdHand.glb",
    ];

    const materials = [
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0,
        metalness: 0.25,
      }), // Light Blue
    ];

    const draggableObjects = [];

    const MainScene = () => {
      const sceneContainer = document.getElementById("scene-container");
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x151612);

      const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
      camera.position.set(0, 35, 35);
      camera.rotateX(-0.7);

      // Renderer
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      sceneContainer.appendChild(renderer.domElement);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      // Lights
      const shadowLight = new THREE.PointLight(0x00b381, 5, 100);
      shadowLight.position.set(0, 50, -60);
      shadowLight.castShadow = true;
      shadowLight.shadow.mapSize.width = 1024;
      shadowLight.shadow.mapSize.height = 1024;
      shadowLight.shadow.camera.near = 0.5;
      shadowLight.shadow.camera.far = 50;
      const helperRight = new THREE.PointLightHelper(shadowLight, 1);
      scene.add(helperRight);
      scene.add(shadowLight);

      scene.add(new THREE.AmbientLight(0xffffff, 1));

      // initialize physics
      const physics = new AmmoPhysics(scene);
      // physics.debug.enable(true);

      // Ground
      const groundMesh = physics.add.ground({
        width: 300,
        height: 300,
      });
      const groundColor = 0x151612;
      const groundMaterial = new THREE.MeshPhongMaterial({
        color: groundColor,
      });
      groundMesh.material = groundMaterial;
      groundMesh.receiveShadow = true;

      modelPaths.forEach((modelPath, index) => {
        // add .glb files as physics objects
        loadModelWithPhysicsAndRandomMaterial(
          modelPath,
          new THREE.Vector3(
            -50 + index * 6,
            20,
            -20 + THREE.MathUtils.randFloatSpread(-25)
          ),
          "convex",
          index
        );
      });

      const clock = new THREE.Clock();

      const animate = () => {
        physics.update(clock.getDelta() * 1000);
        physics.updateDebugger();

        renderer.render(scene, camera);

        requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);

      // Functions
      function loadModelWithPhysicsAndRandomMaterial(
        url,
        position,
        shapeType,
        index
      ) {
        new THREE.GLTFLoader().load(url, function (gltf) {
          const object = gltf.scene.children[0];
          object.position.copy(position);

          // Assign a random material to each mesh in the object
          object.traverse((child) => {
            if (child.isMesh) {
              const randomMaterial =
                materials[Math.floor(Math.random() * materials.length)];
              child.material = randomMaterial;
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });
          object.rotation.set(1 * index, -1 * index, index);

          scene.add(object);
          physics.add.existing(object, { shape: shapeType });

          draggableObjects.push(object);
        });
      }
    };
    PhysicsLoader("/lib/PhysicsLoader", () => MainScene());
  }
  sceneInitialized = true;
};
