/**	In this file we define a library with various functions for processing
 *	graphs.  Specifically, for processing graphs in order to solve the
 *	"trains" problem described in README.md
 *
 *	A description of why I went with this implementation can be found in
 *	README.md
 *
 *	@author	sjelin
 */

(function(GraphFuns) {
	"use strict";

	//A class for a vertex in the graph
	var Vertex = function(name) {
		this.getName = function() {return name};
		var edges = [];
		var neighbourhood = {};
		this.getEdges = function() {return edges;};
		this.addEdge = function(edge) {
			//Do not allow duplicates
			if(neighbourhood[edge.getDest()])
				throw new Error(this+" already has "+edge);
			neighbourhood[edge.getDest()] = edge;

			edges.push(edge)
		};
		this.getEdgeTo = function(vertex) {
			return neighbourhood[vertex];
		}
	}
	Vertex.prototype.toString = function() {
		return "[Vertex "+this.getName()+"]";
	}

	//A class for an edge in the graph
	var Edge = function(dest, weight) {
		if(!(dest instanceof Vertex))
			throw new TypeError("Edge destination must be a vertex");
		this.getDest = function() {return dest;};
		this.getWeight = function() {return weight;};
	}
	Edge.prototype.toString = function() {
		return "[Edge -> "+this.getDest()+"]";
	}

	/**	Parse strings into a graph.  The descriptions should match the format
	 *	in the example.  The description can be split across multiple
	 *	parameters.  This is to make it easier for people entering
	 *	descriptions from the command line.
	 *
	 *	@return	An object who's keys are the vertex names and values are the
	 *			corresponding vertices
	 */
	GraphFuns.parseGraph =  function() {
		var vertexSet = {};

		for(var i = 0; i < arguments.length; i++) {
			var edgeStrs = arguments[i].split(/i,|\s/);
			for(var j = 0; j < edgeStrs.length; j++) {
				var edgeStr = edgeStrs[j];
				if(edgeStr.length >= 3) {
					//Parse
					var v1 = edgeStr[0];
					var v2 = edgeStr[1];
					var weight = edgeStr.slice(2);
					if(weight.match(/[0-9]/) == null)
						throw new TypeError("Edge weights must be integers");
					weight = parseInt(weight);
					if(weight <= 0)
						throw new TypeError("Edge weights must be positive");

					//Update vertex set
					if(vertexSet[v1] == null)
						vertexSet[v1] = new Vertex(v1);
					if(vertexSet[v2] == null)
						vertexSet[v2] = new Vertex(v2);

					//Add edge
					vertexSet[v1].addEdge(new Edge(vertexSet[v2], weight));

				//Throw error if description is too short.  Don't throw
				//error for length 0 through, because that just means two
				//consecutive spaces or something to be ignored like that.
				} else if(edgeStr.length > 0)
					throw new Error("Edge descriptions should match the "+
									"format in the example");
			}
		}
		return vertexSet;
	}

	/**	Computes the length of a path in a graph
	 *
	 *	@param	vertexSet The set of vertices in the graph
	 *	@param	path	An array containing the names of vertices in the
	 *					path in order
	 *	@return	The length of the path
	 */
	GraphFuns.measurePath = function(vertexSet, path) {
		//Get actual vertices from names
		path = path.map(function(name) { return vertexSet[name]; });

		//Do the measurement
		var length = 0;
		for(var i = 0, j = 1; j < path.length; j = (i = j) + 1) {
			if(path[i] == null)
				return null;
			var edge = path[i].getEdgeTo(path[j]);
			if(edge == null)
				return null;
			else
				length += edge.getWeight();
		}
		return length;
	}

	//A PriorityQueue for use in Dijkstra's algorithmn
	var PriorityQueue = typeof FibonacciHeap != "undefined" ? FibonacciHeap :
						require("./fibonacciHeap.js");

	/**	Computes the distance between two nodes in a graph.  Assumes no
	 *	negative edge weights
	 *
	 *	@param	The starting node
	 *	@param	The ending node
	 *	@return	The distance between the two nodes
	 */
	GraphFuns.getDistance = function(start, end)
	{
		//A very straight-forward implementation of Dijkstra's algorithmn.
		//Slightly difficult to describe in words, but this GIF does an
		//excellent job: http://upload.wikimedia.org/wikipedia/commons/5/57/Dijkstra_Animation.gif
		//Basically what's going on in this picture is that it's repeatedly
		//looking for the vertex of lowest distance which hasn't yet been
		//processed, and using that to update the distance information in the
		//graph

		var verticesToCheck = new PriorityQueue();
		var hasBeenQueued = {};
		var processVertex = function(vertex, distance) {
			var edges = vertex.getEdges();
			for(var i = 0; i < edges.length; i++) {
				var newVert = edges[i].getDest();
				var newDist = distance + edges[i].getWeight();
				if(hasBeenQueued[newVert])
					try { // try block needed in case newVert was removed
						verticesToCheck.decreaseKey(newVert, newDist);
					} catch(e) {}
				else {
					verticesToCheck.add(newDist, newVert);
					hasBeenQueued[newVert] = true;
				}
			}
		}

		//Normally you start of Dijkstra's algorthm by putting the starting
		//vertex in with priority 0.  However, because we don't want to
		//simply return an answer of 0 if the start and end vertices are the
		//same, instead we are going to put in the neighborhood of the
		//starting vertex with priorities equal to the corresponding edge
		//weights.  Essentially, we are doing the rolling out the first
		//iteration of the loop.
		processVertex(start, 0);

		var queueElem;
		while((queueElem = verticesToCheck.extractMin()) != null) {
			var distance = queueElem.key;
			var vertex = queueElem.value;
			if(vertex == end)
				return distance;
			else
				processVertex(vertex, distance);
		}
		return null;
	};

	/**	Calculate the numbers of paths from one vertex to another
	 *
	 *	@param	startVertex The vertex the paths must start from
	 *	@param	endVertex	The vertex the paths must end at
	 *	@param	maxLength	The maximum length of the path
	 *	@param	exactLength	Whether or not the paths have to have length
	 *						exactly equal to maxLength
	 *	@param	useWeights	Whether or use the edge weights as the length of
	 *						an edge, or simply assume each edge is 1 unit
	 *						long
	 *	@param	vertexSet	The set of all the vertices in the graph
	 *
	 *	@return	The number of paths matching the conditions
	 */
	GraphFuns.numPaths = function(	startVertex, endVertex, maxLength,
									exactLength, useWeights, vertexSet)
	{
		//We will use dynamic programming.  The first index in our table of
		//memoized results will be fore maxLength, and the second for the
		//starting vertex.  We will then compute the answers for
		//maxLength = 0, then maxLength = 1, etc, up to the value of
		//maxLength which was actually asked for.  See README.md for a full
		//discussion of this approach and the alternatives
		var pathCounts = [];
		for(var thisLen = 0; thisLen <= maxLength; thisLen++) {
			pathCounts[thisLen] = {};
			for(var vertexName in vertexSet) {
				var vertex = vertexSet[vertexName];
				var count = 0;
				var edges =	vertex.getEdges();
				for(var i = 0; i < edges.length; i++) {
					var edgeLen = useWeights ? edges[i].getWeight() : 1;
					var edgeDest = edges[i].getDest();
					if(edgeLen <= thisLen)
						count += pathCounts[thisLen-edgeLen][edgeDest];
				}
				if((vertex == endVertex) && (!exactLength || (thisLen == 0)))
					count++;
				pathCounts[thisLen][vertex] = count;
			}
		}

		//Subtract out path of length 0 and return
		return pathCounts[maxLength][startVertex] -
				((!exactLength || (maxLength == 0)) &&
					(startVertex == endVertex) ? 1 : 0);
	}
})(
	//If we are in a node.js like environment, we should put the functions in
	//module.exports.  Otherwise, we should put them inside a GraphFuns
	//object inside the global object
	(typeof module == "object") && (typeof module.exports == "object") ?
		module.exports : (this.GraphFuns = {})
);
