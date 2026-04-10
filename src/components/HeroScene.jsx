import { useRef, useMemo, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Stars, Float, MeshDistortMaterial, Text3D, Center } from '@react-three/drei'
import * as THREE from 'three'

function G0GAText() {
  const mesh = useRef()
  useFrame(({ clock }) => {
    if (!mesh.current) return
    mesh.current.rotation.y = Math.sin(clock.elapsedTime * 0.3) * 0.18
    mesh.current.rotation.x = Math.sin(clock.elapsedTime * 0.2) * 0.06
  })
  return (
    <Float speed={1.4} rotationIntensity={0.15} floatIntensity={0.5}>
      <Center ref={mesh} position={[2.0, 0, 0]}>
        <Text3D
          font="https://threejs.org/examples/fonts/optimer_bold.typeface.json"
          size={1.15}
          height={0.28}
          curveSegments={20}
          bevelEnabled
          bevelThickness={0.03}
          bevelSize={0.015}
          bevelSegments={8}
        >
          G0GA
          <MeshDistortMaterial
            color="#0a7a70"
            metalness={0.88}
            roughness={0.12}
            distort={0.06}
            speed={1.5}
            emissive="#10b981"
            emissiveIntensity={0.08}
          />
        </Text3D>
      </Center>
    </Float>
  )
}

function OrbitRing() {
  const mesh = useRef()
  useFrame(({ clock }) => {
    if (!mesh.current) return
    mesh.current.rotation.z = clock.elapsedTime * 0.08
    mesh.current.rotation.x = 0.35 + Math.sin(clock.elapsedTime * 0.15) * 0.08
  })
  return (
    <mesh ref={mesh} position={[2.0, 0, 0]}>
      <torusGeometry args={[3.0, 0.018, 16, 100]} />
      <meshBasicMaterial color="#34d399" transparent opacity={0.28} />
    </mesh>
  )
}

function OrbitRing2() {
  const mesh = useRef()
  useFrame(({ clock }) => {
    if (!mesh.current) return
    mesh.current.rotation.z = -clock.elapsedTime * 0.05
    mesh.current.rotation.y = clock.elapsedTime * 0.06
  })
  return (
    <mesh ref={mesh} position={[2.0, 0, 0]}>
      <torusGeometry args={[3.8, 0.012, 16, 100]} />
      <meshBasicMaterial color="#10b981" transparent opacity={0.14} />
    </mesh>
  )
}

function Particles() {
  const count = 2200
  const geo = useMemo(() => {
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 28
      positions[i * 3 + 1] = (Math.random() - 0.5) * 28
      positions[i * 3 + 2] = (Math.random() - 0.5) * 28
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return g
  }, [])

  const ref = useRef()
  useFrame(({ clock }) => {
    if (!ref.current) return
    ref.current.rotation.y = clock.elapsedTime * 0.025
  })
  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial size={0.035} color="#10b981" transparent opacity={0.5} sizeAttenuation />
    </points>
  )
}

function Grid() {
  const ref = useRef()
  useFrame(({ clock }) => {
    if (ref.current) ref.current.position.z = (clock.elapsedTime * 0.4) % 2
  })
  return <gridHelper ref={ref} args={[40, 40, '#10b981', '#0f0f0f']} position={[0, -4.5, 0]} />
}

export default function HeroScene() {
  return (
    <Canvas camera={{ position: [0, 0, 8], fov: 58 }} gl={{ antialias: true, alpha: true }} style={{ width: '100%', height: '100%' }}>
      <Suspense fallback={null}>
        <ambientLight intensity={0.25} />
        <pointLight position={[8, 8, 5]}   color="#10b981" intensity={5} />
        <pointLight position={[-8, -4, -8]} color="#34d399" intensity={2.5} />
        <Particles />
        <Stars radius={55} depth={45} count={1800} factor={2.5} saturation={0} fade speed={0.4} />
      </Suspense>
    </Canvas>
  )
}
