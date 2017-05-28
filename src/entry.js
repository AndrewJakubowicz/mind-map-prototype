
var Rx = require('rxjs');
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


function deleteText(nodeText, node){
    /**
     * Delete a single character of text.
     * Delete a line if it is empty.
     */
    if (nodeText.length > 1){
        if (nodeText[nodeText.length - 1] === ''){
            node.shortname = nodeText.slice(0, -1)
            return;
        } else {
            nodeText[nodeText.length - 1] = nodeText[nodeText.length - 1].slice(0, -1)
            return;
        }
    } else {
        if (nodeText[0] === ""){
            return
        }
        nodeText[0] = nodeText[0].slice(0, -1)
    }
}

function addLetter(text, character){
    let lastLine = text.slice(-1);
    lastLine += character;
    text[text.length - 1] = lastLine;
}
// Set node click handler
let $action = new Rx.Subject();
graph.nodeOptions.setClickNode((d, selection) => {
    // Send a click value
    $action.next({type: "editNode", clickedNode: d, restart: graph.restart.layout});
});

$action.map(action => {
    let restart = action.restart;
    let node = action.clickedNode;
    let previousColor = node.color;
    node.color = "white";
    restart();
    // Exit on "esc" keypress
    let $exit = Rx.Observable.concat(
        Rx.Observable.fromEvent(document, "keyup")
                .filter(e => e.keyCode == 27)
    );

    // Backspace
    let $backspace = Rx.Observable.fromEvent(document, "keydown")
        .filter(e => e.keyCode === 8 && e.keyCode !== 13)
        .do(_ => deleteText(node.shortname, node));
    
    // Letters
    let $letters = Rx.Observable.fromEvent(document, "keypress")
        .filter(e => e.keyCode !== 8 && e.keyCode !== 13)
        .do((e) => {
            if ((e.keyCode || e.which) === 32){
                e.preventDefault();
            }
            let event = e || window.event;
            let char = String.fromCharCode(e.keyCode || e.which)
            addLetter(node.shortname, char)
        });

    let $newLine = Rx.Observable.fromEvent(document, "keypress")
        .filter(e => e.keyCode === 13)
        .do(e => {
            // Prevent stacking newlines. (Not supported)
            if (node.shortname.slice(-1) === ""){
                return;
            }
            node.shortname.push("");
        })
    
    // Return the typing observables merged together.
    let $typingControls = Rx.Observable.merge(
            $backspace,
            $letters,
            $newLine
        )
        .do(_ => restart())
        .takeUntil($exit)
        .finally(_ => {
            node.color = previousColor;
            restart();
        })
    return $typingControls
}).switch().subscribe(
    e => console.log(e),
    console.error,
    () => console.log("FINISH")
)



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
            shortname: [["Some", "lines"], ["3", "lines", "text"]][nodeId % 2],
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

