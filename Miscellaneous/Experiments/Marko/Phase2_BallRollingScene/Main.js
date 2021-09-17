"use strict";
///<reference types="../../../../Core/Build/FudgeCore.js"/>
var f = FudgeCore;
var FudgePhysics_Communication;
(function (FudgePhysics_Communication) {
    window.addEventListener("load", init);
    const app = document.querySelector("canvas");
    let viewPort;
    let hierarchy;
    let fps;
    const times = [];
    let fpsDisplay = document.querySelector("h2#FPS");
    let bodies = new Array();
    let ballRB;
    let speedForce = 10;
    let isForce = true;
    function init(_event) {
        f.Debug.log(app);
        hierarchy = new f.Node("Scene");
        document.addEventListener("keypress", hndKey);
        document.addEventListener("keydown", hndKeyDown);
        let ground = createCompleteMeshNode("Ground", new f.Material("Ground", f.ShaderFlat, new f.CoatColored(new f.Color(0.2, 0.2, 0.2, 1))), "Cube", 0, f.BODY_TYPE.STATIC, f.COLLISION_GROUP.GROUP_1);
        let cmpGroundMesh = ground.getComponent(f.ComponentTransform);
        cmpGroundMesh.mtxLocal.scale(new f.Vector3(10, 0.3, 10));
        cmpGroundMesh.mtxLocal.translate(new f.Vector3(0, -1.5, 0));
        hierarchy.appendChild(ground);
        bodies[0] = createCompleteMeshNode("Ball", new f.Material("Ball", f.ShaderFlat, new f.CoatColored(new f.Color(0.5, 0.5, 0.5, 1))), "Sphere", 1, f.BODY_TYPE.DYNAMIC, f.COLLISION_GROUP.GROUP_2);
        let cmpCubeTransform = bodies[0].getComponent(f.ComponentTransform);
        hierarchy.appendChild(bodies[0]);
        cmpCubeTransform.mtxLocal.translate(new f.Vector3(7, 4, 0));
        ballRB = bodies[0].getComponent(f.ComponentRigidbody);
        ballRB.dampTranslation = 0.1;
        ballRB.dampRotation = 0.1;
        bodies[1] = createCompleteMeshNode("Cube_-10GradZ", new f.Material("Cube", f.ShaderFlat, new f.CoatColored(new f.Color(1, 1, 0, 1))), "Cube", 1, f.BODY_TYPE.STATIC, f.COLLISION_GROUP.GROUP_1);
        hierarchy.appendChild(bodies[1]);
        bodies[1].mtxLocal.translate(new f.Vector3(-7, -1.5, 0));
        bodies[1].mtxLocal.scale(new f.Vector3(10, 0.3, 10));
        bodies[1].mtxLocal.rotateZ(-10, true);
        bodies[2] = createCompleteMeshNode("Cube_-20GradZ", new f.Material("Cube", f.ShaderFlat, new f.CoatColored(new f.Color(1, 1, 0, 1))), "Cube", 1, f.BODY_TYPE.STATIC, f.COLLISION_GROUP.GROUP_1);
        hierarchy.appendChild(bodies[2]);
        bodies[2].mtxLocal.translate(new f.Vector3(8, -1, 0));
        bodies[2].mtxLocal.scale(new f.Vector3(10, 0.1, 10));
        bodies[2].mtxLocal.rotateZ(20, true);
        bodies[4] = createCompleteMeshNode("Cube_15,0,10Grad", new f.Material("Cube", f.ShaderFlat, new f.CoatColored(new f.Color(1, 1, 0, 1))), "Cube", 1, f.BODY_TYPE.STATIC, f.COLLISION_GROUP.GROUP_1);
        bodies[4].mtxLocal.translate(new f.Vector3(0, -1.3, -9.5));
        bodies[4].mtxLocal.scale(new f.Vector3(10, 0.3, 10));
        bodies[4].mtxLocal.rotate(new f.Vector3(15, 0, 10), true);
        hierarchy.appendChild(bodies[4]);
        bodies[3] = createCompleteMeshNode("ResetTrigger", new f.Material("Cube", f.ShaderFlat, new f.CoatColored(new f.Color(1, 1, 0, 1))), "Cube", 1, f.BODY_TYPE.STATIC, f.COLLISION_GROUP.DEFAULT);
        bodies[3].removeComponent(bodies[3].getComponent(f.ComponentMesh));
        hierarchy.appendChild(bodies[3]);
        bodies[3].mtxLocal.translate(new f.Vector3(0, -3, 0));
        bodies[3].mtxLocal.scale(new f.Vector3(40, 0.3, 40));
        bodies[3].getComponent(f.ComponentRigidbody).isTrigger = true;
        bodies[3].getComponent(f.ComponentRigidbody).addEventListener("TriggerEnteredCollision" /* TRIGGER_ENTER */, resetBall);
        let cmpLight = new f.ComponentLight(new f.LightDirectional(f.Color.CSS("WHITE")));
        cmpLight.mtxPivot.lookAt(new f.Vector3(0.5, -1, -0.8));
        hierarchy.addComponent(cmpLight);
        let cmpCamera = new f.ComponentCamera();
        cmpCamera.clrBackground = f.Color.CSS("GREY");
        cmpCamera.mtxPivot.translate(new f.Vector3(2, 4, 25));
        cmpCamera.mtxPivot.lookAt(f.Vector3.ZERO());
        viewPort = new f.Viewport();
        viewPort.initialize("Viewport", hierarchy, cmpCamera, app);
        viewPort.showSceneGraph();
        f.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        f.Physics.adjustTransforms(hierarchy);
        f.Loop.start();
    }
    function update() {
        f.Physics.world.simulate();
        viewPort.draw();
        measureFPS();
    }
    function resetBall(_event) {
        if (_event.cmpRigidbody.getContainer().name == "Ball") {
            ballRB.setPosition(new f.Vector3(0, 5, 0));
        }
    }
    function measureFPS() {
        window.requestAnimationFrame(() => {
            const now = performance.now();
            while (times.length > 0 && times[0] <= now - 1000) {
                times.shift();
            }
            times.push(now);
            fps = times.length;
            fpsDisplay.textContent = "FPS: " + fps.toString();
        });
    }
    function createCompleteMeshNode(_name, _material, _mesh, _mass, _physicsType, _group = f.COLLISION_GROUP.DEFAULT) {
        let node = new f.Node(_name);
        let mesh;
        let meshType;
        if (_mesh == "Cube") {
            mesh = new f.MeshCube();
            meshType = f.COLLIDER_TYPE.CUBE;
        }
        if (_mesh == "Sphere") {
            mesh = new f.MeshSphere(undefined, 8, 8);
            meshType = f.COLLIDER_TYPE.SPHERE;
        }
        let cmpMesh = new f.ComponentMesh(mesh);
        let cmpMaterial = new f.ComponentMaterial(_material);
        let cmpTransform = new f.ComponentTransform();
        let cmpRigidbody = new f.ComponentRigidbody(_mass, _physicsType, meshType, _group);
        cmpRigidbody.restitution = 0.2;
        cmpRigidbody.friction = 0.8;
        node.addComponent(cmpMesh);
        node.addComponent(cmpMaterial);
        node.addComponent(cmpTransform);
        node.addComponent(cmpRigidbody);
        return node;
    }
    function hndKey(_event) {
        let horizontal = 0;
        let vertical = 0;
        if (_event.code == f.KEYBOARD_CODE.A) {
            //Steer Left
            horizontal -= 1;
        }
        else if (_event.code == f.KEYBOARD_CODE.D) {
            //Steer Right
            horizontal += 1;
        }
        if (_event.code == f.KEYBOARD_CODE.W) {
            //Forward
            vertical -= 1;
        }
        else if (_event.code == f.KEYBOARD_CODE.S) {
            //Backward
            vertical += 1;
        }
        if (isForce)
            ballRB.applyForce(new f.Vector3(horizontal * speedForce, 0, vertical * speedForce));
        else {
            ballRB.applyImpulseAtPoint(new f.Vector3(horizontal * speedForce, 0, vertical * speedForce));
        }
    }
    function hndKeyDown(_event) {
        //toggle between force applied and impulse applied
        if (_event.code == f.KEYBOARD_CODE.T) {
            isForce = !isForce;
        }
    }
})(FudgePhysics_Communication || (FudgePhysics_Communication = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIk1haW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLDJEQUEyRDtBQUMzRCxJQUFPLENBQUMsR0FBRyxTQUFTLENBQUM7QUFFckIsSUFBVSwwQkFBMEIsQ0F5S25DO0FBektELFdBQVUsMEJBQTBCO0lBRWhDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDdEMsTUFBTSxHQUFHLEdBQXNCLFFBQVEsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDaEUsSUFBSSxRQUFvQixDQUFDO0lBQ3pCLElBQUksU0FBaUIsQ0FBQztJQUN0QixJQUFJLEdBQVcsQ0FBQztJQUNoQixNQUFNLEtBQUssR0FBYSxFQUFFLENBQUM7SUFDM0IsSUFBSSxVQUFVLEdBQWdCLFFBQVEsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7SUFFL0QsSUFBSSxNQUFNLEdBQWEsSUFBSSxLQUFLLEVBQUUsQ0FBQztJQUNuQyxJQUFJLE1BQTRCLENBQUM7SUFDakMsSUFBSSxVQUFVLEdBQVcsRUFBRSxDQUFDO0lBRTVCLElBQUksT0FBTyxHQUFZLElBQUksQ0FBQztJQUc1QixTQUFTLElBQUksQ0FBQyxNQUFhO1FBQ3ZCLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2pCLFNBQVMsR0FBRyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFFaEMsUUFBUSxDQUFDLGdCQUFnQixDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUM5QyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQ2pELElBQUksTUFBTSxHQUFXLHNCQUFzQixDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxVQUFVLEVB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QUNyRCxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUV0QyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsc0JBQXNCLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDaE0sU0FBUyxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNqQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdEQsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNyRCxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFFckMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLHNCQUFzQixDQUFDLGtCQUFrQixFQUFFLElBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDbk0sTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDM0QsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNyRCxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUMxRCxTQUFTLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRWpDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxzQkFBc0IsQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUMvTCxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMs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LE1BQU0sQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDLEVBQUU7WUFDekMsVUFBVTtZQUNWLFFBQVEsSUFBSSxDQUFDLENBQUM7U0FDakI7UUFDRCxJQUFJLE9BQU87WUFDUCxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFVLEdBQUcsVUFBVSxFQUFFLENBQUMsRUFBRSxRQUFRLEdBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQzthQUNuRjtZQUNELE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBVSxHQUFHLFVBQVUsRUFBRSxDQUFDLEVBQUUsUUFBUSxHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUM7U0FDaEc7SUFDTCxDQUFDO0lBRUQsU0FBUyxVQUFVLENBQUMsTUFBcUI7UUFDckMsa0RBQWtEO1FBQ2xELElBQUksTUFBTSxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUMsRUFBRTtZQUNsQyxPQUFPLEdBQUcsQ0FBQyxPQUFPLENBQUM7U0FDdEI7SUFDTCxDQUFDO0FBQ0wsQ0FBQyxFQXpLUywwQkFBMEIsS0FBMUIsMEJBQTBCLFFBeUtuQyIsInNvdXJjZXNDb250ZW50IjpbIi8vLzxyZWZlcmVuY2UgdHlwZXM9XCIuLi8uLi8uLi8uLi9Db3JlL0J1aWxkL0Z1ZGdlQ29yZS5qc1wiLz5cclxuaW1wb3J0IGYgPSBGdWRnZUNvcmU7XHJcblxyXG5uYW1lc3BhY2UgRnVkZ2VQaHlzaWNzX0NvbW11bmljYXRpb24ge1xyXG5cclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLCBpbml0KTtcclxuICAgIGNvbnN0IGFwcDogSFRNTENhbnZhc0VsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiY2FudmFzXCIpO1xyXG4gICAgbGV0IHZpZXdQb3J0OiBmLlZpZXdwb3J0O1xyXG4gICAgbGV0IGhpZXJhcmNoeTogZi5Ob2RlO1xyXG4gICAgbGV0IGZwczogbnVtYmVyO1xyXG4gICAgY29uc3QgdGltZXM6IG51bWJlcltdID0gW107XHJcbiAgICBsZXQgZnBzRGlzcGxheTogSFRNTEVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiaDIjRlBTXCIpO1xyXG5cclxuICAgIGxldCBib2RpZXM6IGYuTm9kZVtdID0gbmV3IEFycmF5KCk7XHJcbiAgICBsZXQgYmFsbFJCOiBmLkNvbXBvbmVudFJpZ2lkYm9keTtcclxuICAgIGxldCBzcGVlZEZvcmNlOiBudW1iZXIgPSAxMDtcclxuXHJcbiAgICBsZXQgaXNGb3JjZTogYm9vbGVhbiA9IHRydWU7XHJcblxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXQoX2V2ZW50OiBFdmVudCk6IHZvaWQge1xyXG4gICAgICAgIGYuRGVidWcubG9nKGFwcCk7XHJcbiAgICAgICAgaGllcmFyY2h5ID0gbmV3IGYuTm9kZShcIlNjZW5lXCIpO1xyXG5cclxuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5cHJlc3NcIiwgaG5kS2V5KTtcclxuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCBobmRLZXlEb3duKTtcclxuICAgICAgICBsZXQgZ3JvdW5kOiBmLk5vZGUgPSBjcmVhdGVDb21wbGV0ZU1lc2hOb2RlKFwiR3JvdW5kXCIsIG5ldyBmLk1hdGVyaWFsKFwiR3JvdW5kXCIsIGYuU2hhZGVyRmxhdCwgbmV3IGYuQ29hdENvbG9yZWQobmV3IGYuQ29sb3IoMC4yLCAwLjIsIDAuMiwgMSkpKSwgXCJDdWJlXCIsIDAsIGYuQk9EWV9UWVBFLlNUQVRJQywgZi5DT0xMSVNJT05fR1JPVVAuR1JPVVBfMSk7XHJcbiAgICAgICAgbGV0IGNtcEdyb3VuZE1lc2g6IGYuQ29tcG9uZW50VHJhbnNmb3JtID0gZ3JvdW5kLmdldENvbXBvbmVudChmLkNvbXBvbmVudFRyYW5zZm9ybSk7XHJcbiAgICAgICAgY21wR3JvdW5kTWVzaC5tdHhMb2NhbC5zY2FsZShuZXcgZi5WZWN0b3IzKDEwLCAwLjMsIDEwKSk7XHJcblxyXG4gICAgICAgIGNtcEdyb3VuZE1lc2gubXR4TG9jYWwudHJhbnNsYXRlKG5ldyBmLlZlY3RvcjMoMCwgLTEuNSwgMCkpO1xyXG4gICAgICAgIGhpZXJhcmNoeS5hcHBlbmRDaGlsZChncm91bmQpO1xyXG5cclxuICAgICAgICBib2RpZXNbMF0gPSBjcmVhdGVDb21wbGV0ZU1lc2hOb2RlKFwiQmFsbFwiLCBuZXcgZi5NYXRlcmlhbChcIkJhbGxcIiwgZi5TaGFkZXJGbGF0LCBuZXcgZi5Db2F0Q29sb3JlZChuZXcgZi5Db2xvcigwLjUsIDAuNSwgMC41LCAxKSkpLCBcIlNwaGVyZVwiLCAxLCBmLkJPRFlfVFlQRS5EWU5BTUlDLCBmLkNPTExJU0lPTl9HUk9VUC5HUk9VUF8yKTtcclxuICAgICAgICBsZXQgY21wQ3ViZVRyYW5zZm9ybTogZi5Db21wb25lbnRUcmFuc2Zvcm0gPSBib2RpZXNbMF0uZ2V0Q29tcG9uZW50KGYuQ29tcG9uZW50VHJhbnNmb3JtKTtcclxuICAgICAgICBoaWVyYXJjaHkuYXBwZW5kQ2hpbGQoYm9kaWVzWzBdKTtcclxuICAgICAgICBjbXBDdWJlVHJhbnNmb3JtLm10eExvY2FsLnRyYW5zbGF0ZShuZXcgZi5WZWN0b3IzKDcsIDQsIDApKTtcclxuICAgICAgICBiYWxsUkIgPSBib2RpZXNbMF0uZ2V0Q29tcG9uZW50KGYuQ29tcG9uZW50UmlnaWRib2R5KTtcclxuICAgICAgICBiYWxsUkIuZGFtcFRyYW5zbGF0aW9uID0gMC4xO1xyXG4gICAgICAgIGJhbGxSQi5kYW1wUm90YXRpb24gPSAwLjE7XHJcblxyXG4gICAgICAgIGJvZGllc1sxXSA9IGNyZWF0ZUNvbXBsZXRlTWVzaE5vZGUoXCJDdWJlXy0xMEdyYWRaXCIsIG5ldyBmLk1hdGVyaWFsKFwiQ3ViZVwiLCBmLlNoYWRlckZsYXQsIG5ldyBmLkNvYXRDb2xvcmVkKG5ldyBmLkNvbG9yKDEsIDEsIDAsIDEpKSksIFwiQ3ViZVwiLCAxLCBmLkJPRFlfVFlQRS5TVEFUSUMsIGYuQ09MTElTSU9OX0dST1VQLkdST1VQXzEpO1xyXG4gICAgICAgIGhpZXJhcmNoeS5hcHBlbmRDaGlsZChib2RpZXNbMV0pO1xyXG4gICAgICAgIGJvZGllc1sxXS5tdHhMb2NhbC50cmFuc2xhdGUobmV3IGYuVmVjdG9yMygtNywgLTEuNSwgMCkpO1xyXG4gICAgICAgIGJvZGllc1sxXS5tdHhMb2NhbC5zY2FsZShuZXcgZi5WZWN0b3IzKDEwLCAwLjMsIDEwKSk7XHJcbiAgICAgICAgYm9kaWVzWzFdLm10eExvY2FsLnJvdGF0ZVooLTEwLCB0cnVlKTtcclxuXHJcbiAgICAgICAgYm9kaWVzWzJdID0gY3JlYXRlQ29tcGxldGVNZXNoTm9kZShcIkN1YmVfLTIwR3JhZFpcIiwgbmV3IGYuTWF0ZXJpYWwoXCJDdWJlXCIsIGYuU2hhZGVyRmxhdCwgbmV3IGYuQ29hdENvbG9yZWQobmV3IGYuQ29sb3IoMSwgMSwgMCwgMSkpKSwgXCJDdWJlXCIsIDEsIGYuQk9EWV9UWVBFLlNUQVRJQywgZi5DT0xMSVNJT05fR1JPVVAuR1JPVVBfMSk7XHJcbiAgICAgICAgaGllcmFyY2h5LmFwcGVuZENoaWxkKGJvZGllc1syXSk7XHJcbiAgICAgICAgYm9kaWVzWzJdLm10eExvY2FsLnRyYW5zbGF0ZShuZXcgZi5WZWN0b3IzKDgsIC0xLCAwKSk7XHJcbiAgICAgICAgYm9kaWVzWzJdLm10eExvY2FsLnNjYWxlKG5ldyBmLlZlY3RvcjMoMTAsIDAuMSwgMTApKTtcclxuICAgICAgICBib2RpZXNbMl0ubXR4TG9jYWwucm90YXRlWigyMCwgdHJ1ZSk7XHJcblxyXG4gICAgICAgIGJvZGllc1s0XSA9IGNyZWF0ZUNvbXBsZXRlTWVzaE5vZGUoXCJDdWJlXzE1LDAsMTBHcmFkXCIsIG5ldyBmLk1hdGVyaWFsKFwiQ3ViZVwiLCBmLlNoYWRlckZsYXQsIG5ldyBmLkNvYXRDb2xvcmVkKG5ldyBmLkNvbG9yKDEsIDEsIDAsIDEpKSksIFwiQ3ViZVwiLCAxLCBmLkJPRFlfVFlQRS5TVEFUSUMsIGYuQ09MTElTSU9OX0dST1VQLkdST1VQXzEpO1xyXG4gICAgICAgIGJvZGllc1s0XS5tdHhMb2NhbC50cmFuc2xhdGUobmV3IGYuVmVjdG9yMygwLCAtMS4zLCAtOS41KSk7XHJcbiAgICAgICAgYm9kaWVzWzRdLm10eExvY2FsLnNjYWxlKG5ldyBmLlZlY3RvcjMoMTAsIDAuMywgMTApKTtcclxuICAgICAgICBib2RpZXNbNF0ubXR4TG9jYWwucm90YXRlKG5ldyBmLlZlY3RvcjMoMTUsIDAsIDEwKSwgdHJ1ZSk7XHJcbiAgICAgICAgaGllcmFyY2h5LmFwcGVuZENoaWxkKGJvZGllc1s0XSk7XHJcblxyXG4gICAgICAgIGJvZGllc1szXSA9IGNyZWF0ZUNvbXBsZXRlTWVzaE5vZGUoXCJSZXNldFRyaWdnZXJcIiwgbmV3IGYuTWF0ZXJpYWwoXCJDdWJlXCIsIGYuU2hhZGVyRmxhdCwgbmV3IGYuQ29hdENvbG9yZWQobmV3IGYuQ29sb3IoMSwgMSwgMCwgMSkpKSwgXCJDdWJlXCIsIDEsIGYuQk9EWV9UWVBFLlNUQVRJQywgZi5DT0xMSVNJT05fR1JPVVAuREVGQVVMVCk7XHJcbiAgICAgICAgYm9kaWVzWzNdLnJlbW92ZUNvbXBvbmVudChib2RpZXNbM10uZ2V0Q29tcG9uZW50KGYuQ29tcG9uZW50TWVzaCkpO1xyXG4gICAgICAgIGhpZXJhcmNoeS5hcHBlbmRDaGlsZChib2RpZXNbM10pO1xyXG4gICAgICAgIGJvZGllc1szXS5tdHhMb2NhbC50cmFuc2xhdGUobmV3IGYuVmVjdG9yMygwLCAtMywgMCkpO1xyXG4gICAgICAgIGJvZGllc1szXS5tdHhMb2NhbC5zY2FsZShuZXcgZi5WZWN0b3IzKDQwLCAwLjMsIDQwKSk7XHJcbiAgICAgICAgYm9kaWVzWzNdLmdldENvbXBvbmVudChmLkNvbXBvbmVudFJpZ2lkYm9keSkuaXNUcmlnZ2VyID0gdHJ1ZTtcclxuICAgICAgICBib2RpZXNbM10uZ2V0Q29tcG9uZW50KGYuQ29tcG9uZW50UmlnaWRib2R5KS5hZGRFdmVudExpc3RlbmVyKGYuRVZFTlRfUEhZU0lDUy5UUklHR0VSX0VOVEVSLCByZXNldEJhbGwpO1xyXG5cclxuICAgICAgICBsZXQgY21wTGlnaHQ6IGYuQ29tcG9uZW50TGlnaHQgPSBuZXcgZi5Db21wb25lbnRMaWdodChuZXcgZi5MaWdodERpcmVjdGlvbmFsKGYuQ29sb3IuQ1NTKFwiV0hJVEVcIikpKTtcclxuICAgICAgICBjbXBMaWdodC5tdHhQaXZvdC5sb29rQXQobmV3IGYuVmVjdG9yMygwLjUsIC0xLCAtMC44KSk7XHJcbiAgICAgICAgaGllcmFyY2h5LmFkZENvbXBvbmVudChjbXBMaWdodCk7XHJcblxyXG4gICAgICAgIGxldCBjbXBDYW1lcmE6IGYuQ29tcG9uZW50Q2FtZXJhID0gbmV3IGYuQ29tcG9uZW50Q2FtZXJhKCk7XHJcbiAgICAgICAgY21wQ2FtZXJhLmNsckJhY2tncm91bmQgPSBmLkNvbG9yLkNTUyhcIkdSRVlcIik7XHJcbiAgICAgICAgY21wQ2FtZXJhLm10eFBpdm90LnRyYW5zbGF0ZShuZXcgZi5WZWN0b3IzKDIsIDQsIDI1KSk7XHJcbiAgICAgICAgY21wQ2FtZXJhLm10eFBpdm90Lmxvb2tBdChmLlZlY3RvcjMuWkVSTygpKTtcclxuXHJcblxyXG4gICAgICAgIHZpZXdQb3J0ID0gbmV3IGYuVmlld3BvcnQoKTtcclxuICAgICAgICB2aWV3UG9ydC5pbml0aWFsaXplKFwiVmlld3BvcnRcIiwgaGllcmFyY2h5LCBjbXBDYW1lcmEsIGFwcCk7XHJcblxyXG4gICAgICAgIHZpZXdQb3J0LnNob3dTY2VuZUdyYXBoKCk7XHJcbiAgICAgICAgZi5Mb29wLmFkZEV2ZW50TGlzdGVuZXIoZi5FVkVOVC5MT09QX0ZSQU1FLCB1cGRhdGUpO1xyXG4gICAgICAgIGYuUGh5c2ljcy5hZGp1c3RUcmFuc2Zvcm1zKGhpZXJhcmNoeSk7XHJcbiAgICAgICAgZi5Mb29wLnN0YXJ0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gdXBkYXRlKCk6IHZvaWQge1xyXG4gICAgICAgIGYuUGh5c2ljcy53b3JsZC5zaW11bGF0ZSgpO1xyXG4gICAgICAgIHZpZXdQb3J0LmRyYXcoKTtcclxuICAgICAgICBtZWFzdXJlRlBTKCk7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIGZ1bmN0aW9uIHJlc2V0QmFsbChfZXZlbnQ6IGYuRXZlbnRQaHlzaWNzKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKF9ldmVudC5jbXBSaWdpZGJvZHkuZ2V0Q29udGFpbmVyKCkubmFtZSA9PSBcIkJhbGxcIikge1xyXG4gICAgICAgICAgICBiYWxsUkIuc2V0UG9zaXRpb24obmV3IGYuVmVjdG9yMygwLCA1LCAwKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIG1lYXN1cmVGUFMoKTogdm9pZCB7XHJcbiAgICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IG5vdzogbnVtYmVyID0gcGVyZm9ybWFuY2Uubm93KCk7XHJcbiAgICAgICAgICAgIHdoaWxlICh0aW1lcy5sZW5ndGggPiAwICYmIHRpbWVzWzBdIDw9IG5vdyAtIDEwMDApIHtcclxuICAgICAgICAgICAgICAgIHRpbWVzLnNoaWZ0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGltZXMucHVzaChub3cpO1xyXG4gICAgICAgICAgICBmcHMgPSB0aW1lcy5sZW5ndGg7XHJcbiAgICAgICAgICAgIGZwc0Rpc3BsYXkudGV4dENvbnRlbnQgPSBcIkZQUzogXCIgKyBmcHMudG9TdHJpbmcoKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBjcmVhdGVDb21wbGV0ZU1lc2hOb2RlKF9uYW1lOiBzdHJpbmcsIF9tYXRlcmlhbDogZi5NYXRlcmlhbCwgX21lc2g6IHN0cmluZywgX21hc3M6IG51bWJlciwgX3BoeXNpY3NUeXBlOiBmLkJPRFlfVFlQRSwgX2dyb3VwOiBmLkNPTExJU0lPTl9HUk9VUCA9IGYuQ09MTElTSU9OX0dST1VQLkRFRkFVTFQpOiBmLk5vZGUge1xyXG4gICAgICAgIGxldCBub2RlOiBmLk5vZGUgPSBuZXcgZi5Ob2RlKF9uYW1lKTtcclxuICAgICAgICBsZXQgbWVzaDogZi5NZXNoO1xyXG4gICAgICAgIGxldCBtZXNoVHlwZTogZi5DT0xMSURFUl9UWVBFO1xyXG4gICAgICAgIGlmIChfbWVzaCA9PSBcIkN1YmVcIikge1xyXG4gICAgICAgICAgICBtZXNoID0gbmV3IGYuTWVzaEN1YmUoKTtcclxuICAgICAgICAgICAgbWVzaFR5cGUgPSBmLkNPTExJREVSX1RZUEUuQ1VCRTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKF9tZXNoID09IFwiU3BoZXJlXCIpIHtcclxuICAgICAgICAgICAgbWVzaCA9IG5ldyBmLk1lc2hTcGhlcmUodW5kZWZpbmVkLCA4LCA4KTtcclxuICAgICAgICAgICAgbWVzaFR5cGUgPSBmLkNPTExJREVSX1RZUEUuU1BIRVJFO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IGNtcE1lc2g6IGYuQ29tcG9uZW50TWVzaCA9IG5ldyBmLkNvbXBvbmVudE1lc2gobWVzaCk7XHJcbiAgICAgICAgbGV0IGNtcE1hdGVyaWFsOiBmLkNvbXBvbmVudE1hdGVyaWFsID0gbmV3IGYuQ29tcG9uZW50TWF0ZXJpYWwoX21hdGVyaWFsKTtcclxuXHJcbiAgICAgICAgbGV0IGNtcFRyYW5zZm9ybTogZi5Db21wb25lbnRUcmFuc2Zvcm0gPSBuZXcgZi5Db21wb25lbnRUcmFuc2Zvcm0oKTtcclxuXHJcblxyXG4gICAgICAgIGxldCBjbXBSaWdpZGJvZHk6IGYuQ29tcG9uZW50UmlnaWRib2R5ID0gbmV3IGYuQ29tcG9uZW50UmlnaWRib2R5KF9tYXNzLCBfcGh5c2ljc1R5cGUsIG1lc2hUeXBlLCBfZ3JvdXApO1xyXG4gICAgICAgIGNtcFJpZ2lkYm9keS5yZXN0aXR1dGlvbiA9IDAuMjtcclxuICAgICAgICBjbXBSaWdpZGJvZHkuZnJpY3Rpb24gPSAwLjg7XHJcbiAgICAgICAgbm9kZS5hZGRDb21wb25lbnQoY21wTWVzaCk7XHJcbiAgICAgICAgbm9kZS5hZGRDb21wb25lbnQoY21wTWF0ZXJpYWwpO1xyXG4gICAgICAgIG5vZGUuYWRkQ29tcG9uZW50KGNtcFRyYW5zZm9ybSk7XHJcbiAgICAgICAgbm9kZS5hZGRDb21wb25lbnQoY21wUmlnaWRib2R5KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIG5vZGU7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gaG5kS2V5KF9ldmVudDogS2V5Ym9hcmRFdmVudCk6IHZvaWQge1xyXG4gICAgICAgIGxldCBob3Jpem9udGFsOiBudW1iZXIgPSAwO1xyXG4gICAgICAgIGxldCB2ZXJ0aWNhbDogbnVtYmVyID0gMDtcclxuXHJcbiAgICAgICAgaWYgKF9ldmVudC5jb2RlID09IGYuS0VZQk9BUkRfQ09ERS5BKSB7XHJcbiAgICAgICAgICAgIC8vU3RlZXIgTGVmdFxyXG4gICAgICAgICAgICBob3Jpem9udGFsIC09IDE7XHJcbiAgICAgICAgfSBlbHNlIGlmIChfZXZlbnQuY29kZSA9PSBmLktFWUJPQVJEX0NPREUuRCkge1xyXG4gICAgICAgICAgICAvL1N0ZWVyIFJpZ2h0XHJcbiAgICAgICAgICAgIGhvcml6b250YWwgKz0gMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKF9ldmVudC5jb2RlID09IGYuS0VZQk9BUkRfQ09ERS5XKSB7XHJcbiAgICAgICAgICAgIC8vRm9yd2FyZFxyXG4gICAgICAgICAgICB2ZXJ0aWNhbCAtPSAxO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoX2V2ZW50LmNvZGUgPT0gZi5LRVlCT0FSRF9DT0RFLlMpIHtcclxuICAgICAgICAgICAgLy9CYWNrd2FyZFxyXG4gICAgICAgICAgICB2ZXJ0aWNhbCArPSAxO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoaXNGb3JjZSlcclxuICAgICAgICAgICAgYmFsbFJCLmFwcGx5Rm9yY2UobmV3IGYuVmVjdG9yMyhob3Jpem9udGFsICogc3BlZWRGb3JjZSwgMCwgdmVydGljYWwgKiBzcGVlZEZvcmNlKSk7XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGJhbGxSQi5hcHBseUltcHVsc2VBdFBvaW50KG5ldyBmLlZlY3RvcjMoaG9yaXpvbnRhbCAqIHNwZWVkRm9yY2UsIDAsIHZlcnRpY2FsICogc3BlZWRGb3JjZSkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBobmRLZXlEb3duKF9ldmVudDogS2V5Ym9hcmRFdmVudCk6IHZvaWQge1xyXG4gICAgICAgIC8vdG9nZ2xlIGJldHdlZW4gZm9yY2UgYXBwbGllZCBhbmQgaW1wdWxzZSBhcHBsaWVkXHJcbiAgICAgICAgaWYgKF9ldmVudC5jb2RlID09IGYuS0VZQk9BUkRfQ09ERS5UKSB7XHJcbiAgICAgICAgICAgIGlzRm9yY2UgPSAhaXNGb3JjZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iXX0=