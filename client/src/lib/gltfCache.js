import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

const loader = new GLTFLoader()
/** @type {Map<string, Promise<import('three/examples/jsm/loaders/GLTFLoader.js').GLTF>>} */
const cache = new Map()

export function loadGltfCached(url) {
  if (!cache.has(url)) {
    cache.set(
      url,
      new Promise((resolve, reject) => {
        loader.load(url, resolve, undefined, (err) => {
          cache.delete(url)
          reject(err)
        })
      }),
    )
  }
  return cache.get(url)
}

/** Prefetch without blocking UI */
export function prefetchGltf(url) {
  if (!url) return
  loadGltfCached(url).catch(() => {})
}
