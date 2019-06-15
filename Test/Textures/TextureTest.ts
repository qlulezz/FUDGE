namespace TextureTest {
    import ƒ = Fudge;

    window.addEventListener("load", init);

    function init(_event: Event): void {
        let img: HTMLImageElement = document.querySelector("img");
        let txtImage: ƒ.TextureImage = new ƒ.TextureImage();
        txtImage.image = img;
        let coatTextured: ƒ.CoatTextured = new ƒ.CoatTextured();
        coatTextured.texture = txtImage;
        // let coatColored: ƒ.CoatColored = new ƒ.CoatColored(new ƒ.Color(1, 0, 0, 1));
        let material: ƒ.Material = new ƒ.Material("Textured", ƒ.ShaderTexture, coatTextured);

        let quad: ƒ.Node = Scenes.createCompleteMeshNode("Quad", material, new ƒ.MeshQuad());
        let cube: ƒ.Node = Scenes.createCompleteMeshNode("Cube", material, new ƒ.MeshCube());
        let pyramid: ƒ.Node = Scenes.createCompleteMeshNode("Pyramid", material, new ƒ.MeshPyramid());

        cube.cmpTransform.translate(1, 0, 0);
        // cube.cmpTransform.rotateX(-45);
        cube.cmpTransform.rotateY(-45);

        pyramid.cmpTransform.translate(-1, 0, 0);

        let branch: ƒ.Node = new ƒ.Node("Branch");
        branch.appendChild(quad);
        branch.appendChild(cube);
        branch.appendChild(pyramid);

        ƒ.RenderManager.initialize();
        ƒ.RenderManager.addBranch(branch);
        ƒ.RenderManager.recalculateAllNodeTransforms();

        let viewport: ƒ.Viewport = new ƒ.Viewport();
        let camera: ƒ.Node = Scenes.createCamera(new ƒ.Vector3(0, 2, 3), new ƒ.Vector3(0, 0, 0));
        viewport.initialize("Viewport", branch, camera.getComponent(ƒ.ComponentCamera), document.querySelector("canvas"));

        viewport.draw();

        window.setInterval(function (): void {
            pyramid.cmpTransform.rotateX(1);
            cube.cmpTransform.rotateY(-1);
            quad.cmpTransform.rotateZ(1);
            ƒ.RenderManager.recalculateAllNodeTransforms();
            viewport.draw(); 
        },                 20);
    }
}