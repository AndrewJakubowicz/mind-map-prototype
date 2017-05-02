
var makeAbsoluteContext = require('./src/graph/helpers/makeAbsoluteContext.js');

var linkTool = require('./src/radialMenu/link-tool.js');

const currentState = {
    currentNode: {
        data: {},
        selection: {},
        mouseOverNode: false
    },
    startedDragAt: "",
    nodeMap: new Map()
}





// Get reference to the radial menu
const radialMenu = document.getElementById("radial-menu");

var graph = require('./src/graph/graph.js')(currentState, radialMenu);

graph.nodeOptions.setNodeColor(() => "green");
// Set node click handler
graph.nodeOptions.setClickNode((d, selection) => {
    let userInput = window.prompt("Enter text for the node:", d.shortname)
    if (userInput == null || userInput == ""){
        return
    }
    d.shortname = userInput;
    graph.restart.layout()
});



const radialMenuArrowTool = document.getElementById("menu-line-btn");

radialMenu.addEventListener("mouseleave", () => {
    radialMenu.style.display = "none";
});







// Adds the create node button in the side menu.
let nodeId = 0 ;
(() => {
    var sidemenu = document.getElementById("side-menu");
    var createNodeButton = document.createElement('button');
    createNodeButton.innerText = "Create Node";
    createNodeButton.addEventListener("click", () => {
        currentState.nodeMap.set(String(nodeId), {hash: String(nodeId), shortname: "Node "+nodeId});
        let _node = currentState.nodeMap.get(String(nodeId));
        graph.addNode(_node);
        nodeId ++;
    })
    sidemenu.appendChild(createNodeButton);

})();


// RXJS arrow tool drag
// This sets up the linkTool.
linkTool(graph, radialMenu, radialMenuArrowTool, currentState);
