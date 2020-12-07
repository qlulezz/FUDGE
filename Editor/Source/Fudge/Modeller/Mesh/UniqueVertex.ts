namespace Fudge {
  export class UniqueVertex {
    public position: ƒ.Vector3;
    // key is the index of the vertex in the vertices array, value is the position of the key in the indices
    public indices: Map<number, number[]>;
    public face: number;

    constructor(_position: ƒ.Vector3, _indices: Map<number, number[]>) {
      this.position = _position;
      this.indices = _indices;
    }
  }
}