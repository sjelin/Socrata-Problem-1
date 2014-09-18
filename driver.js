/**	This file is the driver that uses the methods in graphFuns.js to compute
 *	the answers to the questions which are asked
 *
 *	If you have node.js installed on the shell, you can run this from the
 *	command line as follows:
 *		node driver.js [graph_description]
 *
 *	So, for instance, you can run the sample input as follows:
 *		node driver.js AB5 BC4 CD8 DC8 DE6 AD5 CE2 EB3 AE7
 *
 *	If you don't have node.js you can solve the problem another way:
 *		(1) Open up the JS console in your browser
 *		(2) Feed it the contents of fibonacciHeap.js
 *		(3) Feed it the contents of graphFuns.js
 *		(4) Set window.socrata_input to the description of your graph
 *		(5)	Feed it the contents of driver.js
 *
 *	Note that node.js is very easy to install on a UNIX-like machine, so I
 *	personally would just install it if you haven't already
 *
 *	@author sjelin
 */

var GraphFuns = typeof GraphFuns != "undefined" ? GraphFuns :
				require("./graphFuns.js");

var graph = GraphFuns.parseGraph.apply(GraphFuns,
				typeof process == "object" ? process.argv.slice(2) :
					Array.isArray(window.socrata_input) ? 
						window.socrata_input : [window.socrata_input]);
var noRoute = "NO SUCH ROUTE";

//Question 1
var answer = GraphFuns.measurePath(graph, ["A", "B", "C"]);
console.log(answer == null ? noRoute : answer);

//Question 2
answer = GraphFuns.measurePath(graph, ["A", "D"]);
console.log(answer == null ? noRoute : answer);

//Question 3
answer = GraphFuns.measurePath(graph, ["A", "D", "C"]);
console.log(answer == null ? noRoute : answer);

//Question 4
answer = GraphFuns.measurePath(graph, ["A", "E", "B", "C", "D"]);
console.log(answer == null ? noRoute : answer);

//Question 5
answer = GraphFuns.measurePath(graph, ["A","E","D"]);
console.log(answer == null ? noRoute : answer);

//Question 6
answer =	graph.C == null ? null :
				GraphFuns.numPaths(graph.C, graph.C, 3, false, false, graph)
console.log(answer == null ? 0 : answer);

//Question 7
answer =	graph.C == null ? null :
			graph.A == null ? null :
			GraphFuns.numPaths(graph.A, graph.C, 4, true, false, graph)
console.log(answer == null ? 0 : answer);

//Question 8
answer =	graph.A == null ? null :
			graph.C == null ? null :
			GraphFuns.getDistance(graph.A, graph.C);
console.log(answer == null ? noRoute : answer);

//Question 9 
answer =	graph.B == null ? null :
			GraphFuns.getDistance(graph.B, graph.B);
console.log(answer == null ? noRoute : answer);

//Question 10
answer =	graph.C == null ? null :
			GraphFuns.numPaths(graph.C, graph.C, 29, false, true, graph);
console.log(answer == null ? 0 : answer);
