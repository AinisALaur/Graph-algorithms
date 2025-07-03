let nodes = new Map();
let highlightedNodes = new Set();
const colorPicker = document.getElementById('colorPicker');
let neighbours = new Map();

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
    const newContent = document.createTextNode((nodes.size).toString());
    let newId = nodes.size - 1;
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
    if(highlightedNodes.has(id) == false){
        const node = document.getElementById(id);
        node.style.border = "3px solid #ecc826";
        highlightedNodes.add(id);
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
    if(neighbours.has(id1) && neighbours.get(id1).includes(id2) || neighbours.has(id2) && neighbours.get(id1).includes(id2))
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

    console.log(x1, y1, x2, y2);

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
    if(isOverlaping(x,y) == false && isInBounds(x, y)){
        nodes.set(nodes.size, [x,y]);
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

    if(neighbours.has(id) == false){
        return;
    }

    for(let linesId of neighbours.get(id)){

        let minId = Math.min(linesId, id);
        let maxId = Math.max(linesId, id);

        console.log(`Line${minId}${maxId}`);
        element = document.getElementById(`Line${minId}${maxId}`);
        element.remove();

        var index = neighbours.get(linesId).indexOf(id);
        if (index !== -1) {
            neighbours.get(linesId).splice(index, 1);
        }
    }   

    nodes.delete(id);
    neighbours.delete(id);
}

colorPicker.addEventListener("input", changeColors)
document.addEventListener("click", getCoords);