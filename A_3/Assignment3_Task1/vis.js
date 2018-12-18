// Assigment 3
// by Tabita Mädler and Paul Riedel



/* -------------------------------------------------------------
------------------------ T R E E      ------------------------
---------------------------------------------------------------------*/


// Doku: https://github.com/d3/d3-hierarchy#tree
// Tree: https://d3indepth.com/layouts/
// Pan & Zoom: https://bl.ocks.org/mbostock/4e3925cdc804db257a86fdef3a032a45



//Variables
var msvg = d3.select("svg"),
    mwidth = +msvg.attr("width"),
    mheight = +msvg.attr("height")

var g = msvg.append("g");


//Color Axis
//var colorS =  d3.scaleLinear().range([0,1]);

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


// retrieve Data
d3.json("https://imld.de/docs/lehre/ws_18-19/data-vis/data/web-vis-tools.json", function(error, data) {


//domain color
sScale.domain([0, 31806]);
hScale.domain([0, 31806]);

//----------------------------------------------------- TREE -----------------------------------------------------//

//sort
data.children.sort(function(a, b) { return d3.ascending(a.stackoverflow, b.stackoverflow); });

// prepare tree layout in size
var treeLayout = d3.tree()
  .size([800, 400]);

// get hierachy data
var root = d3.hierarchy(data);

// hierachy object to tree
treeLayout(root);



//----------------------------------------------------- VISUAL ELEMENTS -----------------------------------------------------//

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

    
// Values
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

  // url
  desc.append("tspan")
  .text(function(d) {return d.data.url;})
  .attr("dy",  0)
  .attr("x", function(d) {return d.x;})
  .attr("text-anchor", "middle")
  .style("font-size","2px")
  .attr("class", "tspanurl");

   // Free
  desc.append("tspan")
  .text(function(d) {return 'free: '+d.data.free;})
  .attr("dy",  4)
  .attr("x", function(d) {return d.x;})
  .attr("text-anchor", "middle")
  .attr("class", "tspanfree");

   // stack
  desc.append("tspan")
  .text(function(d) {return 'stackOF: '+d.data.stackoverflow;})
  .attr("dy",  5)
  .attr("x", function(d) {return d.x;})
  .attr("text-anchor", "middle")
  .attr("class", "tspanstack");

  // description
  // use for each to create line breakes
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

//----------------------------------------------------- ZOOM -----------------------------------------------------//

// Zoom & Pan rect
d3.select('svg').append("rect")
    .attr("width", mwidth)
    .attr("height", mheight)
    .style("fill", "none")
    .style("pointer-events", "all")
    .call(d3.zoom()
        .scaleExtent([1,6])
        .on("zoom", zoomed));


// Zoom Fuction
function zoomed() {
  //g.attr("transform", d3.event.transform);
  rect.attr("transform", d3.event.transform);
  links.attr("transform", d3.event.transform);
  text.attr("transform", d3.event.transform);
  desc.attr("transform", d3.event.transform);

  console.log(d3.event.transform.k);


  // Semantic Zoom
  var k = d3.event.transform.k;

  // (i) no lable
  if (k == 1) {
    text.attr("fill", "transparent");
  }
  // (ii) lable
  else {
    text.attr("fill", "#fff");
    text.style("font-size", "4px");
  }

  if (k < 3 ) {
     desc.attr("fill", "transparent");
  }
  // (iii) lable and values
  else {
    desc.attr("fill", "#000");
    desc.style("font-size", "3px");
  }
}


// Transform
function transform(t) {
  return function(d) {
    return "translate(" + t.apply(d) + ") scale(" + t.apply(d) + ")";
  };
}

});





/* -------------------------------------------------------------
------------------------S U N B U R S T ------------------------
---------------------------------------------------------------------*/


  /*
  Source https://bl.ocks.org/vasturiano/12da9071095fbd4df434e60d52d2d58d
  Bearbeitet Stellen sind mit deutschen Kommentaren versehen
  */
  rememberText=' ';
        const width = window.innerWidth,
            height = window.innerHeight,
            maxRadius = (Math.min(width, height) / 2) - 5;

        const formatNumber = d3.format(',d');

        const x = d3.scaleLinear()
            .range([0, 2 * Math.PI])
            .clamp(true);

        const y = d3.scaleSqrt()
            .range([maxRadius*.1, maxRadius]);

        const color = d3.scaleOrdinal(d3.schemeCategory20);

        const partition = d3.partition();

        const arc = d3.arc()
            .startAngle(d => x(d.x0))
            .endAngle(d => x(d.x1))
            .innerRadius(d => Math.max(0, y(d.y0)))
            .outerRadius(d => Math.max(0, y(d.y1)));

        const middleArcLine = d => {
            const halfPi = Math.PI/2;
            const angles = [x(d.x0) - halfPi, x(d.x1) - halfPi];
            const r = Math.max(0, (y(d.y0) + y(d.y1)) / 2);

            const middleAngle = (angles[1] + angles[0]) / 2;
            const invertDirection = middleAngle > 0 && middleAngle < Math.PI; // On lower quadrants write text ccw
            if (invertDirection) { angles.reverse(); }

            const path = d3.path();
            path.arc(0, 0, r, angles[0], angles[1], invertDirection);
            return path.toString();
        };
      const outerArcLine = d => {
            const halfPi = Math.PI/2;
            const angles = [x(d.x0) - halfPi, x(d.x1) - halfPi];
            const r = Math.max(0, (y(d.y0) + y(d.y1)) / 1.5);

            const middleAngle = (angles[1] + angles[0]) / 2;
            const invertDirection = middleAngle > 0 && middleAngle < Math.PI; // On lower quadrants write text ccw
            if (invertDirection) { angles.reverse(); }

            const path = d3.path();
            path.arc(0, 0, r, angles[0], angles[1], invertDirection);
            return path.toString();
        };
     const innerArcLine = d => {
            const halfPi = Math.PI/2;
            const angles = [x(d.x0) - halfPi, x(d.x1) - halfPi];
            const r = Math.max(0, (y(d.y0) + y(d.y1)) / 2.5);

            const middleAngle = (angles[1] + angles[0]) / 2;
            const invertDirection = middleAngle > 0 && middleAngle < Math.PI; // On lower quadrants write text ccw
            if (invertDirection) { angles.reverse(); }

            const path = d3.path();
            path.arc(0, 0, r, angles[0], angles[1], invertDirection);
            return path.toString();
        };

        const textFits = d => {
            const CHAR_SPACE = 6;

            const deltaAngle = x(d.x1) - x(d.x0);
            const r = Math.max(0, (y(d.y0) + y(d.y1)) / 2);
            const perimeter = r * deltaAngle;

            return d.data.name.length * CHAR_SPACE < perimeter;
        };

        const svg = d3.select('#sundiv').append('svg')
            .style('width', '100%')
            .style('height', '100%')
            .attr('viewBox', '-600 -472 1200 900'/*`${-width / 2} ${-height / 2} ${width} ${height}`*/)
            .on('click', () => focusOn()); // Reset zoom on canvas click

        d3.json('https://imld.de/docs/lehre/ws_18-19/data-vis/data/web-vis-tools.json', (error, root) => {
            if (error) throw error;

            root = d3.hierarchy(root);
            root.sum(d => 1);

            const slice = svg.selectAll('g.slice')
                .data(partition(root).descendants());

            slice.exit().remove();

            const newSlice = slice.enter()
                .append('g').attr('class', 'slice')
        .attr('id', d => d.data.name)
                .on('click', d => {
                    d3.event.stopPropagation();
                    focusOn(d);
                })
        .on('mouseover', d => {
          infoOnDemand(d);
        })
    .on('mouseout', d=> {
      hideInfo(d);
    });

            newSlice.append('title')
                .text(d => d.data.name + '\n' + formatNumber(d.value));

            newSlice.append('path')
                .attr('class', 'main-arc')
                .style('fill', d => color((d.children ? d : d.parent).data.name))
                .attr('d', arc);

            newSlice.append('path')
                .attr('class', 'hidden-arc')
                .attr('id', (_, i) => `hiddenArc${i}`)
                .attr('d', middleArcLine);
        
        newSlice.append('path')
                .attr('class', 'hidden-arc-outer')
                .attr('id', (_, i) => `outerhiddenArc${i}`)
                .attr('d', innerArcLine);
        
        newSlice.append('path')
                .attr('class', 'hidden-arc-inner')
               // .attr('id', (_, i) => `hiddenArc${i}`)
                .attr('d', outerArcLine);

            const text = newSlice.append('text')
                .attr('display', d => textFits(d) ? null : 'none');

            // Add white contour
            text.append('textPath')
                .attr('startOffset','50%')
                .attr('xlink:href', (_, i) => `#hiddenArc${i}` )
                .text(d => d.data.name)
                .style('fill', 'none')
                .style('stroke', '#fff')
                .style('stroke-width', 5)
                .style('stroke-linejoin', 'round');

            text.append('textPath')
                .attr('startOffset','50%')
                .attr('xlink:href', (_, i) => `#hiddenArc${i}` )
                .text(d => d.data.name);
        });
    /*
    Ausgabe der Discription und des Values (alle Knoten des Astes/Bursts ink. den Ausgewaehlten/Root)
    */
    function infoOnDemand(d){
      i= svg.select('g[id="'+rememberText+'"]').select('.hidden-arc-outer').attr('id');
        svg.select('g[id="'+rememberText+'"]')
          .selectAll('textPath').attr('xlink:href', "#"+i  )
               .text(d.data.description +"             Value: "+ d.value);
    }
    /* 
    Die Zurücksetzen-Funktion für den Nodenamen
    */
    function hideInfo(d){
      i= svg.select('g[id="'+rememberText+'"]').select('.hidden-arc').attr('id');
        svg.select('g[id="'+rememberText+'"]')
          .selectAll('textPath').attr('xlink:href', "#"+i  )
               .text(' ');
    }

        function focusOn(d = { x0: 0, x1: 1, y0: 0, y1: 1 , data: 0}) {
            // Reset to top-level if no data point specified
  
            const transition = svg.transition()
                .duration(750)
                .tween('scale', () => {
                    const xd = d3.interpolate(x.domain(), [d.x0, d.x1]),
                        yd = d3.interpolate(y.domain(), [d.y0, 1]);
                    return t => { x.domain(xd(t)); y.domain(yd(t)); };
                });

            transition.selectAll('path.main-arc')
                .attrTween('d', d => () => arc(d));

            transition.selectAll('path.hidden-arc')
                .attrTween('d', d => () => middleArcLine(d));
       transition.selectAll('path.hidden-arc-outer')
                .attrTween('d', d => () => outerArcLine(d));
         transition.selectAll('path.hidden-arc-inner')
                .attrTween('d', d => () => innerArcLine(d));
            transition.selectAll('text')
                .attrTween('display', d => () => textFits(d) ? null : 'none');
            moveStackToFront(d);

    /*
      Zurücksetzten der Ausgabe Position für den Namen
    
    
    */
    hideInfo(d);
    /*
      -merken des aktuellen Mittelknotens 
      -Änderung des Labels im Textbereich
    */
      if( d.data != 0){
        
        if(d.depth = 0){
          
          svg.select('g[id="'+rememberText+'"]')
          .selectAll('textPath').text(rememberText);
        }
          else
          {
            if(rememberText != ''){
            svg.select('g[id="'+rememberText+'"]')
            .selectAll('textPath').text(rememberText);
            }
            
          
          rememberText=svg.select('g[id="'+d.data.name+'"]')
          .selectAll('textPath').text();
          svg.select('g[id="'+d.data.name+'"]')
          .selectAll('textPath').text('');
          }
        }
        else{
  
          svg.select('g[id="'+rememberText+'"]')
          .selectAll('textPath').text(rememberText);
        
        
        }
        
            function moveStackToFront(elD) {
                svg.selectAll('.slice').filter(d => d === elD)
                    .each(function(d) {
                        this.parentNode.appendChild(this);
                        if (d.parent) { moveStackToFront(d.parent); }
                    })
            }
        }
    