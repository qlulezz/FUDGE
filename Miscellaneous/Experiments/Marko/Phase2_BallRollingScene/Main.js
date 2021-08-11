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
        let ground = createCompleteMeshNode("Ground", new f.Material("Ground", f.ShaderFlat, new f.CoatColored(new f.Color(0.2, 0.2, 0.2, 1))), "Cube", 0, f.PHYSICS_TYPE.STATIC, f.PHYSICS_GROUP.GROUP_1);
        let cmpGroundMesh = ground.getComponent(f.ComponentTransform);
        cmpGroundMesh.mtxLocal.scale(new f.Vector3(10, 0.3, 10));
        cmpGroundMesh.mtxLocal.translate(new f.Vector3(0, -1.5, 0));
        hierarchy.appendChild(ground);
        bodies[0] = createCompleteMeshNode("Ball", new f.Material("Ball", f.ShaderFlat, new f.CoatColored(new f.Color(0.5, 0.5, 0.5, 1))), "Sphere", 1, f.PHYSICS_TYPE.DYNAMIC, f.PHYSICS_GROUP.GROUP_2);
        let cmpCubeTransform = bodies[0].getComponent(f.ComponentTransform);
        hierarchy.appendChild(bodies[0]);
        cmpCubeTransform.mtxLocal.translate(new f.Vector3(7, 4, 0));
        ballRB = bodies[0].getComponent(f.ComponentRigidbody);
        ballRB.linearDamping = 0.1;
        ballRB.angularDamping = 0.1;
        bodies[1] = createCompleteMeshNode("Cube_-10GradZ", new f.Material("Cube", f.ShaderFlat, new f.CoatColored(new f.Color(1, 1, 0, 1))), "Cube", 1, f.PHYSICS_TYPE.STATIC, f.PHYSICS_GROUP.GROUP_1);
        hierarchy.appendChild(bodies[1]);
        bodies[1].mtxLocal.translate(new f.Vector3(-7, -1.5, 0));
        bodies[1].mtxLocal.scale(new f.Vector3(10, 0.3, 10));
        bodies[1].mtxLocal.rotateZ(-10, true);
        bodies[2] = createCompleteMeshNode("Cube_-20GradZ", new f.Material("Cube", f.ShaderFlat, new f.CoatColored(new f.Color(1, 1, 0, 1))), "Cube", 1, f.PHYSICS_TYPE.STATIC, f.PHYSICS_GROUP.GROUP_1);
        hierarchy.appendChild(bodies[2]);
        bodies[2].mtxLocal.translate(new f.Vector3(8, -1, 0));
        bodies[2].mtxLocal.scale(new f.Vector3(10, 0.1, 10));
        bodies[2].mtxLocal.rotateZ(20, true);
        bodies[4] = createCompleteMeshNode("Cube_15,0,10Grad", new f.Material("Cube", f.ShaderFlat, new f.CoatColored(new f.Color(1, 1, 0, 1))), "Cube", 1, f.PHYSICS_TYPE.STATIC, f.PHYSICS_GROUP.GROUP_1);
        bodies[4].mtxLocal.translate(new f.Vector3(0, -1.3, -9.5));
        bodies[4].mtxLocal.scale(new f.Vector3(10, 0.3, 10));
        bodies[4].mtxLocal.rotate(new f.Vector3(15, 0, 10), true);
        hierarchy.appendChild(bodies[4]);
        bodies[3] = createCompleteMeshNode("ResetTrigger", new f.Material("Cube", f.ShaderFlat, new f.CoatColored(new f.Color(1, 1, 0, 1))), "Cube", 1, f.PHYSICS_TYPE.STATIC, f.PHYSICS_GROUP.DEFAULT);
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
    function createCompleteMeshNode(_name, _material, _mesh, _mass, _physicsType, _group = f.PHYSICS_GROUP.DEFAULT) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIk1haW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLDJEQUEyRDtBQUMzRCxJQUFPLENBQUMsR0FBRyxTQUFTLENBQUM7QUFJckIsSUFBVSwwQkFBMEIsQ0F5S25DO0FBektELFdBQVUsMEJBQTBCO0lBRWhDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDdEMsTUFBTSxHQUFHLEdBQXNCLFFBQVEsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDaEUsSUFBSSxRQUFvQixDQUFDO0lBQ3pCLElBQUksU0FBaUIsQ0FBQztJQUN0QixJQUFJLEdBQVcsQ0FBQztJQUNoQixNQUFNLEtBQUssR0FBYSxFQUFFLENBQUM7SUFDM0IsSUFBSSxVQUFVLEdBQWdCLFFBQVEsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7SUFFL0QsSUFBSSxNQUFNLEdBQWEsSUFBSSxLQUFLLEVBQUUsQ0FBQztJQUNuQyxJQUFJLE1BQTRCLENBQUM7SUFDakMsSUFBSSxVQUFVLEdBQVcsRUFBRSxDQUFDO0lBRTVCLElBQUksT0FBTyxHQUFZLElBQUksQ0FBQztJQUc1QixTQUFTLElBQUksQ0FBQyxNQUFhO1FBQ3ZCLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2pCLFNBQVMsR0FBRyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFFaEMsUUFBUSxDQUFDLGdCQUFnQixDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUM5QyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQ2pELElBQUksTUFBTSxHQUFXLHNCQUFzQixDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxVQUFVLEVB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QUNyRCxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUV0QyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsc0JBQXNCLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDak0sU0FBUyxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNqQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdEQsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNyRCxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFFckMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLHNCQUFzQixDQUFDLGtCQUFrQixFQUFFLElBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDcE0sTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDM0QsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNyRCxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUMxRCxTQUFTLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRWpDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxzQkFBc0IsQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNoTSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMs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LE1BQU0sQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDLEVBQUU7WUFDekMsVUFBVTtZQUNWLFFBQVEsSUFBSSxDQUFDLENBQUM7U0FDakI7UUFDRCxJQUFJLE9BQU87WUFDUCxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFVLEdBQUcsVUFBVSxFQUFFLENBQUMsRUFBRSxRQUFRLEdBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQzthQUNuRjtZQUNELE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBVSxHQUFHLFVBQVUsRUFBRSxDQUFDLEVBQUUsUUFBUSxHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUM7U0FDaEc7SUFDTCxDQUFDO0lBRUQsU0FBUyxVQUFVLENBQUMsTUFBcUI7UUFDckMsa0RBQWtEO1FBQ2xELElBQUksTUFBTSxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUMsRUFBRTtZQUNsQyxPQUFPLEdBQUcsQ0FBQyxPQUFPLENBQUM7U0FDdEI7SUFDTCxDQUFDO0FBQ0wsQ0FBQyxFQXpLUywwQkFBMEIsS0FBMUIsMEJBQTBCLFFBeUtuQyIsInNvdXJjZXNDb250ZW50IjpbIi8vLzxyZWZlcmVuY2UgdHlwZXM9XCIuLi8uLi8uLi8uLi9Db3JlL0J1aWxkL0Z1ZGdlQ29yZS5qc1wiLz5cclxuaW1wb3J0IGYgPSBGdWRnZUNvcmU7XHJcblxyXG5cclxuXHJcbm5hbWVzcGFjZSBGdWRnZVBoeXNpY3NfQ29tbXVuaWNhdGlvbiB7XHJcblxyXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsIGluaXQpO1xyXG4gICAgY29uc3QgYXBwOiBIVE1MQ2FudmFzRWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJjYW52YXNcIik7XHJcbiAgICBsZXQgdmlld1BvcnQ6IGYuVmlld3BvcnQ7XHJcbiAgICBsZXQgaGllcmFyY2h5OiBmLk5vZGU7XHJcbiAgICBsZXQgZnBzOiBudW1iZXI7XHJcbiAgICBjb25zdCB0aW1lczogbnVtYmVyW10gPSBbXTtcclxuICAgIGxldCBmcHNEaXNwbGF5OiBIVE1MRWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJoMiNGUFNcIik7XHJcblxyXG4gICAgbGV0IGJvZGllczogZi5Ob2RlW10gPSBuZXcgQXJyYXkoKTtcclxuICAgIGxldCBiYWxsUkI6IGYuQ29tcG9uZW50UmlnaWRib2R5O1xyXG4gICAgbGV0IHNwZWVkRm9yY2U6IG51bWJlciA9IDEwO1xyXG5cclxuICAgIGxldCBpc0ZvcmNlOiBib29sZWFuID0gdHJ1ZTtcclxuXHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdChfZXZlbnQ6IEV2ZW50KTogdm9pZCB7XHJcbiAgICAgICAgZi5EZWJ1Zy5sb2coYXBwKTtcclxuICAgICAgICBoaWVyYXJjaHkgPSBuZXcgZi5Ob2RlKFwiU2NlbmVcIik7XHJcblxyXG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlwcmVzc1wiLCBobmRLZXkpO1xyXG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIGhuZEtleURvd24pO1xyXG4gICAgICAgIGxldCBncm91bmQ6IGYuTm9kZSA9IGNyZWF0ZUNvbXBsZXRlTWVzaE5vZGUoXCJHcm91bmRcIiwgbmV3IGYuTWF0ZXJpYWwoXCJHcm91bmRcIiwgZi5TaGFkZXJGbGF0LCBuZXcgZi5Db2F0Q29sb3JlZChuZXcgZi5Db2xvcigwLjIsIDAuMiwgMC4yLCAxKSkpLCBcIkN1YmVcIiwgMCwgZi5QSFlTSUNTX1RZUEUuU1RBVElDLCBmLlBIWVNJQ1NfR1JPVVAuR1JPVVBfMSk7XHJcbiAgICAgICAgbGV0IGNtcEdyb3VuZE1lc2g6IGYuQ29tcG9uZW50VHJhbnNmb3JtID0gZ3JvdW5kLmdldENvbXBvbmVudChmLkNvbXBvbmVudFRyYW5zZm9ybSk7XHJcbiAgICAgICAgY21wR3JvdW5kTWVzaC5tdHhMb2NhbC5zY2FsZShuZXcgZi5WZWN0b3IzKDEwLCAwLjMsIDEwKSk7XHJcblxyXG4gICAgICAgIGNtcEdyb3VuZE1lc2gubXR4TG9jYWwudHJhbnNsYXRlKG5ldyBmLlZlY3RvcjMoMCwgLTEuNSwgMCkpO1xyXG4gICAgICAgIGhpZXJhcmNoeS5hcHBlbmRDaGlsZChncm91bmQpO1xyXG5cclxuICAgICAgICBib2RpZXNbMF0gPSBjcmVhdGVDb21wbGV0ZU1lc2hOb2RlKFwiQmFsbFwiLCBuZXcgZi5NYXRlcmlhbChcIkJhbGxcIiwgZi5TaGFkZXJGbGF0LCBuZXcgZi5Db2F0Q29sb3JlZChuZXcgZi5Db2xvcigwLjUsIDAuNSwgMC41LCAxKSkpLCBcIlNwaGVyZVwiLCAxLCBmLlBIWVNJQ1NfVFlQRS5EWU5BTUlDLCBmLlBIWVNJQ1NfR1JPVVAuR1JPVVBfMik7XHJcbiAgICAgICAgbGV0IGNtcEN1YmVUcmFuc2Zvcm06IGYuQ29tcG9uZW50VHJhbnNmb3JtID0gYm9kaWVzWzBdLmdldENvbXBvbmVudChmLkNvbXBvbmVudFRyYW5zZm9ybSk7XHJcbiAgICAgICAgaGllcmFyY2h5LmFwcGVuZENoaWxkKGJvZGllc1swXSk7XHJcbiAgICAgICAgY21wQ3ViZVRyYW5zZm9ybS5tdHhMb2NhbC50cmFuc2xhdGUobmV3IGYuVmVjdG9yMyg3LCA0LCAwKSk7XHJcbiAgICAgICAgYmFsbFJCID0gYm9kaWVzWzBdLmdldENvbXBvbmVudChmLkNvbXBvbmVudFJpZ2lkYm9keSk7XHJcbiAgICAgICAgYmFsbFJCLmxpbmVhckRhbXBpbmcgPSAwLjE7XHJcbiAgICAgICAgYmFsbFJCLmFuZ3VsYXJEYW1waW5nID0gMC4xO1xyXG5cclxuICAgICAgICBib2RpZXNbMV0gPSBjcmVhdGVDb21wbGV0ZU1lc2hOb2RlKFwiQ3ViZV8tMTBHcmFkWlwiLCBuZXcgZi5NYXRlcmlhbChcIkN1YmVcIiwgZi5TaGFkZXJGbGF0LCBuZXcgZi5Db2F0Q29sb3JlZChuZXcgZi5Db2xvcigxLCAxLCAwLCAxKSkpLCBcIkN1YmVcIiwgMSwgZi5QSFlTSUNTX1RZUEUuU1RBVElDLCBmLlBIWVNJQ1NfR1JPVVAuR1JPVVBfMSk7XHJcbiAgICAgICAgaGllcmFyY2h5LmFwcGVuZENoaWxkKGJvZGllc1sxXSk7XHJcbiAgICAgICAgYm9kaWVzWzFdLm10eExvY2FsLnRyYW5zbGF0ZShuZXcgZi5WZWN0b3IzKC03LCAtMS41LCAwKSk7XHJcbiAgICAgICAgYm9kaWVzWzFdLm10eExvY2FsLnNjYWxlKG5ldyBmLlZlY3RvcjMoMTAsIDAuMywgMTApKTtcclxuICAgICAgICBib2RpZXNbMV0ubXR4TG9jYWwucm90YXRlWigtMTAsIHRydWUpO1xyXG5cclxuICAgICAgICBib2RpZXNbMl0gPSBjcmVhdGVDb21wbGV0ZU1lc2hOb2RlKFwiQ3ViZV8tMjBHcmFkWlwiLCBuZXcgZi5NYXRlcmlhbChcIkN1YmVcIiwgZi5TaGFkZXJGbGF0LCBuZXcgZi5Db2F0Q29sb3JlZChuZXcgZi5Db2xvcigxLCAxLCAwLCAxKSkpLCBcIkN1YmVcIiwgMSwgZi5QSFlTSUNTX1RZUEUuU1RBVElDLCBmLlBIWVNJQ1NfR1JPVVAuR1JPVVBfMSk7XHJcbiAgICAgICAgaGllcmFyY2h5LmFwcGVuZENoaWxkKGJvZGllc1syXSk7XHJcbiAgICAgICAgYm9kaWVzWzJdLm10eExvY2FsLnRyYW5zbGF0ZShuZXcgZi5WZWN0b3IzKDgsIC0xLCAwKSk7XHJcbiAgICAgICAgYm9kaWVzWzJdLm10eExvY2FsLnNjYWxlKG5ldyBmLlZlY3RvcjMoMTAsIDAuMSwgMTApKTtcclxuICAgICAgICBib2RpZXNbMl0ubXR4TG9jYWwucm90YXRlWigyMCwgdHJ1ZSk7XHJcblxyXG4gICAgICAgIGJvZGllc1s0XSA9IGNyZWF0ZUNvbXBsZXRlTWVzaE5vZGUoXCJDdWJlXzE1LDAsMTBHcmFkXCIsIG5ldyBmLk1hdGVyaWFsKFwiQ3ViZVwiLCBmLlNoYWRlckZsYXQsIG5ldyBmLkNvYXRDb2xvcmVkKG5ldyBmLkNvbG9yKDEsIDEsIDAsIDEpKSksIFwiQ3ViZVwiLCAxLCBmLlBIWVNJQ1NfVFlQRS5TVEFUSUMsIGYuUEhZU0lDU19HUk9VUC5HUk9VUF8xKTtcclxuICAgICAgICBib2RpZXNbNF0ubXR4TG9jYWwudHJhbnNsYXRlKG5ldyBmLlZlY3RvcjMoMCwgLTEuMywgLTkuNSkpO1xyXG4gICAgICAgIGJvZGllc1s0XS5tdHhMb2NhbC5zY2FsZShuZXcgZi5WZWN0b3IzKDEwLCAwLjMsIDEwKSk7XHJcbiAgICAgICAgYm9kaWVzWzRdLm10eExvY2FsLnJvdGF0ZShuZXcgZi5WZWN0b3IzKDE1LCAwLCAxMCksIHRydWUpO1xyXG4gICAgICAgIGhpZXJhcmNoeS5hcHBlbmRDaGlsZChib2RpZXNbNF0pO1xyXG5cclxuICAgICAgICBib2RpZXNbM10gPSBjcmVhdGVDb21wbGV0ZU1lc2hOb2RlKFwiUmVzZXRUcmlnZ2VyXCIsIG5ldyBmLk1hdGVyaWFsKFwiQ3ViZVwiLCBmLlNoYWRlckZsYXQsIG5ldyBmLkNvYXRDb2xvcmVkKG5ldyBmLkNvbG9yKDEsIDEsIDAsIDEpKSksIFwiQ3ViZVwiLCAxLCBmLlBIWVNJQ1NfVFlQRS5TVEFUSUMsIGYuUEhZU0lDU19HUk9VUC5ERUZBVUxUKTtcclxuICAgICAgICBib2RpZXNbM10ucmVtb3ZlQ29tcG9uZW50KGJvZGllc1szXS5nZXRDb21wb25lbnQoZi5Db21wb25lbnRNZXNoKSk7XHJcbiAgICAgICAgaGllcmFyY2h5LmFwcGVuZENoaWxkKGJvZGllc1szXSk7XHJcbiAgICAgICAgYm9kaWVzWzNdLm10eExvY2FsLnRyYW5zbGF0ZShuZXcgZi5WZWN0b3IzKDAsIC0zLCAwKSk7XHJcbiAgICAgICAgYm9kaWVzWzNdLm10eExvY2FsLnNjYWxlKG5ldyBmLlZlY3RvcjMoNDAsIDAuMywgNDApKTtcclxuICAgICAgICBib2RpZXNbM10uZ2V0Q29tcG9uZW50KGYuQ29tcG9uZW50UmlnaWRib2R5KS5pc1RyaWdnZXIgPSB0cnVlO1xyXG4gICAgICAgIGJvZGllc1szXS5nZXRDb21wb25lbnQoZi5Db21wb25lbnRSaWdpZGJvZHkpLmFkZEV2ZW50TGlzdGVuZXIoZi5FVkVOVF9QSFlTSUNTLlRSSUdHRVJfRU5URVIsIHJlc2V0QmFsbCk7XHJcblxyXG4gICAgICAgIGxldCBjbXBMaWdodDogZi5Db21wb25lbnRMaWdodCA9IG5ldyBmLkNvbXBvbmVudExpZ2h0KG5ldyBmLkxpZ2h0RGlyZWN0aW9uYWwoZi5Db2xvci5DU1MoXCJXSElURVwiKSkpO1xyXG4gICAgICAgIGNtcExpZ2h0Lm10eFBpdm90Lmxvb2tBdChuZXcgZi5WZWN0b3IzKDAuNSwgLTEsIC0wLjgpKTtcclxuICAgICAgICBoaWVyYXJjaHkuYWRkQ29tcG9uZW50KGNtcExpZ2h0KTtcclxuXHJcbiAgICAgICAgbGV0IGNtcENhbWVyYTogZi5Db21wb25lbnRDYW1lcmEgPSBuZXcgZi5Db21wb25lbnRDYW1lcmEoKTtcclxuICAgICAgICBjbXBDYW1lcmEuY2xyQmFja2dyb3VuZCA9IGYuQ29sb3IuQ1NTKFwiR1JFWVwiKTtcclxuICAgICAgICBjbXBDYW1lcmEubXR4UGl2b3QudHJhbnNsYXRlKG5ldyBmLlZlY3RvcjMoMiwgNCwgMjUpKTtcclxuICAgICAgICBjbXBDYW1lcmEubXR4UGl2b3QubG9va0F0KGYuVmVjdG9yMy5aRVJPKCkpO1xyXG5cclxuXHJcbiAgICAgICAgdmlld1BvcnQgPSBuZXcgZi5WaWV3cG9ydCgpO1xyXG4gICAgICAgIHZpZXdQb3J0LmluaXRpYWxpemUoXCJWaWV3cG9ydFwiLCBoaWVyYXJjaHksIGNtcENhbWVyYSwgYXBwKTtcclxuXHJcbiAgICAgICAgdmlld1BvcnQuc2hvd1NjZW5lR3JhcGgoKTtcclxuICAgICAgICBmLkxvb3AuYWRkRXZlbnRMaXN0ZW5lcihmLkVWRU5ULkxPT1BfRlJBTUUsIHVwZGF0ZSk7XHJcbiAgICAgICAgZi5QaHlzaWNzLmFkanVzdFRyYW5zZm9ybXMoaGllcmFyY2h5KTtcclxuICAgICAgICBmLkxvb3Auc3RhcnQoKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiB1cGRhdGUoKTogdm9pZCB7XHJcbiAgICAgICAgZi5QaHlzaWNzLndvcmxkLnNpbXVsYXRlKCk7XHJcbiAgICAgICAgdmlld1BvcnQuZHJhdygpO1xyXG4gICAgICAgIG1lYXN1cmVGUFMoKTtcclxuICAgIH1cclxuXHJcblxyXG4gICAgZnVuY3Rpb24gcmVzZXRCYWxsKF9ldmVudDogZi5FdmVudFBoeXNpY3MpOiB2b2lkIHtcclxuICAgICAgICBpZiAoX2V2ZW50LmNtcFJpZ2lkYm9keS5nZXRDb250YWluZXIoKS5uYW1lID09IFwiQmFsbFwiKSB7XHJcbiAgICAgICAgICAgIGJhbGxSQi5zZXRQb3NpdGlvbihuZXcgZi5WZWN0b3IzKDAsIDUsIDApKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gbWVhc3VyZUZQUygpOiB2b2lkIHtcclxuICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcclxuICAgICAgICAgICAgY29uc3Qgbm93OiBudW1iZXIgPSBwZXJmb3JtYW5jZS5ub3coKTtcclxuICAgICAgICAgICAgd2hpbGUgKHRpbWVzLmxlbmd0aCA+IDAgJiYgdGltZXNbMF0gPD0gbm93IC0gMTAwMCkge1xyXG4gICAgICAgICAgICAgICAgdGltZXMuc2hpZnQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aW1lcy5wdXNoKG5vdyk7XHJcbiAgICAgICAgICAgIGZwcyA9IHRpbWVzLmxlbmd0aDtcclxuICAgICAgICAgICAgZnBzRGlzcGxheS50ZXh0Q29udGVudCA9IFwiRlBTOiBcIiArIGZwcy50b1N0cmluZygpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGNyZWF0ZUNvbXBsZXRlTWVzaE5vZGUoX25hbWU6IHN0cmluZywgX21hdGVyaWFsOiBmLk1hdGVyaWFsLCBfbWVzaDogc3RyaW5nLCBfbWFzczogbnVtYmVyLCBfcGh5c2ljc1R5cGU6IGYuUEhZU0lDU19UWVBFLCBfZ3JvdXA6IGYuUEhZU0lDU19HUk9VUCA9IGYuUEhZU0lDU19HUk9VUC5ERUZBVUxUKTogZi5Ob2RlIHtcclxuICAgICAgICBsZXQgbm9kZTogZi5Ob2RlID0gbmV3IGYuTm9kZShfbmFtZSk7XHJcbiAgICAgICAgbGV0IG1lc2g6IGYuTWVzaDtcclxuICAgICAgICBsZXQgbWVzaFR5cGU6IGYuQ09MTElERVJfVFlQRTtcclxuICAgICAgICBpZiAoX21lc2ggPT0gXCJDdWJlXCIpIHtcclxuICAgICAgICAgICAgbWVzaCA9IG5ldyBmLk1lc2hDdWJlKCk7XHJcbiAgICAgICAgICAgIG1lc2hUeXBlID0gZi5DT0xMSURFUl9UWVBFLkNVQkU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChfbWVzaCA9PSBcIlNwaGVyZVwiKSB7XHJcbiAgICAgICAgICAgIG1lc2ggPSBuZXcgZi5NZXNoU3BoZXJlKHVuZGVmaW5lZCwgOCwgOCk7XHJcbiAgICAgICAgICAgIG1lc2hUeXBlID0gZi5DT0xMSURFUl9UWVBFLlNQSEVSRTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBjbXBNZXNoOiBmLkNvbXBvbmVudE1lc2ggPSBuZXcgZi5Db21wb25lbnRNZXNoKG1lc2gpO1xyXG4gICAgICAgIGxldCBjbXBNYXRlcmlhbDogZi5Db21wb25lbnRNYXRlcmlhbCA9IG5ldyBmLkNvbXBvbmVudE1hdGVyaWFsKF9tYXRlcmlhbCk7XHJcblxyXG4gICAgICAgIGxldCBjbXBUcmFuc2Zvcm06IGYuQ29tcG9uZW50VHJhbnNmb3JtID0gbmV3IGYuQ29tcG9uZW50VHJhbnNmb3JtKCk7XHJcblxyXG5cclxuICAgICAgICBsZXQgY21wUmlnaWRib2R5OiBmLkNvbXBvbmVudFJpZ2lkYm9keSA9IG5ldyBmLkNvbXBvbmVudFJpZ2lkYm9keShfbWFzcywgX3BoeXNpY3NUeXBlLCBtZXNoVHlwZSwgX2dyb3VwKTtcclxuICAgICAgICBjbXBSaWdpZGJvZHkucmVzdGl0dXRpb24gPSAwLjI7XHJcbiAgICAgICAgY21wUmlnaWRib2R5LmZyaWN0aW9uID0gMC44O1xyXG4gICAgICAgIG5vZGUuYWRkQ29tcG9uZW50KGNtcE1lc2gpO1xyXG4gICAgICAgIG5vZGUuYWRkQ29tcG9uZW50KGNtcE1hdGVyaWFsKTtcclxuICAgICAgICBub2RlLmFkZENvbXBvbmVudChjbXBUcmFuc2Zvcm0pO1xyXG4gICAgICAgIG5vZGUuYWRkQ29tcG9uZW50KGNtcFJpZ2lkYm9keSk7XHJcblxyXG4gICAgICAgIHJldHVybiBub2RlO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGhuZEtleShfZXZlbnQ6IEtleWJvYXJkRXZlbnQpOiB2b2lkIHtcclxuICAgICAgICBsZXQgaG9yaXpvbnRhbDogbnVtYmVyID0gMDtcclxuICAgICAgICBsZXQgdmVydGljYWw6IG51bWJlciA9IDA7XHJcblxyXG4gICAgICAgIGlmIChfZXZlbnQuY29kZSA9PSBmLktFWUJPQVJEX0NPREUuQSkge1xyXG4gICAgICAgICAgICAvL1N0ZWVyIExlZnRcclxuICAgICAgICAgICAgaG9yaXpvbnRhbCAtPSAxO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoX2V2ZW50LmNvZGUgPT0gZi5LRVlCT0FSRF9DT0RFLkQpIHtcclxuICAgICAgICAgICAgLy9TdGVlciBSaWdodFxyXG4gICAgICAgICAgICBob3Jpem9udGFsICs9IDE7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChfZXZlbnQuY29kZSA9PSBmLktFWUJPQVJEX0NPREUuVykge1xyXG4gICAgICAgICAgICAvL0ZvcndhcmRcclxuICAgICAgICAgICAgdmVydGljYWwgLT0gMTtcclxuICAgICAgICB9IGVsc2UgaWYgKF9ldmVudC5jb2RlID09IGYuS0VZQk9BUkRfQ09ERS5TKSB7XHJcbiAgICAgICAgICAgIC8vQmFja3dhcmRcclxuICAgICAgICAgICAgdmVydGljYWwgKz0gMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGlzRm9yY2UpXHJcbiAgICAgICAgICAgIGJhbGxSQi5hcHBseUZvcmNlKG5ldyBmLlZlY3RvcjMoaG9yaXpvbnRhbCAqIHNwZWVkRm9yY2UsIDAsIHZlcnRpY2FsICogc3BlZWRGb3JjZSkpO1xyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBiYWxsUkIuYXBwbHlJbXB1bHNlQXRQb2ludChuZXcgZi5WZWN0b3IzKGhvcml6b250YWwgKiBzcGVlZEZvcmNlLCAwLCB2ZXJ0aWNhbCAqIHNwZWVkRm9yY2UpKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gaG5kS2V5RG93bihfZXZlbnQ6IEtleWJvYXJkRXZlbnQpOiB2b2lkIHtcclxuICAgICAgICAvL3RvZ2dsZSBiZXR3ZWVuIGZvcmNlIGFwcGxpZWQgYW5kIGltcHVsc2UgYXBwbGllZFxyXG4gICAgICAgIGlmIChfZXZlbnQuY29kZSA9PSBmLktFWUJPQVJEX0NPREUuVCkge1xyXG4gICAgICAgICAgICBpc0ZvcmNlID0gIWlzRm9yY2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59Il19