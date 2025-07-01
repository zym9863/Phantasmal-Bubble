import * as THREE from 'three'

export class EnvironmentEffects {
  private scene: THREE.Scene
  private sunRays: THREE.Mesh[] = []
  private rainDrops: THREE.Mesh[] = []
  private isRaining: boolean = false
  private sunRayGeometry: THREE.PlaneGeometry
  private rainDropGeometry: THREE.SphereGeometry
  private time: number = 0

  constructor(scene: THREE.Scene) {
    this.scene = scene
    this.sunRayGeometry = new THREE.PlaneGeometry(0.1, 8)
    this.rainDropGeometry = new THREE.SphereGeometry(0.02, 8, 8)
    
    this.createSunRays()
    this.setupWeatherCycle()
  }

  private createSunRays(): void {
    const rayCount = 15
    
    for (let i = 0; i < rayCount; i++) {
      const material = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.1,
        side: THREE.DoubleSide
      })
      
      const ray = new THREE.Mesh(this.sunRayGeometry, material)
      
      // 随机位置和角度
      ray.position.set(
        (Math.random() - 0.5) * 30,
        Math.random() * 20 - 5,
        -10
      )
      
      ray.rotation.z = Math.random() * Math.PI * 2
      ray.userData = {
        originalOpacity: 0.05 + Math.random() * 0.1,
        speed: 0.001 + Math.random() * 0.002
      }
      
      this.sunRays.push(ray)
      this.scene.add(ray)
    }
  }

  private createRainDrop(): void {
    if (this.rainDrops.length > 100) return // 限制雨滴数量
    
    const material = new THREE.MeshBasicMaterial({
      color: 0x87ceeb,
      transparent: true,
      opacity: 0.6
    })
    
    const drop = new THREE.Mesh(this.rainDropGeometry, material)
    
    // 从顶部随机位置开始
    drop.position.set(
      (Math.random() - 0.5) * 40,
      15,
      (Math.random() - 0.5) * 20
    )
    
    drop.userData = {
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 0.02,
        -0.2 - Math.random() * 0.1,
        0
      )
    }
    
    this.rainDrops.push(drop)
    this.scene.add(drop)
  }

  private setupWeatherCycle(): void {
    // 每30秒切换一次天气
    setInterval(() => {
      this.isRaining = !this.isRaining
      this.transitionWeather()
    }, 30000)
  }

  private transitionWeather(): void {
    if (this.isRaining) {
      // 开始下雨 - 阳光变暗
      this.sunRays.forEach(ray => {
        const material = ray.material as THREE.MeshBasicMaterial
        material.opacity *= 0.3
      })
    } else {
      // 雨停 - 阳光变亮
      this.sunRays.forEach(ray => {
        const material = ray.material as THREE.MeshBasicMaterial
        material.opacity = ray.userData.originalOpacity
      })
      
      // 清除所有雨滴
      this.rainDrops.forEach(drop => {
        this.scene.remove(drop)
        drop.geometry.dispose()
        ;(drop.material as THREE.Material).dispose()
      })
      this.rainDrops = []
    }
  }

  public update(): void {
    this.time += 0.016

    // 更新阳光效果
    this.updateSunRays()
    
    // 更新雨滴效果
    if (this.isRaining) {
      this.updateRain()
    }
  }

  private updateSunRays(): void {
    this.sunRays.forEach((ray, index) => {
      // 轻微摇摆
      ray.rotation.z += ray.userData.speed
      
      // 透明度变化
      const material = ray.material as THREE.MeshBasicMaterial
      const baseOpacity = this.isRaining ? 
        ray.userData.originalOpacity * 0.3 : 
        ray.userData.originalOpacity
      
      material.opacity = baseOpacity + 
        Math.sin(this.time * 2 + index) * baseOpacity * 0.3
    })
  }

  private updateRain(): void {
    // 生成新雨滴
    if (Math.random() < 0.3) {
      this.createRainDrop()
    }
    
    // 更新现有雨滴
    this.rainDrops.forEach((drop, index) => {
      drop.position.add(drop.userData.velocity)
      
      // 移除落到底部的雨滴
      if (drop.position.y < -10) {
        this.scene.remove(drop)
        drop.geometry.dispose()
        ;(drop.material as THREE.Material).dispose()
        this.rainDrops.splice(index, 1)
      }
    })
  }

  public createLightning(): void {
    // 创建闪电效果
    const lightning = new THREE.Mesh(
      new THREE.PlaneGeometry(0.2, 15),
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.8
      })
    )
    
    lightning.position.set(
      (Math.random() - 0.5) * 20,
      5,
      -8
    )
    
    lightning.rotation.z = (Math.random() - 0.5) * 0.5
    
    this.scene.add(lightning)
    
    // 闪电动画
    let opacity = 0.8
    const fade = () => {
      opacity -= 0.05
      ;(lightning.material as THREE.MeshBasicMaterial).opacity = opacity
      
      if (opacity > 0) {
        requestAnimationFrame(fade)
      } else {
        this.scene.remove(lightning)
        lightning.geometry.dispose()
        ;(lightning.material as THREE.Material).dispose()
      }
    }
    
    fade()
  }

  public addWindEffect(bubbles: any[]): void {
    // 为泡沫添加风力效果
    const windStrength = this.isRaining ? 0.05 : 0.02
    const windDirection = new THREE.Vector3(
      Math.sin(this.time * 0.1) * windStrength,
      0,
      Math.cos(this.time * 0.1) * windStrength * 0.5
    )
    
    bubbles.forEach(bubble => {
      if (bubble.applyWind) {
        bubble.applyWind(windDirection)
      }
    })
  }

  public toggleRain(): void {
    this.isRaining = !this.isRaining
    this.transitionWeather()
  }

  public dispose(): void {
    // 清理阳光
    this.sunRays.forEach(ray => {
      this.scene.remove(ray)
      ray.geometry.dispose()
      ;(ray.material as THREE.Material).dispose()
    })
    
    // 清理雨滴
    this.rainDrops.forEach(drop => {
      this.scene.remove(drop)
      drop.geometry.dispose()
      ;(drop.material as THREE.Material).dispose()
    })
    
    this.sunRayGeometry.dispose()
    this.rainDropGeometry.dispose()
  }
}
