import { useEffect, useRef, useState, memo } from 'react'
import * as THREE from 'three'
import { clone as cloneSkinned } from 'three/examples/jsm/utils/SkeletonUtils.js'
import {
  characterModelUrl,
  DEFAULT_CHARACTER_ID,
  getCharacter,
  resolveClipName,
} from '../../lib/characterCatalog.js'
import { loadGltfCached } from '../../lib/gltfCache.js'

function FallbackMark({ name, size, detail }) {
  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center gap-1 bg-[#1c1c28] text-[var(--ate-gold,#FFD700)] px-1"
      style={{ fontSize: Math.max(12, size * 0.22) }}
    >
      <span className="font-display uppercase tracking-wider leading-none">{name.slice(0, 2)}</span>
      {size >= 72 && (
        <span className="font-sans text-[10px] uppercase tracking-widest text-[var(--ate-grey,#5A5A5A)] truncate max-w-full">
          {name}
        </span>
      )}
      {detail && (
        <span className="text-[8px] text-red-400 font-mono px-1 text-center leading-tight">{detail}</span>
      )}
    </div>
  )
}

function isMobileDpr() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(max-width: 768px), (pointer: coarse)').matches
}

/**
 * Vanilla Three.js GLB viewer.
 * `live={false}` → name card only (leaderboard / idle grid).
 */
function CharacterViewer({
  characterId = DEFAULT_CHARACTER_ID,
  animation = 'idle',
  size = 128,
  className = '',
  live = true,
}) {
  const char = getCharacter(characterId)
  const wrapRef = useRef(null)
  const canvasRef = useRef(null)
  const [status, setStatus] = useState(live ? 'loading' : 'idle')
  const [err, setErr] = useState('')
  const animRef = useRef(animation)
  animRef.current = animation
  const mixerRef = useRef(null)
  const clipsRef = useRef(null)
  const actionRef = useRef(null)

  // Swap animation clip without remounting the scene
  useEffect(() => {
    const mixer = mixerRef.current
    const clips = clipsRef.current
    if (!mixer || !clips) return
    const clipName = resolveClipName(animation || 'idle', clips)
    const clip = (clipName && clips[clipName]) || clips.idle || Object.values(clips)[0]
    if (!clip) return
    actionRef.current?.fadeOut(0.15)
    const next = mixer.clipAction(clip)
    next.reset().fadeIn(0.15).play()
    actionRef.current = next
  }, [animation])

  useEffect(() => {
    if (!live) return undefined

    let disposed = false
    let raf = 0
    let mixer = null
    let renderer
    let scene
    let camera
    let root = null
    let visible = true
    let pageVisible = typeof document === 'undefined' || document.visibilityState !== 'hidden'

    const canvas = canvasRef.current
    if (!canvas) {
      setStatus('error')
      setErr('no canvas')
      return undefined
    }

    const io = typeof IntersectionObserver !== 'undefined'
      ? new IntersectionObserver(
        ([entry]) => {
          visible = entry.isIntersecting
        },
        { threshold: 0.05 },
      )
      : null
    if (io && wrapRef.current) io.observe(wrapRef.current)

    const onVis = () => {
      pageVisible = document.visibilityState !== 'hidden'
    }
    document.addEventListener('visibilitychange', onVis)

    try {
      const dprCap = isMobileDpr() ? 1 : 1.5
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: !isMobileDpr(),
        alpha: false,
        powerPreference: 'default',
      })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, dprCap))
      renderer.setSize(size, size, false)
      renderer.setClearColor(0x1c1c28, 1)
      if ('outputColorSpace' in renderer) {
        renderer.outputColorSpace = THREE.SRGBColorSpace
      }

      scene = new THREE.Scene()
      camera = new THREE.PerspectiveCamera(35, 1, 0.05, 100)
      camera.position.set(0, 0.15, 2.6)
      camera.lookAt(0, 0.05, 0)

      scene.add(new THREE.AmbientLight(0xffffff, 0.85))
      const key = new THREE.DirectionalLight(0xffffff, 1.8)
      key.position.set(2.5, 4, 3)
      scene.add(key)
      const fill = new THREE.DirectionalLight(0xfff0dd, 0.55)
      fill.position.set(-2, 1.5, 2)
      scene.add(fill)
      const rim = new THREE.DirectionalLight(0xffd700, 0.35)
      rim.position.set(0, 2, -3)
      scene.add(rim)

      const url = characterModelUrl(char.id)
      loadGltfCached(url)
        .then((gltf) => {
          if (disposed) return
          root = cloneSkinned(gltf.scene)
          root.traverse((obj) => {
            obj.frustumCulled = false
          })

          root.updateMatrixWorld(true)
          const box = new THREE.Box3().setFromObject(root)
          if (!box.isEmpty()) {
            const size3 = box.getSize(new THREE.Vector3())
            const center = box.getCenter(new THREE.Vector3())
            root.position.set(-center.x, -center.y, -center.z)
            root.scale.setScalar(1.55 / Math.max(size3.y, 0.01))
            root.updateMatrixWorld(true)
            const box2 = new THREE.Box3().setFromObject(root)
            root.position.y += -box2.min.y - (box2.max.y - box2.min.y) * 0.5
            root.updateMatrixWorld(true)
          }

          scene.add(root)

          if (gltf.animations?.length) {
            mixer = new THREE.AnimationMixer(root)
            mixerRef.current = mixer
            const clips = Object.fromEntries(gltf.animations.map((c) => [c.name, c]))
            clipsRef.current = clips
            const clipName = resolveClipName(animRef.current || 'idle', clips)
            const clip = (clipName && clips[clipName]) || clips.idle || gltf.animations[0]
            if (clip) {
              actionRef.current = mixer.clipAction(clip)
              actionRef.current.play()
            }
          }
          setStatus('ready')
          setErr('')
        })
        .catch((e) => {
          if (disposed) return
          console.warn('[CharacterViewer] load failed', e)
          setStatus('error')
          setErr(String(e?.message || e || 'load failed'))
        })

      const clock = new THREE.Clock()
      const tick = () => {
        if (disposed) return
        raf = requestAnimationFrame(tick)
        if (!visible || !pageVisible) return
        mixer?.update(clock.getDelta())
        renderer.render(scene, camera)
      }
      raf = requestAnimationFrame(tick)
    } catch (e) {
      console.warn('[CharacterViewer] init failed', e)
      setStatus('error')
      setErr(String(e?.message || e))
    }

    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      document.removeEventListener('visibilitychange', onVis)
      io?.disconnect()
      mixer?.stopAllAction()
      mixerRef.current = null
      clipsRef.current = null
      actionRef.current = null
      if (root && scene) {
        scene.remove(root)
        root.traverse((obj) => {
          obj.geometry?.dispose?.()
          if (obj.material) {
            if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose?.())
            else obj.material.dispose?.()
          }
        })
      }
      renderer?.dispose()
    }
  }, [char.id, live, size])

  if (!live) {
    return (
      <div
        className={`overflow-hidden border-2 border-black ${className}`}
        style={{ width: size, height: size }}
      >
        <FallbackMark name={char.name} size={size} />
      </div>
    )
  }

  return (
    <div
      ref={wrapRef}
      className={`overflow-hidden bg-[#1c1c28] border-2 border-black relative ${className}`}
      style={{ width: size, height: size }}
    >
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
      {status === 'error' && (
        <div className="absolute inset-0">
          <FallbackMark name={char.name} size={size} detail={err} />
        </div>
      )}
    </div>
  )
}

export default memo(CharacterViewer)
