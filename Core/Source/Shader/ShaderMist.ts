namespace FudgeCore {
    export abstract class ShaderMist extends ShaderLit {
        public static readonly iSubclass: number = Shader.registerSubclass(ShaderMist);

        public static define: string[] = [
            "MIST"
          ];

        public static getCoat(): typeof Coat { return Coat; }

        public static getFragmentShaderSource(): string {
            return this.insertDefines(shaderSources["ShaderMist.frag"], this.define);
        }
    }
}