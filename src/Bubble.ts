import * as THREE from 'three'

export class Bubble {
  private mesh: THREE.Mesh | null = null
  private geometry: THREE.SphereGeometry
  private material: THREE.MeshPhysicalMaterial
  private velocity: THREE.Vector3
  private rotationSpeed: THREE.Vector3
  private size: number
  private time: number = 0
  private floatAmplitude: number
  private floatFrequency: number
  private isHovered: boolean = false
  private originalSize: number

  constructor() {
    this.size = Math.random() * 0.8 + 0.3 // 0.3 到 1.1 的随机大小
    this.originalSize = this.size
    this.velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 0.02, // x方向微小漂移
      Math.random() * 0.03 + 0.01,  // y方向向上漂浮
      (Math.random() - 0.5) * 0.02  // z方向微小漂移
    )
    
    this.rotationSpeed = new THREE.Vector3(
      (Math.random() - 0.5) * 0.02,
      (Math.random() - 0.5) * 0.02,
      (Math.random() - 0.5) * 0.02
    )
    
    this.floatAmplitude = Math.random() * 0.3 + 0.1
    this.floatFrequency = Math.random() * 0.02 + 0.01
    
    this.createGeometry()
    this.createMaterial()
    this.createMesh()
  }

  private createGeometry(): void {
    // 创建球体几何体，稍微不规则以模拟真实泡沫
    this.geometry = new THREE.SphereGeometry(this.size, 16, 12)
    
    // 添加微小的随机变形
    const positions = this.geometry.attributes.position
    for (let i = 0; i < positions.count; i++) {
      const vertex = new THREE.Vector3()
      vertex.fromBufferAttribute(positions, i)
      
      // 添加微小的噪声
      const noise = (Math.random() - 0.5) * 0.05
      vertex.multiplyScalar(1 + noise)
      
      positions.setXYZ(i, vertex.x, vertex.y, vertex.z)
    }
    positions.needsUpdate = true
    this.geometry.computeVertexNormals()
  }

  private createMaterial(): void {
    // 创建具有彩虹光泽的材质
    this.material = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.3,
      roughness: 0.0,
      metalness: 0.0,
      clearcoat: 1.0,
      clearcoatRoughness: 0.0,
      transmission: 0.9,
      thickness: 0.5,
      ior: 1.33, // 水的折射率
      reflectivity: 0.8,
      iridescence: 1.0, // 彩虹效果
      iridescenceIOR: 1.3,
      iridescenceThicknessRange: [100, 800],
      side: THREE.DoubleSide
    })

    // 添加环境贴图以增强反射效果
    const cubeTextureLoader = new THREE.CubeTextureLoader()
    // 这里可以加载环境贴图，暂时使用程序化生成
    this.createIridescenceEffect()
  }

  private createIridescenceEffect(): void {
    // 创建彩虹色彩变化效果
    const hue = Math.random() * 360
    const color = new THREE.Color().setHSL(hue / 360, 0.7, 0.8)
    this.material.color = color
  }

  private createMesh(): void {
    this.mesh = new THREE.Mesh(this.geometry, this.material)
    this.mesh.castShadow = true
    this.mesh.receiveShadow = false
  }

  public setPosition(x: number, y: number, z: number): void {
    if (this.mesh) {
      this.mesh.position.set(x, y, z)
    }
  }

  public getPosition(): THREE.Vector3 {
    return this.mesh ? this.mesh.position.clone() : new THREE.Vector3()
  }

  public getMesh(): THREE.Mesh | null {
    return this.mesh
  }

  public setHovered(hovered: boolean): void {
    this.isHovered = hovered
  }

  public update(): void {
    if (!this.mesh) return

    this.time += 0.016 // 假设60fps

    // 基础移动
    this.mesh.position.add(this.velocity)

    // 添加浮动效果
    const floatOffset = Math.sin(this.time * this.floatFrequency) * this.floatAmplitude
    this.mesh.position.x += Math.sin(this.time * 0.5) * 0.01
    this.mesh.position.z += Math.cos(this.time * 0.3) * 0.01
    this.mesh.position.y += floatOffset * 0.01

    // 悬停效果 - 泡沫变大并发光
    if (this.isHovered) {
      const targetScale = this.originalSize * 1.2
      this.mesh.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1)
      this.material.emissive.setHSL(0.6, 0.3, 0.1) // 淡蓝色发光
    } else {
      this.mesh.scale.lerp(new THREE.Vector3(this.originalSize, this.originalSize, this.originalSize), 0.1)
      this.material.emissive.setHSL(0, 0, 0) // 无发光
    }

    // 旋转
    this.mesh.rotation.x += this.rotationSpeed.x
    this.mesh.rotation.y += this.rotationSpeed.y
    this.mesh.rotation.z += this.rotationSpeed.z

    // 更新彩虹效果
    this.updateIridescence()

    // 模拟空气阻力
    this.velocity.multiplyScalar(0.999)
  }

  private updateIridescence(): void {
    // 动态改变彩虹色彩
    const hue = (this.time * 0.5) % 360
    const saturation = 0.6 + Math.sin(this.time * 0.3) * 0.2
    const lightness = 0.7 + Math.sin(this.time * 0.4) * 0.1
    
    this.material.color.setHSL(hue / 360, saturation, lightness)
    
    // 动态改变透明度
    this.material.opacity = 0.2 + Math.sin(this.time * 0.2) * 0.1
    
    // 动态改变彩虹强度
    this.material.iridescence = 0.8 + Math.sin(this.time * 0.15) * 0.2
  }

  public dispose(): void {
    if (this.geometry) {
      this.geometry.dispose()
    }
    if (this.material) {
      this.material.dispose()
    }
    this.mesh = null
  }

  // 获取泡沫的边界球，用于碰撞检测
  public getBoundingSphere(): THREE.Sphere {
    if (this.mesh) {
      const sphere = new THREE.Sphere()
      this.mesh.geometry.computeBoundingSphere()
      sphere.copy(this.mesh.geometry.boundingSphere!)
      sphere.center.add(this.mesh.position)
      return sphere
    }
    return new THREE.Sphere()
  }

  // 检查是否与另一个泡沫碰撞
  public checkCollision(other: Bubble): boolean {
    const thisSphere = this.getBoundingSphere()
    const otherSphere = other.getBoundingSphere()
    return thisSphere.intersectsSphere(otherSphere)
  }

  // 应用风力效果
  public applyWind(windForce: THREE.Vector3): void {
    this.velocity.add(windForce.clone().multiplyScalar(0.001))
  }

  // 设置泡沫的生命周期效果
  public setLifeTime(maxLife: number): void {
    const life = this.time / maxLife
    if (life > 0.8) {
      // 接近生命周期末期时变得更透明
      this.material.opacity *= (1 - life) * 5
    }
  }
}
