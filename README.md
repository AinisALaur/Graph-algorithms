# Graph algorithms

## Table of Contents
- [About](#about)
- [Installation](#installation)
- [Usage](#usage)
  - [Options and basic information](#options-and-basic-information)
  - [Algorithms](#algorithms)
- [License](#license)

## About
This is a project that allows the user to visualize various graphs and run 4 different algorithms: find the shortest path between two selected nodes, find the overall longest path, determine whether a Hamiltonian cycle is present - if so, visualize the nodes that make it exist, and an algorithm that finds the chromatic number for a graph and colors the nodes.

## Installation
Download all files and run the index.html file

## Usage
### Options and basic information
To initialize a new node, click anywhere on the canvas (at first, an empty rectangle). All nodes are labeled with their instance number. To connect two nodes, click on both of them - this will highlight the first one, and once the second one is "highlighted", a line joining them will appear. To delete a node, click the "Delete node" button. Once it turns red, click all the nodes that need to be deleted. Once finished, click the button again to disable "delete" mode. If a fresh canvas is needed, the "Clear canvas" button does just that. The color of the nodes can be changed momentarily with the color palette disguised as a button "Nodecolor". The "Export adj. matrix" button shows the adjacency matrix for the displayed graph.

### Algorithms
1. Shortest path: to begin, click the "Shortest path - A*" button - it will turn green, showing that it requires two nodes to be selected for it to determine the shortest path between them. If a path is present it will be highlighted.

2. Vertex coloring: the nodes change color in a way that no two adjacent nodes are of the same color. The colors are completely random; thus, the graph will look different each time the button is pressed.

3. Hamiltonian cycle: a path will be highlighted if a Hamiltonian cycle exists in the graph (a Hamiltonian cycle is a path that visits each vertex once and returns to the starting vertex)

4. Longest path: if any path exists, the algorithm will highlight the longest one.

**To quit the effects of any algorithm, click anywhere beside the button itself**

## License
This project currently has no license assigned. All rights reserved until a license is chosen.

