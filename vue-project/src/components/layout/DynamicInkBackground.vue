<template>
  <div ref="container" class="fixed inset-0 z-0 pointer-events-none transition-opacity duration-1000" :class="{'opacity-60': isZenMode, 'opacity-40': !isZenMode}"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'

const container = ref<HTMLElement | null>(null)
const isZenMode = ref(document.documentElement.classList.contains('zen-mode'))

let scene: THREE.Scene
let camera: THREE.Camera
let renderer: THREE.WebGLRenderer
let material: THREE.ShaderMaterial
let mesh: THREE.Mesh
let animationId: number
let startTime: number

// Target color for smooth transition
const targetColor = new THREE.Color()
const currentColor = new THREE.Color()

// Shader Implementation based on Domain Warping for fluid/ink effect
const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = `
  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec3 uColor;
  uniform float uOpacity;
  
  varying vec2 vUv;

  // Random number generation
  float random(in vec2 _st) {
    return fract(sin(dot(_st.xy, vec2(12.9898,78.233))) * 43758.5453123);
  }

  // Noise function
  float noise(in vec2 _st) {
    vec2 i = floor(_st);
    vec2 f = fract(_st);

    // Cubic Hermite Curve
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
  }

  // Fractal Brownian Motion
  #define NUM_OCTAVES 5

  float fbm( in vec2 _st) {
    float v = 0.0;
    float a = 0.5;
    vec2 shift = vec2(100.0);
    // Rotate to reduce axial bias
    mat2 rot = mat2(cos(0.5), sin(0.5),
                    -sin(0.5), cos(0.50));
    for (int i = 0; i < NUM_OCTAVES; ++i) {
        v += a * noise(_st);
        _st = rot * _st * 2.0 + shift;
        a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 st = gl_FragCoord.xy / uResolution.xy;
    
    // Correct aspect ratio
    float aspect = uResolution.x / uResolution.y;
    st.x *= aspect;
    
    // Slow time
    float t = uTime * 0.15;

    // Domain Warping
    // q = fbm(p)
    vec2 q = vec2(0.);
    q.x = fbm( st + 0.00*t );
    q.y = fbm( st + vec2(1.0) );

    // r = fbm(p + q)
    vec2 r = vec2(0.);
    r.x = fbm( st + 1.0*q + vec2(1.7,9.2)+ 0.15*t );
    r.y = fbm( st + 1.0*q + vec2(8.3,2.8)+ 0.126*t);

    // f = fbm(p + r)
    float f = fbm(st + r);

    // Color mixing
    // Mix based on the noise value 'f'
    // We want the ink to be subtle.
    
    // Enhance contrast of the noise
    float mixer = smoothstep(0.1, 0.9, f);
    
    // Calculate final alpha
    // In Zen mode (gold), we want it more visible but still background
    // In Normal mode (black ink), we want it very subtle like watercolor paper
    float alpha = mixer * uOpacity;
    
    // Add some variation to color intensity
    vec3 color = mix(uColor * 0.5, uColor, clamp((f*f)*4.0, 0.0, 1.0));
    
    // Vignette effect to fade edges slightly
    vec2 uv = gl_FragCoord.xy / uResolution.xy;
    float vignette = 1.0 - smoothstep(0.5, 1.5, length(uv - 0.5));
    
    gl_FragColor = vec4(color, alpha * 0.8);
  }
`

const initThree = () => {
  if (!container.value) return

  const width = window.innerWidth
  const height = window.innerHeight

  scene = new THREE.Scene()
  camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
  
  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  container.value.appendChild(renderer.domElement)

  const geometry = new THREE.PlaneGeometry(2, 2)
  
  // Set initial colors
  if (isZenMode.value) {
    currentColor.set('#d4b483') // Gold
    targetColor.set('#d4b483')
  } else {
    currentColor.set('#a67c52') // Brownish ink for normal mode (softer than black)
    targetColor.set('#a67c52')
  }
  
  material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(width, height) },
      uColor: { value: currentColor },
      uOpacity: { value: isZenMode.value ? 0.25 : 0.15 } // Lower opacity for subtlety
    },
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false
  })

  mesh = new THREE.Mesh(geometry, material)
  scene.add(mesh)

  startTime = Date.now()
  animate()
}

const animate = () => {
  animationId = requestAnimationFrame(animate)
  
  const elapsedTime = (Date.now() - startTime) / 1000
  material.uniforms.uTime.value = elapsedTime
  
  // Smooth color transition
  currentColor.lerp(targetColor, 0.05)
  material.uniforms.uColor.value.copy(currentColor)
  
  renderer.render(scene, camera)
}

const onResize = () => {
  const width = window.innerWidth
  const height = window.innerHeight
  
  renderer.setSize(width, height)
  material.uniforms.uResolution.value.set(width, height)
}

// Observe Zen Mode changes
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.attributeName === 'class') {
      const isZen = document.documentElement.classList.contains('zen-mode')
      isZenMode.value = isZen
      
      if (material) {
        if (isZen) {
          targetColor.set('#d4b483') // Gold
          material.uniforms.uOpacity.value = 0.25
        } else {
          targetColor.set('#a67c52') // Ink Brown
          material.uniforms.uOpacity.value = 0.15
        }
      }
    }
  })
})

onMounted(() => {
  initThree()
  window.addEventListener('resize', onResize)
  observer.observe(document.documentElement, { attributes: true })
})

onUnmounted(() => {
  cancelAnimationFrame(animationId)
  window.removeEventListener('resize', onResize)
  observer.disconnect()
  if (renderer) {
    renderer.dispose()
    if (container.value && container.value.contains(renderer.domElement)) {
      container.value.removeChild(renderer.domElement)
    }
  }
  if (material) material.dispose()
})
</script>

<style scoped>
/* Ensure it stays behind everything */
</style>
