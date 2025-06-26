const nodes = [];
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

function isInBounds(x, y){
    var offsets = document.getElementById('Nodes').getBoundingClientRect();
    var top = offsets.top;
    var left = offsets.left;

    if(x > left + 10 && x < left + 750 && y > top - 10 && y < top + 520){
        return true;
    }
    return false;
}

function addToArray(event){
    const coords = getMousePos(event);
    let x = coords[0] - 20;
    let y = coords[1] - 50;

    if(isOverlaping(x,y) == false && isInBounds(x, y)){
        drawNewNode(x,y);
        nodes.push([x,y]);
    }
}

function drawNewNode(x, y){
  const newNode = document.createElement("div");
  const newContent = document.createTextNode((nodes.length + 1).toString());
  newNode.appendChild(newContent);

  newNode.classList.add('Node');
  newNode.style.position = "absolute";
  newNode.style.left = x + 'px';
  newNode.style.top = y + 'px';

  const parent = document.getElementById("Nodes");
  parent.appendChild(newNode);
}

document.addEventListener("click", addToArray);