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

// select car and draw star plot
function clickanddraw(selcar,selpoint){
  oldselpoint.classList.remove("selecteddot");
  car = selcar;
  console.log("Car: "+selcar);
  
  d3.select("#stargroup").remove();
  drawstarplot();
  selpoint.classList.add("selecteddot");
  oldselpoint = selpoint;
}




// -------------------------------------------------------------------------------------------------------------------------------------------------------------
// -------------------------------------------------------------- S C A T T E R P L O T ------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------------------------------------------------------------------



var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 1000,
    height = 500;


// setup x 
var xValue = function(d) { return d["Horsepower(HP)"];}, // data -> value
    xScale = d3.scaleLinear().range([0, width]), // value -> display
    xMap = function(d) { return xScale(xValue(d));}, // data -> display
    xAxis = d3.axisBottom().scale(xScale); //svg2.axis().scale(xScale).orient("bottom");

// setup y
var yValue = function(d) { return d["Retail Price"];}, // data -> value
    yScale = d3.scaleLinear().range([height, 0]), // value -> display
    yMap = function(d) { return yScale(yValue(d));}, // data -> display
    yAxis = d3.axisLeft().scale(yScale);  //svg2.axis().scale(yScale).orient("left");

// setup fill color
var cValue = function(d) { return d.Type;},
    color = d3.scaleOrdinal(d3.schemeCategory10);

// add the graph canvas to the body of the webpage
var svg2 = d3.select("#scatterplotdiv").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// add the tooltip area to the webpage
var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);




// load data
//d3.csv("cars.csv", function(error, data) {


d3.csv('cars.csv').then(function(data) {

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
      .attr("x", width)
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
      .attr("class", "dot")
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
               this.style.stroke = "#bbb";
      })
      .on("mouseout", function(d) {
          tooltip.transition()
               .duration(500)
               .style("opacity", 0);
          this.style.stroke = "#444";
      })
      .on("click", function(d) {
          clickanddraw(d["id"], this);
      });

  // draw legend
  var legend = svg2.selectAll(".legend")
      .data(color.domain())
    .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

  // draw legend colored rectangles
  legend.append("rect")
      .attr("x", width - 18)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", color);

  // draw legend text
  legend.append("text")
      .attr("x", width - 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(function(d) { return d;})
});











// -------------------------------------------------------------------------------------------------------------------------------------------------------------
// -------------------------------------------------------------- S T A R P L O T  -----------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------------------------------------------------------------------







//------------------------ PRE-SETTINGS ------------------------
// set domain length of axises
var coossize = 500;

// position
var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = (coossize*2) - margin.left - margin.right,
    height = (coossize*2) - margin.top - margin.bottom;

// add svg, set height and weight
// viewbox makes (0,0) appear in the center
var svg3 = d3.select("#starplotdiv").append("svg")
    .attr("width", 550)
    .attr("height", 550)
    .attr("viewBox","-"+coossize+" -"+coossize+" "+(coossize*2)+" "+(coossize*2));

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
   /* aScale = d3.scaleLinear().range([0, coossize]), // value -> display
    aMap = function(d,i) { return aScale(aValue(d,i));}; // data -> display*/


// Axis 1
var oValue = function(d) { return d[mapaxis1];}, // data -> value
    oScale = d3.scaleLinear().range([0, coossize]), // value -> display
    oMap = function(d) { return oScale(oValue(d));}; // data -> display

// Axis 2
var roValue = function(d) { return d[mapaxis2];}, // data -> value
    roScale = d3.scaleLinear().range([0, coossize]), // value -> display
    roMap = function(d) { return roScale(roValue(d));}; // data -> display

// Axis 3
var ruValue = function(d) { return d[mapaxis3];}, // data -> value
    ruScale = d3.scaleLinear().range([0, coossize]), // value -> display
    ruMap = function(d) { return ruScale(ruValue(d));}; // data -> display

// Axis 4
var uValue = function(d) { return d[mapaxis4];}, // data -> value
    uScale = d3.scaleLinear().range([0, coossize]), // value -> display
    uMap = function(d) { return uScale(uValue(d));}; // data -> display

// Axis 5
var luValue = function(d) { return d[mapaxis5];}, // data -> value
    luScale = d3.scaleLinear().range([0, coossize]), // value -> display
    luMap = function(d) { return luScale(luValue(d));}; // data -> display

// Axis 6
var loValue = function(d) { return d[mapaxis6];}, // data -> value
    loScale = d3.scaleLinear().range([0, coossize]), // value -> display
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
d3.csv('cars.csv').then(function(data) {

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

