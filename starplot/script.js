

var coossize = 500;

var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = (coossize*2) - margin.left - margin.right,
    height = (coossize*2) - margin.top - margin.bottom;

// add the graph canvas to the body of the webpage
var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("viewBox","-"+coossize+" -"+coossize+" "+(coossize*2)+" "+(coossize*2));

svg.append("circle")
    .attr("cx", 0)
    .attr("cy", 0)
    .attr("r", 5)
    .attr("fill","black");


// Achse 1 (oben, unten)
svg.append("line")
  .attr("x1", 0)
  .attr("y1", -coossize)
  .attr("x2", 0)
  .attr("y2", coossize);

var oValue = function(d) { return d["Engine Size (l)"];}, // data -> value
    oScale = d3.scaleLinear().range([0, coossize]), // value -> display
    oMap = function(d) { return oScale(oValue(d));}; // data -> display

var uValue = function(d) { return d["Cyl"];}, // data -> value
    uScale = d3.scaleLinear().range([0, coossize]), // value -> display
    uMap = function(d) { return uScale(uValue(d));}; // data -> display


// Achse 2 (rechts oben, rechts unten)
svg.append("line")
  .attr("x1", 0)
  .attr("y1", -coossize)
  .attr("x2", 0)
  .attr("y2", coossize)
  .attr("transform","rotate(60)");

var roValue = function(d) { return d["Weight"];}, // data -> value
    roScale = d3.scaleLinear().range([0, coossize]), // value -> display
    roMap = function(d) { return roScale(roValue(d));}; // data -> display

var luValue = function(d) { return d["Wheel Base"];}, // data -> value
    luScale = d3.scaleLinear().range([0, coossize]), // value -> display
    luMap = function(d) { return luScale(luValue(d));}; // data -> display


// Achse 3
svg.append("line")
  .attr("x1", 0)
  .attr("y1", -coossize)
  .attr("x2", 0)
  .attr("y2", coossize)
  .attr("transform","rotate(120)");

var loValue = function(d) { return d["Len"];}, // data -> value
    loScale = d3.scaleLinear().range([0, coossize]), // value -> display
    loMap = function(d) { return loScale(loValue(d));}; // data -> display

var ruValue = function(d) { return d["Width"];}, // data -> value
    ruScale = d3.scaleLinear().range([0, coossize]), // value -> display
    ruMap = function(d) { return ruScale(ruValue(d));}; // data -> display



// load data
//d3.csv("cars.csv", function(error, data) {


d3.csv('cars.csv').then(function(data) {

  // change string (from CSV) into number format
  data.forEach(function(d) {
    d["Engine Size (l)"] = +d["Engine Size (l)"];
    d["Cyl"] = +d["Cyl"];
    d["Weight"] = +d["Weight"];
    d["Wheel Base"] = +d["Wheel Base"];
    d["Len"] = +d["Len"];
    d["Width"] = +d["Width"];
//    console.log(d);
  });

  // data.filter(function(d) { return d.Name === "Audi A4 3.0 4dr" })[4].value);
  // data[2].Name
  //.attr("d","M200 100 L220 150 H280 L300 100");


var car = 0;
var nex = 0;
var ney = 0;
var nex1 = 0;
var ney1 = 0;

  //set domain
  oScale.domain([d3.min(data, oValue)-1, d3.max(data, oValue)+1]);
  uScale.domain([d3.min(data, uValue)-1, d3.max(data, uValue)+1]);
  roScale.domain([d3.min(data, roValue)-1, d3.max(data, roValue)+1]);
  luScale.domain([d3.min(data, luValue)-1, d3.max(data, luValue)+1]);
  loScale.domain([d3.min(data, loValue)-1, d3.max(data, loValue)+1]);
  ruScale.domain([d3.min(data, ruValue)-1, d3.max(data, ruValue)+1]);



/* svg.append("path")
  .attr("d","M"+data[0].Width+" 0 L"+data[0].Len+" 400 L"+data[0].Weight+" 200 Z");*/

// oben - Achse 1
svg.append("circle")
    .attr("cx", 0)
    .attr("cy","-"+oMap(data[car]))
    .attr("r", 5)
    .attr("fill","black");

var co = "0 -"+oMap(data[car]);


// unten - Achse 4
svg.append("circle")
    .attr("cx", 0)
    .attr("cy",uMap(data[car]))
    .attr("r", 5)
    .attr("fill","black");

var cu = "0 "+uMap(data[car]);


// rechts oben  - Achse 2
svg.append("circle")
    .attr("cx", 0)
    .attr("cy","-"+roMap(data[car]))
    .attr("r", 5)
    .attr("fill","red")
    .attr("transform","rotate(60)");

nex = (-1)* roMap(data[car]) * Math.sin(-120* Math.PI /180);
ney = roMap(data[car]) * Math.cos(-120 * Math.PI/180);
var cro = nex+" "+ney;


// unten links - Achse 5
svg.append("circle")
    .attr("cx", 0)
    .attr("cy",luMap(data[car]))
    .attr("r", 5)
    .attr("fill","blau")
    .attr("transform","rotate(60)");

nex = (-1)* luMap(data[car]) * Math.sin(60* Math.PI /180);
ney = luMap(data[car]) * Math.cos(60 * Math.PI/180);
var clu = nex+" "+ney;


// rechts unten - Achse 3
svg.append("circle")
    .attr("cx", 0)
    .attr("cy","-"+ruMap(data[car]))
    .attr("r", 5)
    .attr("fill","blue")
    .attr("transform","rotate(120)");

nex = (-1)* ruMap(data[car]) * Math.sin(-60* Math.PI /180);
ney = ruMap(data[car]) * Math.cos(-60 * Math.PI/180);
var cru = nex+" "+ney;

// links oben - Achse 6
svg.append("circle")
    .attr("cx", 0)
    .attr("cy",loMap(data[car]))
    .attr("r", 5)
    .attr("fill","blue")
    .attr("transform","rotate(120)");

nex = (-1)* loMap(data[car]) * Math.sin(120* Math.PI /180);
ney = loMap(data[car]) * Math.cos(120 * Math.PI/180);
var clo = nex+" "+ney;




svg.append("path")
  .attr("d","M"+co+" L"+cro+" L"+cru+" L"+cu+" L"+clu+" L"+clo+" Z");


});