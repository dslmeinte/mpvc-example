import { action } from 'mobx';

import { Point } from './model';
import { Edge, ProjectedVertex } from './projection';
import { Selection, Store } from './store';


export class Controller {

    constructor(private readonly store: Store) {}

    @action select(selection: Selection) {
        this.store.selection = selection;
    }

    @action createNew() {
        this.store.model.makeVertex(Math.random() * 500, Math.random() * 500);
    }

    @action deleteSelection() {
        const {selection} = this.store;
        if (selection instanceof ProjectedVertex) {
            this.store.model.removeVertexById(selection.id);
            this.store.selection = undefined;
        }
        if (selection instanceof Edge) {
            this.store.model.vertexById(selection.fromVertex.id)!.removeEdge(selection.toVertex.id);
            this.store.selection = undefined;
        }
    }

    @action setPosition(vertex: ProjectedVertex, position: Point) {
        this.store.model.vertexById(vertex.id)!.position = position;
    }

    @action handleMouseDown(vertex: ProjectedVertex, dragStartPosition: Point) {
        if (this.store.dragState === undefined) {
            this.store.dragState = { vertex, offset: dragStartPosition.minus(vertex.position) };
        }
    }

    @action handleMouseMove(currentPosition: Point) {
        const {dragState} = this.store;
        if (dragState !== undefined) {
            this.store.model.vertexById(dragState.vertex.id)!.position = currentPosition.minus(dragState.offset);
        }
    }

    @action handleMouseUp(currentPosition: Point) {
        if (this.store.dragState !== undefined) {
            this.handleMouseMove(currentPosition);
            this.store.dragState = undefined;
        }
    }

}
