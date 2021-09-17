namespace Script {
  import ƒ = FudgeCore;
  ƒ.Debug.info("Main Program Template running!")

  let viewport: ƒ.Viewport;
  document.addEventListener("interactiveViewportStarted", <EventListener>start);

  function start(_event: CustomEvent): void {
    viewport = _event.detail;

    // ƒ.Physics.initializePhysics();

    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
    ƒ.Loop.start();  // start the game loop to continously draw the viewport and update the audiosystem
  }

  function update(_event: Event): void {
    ƒ.Physics.world.simulate();
    viewport.draw();
    ƒ.AudioManager.default.update();
  }
}