namespace AudioSceneVR {
  import f = FudgeCore;
  f.Debug.info("Main Program Template running!");

  let xrViewport: f.XRViewport = new f.XRViewport();
  let graph: f.Graph = null;
  let cmpCamera: f.ComponentCamera = null;

  window.addEventListener("load", init);

  async function init() {
    await FudgeCore.Project.loadResources("Internal.json");
    graph = <f.Graph>f.Project.resources[document.head.querySelector("meta[autoView]").getAttribute("autoView")];
    FudgeCore.Debug.log("Graph:", graph);
    if (!graph) {
      alert("Nothing to render. Create a graph with at least a mesh, material and probably some light");
      return;
    }
    let canvas: HTMLCanvasElement = <HTMLCanvasElement>document.querySelector("canvas");
    cmpCamera = graph.getChildrenByName("Camera")[0].getComponent(f.ComponentCamera);
    cmpCamera.clrBackground = f.Color.CSS("lightsteelblue", 0.25);

    xrViewport.initialize("Viewport", graph, cmpCamera, canvas);


    f.Loop.addEventListener(f.EVENT.LOOP_FRAME, update);
    f.Loop.start(f.LOOP_MODE.FRAME_REQUEST);

    checkForVRSupport();
  }
  // check device/browser capabilities for XR Session 
  function checkForVRSupport(): void {
    navigator.xr.isSessionSupported(f.XR_SESSION_MODE.IMMERSIVE_VR).then((supported: boolean) => {
      if (supported)
        setupVR();
      else
        console.log("Session not supported");
    });
  }
  //main function to start XR Session
  function setupVR(): void {
    //create XR Button -> Browser 
    let enterXRButton: HTMLButtonElement = document.createElement("button");
    enterXRButton.id = "xrButton";
    enterXRButton.innerHTML = "Enter VR";
    document.body.appendChild(enterXRButton);

    enterXRButton.addEventListener("click", async function () {
      //initalizes xr session 
      if (!xrViewport.session) {
        await xrViewport.initializeVR(f.XR_SESSION_MODE.IMMERSIVE_VR, f.XR_REFERENCE_SPACE.LOCAL, true);
        xrViewport.session.addEventListener("end", onEndSession);
      }
      initializeRays();
      //stop normal loop of winodws.animationFrame
      f.Loop.stop();
      //set xr rig transform to rot&pos of ComponentCamera
      //hint: maybe you want to set your FUDGE Camera to y= 1.6 because this is the initial height of the xr rig
      xrViewport.vr.rigPosition = cmpCamera.mtxWorld.translation;
      xrViewport.vr.rigRotation = cmpCamera.mtxPivot.rotation;
      //starts xr-session.animationFrame instead of window.animationFrame, your xr-session is ready to go!
      f.Loop.start(f.LOOP_MODE.FRAME_REQUEST_XR);
    }
    );
  }

  function initializeRays(): void {
    let pickableObjects: f.Node[] = graph.getChildrenByName("CubeContainer")[0].getChildren();
    let rightRayNode = graph.getChildrenByName("raysContainer")[0].getChild(0);
    let leftRayNode = graph.getChildrenByName("raysContainer")[0].getChild(1);
    rightRayNode.addComponent(new RayHelper(xrViewport, xrViewport.vr.rController, 50, pickableObjects));
    leftRayNode.addComponent(new RayHelper(xrViewport, xrViewport.vr.lController, 50, pickableObjects));
  }

  function update(_event: Event): void {
    let pickableObjects: f.Node[] = graph.getChildrenByName("CubeContainer")[0].getChildren();

    // let ray: f.Ray = new f.Ray(new f.Vector3(0, 0, 1), new f.Vector3(0, 0, -1), 1);

    // let picker: f.Pick[] = f.Picker.pickRay(pickableObjects, ray, 0, 100000000000000000);
    // picker.forEach(element => {
    //   console.log(element.node.name);
    // });
    xrViewport.draw();

  }
  function onEndSession(): void {
    f.Loop.stop();
    f.Loop.start(f.LOOP_MODE.FRAME_REQUEST);
  }
























  // function onSqueeze(_event: XRInputSourceEvent): void {
  //     if (actualTeleportationObj) {
  //         let newPos: f.Vector3 = f.Vector3.DIFFERENCE(cmpCamera.mtxWorld.translation, actualTeleportationObj.getComponent(f.ComponentTransform).mtxLocal.translation);
  //         newPos.y -= 0.5;
  //         xrViewport.vr.setNewXRRigidtransform(newPos);
  //         actualTeleportationObj.getComponent(f.ComponentMaterial).clrPrimary.a = 0.5;
  //         actualTeleportationObj = null;
  //     }
  // }

  // function onSelectStart(_event: XRInputSourceEvent): void {
  //     if (actualThrowObject) {
  //         if (_event.inputSource.handedness == "right") {
  //             selectPressedRight = true;
  //         }
  //         if (_event.inputSource.handedness == "left") {
  //             selectPressedLeft = true;
  //         }
  //     }
  // }

  // function onSelectEnd(_event: XRInputSourceEvent): void {
  //     if (actualThrowObject) {
  //         if (_event.inputSource.handedness == "right") {
  //             actualThrowObject.getComponent(f.ComponentRigidbody).setVelocity(f.Vector3.ZERO());
  //             let velocity: f.Vector3 = f.Vector3.DIFFERENCE(rightController.mtxLocal.translation, cmpCamera.mtxPivot.translation);
  //             velocity.scale(20);
  //             actualThrowObject.getComponent(f.ComponentRigidbody).addVelocity(velocity);
  //             actualThrowObject.getComponent(f.ComponentMaterial).clrPrimary.a = 0.5;
  //             actualThrowObject = null;
  //             selectPressedRight = false;
  //         } else {
  //             actualThrowObject.getComponent(f.ComponentRigidbody).setVelocity(f.Vector3.ZERO());
  //             let direction: f.Vector3 = f.Vector3.DIFFERENCE(leftController.mtxLocal.translation, cmpCamera.mtxPivot.translation);
  //             direction.scale(20);
  //             actualThrowObject.getComponent(f.ComponentRigidbody).addVelocity(direction);
  //             actualThrowObject.getComponent(f.ComponentMaterial).clrPrimary.a = 0.5;
  //             actualThrowObject = null;
  //             selectPressedLeft = false;
  //         }
  //     }

  // }
}