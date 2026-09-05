import { Suspense, useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations, OrbitControls, Center } from '@react-three/drei'
import { characterModelUrl, DEFAULT_CHARACTER_ID, getCharacter } from '../../lib/characterCatalog.js'

function CharacterModel({ characterId, animation = 'idle' }) {
  const id = getCharacter(characterId).id
  const url = characterModelUrl(id)
  const group = useRef()
  const { scene, animations } = useGLTF(url)
  const { actions, names } = useAnimations(animations, group)
  const cloned = useMemo(() => scene.clone(true), [scene])

  useEffect(() => {
    const want = animation || 'idle'
    const name = names.includes(want)
      ? want
      : names.includes('idle')
        ? 'idle'
        : names[0]
    if (!name || !actions[name]) return undefined
    const action = actions[name]
    action.reset().fadeIn(0.2).play()
    return () => {
      action.fadeOut(0.15)
    }
  }, [actions, names, animation])

  useFrame((_, delta) => {
    // keep mixer advancing via drei useAnimations
    void delta
  })

  return (
    <group ref={group}>
      <primitive object={cloned} />
    </group>
  )
}

function FallbackBox() {
  return (
    <mesh>
      <boxGeometry args={[0.6, 1.2, 0.4]} />
      <meshStandardMaterial color="#FFD700" />
    </mesh>
  )
}

/**
 * GLB character viewer. `animation`: idle | roast | hit | victory
 */
export default function CharacterViewer({
  characterId = DEFAULT_CHARACTER_ID,
  animation = 'idle',
  size = 128,
  className = '',
  interactive = false,
}) {
  const id = getCharacter(characterId).id

  return (
    <div
      className={`overflow-hidden bg-[#1a1a24] border-2 border-black ${className}`}
      style={{ width: size, height: size }}
    >
      <Canvas
        camera={{ position: [0, 1.1, 2.4], fov: 35 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ width: '100%', height: '100%' }}
      >
        <ambientLight intensity={0.85} />
        <directionalLight position={[3, 5, 2]} intensity={1.1} />
        <directionalLight position={[-2, 2, -1]} intensity={0.35} />
        <Suspense fallback={<FallbackBox />}>
          <Center>
            <CharacterModel characterId={id} animation={animation} />
          </Center>
        </Suspense>
        {interactive && (
          <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 1.7} />
        )}
      </Canvas>
    </div>
  )
}

// Warm default so first paint is faster
useGLTF.preload(characterModelUrl(DEFAULT_CHARACTER_ID))
