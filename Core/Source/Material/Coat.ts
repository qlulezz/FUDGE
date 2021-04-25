namespace FudgeCore {
  /**
   * Holds data to feed into a [[Shader]] to describe the surface of [[Mesh]].  
   * [[Material]]s reference [[Coat]] and [[Shader]].   
   * The method useRenderData will be injected by [[RenderInjector]] at runtime, extending the functionality of this class to deal with the renderer.
   */
  export class Coat extends Mutable implements Serializable {
    public name: string = "Coat";
    protected renderData: { [key: string]: unknown };

    public useRenderData(_shader: typeof Shader, _cmpMaterial: ComponentMaterial): void {/* injected by RenderInjector*/ }

    //#region Transfer
    public serialize(): Serialization {
      let serialization: Serialization = { name: this.name };
      return serialization;
    }
    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      this.name = _serialization.name;
      return this;
    }

    protected reduceMutator(): void { /**/ }
    //#endregion
  }

  /**
   * The simplest [[Coat]] providing just a color
   */
  @RenderInjectorCoat.decorate
  export class CoatColored extends Coat {
    public color: Color;
    public shininess: number;
    constructor(_color?: Color, _shininess?: number) {
      super();
      this.color = _color || new Color();
      this.shininess = _shininess || 0;
    }

    //#region Transfer
    public serialize(): Serialization {
      let serialization: Serialization = super.serialize();
      serialization.color = this.color.serialize();
      return serialization;
    }
    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      super.deserialize(_serialization);
      this.color.deserialize(_serialization.color);
      return this;
    }
    //#endregion
  }

  /**
   * A [[Coat]] to be used by the MatCap Shader providing a texture, a tint color (0.5 grey is neutral). Set shadeSmooth to 1 for smooth shading.
   */
  @RenderInjectorCoat.decorate
  export class CoatMatCap extends Coat {
    public texture: TextureImage = null;
    public color: Color = new Color();
    public shadeSmooth: number;

    constructor(_texture?: TextureImage, _color?: Color, _shadeSmooth?: number) {
      super();
      this.texture = _texture || new TextureImage();
      this.color = _color || new Color();
      this.shadeSmooth = _shadeSmooth || 0;
    }
  }
}