import { findIndex, sortBy } from 'lodash';
import { action, observable } from 'mobx';


export class Point {

    constructor(public readonly x: number, public readonly y: number) {}

    minus = (p2: Point): Point => this.scalar(-1, p2);

    get norm(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    scalar = (t: number, p2: Point): Point => new Point(this.x + t * p2.x, this.y + t * p2.y);

}


export class Vertex {

    /** ID, also used as display name. */
    constructor(public readonly id: number, x: number, y: number) {
        this.position = new Point(x, y);
    }

    /** The IDs of the vertices connected on outgoing edges. */
    toIds = observable.array<number>([]);

    @observable position: Point;

    connect(...toVertices: Vertex[]): void {
        toVertices.forEach(toVertex => this.toIds.push(toVertex.id));
    }

    @action removeEdge(toId: number): void {
        const index = this.toIds.indexOf(toId);
        if (index >= 0) {
            this.toIds.splice(index, 1);
        }
    }

}


export class Model {

    readonly vertices = observable.array<Vertex>([]);

    vertexById = (id: number): Vertex | undefined => this.vertices.find(vertex => vertex.id === id);

    makeVertex(x: number, y: number): Vertex {
        const lowestMissingIndex = findIndex(sortBy(this.vertices, vertex => vertex.id), (vertex, index) => vertex.id > index + 1);
        const newId = 1 + ((lowestMissingIndex === -1) ? this.vertices.length : lowestMissingIndex);
        const vertex = new Vertex(newId, x, y);
        this.vertices.push(vertex);
        return vertex;
    }

    @action removeVertexById(id: number): void {
        const index = this.vertices.findIndex(vertex => vertex.id === id);
        if (index >= 0) {
            this.vertices.forEach(vertex => {
                vertex.toIds.remove(id);
            });
            this.vertices.splice(index, 1);
        }
    }

}


export const exampleModel = new Model();

const vertex1 = exampleModel.makeVertex(100, 100);
const vertex2 = exampleModel.makeVertex(175, 200);
const vertex3 = exampleModel.makeVertex(325, 200);
const vertex4 = exampleModel.makeVertex(400, 100);
vertex1.connect(vertex2, vertex4);
vertex2.connect(vertex3);
vertex3.connect(vertex4);

