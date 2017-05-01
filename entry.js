var d3 = require('d3');
var Rx = require('rxjs');

var makeAbsoluteContext = require('./src/graph/helpers/makeAbsoluteContext.js');


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
console.log(graph);
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







// populate side menu
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
            .attr("stroke", "grey")
            .attr("pointer-events", "none");
    }

    let d3Data = [tempDrawingArrow];

    var mousedown = Rx.Observable.fromEvent(radialMenuArrowTool, "mousedown"),
        mousemove = Rx.Observable.fromEvent(document, 'mousemove'),
        //mouseescape = Rx.Observable.fromEvent(graph.getSVGElement().node(), "mouseleave"),
        mouseUpOnNodeObservable = Rx.Observable.fromEvent(document, 'mouseup');
    
    var mousedrag = mousedown.flatMap(function (md) {
        console.log("mouseDown triggered observable")
        md.preventDefault();
        // Set current selection to the start dragged node.
        currentState.startedDragAt = currentState.currentNode.data.hash;
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
        }).takeUntil(mouseUpOnNodeObservable)
            .finally(() => {
                // This is called when the sequence "completes".
                // Here we make the arrow disappear by moving it to the corner.
                // We also add the triplet.
                tempDrawingArrow.end = {x: 0, y:0};
                tempDrawingArrow.start = {x:0,y:0};
                updateLine();

                // Create the triplet
                if (currentState.currentNode.mouseOverNode && currentState.startedDragAt !== currentState.currentNode.data.hash){
                    graph.addTriplet({subject: currentState.nodeMap.get(String(currentState.startedDragAt)),
                        predicate: {type: " "},
                        object: currentState.nodeMap.get(String(currentState.currentNode.data.hash))
                    });
                }
            })
    })

    // mouseUpOnNodeObservable.do(_ => {
    //     tempDrawingArrow.end = {x: 0, y:0};
    //     tempDrawingArrow.start = {x:0,y:0};
    // }).subscribe(function () {
    //     updateLine();
    // })

    var sub = mousedrag.subscribe(function (d) {
        tempDrawingArrow.end = {x: d.x, y: d.y};
        
        updateLine();
    },
    function (error) {
        console.log("ERROR", error)
    },
    function () {
        // FINISHED CODE
        console.log("FINISHED")
        tempDrawingArrow.end = {x: 0, y:0};
        tempDrawingArrow.start = {x:0,y:0};
        updateLine();
    });
    
})();
