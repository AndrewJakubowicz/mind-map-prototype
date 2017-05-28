
var makeAbsoluteContext = require('./graph/helpers/makeAbsoluteContext.js');

var linkTool = require('./radialMenu/link-tool.js');
var trashTool = require('./radialMenu/trash-tool.js');
var groupTool = require('./radialMenu/group-tool.js');

console.log(groupTool);


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

var graph = require('./graph/graph.js')(currentState, radialMenu);

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
let nodeId = 0;
let shapes = ["rect", "circle",
"capsule"];
let colors = ['#FFCDD2', '#C8E6C9', '#FF5252', '#EA80FC'];
(() => {
    var sidemenu = document.getElementById("side-menu");
    var createNodeButton = document.createElement('button');
    createNodeButton.innerText = "Create Node";
    createNodeButton.addEventListener("click", () => {
        currentState.nodeMap.set(String(nodeId), {hash: String(nodeId),
            shortname: ["Multi line",  "node"],
            nodeShape: shapes[nodeId % shapes.length],
            color: colors[nodeId % colors.length]
        });
        let _node = currentState.nodeMap.get(String(nodeId));
        graph.addNode(_node);
        nodeId ++;
    })
    sidemenu.appendChild(createNodeButton);

})();

/**
 * Hooking up the menu items.
 */

// LINK TOOL
linkTool(graph, radialMenu, radialMenuArrowTool, currentState);

// TRASH TOOL
trashTool(currentState, graph, radialMenu);

// GROUP TOOL
let radialMenuGroupTool = document.getElementById("menu-group-btn");
groupTool(graph, radialMenu, radialMenuGroupTool, currentState);

