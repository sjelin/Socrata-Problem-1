Running the solution
====================

If you have node.js installed on the shell, you can run this from the
command line as follows:

	node driver.js [graph_description]

So, for instance, you can run the sample input as follows:

	node driver.js AB5 BC4 CD8 DC8 DE6 AD5 CE2 EB3 AE7

If you don't have node.js you can solve the problem another way:

1.	Open up the JS console in your browser
2.	Feed it the contents of fibonacciHeap.js
3.	Feed it the contents of graphFuns.js
4.	Set window.socrata_input to the description of your graph
5.	Feed it the contents of driver.js

Note that node.js is very easy to install on a UNIX-like machine, so I
personally would just install it if you haven't already


The problem
=============

```
PROBLEM ONE: TRAINS 

Problem: The local commuter railroad services a number of towns in Kiwiland.
Because of monetary concerns, all of the tracks are 'one-way.' That is, a
route from Kaitaia to Invercargill does not imply the existence of a route
from Invercargill to Kaitaia. In fact, even if both of these routes do happen
to exist, they are distinct and are not necessarily the same distance! 

The purpose of this problem is to help the railroad provide its customers
with information about the routes. In particular, you will compute the
distance along a certain route, the number of different routes between two
towns, and the shortest route between two towns. 

Input: A directed graph where a node represents a town and an edge represents
a route between two towns. The weighting of the edge represents the distance
between the two towns. A given route will never appear more than once, and
for a given route, the starting and ending town will not be the same town. 

Output: For test input 1 through 5, if no such route exists, output 'NO SUCH
ROUTE'. Otherwise, follow the route as given; do not make any extra stops!
For example, the first problem means to start at city A, then travel directly
to city B (a distance of 5), then directly to city C (a distance of 4). 

1.	The distance of the route A-B-C. 
2.	The distance of the route A-D. 
3.	The distance of the route A-D-C. 
4.	The distance of the route A-E-B-C-D. 
5.	The distance of the route A-E-D. 
6.	The number of trips starting at C and ending at C with a maximum of 3
	stops. In the sample data below, there are two such trips: C-D-C
	(2stops). and C-E-B-C (3 stops). 
7.	The number of trips starting at A and ending at C with exactly 4 stops.
	In the sample data below, there are three such trips: A to C (via B,C,D);
	A to C (via D,C,D); and A to C (via D,E,B). 
8.	The length of the shortest route (in terms of distance to travel) from A
	to C. 
9.	The length of the shortest route (in terms of distance to travel) from B
	to B. 
10.	The number of different routes from C to C with a distance of less than
	30. In the sample data, the trips are: CDC, CEBC, CEBCDC, CDCEBC, CDEBC,
	CEBCEBC, CEBCEBCEBC. 

Test Input: 

For the test input, the towns are named using the first few letters of the
alphabet from A to E. A route between two towns (A to B) with a distance of 5
is represented as AB5. 

Graph: AB5, BC4, CD8, DC8, DE6, AD5, CE2, EB3, AE7 


Expected Output: 

Output #1: 9 
Output #2: 5 
Output #3: 13 
Output #4: 22 
Output #5: NO SUCH ROUTE 
Output #6: 2 
Output #7: 3 
Output #8: 9 
Output #9: 9 
Output #10: 7 
```

Discussion of Approach:
======================

There are four distinct categories of questions that this program must then
answer:

1.	What is the length of a path?
2.	What is the shortest distance between two points?
3.	How many paths are there between two points using no more than N stops?
4.	How many paths are there between two points of length no more than M?
5.	How many paths are there between two points using exactly N stops?

Category 1 problems are trivial.  Category 2 problems are a simple 
application of Dijkstra's algorithm.  Category 3 problems are obviously just
a special case of category 4 problems with the edge weight set to 1.  Similar
things can be said of category 5.  So category 4 problems are what are most
interesting.

The most intuitive way to approach problem 4 is as follows:

```js
	//Approach #1
	function numPaths(startingVertex, endingVertex, maxLength)
	{
		var count = 0;
		forEach(edge incident from startingVertex)
			if(edge.length <= maxLength)
				count += numPaths(edge.destination, endingVertex,
									maxLength - edge.length);
		if(startingVertex == endingVertex)
			count++;
		return count;
	}
```

Then the answer to question 10 would be:

```js
	numPaths(vertexC, vertexC, 30) - 1;//Subtract path of length 0
```

This wouldn't be very fast however.  If we let `l_min` be the minimum length
of an edge, and `d_max` be the maximum out-degree of a vertex, then this
algorithm will take `O(d_max ^ (maxLength / l_min + 1))` time and
`O(maxLength / l_min)` space.  This is unacceptable.  Suppose the input graph
is the complete graph of 5 vertices with edge weights of 1.  Then answering
question 10 would take `5^31 = 4.7 x 10^21` iterations.

If we assume lengths are integers, we can apply dynamic programming and
memoize the results of `numPaths()`.  If we also note that the ending vertex
does not change, then the computation complexity drops to
`O(numVertices * maxLength)` time and space.

We can also eliminate the use of recursion when we take this approach:

```js
	//Approach #2
	function numPaths(startVertex, endVertex, maxLength, graph)
	{
		var pathCounts = [];
		for(var thisLen = 0; thisLen <= maxLength; thisLen++) {
			pathCounts[thisLen] = {};
			for(vertex in graph) {
				var count = 0;
				forEach(edge incident from vertex)
					if(edge.length <= thisLen)
						count += pathCounts[thisLen-edge.length][edge.destination];
				if(vertex == endingVertex)
					count++;
				pathCounts[thisLen][vertex] = count;
			}
		}
		return pathCounts[maxLength][startVertex];
	}
``

The downside here is that if the edges are long then only a small percentage
of the `pathCounts` table is actually needed to compute the answer.  This
too can be solved however:

```js
	//Approach #3
	function numPaths(startVertex, endVertex, maxLength, vertexSet)
	{
		var pathCounts = [];
		var countNeeded = [];
		for(var i = 0; i <= maxLength; i++)
			countNeeded[i] = {};
		countNeeded[30][startVertex] = true;
		for(var thisLen = maxLegth; thisLen >= 0; thisLen--)
			for(vertex in countNeeded[thisLen])
				forEach(edge incident from vertex)
					if(edge.length <= thisLen)
						countNeeded[thisLen - edge.length][vertex] = true;
		for(var thisLen = 0; thisLen <= maxLength; thisLen++) {
			pathCounts[thisLen] = {};
			for(vertex in vertexSet)
				if(countNeeded[thisLen][vertex]) {
					var count = 0;
					forEach(edge incident from vertex)
						if(edge.length <= thisLen)
							count += pathCounts[thisLen-edge.length][edge.destination];
					if(vertex == endingVertex)
						count++;
					pathCounts[thisLen][vertex] = count;
				}
		}
		return pathCounts[maxLength][startVertex];
	}
```

Now, one other approach that should be mentioned is that of counting simple
cycles: if you find all the simple cycles in the graph, and measure their
length, you can combine this with information about the acyclic paths
in the graph, and then mathematically compute the answer using modular
arithmetic.  Without going into too much detail about how this would be done,
it is worth noting that there are `O(n!)` paths and cycles, where `n` is the
number of vertices in the graph.  So it only makes sense to take this
approach if the maximum path length is much higher than the vertex count.

Considering the questions that are actually being made of the graph, it seems
like the most appropriate approach is #2.  As already discussed, method #1 is
too slow, and #3 is solving a problem that shouldn't be a big deal, since the
largest max path length ever asked about is 30.  For the same reason, the
method of counting simple cycles and acyclic paths also should not be used.

One other thing which should be mentioned is that it is possible to collect
data while computing the answer to one question that could be saved and then
used to quickly compute the answer to another question.  Because this code is
supposed to mirror real production code, and in the real world you probably
wouldn't have this random collection of questions, I decided not to do this.
