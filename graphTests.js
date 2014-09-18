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
	function tenQuestions(graph, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10) {
		var graph = GraphFuns.parseGraph(graph);
		it("should get the correct answer to question 1", function() {
			assert.equal(GraphFuns.measurePath(graph, ["A", "B", "C"]), a1);
		});
		it("should get the correct answer to question 2", function() {
			assert.equal(GraphFuns.measurePath(graph, ["A", "D"]), a2);
		});
		it("should get the correct answer to question 3", function() {
			assert.equal(GraphFuns.measurePath(graph, ["A", "D", "C"]), a3);
		});
		it("should get the correct answer to question 4", function() {
			assert.equal(GraphFuns.measurePath(graph,
										["A", "E", "B", "C", "D"]), a4);
		});
		it("should get the correct answer to question 5", function() {
			assert.equal(GraphFuns.measurePath(graph, ["A","E","D"]), a5);
		});
		it("should get the correct answer to question 6", function() {
			assert.equal(
				GraphFuns.numPaths(graph.C, graph.C, 3, false, false, graph),
			a6); 
		});
		it("should get the correct answer to question 7", function() {
			assert.equal(
				GraphFuns.numPaths(graph.A, graph.C, 4, true, false, graph),
			a7); 
		});
		it("should get the correct answer to question 8", function() {
			assert.equal(GraphFuns.getDistance(graph.A, graph.C), a8);
		});
		it("should get the correct answer to question 9", function() {
			assert.equal(GraphFuns.getDistance(graph.B, graph.B), a9);
		});
		it("should get the correct answer to question 10", function() {
			assert.equal(
				GraphFuns.numPaths(graph.C, graph.C, 29, false, true, graph),
			a10); 
		});
	}

	describe("(sample input)", function() {
		tenQuestions("AB5 BC4 CD8 DC8 DE6 AD5 CE2 EB3 AE7",
			9, 5, 13, 22, null, 2, 3, 9, 9, 7);
	});

	describe("(disjoint graph)", function() {
		tenQuestions("AZ1 BY2 CX3", null, null, null, null, null, 0, 0,
					null, null, 0);
	});

	describe("(error cases)", function() {
		it("should not allow duplicate edges", function() {
			assert.throws(function() {
				GraphFuns.parseGraph("AB1 AB1");
			}, Error);
		});
		it("should not allow non-integer edge weights", function() {
			assert.throws(function() {
				GraphFuns.parseGraph("AB1.2");
			}, TypeError);
		});
		it("should not allow zero edge weights", function() {
			assert.throws(function() {
				GraphFuns.parseGraph("AB0");
			}, TypeError);
		});
		it("should not allow negative edge weights", function() {
			assert.throws(function() {
				GraphFuns.parseGraph("AB-1");
			}, TypeError);
		});
		it("should not allow malformatted edge weights", function() {
			assert.throws(function() {
				GraphFuns.parseGraph("AB");
			}, Error);
		});
		it("should return null for paths using vertices not mentioned",
			function() {
				assert.equal(GraphFuns.measurePath(GraphFuns.parseGraph(),
					["A", "B"]), null);
			}
		);
	});
});
