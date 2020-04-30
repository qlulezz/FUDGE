namespace FudgeUserInterface {
  // import ƒ = FudgeCore;
  export interface CustomElementAttributes {
    key: string;
    label?: string;
    [name: string]: string;
  }

  export abstract class CustomElement extends HTMLElement {
    public static tag: string;
    // private static mapObjectToCustomElement: Map<typeof Object, typeof CustomElement> = new Map();
    private static mapObjectToCustomElement: Map<string, typeof CustomElement> = new Map();
    private static idCounter: number = 0;
    protected initialized: boolean = false;

    public constructor(_attributes?: CustomElementAttributes) {
      super();
      if (_attributes)
        for (let name in _attributes)
          this.setAttribute(name, _attributes[name]);
    }

    public get key(): string {
      return this.getAttribute("key");
    }

    public static get nextId(): string {
      return "ƒ" + CustomElement.idCounter++;
    }

    public static register(_tag: string, _typeCustomElement: typeof CustomElement, _typeObject?: typeof Object): void {
      // console.log(_tag, _class);
      _typeCustomElement.tag = _tag;
      // @ts-ignore
      customElements.define(_tag, _typeCustomElement);

      if (_typeObject)
        CustomElement.map(_typeObject.name, _typeCustomElement);
    }

    public static map(_type: string, _typeCustomElement: typeof CustomElement): void {
      console.log("Map", _type.constructor.name, _typeCustomElement.constructor.name);
      CustomElement.mapObjectToCustomElement.set(_type, _typeCustomElement);
    }
    public static get(_type: string): typeof CustomElement {
      let element: string | typeof CustomElement = CustomElement.mapObjectToCustomElement.get(_type);
      if (typeof (element) == "string")
        element = customElements.get(element);
      return <typeof CustomElement>element;
    }

    public appendLabel(): HTMLLabelElement {
      let label: HTMLLabelElement = document.createElement("label");
      label.textContent = this.getAttribute("label");
      this.appendChild(label);
      return label;
    }

    public abstract getMutatorValue(): Object;
    public abstract setMutatorValue(_value: Object): void;
  }
}