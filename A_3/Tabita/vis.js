// Assigment 3
// by Tabita Mädler and Paul Riedel

// Doku: https://github.com/d3/d3-hierarchy#tree
// Tree: https://d3indepth.com/layouts/
// Pan & Zoom: https://bl.ocks.org/mbostock/4e3925cdc804db257a86fdef3a032a45



//Variables
var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height")

var g = svg.append("g");



//Color Axis


var colorS =  d3.scaleLinear().range([0,1]);


var sValue = function(d){ 

    if (d.data.stackoverflow) {
      return d.data.stackoverflow;
    }
    else {
        return 0;
      }
    }
     ;

var sScale = d3.scaleLinear().range([3,95]);
var hScale = d3.scaleLinear().range([250,350]);
var sMap = function(d) { return sScale(sValue(d));};
var hMap = function(d) { return hScale(sValue(d));};

/*var colorScale = d3.scaleLinear( d3.interpolateBuPu)
  .domain([0, 100])
  .range([0, 600]);*/



// retrieve Data
d3.json("https://imld.de/docs/lehre/ws_18-19/data-vis/data/web-vis-tools.json", function(error, data) {


//domain color
sScale.domain([0, 31806]);
hScale.domain([0, 31806]);

//sort
data.children.sort(function(a, b) { return d3.ascending(a.stackoverflow, b.stackoverflow); });

// prepare tree layout in size
var treeLayout = d3.tree()
  .size([800, 400]);

// get hierachy data
var root = d3.hierarchy(data);

// hierachy object to tree
treeLayout(root);



// Nodes
/*d3.select('svg g.nodes')
  .selectAll('circle.node')
  .data(root.descendants())
  .enter()
  .append('circle')
  .classed('node', true)
  .attr('cx', function(d) {return d.x;})
  .attr('cy', function(d) {return d.y;})
  .attr('r', 4);*/

// Links
var links = d3.select('svg g ')
  .selectAll('line.link')
  .data(root.links())
  .enter()
  .append('line')
  .classed('link', true)
  .attr('x1', function(d) {return d.source.x;})
  .attr('y1', function(d) {return d.source.y;})
  .attr('x2', function(d) {return d.target.x;})
  .attr('y2', function(d) {return d.target.y;})
  .attr("transform", transform(d3.zoomIdentity));;


// Nodes
var rect = d3.select('svg g ')
  .selectAll('rect.node')
  .data(root.descendants())
  .enter()
  .append('rect')
  .classed('node', true)
  .attr('x', function(d) {return d.x-5;})
  .attr('y', function(d) {return d.y-5;})
  .attr('rx', function(d) {

        if (d.data.free) {
              return 0;
        } else {
              return 100;
        }
  ;})
  .attr('ry', function(d) {

        if (d.data.free) {
              return 0;
        } else {
              return 100;
        }
  ;})
  .attr('width', 10)
  .attr('height', 10)
  .attr('fill',  function(d) {

    if (d.data.stackoverflow != null) {

    return 'hsl(190, 100%, '+Math.round(sMap(d))+'%)';
     //return 'hsl('+Math.round(hMap(d))+', 100%, 50%)';  

  } else {
    return "#111";
  }


  })
  .attr("transform", transform(d3.zoomIdentity));;
    





//Text
var text = d3.select('svg g ')
  .selectAll('text.label')
  .data(root.descendants())
  .enter()
  .append('text')
  .classed('label', true)
  .text( function(d) {return d.data.name;})
  .attr('x', function(d) {return d.x;})
  .attr('y', function(d) {return d.y+15;})
  .attr("transform", transform(d3.zoomIdentity))
  .attr("fill", "transparent")
  .attr("text-anchor", "middle");
  //.attr('transform',function(d) {return 'rotate(90,'+d.x+','+d.y+')'})


//Description
/*var descr = d3.select('svg g ')
  .selectAll('text.descr')
  .data(root.descendants())
  .enter()
  .append('text')
  .classed('descr', true)
  .text( function(d) {return d.data.description;})
  .attr('x', function(d) {return d.x;})
  .attr('y', function(d) {return d.y+30;})
  .attr("transform", transform(d3.zoomIdentity))
  .attr("fill", "transparent")
  .attr("text-anchor", "middle")
  .attr("inline-size","20");

var desc = d3.select('svg g ')
  .selectAll('foreignObject.descr')
  .data(root.descendants())
  .enter()
  .append("foreignObject")
    .classed('descr', true)
    .attr("width", 1600)
    .attr("height", 830)
    .attr("transform", transform(d3.zoomIdentity))
  .append("xhtml:div")
    .style("top", function(d) {return d.x+"px";})
    .style("left", function(d) {return d.y+"px";})
    .style("position","relative")
    .style("font", "14px 'Helvetica Neue'")
    .html("Phasellus sed<br>vestibulum sapien.");*/
    

var desc = d3.select('svg g ')
  .selectAll('text.desc')
  .data(root.descendants())
  .enter()
  .append('text')
  .classed('desc', true)
  .attr('x', function(d) {return d.x;})
  .attr('y', function(d) {return d.y+20;})
  .attr("transform", transform(d3.zoomIdentity))
  .attr("fill", "transparent");
  //.attr("text-anchor", "middle")
  //.text( function(d) {return d.data.description;})

  desc.append("tspan")
  .text(function(d) {return d.data.url;})
  .attr("dy",  0)
  .attr("x", function(d) {return d.x;})
  .attr("text-anchor", "middle")
  .style("font-size","2px")
  .attr("class", "tspanurl");

  desc.append("tspan")
  .text(function(d) {return 'free: '+d.data.free;})
  .attr("dy",  4)
  .attr("x", function(d) {return d.x;})
  .attr("text-anchor", "middle")
  .attr("class", "tspanfree");

  desc.append("tspan")
  .text(function(d) {return 'stackOF: '+d.data.stackoverflow;})
  .attr("dy",  5)
  .attr("x", function(d) {return d.x;})
  .attr("text-anchor", "middle")
  .attr("class", "tspanstack");


  desc.each( function(d) {
    if (d.data.description) {
      var stri = d.data.description;
      var arr = stri.split(" ");
      for (i = 0; i < arr.length; i=i+2) {
          d3.select(this).append("tspan")
              .text(arr[i]+' '+arr[i+1])
              .attr("dy", i ? "1.2em" : 7)
              .attr("x", d.x)
              .attr("text-anchor", "middle")
              .attr("class", "tspan" + i);
      }
    }
})



d3.select('svg').append("rect")
    .attr("width", width)
    .attr("height", height)
    .style("fill", "none")
    .style("pointer-events", "all")
    .call(d3.zoom()
        .scaleExtent([1,6])
        .on("zoom", zoomed));

function zoomed() {
  //g.attr("transform", d3.event.transform);
   rect.attr("transform", d3.event.transform);
   links.attr("transform", d3.event.transform);
   text.attr("transform", d3.event.transform);
    desc.attr("transform", d3.event.transform);

  console.log(d3.event.transform.k);

  var k = d3.event.transform.k;

  if (k == 1) {
    text.attr("fill", "transparent");
  }
  else {
    text.attr("fill", "#000");
    text.style("font-size", "4px");
  }

  if (k < 3 ) {
     desc.attr("fill", "transparent");
  }
  else {
    desc.attr("fill", "#000");
    desc.style("font-size", "3px");
  }
}

function transform(t) {
  return function(d) {
    return "translate(" + t.apply(d) + ") scale(" + t.apply(d) + ")";
  };
}

});