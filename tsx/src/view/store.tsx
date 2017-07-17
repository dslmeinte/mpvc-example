import { observer } from 'mobx-react';
import * as React from 'react';

import { Controller } from '../controller';
import { Store } from '../store';
import { ElementViewComponent } from './element';


@observer
export class StoreViewComponent extends React.Component<{ store: Store; controller: Controller; }, {}> {

    render() {
        const markerSize = 7;
        const {controller, store} = this.props;
        return (
            <div
                onClick={e => controller.select(undefined)}
            >
                <svg
                    width="100%"
                    height="80%"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <defs>
                        <marker id="arrow" markerWidth={markerSize} markerHeight={markerSize} refX="6" refY="2" orient="auto" markerUnits="strokeWidth">
                            <path d="M0,0 L0,4 L6,2 z" fill="black" />
                        </marker>
                    </defs>
                    {store.projection.map((element, index) => <ElementViewComponent element={element} controller={controller} key={"" + index} />)}
                </svg>
                <button onClick={e => controller.createNew()}>Create new node</button>
                <button onClick={e => controller.deleteSelection()} disabled={store.selection === undefined}>Delete selection</button>
            </div>
        );
    }

}
