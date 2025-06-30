const nodes = [];
let highlightedNodes = new Set();

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

    console.log("Node drawn ", x, y);

    const parent = document.getElementById("Canvas");
    parent.appendChild(newNode);
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

function connectNodes(){
    const coordinates = [];

    const canvasContainer = document.getElementById("Canvas");
    const containerRect = canvasContainer.getBoundingClientRect();

    for(const id of highlightedNodes){
        let x = nodes[id][0] - containerRect.left + 25;
        let y = nodes[id][1] - containerRect.top + 40;
        coordinates.push([x,y]);
        deHighlightNode(id);
        highlightedNodes.delete(id);
    }

    const c = document.getElementById("myCanvas");
    const ctx = c.getContext("2d");

    X1 = coordinates[0][0];
    Y1 = coordinates[0][1];

    X2 = coordinates[1][0];
    Y2 = coordinates[1][1];

    console.log(X1, Y1, X2, Y2);   
    
    ctx.beginPath();
    ctx.moveTo(X1, Y1);
    ctx.lineTo(X2, Y2);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 3;
    ctx.stroke();
}

function getCoords(event){
    const coords = getMousePos(event);
    let x = coords[0] - 25;
    let y = coords[1] - 50;

    console.log("Mouse clicked: ", x, y);

    if(isOverlaping(x,y) == false && isInBounds(x, y)){
        drawNewNode(x,y);
        nodes.push([x,y]);
    }
    
    else{
        if(isInBounds(x, y)){
            highlightNode(x,y);
            if(highlightedNodes.size == 2){
                connectNodes();
            }
        }
    }
}

document.addEventListener("click", getCoords);