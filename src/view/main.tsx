import * as React from "react";
import { render } from "react-dom";

import { Controller } from '../controller';
import { exampleModel } from '../model';
import { Store } from '../store';
import { StoreViewComponent } from './store';


const store = new Store(exampleModel);
const controller = new Controller(store);

render(
    <StoreViewComponent store={store} controller={controller} />,
    document.getElementById("root") !
);

