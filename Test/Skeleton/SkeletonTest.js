"use strict";
///<reference path="./../../Core/Build/FudgeCore.d.ts"/>
var SkeletonTest;
///<reference path="./../../Core/Build/FudgeCore.d.ts"/>
(function (SkeletonTest) {
    var ƒ = FudgeCore;
    window.addEventListener("load", init);
    async function init() {
        const canvas = document.querySelector("canvas");
        // setup scene
        const scene = new ƒ.Node("Scene");
        const rotatorX = new ƒ.Node("RotatorX");
        rotatorX.addComponent(new ƒ.ComponentTransform());
        const rotatorY = new ƒ.Node("RotatorY");
        rotatorY.addComponent(new ƒ.ComponentTransform());
        const zylinder = await initAnimatedZylinder();
        console.log(zylinder);
        scene.addChild(rotatorX);
        rotatorX.addChild(rotatorY);
        rotatorY.addChild(zylinder);
        // setup camera
        const camera = new ƒ.Node("Camera");
        camera.addComponent(new ƒ.ComponentCamera());
        camera.addComponent(new ƒ.ComponentTransform());
        camera.mtxLocal.translateZ(10);
        camera.mtxLocal.showTo(ƒ.Vector3.ZERO(), camera.mtxLocal.getY());
        scene.addChild(camera);
        // setup light
        const cmpLightDirectional = new ƒ.ComponentLight(new ƒ.LightDirectional(new ƒ.Color(0.5, 0.5, 0.5)));
        cmpLightDirectional.mtxPivot.rotateY(180);
        scene.addComponent(cmpLightDirectional);
        const cmpLightAmbient = new ƒ.ComponentLight(new ƒ.LightAmbient(new ƒ.Color(0.5, 0.5, 0.5)));
        scene.addComponent(cmpLightAmbient);
        // setup viewport
        const viewport = new ƒ.Viewport();
        viewport.initialize("Viewport", scene, camera.getComponent(ƒ.ComponentCamera), canvas);
        viewport.draw();
        console.log(viewport);
        // run loop
        ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, () => update(viewport, rotatorX.mtxLocal, rotatorY.mtxLocal));
        ƒ.Loop.start();
    }
    class MeshCuboidSkin extends ƒ.MeshSkin {
        constructor() {
            super();
            const meshSource = new ƒ.MeshRotation("MeshExtrusion", [
                new ƒ.Vector2(0, 2),
                new ƒ.Vector2(0.5, 2),
                new ƒ.Vector2(0.5, 0),
                new ƒ.Vector2(0.5, -2),
                new ƒ.Vector2(0, -2)
            ], 6);
            this.ƒvertices = meshSource.vertices;
            this.ƒindices = meshSource.indices;
            const iBones = [];
            const weights = [];
            for (let iVertex = 0; iVertex < this.ƒvertices.length; iVertex += 3) {
                iBones.push(0, 1, 0, 0);
                weights.push(1 - (this.ƒvertices[iVertex + 1] + 2) / 4, (this.ƒvertices[iVertex + 1] + 2) / 4, 0, 0);
            }
            this.ƒiBones = new Uint8Array(iBones);
            this.ƒweights = new Float32Array(weights);
        }
    }
    async function initAnimatedZylinder() {
        const zylinder = new ƒ.Node("AnimatedZylinder");
        const skeleton = new ƒ.Skeleton("Skeleton");
        skeleton.addChild(new ƒ.Bone("LowerBone", ƒ.Matrix4x4.TRANSLATION(ƒ.Vector3.Y(-2))));
        skeleton.bones[0].addChild(new ƒ.Bone("UpperBone", ƒ.Matrix4x4.TRANSLATION(ƒ.Vector3.Y(2))));
        //console.log(ƒ.Serializer.serialize(skeleton));
        const mesh = new MeshCuboidSkin();
        const cmpMesh = new ƒ.ComponentMesh(mesh);
        await cmpMesh.skeleton.set(skeleton);
        zylinder.addComponent(cmpMesh);
        const material = new ƒ.Material("Grey", ƒ.ShaderFlatSkin, new ƒ.CoatColored(ƒ.Color.CSS("Grey")));
        const cmpMaterial = new ƒ.ComponentMaterial(material);
        zylinder.addComponent(cmpMaterial);
        const sequence0 = new ƒ.AnimationSequence();
        sequence0.addKey(new ƒ.AnimationKey(0, -2.5));
        sequence0.addKey(new ƒ.AnimationKey(1000, -1.5));
        sequence0.addKey(new ƒ.AnimationKey(2000, -2.5));
        const sequence1 = new ƒ.AnimationSequence();
        sequence1.addKey(new ƒ.AnimationKey(0, 0));
        sequence1.addKey(new ƒ.AnimationKey(1000, 45));
        sequence1.addKey(new ƒ.AnimationKey(2000, 0));
        const animationStructure = {
            components: {
                ComponentMesh: [{ "ƒ.ComponentMesh": {
                            skeleton: {
                                bones: {
                                    0: {
                                        components: {
                                            ComponentTransform: [{ "ƒ.ComponentTransform": {
                                                        mtxLocal: {
                                                            translation: {
                                                                y: sequence0
                                                            }
                                                        }
                                                    } }]
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
                            }
                        } }]
            }
        };
        const animation = new ƒ.Animation("Animation", animationStructure);
        const cmpAnimator = new ƒ.ComponentAnimator(animation, ƒ.ANIMATION_PLAYMODE.LOOP);
        zylinder.addComponent(cmpAnimator);
        cmpAnimator.activate(true);
        return zylinder;
    }
    function update(_viewport, _mtxRotatorX, _mtxRotatorY) {
        if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_RIGHT]))
            _mtxRotatorY.rotateY(3);
        if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_UP]))
            _mtxRotatorX.rotateX(-3);
        if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_LEFT]))
            _mtxRotatorY.rotateY(-3);
        if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_DOWN]))
            _mtxRotatorX.rotateX(3);
        if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.SPACE])) {
            _mtxRotatorX.set(ƒ.Matrix4x4.IDENTITY());
            _mtxRotatorY.set(ƒ.Matrix4x4.IDENTITY());
        }
        _viewport.draw();
    }
})(SkeletonTest || (SkeletonTest = {}));
//# sourceMappingURL=SkeletonTest.js.map