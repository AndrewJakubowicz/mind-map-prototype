"use strict";

module.exports = function (state, graph, radialMenu) {
    var trashIcon = document.getElementById("menu-delete-btn");

    var map = state.nodeMap;
    trashIcon.addEventListener("click", function () {
        var hash = String(state.currentNode.data.hash);

        if (map.delete(hash)) {
            graph.removeNode(hash);
        }

        // Make the menu disappear after the node is deleted.
        radialMenu.style.display = "none";
    });
};