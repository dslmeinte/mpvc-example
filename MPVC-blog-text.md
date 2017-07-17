# The MPVC Pattern

Provocative sub title: "MVC isn't dead, it just needs a P" ;)

The Model-View-Controller Pattern has been around for a long time - long enough in fact to remember the years of Reagan's White House residency.
It has been often derided as being old-fashioned, too strict, or plain wrong, but that hasn't stopped it from surviving this far.
When you use an allegedly "competing" Pattern like MVP, there's a good chance you could still recognise good'ole MVC in your code.

In case you weren't told a gazillion times yet: the MVC Pattern separates the concern of the *Model* (i.e., the raw data which drive the UI and UX of your application), the *View* (i.e., the actual visualisation of that raw data), and the *Controller* (i.e., the component that translates events fired from the UI into changes to the Model).
Separation of Concerns is good thing, right?
A framework like Angular forces you to separate the View from the other two by specifying the component and HTML DOM most comfortably in a separate file.

In recent times, I've been making a number of applications using React and [MobX](https://mobx.js.org/).
React seems to be a bit "anti-MVC": it totally allows you to clobber together the V and C with impunity by writing both in the JSX (or TSX, for the Typescript aficionados) side-by-side - on the same line even, if that so pleases you.
It takes a bit of discipline to use that awesome power with responsibility, but doesn't writing software require that in any case?
Also, React advocates using *Components*, but if you map concepts in your Model to components in a 1-to-1 fashion -which is usually quite natural do to- then your View cannot end up to be too dissimilar from your Model.

Those applications I've been making happen to have Views that are often quite far removed from the Model, and where local changes (i.e., changes to a single piece of data in the Model) cause much bigger, global changes in the View.
This comes about mostly because of relationships between Model elements which are not 1st-class, but are expressed through attributes on those Model elements.
Single Model elements, and combinations thereof, give rise to several elements in the View which all have behaviour and although they can be traced back to the Model, it's not very comfortable to do so.

As an example, I'll be taking a rather simple example Model: a directed graph of vertices, with the edges encoded on the vertices as an array of IDs.
In pseudo-code, with all the gnarly, and non-essential bits summarised and/or removed: [`model-essence.ts`](https://gist.github.com/dslmeinte/37783be232f7da4d1ff1f63cfd22f32f)
The View will allow the user to select vertices, in which case all connected edges (outgoing as well as incoming) will be highlighted, as well as edges, in which case all connected vertices (again, regardless of direction) will be highlighted.
Note that the edges are not 1st-class citizens of the Model, but seem to be in the View.

For the [implementation in React](https://github.com/dslmeinte/mpvc-example/tree/master/tsx), this means that writing a Component for every concept in the Model is not a very good fit.
Do you render the edges in one of the Model pieces involved?
How do you compute or look up the visual position of the other end of an edge, in order to actually draw it?

Instead, you rather reify those edges (and other "virtual" View elements for your particular situation) into things which have essentially a 1st-class feel to their existence.
In other words, you could do with a View of the Model which is not the actual View yet.
Or you could say that the Model needs a Model between it and the View.
In any case, I'm going ahead and propose to call both things the **Projection** which makes this new/extended Pattern the MPVC Pattern.
(I think that's a better, less scary name than the one [proposed here](https://github.com/danielearwicker/bidi-mobx/issues/5#issuecomment-274367997).)
You can find pseudo-code for the Projection for our case in this Gist: [`projection-essence.ts`](https://gist.github.com/dslmeinte/d8f0777201226799eb97e07848efcbda)

Model &rarr; Projection &rarr; View &rarr; Controller, which alters the Model through *actions*

Given the recent upswing of Functional and Reactive Programming, it'd be the popular thing to make as many of those arrows pure functions.
Not only are pure functions much easier to reason about in universe where UI events can be fired from any place and at any time, it's also a good fit with the MobX framework.
The combination of React and MobX essentially forces you to do the View in a FP-style, with the upshot that it rewards you with transparent reactivity and performance.

One feature of React+MobX is that Components need to be *stateless*, meaning they hold no local state of their own and their `render()` functions are pure in terms of their input data, passed through React's *props* parameter rather than the *state* parameter.
At first, this seems to complicate matters for View behavior which gels with local state quite naturally: editing an element -such as changing its position on the screen under dragging- is effectively preparing a Model change, and the data for that preparation would be the local state of the element's Component.
However, it's not guaranteed that local state is always enough, in which case you need to put that edit state somewhere else.

But where?
A sensible thing to do is to replace your original Model with Model + *View State*.
In our case, this boils down to:
Model = Graph Model + View State, with View State consisting of the element (vertex or edge) that's currently selected (if any), as well as which vertex happens to be currently dragged (if any).
In using MobX, it's quite natural to use the term *Store* for all of the state, so I used that in the code instead of Model.
Pseudo-code for the Store can be found in this Gist: [`store-essence.ts`](https://gist.github.com/dslmeinte/07199cfaefe2ced89ad90422ad50d06d)

All the more intricate logic of interpreting the Model into a larger number of 1st-class concepts than it originally had, and weaving the View State in in a meaningful way, falls to the arrow between the Model and Projection, implemented in [one pure JavaScript function](https://github.com/dslmeinte/mpvc-example/blob/master/tsx/src/projection.ts#L71).
The View then consists of a number of stateless Components corresponding directly to the concepts in the Projection which has been expanded from just Vertex to (projected) Vertex and Edge, with abstract super type Element.
Each Component is quite simple: passed Projection data is rendered to the DOM with nothing more than trivial computations, and event handlers should call into the passed Controller without further ado.
The Controller has some awareness of the Projection since it's OK (and natural) for the View to communicate with the Controller in terms of the "virtual" concepts in the Projection.

This example -especially in its [actual implementation](https://github.com/dslmeinte/mpvc-example/tree/master/tsx/src)- shows that the MPVC Pattern allows a readable and maintainable solution for a simple, but not-entirely trivial problem such as rendering and editing a model of a directed graph.

