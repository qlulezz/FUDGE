namespace FudgeCore {

  interface ShaderCodeMap { [key: string]: string; }

  export interface ShaderCodeStructure {
    storage?: {
      system?: ShaderCodeMap;
      update?: ShaderCodeMap;
      particle?: ShaderCodeMap;
    };
    transformations?: {
      local?: ShaderCodeMap;
      world?: ShaderCodeMap;
    };
    components?: { [componentType: string]: ShaderCodeStructure};
    [attribute: string]: ShaderCodeStructure | string;
  }

  export class ParticleShaderCodeGenerator {
    private static predefinedVariableMap: {[key: string]: string} = {
      index: "particleIndex",
      numberOfParticles: "u_fNumberOfParticles",
      time: "u_fTime"
    };

    public static generateShaderCodeStructure(_data: Serialization): ShaderCodeStructure {
      if (!_data) return {};

      let codeStructure: ShaderCodeStructure = {};
  
      for (const key in _data) {
        let subData: General = _data[key];
        if (ParticleEffect.isClosureData(subData)) 
          codeStructure[key] = ParticleShaderCodeGenerator.generateCode(subData);
        else
          codeStructure[key] = ParticleShaderCodeGenerator.generateShaderCodeStructure(subData);
      }
  
      return codeStructure;
    }   
  
    public static generateCode(_data: ClosureData): string {
      if (ParticleEffect.isFunctionData(_data)) {
        let parameters: string[] = [];
        for (let param of _data.parameters) {
          parameters.push(this.generateCode(param));
        }
        return ParticleShaderCodeGenerator.generateShaderCodeFunction(_data.function, parameters);
      }
  
      if (ParticleEffect.isVariableData(_data)) {
        let predefined: string = ParticleShaderCodeGenerator.predefinedVariableMap[_data.value];
        return predefined ? predefined : _data.value;
      } 
  
      if (ParticleEffect.isConstantData(_data)) {
        let value: string = _data.value.toString();
        return `${value}${value.includes(".") ? "" : ".0"}` + "f";
      }
  
      throw `invalid node structure`;
    }
  
    public static generateShaderCodeFunction(_function: string, _parameters: string[]): string {
      let closures: { [key: string]: Function } = {
        "addition": (_parameters: string[]) => {
          return `(${_parameters.reduce((_accumulator: string, _value: string) => `${_accumulator} + ${_value}`)})`;
        },
        "subtraction": (_parameters: string[]) => {
          return `(${_parameters.reduce((_accumulator: string, _value: string) => `${_accumulator} - ${_value}`)})`;
        },
        "multiplication": (_parameters: string[]) => {
          return `(${_parameters.reduce((_accumulator: string, _value: string) => `${_accumulator} * ${_value}`)})`;
        },
        "division": (_parameters: string[]) => {
          return `(${_parameters.reduce((_accumulator: string, _value: string) => `${_accumulator} / ${_value}`)})`;
        },
        "modulo": (_parameters: string[]) => {
          return `(${_parameters.reduce((_accumulator: string, _value: string) => `mod(${_accumulator}, ${_value})`)})`;
        },
        "linear": (_parameters: string[]) => {
          let x: string = _parameters[0];
          let xStart: string = _parameters[1];
          let yStart: string = _parameters[2];
          let xEnd: string = _parameters[3];
          let yEnd: string = _parameters[4];
          return `(${yStart} + (${x} - ${xStart}) * (${yEnd} - ${yStart}) / (${xEnd} - ${xStart}))`;
        },
        "polynomial": (_parameters: string[]) => {
          let x: string = _parameters[0];
          let a: string = _parameters[1];
          let b: string = _parameters[2];
          let c: string = _parameters[3];
          let d: string = _parameters[4];
          return `(${a} * pow(${x}, 3.0) + ${b} * pow(${x}, 2.0) + ${c} * ${x} + ${d})`;
        },
        "squareRoot": (_parameters: string[]) => {
          let x: string = _parameters[0];
          return `sqrt(${x})`;
        },
        "random": (_parameters: string[]) => {
          return `texture(u_fRandomNumbers, vec2(${_parameters[0]} / u_fNumberOfParticles, 0.0)).r`;
        }
      };

      if (_function in closures)
        return closures[_function](_parameters);
      else
        throw `"${_function}" is not an operation`;
    }

    public static createStorageShaderCode(_storage: ShaderCodeStructure): string {
      let code: string = "";
      if (_storage) {
        for (const partitionName in _storage) {
          let partition: ShaderCodeMap = _storage[partitionName] as ShaderCodeMap;
          for (const variableName in partition) {
            code += `float ${variableName} = ${partition[variableName]};\n`;
          }
        }
      }
      return code;
    }

    public static createLocalTransformationsShaderCode(_transformations: ShaderCodeStructure): string {
      let code: string = "";
      if (_transformations) {
        for (const key in _transformations) {
          let transformation: ShaderCodeMap = _transformations[key] as ShaderCodeMap;
          switch (key) {
            case "translate":
              code += `mat4 translationMatrix = mat4(
              1.0, 0.0, 0.0, 0.0,
              0.0, 1.0, 0.0, 0.0,
              0.0, 0.0, 1.0, 0.0,
              ${transformation.x ? transformation.x : "0.0"}, ${transformation.y ? transformation.y : "0.0"}, ${transformation.z ? transformation.z : "0.0"}, 1.0);\n`;
              break;
            case "scale":
              code += `mat4 scalingMatrix = mat4(
              ${transformation.x ? transformation.x : "1.0"}, 0.0, 0.0, 0.0,
              0.0, ${transformation.y ? transformation.y : "1.0"}, 0.0, 0.0,
              0.0, 0.0, ${transformation.z ? transformation.z : "1.0"}, 0.0,
              0.0, 0.0, 0.0, 1.0
              );\n`;
              break;
            case "rotate":
              let sinX: string = `sin(${transformation.x ? transformation.x : "0.0"})`;
              let cosX: string = `cos(${transformation.x ? transformation.x : "0.0"})`;
              let sinY: string = `sin(${transformation.y ? transformation.y : "0.0"})`;
              let cosY: string = `cos(${transformation.y ? transformation.y : "0.0"})`;
              let sinZ: string = `sin(${transformation.z ? transformation.z : "0.0"})`;
              let cosZ: string = `cos(${transformation.z ? transformation.z : "0.0"})`;
              code += `mat4 rotationMatrix = mat4(
              ${cosZ} * ${cosY}, ${sinZ} * ${cosY}, -${sinY}, 0.0,
              ${cosZ} * ${sinY} * ${sinX} - ${sinZ} * ${cosX}, ${sinZ} * ${sinY} * ${sinX} + ${cosZ} * ${cosX}, ${cosY} * ${sinX}, 0.0,
              ${cosZ} * ${sinY} * ${cosX} + ${sinZ} * ${sinX}, ${sinZ} * ${sinY} * ${cosX} - ${cosZ} * ${sinX}, ${cosY} * ${cosX}, 0.0,
              0.0, 0.0, 0.0, 1.0
              );\n`;
              break;
          }
        }
      }
      return code;
    }

    public static createPositionShaderCode(_structure: ShaderCodeStructure): string {
      let positionCodeMap: {[key: string]: string} = {
        translate: "translationMatrix",
        scale: "scalingMatrix",
        rotate: "rotationMatrix"
      };
      
      let code: string = "";
      if (_structure) {
        for (const key in _structure) {
          code += `${positionCodeMap[key]} * `;
        }
      }
      return code;
    }

    public static createColorShaderCode(_structure: ShaderCodeStructure): string {      
      let clrPrimary: ShaderCodeMap = _structure?.components?.ComponentMaterial?.clrPrimary as ShaderCodeMap;
      if (!clrPrimary) return "";

      let code: string = `v_vctColor = vec4(${clrPrimary.r ? clrPrimary.r : "1.0"}, ${clrPrimary.g ? clrPrimary.g : "1.0"}, ${clrPrimary.b ? clrPrimary.b : "1.0"}, ${clrPrimary.a ? clrPrimary.a : "1.0"});`;
      return code;
    }
  }
}