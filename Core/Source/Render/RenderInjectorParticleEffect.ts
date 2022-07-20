namespace FudgeCore {
  export class RenderInjectorParticleEffect extends RenderInjectorShader {
    public static readonly RANDOM_NUMBERS_TEXTURE_MAX_WIDTH: number = 1000;
    private static readonly FUNCTIONS: { [key: string]: Function } = {
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
        const maxWidth: string = RenderInjectorParticleEffect.RANDOM_NUMBERS_TEXTURE_MAX_WIDTH.toString() + ".0";
        return `texelFetch(u_fRandomNumbers, ivec2(mod(${_parameters[0]}, ${maxWidth}), ${_parameters[0]} / ${maxWidth}), 0).r`;
      },
      "randomRange": (_parameters: string[]) => {
        return `${RenderInjectorParticleEffect.FUNCTIONS["random"](_parameters)} * (${_parameters[2]} - ${_parameters[1]}) + ${_parameters[1]}`;
      }
    };
    private static readonly PREDEFINED_VARIABLES: { [key: string]: string } = {
      index: "fParticleIndex",
      numberOfParticles: "u_fNumberOfParticles",
      time: "u_fTime"
    };

    public static override decorate(_constructor: Function): void {
      Object.defineProperty(_constructor.prototype, "useProgram", {
        value: RenderInjectorShader.useProgram
      });
      Object.defineProperty(_constructor.prototype, "deleteProgram", {
        value: RenderInjectorShader.deleteProgram
      });
      Object.defineProperty(_constructor.prototype, "createProgram", {
        value: RenderInjectorShader.createProgram
      });
      Object.defineProperty(_constructor.prototype, "getVertexShaderSource", {
        value: RenderInjectorParticleEffect.getVertexShaderSource
      });
      Object.defineProperty(_constructor.prototype, "getFragmentShaderSource", {
        value: RenderInjectorParticleEffect.getFragmentShaderSource
      });
    }

    public static getVertexShaderSource(this: ParticleEffect): string {
      let data: ParticleEffectData = RenderInjectorParticleEffect.renameVariables(this.data);
      let mtxLocal: TransformationData[] = data?.mtxLocal;
      let mtxWorld: TransformationData[] = data?.mtxWorld;

      let source: string = ShaderParticle.getVertexShaderSource()
        .replace("/*$variables*/", RenderInjectorParticleEffect.generateVariables(data?.variables))
        .replace("/*$mtxLocal*/", RenderInjectorParticleEffect.generateTransformations(mtxLocal, "Local"))
        .replace("/*$mtxLocal*/", mtxLocal && mtxLocal.length > 0 ? "* mtxLocal" : "")
        .replace("/*$mtxWorld*/", RenderInjectorParticleEffect.generateTransformations(mtxWorld, "World"))
        .replace("/*$mtxWorld*/", mtxWorld && mtxWorld.length > 0 ? "mtxWorld *" : "")
        .replace("/*$color*/", RenderInjectorParticleEffect.generateColor(data?.color));
      return source; 
    }

    public static getFragmentShaderSource(this: ParticleEffect): string {
      return ShaderParticle.getFragmentShaderSource();
    }
    
    //#region code generation
    private static renameVariables(_data: ParticleEffectData): ParticleEffectData {
      let variableMap: {[key: string]: string} = {};
      Object.keys(_data.variables).forEach( (_variableName, _index) => {
        if (RenderInjectorParticleEffect.PREDEFINED_VARIABLES[_variableName])
          throw `Error in ${ParticleEffect.name}: "${_variableName}" is a predefined variable and can not be redeclared`;
        else
          return variableMap[_variableName] = `fVariable${_index}`; 
      });

      let dataRenamed: ParticleEffectData = JSON.parse(JSON.stringify(_data));
      dataRenamed.variables = Object.fromEntries(Object.entries(dataRenamed.variables).map( ([_name, _exrpession]) => [variableMap[_name], _exrpession] ));
      renameRecursive(dataRenamed);
      return dataRenamed;

      function renameRecursive(_data: ParticleEffectData): void {
        if (ParticleEffect.isVariableData(_data)) {
          let newName: string = RenderInjectorParticleEffect.PREDEFINED_VARIABLES[_data.name] || variableMap[_data.name];
          if (newName)
            _data.name = newName;
          else
            throw `Error in ${ParticleEffect.name}: "${newName}" is not a defined variable`;
        } else {
          for (const key in _data) {
            if (typeof _data[key] == "string")
              continue;
            else
              renameRecursive(_data[key]);
          }
        }
      }
    } 

    private static generateVariables(_variables: {[name: string]: ExpressionData}): string {
      return Object.entries(_variables)
        .map( ([_variableName, _expressionTree]): [string, string] => [_variableName, RenderInjectorParticleEffect.generateExpression(_expressionTree)] )
        .map( ([_variableName, _code]): string => `float ${_variableName} = ${_code};` )
        .reduce( (_accumulator: string, _code: string) => `${_accumulator}\n${_code}`, "" );
    }

    private static generateTransformations(_transformations: TransformationData[], _localOrWorld: "Local" | "World"): string {
      if (!_transformations || _transformations.length == 0) return "";

      type Transformation = "translate" | "rotate" | "scale"; // TODO: maybe extract this from TransformationData eg. Pick<TransformationData, "transformation">;
      type CodeTransformation = [Transformation, string, string, string];

      let transformations: CodeTransformation[] = _transformations
        .map( (_data: TransformationData): CodeTransformation => {
          let isScale: boolean = _data.transformation === "scale";
          let [x, y, z] = [_data.x, _data.y, _data.z]
            .map( (_value) => _value ? RenderInjectorParticleEffect.generateExpression(_value) : (isScale ? "1.0" : "0.0") ) as [string, string, string];

          return [_data.transformation, x, y, z];
        });

      let code: string = "";
      code += transformations
        .map( ([_transformation, _x, _y, _z]: CodeTransformation, _index: number) => {
          if (_transformation == "rotate") {
            let sin: (_value: string) => string = (_value: string) => _value == "0.0" ? "0.0" : `sin(${_value})`;
            let cos: (_value: string) => string = (_value: string) => _value == "0.0" ? "1.0" : `cos(${_value})`;

            return `float fSinX${_index} = ${sin(_x)};
              float fCosX${_index} = ${cos(_x)};
              float fSinY${_index} = ${sin(_y)};
              float fCosY${_index} = ${cos(_y)};
              float fSinZ${_index} = ${sin(_z)};
              float fCosZ${_index} = ${cos(_z)};\n`;
          } else
            return "";
        })
        .filter( (_transformation: string) => _transformation != "")
        .reduce( (_accumulator: string, _code: string) => `${_accumulator}\n${_code}`, "" );
      code += "\n";
      
      code += `mat4 mtx${_localOrWorld} = `;
      code += transformations
        .map( ([_transformation, _x, _y, _z]: CodeTransformation, _index: number) => {
          switch (_transformation) {
            case "translate":
              return `mat4(
              1.0, 0.0, 0.0, 0.0,
              0.0, 1.0, 0.0, 0.0,
              0.0, 0.0, 1.0, 0.0,
              ${_x}, ${_y}, ${_z}, 1.0)`;
            case "rotate":
              return `mat4(
              fCosZ${_index} * fCosY${_index}, fSinZ${_index} * fCosY${_index}, -fSinY${_index}, 0.0,
              fCosZ${_index} * fSinY${_index} * fSinX${_index} - fSinZ${_index} * fCosX${_index}, fSinZ${_index} * fSinY${_index} * fSinX${_index} + fCosZ${_index} * fCosX${_index}, fCosY${_index} * fSinX${_index}, 0.0,
              fCosZ${_index} * fSinY${_index} * fCosX${_index} + fSinZ${_index} * fSinX${_index}, fSinZ${_index} * fSinY${_index} * fCosX${_index} - fCosZ${_index} * fSinX${_index}, fCosY${_index} * fCosX${_index}, 0.0,
              0.0, 0.0, 0.0, 1.0
              )`;
            case "scale":
              return `mat4(
              ${_x}, 0.0, 0.0, 0.0,
              0.0, ${_y}, 0.0, 0.0,
              0.0, 0.0, ${_z}, 0.0,
              0.0, 0.0, 0.0, 1.0
              )`;
            default:
              throw `Error in ${ParticleEffect.name}: "${_transformation}" is not a transformation`;    
          }
        })
        .reduce( (_accumulator: string, _code: string) => `${_accumulator} * \n${_code}`);
      code += ";\n";

      return code;
    }

    private static generateColor(_color: {r?: ExpressionData, g?: ExpressionData, b?: ExpressionData, a?: ExpressionData}): string {
      let [r, g, b, a]: [string, string, string, string] = [_color.r, _color.g, _color.b, _color.a]
        .map( (_value): string => _value ? RenderInjectorParticleEffect.generateExpression(_value) : "1.0" ) as [string, string, string, string];
        
      return `v_vctColor = vec4(${r}, ${g}, ${b}, ${a});`;
    }

    private static generateExpression(_expression: ExpressionData): string {
      if (ParticleEffect.isFunctionData(_expression)) {
        let parameters: string[] = [];
        for (let param of _expression.parameters) {
          parameters.push(RenderInjectorParticleEffect.generateExpression(param));
        }
        return RenderInjectorParticleEffect.generateFunction(_expression.function, parameters);
      }
  
      if (ParticleEffect.isVariableData(_expression)) {
        return _expression.name;
      } 
  
      if (ParticleEffect.isConstantData(_expression)) {
        let value: string = _expression.value.toString();
        return `${value}${value.includes(".") ? "" : ".0"}`;
      }
  
      throw `Error in ${ParticleEffect.name}: invalid node structure in particle effect serialization`;
    }
  
    private static generateFunction(_function: string, _parameters: string[]): string {
      if (_function in RenderInjectorParticleEffect.FUNCTIONS)
        return RenderInjectorParticleEffect.FUNCTIONS[_function](_parameters);
      else
        throw `Error in ${ParticleEffect.name}: "${_function}" is not an operation`;
    }
    //#endregion
  }
}