'use strict';

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

// Set node click handler
graph.nodeOptions.setClickNode(function (d, selection) {
    var userInput = window.prompt("Enter text for the node:", d.shortname);
    if (userInput == null || userInput == "") {
        return;
    }
    d.shortname = userInput;
    graph.restart.layout();
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
            shortname: ["Multi line", "node"],
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