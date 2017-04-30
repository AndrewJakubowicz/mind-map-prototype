var networkVizJS = require('networkVizJS');
var d3 = require('d3');
var Rx = require('rxjs');

const currentState = {
    currentNode: {
        data: {},
        selection: {}
    }
}





// Get reference to the radial menu
const radialMenu = document.getElementById("radial-menu");
const radialMenuArrowTool = document.getElementById("menu-line-btn");

radialMenu.addEventListener("mouseleave", () => {
    radialMenu.style.display = "none";
})

// radialMenuArrowTool.addEventListener("mousedown", () => {
//         console.log("DRAG START")
//         currentState.tempDrawingArrow.update();
        
// })





let graph = networkVizJS("graph",{
    mouseOverNode: (d, selection) => {
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
    },
    nodeDragStart: () => {
        radialMenu.style.display = "none";
    },
    clickNode: (d, selection) => {
        let userInput = window.prompt("Enter text for the node:", d.shortname)
        if (userInput == null || userInput == ""){
            return
        }
        d.shortname = userInput;
        graph.restart.layout()
    }
});





// populate side menu
let nodeId = 0;
let nodeMap = new Map();
(function (){
    var sidemenu = document.getElementById("side-menu");
    var createNodeButton = document.createElement('button');
    createNodeButton.innerText = "Create Node";
    createNodeButton.addEventListener("click", () => {
        nodeMap.set(nodeId, {hash: String(nodeId), shortname: "Node "+nodeId});
        let _node = nodeMap.get(nodeId);
        graph.addNode(_node);
        nodeId ++;
    })
    sidemenu.appendChild(createNodeButton);

})()



function makeAbsoluteContext(element, svgDocument) {
  return function(x,y) {
    var offset = svgDocument.getBoundingClientRect();
    var matrix = element.getScreenCTM();
    return {
      x: (matrix.a * x) + (matrix.c * y) + matrix.e - offset.left,
      y: (matrix.b * x) + (matrix.d * y) + matrix.f - offset.top
    };
  };
}


// RXJS arrow tool drag
// This deals with the entire arrow tool.
(function (){
    let tempDrawingArrow = {
        start: {x: 0, y:0},
        end: {x: 0, y:0}
    }

    /**
     * updateLine is called to update the users arrow.
     */
    function updateLine(){
        var line = graph.getSVGElement().selectAll("#menu-line-overlay")
            .data(d3Data)
        
        var lineEnter = line.enter().append('line')
            .attr("id", "menu-line-overlay")
        
        line = line.merge(lineEnter);

        line.attr("x1", d => d.start.x)
            .attr("y1", d => d.start.y)
            .attr("x2", d => d.end.x)
            .attr("y2", d => d.end.y)
            .attr("stroke-width", 1)
            .attr("stroke", "grey");
    }

    let d3Data = [tempDrawingArrow];

    var mousedown = Rx.Observable.fromEvent(radialMenuArrowTool, "mousedown"),
        mousemove = Rx.Observable.fromEvent(document, 'mousemove'),
        mouseescape = Rx.Observable.fromEvent(graph.getSVGElement().node(), "mouseleave");
    
    var mousedrag = mousedown.flatMap(function (md) {
        console.log("mouseDown triggered observable")
        var bbox = currentState.currentNode.selection.node().getBBox(),
            middleX = bbox.x + (bbox.width / 2),
            middleY = bbox.y + (bbox.height / 2);

        // generate a conversion function
        var convert = makeAbsoluteContext(currentState.currentNode.selection.node(), graph.getSVGElement().node());

        // use it to calculate the absolute center of the element with SVG canvas.
        var absoluteCenter = convert(middleX, middleY);
        tempDrawingArrow.start = {x: absoluteCenter.x, y: absoluteCenter.y};

        // Reference: http://stackoverflow.com/a/10298843/6421793
        return mousemove.map(function (mm) {
            mm.preventDefault();
            var svg = graph.getSVGElement().node();
            var pt = svg.createSVGPoint();

            function cursorPoint(evt){
                pt.x = evt.clientX; pt.y = evt.clientY;
                return pt.matrixTransform(svg.getScreenCTM().inverse());
            }
            return cursorPoint(mm)
        }).takeUntil(mouseescape);
    });

    var sub = mousedrag.subscribe(function (d) {
        tempDrawingArrow.end = {x: d.x, y: d.y};
        
        updateLine();
    },
    (error) => {
        console.log("ERROR", error)
    },
    () => {
        // FINISHED CODE
        console.log("FINISHED")
        tempDrawingArrow.start = {x: 0, y:0}
        tempDrawingArrow.end = {x: 0, y:0}
        updateLine();
    })
    
})()
