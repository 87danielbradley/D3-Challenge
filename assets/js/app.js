//Setting up chart
function makeResponsive() {
var svgArea = d3.select("#scatter").select("svg");

if (!svgArea.empty()) {
	svgArea.remove();
}
var svgWidth = window.innerWidth*0.9;
var svgHeight = window.innerHeight*0.9;

var margin = {
	top: window.innerHeight*0.1,
	right: window.innerHeight*0.2,
	bottom: window.innerHeight*0.2,
	left: window.innerHeight*0.2
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// creating svg wrapper,
// appending SVG group to hold chart,
// and shift group by left and top margins

var svg = d3
	.select("#scatter")
	.append("svg")
	.attr("width", svgWidth)
	.attr("height", svgHeight);

			
//Append SVG group
var chartGroup = svg.append("g")
	.attr("transform", `translate(${margin.left}, ${margin.top})`);
	
// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// function used to updating x-scale variable on click for axis label
function xScale (censusData,chosenXAxis) {
	
	//create scales
	var xLinearScale = d3.scaleLinear()
		.domain([d3.min(censusData, d=>d[chosenXAxis])*0.95,
		  d3.max(censusData, d=>d[chosenXAxis])*1.1
		])
		.range([0,width]); 
		
	return xLinearScale;
}




function yScale (censusData, chosenYAxis) {
	//create scales
	
	var yLinearScale = d3.scaleLinear()
		.domain([d3.min(censusData, d=> d[chosenYAxis]) *0.8,
		  d3.max(censusData, d => d[chosenYAxis]) *1.1
		])
		.range([height, 0]);  
		
	return yLinearScale;
}

function renderXAxes(newXScale, xAxis) {
	var bottomAxis = d3.axisBottom(newXScale);
	
	xAxis.transition()
		.duration(1000)
		.call(bottomAxis);
	
	return xAxis;
}
function renderYAxes(newYScale, yAxis) {
	var leftAxis = d3.axisLeft(newYScale);
	
	yAxis.transition()
		.duration(1000)
		.call(leftAxis);
	
	return yAxis;
}

function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
		
		circlesGroup.transition()
			.duration(1000)
			.attr("cx", d => newXScale(d[chosenXAxis]))
			.attr("cy", d => newYScale(d[chosenYAxis]));
		
		return circlesGroup;
}

function renderText(textGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

		textGroup.transition()
			.duration(1000)
			.attr("x", d => newXScale(d[chosenXAxis]))
			.attr("y", d => newYScale(d[chosenYAxis]));
		
		return textGroup;
}

//function used for updated circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup, chosenYAxis) {
	
	var xLabel;
	var yLabel;
	
	if (chosenXAxis === "poverty") {
		xLabel = "In Poverty: ";
	} else if (chosenXAxis === "age" ){
		xLabel = "Age: ";
	} else {
		xLabel = "Household Income: ";
	}
	if (chosenYAxis === "healthcare") {
		yLabel = "Lacks Healthcare: ";
	} else if (chosenYAxis === "smokes" ){
		yLabel = "Smokes: ";
	} else {
		yLabel = "Obese: ";
	}
	
	
	
	
	var toolTip = d3.tip()
		.attr("class", "tooltip")
		.offset([80,-60])
		.html(function(d) {
			return (`${d.state}<hr>${yLabel}${d[chosenYAxis]}<br>${xLabel} ${d[chosenXAxis]}`);
		});
	
	circlesGroup.call(toolTip);
	
	circlesGroup.on("mouseover", function(data) {
		d3.select(this).style("stroke","black")
		.attr("opacity", .5)
		.style("fill", "blue")
		.attr('r', 30);
		toolTip.show(data);
	})
		// onmouseout event
		.on("mouseout", function(data, index) {
			d3.select(this).style("stroke","red")
			.attr("opacity", 0.5)
			.style("fill", "red")
			.attr('r', 15);
			toolTip.hide(data);
		});

	return circlesGroup;
}

//retrieve data from CSV file and execute
d3.csv("assets/data/censusData.csv").then(function(censusData, err) {
	if (err) throw err;
	
	var states = censusData.map( d => d.state);
	var abbr = censusData.map(d => d.abbr);
	//parse data
	censusData.forEach(function(data){
	data.id = +data.id;
	data.poverty = +data.poverty;
	data.povertyMoe	= +data.povertyMoe;
	data.age = +data.age;
	data.ageMoe = +data.ageMoe;
	data.income	= +data.income;
	data.incomeMoe = +data.incomeMoe;
	data.healthcare	= +data.healthcare;
	data.healthcareLow = +data.healthcareLow;
	data.healthcareHigh	= +data.healthcareHigh;
	data.obesity = +data.obesity;
	data.obesityLow	= +data.obesityLow;
	data.obesityHigh = +data.obesityHigh;	
	data.smokes	= +data.smokes;
	data.smokesLow = +data.smokesLow;
	data.smokesHigh = +data.smokesHigh;
	
	});
	
	
	
	//xLinearScale function above csv import
	var xLinearScale = xScale(censusData, chosenXAxis);
	var yLinearScale = yScale(censusData, chosenYAxis);
	
	//create initial axis functions
	var bottomAxis = d3.axisBottom(xLinearScale);
	var leftAxis = d3.axisLeft(yLinearScale);
	
	//append x axis
	var xAxis = chartGroup.append("g")
		.classed("x-axis", true)
		.attr("transform", `translate(0, ${height})`)
		.call(bottomAxis);
		
	//append y axis
	var yAxis = chartGroup.append("g")
		.classed("y-axis", true)
		//.attr("transform", "rotate(-90)")
		.call(leftAxis);
	
	//append initial circles
	var circlesGroup = chartGroup.selectAll("circle")
		.data(censusData)
		.enter()
		.append("circle")
		.attr("cx", d => xLinearScale(d[chosenXAxis]))
		.attr("cy", d => yLinearScale(d[chosenYAxis]))
		.attr("r", 15)
		.attr("fill", "red")
		.attr("opacity", ".5");
		
	//append initial states
	var textGroup = chartGroup.selectAll()
		.data(censusData)
		.enter()
		.append("text")
		.text(d=> d.abbr)
		.attr("x", d => xLinearScale(d[chosenXAxis]))
		.attr("y", d => yLinearScale(d[chosenYAxis]))
		.style("text-anchor", "middle")
		.style("font-size", "10px")
		
	//create group for 3 x-axis labels
	var labelsGroup = chartGroup.append("g")
		.attr("transform", `translate(${width/2},${height+20})`);
		
	var povertyLabel = labelsGroup.append("text")
		.attr("x", 0)
		.attr("y", 20)
		.attr("value", "poverty") // value to grab for event listener
		.classed("active", true)
		.text ("In Poverty (%)");
	var ageLabel = labelsGroup.append("text")
		.attr("x", 0)
		.attr("y", 40)
		.attr("value", "age") // value to grab for event listener
		.classed("inactive", true)
		.text ("Age (Median)");
	var incomeLabel = labelsGroup.append("text")
		.attr("x", 0)
		.attr("y", 60)
		.attr("value", "income") // value to grab for event listener
		.classed("inactive", true)
		.text ("Household Income (Median)");
	
	////////////////////////////////////
	//create group for 3 y-axis labels
	//var ylabelsGroup = chartGroup.append("g")
	//	.attr("transform", "rotate(-90)");
	
	var healthcareLabel = labelsGroup.append("text")
		.attr("transform", "rotate(-90)")
		.attr("x", height/2+margin.top)
		.attr("y", 50 - (width/2)-margin.left)
		.attr("dy", "1em")
		.attr("value", "healthcare") // value to grab for event listener
		.classed("active", true)
		.text ("Lacks Healthcare (%)");
	
	var smokesLabel = labelsGroup.append("text")
		.attr("transform", "rotate(-90)")
		.attr("x", height/2+margin.top)
		.attr("y", 30 - (width/2)-margin.left)
		.attr("dy", "1em")
		.attr("value", "smokes") // value to grab for event listener
		.classed("inactive", true)
		.text ("Smokes (%)");

	var obeseLabel = labelsGroup.append("text")
		.attr("transform", "rotate(-90)")
		.attr("x", height/2+margin.top)
		.attr("y", 10 - (width/2)-margin.left)
		.attr("dy", "1em")
		.attr("value", "obesity") // value to grab for event listener
		.classed("inactive", true)
		.text ("Obese (%)");
	/////////////////////////////////////
	
	var circlesGroup = updateToolTip(chosenXAxis, circlesGroup, chosenYAxis);
	 
	//x axis labels event listener
	labelsGroup.selectAll("text")
		.on("click", function() {
			//get value of selection
			var value = d3.select(this).attr("value");
			//if (value !== chosenXAxis) {
			
			if (value == "poverty" || value == "age" || value =="income") {
				//replace chosenXAxis with value
				chosenXAxis = value;
				
				
				
				//functions here found abov csv import
				//updates x scale for new data
				xLinearScale = xScale(censusData, chosenXAxis);
				
				//updates x axis with transition
				xAxis = renderXAxes(xLinearScale, xAxis);
				
				// updates circles with new x values
				circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
				
				
				textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis)
				//updates circles with new x values
				
				circlesGroup = updateToolTip(chosenXAxis, circlesGroup, chosenYAxis);
				 
				//changes classes to change bold text
				
				if (chosenXAxis === "poverty") {
					
					povertyLabel
						.classed("active", true)
						.classed("inactive", false);
					ageLabel
						.classed("active", false)
						.classed("inactive",true);
					incomeLabel
						.classed("active", false)
						.classed("inactive", true);
				} else if (chosenXAxis === "age") {
					
					povertyLabel
						.classed("active", false)
						.classed("inactive", true);
					ageLabel
						.classed("active", true)
						.classed("inactive", false);
					incomeLabel
						.classed("active", false)
						.classed("inactive", true);
				} else {
					
					povertyLabel
						.classed("active", false)
						.classed("inactive",true);
					ageLabel
						.classed("active", false)
						.classed("inactive",true);
					incomeLabel
						.classed("active", true)
						.classed("inactive", false);
				}
			} else if (value === "healthcare"|| value === "smokes"|| value === "obesity") {
				//replace chosenXAxis with value
				chosenYAxis = value;
				
				
				
				//functions here found abov csv import
				//updates x scale for new data
				
				yLinearScale = yScale(censusData, chosenYAxis);
				
				//updates x axis with transition
				yAxis = renderYAxes(yLinearScale, yAxis);
				
				//updates circles with new x values
				circlesGroup = updateToolTip(chosenXAxis, circlesGroup, chosenYAxis);
				
				//changes classes to change bold text
				
				if (chosenYAxis === "healthcare") {
					
					healthcareLabel
						.classed("active", true)
						.classed("inactive", false);
					smokesLabel
						.classed("active", false)
						.classed("inactive",true);
					obeseLabel
						.classed("active", false)
						.classed("inactive", true);
				} else if (chosenYAxis === "smokes") {
					
					healthcareLabel
						.classed("active", false)
						.classed("inactive",true);
					smokesLabel
						.classed("active", true)
						.classed("inactive", false);
					obeseLabel
						.classed("active", false)
						.classed("inactive", true);
				} else {
					
					healthcareLabel
						.classed("active", false)
						.classed("inactive",true);
					smokesLabel
						.classed("active", false)
						.classed("inactive",true);
					obeseLabel
						.classed("active", true)
						.classed("inactive", false);
				}
				
				
				circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
				
				textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis)


				circlesGroup = updateToolTip(chosenXAxis, circlesGroup, chosenYAxis);
                   
				
			} else { console.log("Input not found")};
			
			
			
			
			
		});

			
			
			
		
		
		
		
		
		
		
}).catch(function(error) {
	console.log(error);
});
	
}

makeResponsive();

d3.select(window).on("resize", makeResponsive);
