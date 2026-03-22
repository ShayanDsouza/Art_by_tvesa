import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function HeroCanvas() {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Setup
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 100)
    camera.position.z = 20

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)

    // Colors matching the new palette
    const grape = new THREE.Color(0x5F578A)
    const dustGrey = new THREE.Color(0xE7DDDA)
    const evergreen = new THREE.Color(0x172C16)
    const mahogany = new THREE.Color(0x3B0C0C)

    // Create floating picture frames
    const frames = []
    const frameGroup = new THREE.Group()

    for (let i = 0; i < 8; i++) {
      const frameGeo = createFrameGeometry(
        1.2 + Math.random() * 1.5,
        1.6 + Math.random() * 2,
        0.08
      )
      const colors = [grape, evergreen, mahogany]
      const frameMat = new THREE.MeshStandardMaterial({
        color: colors[i % 3],
        metalness: 0.5,
        roughness: 0.4,
        transparent: true,
        opacity: 0.15 + Math.random() * 0.2,
      })
      const frame = new THREE.Mesh(frameGeo, frameMat)
      frame.position.set(
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 15 - 5
      )
      frame.rotation.set(
        Math.random() * Math.PI * 0.3,
        Math.random() * Math.PI * 0.3,
        Math.random() * Math.PI * 0.1
      )
      frame.userData = {
        rotSpeed: (Math.random() - 0.5) * 0.003,
        floatSpeed: 0.3 + Math.random() * 0.5,
        floatOffset: Math.random() * Math.PI * 2,
        driftX: (Math.random() - 0.5) * 0.002,
      }
      frameGroup.add(frame)
      frames.push(frame)
    }
    scene.add(frameGroup)

    // Create golden particles
    const particleCount = 200
    const particleGeo = new THREE.BufferGeometry()
    const positions = new Float32Array(particleCount * 3)
    const sizes = new Float32Array(particleCount)

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 40
      positions[i * 3 + 1] = (Math.random() - 0.5) * 30
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20 - 5
      sizes[i] = Math.random() * 3 + 1
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    particleGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1))

    const particleMat = new THREE.PointsMaterial({
      color: grape,
      size: 0.08,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    })

    const particles = new THREE.Points(particleGeo, particleMat)
    scene.add(particles)

    // Subtle brush-stroke lines
    const lineCount = 5
    for (let i = 0; i < lineCount; i++) {
      const points = []
      const startX = (Math.random() - 0.5) * 30
      const startY = (Math.random() - 0.5) * 20
      const startZ = -8 + Math.random() * 4

      for (let j = 0; j < 20; j++) {
        points.push(new THREE.Vector3(
          startX + j * 0.8 + Math.sin(j * 0.5) * 1.5,
          startY + Math.sin(j * 0.3) * 2,
          startZ
        ))
      }

      const curve = new THREE.CatmullRomCurve3(points)
      const lineGeo = new THREE.TubeGeometry(curve, 40, 0.02, 4, false)
      const lineColors = [grape, evergreen, mahogany]
      const lineMat = new THREE.MeshBasicMaterial({
        color: lineColors[i % 3],
        transparent: true,
        opacity: 0.08 + Math.random() * 0.06,
      })
      const line = new THREE.Mesh(lineGeo, lineMat)
      scene.add(line)
    }

    // Lighting
    const ambient = new THREE.AmbientLight(dustGrey, 0.8)
    scene.add(ambient)

    const spotLight = new THREE.SpotLight(grape, 1.5, 50, Math.PI / 4, 0.5)
    spotLight.position.set(10, 10, 15)
    scene.add(spotLight)

    const fillLight = new THREE.DirectionalLight(dustGrey, 0.4)
    fillLight.position.set(-5, 5, 10)
    scene.add(fillLight)

    // Mouse interaction
    let mouseX = 0
    let mouseY = 0
    const handleMouseMove = (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', handleMouseMove)

    // Animation
    let animId
    const clock = new THREE.Clock()

    const animate = () => {
      animId = requestAnimationFrame(animate)
      const elapsed = clock.getElapsedTime()

      // Animate frames
      frames.forEach((frame) => {
        const ud = frame.userData
        frame.rotation.y += ud.rotSpeed
        frame.position.y += Math.sin(elapsed * ud.floatSpeed + ud.floatOffset) * 0.003
        frame.position.x += ud.driftX
      })

      // Animate particles - gentle upward drift
      const posArray = particleGeo.attributes.position.array
      for (let i = 0; i < particleCount; i++) {
        posArray[i * 3 + 1] += 0.003
        if (posArray[i * 3 + 1] > 15) {
          posArray[i * 3 + 1] = -15
        }
      }
      particleGeo.attributes.position.needsUpdate = true

      // Camera follows mouse subtly
      camera.position.x += (mouseX * 2 - camera.position.x) * 0.02
      camera.position.y += (-mouseY * 1.5 - camera.position.y) * 0.02
      camera.lookAt(0, 0, 0)

      renderer.render(scene, camera)
    }
    animate()

    // Resize handler
    const handleResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(container.clientWidth, container.clientHeight)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', handleResize)

      // Dispose geometries/materials and remove objects from the scene
      const objectsToRemove = []
      scene.traverse((obj) => {
        if (obj.isMesh || obj.isLine || obj.isPoints) {
          if (obj.geometry && typeof obj.geometry.dispose === 'function') {
            obj.geometry.dispose()
          }
          if (obj.material) {
            if (Array.isArray(obj.material)) {
              obj.material.forEach((mat) => {
                if (mat && typeof mat.dispose === 'function') mat.dispose()
              })
            } else if (typeof obj.material.dispose === 'function') {
              obj.material.dispose()
            }
          }
          objectsToRemove.push(obj)
        }
      })
      objectsToRemove.forEach((obj) => {
        if (obj.parent) obj.parent.remove(obj)
      })

      renderer.dispose()
      container.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={containerRef} className="hero-canvas" />
}

// Creates a hollow rectangular frame shape
function createFrameGeometry(width, height, thickness) {
  const shape = new THREE.Shape()
  shape.moveTo(-width / 2, -height / 2)
  shape.lineTo(width / 2, -height / 2)
  shape.lineTo(width / 2, height / 2)
  shape.lineTo(-width / 2, height / 2)
  shape.lineTo(-width / 2, -height / 2)

  const hole = new THREE.Path()
  const inset = thickness * 3
  hole.moveTo(-width / 2 + inset, -height / 2 + inset)
  hole.lineTo(width / 2 - inset, -height / 2 + inset)
  hole.lineTo(width / 2 - inset, height / 2 - inset)
  hole.lineTo(-width / 2 + inset, height / 2 - inset)
  hole.lineTo(-width / 2 + inset, -height / 2 + inset)

  shape.holes.push(hole)

  return new THREE.ExtrudeGeometry(shape, {
    depth: thickness,
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.02,
    bevelSegments: 2,
  })
}
