import { flatMap } from 'lodash';

import { Point, Vertex } from './model';
import { Selection, Store } from './store';


export enum Style {
    none, selected, highlighted
}

export abstract class Element {
    constructor(protected readonly selection: Selection) {}
    abstract get style(): Style;
}


export class ProjectedVertex extends Element {

    id: number;
    position: Point;

    constructor(vertex: Vertex, selection: Selection) {
        super(selection);
        this.id = vertex.id;
        this.position = vertex.position;
    }

    equals = (other: ProjectedVertex): boolean => this.id === other.id;

    get style(): Style {
        const {selection} = this;
        if (selection instanceof ProjectedVertex) {
            return this.equals(selection) ? Style.selected : Style.none;
        }
        if (selection instanceof Edge) {
            return this.equals(selection.fromVertex) || this.equals(selection.toVertex) ? Style.highlighted : Style.none;
        }
        // selection === undefined:
        return Style.none;
    }

}


export class Edge extends Element {

    constructor(public readonly fromVertex: ProjectedVertex, public readonly toVertex: ProjectedVertex, selection: Selection) {
        super(selection);
    }

    equals = (other: Edge): boolean => this.fromVertex.id === other.fromVertex.id && this.toVertex.id === other.toVertex.id;

    get style(): Style {
        const {selection} = this;
        if (selection instanceof ProjectedVertex) {
            return this.fromVertex.id === selection.id || this.toVertex.id === selection.id ? Style.highlighted : Style.none;
        }
        if (selection instanceof Edge) {
            return this.equals(selection) ? Style.selected : Style.none;
        }
        // selection === undefined:
        return Style.none;
    }

}


export type Projection = Element[];


export function projectStore(store: Store): Projection {
    const {selection, model} = store;

    const projectedVerticesMap: { [strVertexId: string]: ProjectedVertex } = {};
    function projectVertex(vertex: Vertex): ProjectedVertex {
        const strVertexId = "" + vertex.id;
        if (strVertexId in projectedVerticesMap) {
            return projectedVerticesMap[strVertexId];
        }
        return (projectedVerticesMap[strVertexId] = new ProjectedVertex(vertex, selection));
    }

    const projectedVertices = model.vertices.map(projectVertex);
    const edges = flatMap(model.vertices, fromVertex =>
        fromVertex.toIds.map(toId => new Edge(projectVertex(fromVertex), projectVertex(model.vertexById(toId)!), selection))
    );
    return [...projectedVertices, ...edges];
}

