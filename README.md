# README

This repository holds all the source for the example used in my [MPVC Pattern blog](...).
Two implementations are provided: one in TypeScript (using TSX, under `tsx/`) as well as one in the [Elm language](http://elm-lang.org/) (under `elm`)
    - note that the latter is still under construction.


## Installation

The TypeScript implementation requires [Node.js](https://nodejs.org/) and either [NPM](https://www.npmjs.com/) (comes installed with Node.js) or [Yarn](https://yarnpkg.com/).
(I'll assume NPM from now on, and assume you can translate to Yarn yourself.)
Run `npm i` in `tsx/`, and then `npm start` to build and start the example application on [`http://localhost:9000/`](http://localhost:9000/).
By running `npm run watch` next to it, you can adjust the code and build it incrementally - I didn't set up hot reloading, though.

