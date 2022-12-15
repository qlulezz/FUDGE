namespace AudioSceneVR {
  import f = FudgeCore;
  f.Debug.info("Main Program Template running!");

  let xrViewport: f.XRViewport = new f.XRViewport();
  let graph: f.Graph = null;
  let cmpCamera: f.ComponentCamera = null;
  let audioLeft: f.ComponentAudio = null;
  let audioRight: f.ComponentAudio = null;

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
    setupAudio();


    f.Loop.addEventListener(f.EVENT.LOOP_FRAME, update);
    f.Loop.start(f.LOOP_MODE.FRAME_REQUEST);

    checkForVRSupport();
  }
  // check device/browser capabilities for XR Session 
  function checkForVRSupport(): void {
    navigator.xr.isSessionSupported(f.VRSESSIONMODE.IMMERSIVEVR).then((supported: boolean) => {
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
      audioLeft.play(true);
      audioRight.play(true);

      //initalizes xr session 
      if (!xrViewport.vr.session) {
        await xrViewport.initializeVR(f.VRREFERENCESPACE.LOCAL, true);

        xrViewport.vr.session.addEventListener("select", onSelect);
        xrViewport.vr.session.addEventListener("squeeze", onSqueeze);

        xrViewport.vr.session.addEventListener("end", onEndSession);
      }
      //stop normal loop of winodws.animationFrame
      f.Loop.stop();
      //set xr transform to matrix from ComponentCamera -> xr transform = camera transform
      xrViewport.vr.setNewXRRigidtransform(f.Vector3.DIFFERENCE(f.Vector3.ZERO(), cmpCamera.mtxWorld.translation));
      //start xrSession.animationFrame instead of window.animationFrame, your xr-session is ready to go!
      f.Loop.start(f.LOOP_MODE.FRAME_REQUEST_XR);


    }
    );
  }
  function setupAudio(): void {
    f.AudioManager.default.listenTo(graph);
    f.AudioManager.default.listenWith(cmpCamera.node.getComponent(f.ComponentAudioListener));
    audioLeft = graph.getChildrenByName("AudioL")[0].getComponent(f.ComponentAudio);
    audioRight = graph.getChildrenByName("AudioR")[0].getComponent(f.ComponentAudio);

  }
  function onSelect(_event: XRInputSourceEvent): void {
    console.log(_event.inputSource.handedness);
    if (_event.inputSource.handedness == "right") {
      if (audioRight.isPlaying)
        audioRight.play(false);
      else
        audioRight.play(true);
    }
    if (_event.inputSource.handedness == "left") {
      if (audioLeft.isPlaying)
        audioLeft.play(false);
      else
        audioLeft.play(true);

    }
  }
  function onSqueeze(_event: XRInputSourceEvent): void {
    if (_event.inputSource.handedness == "right") {
      if (audioRight.node.getComponent(Translator).isTranslating)
        audioRight.node.getComponent(Translator).isTranslating = false;
      else
        audioRight.node.getComponent(Translator).isTranslating = true;
    }
    if (_event.inputSource.handedness == "left") {
      if (audioLeft.node.getComponent(Translator).isTranslating)
        audioLeft.node.getComponent(Translator).isTranslating = false;
      else
        audioLeft.node.getComponent(Translator).isTranslating = true;
    }
  }
  function update(_event: Event): void {
    xrViewport.draw();
    f.AudioManager.default.update();
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