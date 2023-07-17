const debounce = (func, timeout = 300) => {
  let timer;

  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, timeout);
  };
};

const lenis = new Lenis({
  duration: 0.8,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // https://www.desmos.com/calculator/brs54l4xou
  orientation: "vertical", // vertical, horizontal
  gestureOrientation: "vertical", // vertical, horizontal, both
  smoothWheel: true,
  wheelMultiplier: 1,
  smoothTouch: false,
  touchMultiplier: 2,
  infinite: false,
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

const images = [
  "./assets/quelle.png",
  "./assets/smart_chicken_flap.png",
  "./assets/concept_visualization.png",
  "./assets/nubank.png",
  "./assets/microplastic_scanner.png",
];

const watermarkWrap = document.querySelector("#watermark-wrap");
const watermarkText = document.querySelector("#watermark-text");
const wrap = document.querySelector("#wrap");
const canvas = document.querySelector("#canvas");

const resizeCanvas = (camera, renderer) => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
};

gsap.registerPlugin(ScrollTrigger);

const tlWatermark = gsap.timeline({
  scrollTrigger: {
    trigger: watermarkWrap,
    start: "top top",
    end: "+=600%",
    scrub: true,
    pin: true,
    pinSpacing: false,
  },
  defaults: { ease: "none" },
});

tlWatermark.fromTo(watermarkText, { x: "20%" }, { x: "-60%" });

const st = ScrollTrigger.create({
  trigger: wrap,
  start: "top top",
  end: "+=500%",
  pin: true,
});

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.z = 1.75;
camera.position.y = 0.3;
camera.rotation.z = 2 * Math.PI * 0.01;

const textureLoader = new THREE.TextureLoader();
images.unshift(images[images.length - 2], images[images.length - 1]);
images.splice(images.length - 2, 2);
const textures = images.map((image) => textureLoader.load(image));

const geometry = new THREE.PlaneGeometry(1, 0.75, 10, 10);

const uOffset = new THREE.Vector2(0, 0);
const items = [];
for (let i = 0; i < textures.length; i++) {
  const mesh = new THREE.Mesh(
    geometry,
    new THREE.ShaderMaterial({
      uniforms: {
        uOffset: { value: uOffset },
        uTexture: { value: textures[i] },
        uAlpha: { value: 1.0 },
      },
      vertexShader: `
        float PI = 3.141592653589793;

        uniform vec2 uOffset;

        varying vec2 vUv;


        vec3 deformationCurve(vec3 position, vec2 uv) {
          position.x = position.x - (sin(uv.y * PI) * uOffset.x);

          return position;
        }

        void main() {
          vUv = uv;

          vec3 newPosition = deformationCurve(position, uv);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1);
        }
      `,
      fragmentShader: `
        uniform vec2 uOffset;
        uniform sampler2D uTexture;
        uniform float uAlpha;

        varying vec2 vUv;


        vec3 rgbShift(sampler2D textureImage, vec2 uv, vec2 offset) {
          vec2 rg = texture2D(textureImage, uv).rg;
          float b = texture2D(textureImage, uv + offset).b;

          return vec3(rg, b);
        }

        void main() {
          vec4 texelColor = texture2D(uTexture, vUv);
          gl_FragColor = vec4(texelColor.rgb, uAlpha);
        }
      `,
    })
  );
  items.push({ mesh, index: i });
  scene.add(mesh);
}

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true,
  antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const updateMeshes = () => {
  const width = 1.1;
  const wholeWidth = items.length * width;

  items.forEach((item) => {
    item.mesh.position.x =
      ((width * item.index - st.progress * 10 + 42069 * wholeWidth) %
        wholeWidth) -
      2 * width;
    item.mesh.rotation.y = 2 * Math.PI * 0.03;
  });
};

const render = () => {
  if (st.isActive) {
    uOffset.set(st.getVelocity() * 0.00002, 0);
  } else {
    uOffset.set(0, 0);
  }

  updateMeshes();

  renderer.render(scene, camera);

  requestAnimationFrame(render);
};

requestAnimationFrame(render);

window.addEventListener("resize", () =>
  debounce(resizeCanvas(camera, renderer))
);
