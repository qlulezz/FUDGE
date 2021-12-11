///<reference path="./../../Core/Build/FudgeCore.d.ts"/>
namespace SkeletonTest {
  import ƒ = FudgeCore;

  window.addEventListener("load", init);

  async function init(): Promise<void> {
    const canvas: HTMLCanvasElement = document.querySelector("canvas");

    // setup scene
    const scene: ƒ.Node = new ƒ.Node("Scene");

    const rotatorX: ƒ.Node = new ƒ.Node("RotatorX");
    rotatorX.addComponent(new ƒ.ComponentTransform());

    const rotatorY: ƒ.Node = new ƒ.Node("RotatorY");
    rotatorY.addComponent(new ƒ.ComponentTransform());

    const zylinder: ƒ.Node = await initAnimatedZylinder();
    console.log(zylinder);

    scene.addChild(rotatorX);
    rotatorX.addChild(rotatorY);
    rotatorY.addChild(zylinder);

    // setup camera
    const camera: ƒ.Node = new ƒ.Node("Camera");
    camera.addComponent(new ƒ.ComponentCamera());
    camera.addComponent(new ƒ.ComponentTransform());
    camera.mtxLocal.translateZ(10);
    camera.mtxLocal.showTo(ƒ.Vector3.ZERO(), camera.mtxLocal.getY());
    scene.addChild(camera);

    // setup light
    const cmpLightDirectional: ƒ.ComponentLight = new ƒ.ComponentLight(new ƒ.LightDirectional(new ƒ.Color(0.5, 0.5, 0.5)));
    cmpLightDirectional.mtxPivot.rotateY(180);
    scene.addComponent(cmpLightDirectional);

    const cmpLightAmbient: ƒ.ComponentLight = new ƒ.ComponentLight(new ƒ.LightAmbient(new ƒ.Color(0.5, 0.5, 0.5)));
    scene.addComponent(cmpLightAmbient);

    // setup viewport
    const viewport: ƒ.Viewport = new ƒ.Viewport();
    viewport.initialize("Viewport", scene, camera.getComponent(ƒ.ComponentCamera), canvas);
    viewport.draw();
    console.log(viewport);

    // run loop
    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, () => update(viewport, rotatorX.mtxLocal, rotatorY.mtxLocal));
    ƒ.Loop.start();
  }

  class MeshCuboidSkin extends ƒ.MeshSkin {
    constructor() {
      super();
      const meshSource: ƒ.Mesh = new ƒ.MeshRotation(
        "MeshExtrusion",
        [
          new ƒ.Vector2(0, 4),
          new ƒ.Vector2(1, 4),
          new ƒ.Vector2(1, 3),
          new ƒ.Vector2(1, 2),
          new ƒ.Vector2(1, 1),
          new ƒ.Vector2(1, 0),
          new ƒ.Vector2(0, 0)
        ],
        6
      );
      this.ƒvertices = meshSource.vertices;
      this.ƒindices = meshSource.indices;
      const iBones: number[] = [];
      const weights: number[] = [];
      for (let iVertex: number = 0; iVertex < this.ƒvertices.length; iVertex += 3) {
        iBones.push(0, 1, 0, 0);
        weights.push(
          1 - this.ƒvertices[iVertex + 1] / 4,
          this.ƒvertices[iVertex + 1] / 4,
          0,
          0
        );
      }
      this.ƒiBones = new Uint8Array(iBones);
      this.ƒweights = new Float32Array(weights);
    }
  }

  async function initAnimatedZylinder(): Promise<ƒ.Node> {
    const zylinder: ƒ.Node = new ƒ.Node("AnimatedZylinder");

    const skeleton: ƒ.Skeleton = new ƒ.Skeleton("Skeleton");
    skeleton.addChild(new ƒ.Bone("LowerBone", ƒ.Matrix4x4.TRANSLATION(ƒ.Vector3.Y(0))));
    skeleton.bones[0].addChild(new ƒ.Bone("UpperBone", ƒ.Matrix4x4.TRANSLATION(ƒ.Vector3.Y(1))));
    //console.log(ƒ.Serializer.serialize(skeleton));

    const mesh: ƒ.MeshSkin = new MeshCuboidSkin();
    const cmpMesh: ƒ.ComponentMesh = new ƒ.ComponentMesh(mesh);
    cmpMesh.mtxPivot.translateY(-2);
    await cmpMesh.skeleton.set(skeleton);
    cmpMesh.skeleton.addComponent(new ƒ.ComponentTransform());
    cmpMesh.skeleton.mtxLocal.scale(ƒ.Vector3.ONE(2));
    zylinder.addComponent(cmpMesh);

    const material: ƒ.Material = new ƒ.Material("Grey", ƒ.ShaderFlatSkin, new ƒ.CoatColored(ƒ.Color.CSS("Grey")));
    const cmpMaterial: ƒ.ComponentMaterial = new ƒ.ComponentMaterial(material);
    zylinder.addComponent(cmpMaterial);
    
    const sequence0: ƒ.AnimationSequence = new ƒ.AnimationSequence();
    sequence0.addKey(new ƒ.AnimationKey(0, -0.5));
    sequence0.addKey(new ƒ.AnimationKey(1000, 0.5));
    sequence0.addKey(new ƒ.AnimationKey(2000, -0.5));
    
    const sequence1: ƒ.AnimationSequence = new ƒ.AnimationSequence();
    sequence1.addKey(new ƒ.AnimationKey(0, 0));
    sequence1.addKey(new ƒ.AnimationKey(1000, 45));
    sequence1.addKey(new ƒ.AnimationKey(2000, 0));

    const animationStructure: ƒ.AnimationStructure = {
      bones: {
        0: {
          components: {
            ComponentTransform: [ { "ƒ.ComponentTransform": {
              mtxLocal: {
                translation: {
                  y: sequence0
                }
              }
            }}]
          }
        }
      },
      mtxBoneLocals: {
        1: {
          rotation: {
            z: sequence1
          }
        }
      }
    };

    const animation: ƒ.Animation = new ƒ.Animation("Animation", animationStructure);
    const cmpAnimator: ƒ.ComponentAnimator = new ƒ.ComponentAnimator(animation, ƒ.ANIMATION_PLAYMODE.LOOP);
    cmpMesh.skeleton.addComponent(cmpAnimator);
    cmpAnimator.activate(true);

    return zylinder;
  }

  function update(_viewport: ƒ.Viewport, _mtxRotatorX: ƒ.Matrix4x4, _mtxRotatorY: ƒ.Matrix4x4): void {
    if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_RIGHT])) _mtxRotatorY.rotateY(3);
    if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_UP])) _mtxRotatorX.rotateX(-3);
    if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_LEFT])) _mtxRotatorY.rotateY(-3);
    if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_DOWN])) _mtxRotatorX.rotateX(3);
    if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.SPACE])) {
      _mtxRotatorX.set(ƒ.Matrix4x4.IDENTITY());
      _mtxRotatorY.set(ƒ.Matrix4x4.IDENTITY());
    }
    _viewport.draw();
  }
}