const nodes = [];
function getMousePos(event) {
    let x = event.clientX;
    let y = event.clientY;
    drawNewNode(x,y);
    return [x,y];
}

function addToArray(event){
    nodes.push(getMousePos(event));
    console.log(nodes);
}

function drawNewNode(x, y){
  const newNode = document.createElement("div");
  const newContent = document.createTextNode((nodes.length + 1).toString());
  newNode.appendChild(newContent);

  newNode.classList.add('Node');
  newNode.style.position = "absolute";
  newNode.style.left = (x-20) + 'px';
  newNode.style.top = (y-50) + 'px';

  const parent = document.getElementById("Nodes");
  parent.appendChild(newNode);
}

document.addEventListener("click", addToArray);