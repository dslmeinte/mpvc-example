import { observable } from 'mobx';

import { Model, Point } from './model';
import { Element, ProjectedVertex, Projection, projectStore } from './projection';


/**
 * Store === Directed Graph Model + View State
 */
export class Store {

    constructor(model: Model) {
        this.model = model;
        this.selection = undefined;
        this.dragState = undefined;
    }

    @observable readonly model: Model;
    @observable selection: Selection;
    @observable dragState: DragState;

    get projection(): Projection {
        return projectStore(this);
    }

}


export type Selection = Element | undefined;


export interface IDragState {
    vertex: ProjectedVertex;
    offset: Point;
}

export type DragState = IDragState | undefined;

