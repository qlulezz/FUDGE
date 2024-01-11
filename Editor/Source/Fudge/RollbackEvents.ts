/* eslint-disable @typescript-eslint/no-explicit-any */

namespace Fudge {
  export class Rollback {
    public static addUndoState: (_event: EditorEvent) => void = this.debounce((_event: EditorEvent) => {
      console.log("Undo/Redo event received", _event.type, _event);
      // Save Event
      const copyDetail: EventDetail = this.deepCopy(_event.detail);
      const clonedEvent: EditorEvent = new EditorEvent(_event.type, { detail: copyDetail });
      this.undoStack.push(clonedEvent);
      ipcRenderer.send("enableMenuItem", { item: Fudge.MENU.UNDO, on: true });
    });
  
    private static undoStack: EditorEvent[] = [];
    private static redoStack: EditorEvent[] = [];
    
    
    public static undoEvent(): void {
      console.log("User pressed Undo");
      // Rollback to previous event
      if (this.undoStack.length <= 0) {
        return;
      }
      
      const currentState: EditorEvent = this.undoStack.pop();
      this.redoStack.push(currentState);
      ipcRenderer.send("enableMenuItem", { item: Fudge.MENU.REDO, on: true });
      
      const previousState: EditorEvent = this.undoStack.pop();
      
      console.log("currentState", currentState);
      console.log("previousState", previousState);
      
      // Resend previous state
      Page.broadcast(previousState);
    };
    
    public static redoEvent(): void {
      console.log("User pressed Redo");
      if (this.redoStack.length <= 0) {
        return;
      }
      
      const currentState: EditorEvent = this.redoStack.pop();
      this.undoStack.push(currentState);
      
      const previousState: EditorEvent = this.redoStack.pop();
      Page.broadcast(previousState);
    };


    // debouncing, so that sliders are easier to use
    private static debounce(_func: Function, _delay: number = 200): { (): void } {
      let debounceTimer: NodeJS.Timeout;
      return function () {
        const context: any = this;
        const args: IArguments = arguments;
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => _func.apply(context, args), _delay);
      };
    }

    private static deepCopy<T>(_obj: T, _cache: WeakMap<object, any> = new WeakMap()): T {
      // If the object is not an object or is null, return the original object
      if (_obj === null || typeof _obj !== 'object') {
        return _obj;
      }

      // If the object has already been copied, return the cached copy
      if (_cache.has(_obj)) {
        return _cache.get(_obj) as T;
      }

      // If the object is an array, create a new array and copy each element
      if (Array.isArray(_obj)) {
        const newArray: any = _obj.map((_item) => this.deepCopy(_item, _cache)) as any;
        _cache.set(_obj, newArray);
        return newArray;
      }

      // If the object is a plain object, create a new object and copy each property
      const copiedObject: { [key: string]: any } = {};
      _cache.set(_obj, copiedObject);

      for (const key in _obj) {
        if (_obj.hasOwnProperty(key)) {
          copiedObject[key] = this.deepCopy(_obj[key], _cache);
        }
      }

      return copiedObject as T;
    }
  }
  //document.addEventListener(EVENT_EDITOR.UPDATE, Rollback.addUndoState);
}
