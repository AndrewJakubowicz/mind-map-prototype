var networkVizJS = require('networkVizJS');
var makeAbsoluteContext = require('./helpers/makeAbsoluteContext.js');

const graph = function (currentState, radialMenu){ 
    return networkVizJS("graph",{
        layoutType: "linkDistance",
        mouseOverNode: (d, selection) => {
            currentState.currentNode.mouseOverNode = true;
            var bbox = selection.node().getBBox(),
                middleX = bbox.x + (bbox.width / 2),
                middleY = bbox.y + (bbox.height / 2);

            // generate a conversion function
            var convert = makeAbsoluteContext(selection.node(), document.body);

            // use it to calculate the absolute center of the element
            var absoluteCenter = convert(middleX, middleY);

            radialMenu.style.display = "block"
            radialMenu.style.position = 'fixed';
            radialMenu.style.top = absoluteCenter.y
            radialMenu.style.left = absoluteCenter.x;
            
            // Set the current state for which node the menu is
            // hovering over.
            currentState.currentNode.data = d;
            currentState.currentNode.selection = selection;
            
        },
        mouseOutNode: (d, selection) => {
            // Don't make the radial menu display = none here.
            // Otherwise the radial menu vanishes when you mouse from
            // the node to the menu.
            currentState.currentNode.mouseOverNode = false;
        },
        mouseUpNode: (d, selection) => {
            // Moved the triplet creation into an observable.
        },
        nodeDragStart: () => {
            radialMenu.style.display = "none";
        }
    });
};

module.exports = graph;
