namespace FudgeCore {
  /**
   * Asset loader for gl Transfer Format files.
   * @authors Matthias Roming, HFU, 2022 | Jonas Plotzky, HFU, 2023
   */
  export class GLTFLoader {

    private static loaders: { [url: string]: GLTFLoader };
    private static defaultMaterial: Material;
    private static defaultSkinMaterial: Material;

    public readonly gltf: GLTF.GlTf;
    public readonly url: string;

    #scenes: Graph[];
    #nodes: Node[];
    #cameras: ComponentCamera[];
    #animations: Animation[];
    #meshes: MeshImport[];
    #materials: Material[];
    #textures: Texture[];
    #skeletons: Skeleton[];
    #buffers: ArrayBuffer[];

    private constructor(_gltf: GLTF.GlTf, _url: string) {
      this.gltf = _gltf;
      this.url = new URL(_url, Project.baseURL).toString();
    }

    /**
     * Returns a {@link GLTFLoader} instance for the given url.
     */
    public static async LOAD(_url: string): Promise<GLTFLoader> {
      if (!this.loaders)
        this.loaders = {};
      if (!this.loaders[_url]) {
        const response: Response = await fetch(_url);
        const gltf: GLTF.GlTf = await response.json();

        gltf.nodes.forEach((_node, _iNode) => {
          _node.children?.forEach(_iChild => gltf.nodes[_iChild].parent = _iNode); // mark parent of each node
          _node.isJoint = gltf.skins?.some(_skin => _skin.joints.includes(_iNode)); // mark nodes that are joints
        });

        // mark the depth of each node
        const paths: number[][] = [];
        gltf.nodes.forEach((_node, _iNode) => {
          let iParent: number = _node.parent;
          let depth: number = 0;
          let path: number[] = [];
          while (iParent != undefined) {
            path.push(iParent);
            depth++;
            iParent = gltf.nodes[iParent].parent;
          }
          _node.depth = depth;
          paths[_iNode] = path;
        });

        // mark the skeleton root nodes of each skin
        gltf.skins?.forEach((_skin, _iSkin) => {
          if (_skin.skeleton == undefined) {
            // find the common root of all joints i.e. the skeleton
            const ancestors: Set<number> = new Set<number>(_skin.joints.flatMap(_iJoint => paths[_iJoint]));
            _skin.skeleton = Array.from(ancestors).reduce((_a, _b) => gltf.nodes[_a].depth < gltf.nodes[_b].depth ? _a : _b);
          }

          gltf.nodes[_skin.skeleton].iSkeletonRoot = _iSkin;
        });

        this.loaders[_url] = new GLTFLoader(gltf, _url);
      }
      return this.loaders[_url];
    }

    /**
     * Returns a {@link GraphInstance} for the given scene name or the default scene if no name is given.
     */
    public async getScene(_name?: string): Promise<GraphInstance> {
      const iScene: number = _name ? this.gltf.scenes.findIndex(_scene => _scene.name == _name) : this.gltf.scene;
      if (iScene == -1)
        throw new Error(`Couldn't find name ${_name} in gltf scenes.`);
      return await this.getSceneByIndex(iScene);
    }

    /**
     * Returns a {@link GraphInstance} for the given scene index or the default scene if no index is given.
     */
    public async getSceneByIndex(_iScene: number = this.gltf.scene): Promise<GraphInstance> {
      if (!this.#scenes)
        this.#scenes = [];
      if (!this.#scenes[_iScene]) {
        const gltfScene: GLTF.Scene = this.gltf.scenes[_iScene];
        const scene: Graph = new Graph(gltfScene.name);
        for (const iNode of gltfScene.nodes)
          scene.addChild(await this.getNodeByIndex(iNode));
        if (this.gltf.animations?.length > 0)
          scene.addComponent(new ComponentAnimator(await this.getAnimationByIndex(0)));
        Project.register(scene);
        this.#scenes[_iScene] = scene;
      }
      return await Project.createGraphInstance(this.#scenes[_iScene]);
    }

    /**
     * Returns the first {@link Node} with the given name.
     */
    public async getNode(_name: string): Promise<Node> {
      const iNode: number = this.gltf.nodes.findIndex(_node => _node.name == _name);
      if (iNode == -1)
        throw new Error(`Couldn't find name ${_name} in gltf nodes.`);
      return await this.getNodeByIndex(iNode);
    }

    /**
     * Returns the {@link Node} for the given index.
     */
    public async getNodeByIndex(_iNode: number): Promise<Node> {
      if (!this.#nodes)
        this.#nodes = [];
      if (!this.#nodes[_iNode]) {
        const gltfNode: GLTF.Node = this.gltf.nodes[_iNode];
        let iSkeleton: number = gltfNode.iSkeletonRoot;
        const node: Node = iSkeleton >= 0 ? new Skeleton(gltfNode.name) : new Node(gltfNode.name);

        // check for transformation
        if (gltfNode.matrix || gltfNode.rotation || gltfNode.scale || gltfNode.translation || gltfNode.isJoint) {
          if (!node.getComponent(ComponentTransform))
            node.addComponent(new ComponentTransform());
          if (gltfNode.matrix) {
            node.mtxLocal.set(Float32Array.from(gltfNode.matrix));
          } else {
            if (gltfNode.translation)
              node.mtxLocal.translate(new Vector3(...gltfNode.translation));
            if (gltfNode.rotation) {
              const rotation: Quaternion = new Quaternion();
              rotation.set(gltfNode.rotation[0], gltfNode.rotation[1], gltfNode.rotation[2], gltfNode.rotation[3]);
              node.mtxLocal.rotate(rotation.eulerAngles);
            }
            if (gltfNode.scale)
              node.mtxLocal.scale(new Vector3(...gltfNode.scale));
          }
        }

        // check for camera
        if (gltfNode.camera != undefined) {
          node.addComponent(await this.getCameraByIndex(gltfNode.camera));
        }

        // check for mesh and material
        if (gltfNode.mesh != undefined) {
          node.addComponent(new ComponentMesh(await this.getMeshByIndex(gltfNode.mesh)));

          const gltfMesh: GLTF.Mesh = this.gltf.meshes?.[gltfNode.mesh];
          if (gltfMesh.primitives.length > 1)
            Debug.warn(`Node ${gltfNode.name} has a mesh with more than one primitive attached to it. FUDGE currently only supports one primitive per mesh.`);

          const iMaterial: number = gltfMesh.primitives?.[0]?.material;
          if (iMaterial != undefined) {
            node.addComponent(new ComponentMaterial(await this.getMaterialByIndex(iMaterial, node.getComponent(ComponentMesh).mesh instanceof MeshSkin)));
          } else {
            if (node.getComponent(ComponentMesh).mesh instanceof MeshSkin) {
              if (!GLTFLoader.defaultSkinMaterial)
                GLTFLoader.defaultSkinMaterial = new Material("GLTFDefaultSkinMaterial", ShaderGouraudSkin, new CoatRemissive(Color.CSS("white")));
              node.addComponent(new ComponentMaterial(GLTFLoader.defaultSkinMaterial));
            } else {
              if (!GLTFLoader.defaultMaterial)
                GLTFLoader.defaultMaterial = new Material("GLTFDefaultMaterial", ShaderGouraud, new CoatRemissive(Color.CSS("white")));
              node.addComponent(new ComponentMaterial(GLTFLoader.defaultMaterial));
            }
          }
        }

        this.#nodes[_iNode] = node;

        // replace skeleton with skeleton instance
        if (node instanceof Skeleton) {
          let skeletonInstance: SkeletonInstance = await SkeletonInstance.CREATE(await this.getSkeletonByIndex(iSkeleton));
          // replace cached nodes from skeleton with skeleton instance bones
          this.#nodes = this.#nodes.map(_node => skeletonInstance.bones[_node.name] || _node);
          this.#nodes[_iNode] = skeletonInstance;
        }

        // check for skeleton
        if (gltfNode.skin != undefined) {
          let iNodeSkeleton: number = this.gltf.skins[gltfNode.skin].skeleton;
          node.getComponent(ComponentMesh).skeleton = <SkeletonInstance>await this.getNodeByIndex(iNodeSkeleton);
        }

        // check for children
        if (gltfNode.children)
          for (const iNode of gltfNode.children)
            node.addChild(await this.getNodeByIndex(iNode));
      }
      return this.#nodes[_iNode];
    }

    /**
     * Returns the first {@link ComponentCamera} with the given camera name.
     */
    public async getCamera(_name: string): Promise<ComponentCamera> {
      const iCamera: number = this.gltf.cameras.findIndex(_camera => _camera.name == _name);
      if (iCamera == -1)
        throw new Error(`Couldn't find name ${_name} in gltf cameras.`);
      return await this.getCameraByIndex(iCamera);
    }

    /**
     * Returns the {@link ComponentCamera} for the given camera index.
     */
    public async getCameraByIndex(_iCamera: number): Promise<ComponentCamera> {
      if (!this.#cameras)
        this.#cameras = [];
      if (!this.#cameras[_iCamera]) {
        const gltfCamera: GLTF.Camera = this.gltf.cameras[_iCamera];
        const camera: ComponentCamera = new ComponentCamera();

        if (gltfCamera.perspective)
          camera.projectCentral(
            gltfCamera.perspective.aspectRatio,
            gltfCamera.perspective.yfov * Calc.rad2deg,
            null,
            gltfCamera.perspective.znear,
            gltfCamera.perspective.zfar
          );
        else
          camera.projectOrthographic(
            -gltfCamera.orthographic.xmag,
            gltfCamera.orthographic.xmag,
            -gltfCamera.orthographic.ymag,
            gltfCamera.orthographic.ymag
          );

        return camera;
      }
      return this.#cameras[_iCamera];
    }

    /**
     * Returns the first {@link Animation} with the given animation name.
     */
    public async getAnimation(_name: string): Promise<Animation> {
      const iAnimation: number = this.gltf.animations.findIndex(_animation => _animation.name == _name);
      if (iAnimation == -1)
        throw new Error(`Couldn't find name ${_name} in gltf animations.`);
      return await this.getAnimationByIndex(iAnimation);
    }

    /**
     * Returns the {@link Animation} for the given animation index.
     */
    public async getAnimationByIndex(_iAnimation: number): Promise<Animation> {
      if (!this.#animations)
        this.#animations = [];
      if (!this.#animations[_iAnimation]) {
        const gltfAnimation: GLTF.Animation = this.gltf.animations[_iAnimation];

        // TODO: maybe refactor this to iterate over channels directly and remove this map
        const mapiNodeToGltfChannel: GLTF.AnimationChannel[][] = [];
        for (const gltfChannel of gltfAnimation.channels) {
          if (gltfChannel.target.node == undefined)
            continue;
          if (!mapiNodeToGltfChannel[gltfChannel.target.node])
            mapiNodeToGltfChannel[gltfChannel.target.node] = [];
          mapiNodeToGltfChannel[gltfChannel.target.node].push(gltfChannel);
        }

        const animationStructure: AnimationStructure = {};

        for (const iNode in mapiNodeToGltfChannel) {
          const gltfChannels: GLTF.AnimationChannel[] = mapiNodeToGltfChannel[iNode];
          const gltfNode: GLTF.Node = this.gltf.nodes[gltfChannels[0].target.node];

          const path: number[] = [];
          path.push(gltfChannels[0].target.node);
          let root: GLTF.Node = gltfNode;
          while (root.parent != undefined) { // parent of gltfNode is set when json is loaded
            path.push(root.parent);
            root = this.gltf.nodes[root.parent];
          }

          let currentStructure: AnimationStructure = animationStructure;
          for (const iPathNode of path.reverse()) {
            const pathNode: GLTF.Node = this.gltf.nodes[iPathNode];

            if (currentStructure.children == undefined)
              currentStructure.children = {};

            if (currentStructure.children[pathNode.name] == undefined)
              currentStructure.children[pathNode.name] = {};
            currentStructure = currentStructure.children[pathNode.name] as AnimationStructure;

            let iSkin: number = pathNode.iSkeletonRoot;// this.gltf.skins?.findIndex(_skin => _skin.joints[0] == iPathNode);
            if (iSkin >= 0 && this.gltf.skins[iSkin].joints.includes(gltfChannels[0].target.node)) {
              const mtxBoneLocal: AnimationStructureMatrix4x4 = {};
              for (const gltfChannel of gltfChannels)
                mtxBoneLocal[toInternTransformation[gltfChannel.target.path]] =
                  await this.getAnimationSequenceVector3(gltfAnimation.samplers[gltfChannel.sampler], gltfChannel.target.path);
              if (currentStructure.mtxBoneLocals == undefined)
                currentStructure.mtxBoneLocals = {};
              (currentStructure.mtxBoneLocals as { [boneName: string]: AnimationStructureMatrix4x4 })[gltfNode.name] = mtxBoneLocal;
              break;
            }

            if (pathNode == gltfNode) {
              const mtxLocal: AnimationStructureMatrix4x4 = {};
              for (const gltfChannel of gltfChannels)
                mtxLocal[toInternTransformation[gltfChannel.target.path]] =
                  await this.getAnimationSequenceVector3(gltfAnimation.samplers[gltfChannel.sampler], gltfChannel.target.path);
              currentStructure.components = {
                ComponentTransform: [
                  { mtxLocal: mtxLocal }
                ]
              };
            }
          }
        }

        this.#animations[_iAnimation] = new Animation(gltfAnimation.name, animationStructure);
      }
      return this.#animations[_iAnimation];
    }

    /**
     * Returns the first {@link MeshImport} with the given mesh name.
     */
    public async getMesh(_name: string): Promise<MeshImport> {
      const iMesh: number = this.gltf.meshes.findIndex(_mesh => _mesh.name == _name);
      if (iMesh == -1)
        throw new Error(`Couldn't find name ${_name} in gltf meshes.`);
      return await this.getMeshByIndex(iMesh);
    }

    /**
     * Returns the {@link MeshImport} for the given mesh index.
     */
    public async getMeshByIndex(_iMesh: number): Promise<MeshImport> {
      if (!this.#meshes)
        this.#meshes = [];
      if (!this.#meshes[_iMesh]) {
        const gltfMesh: GLTF.Mesh = this.gltf.meshes[_iMesh];
        this.#meshes[_iMesh] = await (
          gltfMesh.primitives[0].attributes.JOINTS_0 != undefined ?
            new MeshSkin() :
            new MeshImport()
        ).load(MeshLoaderGLTF, this.url, gltfMesh);
      }
      return this.#meshes[_iMesh];
    }

    /**
     * Returns the {@link Material} for the given material index.
     */
    public async getMaterialByIndex(_iMaterial: number, _skin: boolean = false): Promise<Material> {
      if (!this.#materials)
        this.#materials = [];
      if (!this.#materials[_iMaterial]) {
        // TODO: in the future create an appropriate shader based on the gltf material properties
        const gltfMaterial: GLTF.Material = this.gltf.materials[_iMaterial];
        const gltfBaseColorTexture: GLTF.TextureInfo = gltfMaterial.pbrMetallicRoughness?.baseColorTexture;

        const color: Color = new Color(...gltfMaterial.pbrMetallicRoughness.baseColorFactor || [1, 1, 1, 1]); // TODO: check if phong shader should multiply baseColorTexture values with baseColorFactor
        const coat: Coat = gltfBaseColorTexture ?
          new CoatRemissiveTextured(color, await this.getTextureByIndex(gltfBaseColorTexture.index)) :
          new CoatRemissive(color);

        const material: Material = new Material(
          gltfMaterial.name,
          gltfBaseColorTexture ?
            (_skin ? ShaderPhongTexturedSkin : ShaderPhongTextured) :
            (_skin ? ShaderPhongSkin : ShaderPhong),
          coat);

        this.#materials[_iMaterial] = material;
      }

      return this.#materials[_iMaterial];
    }

    /**
     * Returns the {@link Texture} for the given texture index.
     */
    public async getTextureByIndex(_iTexture: number): Promise<Texture> {
      if (!this.#textures)
        this.#textures = [];
      if (!this.#textures[_iTexture]) {
        const gltfTexture: GLTF.Texture = this.gltf.textures[_iTexture];
        const gltfSampler: GLTF.Sampler = this.gltf.samplers?.[gltfTexture.sampler];
        const gltfImage: GLTF.Image = this.gltf.images[gltfTexture.source];

        if (gltfSampler && (gltfSampler.wrapS != undefined || gltfSampler.wrapT != undefined))
          console.warn(`${GLTFLoader.name}: Texture ${_iTexture} in '${this.url}' has a wrapS and wrapT of '${getWebGLParameterName(gltfSampler.wrapS)}' and '${getWebGLParameterName(gltfSampler.wrapT)}' respectively. FUDGE only supports the default behavior of '${getWebGLParameterName(WebGL2RenderingContext.REPEAT)}'.`);

        let url: string = new URL(gltfImage.uri, this.url).toString();

        if (!gltfImage.uri && gltfImage.bufferView) {
          // TODO: this is duplicate code from getBufferData, maybe refactor getBufferData to handle bufferViewIndex input
          const gltfBufferView: GLTF.BufferView = this.gltf.bufferViews[gltfImage.bufferView];

          const buffer: ArrayBuffer = await this.getBuffer(gltfBufferView.buffer);
          const byteOffset: number = gltfBufferView.byteOffset || 0;
          const byteLength: number = gltfBufferView.byteLength || 0;

          url = URL.createObjectURL(new Blob(
            [new Uint8Array(buffer, byteOffset, byteLength / Uint8Array.BYTES_PER_ELEMENT)],
            { type: gltfImage.mimeType }
          ));
        }

        const texture: TextureImage = new TextureImage();
        await texture.load(url);
        if (gltfSampler && gltfSampler.magFilter == WebGL2RenderingContext.NEAREST && gltfSampler.minFilter == WebGL2RenderingContext.NEAREST)
          texture.mipmap = MIPMAP.CRISP;
        else if (gltfSampler && gltfSampler.magFilter == WebGL2RenderingContext.NEAREST && gltfSampler.minFilter == WebGL2RenderingContext.NEAREST_MIPMAP_LINEAR)
          texture.mipmap = MIPMAP.MEDIUM;
        else if (gltfSampler && gltfSampler.magFilter == WebGL2RenderingContext.LINEAR && gltfSampler.minFilter == WebGL2RenderingContext.LINEAR_MIPMAP_LINEAR)
          texture.mipmap = MIPMAP.BLURRY;
        else if (gltfSampler && gltfSampler.magFilter != undefined && gltfSampler.minFilter != undefined)
          throw new Error(`${GLTFLoader.name}: Texture ${_iTexture} in '${this.url}' has a magFilter and minFilter of '${getWebGLParameterName(gltfSampler.magFilter)}' and '${getWebGLParameterName(gltfSampler.minFilter)}' respectively. FUDGE only supports the following combinations: NEAREST and NEAREST | NEAREST and NEAREST_MIPMAP_LINEAR | LINEAR and LINEAR_MIPMAP_LINEAR.`);

        this.#textures[_iTexture] = texture;
      }

      return this.#textures[_iTexture];
    }

    /**
     * Returns the first {@link Skeleton} with the given skeleton name.
     */
    public async getSkeleton(_name: string): Promise<Skeleton> {
      const iSkeleton: number = this.gltf.skins.findIndex(_skeleton => _skeleton.name == _name);
      if (iSkeleton == -1)
        throw new Error(`Couldn't find name ${_name} in gltf skins.`);
      return await this.getSkeletonByIndex(iSkeleton);
    }

    /**
     * Returns the {@link Skeleton} for the given skeleton index.
     */
    public async getSkeletonByIndex(_iSkeleton: number): Promise<Skeleton> {
      if (!this.#skeletons)
        this.#skeletons = [];
      if (!this.#skeletons[_iSkeleton]) {
        const gltfSkin: GLTF.Skin = this.gltf.skins[_iSkeleton];
        const skeleton: Skeleton = await this.getNodeByIndex(gltfSkin.skeleton) as Skeleton;

        // convert float array to array of matrices and register bones
        const floatArray: Float32Array = await this.getFloat32Array(gltfSkin.inverseBindMatrices);
        const span: number = 16;
        for (let iFloat: number = 0, iBone: number = 0; iFloat < floatArray.length; iFloat += span, iBone++) {
          const mtxBindInverse: Matrix4x4 = new Matrix4x4();
          mtxBindInverse.set(floatArray.subarray(iFloat, iFloat + span));
          skeleton.registerBone(await this.getNodeByIndex(gltfSkin.joints[iBone]), mtxBindInverse);
        }
        Project.register(skeleton);
        this.#skeletons[_iSkeleton] = skeleton;
      }

      return this.#skeletons[_iSkeleton];
    }

    /**
     * Returns a {@link Uint8Array} for the given accessor index.
     * @internal
     */
    public async getUint8Array(_iAccessor: number): Promise<Uint8Array> {
      const array: TypedArray = await this.getBufferData(_iAccessor);
      if (this.gltf.accessors[_iAccessor]?.componentType == COMPONENT_TYPE.UNSIGNED_BYTE)
        return array as Uint8Array;
      else {
        console.warn(`Expected component type UNSIGNED_BYTE but was ${COMPONENT_TYPE[this.gltf.accessors[_iAccessor]?.componentType]}.`);
        return Uint8Array.from(array);
      }
    }

    /**
     * Returns a {@link Uint16Array} for the given accessor index.
     * @internal
     */
    public async getUint16Array(_iAccessor: number): Promise<Uint16Array> {
      const array: TypedArray = await this.getBufferData(_iAccessor);
      if (this.gltf.accessors[_iAccessor]?.componentType == COMPONENT_TYPE.UNSIGNED_SHORT)
        return array as Uint16Array;
      else {
        console.warn(`Expected component type UNSIGNED_SHORT but was ${COMPONENT_TYPE[this.gltf.accessors[_iAccessor]?.componentType]}.`);
        return Uint16Array.from(array);
      }
    }

    /**
     * Returns a {@link Uint32Array} for the given accessor index.
     * @internal
     */
    public async getUint32Array(_iAccessor: number): Promise<Uint32Array> {
      const array: TypedArray = await this.getBufferData(_iAccessor);
      if (this.gltf.accessors[_iAccessor]?.componentType == COMPONENT_TYPE.UNSIGNED_INT)
        return array as Uint32Array;
      else {
        console.warn(`Expected component type UNSIGNED_INT but was ${COMPONENT_TYPE[this.gltf.accessors[_iAccessor]?.componentType]}.`);
        return Uint32Array.from(array);
      }
    }

    /**
     * Returns a {@link Float32Array} for the given accessor index.
     * @internal
     */
    public async getFloat32Array(_iAccessor: number): Promise<Float32Array> {
      const array: TypedArray = await this.getBufferData(_iAccessor);
      if (this.gltf.accessors[_iAccessor]?.componentType == COMPONENT_TYPE.FLOAT)
        return array as Float32Array;
      else {
        console.warn(`Expected component type FLOAT but was ${COMPONENT_TYPE[this.gltf.accessors[_iAccessor]?.componentType]}.`);
        return Float32Array.from(array);
      }
    }

    private async getBufferData(_iAccessor: number): Promise<TypedArray> {
      const gltfAccessor: GLTF.Accessor = this.gltf.accessors[_iAccessor];
      if (!gltfAccessor)
        throw new Error("Couldn't find accessor");

      const gltfBufferView: GLTF.BufferView = this.gltf.bufferViews[gltfAccessor.bufferView];
      if (!gltfBufferView)
        throw new Error("Couldn't find buffer view");

      const buffer: ArrayBuffer = await this.getBuffer(gltfBufferView.buffer);;
      const byteOffset: number = gltfBufferView.byteOffset || 0;
      const byteLength: number = gltfBufferView.byteLength || 0;

      switch (gltfAccessor.componentType) {
        case COMPONENT_TYPE.UNSIGNED_BYTE:
          return new Uint8Array(buffer, byteOffset, byteLength / Uint8Array.BYTES_PER_ELEMENT);

        case COMPONENT_TYPE.BYTE:
          return new Int8Array(buffer, byteOffset, byteLength / Int8Array.BYTES_PER_ELEMENT);

        case COMPONENT_TYPE.UNSIGNED_SHORT:
          return new Uint16Array(buffer, byteOffset, byteLength / Uint16Array.BYTES_PER_ELEMENT);

        case COMPONENT_TYPE.SHORT:
          return new Int16Array(buffer, byteOffset, byteLength / Int16Array.BYTES_PER_ELEMENT);

        case COMPONENT_TYPE.UNSIGNED_INT:
          return new Uint32Array(buffer, byteOffset, byteLength / Uint32Array.BYTES_PER_ELEMENT);

        case COMPONENT_TYPE.INT:
          return new Int32Array(buffer, byteOffset, byteLength / Int32Array.BYTES_PER_ELEMENT);

        case COMPONENT_TYPE.FLOAT:
          return new Float32Array(buffer, byteOffset, byteLength / Float32Array.BYTES_PER_ELEMENT);

        default:
          throw new Error(`Unsupported component type: ${gltfAccessor.componentType}.`);
      }
    }

    private async getBuffer(_iBuffer: number): Promise<ArrayBuffer> {
      const gltfBuffer: GLTF.Buffer = this.gltf.buffers[_iBuffer];
      if (!gltfBuffer)
        throw new Error("Couldn't find buffer");

      if (!this.#buffers)
        this.#buffers = [];
      if (!this.#buffers[_iBuffer]) {
        const response: Response = await fetch(new URL(gltfBuffer.uri, this.url));
        this.#buffers[_iBuffer] = await response.arrayBuffer();
      }

      return this.#buffers[_iBuffer];
    }

    private async getAnimationSequenceVector3(_sampler: GLTF.AnimationSampler, _transformationType: GLTF.AnimationChannelTarget["path"]): Promise<AnimationStructureVector3 | AnimationStructureVector4> {
      const input: Float32Array = await this.getFloat32Array(_sampler.input);
      const output: Float32Array = await this.getFloat32Array(_sampler.output);
      const millisPerSecond: number = 1000;
      const isRotation: boolean = _transformationType == "rotation";
      const gltfInterpolation: GLTF.AnimationSampler["interpolation"] = _sampler.interpolation;

      // used only for rotation interpolation
      let lastRotation: Quaternion;
      let nextRotation: Quaternion;

      const sequences: AnimationStructureVector3 | AnimationStructureVector4 = {};
      sequences.x = new AnimationSequence();
      sequences.y = new AnimationSequence();
      sequences.z = new AnimationSequence();
      if (isRotation) {
        sequences.w = new AnimationSequence();
        lastRotation = Recycler.get(Quaternion);
        nextRotation = Recycler.get(Quaternion);
      }

      for (let iInput: number = 0; iInput < input.length; ++iInput) {
        let iOutput: number = iInput * (_transformationType == "rotation" ? 4 : 3); // output buffer either contains data for quaternion or vector3
        let time: number = millisPerSecond * input[iInput];

        if (isRotation) {
          // Take the shortest path between two rotations, i.e. if the dot product is negative then the next quaternion needs to be negated.
          // q and -q represent the same rotation but interpolation will take either the long way or the short way around the sphere depending on which we use.
          nextRotation.set(output[iOutput + 0], output[iOutput + 1], output[iOutput + 2], output[iOutput + 3]);
          if (Quaternion.DOT(lastRotation, nextRotation) < 0)
            nextRotation.negate();
          output[iOutput + 0] = nextRotation.x;
          output[iOutput + 1] = nextRotation.y;
          output[iOutput + 2] = nextRotation.z;
          output[iOutput + 3] = nextRotation.w;
          lastRotation.set(nextRotation.x, nextRotation.y, nextRotation.z, nextRotation.w);
        }

        sequences.x.addKey(new AnimationKey(time, output[iOutput + 0], toInternInterpolation[gltfInterpolation]));
        sequences.y.addKey(new AnimationKey(time, output[iOutput + 1], toInternInterpolation[gltfInterpolation]));
        sequences.z.addKey(new AnimationKey(time, output[iOutput + 2], toInternInterpolation[gltfInterpolation]));
        if (isRotation)
          (<AnimationStructureVector4>sequences).w.addKey(new AnimationKey(time, output[iOutput + 3], toInternInterpolation[gltfInterpolation]));
      }

      if (isRotation) {
        Recycler.store(lastRotation);
        Recycler.store(nextRotation);
      }

      return sequences;
    }
  }

  function getWebGLParameterName(_value: number): string {
    return Object.keys(WebGL2RenderingContext).find(_key => Reflect.get(WebGL2RenderingContext, _key) == _value);
  }

  enum COMPONENT_TYPE {
    BYTE = 5120,
    UNSIGNED_BYTE = 5121,
    SHORT = 5122,
    UNSIGNED_SHORT = 5123,
    INT = 5124,
    UNSIGNED_INT = 5125,
    FLOAT = 5126
  }

  type TypedArray = Uint8Array | Uint16Array | Uint32Array | Int8Array | Int16Array | Int32Array | Float32Array | Float64Array;

  const toInternInterpolation: { [key in GLTF.AnimationSampler["interpolation"]]: AnimationKey["interpolation"] } = {
    "LINEAR": "linear",
    "STEP": "constant",
    "CUBICSPLINE": "cubic"
  };

  const toInternTransformation: { [key in GLTF.AnimationChannelTarget["path"]]: string } = {
    "translation": "translation",
    "rotation": "rotation",
    "scale": "scaling",
    "weights": "weights"
  };
  // type TransformationType = "rotation" | "scale" | "translation";
}