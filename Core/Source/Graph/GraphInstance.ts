namespace FudgeCore {
  /**
   * An instance of a {@link Graph}.  
   * This node keeps a reference to its resource an can thus optimize serialization
   * @author Jirka Dell'Oro-Friedl, HFU, 2019
   * @link https://github.com/JirkaDellOro/FUDGE/wiki/Resource
   */
  export class GraphInstance extends Node {
    /** id of the resource that instance was created from */
    // TODO: examine, if this should be a direct reference to the Graph, instead of the id
    #idSource: string = undefined;

    /**
     * This constructor allone will not create a reconstruction, but only save the id.
     * To create an instance of the graph, call reset on this or set with a graph as parameter.
     * Prefer Project.createGraphInstance(_graph).
     */
    constructor(_graph?: Graph) {
      super("Graph");
      if (!_graph)
        return;
      this.#idSource = _graph.idResource;
    }

    public get idSource(): string {
      return this.#idSource;
    }

    /**
     * Recreate this node from the {@link Graph} referenced
     */
    public async reset(): Promise<void> {
      let resource: Graph = <Graph>await Project.getResource(this.#idSource);
      await this.set(resource);
    }

    //TODO: optimize using the referenced Graph, serialize/deserialize only the differences
    public serialize(): Serialization {
      let serialization: Serialization = super.serialize();
      serialization.idSource = this.#idSource;
      return serialization;
    }

    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      this.#idSource = _serialization.idSource;
      await super.deserialize(_serialization);
      if (this.get())
        this.connectToGraph();
      else
        Project.registerGraphInstanceForResync(this);
      return this;
    }

    public connectToGraph(): void {
      let graph: Graph = this.get();
      graph.addEventListener(EVENT.MUTATE, () => console.log("MUTATION"));
    }

    /**
     * Set this node to be a recreation of the {@link Graph} given
     */
    public async set(_graph: Graph): Promise<void> {
      // TODO: examine, if the serialization should be stored in the Graph for optimization <- also useful for sync with instances
      let serialization: Serialization = Serializer.serialize(_graph);
      //Serializer.deserialize(serialization);
      for (let path in serialization) {
        await this.deserialize(serialization[path]);
        break;
      }
      this.#idSource = _graph.idResource;
      this.dispatchEvent(new Event(EVENT.GRAPH_INSTANTIATED));
    }

    /**
     * Retrieve the graph this instances refers to
     */
    public get(): Graph {
      return <Graph>Project.resources[this.#idSource];
    }
  }
}