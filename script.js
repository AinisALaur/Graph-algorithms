//Global variables for drawing logic
let nodes = new Map();
let highlightedNodes = new Set();
let neighbours = new Map();
let nodeId = 0;

//Global variables for algorithms and settings
let matrixIsDisplayed = false;
let deleteIsClicked = false;
const colorPicker = document.getElementById('colorPicker');
let shortestPathButtonClicked = false;
let hamiltonianCycleButtonClicked = false;
let highlightedLines = new Set();
let nodesAreMarked = false;
let justClicked = false;

//Global variables for colors
let highlightedBorderColor = "#ecc826";
let highlightedAlgColor = "#5fcf53";
let defaultButtonColor = "#FCFCFD";
let deleteButtonColor = "#de1f38";
let shortestPathButtonColor = "#5fcf53";
let defaultLineColor = "black";
let defaultTextColor = "#36395A";


//Everything with coordinates
function getMousePos(event) {
    //const zoom = window.devicePixelRatio;
    let x = event.pageX;// / zoom;
    let y = event.pageY;// / zoom;
    return [x,y];
}

function getDistance(x1, y1, x2, y2){
    let x = x1 - x2;
    let y = y1 - y2;
    return Math.sqrt(x*x + y*y);
}

function isOverlaping(x1, y1){
    for(let [key, value] of nodes){
        let coordinates = value;
        let x2 = coordinates[0];
        let y2 = coordinates[1]; 

        if(getDistance(x1,y1,x2,y2) < 60){
            return true;
        }
    }
    return false;
}

function getNodeId(x1, y1){
    for(let [key, value] of nodes){
        let coordinates = value;
        let x2 = coordinates[0];
        let y2 = coordinates[1]; 

        if(getDistance(x1,y1,x2,y2) < 50){
            return key;
        }
    }
}

function isInBounds(x, y){
    var offsets = document.getElementById('Canvas').getBoundingClientRect();
    var top = offsets.top;
    var left = offsets.left;
    var right = offsets.right;
    var bottom = offsets.bottom;

    if(x > left + 5 && x < right - 50 && y > top - 15 && y < bottom - 80){
        return true;
    }
    return false;
}

function useCoords(event){
    if(matrixIsDisplayed){
        return;
    }

    if(highlightedLines.size > 0 || nodesAreMarked){
        changeColors();
        deHighlightLines();
        deHighlightNodes();
        nodesAreMarked = false;
        return;
    }

    const coords = getMousePos(event);
    let x = coords[0] - 25;
    let y = coords[1] - 50;

    if(isOverlaping(x,y) == false && isInBounds(x, y) && !deleteIsClicked){
        nodes.set(nodeId, [x,y]);
        drawNewNode(x,y);
    }
    
    else{
        if(isInBounds(x, y)){
            let id = getNodeId(x, y);
            highlightNode(id);
            if(highlightedNodes.size == 2){
                connectHighlighted();
            }
        }
    }
}

//Drawing and highlighting
function drawNewNode(x, y){
    if(shortestPathButtonClicked){
        return;
    }

    const newNode = document.createElement("div");
    const newContent = document.createTextNode(nodeId + 1);
    let newId = nodeId;
    ++nodeId;
    newNode.appendChild(newContent);

    newNode.classList.add('Node');
    newNode.id = newId; 

    newNode.style.position = "absolute";
    newNode.style.left = x + 'px';
    newNode.style.top = y + 'px';
    newNode.style.backgroundColor = colorPicker.value;

    const parent = document.getElementById("Canvas");
    parent.appendChild(newNode);

    //if a node is already higlighted, when placing a new one - connect them
    if(highlightedNodes.size == 1){
        const id = highlightedNodes.values().next().value;
        connectNodes(id, newId); 
    }
}

function deHighlightNode(id){
    const node = document.getElementById(id);
    if (typeof id === 'undefined')
        return ;
    node.style.border = "none";
    highlightedNodes.delete(id);
}

function highlightNode(id){
    if (typeof id === 'undefined')
        return ;

    let borderColor = highlightedBorderColor;

    //different highlight color if any of the buttons are pressed
    if(shortestPathButtonClicked || nodesAreMarked){
        borderColor = highlightedAlgColor;
    }

    if(highlightedNodes.has(id) == false){
        if(deleteIsClicked){
            deleteNode(id);
        }else{
            const node = document.getElementById(id);
            node.style.border = `3px solid ${borderColor}`;
            highlightedNodes.add(id);
        }
    }else{
        deHighlightNode(id);
    }
}

function connectHighlighted(){
    const ids = [];

    for(const id of highlightedNodes){
        ids.push(id);
        deHighlightNode(id);
        highlightedNodes.delete(id);
    }

    if(shortestPathButtonClicked){
        aStar(ids[0], ids[1]);
        shortestPathPressed();
    }else{
        connectNodes(ids[0], ids[1]);   
    }
}

function connectNodes(id1, id2){
    if(neighbours.has(id1) && neighbours.get(id1).includes(id2))
        return;
    
    if (!neighbours.has(id1)) neighbours.set(id1, []);
    if (!neighbours.has(id2)) neighbours.set(id2, []);

    neighbours.get(id1).push(id2);
    neighbours.get(id2).push(id1);

    let coordinates1 = nodes.get(id1);
    let coordinates2 = nodes.get(id2);

    let x1 = coordinates1[0];
    let y1 = coordinates1[1];
    let x2 = coordinates2[0];
    let y2 = coordinates2[1];

    let length = getDistance(x1, y1, x2, y2);
    const newLine = document.createElement("div");
    let minId = Math.min(id1, id2);
    let maxId = Math.max(id1, id2);
    newLine.id = `Line${minId}${maxId}`;

    newLine.style.width = length + "px";
    newLine.style.height = "2px";
    newLine.style.backgroundColor = defaultLineColor;
    newLine.style.zIndex = "-1";

    newLine.style.position = "absolute";

    if(x2 < x1){
        let tempX = x2;
        x2 = x1;
        x1 = tempX;

        let tempY = y2;
        y2 = y1;
        y1 = tempY;
    }

    let angle = Math.atan(Math.abs(y1 - y2) / Math.abs(x1 - x2));

    if(y2 < y1){
        angle *= -1;
    }

    var offsetLeft = 20;
    var offsetTop = 20;

    newLine.style.transform = 'rotate(' + angle + 'rad)';
    newLine.style.transformOrigin = 'left top'; 

    newLine.style.left = (x1 + offsetLeft) + 'px';
    newLine.style.top = (y1 + offsetTop) + 'px';

    const parent = document.getElementById("Canvas");
    parent.appendChild(newLine);
}

function changeColors(){
    let newColor = colorPicker.value;
    for (const [key, value] of nodes) {
        const element = document.getElementById(key);
        element.style.backgroundColor = newColor;
    }
    const button = document.getElementById("nodeColor");
    button.style.backgroundColor = newColor;
}

function highlightNodesAndLines(path){
    highlightNode(path[0]);
    for(let i = 1; i < path.length; ++i){
        highlightNode(path[i]);

        let min = Math.min(path[i], path[i - 1]);
        let max = Math.max(path[i], path[i - 1]);
        highlightLine(`Line${min}${max}`);
    }
    highlightNode(path[0]);
}

function highlightLine(id){
    let line = document.getElementById(id);
    if (typeof line === 'undefined')
        return ;
    if(line){
        line.style.backgroundColor = highlightedAlgColor;
        highlightedLines.add(id);
    }
}

function deHighlightLines(){
    for(let id of highlightedLines){
        let line = document.getElementById(id);
        if (typeof line === 'undefined')
            return ;
        line.style.backgroundColor = defaultLineColor;
    }
    highlightedLines.clear();
}

function deHighlightNodes(){
    for(let id of highlightedNodes){
        deHighlightNode(id);
    }
}

function highlightPath(start, goal, path){
    let current = goal;
    while(current != start){
        highlightNode(current);
        let min = Math.min(current, path[current]);
        let max = Math.max(current, path[current]);
        highlightLine(`Line${min}${max}`);
        current = path[current];
    }
    highlightNode(start);
}

//Button helper functions
function deleteNode(id){
    let element = document.getElementById(id);
    if (typeof element === 'undefined')
        return ;
    element.remove();

    nodes.delete(id);

    if(neighbours.has(id) == false){
        return;
    }

    for(let linesId of neighbours.get(id)){

        let minId = Math.min(linesId, id);
        let maxId = Math.max(linesId, id);

        element = document.getElementById(`Line${minId}${maxId}`);
        element.remove();

        var index = neighbours.get(linesId).indexOf(id);
        if (index !== -1) {
            neighbours.get(linesId).splice(index, 1);
        }
    }   

    neighbours.delete(id);
}

function constructMatrix(){
    if(deleteIsClicked){
        deleteClicked();
    }

    let size = nodes.size;
    let matrix = new Array(size);   
    for (let i = 0; i < size; i++) {
        matrix[i] = new Array(size).fill(0);
    }

    const nodeIds = new Map();
    let i = 0;
    for(let [key, value] of nodes){
        nodeIds.set(key, i);
        ++i;
    }

    i = 0;
    for(let [key, value] of nodeIds){
        if(!neighbours.has(key)){
            ++i;
            continue;
        }

        for(let x of neighbours.get(key)){
            let pos = nodeIds.get(x);
            matrix[i][pos] = 1;
        }
        ++i;
    }

    return matrix;
}

//algorithms' helper functions
function heuristic(node1, node2){
    let coords1 = nodes.get(node1);
    let coords2 = nodes.get(node2);
    return getDistance(coords1[0], coords1[1], coords2[0], coords2[1]);
}  

function aStar(start, goal){
    let maxId = Math.max(...nodes.keys()) + 1;

    openSet = new Array();
    openSet.push(start);

    path = new Array(maxId);
    path[start] = -1;

    gScore = new Array(maxId);
    gScore.fill(Number.MAX_SAFE_INTEGER);
    gScore[start] = 0;
    
    fScore = new Array(maxId);
    fScore.fill(Number.MAX_SAFE_INTEGER);
    fScore[start] = heuristic(start, goal);

    while(openSet.length != 0){
        openSet.sort(function(a, b){
            return fScore[a] > fScore[b];
        });

        let last = openSet.length - 1;
        current = openSet[last];  
        if (current == goal)
            return highlightPath(start, goal, path);

        openSet.splice(last, 1);    

        if(!neighbours.has(current)){
            continue;
        }

        for(let neighbour of neighbours.get(current)){
            let tentative_gScore = gScore[current] + 1;
            if(tentative_gScore < gScore[neighbour]){
                path[neighbour] = current;
                gScore[neighbour] = tentative_gScore;
                fScore[neighbour] = tentative_gScore + heuristic(neighbour, goal);

                if(openSet.includes(neighbour) == false){
                    openSet.push(neighbour);
                }
            }
        }
    }   

    return -1;
}

function hamiltonianCycleHelper(){
    if(nodes.size == 0)
        return;

    let maxId = Math.max(...nodes.keys()) + 1;
    let path = new Array();
    
    let visited = new Array(maxId);
    visited.fill(false);

    let start = maxId - 1;
    visited[start] = true;
    path.push(start);

    let isCycle = hamiltonianCycle(start, start, path, visited);

    if(isCycle){
        path.push(path[0]);
        highlightNodesAndLines(path);
    }
}

function hamiltonianCycle(start, current, path, visited){
    if(nodes.size < 3){
        return false;
    }
    
    if(path.length == nodes.size){
        return neighbours.get(current)?.includes(start);
    }

    if(!neighbours.has(current)){
        return false;
    }

    for(let neighbour of neighbours.get(current)){
        if(visited[neighbour] == false){
            visited[neighbour] = true;
            path.push(neighbour);

            if(hamiltonianCycle(start, neighbour, path, visited)){
                return true;
            }

            visited[neighbour] = false;
            const index = path.indexOf(neighbour);
            path.splice(index, 1);
        }
    }

    return false;
}

function generateRandomColor(){
    let maxVal = 0xFFFFFF;
    let randomNumber = Math.random() * maxVal; 
    randomNumber = Math.floor(randomNumber);
    randomNumber = randomNumber.toString(16);
    let randColor = randomNumber.padStart(6, 0);   
    return `#${randColor.toUpperCase()}`
}

function vertexColoring(){
    if(nodes.size < 1)
        return;

    let maxId = Math.max(...nodes.keys()) + 1;
    let result = new Array(maxId);
    result.fill(-1);
    result[0] = 0;

    let numOfColors = 0;

    let available = new Array(maxId);
    available.fill(false);

    for(let i = 1; i < maxId; ++i){
        if(neighbours.has(i)){
            for(let neighbour of neighbours.get(i)){
                if(result[neighbour] != -1){
                    available[result[neighbour]] = true;
                }
            }

            let cr;
            for(cr = 0; cr < maxId - 1; ++cr){
                if(available[cr] == false){
                    numOfColors = Math.max(numOfColors, cr);
                    break;
                }
            }
            
            result[i] = cr;

            for(let neighbour of neighbours.get(i)){
                if(result[neighbour] != -1){
                    available[result[neighbour]] = false;
                }
            }
        }else if(nodes.has(i)){
            result[i] = 0;
        }
    }

    let colors = new Map();
    for(let i = 0; i < numOfColors + 1; ++i){
        colors.set(i, generateRandomColor());
    }

    for(let i = 0; i < maxId; ++i){
        if(nodes.has(i)){
            let node = document.getElementById(i);
            if (typeof node === 'undefined')
                return ;
            node.style.backgroundColor = colors.get(result[i]);
        }
    }
}

function dfs(node, visited, path){
    visited.add(node);

    if(neighbours.has(node)){
        for(let u of neighbours.get(node)){
            if(visited.has(u) == false){
                path[u] = node;
                dfs(u, visited, path);
            }
        }
    }
}

function findLongestPath(start, path){
    let longestPath = new Array();

    for(let goal = 0; goal < path.length; ++goal){
        let longestSubPath = new Array();
        current = goal;

        if(current == start || path[current] == -1)
            continue;

        while(current != start){
            longestSubPath.push(current);
            current = path[current];
        }longestSubPath.push(start);

        if(longestSubPath.length > longestPath.length){
            longestPath = longestSubPath;
        }
    }

    return longestPath;
}

function longestPath(){
    let maxId = Math.max(...nodes.keys());
    let longestPath = new Array();

    for(let i = 0; i < maxId + 1; ++i){
        let visited = new Set();
        let path = new Array(maxId + 1);
        path.fill(-1);
        if(nodes.has(i)){
            dfs(i, visited, path);
            let newPath = findLongestPath(i, path);

            if(newPath.length > longestPath.length){
                longestPath = newPath;
            }
        }
    }
    return longestPath;
}

//Button functions
function clearNodes(){
    if(deleteIsClicked){
        deleteClicked();
    }

    if(matrixIsDisplayed){
        getAdj();
    }

    nodeId = 0;
    if(nodes.size <= 0){
        return;
    }

    for (const [key, value] of nodes) {
        deleteNode(key);
    }
    
    nodes.clear();
    neighbours.clear();
    highlightedNodes.clear();
    highlightedLines.clear();
}

function deleteClicked(){
    for(let id of highlightedNodes){
        deHighlightNode(id);
    }

    if(matrixIsDisplayed){
        getAdj();
    }

    if(highlightedLines.size > 0){
        deHighlightLines();
    }

    const button = document.getElementById("deleteButton");
    const allNodes = document.querySelectorAll('.Node');

    if (typeof button === 'undefined' || typeof allNodes === 'undefined')
        return ;

    deleteIsClicked = !deleteIsClicked;

    let color = deleteIsClicked ? deleteButtonColor : defaultButtonColor;
    let textColor = deleteIsClicked? defaultButtonColor: defaultTextColor;

    allNodes.forEach(node => {
        node.classList.toggle('delete-hover', deleteIsClicked);
    });

    button.style.backgroundColor = color;
    button.style.color = textColor;
}

function openColorPicker(){
    colorPicker.click();

    if(deleteIsClicked){
        deleteClicked();
    }

    if(matrixIsDisplayed){
        getAdj();
    }

    if(highlightedLines.size > 0){
        deHighlightLines();
    }
}

function shortestPathPressed(){
    let button = document.getElementById("ShortestPathButton");
    if (typeof button === 'undefined')
        return ;
    let color = defaultButtonColor;
    let textColor = defaultTextColor;

    if(!shortestPathButtonClicked){
        color = shortestPathButtonColor;
        textColor = defaultButtonColor;
    }

    button.style.backgroundColor = color;
    button.style.color = textColor;
    shortestPathButtonClicked = !shortestPathButtonClicked;
}

function getLongestPath(){
    if(justClicked){
        deHighlightNodes();
        deHighlightLines();
        justClicked = false;
    }

    else if(!nodesAreMarked){
        nodesAreMarked = true;
        justClicked = true;
        let path = longestPath();
        if(path.length == 0)
            return;

        highlightNode(path[0]);
        for(let i = 1; i < path.length; ++i){
            highlightNode(path[i]);
            let min = Math.min(path[i - 1], path[i]);
            let max = Math.max(path[i - 1], path[i]);
            highlightLine(`Line${min}${max}`);
        }
    }
}

function getVertexColoring(){
    if(justClicked){
        changeColors();
        justClicked = false;
    }

    else if(!nodesAreMarked){
        nodesAreMarked = true;
        justClicked = true;
        vertexColoring();
    }
}

function getHamiltonianCycle(){
    if(justClicked){
        deHighlightLines();
        deHighlightNodes();
        justClicked = false;
    }

    else if(highlightedLines.size == 0){
        nodesAreMarked = true;
        justClicked = true;
        hamiltonianCycleHelper();
    }
}

function getAdj(){
    justClicked = true;
    const matrix = document.getElementById('Matrix');

    if (typeof matrix === 'undefined')
        return ;

    const adjButtonOffsets = document.getElementById('adjButton').getBoundingClientRect();

    let top = adjButtonOffsets.top + 20;
    let left = adjButtonOffsets.left + 20;
    console.log(matrixIsDisplayed, justClicked);

    if(!matrixIsDisplayed){
        matrix.style.display = "block";

        matrix.style.top = top + 'px';
        matrix.style.left = left + 'px';

        let adjMatrix = constructMatrix();
        let content = "";

        for(let row of adjMatrix){
            for(let element of row){
                content += element + ', ';
            }
            content += '<br>';
        }
        matrix.innerHTML = content;
    }
    
    else{
        matrix.style.display = "none";
    }

    matrixIsDisplayed = !matrixIsDisplayed;
}

//Event listeners
colorPicker.addEventListener("input", changeColors)
document.addEventListener("click", useCoords, true);