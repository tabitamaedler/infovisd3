// Assigment 2
// by Tabita Mädler and Paul Ridel

// Scatterplot - mostly from http://bl.ocks.org/weiglemc/6185069
// Starplot - mostly self written

// -------------------------------------------------------------------------------------------------------------------------------------------------------------
// -------------------------------------------------------------- G L O B A L  ---------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------------------------------------------------------------------

// Variables

// choose car 
  var car = 0;
  var oldselpoint = document.createElement("div");

  var carname;
  var carstr;


function selectdataobj(name, clearname){
    d3.selectAll(".selecteddata").classed('selecteddata', false);
    d3.selectAll("."+name).classed('selecteddata', true);
    console.log(name);

    d3.select("#out_select").html(clearname);
}

function hoverdataobj(name, clearname){
    d3.selectAll(".hovereddata").classed('hovereddata', false);
    d3.selectAll("."+name).classed('hovereddata', true);
    console.log(name);

    d3.select("#out_hover").html(clearname);
}

// select car and draw star plot
function drawnewstarplot(selcar){
  car = selcar;
  console.log("Car: "+selcar);
  
  d3.select("#stargroup").remove();
  drawstarplot();
}


function classfromname(str){
  var newstr;
  newstr = str.split(' ').join('_');
  newstr = newstr.split('.').join('_');
  newstr = newstr.split('(').join('_');
  newstr = newstr.split(')').join('_');
  newstr = newstr.split('/').join('_');
  return newstr;
}


// -------------------------------------------------------------------------------------------------------------------------------------------------------------
// -------------------------------------------------------------- P A R A L L E L  C O O R D I N A T E S -------------------------------------------------------
// -------------------------------------------------------------------------------------------------------------------------------------------------------------

var margin = {top: 30, right: 10, bottom: 10, left: 10},
    width = 1450 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

var x = d3.scale.ordinal().rangePoints([0, width], 1),
    y = {},
  d = {},
    dragging = {};

var line = d3.svg.line(),
    axis = d3.svg.axis().orient("left"),
    background,
    foreground;

var svg = d3.select("#paralleldiv").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.csv("cars.csv", function(error, cars) {
  
  // Extract the list of dimensions and create a scale for each.
  x.domain(dimensions = d3.keys(cars[0]).filter(function(d) {
  switch(d){
  case "Name":break;
  case "Type":break;
  //case "AWD":break;
  //case "RWD":break;
  default: return d && (y[d] = d3.scale.linear()
        .domain(d3.extent(cars, function(p) { return +p[d]; }))
        .range([height,0]));
  };
  }));

  var i=0;
  cars.forEach(function(d) {
    d["id"] = i++;
    console.log(d["id"]);
  });

  

  // Add grey background lines for context.
  background = svg.append("g")
      .attr("class", "background")
    .selectAll("path")
      .data(cars)
    .enter().append("path")
      .attr("d", path);

  // Add blue foreground lines for focus.
  foreground = svg.append("g")
      .attr("class", "foreground")
    .selectAll("path")
      .data(cars)
    .enter().append("path")
      .attr("d", path)
      .attr("class",function(d) {
        carstr = classfromname(d["Name"]);
        return carstr+" dataline";
      })
      .on("mouseover", function(d) {
          carstr = classfromname(d["Name"]);
          hoverdataobj(carstr, d["Name"]);
      })
      .on("mouseout", function(d) {
      })
      .on("click", function(d) {
          //clickanddraw(d["id"], this);
          carstr = classfromname(d["Name"]);
          selectdataobj(carstr, d["Name"]);
          drawnewstarplot(d["id"]);
      }); 

  // Add a group element for each dimension.
  var g = svg.selectAll(".dimension")
      .data(dimensions)
    .enter().append("g")
      .attr("class", "dimension")
      .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
      .call(d3.behavior.drag()
        .origin(function(d) { return {x: x(d)}; })
        .on("dragstart", function(d) {
          dragging[d] = x(d);
          background.attr("visibility", "hidden");
        })
        .on("drag", function(d) {
          dragging[d] = Math.min(width, Math.max(0, d3.event.x));
          foreground.attr("d", path);
          dimensions.sort(function(a, b) { return position(a) - position(b); });
          x.domain(dimensions);
          g.attr("transform", function(d) { return "translate(" + position(d) + ")"; })
        })
        .on("dragend", function(d) {
          delete dragging[d];
          transition(d3.select(this)).attr("transform", "translate(" + x(d) + ")");
          transition(foreground).attr("d", path);
          background
              .attr("d", path)
            .transition()
              .delay(500)
              .duration(0)
              .attr("visibility", null);
        }));

  // Add an axis and title.
  g.append("g")
      .attr("class", "axis")
      .each(function(d) { d3.select(this).call(axis.scale(y[d])); })
    .append("text")
      .style("text-anchor", "middle")
      .attr("y", -9)
      .text(function(d) { return d; });

  // Add and store a brush for each axis.
  g.append("g")
      .attr("class", "brush")
      .each(function(d) {
        d3.select(this).call(y[d].brush = d3.svg.brush().y(y[d]).on("brushstart", brushstart).on("brush", brush));
      })
    .selectAll("rect")
      .attr("x", -8)
      .attr("width", 16);

}); // end cvs

function position(d) {
  var v = dragging[d];
  return v == null ? x(d) : v;
}

function transition(g) {
  return g.transition().duration(500);
}

// Returns the path for a given data point.
function path(d) {
  return line(dimensions.map(function(p) { return [position(p), y[p](d[p])]; }));
}

function brushstart() {
  d3.event.sourceEvent.stopPropagation();
}

// Handles a brush event, toggling the display of foreground lines.
function brush() {
  var actives = dimensions.filter(function(p) { return !y[p].brush.empty(); }),
      extents = actives.map(function(p) { return y[p].brush.extent(); });
  foreground.style("display", function(d) {
    return actives.every(function(p, i) {
      return extents[i][0] <= d[p] && d[p] <= extents[i][1];
    }) ? null : "none";
  });
}



// -------------------------------------------------------------------------------------------------------------------------------------------------------------
// -------------------------------------------------------------- S C A T T E R P L O T ------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------------------------------------------------------------------



var margin2 = {top: 20, right: 20, bottom: 30, left: 40},
    width2 = 1000 - margin2.left - margin2.right,
    height2 = 550 - margin2.top - margin2.bottom;


// setup x 
var xValue = function(d) { return d["Horsepower(HP)"];}, // data -> value
    xScale = d3.scale.linear().range([0, width2]), // value -> display
    xMap = function(d) { return xScale(xValue(d));}, // data -> display
    xAxis = d3.svg.axis().scale(xScale).orient("bottom"); //d3.axisBottom().scale(xScale); 

// setup y
var yValue = function(d) { return d["Retail Price"];}, // data -> value
    yScale = d3.scale.linear().range([height2, 0]), // value -> display
    yMap = function(d) { return yScale(yValue(d));}, // data -> display
    yAxis = d3.svg.axis().scale(yScale).orient("left"); // d3.axisLeft().scale(yScale);  

// setup fill color
var cValue = function(d) { return d.Type;},
    color = d3.scale.ordinal().range(["#ef6f6c", "#9b7ede" ,"#832161","#c0c999","#76e7cd"]);//category10(); //color = d3.scaleOrdinal(d3.schemeCategory10);

// add the graph canvas to the body of the webpage
var svg2 = d3.select("#scatterplotdiv").append("svg")
    .attr("width", width2 + margin2.left + margin2.right)
    .attr("height", height2 + margin2.top + margin2.bottom)
  .append("g")
    .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

var svgled = d3.select("#legend").append("svg")
    .attr("width", "500")
    .attr("height", "30");

// add the tooltip area to the webpage
var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);


// load data
d3.csv("cars.csv", function(error, data) {
//d3.csv('cars.csv').then(function(data) {

  // change string (from CSV) into number format
  var i=0;
  data.forEach(function(d) {
    d["Horsepower(HP)"] = +d["Horsepower(HP)"];
    d["Retail Price"] = +d["Retail Price"];
    d["id"] = i++;
//    console.log(d);
  });

  // don't want dots overlapping axis, so add in buffer to data domain
  xScale.domain([d3.min(data, xValue)-1, d3.max(data, xValue)+1]);
  yScale.domain([d3.min(data, yValue)-1, d3.max(data, yValue)+1]);

  // x-axis
  svg2.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0,500)")
      .call(xAxis)
    .append("text")
      .attr("class", "label")
      .attr("x", width2)
      .attr("y", -6)
      .style("text-anchor", "end")
      .text("Horsepower(HP)");

  // y-axis
  svg2.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Retail Price");

 // draw dots
  svg2.selectAll(".dot")
      .data(data)
    .enter().append("circle")
      .attr("class",function(d) {
        carname = d["Name"];
        carstr = carname.split(' ').join('_');
        return carstr+" datapoint"+" dot";
      })
      .attr("r", 3.5)
      .attr("cx", xMap)
      .attr("cy", yMap)
      .style("fill", function(d) { return color(cValue(d));}) 
      .on("mouseover", function(d) {
          tooltip.transition()
               .duration(200)
               .style("opacity", .9);
          tooltip.html(d["Name"] + "<br/> (" + xValue(d) 
	        + ", " + yValue(d) + ")")
               .style("left", (d3.event.pageX + 5) + "px")
               .style("top", (d3.event.pageY - 28) + "px");

          //hightlight 
          carstr = classfromname(d["Name"]);
          hoverdataobj(carstr, d["Name"]);

      })
      .on("mouseout", function(d) {
          tooltip.transition()
               .duration(500)
               .style("opacity", 0);
      })
      .on("click", function(d) {
          drawnewstarplot(d["id"]);
          carstr = classfromname(d["Name"]);
          selectdataobj(carstr, d["Name"]);
      });

  // draw legend
  var legend = svgled.selectAll(".legend")
      .data(color.domain())
    .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(" + i * 80 + ",0)"; });

  // draw legend colored rectangles
  legend.append("rect")
      .attr("x", 18)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", color);

  // draw legend text
  legend.append("text")
      .attr("x", 40)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "start")
      .text(function(d) { return d;})
});











// -------------------------------------------------------------------------------------------------------------------------------------------------------------
// -------------------------------------------------------------- S T A R P L O T  -----------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------------------------------------------------------------------






//------------------------ PRE-SETTINGS ------------------------
// set domain length of axises
var coossize = 500;

// position
var margin3 = {top: 20, right: 20, bottom: 30, left: 40},
    width3 = (coossize*2) - margin3.left - margin3.right,
    height3 = (coossize*2) - margin3.top - margin3.bottom;


// add svg, set height and weight
// viewbox makes (0,0) appear in the center
var svg3 = d3.select("#starplotdiv").append("svg")
    .attr("width", 550)
    .attr("height", 550)
    .attr("viewBox","-"+coossize+" -"+coossize+" "+(coossize*2+20)+" "+(coossize*2));

// add the tooltip area to the webpage
var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);



// ------------------------ STATIC DRAWING ------------------------
// point of origin
svg3.append("circle")
    .attr("cx", 0)
    .attr("cy", 0)
    .attr("r", 5)
    .attr("fill","black");

// Axis 1 and 4 (top to bottom)
svg3.append("line")
  .attr("class", "starline")
  .attr("x1", 0)
  .attr("y1", -coossize)
  .attr("x2", 0)
  .attr("y2", coossize);

// Axis 2 and 5 (right top to left bottom)
svg3.append("line")
  .attr("class", "starline")
  .attr("x1", 0)
  .attr("y1", -coossize)
  .attr("x2", 0)
  .attr("y2", coossize)
  .attr("transform","rotate(60)");

// Axis 3 and 6 (right bottom to left top)
svg3.append("line")
  .attr("class", "starline")
  .attr("x1", 0)
  .attr("y1", -coossize)
  .attr("x2", 0)
  .attr("y2", coossize)
  .attr("transform","rotate(120)");



// ------------------------ MAPPING  ------------------------

var mapaxis1 = "Engine Size (l)",
    mapaxis2 = "Weight",
    mapaxis3 = "Width",
    mapaxis4 = "Cyl",
    mapaxis5 = "Wheel Base",
    mapaxis6 = "Len";

var axises = [mapaxis1,mapaxis2,mapaxis3,mapaxis4,mapaxis5,mapaxis6];


// For all axises 
var aValue = function(d,i) { return d[axises[i]];}; // data -> value
   //aScale = d3.scaleLinear().range([0, coossize]), // value -> display
    //aMap = function(d,i) { return aScale(aValue(d,i));}; // data -> display


// Axis 1
var oValue = function(d) { return d[mapaxis1];}, // data -> value
    oScale = d3.scale.linear().range([0, coossize]), // value -> display
    oMap = function(d) { return oScale(oValue(d));}; // data -> display

// Axis 2
var roValue = function(d) { return d[mapaxis2];}, // data -> value
    roScale = d3.scale.linear().range([0, coossize]), // value -> display
    roMap = function(d) { return roScale(roValue(d));}; // data -> display

// Axis 3
var ruValue = function(d) { return d[mapaxis3];}, // data -> value
    ruScale = d3.scale.linear().range([0, coossize]), // value -> display
    ruMap = function(d) { return ruScale(ruValue(d));}; // data -> display

// Axis 4
var uValue = function(d) { return d[mapaxis4];}, // data -> value
    uScale = d3.scale.linear().range([0, coossize]), // value -> display
    uMap = function(d) { return uScale(uValue(d));}; // data -> display

// Axis 5
var luValue = function(d) { return d[mapaxis5];}, // data -> value
    luScale = d3.scale.linear().range([0, coossize]), // value -> display
    luMap = function(d) { return luScale(luValue(d));}; // data -> display

// Axis 6
var loValue = function(d) { return d[mapaxis6];}, // data -> value
    loScale = d3.scale.linear().range([0, coossize]), // value -> display
    loMap = function(d) { return loScale(loValue(d));}; // data -> display



// ------------------------ AXIS LABELING  ------------------------

// Initaliate 
var i;
var rot=0,
    tranadd = "",
    textan="end";

for (i = 0; i < axises.length; i++) {

    // Add axis position to textrotation
    var rot = -90 + (60*i);

    // Translate and mirror text on the left side
    if (i >2) {
      tranadd = " scale(-1,-1) translate(-1000 0)";
      textan = "start";
    }

    // Create Label
    svg3.append("text")
      .attr("class", "label")
      .attr("x", coossize)
      .attr("y", -10)
      .style("text-anchor", textan)
      .attr("transform", "rotate("+rot+")"+tranadd  )
      .text(axises[i]);
} 



// ################################### DYNAMIC DATA  ###################################

function drawstarplot() {
//d3.csv('cars.csv').then(function(data) {
d3.csv("cars.csv", function(error, data) {

  console.log("Starplot: "+data[car]["Name"]);

  // initaliate variables
  var nex = 0, // new x coordinate
      ney = 0; // new y coordinate

  // change string (from CSV) into number format
  data.forEach(function(d) {
    d[mapaxis1] = +d[mapaxis1];
    d[mapaxis2] = +d[mapaxis2];
    d[mapaxis3] = +d[mapaxis3];
    d[mapaxis4] = +d[mapaxis4];
    d[mapaxis5] = +d[mapaxis5];
    d[mapaxis6] = +d[mapaxis6];
  });

  //set domain range for axises
  //aScale.domain([d3.min(data, aValue)-1, d3.max(data, aValue)+1]);

  oScale.domain([d3.min(data, oValue)-1, d3.max(data, oValue)+1]);
  uScale.domain([d3.min(data, uValue)-1, d3.max(data, uValue)+1]);
  roScale.domain([d3.min(data, roValue)-1, d3.max(data, roValue)+1]);
  luScale.domain([d3.min(data, luValue)-1, d3.max(data, luValue)+1]);
  loScale.domain([d3.min(data, loValue)-1, d3.max(data, loValue)+1]);
  ruScale.domain([d3.min(data, ruValue)-1, d3.max(data, ruValue)+1]);



  // ------------------------ CACULATE AND DRAW POLYGONE  ------------------------

  // axis 1
  var co = "0 -"+oMap(data[car]);

  // axis 2
  nex = (-1)* roMap(data[car]) * Math.sin(-120* Math.PI /180);
  ney = roMap(data[car]) * Math.cos(-120 * Math.PI/180);
  var cro = nex+" "+ney;

  // axis 3
  nex = (-1)* ruMap(data[car]) * Math.sin(-60* Math.PI /180);
  ney = ruMap(data[car]) * Math.cos(-60 * Math.PI/180);
  var cru = nex+" "+ney;

  // axis 4
  var cu = "0 "+uMap(data[car]);

  // axis 5
  nex = (-1)* luMap(data[car]) * Math.sin(60* Math.PI /180);
  ney = luMap(data[car]) * Math.cos(60 * Math.PI/180);
  var clu = nex+" "+ney;

  // axis 6
  nex = (-1)* loMap(data[car]) * Math.sin(120* Math.PI /180);
  ney = loMap(data[car]) * Math.cos(120 * Math.PI/180);
  var clo = nex+" "+ney;



 var star = svg3.append("g")
        .attr("id", "stargroup");

  //draw line
  star.append("path")
        .attr("class", "starpath")
        .attr("d","M"+co+" L"+cro+" L"+cru+" L"+cu+" L"+clu+" L"+clo+" Z");





  // ------------------------ DATA POINTS ------------------------

  // Axis 1 (top)
  star.append("circle")
    .attr("class", "cvalue")
    .attr("cx", 0)
    .attr("cy","-"+oMap(data[car]))
    .attr("r", 5)
    .on("mouseover", function() {
          tooltip.transition()
               .duration(200)
               .style("opacity", .9);
          tooltip.html(aValue(data[car],0))
               .style("left", (d3.event.pageX + 5) + "px")
               .style("top", (d3.event.pageY - 28) + "px");
      })
      .on("mouseout", function() {
          tooltip.transition()
               .duration(500)
               .style("opacity", 0);
      });;

  // Axis 2 (right top)
  star.append("circle")
    .attr("class", "cirvalue")
    .attr("cx", 0)
    .attr("cy","-"+roMap(data[car]))
    .attr("r", 5)
    .attr("transform","rotate(60)");

  // Axis 3 (right bottom)
  star.append("circle")
    .attr("class", "cirvalue")
    .attr("cx", 0)
    .attr("cy","-"+ruMap(data[car]))
    .attr("r", 5)
    .attr("transform","rotate(120)");

  // Axis 4 (bottom)
  star.append("circle")
    .attr("class", "cviralue")
    .attr("cx", 0)
    .attr("cy",uMap(data[car]))
    .attr("r", 5);

  // unten links - Achse 5
  star.append("circle")
    .attr("class", "cirvalue")
    .attr("cx", 0)
    .attr("cy",luMap(data[car]))
    .attr("r", 5)
    .attr("transform","rotate(60)");

  // links oben - Achse 6
  star.append("circle")
    .attr("class", "cirvalue")
    .attr("cx", 0)
    .attr("cy",loMap(data[car]))
    .attr("r", 5)
    .attr("transform","rotate(120)");


});

};
