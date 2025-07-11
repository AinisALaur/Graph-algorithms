let nodes = new Map();
let highlightedNodes = new Set();
const colorPicker = document.getElementById('colorPicker');
let neighbours = new Map();
let deleteIsClicked = false;
let nodeId = 0;
let matrixIsDisplayed = false;

const canvasWidth = 1385;
const canvasHeight = 400;

function getMousePos(event) {
    let x = event.clientX;
    let y = event.clientY;
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

    if(x > left + 5 && x < left + canvasWidth - 54 && y > top - 15 && y < top + canvasHeight - 70){
        return true;
    }
    return false;
}

function drawNewNode(x, y){
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

    if(highlightedNodes.size == 1){
        const id = highlightedNodes.values().next().value;
        connectNodes(id, newId); 
    }
}

function deHighlightNode(id){
    const node = document.getElementById(id);
    node.style.border = "none";
    highlightedNodes.delete(id);
}

function highlightNode(x, y){   
    let id = getNodeId(x, y);
    if (typeof id === 'undefined')
        return ;

    if(highlightedNodes.has(id) == false){
        if(deleteIsClicked){
            deleteNode(id);
        }else{
            const node = document.getElementById(id);
            node.style.border = "3px solid #ecc826";
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

    connectNodes(ids[0], ids[1]);
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
    newLine.style.backgroundColor = "black";
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

function getCoords(event){
    const coords = getMousePos(event);
    let x = coords[0] - 25;
    let y = coords[1] - 50;

    if(matrixIsDisplayed){
        if(isInBounds(x, y)){
            getAdj();
        }
        return;
    }
    if(isOverlaping(x,y) == false && isInBounds(x, y) && !deleteIsClicked){
        nodes.set(nodeId, [x,y]);
        drawNewNode(x,y);
    }
    
    else{
        if(isInBounds(x, y)){
            highlightNode(x,y);
            if(highlightedNodes.size == 2){
                connectHighlighted();
            }
        }
    }
}

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
}

function openColorPicker(){
    colorPicker.click();

    if(deleteIsClicked){
        deleteClicked();
    }

    if(matrixIsDisplayed){
        getAdj();
    }
}

function changeColors(event){
    let newColor = event.target.value;
    for (const [key, value] of nodes) {
        const element = document.getElementById(key);
        element.style.backgroundColor = newColor;
    }
    const button = document.getElementById("nodeColor");
    button.style.backgroundColor = newColor;
}

function deleteNode(id){
    let element = document.getElementById(id);
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

function deleteClicked(){
    for(let id of highlightedNodes){
        deHighlightNode(id);
    }

    if(matrixIsDisplayed){
        getAdj();
    }

    const button = document.getElementById("deleteButton");
    const allNodes = document.querySelectorAll('.Node');

    deleteIsClicked = !deleteIsClicked;

    let color = deleteIsClicked ? "#de1f38" : "#768d87";

    allNodes.forEach(node => {
        node.classList.toggle('delete-hover', deleteIsClicked);
    });

    button.style.backgroundColor = color;
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
        console.log(key, i);
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

function getAdj(){
    const matrix = document.getElementById('Matrix');
    const adjButtonOffsets = document.getElementById('adjButton').getBoundingClientRect();;

    let top = adjButtonOffsets.top + 20;
    let left = adjButtonOffsets.left + 20;

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

    }else{
        matrix.style.display = "none";
    }

    matrixIsDisplayed = !matrixIsDisplayed;
}

function reconstruct_path(start, goal, path){   
    let current = goal;
    while(current != start){
        console.log(current);
        current = path[current];
    }
    console.log(start);
}

function heuristic(node1, node2){
    let coords1 = nodes.get(node1);
    let coords2 = nodes.get(node2);
    return getDistance(coords1[0], coords1[1], coords2[0], coords2[1]);
}  

function aStar(start, goal){
    let size = nodes.size;

    openSet = new Array();
    openSet.push(start);

    path = new Array(size);
    path[start] = -1;

    gScore = new Array(size);
    gScore.fill(Number.MAX_SAFE_INTEGER);
    gScore[start] = 0;
    
    fScore = new Array(size);
    fScore.fill(Number.MAX_SAFE_INTEGER);
    fScore[start] = heuristic(start, goal);

    while(openSet.length != 0){
        openSet.sort(function(a, b){
            return fScore[a] > fScore[b];
        });

        let last = openSet.length - 1;
        current = openSet[last];  
        if (current == goal)
            return reconstruct_path(start, goal, path);

        openSet.splice(last, 1);    

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


colorPicker.addEventListener("input", changeColors)
document.addEventListener("click", getCoords);