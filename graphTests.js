/**	This file contains a bunch of tests for the Graph Functions.  The tests
 *	can be run using Mocha for Node.js.  Just use:
 *		mocha graphTests.js
 *	If you have istanbul installed, you can generate a coverage report too:
 *		istanbul cover _mocha *Tests.js
 *
 *	@author	sjelin
 */

var GraphFuns = require("./graphFuns.js");
var assert = require("assert");

describe("Graph Funs", function() {
	describe("(sample input)", function() {
		var graph = GraphFuns.parseGraph(	"AB5, BC4, CD8, DC8, DE6, AD5",
											"CE2, EB3, AE7");
		it("should get the correct answer to question 1", function() {
			assert.equal(GraphFuns.measurePath(graph, ["A", "B", "C"]), 9);
		});
		it("should get the correct answer to question 2", function() {
			assert.equal(GraphFuns.measurePath(graph, ["A", "D"]), 5);
		});
		it("should get the correct answer to question 3", function() {
			assert.equal(GraphFuns.measurePath(graph, ["A", "D", "C"]), 13);
		});
		it("should get the correct answer to question 4", function() {
			assert.equal(GraphFuns.measurePath(graph,
										["A", "E", "B", "C", "D"]), 22);
		});
		it("should get the correct answer to question 5", function() {
			assert.equal(GraphFuns.measurePath(graph, ["A","E","D"]), null);
		});
		it("should get the correct answer to question 6", function() {
			assert.equal(
				GraphFuns.numPaths(graph.C, graph.C, 3, false, false, graph),
			2); 
		});
		it("should get the correct answer to question 7", function() {
			assert.equal(
				GraphFuns.numPaths(graph.C, graph.C, 4, true, false, graph),
			3); 
		});
		it("should get the correct answer to question 8", function() {
			assert.equal(GraphFuns.getDistance(graph.A, graph.C), 9);
		});
		it("should get the correct answer to question 9", function() {
			assert.equal(GraphFuns.getDistance(graph.B, graph.B), 9);
		});
		it("should get the correct answer to question 10", function() {
			assert.equal(
				GraphFuns.numPaths(graph.C, graph.C, 30, false, true, graph),
			7); 
		});
	});
});
