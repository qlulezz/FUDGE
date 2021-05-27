"use strict";
var Test;
(function (Test) {
    var fudge = FudgeCore;
    window.addEventListener("load", hndLoad);
    let color = fudge.Color.CSS("GREEN");
    // let sphereSize: number = 25;
    let ambIntensity = 0.2;
    let dirIntensity = 0.7;
    let shininess = 128;
    let dirRotation = new fudge.Vector3(20, 20, 0);
    let shaders = [fudge.ShaderFlat, fudge.ShaderGouraud, fudge.ShaderPhong];
    let object0;
    let object1;
    let object2;
    function hndLoad(_event) {
        const canvas0 = document.getElementById("c0");
        const canvas1 = document.getElementById("c1");
        const canvas2 = document.getElementById("c2");
        fudge.Render.initialize();
        Test.viewport0 = new fudge.Viewport();
        Test.viewport1 = new fudge.Viewport();
        Test.viewport2 = new fudge.Viewport();
        object0 = new ObjectWithLights("Object0", color, shaders[0]);
        object1 = new ObjectWithLights("Object1", color, shaders[1]);
        object2 = new ObjectWithLights("Object2", color, shaders[2]);
        let cmpCamera = new fudge.ComponentCamera();
        cmpCamera.mtxPivot.translateZ(-2);
        Test.viewport0.initialize("Viewport", object0, cmpCamera, canvas0);
        Test.viewport0.draw();
        Test.viewport1.initialize("Viewport", object1, cmpCamera, canvas1);
        Test.viewport1.draw();
        Test.viewport2.initialize("Viewport", object2, cmpCamera, canvas2);
        Test.viewport2.draw();
        window.setInterval(update, 50);
    }
    function update() {
        object0.object.cmpTransform.mtxLocal.rotateY(.5);
        Test.viewport0.draw();
        object1.object.cmpTransform.mtxLocal.rotateY(.5);
        Test.viewport1.draw();
        object2.object.cmpTransform.mtxLocal.rotateY(.5);
        Test.viewport2.draw();
    }
    class ObjectWithLights extends fudge.Node {
        constructor(_name, _color, _shader) {
            super(_name);
            let mtr = new fudge.Material("mtr" + _color.toString(), _shader, new fudge.CoatColored(_color, shininess));
            let cmpMaterial = new fudge.ComponentMaterial(mtr);
            this.object = new fudge.Node("");
            this.appendChild(this.object);
            // this.object.addComponent(new fudge.ComponentMesh(new fudge.MeshSphere(sphereSize.toString(), sphereSize, sphereSize)));
            this.object.addComponent(new fudge.ComponentMesh(new fudge.MeshObj(Test.Object.obj)));
            // this.object.addComponent(new fudge.ComponentMesh(fudge.MeshObj.LOAD_MESH("Monkey.obj")));
            this.object.addComponent(cmpMaterial);
            this.object.addComponent(new fudge.ComponentTransform());
            let cmpLight = new fudge.ComponentLight(new fudge.LightDirectional(new fudge.Color(dirIntensity, dirIntensity, dirIntensity, 1)));
            let light = new fudge.Node("Light");
            light.addComponent(cmpLight);
            light.addComponent(new fudge.ComponentTransform());
            light.cmpTransform.mtxLocal.rotate(dirRotation);
            this.appendChild(light);
            let cmpLightAmb = new fudge.ComponentLight(new fudge.LightAmbient(new fudge.Color(ambIntensity, ambIntensity, ambIntensity, 1)));
            let lightAmb = new fudge.Node("LightAmb");
            lightAmb.addComponent(cmpLightAmb);
            this.appendChild(lightAmb);
        }
    }
    Test.ObjectWithLights = ObjectWithLights;
})(Test || (Test = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIk1haW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLElBQVUsSUFBSSxDQXNGYjtBQXRGRCxXQUFVLElBQUk7SUFDVixJQUFPLEtBQUssR0FBRyxTQUFTLENBQUM7SUFFekIsTUFBTSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQztJQUt6QyxJQUFJLEtBQUssR0FBZ0IsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDbEQsK0JBQStCO0lBQy9CLElBQUksWUFBWSxHQUFXLEdBQUcsQ0FBQztJQUMvQixJQUFJLFlBQVksR0FBVyxHQUFHLENBQUM7SUFDL0IsSUFBSSxTQUFTLEdBQVcsR0FBRyxDQUFDO0lBQzVCLElBQUksV0FBVyxHQUFrQixJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUM5RCxJQUFJLE9BQU8sR0FBMEIsQ0FBQyxLQUFLLENBQUMsVUFBVSxFQUFFLEtBQUssQ0FBQyxhQUFhLEVBQUUsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQ2hHLElBQUksT0FBeUIsQ0FBQztJQUM5QixJQUFJLE9BQXlCLENBQUM7SUFDOUIsSUFBSSxPQUF5QixDQUFDO0lBRTlCLFNBQVMsT0FBTyxDQUFDLE1BQWE7UUFDMUIsTUFBTSxPQUFPLEdBQXlDLFFBQVEsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDcEYsTUFBTSxPQUFPLEdBQXlDLFFBQVEsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDcEYsTUFBTSxPQUFPLEdBQXlDLFFBQVEsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDcEYsS0FBSyxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUMxQixLQUFBLFNBQVMsR0FBRyxJQUFJLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUNqQyxLQUFBLFNBQVMsR0FBRyxJQUFJLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUNqQyxLQUFBLFNBQVMsR0FBRyxJQUFJLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUVqQyxPQUFPLEdBQUcsSUFBSSxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzdELE9BQU8sR0FBRyxJQUFJLGdCQUFnQixDQUFDLFNBQVMsRUFBRSxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDN0QsT0FBTyxHQUFHLElBQUksZ0JBQWdCLENBQUMsU0FBUyxFQUFFLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUU3RCxJQUFJLFNBQVMsR0FBMEIsSUFBSSxLQUFLLENBQUMsZUFBZSxFQUFFLENBQUM7UUFDbkUsU0FBUyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUVsQyxLQUFBLFNBQVMsQ0FBQyxVQUFVLENBQUMsVUFBVSxFQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDOUQsS0FBQSxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDakIsS0FBQSxTQUFTLENBQUMsVUFBVSxDQUFDLFVBQVUsRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQzlELEtBQUEsU0FBUyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ2pCLEtBQUEsU0FBUyxDQUFDLFVBQVUsQ0FBQyxVQUFVLEVBQUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUM5RCxLQUFBLFNBQVMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUVqQixNQUFNLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsQ0FBQztJQUNuQyxDQUFDO0lBRUQsU0FBUyxNQUFNO1FBQ1gsT0FBTyxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNqRCxLQUFBLFNBQVMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNqQixPQUFPLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ2pELEtBQUEsU0FBUyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ2pCLE9BQU8sQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDakQsS0FBQSxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDckIsQ0FBQztJQUVELE1BQWEsZ0JBQWlCLFNBQVEsS0FBSyxDQUFDLElBQUk7UUFFNUMsWUFBbUIsS0FBYSxFQUFFLE1BQW1CLEVBQUUsT0FBNEI7WUFDL0UsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBRWIsSUFBSSxHQUFHLEdBQW1CLElBQUksS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLFFBQVEsRUFBRSxFQUFFLE9BQU8sRUFBRSxJQUFJLEtBQUssQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDM0gsSUFBSSxXQUFXLEdBQTRCLElBQUksS0FBSyxDQUFDLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBRTVFLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ2pDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBRTlCLDBIQUEwSDtZQUMxSCxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxJQUFJLEtBQUssQ0FBQyxhQUFhLENBQUMsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUEsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNqRiw0RkFBNEY7WUFFNUYsSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLENBQUM7WUFFdEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsSUFBSSxLQUFLLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxDQUFDO1lBRXpELElBQUksUUFBUSxHQUF5QixJQUFJLEtBQUssQ0FBQyxjQUFjLENBQUMsSUFBSSxLQUFLLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxLQUFLLENBQUMsS0FBSyxDQUFDLFlBQVksRUFBRSxZQUFZLEVBQUUsWUFBWSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN4SixJQUFJLEtBQUssR0FBZSxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDaEQsS0FBSyxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUM3QixLQUFLLENBQUMsWUFBWSxDQUFDLElBQUksS0FBSyxDQUFDLGtCQUFrQixFQUFFLENBQUMsQ0FBQztZQUNuRCxLQUFLLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDaEQsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUV4QixJQUFJLFdBQVcsR0FBeUIsSUFBSSxLQUFLLENBQUMsY0FBYyxDQUFDLElBQUksS0FBSyxDQUFDLFlBQVksQ0FBQyxJQUFJLEtBQUssQ0FBQyxLQUFLLENBQUMsWUFBWSxFQUFFLFlBQVksRUFBRSxZQUFZLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3ZKLElBQUksUUFBUSxHQUFlLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUN0RCxRQUFRLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQ25DLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDL0IsQ0FBQztLQUNKO0lBL0JZLHFCQUFnQixtQkErQjVCLENBQUE7QUFDTCxDQUFDLEVBdEZTLElBQUksS0FBSixJQUFJLFFBc0ZiIiwic291cmNlc0NvbnRlbnQiOlsibmFtZXNwYWNlIFRlc3Qge1xyXG4gICAgaW1wb3J0IGZ1ZGdlID0gRnVkZ2VDb3JlO1xyXG5cclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLCBobmRMb2FkKTtcclxuICAgIGV4cG9ydCBsZXQgdmlld3BvcnQwOiBmdWRnZS5WaWV3cG9ydDtcclxuICAgIGV4cG9ydCBsZXQgdmlld3BvcnQxOiBmdWRnZS5WaWV3cG9ydDtcclxuICAgIGV4cG9ydCBsZXQgdmlld3BvcnQyOiBmdWRnZS5WaWV3cG9ydDtcclxuXHJcbiAgICBsZXQgY29sb3I6IGZ1ZGdlLkNvbG9yID0gZnVkZ2UuQ29sb3IuQ1NTKFwiR1JFRU5cIik7XHJcbiAgICAvLyBsZXQgc3BoZXJlU2l6ZTogbnVtYmVyID0gMjU7XHJcbiAgICBsZXQgYW1iSW50ZW5zaXR5OiBudW1iZXIgPSAwLjI7XHJcbiAgICBsZXQgZGlySW50ZW5zaXR5OiBudW1iZXIgPSAwLjc7XHJcbiAgICBsZXQgc2hpbmluZXNzOiBudW1iZXIgPSAxMjg7XHJcbiAgICBsZXQgZGlyUm90YXRpb246IGZ1ZGdlLlZlY3RvcjMgPSBuZXcgZnVkZ2UuVmVjdG9yMygyMCwgMjAsIDApO1xyXG4gICAgbGV0IHNoYWRlcnM6IHR5cGVvZiBmdWRnZS5TaGFkZXJbXSA9IFtmdWRnZS5TaGFkZXJGbGF0LCBmdWRnZS5TaGFkZXJHb3VyYXVkLCBmdWRnZS5TaGFkZXJQaG9uZ107XHJcbiAgICBsZXQgb2JqZWN0MDogT2JqZWN0V2l0aExpZ2h0cztcclxuICAgIGxldCBvYmplY3QxOiBPYmplY3RXaXRoTGlnaHRzO1xyXG4gICAgbGV0IG9iamVjdDI6IE9iamVjdFdpdGhMaWdodHM7XHJcblxyXG4gICAgZnVuY3Rpb24gaG5kTG9hZChfZXZlbnQ6IEV2ZW50KTogdm9pZCB7XHJcbiAgICAgICAgY29uc3QgY2FudmFzMDogSFRNTENhbnZhc0VsZW1lbnQgPSA8SFRNTENhbnZhc0VsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjMFwiKTtcclxuICAgICAgICBjb25zdCBjYW52YXMxOiBIVE1MQ2FudmFzRWxlbWVudCA9IDxIVE1MQ2FudmFzRWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImMxXCIpO1xyXG4gICAgICAgIGNvbnN0IGNhbnZhczI6IEhUTUxDYW52YXNFbGVtZW50ID0gPEhUTUxDYW52YXNFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYzJcIik7XHJcbiAgICAgICAgZnVkZ2UuUmVuZGVyLmluaXRpYWxpemUoKTtcclxuICAgICAgICB2aWV3cG9ydDAgPSBuZXcgZnVkZ2UuVmlld3BvcnQoKTtcclxuICAgICAgICB2aWV3cG9ydDEgPSBuZXcgZnVkZ2UuVmlld3BvcnQoKTtcclxuICAgICAgICB2aWV3cG9ydDIgPSBuZXcgZnVkZ2UuVmlld3BvcnQoKTtcclxuXHJcbiAgICAgICAgb2JqZWN0MCA9IG5ldyBPYmplY3RXaXRoTGlnaHRzKFwiT2JqZWN0MFwiLCBjb2xvciwgc2hhZGVyc1swXSk7XHJcbiAgICAgICAgb2JqZWN0MSA9IG5ldyBPYmplY3RXaXRoTGlnaHRzKFwiT2JqZWN0MVwiLCBjb2xvciwgc2hhZGVyc1sxXSk7XHJcbiAgICAgICAgb2JqZWN0MiA9IG5ldyBPYmplY3RXaXRoTGlnaHRzKFwiT2JqZWN0MlwiLCBjb2xvciwgc2hhZGVyc1syXSk7XHJcblxyXG4gICAgICAgIGxldCBjbXBDYW1lcmE6IGZ1ZGdlLkNvbXBvbmVudENhbWVyYSA9IG5ldyBmdWRnZS5Db21wb25lbnRDYW1lcmEoKTtcclxuICAgICAgICBjbXBDYW1lcmEubXR4UGl2b3QudHJhbnNsYXRlWigtMik7XHJcblxyXG4gICAgICAgIHZpZXdwb3J0MC5pbml0aWFsaXplKFwiVmlld3BvcnRcIiwgb2JqZWN0MCwgY21wQ2FtZXJhLCBjYW52YXMwKTtcclxuICAgICAgICB2aWV3cG9ydDAuZHJhdygpO1xyXG4gICAgICAgIHZpZXdwb3J0MS5pbml0aWFsaXplKFwiVmlld3BvcnRcIiwgb2JqZWN0MSwgY21wQ2FtZXJhLCBjYW52YXMxKTtcclxuICAgICAgICB2aWV3cG9ydDEuZHJhdygpO1xyXG4gICAgICAgIHZpZXdwb3J0Mi5pbml0aWFsaXplKFwiVmlld3BvcnRcIiwgb2JqZWN0MiwgY21wQ2FtZXJhLCBjYW52YXMyKTtcclxuICAgICAgICB2aWV3cG9ydDIuZHJhdygpO1xyXG5cclxuICAgICAgICB3aW5kb3cuc2V0SW50ZXJ2YWwodXBkYXRlLCA1MCk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gdXBkYXRlKCk6IHZvaWQge1xyXG4gICAgICAgIG9iamVjdDAub2JqZWN0LmNtcFRyYW5zZm9ybS5tdHhMb2NhbC5yb3RhdGVZKC41KTtcclxuICAgICAgICB2aWV3cG9ydDAuZHJhdygpO1xyXG4gICAgICAgIG9iamVjdDEub2JqZWN0LmNtcFRyYW5zZm9ybS5tdHhMb2NhbC5yb3RhdGVZKC41KTtcclxuICAgICAgICB2aWV3cG9ydDEuZHJhdygpO1xyXG4gICAgICAgIG9iamVjdDIub2JqZWN0LmNtcFRyYW5zZm9ybS5tdHhMb2NhbC5yb3RhdGVZKC41KTtcclxuICAgICAgICB2aWV3cG9ydDIuZHJhdygpO1xyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBPYmplY3RXaXRoTGlnaHRzIGV4dGVuZHMgZnVkZ2UuTm9kZSB7XHJcbiAgICAgICAgcHVibGljIG9iamVjdDogZnVkZ2UuTm9kZTtcclxuICAgICAgICBwdWJsaWMgY29uc3RydWN0b3IoX25hbWU6IHN0cmluZywgX2NvbG9yOiBmdWRnZS5Db2xvciwgX3NoYWRlcjogdHlwZW9mIGZ1ZGdlLlNoYWRlcikge1xyXG4gICAgICAgICAgICBzdXBlcihfbmFtZSk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBsZXQgbXRyOiBmdWRnZS5NYXRlcmlhbCA9IG5ldyBmdWRnZS5NYXRlcmlhbChcIm10clwiICsgX2NvbG9yLnRvU3RyaW5nKCksIF9zaGFkZXIsIG5ldyBmdWRnZS5Db2F0Q29sb3JlZChfY29sb3IsIHNoaW5pbmVzcykpO1xyXG4gICAgICAgICAgICBsZXQgY21wTWF0ZXJpYWw6IGZ1ZGdlLkNvbXBvbmVudE1hdGVyaWFsID0gbmV3IGZ1ZGdlLkNvbXBvbmVudE1hdGVyaWFsKG10cik7XHJcblxyXG4gICAgICAgICAgICB0aGlzLm9iamVjdCA9IG5ldyBmdWRnZS5Ob2RlKFwiXCIpO1xyXG4gICAgICAgICAgICB0aGlzLmFwcGVuZENoaWxkKHRoaXMub2JqZWN0KTtcclxuXHJcbiAgICAgICAgICAgIC8vIHRoaXMub2JqZWN0LmFkZENvbXBvbmVudChuZXcgZnVkZ2UuQ29tcG9uZW50TWVzaChuZXcgZnVkZ2UuTWVzaFNwaGVyZShzcGhlcmVTaXplLnRvU3RyaW5nKCksIHNwaGVyZVNpemUsIHNwaGVyZVNpemUpKSk7XHJcbiAgICAgICAgICAgIHRoaXMub2JqZWN0LmFkZENvbXBvbmVudChuZXcgZnVkZ2UuQ29tcG9uZW50TWVzaChuZXcgZnVkZ2UuTWVzaE9iaihPYmplY3Qub2JqKSkpO1xyXG4gICAgICAgICAgICAvLyB0aGlzLm9iamVjdC5hZGRDb21wb25lbnQobmV3IGZ1ZGdlLkNvbXBvbmVudE1lc2goZnVkZ2UuTWVzaE9iai5MT0FEX01FU0goXCJNb25rZXkub2JqXCIpKSk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLm9iamVjdC5hZGRDb21wb25lbnQoY21wTWF0ZXJpYWwpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgdGhpcy5vYmplY3QuYWRkQ29tcG9uZW50KG5ldyBmdWRnZS5Db21wb25lbnRUcmFuc2Zvcm0oKSk7XHJcblxyXG4gICAgICAgICAgICBsZXQgY21wTGlnaHQ6IGZ1ZGdlLkNvbXBvbmVudExpZ2h0ID0gbmV3IGZ1ZGdlLkNvbXBvbmVudExpZ2h0KG5ldyBmdWRnZS5MaWdodERpcmVjdGlvbmFsKG5ldyBmdWRnZS5Db2xvcihkaXJJbnRlbnNpdHksIGRpckludGVuc2l0eSwgZGlySW50ZW5zaXR5LCAxKSkpO1xyXG4gICAgICAgICAgICBsZXQgbGlnaHQ6IGZ1ZGdlLk5vZGUgPSBuZXcgZnVkZ2UuTm9kZShcIkxpZ2h0XCIpO1xyXG4gICAgICAgICAgICBsaWdodC5hZGRDb21wb25lbnQoY21wTGlnaHQpO1xyXG4gICAgICAgICAgICBsaWdodC5hZGRDb21wb25lbnQobmV3IGZ1ZGdlLkNvbXBvbmVudFRyYW5zZm9ybSgpKTtcclxuICAgICAgICAgICAgbGlnaHQuY21wVHJhbnNmb3JtLm10eExvY2FsLnJvdGF0ZShkaXJSb3RhdGlvbik7XHJcbiAgICAgICAgICAgIHRoaXMuYXBwZW5kQ2hpbGQobGlnaHQpO1xyXG5cclxuICAgICAgICAgICAgbGV0IGNtcExpZ2h0QW1iOiBmdWRnZS5Db21wb25lbnRMaWdodCA9IG5ldyBmdWRnZS5Db21wb25lbnRMaWdodChuZXcgZnVkZ2UuTGlnaHRBbWJpZW50KG5ldyBmdWRnZS5Db2xvcihhbWJJbnRlbnNpdHksIGFtYkludGVuc2l0eSwgYW1iSW50ZW5zaXR5LCAxKSkpO1xyXG4gICAgICAgICAgICBsZXQgbGlnaHRBbWI6IGZ1ZGdlLk5vZGUgPSBuZXcgZnVkZ2UuTm9kZShcIkxpZ2h0QW1iXCIpO1xyXG4gICAgICAgICAgICBsaWdodEFtYi5hZGRDb21wb25lbnQoY21wTGlnaHRBbWIpO1xyXG4gICAgICAgICAgICB0aGlzLmFwcGVuZENoaWxkKGxpZ2h0QW1iKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iXX0=