var networkVizJS = require('networkVizJS');



let graph = networkVizJS("graph",{
    mouseOverNode: (d, selection) => {
        var bbox = selection.node().getBBox(),
            middleX = bbox.x + (bbox.width / 2),
            middleY = bbox.y + (bbox.height / 2);

        // generate a conversion function
        var convert = makeAbsoluteContext(selection.node(), document.body);

        // use it to calculate the absolute center of the element
        var absoluteCenter = convert(middleX, middleY);


        let div = document.createElement("div");
        div.style.width = '20px';
        div.style.height = '20px';
        div.style.backgroundColor = 'red';
        div.style.position = 'fixed';
        div.style.top = absoluteCenter.y
        div.style.left = absoluteCenter.x;

        document.body.appendChild(div);
        
    },
    mouseOutNode: (d, selection) => {

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