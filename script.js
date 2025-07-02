let nodes = [];
let highlightedNodes = new Set();
const colorPicker = document.getElementById('colorPicker');
let lines = 0;

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
    for(let i = 0;  i < nodes.length; ++i){
        let x2 = nodes[i][0];
        let y2 = nodes[i][1]; 

        if(getDistance(x1,y1,x2,y2) < 60){
            return true;
        }
    }
    return false;
}

function getNodeId(x1, y1){
    for(let i = 0;  i < nodes.length; ++i){
        let x2 = nodes[i][0];
        let y2 = nodes[i][1]; 

        if(getDistance(x1,y1,x2,y2) < 50){
            return i;
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
    const newContent = document.createTextNode((nodes.length + 1).toString());
    newNode.appendChild(newContent);

    newNode.classList.add('Node');
    newNode.id = (nodes.length).toString();

    newNode.style.position = "absolute";
    newNode.style.left = x + 'px';
    newNode.style.top = y + 'px';
    newNode.style.backgroundColor = colorPicker.value;

    const parent = document.getElementById("Canvas");
    parent.appendChild(newNode);

    if(highlightedNodes.size == 1){
        const id = highlightedNodes.values().next().value;
        let x1 = nodes[id][0];
        let y1 = nodes[id][1];
        connectNodes(x, y, x1, y1);
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
    const coordinates = [];
    for(const id of highlightedNodes){
        let x = nodes[id][0];
        let y = nodes[id][1];
        coordinates.push([x,y]);
        deHighlightNode(id);
        highlightedNodes.delete(id);
    }

    let x1 = coordinates[0][0];
    let y1 = coordinates[0][1];
    let x2 = coordinates[1][0];
    let y2 = coordinates[1][1];

    connectNodes(x1, y1, x2, y2);
}

function connectNodes(x1, y1, x2, y2){
    let length = getDistance(x1, y1, x2, y2);
    const newLine = document.createElement("div");
    newLine.id = "Line" + (lines);

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
    ++lines;
}

function getCoords(event){
    const coords = getMousePos(event);
    let x = coords[0] - 25;
    let y = coords[1] - 50;
    if(isOverlaping(x,y) == false && isInBounds(x, y)){
        drawNewNode(x,y);
        nodes.push([x,y]);
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
    if(nodes.length <= 0){
        return;
    }

    for(let i = 0; i < nodes.length; ++i){
        const element = document.getElementById(i);
        element.remove();
    }

    for(let i = 0; i < lines; ++i){
        const element = document.getElementById(`Line${i}`);
        element.remove();
    }
    
    nodes = [];
    lines = 0;
    highlightedNodes.clear();
}

function openColorPicker(){
    colorPicker.click();
}

function changeColors(event){
    let newColor = event.target.value;
    for(let i = 0; i < nodes.length; ++i){
        const element = document.getElementById(i);
        element.style.backgroundColor = newColor;
    }
    const button = document.getElementById("nodeColor");
    button.style.backgroundColor = newColor;
}

colorPicker.addEventListener("input", changeColors)
document.addEventListener("click", getCoords);