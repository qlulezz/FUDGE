namespace FudgeCore {

  /**
   * Buffers the data from the {@link MeshSkin} into a WebGL Buffer
   * @internal
   */
  export class RenderInjectorMeshSkin extends RenderInjectorMesh {

    public static decorate(_constructor: Function): void {
      Object.defineProperty(_constructor.prototype, "useRenderBuffers", {
        value: RenderInjectorMeshSkin.useRenderBuffers
      });
      Object.defineProperty(_constructor.prototype, "getRenderBuffers", {
        value: RenderInjectorMeshSkin.getRenderBuffers
      });
      Object.defineProperty(_constructor.prototype, "deleteRenderBuffers", {
        value: RenderInjectorMeshSkin.deleteRenderBuffers
      });
    }

    protected static getRenderBuffers(this: MeshSkin, _shader: typeof Shader): RenderBuffers {
      let renderBuffers: RenderBuffers = super.getRenderBuffers.call(this, _shader);
      const crc3: WebGL2RenderingContext = RenderWebGL.getRenderingContext();

      if (!renderBuffers.bones) {
        renderBuffers.bones = RenderWebGL.assert(crc3.createBuffer());
        crc3.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, renderBuffers.bones);
        crc3.bufferData(WebGL2RenderingContext.ARRAY_BUFFER, this.renderMesh.bones, WebGL2RenderingContext.STATIC_DRAW);
      }

      if (!renderBuffers.weights) {
        renderBuffers.weights = RenderWebGL.assert(crc3.createBuffer());
        crc3.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, renderBuffers.weights);
        crc3.bufferData(WebGL2RenderingContext.ARRAY_BUFFER, this.renderMesh.weights, WebGL2RenderingContext.STATIC_DRAW);
      }

      return renderBuffers;
    }

    protected static useRenderBuffers(this: MeshSkin, _shader: typeof Shader, _mtxMeshToWorld: Matrix4x4, _mtxMeshToView: Matrix4x4, _id?: number): RenderBuffers {
      let renderBuffers: RenderBuffers = super.useRenderBuffers.call(this, _shader, _mtxMeshToWorld, _mtxMeshToView, _id);
      const crc3: WebGL2RenderingContext = RenderWebGL.getRenderingContext();

      const aBone: number = _shader.attributes["a_vctBones"];
      if (aBone) {
        crc3.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, renderBuffers.bones);
        crc3.enableVertexAttribArray(aBone);
        crc3.vertexAttribIPointer(aBone, 4, WebGL2RenderingContext.UNSIGNED_BYTE, 0, 0);
      }

      const aWeight: number = _shader.attributes["a_vctWeights"];
      if (aWeight) {
        crc3.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, renderBuffers.weights);
        crc3.enableVertexAttribArray(aWeight);
        crc3.vertexAttribPointer(aWeight, 4, WebGL2RenderingContext.FLOAT, false, 0, 0);
      }

      return renderBuffers;
    }

    protected static deleteRenderBuffers(_renderBuffers: RenderBuffers): void {
      super.deleteRenderBuffers(_renderBuffers);
      const crc3: WebGL2RenderingContext = RenderWebGL.getRenderingContext();

      if (_renderBuffers) {
        crc3.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, null);
        crc3.deleteBuffer(_renderBuffers.bones);
        crc3.deleteBuffer(_renderBuffers.weights);
      }
    }

  }
}