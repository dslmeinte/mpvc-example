import { observer } from 'mobx-react';
import * as React from 'react';

import { Controller } from '../controller';
import { Point } from '../model';
import { Edge, Element, ProjectedVertex, Style } from '../projection';


const edgeRadius = 24;

@observer
export class ElementViewComponent extends React.Component<{ element: Element; controller: Controller; }, {}> {

    render() {
        const {element, controller} = this.props;
        if (element instanceof ProjectedVertex) {
            const clientPosition = (e: React.MouseEvent<any>) => new Point(e.clientX, e.clientY);
            return (
                <g
                    className={"vertex " + Style[element.style]}
                    transform={`translate(${element.position.x}, ${element.position.y})`}
                    onClick={this.clickHandler()}
                    onMouseDown={e => controller.handleMouseDown(element, clientPosition(e))}
                    onMouseUp={e => controller.handleMouseUp(clientPosition(e))}
                    onMouseMove={e => controller.handleMouseMove(clientPosition(e))}
                >
                    <circle cx={0} cy={0} r={edgeRadius}></circle>
                    <text x={0} y={6} textAnchor="middle">{"" + element.id}</text>
                </g>
            );
        } else if (element instanceof Edge) {
            const line = computeLine(element);
            if (line === null) {
                return null;
            }
            const [Q1, Q2] = line;
            return (
                <line
                    className={"edge " + Style[element.style]}
                    x1={Q1.x} y1={Q1.y}
                    x2={Q2.x} y2={Q2.y}
                    markerEnd="url(#arrow)"
                    onClick={this.clickHandler()}
                >
                </line>
            );
        }
        throw new Error(`element not handled: ${JSON.stringify(element, null, 2)}`);
    }

    private clickHandler(): (e: React.MouseEvent<any>) => void {
        return e => {
            e.stopPropagation();
            this.props.controller.select(this.props.element);
        };
    }

}


/*
 * Given two points P1, P2 and a radius r, we need to calculate a line segment connecting P1 and P2 but precisely "missing" the spheres centered in Pi with radius r.
 * 
 * Set V := P2 - P1, then we give a line as l(t) = P1 + V t and we need to calculate t1, t2 such that { l(t) | t1 < t < t2 } is the desired line segment.
 * This means: || l(ti) - Pi || = r, for i = 1, 2.
 * || l(t1) - P1 || = || V t1 || = r <==> t1 = r / || V ||
 * 
 * Because of symmetry: t2 = 1 - t1.
 * Check: l(t2) - P2 = V (1 - t1) + P1 - P2 = (P2 - P1) (1 - t1) - (P2 - P1) = (1 - t1 - 1)(P2 - P1) = -t1 V, and take norms.
 * 
 * Alternatively, consider l(t) with 0 <= t <= 1 as traveling with fixed speed ||V|| so that crossing the circle takes "time" r/||V||.
 */
function computeLine(edge: Edge): [ Point, Point ] | null {
    const P1 = edge.fromVertex.position;
    const P2 = edge.toVertex.position;
    const V = P2.minus(P1);
    if (V.norm < 0.1) {
        return null;
    }
    const t1 = edgeRadius / V.norm;
    const t2 = 1 - t1;
    return [ P1.scalar(t1, V), P1.scalar(t2, V) ];
}

