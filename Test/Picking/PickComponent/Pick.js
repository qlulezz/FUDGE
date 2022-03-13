var PickRadius;
(function (PickRadius) {
    var ƒ = FudgeCore;
    var ƒAid = FudgeAid;
    document.addEventListener("interactiveViewportStarted", start);
    function start(_event) {
        let viewport = _event.detail;
        let root = viewport.getBranch();
        let zoo = root.getChildrenByName("Zoo")[0];
        let radii = new ƒ.Node("Radii");
        root.replaceChild(zoo, radii);
        root.appendChild(zoo);
        root.addEventListener("mousemove", (_event) => console.log("target: " + _event.target.name, "currentTarget: " + _event.currentTarget.name));
        let meshShpere = new ƒ.MeshSphere("BoundingSphere", 40, 40);
        let material = new ƒ.Material("Transparent", ƒ.ShaderLit, new ƒ.CoatColored(ƒ.Color.CSS("white", 0.5)));
        for (let child of zoo.getChildren()) {
            let sphere = new ƒAid.Node("BoundingSphere", ƒ.Matrix4x4.SCALING(ƒ.Vector3.ONE(2)), material, meshShpere);
            sphere.mtxLocal.scale(ƒ.Vector3.ONE(child.radius));
            let cmpMesh = child.getComponent(ƒ.ComponentMesh);
            sphere.mtxLocal.translation = cmpMesh.mtxWorld.translation;
            sphere.getComponent(ƒ.ComponentMaterial).sortForAlpha = true;
            radii.appendChild(sphere);
        }
        let sphere = new ƒAid.Node("BoundingSphere", ƒ.Matrix4x4.SCALING(ƒ.Vector3.ONE(2)), material, meshShpere);
        sphere.mtxLocal.scale(ƒ.Vector3.ONE(zoo.radius));
        sphere.getComponent(ƒ.ComponentMaterial).sortForAlpha = true;
        // radii.appendChild(sphere);
        ƒ.Debug.branch(root);
        viewport.getCanvas().addEventListener("mousemove", pick);
        function pick(_event) {
            viewport.draw();
            viewport.dispatchPointerEvent(_event);
        }
    }
})(PickRadius || (PickRadius = {}));
//# sourceMappingURL=Pick.js.map