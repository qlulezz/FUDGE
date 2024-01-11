namespace Fudge {
  /**
   * Handling rollbacks of the project state using undo and redo actions.
   * @authors Henry Csösz, HFU, 2023
   */
  export class RollbackProject {
    public static addUndoState: (_clearRedoStack?: boolean) => void = this.debounce(
      (_clearRedoStack: boolean = false) => {
        let projectState: string = project.getProjectJSON();

        // Save current project state, optimizations have to be done here
        this.undoStack.push(projectState);
        if (_clearRedoStack && this.undoStack.length <= this.maxUndoSteps) {
          console.log("Current state saved");
          this.redoStack = [];
        }
        this.updateMenuItems();
      }
    );

    private static maxUndoSteps: number = 32;
    private static undoStack: string[] = [];
    private static redoStack: string[] = [];

    // Rollback to previous event
    public static async undoEvent(): Promise<void> {
      if (this.undoStack.length <= 1) return;

      const currentState: string = this.undoStack.pop();
      this.redoStack.push(currentState);
      ipcRenderer.send("enableMenuItem", { item: Fudge.MENU.REDO, on: true });

      const previousState: string = this.undoStack.pop();
      await this.loadProjectState(previousState);
      this.addUndoState();
    }

    public static async redoEvent(): Promise<void> {
      if (this.redoStack.length <= 0) return;

      const previousState: string = this.redoStack.pop();
      this.undoStack.push(previousState);
      await this.loadProjectState(previousState);
      this.updateMenuItems();
    }

    private static async loadProjectState(_state: string): Promise<void> {
      let serialization: ƒ.Serialization = ƒ.Serializer.parse(_state);
      await ƒ.Project.deserialize(serialization);
      project.reloadPanelInfo();
    }

    private static updateMenuItems(): void {
      if (this.undoStack.length > 1)
        ipcRenderer.send("enableMenuItem", { item: Fudge.MENU.UNDO, on: true });
      else ipcRenderer.send("enableMenuItem", { item: Fudge.MENU.UNDO, on: false });

      if (this.redoStack.length > 0)
        ipcRenderer.send("enableMenuItem", { item: Fudge.MENU.REDO, on: true });
      else ipcRenderer.send("enableMenuItem", { item: Fudge.MENU.REDO, on: false });
    }

    // debouncing, so that sliders are easier to use
    private static debounce(_func: Function, _delay: number = 200): { (): void } {
      let debounceTimer: NodeJS.Timeout;
      return function () {
        const context: ƒ.General = this;
        const args: IArguments = arguments;
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => _func.apply(context, args), _delay);
      };
    }
  }

  document.addEventListener(EVENT_EDITOR.UPDATE, () => RollbackProject.addUndoState(true));
}
