namespace PhysicsVR {
    import f = FudgeCore;

    let xrViewport: f.XRViewport = new f.XRViewport();
    let graph: f.Graph = null;
    let cmpCamera: f.ComponentCamera = null;
    let rightController: f.Node = null;
    let leftController: f.Node = null;
    export let cubeContainer: f.Node = null;
    let cubeGraph: f.Graph = null;
    let spawnTime: number = 0;
    let spawnTrigger: number = 600;
    let cubeInstances: f.GraphInstance[] = new Array();
    window.addEventListener("load", init);

    async function init() {
        await FudgeCore.Project.loadResources("Internal.json");
        graph = <f.Graph>f.Project.resources[document.head.querySelector("meta[autoView]").getAttribute("autoView")];
        cubeGraph = <f.Graph>f.Project.resources["Graph|2022-12-07T15:00:44.501Z|51271"]
        FudgeCore.Debug.log("Graph:", graph);
        if (!graph) {
            alert("Nothing to render. Create a graph with at least a mesh, material and probably some light");
            return;
        }
        let canvas: HTMLCanvasElement = <HTMLCanvasElement>document.querySelector("canvas");
        cmpCamera = graph.getChildrenByName("Camera")[0].getComponent(f.ComponentCamera);
        xrViewport.physicsDebugMode = f.PHYSICS_DEBUGMODE.JOINTS_AND_COLLIDER;
        xrViewport.initialize("Viewport", graph, cmpCamera, canvas);

        rightController = graph.getChildrenByName("rightController")[0];
        leftController = graph.getChildrenByName("leftController")[0];
        cubeContainer = graph.getChildrenByName("cubeContainer")[0];
        for (let i: number = 0; i <= 150; i++) {
            cubeInstances[i] = await f.Project.createGraphInstance(cubeGraph);
        }

        f.Loop.addEventListener(f.EVENT.LOOP_FRAME, update);
        f.Loop.start(f.LOOP_MODE.FRAME_REQUEST, 60);

        checkForVRSupport();
    }

    // check device/browser capabilities for VR Session 
    function checkForVRSupport(): void {
        navigator.xr.isSessionSupported(f.VRSESSIONMODE.IMMERSIVEVR).then((supported: boolean) => {
            if (supported)
                setupVR();
            else
                console.log("Session not supported");
        });
    }
    //main function to start VR Session
    function setupVR(): void {


        //create XR Button -> Browser  //!important: look up the css file.
        let enterXRButton: HTMLButtonElement = document.createElement("button");
        enterXRButton.id = "xrButton";
        enterXRButton.innerHTML = "Enter VR";
        document.body.appendChild(enterXRButton);

        enterXRButton.addEventListener("click", async function () {
            //initalizes xr session 
            if (!xrViewport.vr.session) {
                await xrViewport.initializeVR(f.VRREFERENCESPACE.LOCAL, true);
                //triggers onEndSession function with user exits xr session
                xrViewport.vr.session.addEventListener("end", onEndSession);
            }
            //stop normal loop of winodws.animationFrame
            f.Loop.stop();

            //set controllers matrix information to component transform from node controller made in FUDGE Editor
            rightController.getComponent(f.ComponentTransform).mtxLocal = xrViewport.vr.rController.cntrlTransform.mtxLocal;
            leftController.getComponent(f.ComponentTransform).mtxLocal = xrViewport.vr.lController.cntrlTransform.mtxLocal;

            //set xr transform to matrix from ComponentCamera -> xr transform = camera transform
            xrViewport.vr.setNewXRRigidtransform(f.Vector3.DIFFERENCE(f.Vector3.ZERO(), cmpCamera.mtxWorld.translation));
            //start xrSession.animationFrame instead of window.animationFrame, your xr-session is ready to go!
            f.Loop.start(f.LOOP_MODE.FRAME_REQUEST_XR, 60);
        }
        );
    }
    let increment: number = 0;
    let spawnAmount: number = 0;
    function update(_event: Event): void {

        if (xrViewport.vr.session) {
            spawnTime += 4;
            if (spawnTime == spawnTrigger) {
                spawnTime = 0;
                Translator.speed += 0.0002;
                spawnTrigger -= 4;
                for (let i = 0; i <= spawnAmount; i++) {
                    cubeInstances[increment].getComponent(f.ComponentMaterial).clrPrimary = new f.Color(f.Random.default.getRange(0, 1), f.Random.default.getRange(0, 1), f.Random.default.getRange(0, 1), 1);
                    cubeInstances[increment].mtxLocal.translation = new f.Vector3(f.Random.default.getRange(-2, 2), f.Random.default.getRange(-0.5, 0.5), f.Random.default.getRange(-2, 2));
                    cubeContainer.appendChild(cubeInstances[increment]);
                    increment++;

                }
                spawnAmount += 0.15;
            }
        }




        f.Physics.simulate();
        xrViewport.draw();
    }



    function onEndSession(): void {
        f.Loop.stop();
        f.Loop.start(f.LOOP_MODE.FRAME_REQUEST);
    }
}

