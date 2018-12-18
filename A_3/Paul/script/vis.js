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

        const svg = d3.select('body').append('svg')
            .style('width', '100vw')
            .style('height', '50vh')
            .attr('viewBox', `${-width / 2} ${-height / 2} ${width} ${height}`)
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
    