'use strict';

var Rx = require('rxjs');
var makeAbsoluteContext = require('./graph/helpers/makeAbsoluteContext.js');

var linkTool = require('./radialMenu/link-tool.js');
var trashTool = require('./radialMenu/trash-tool.js');
var groupTool = require('./radialMenu/group-tool.js');

console.log(groupTool);

var currentState = {
    currentNode: {
        data: {},
        selection: {},
        mouseOverNode: false
    },
    startedDragAt: "",
    nodeMap: new Map()
};

// Get reference to the radial menu
var radialMenu = document.getElementById("radial-menu");

var graph = require('./graph/graph.js')(currentState, radialMenu);

function deleteText(nodeText, node) {
    /**
     * Delete a single character of text.
     * Delete a line if it is empty.
     */
    if (nodeText.length > 1) {
        if (nodeText[nodeText.length - 1] === '') {
            node.shortname = nodeText.slice(0, -1);
            return;
        } else {
            nodeText[nodeText.length - 1] = nodeText[nodeText.length - 1].slice(0, -1);
            return;
        }
    } else {
        if (nodeText[0] === "") {
            return;
        }
        nodeText[0] = nodeText[0].slice(0, -1);
    }
}

function addLetter(text, character) {
    var lastLine = text.slice(-1);
    lastLine += character;
    text[text.length - 1] = lastLine;
}
// Set node click handler
var $action = new Rx.Subject();
graph.nodeOptions.setClickNode(function (d, selection) {
    // Send a click value
    $action.next({ type: "editNode", clickedNode: d, restart: graph.restart.layout });
});

$action.map(function (action) {
    var restart = action.restart;
    var node = action.clickedNode;
    var previousColor = node.color;
    node.color = "white";
    restart();
    // Exit on "esc" keypress
    var $exit = Rx.Observable.concat(Rx.Observable.fromEvent(document, "keyup").filter(function (e) {
        return e.keyCode == 27;
    }));

    // Backspace
    var $backspace = Rx.Observable.fromEvent(document, "keydown").filter(function (e) {
        return e.keyCode === 8 && e.keyCode !== 13;
    }).do(function (_) {
        return deleteText(node.shortname, node);
    });

    // Letters
    var $letters = Rx.Observable.fromEvent(document, "keypress").filter(function (e) {
        return e.keyCode !== 8 && e.keyCode !== 13;
    }).do(function (e) {
        if ((e.keyCode || e.which) === 32) {
            e.preventDefault();
        }
        var event = e || window.event;
        var char = String.fromCharCode(e.keyCode || e.which);
        addLetter(node.shortname, char);
    });

    var $newLine = Rx.Observable.fromEvent(document, "keypress").filter(function (e) {
        return e.keyCode === 13;
    }).do(function (e) {
        // Prevent stacking newlines. (Not supported)
        if (node.shortname.slice(-1) === "") {
            return;
        }
        node.shortname.push("");
    });

    // Return the typing observables merged together.
    var $typingControls = Rx.Observable.merge($backspace, $letters, $newLine).do(function (_) {
        return restart();
    }).takeUntil($exit).finally(function (_) {
        node.color = previousColor;
        restart();
    });
    return $typingControls;
}).switch().subscribe(function (e) {
    return console.log(e);
}, console.error, function () {
    return console.log("FINISH");
});

var radialMenuArrowTool = document.getElementById("menu-line-btn");

radialMenu.addEventListener("mouseleave", function () {
    radialMenu.style.display = "none";
});

// Adds the create node button in the side menu.
var nodeId = 0;
var shapes = ["rect", "circle", "capsule"];
var colors = ['#FFCDD2', '#C8E6C9', '#FF5252', '#EA80FC'];
(function () {
    var sidemenu = document.getElementById("side-menu");
    var createNodeButton = document.createElement('button');
    createNodeButton.innerText = "Create Node";
    createNodeButton.addEventListener("click", function () {

        currentState.nodeMap.set(String(nodeId), { hash: String(nodeId),
            shortname: [["Some", "lines"], ["3", "lines", "text"]][nodeId % 2],
            nodeShape: shapes[nodeId % shapes.length],
            color: colors[nodeId % colors.length]
        });
        var _node = currentState.nodeMap.get(String(nodeId));
        graph.addNode(_node);
        nodeId++;
    });
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
var radialMenuGroupTool = document.getElementById("menu-group-btn");
groupTool(graph, radialMenu, radialMenuGroupTool, currentState);