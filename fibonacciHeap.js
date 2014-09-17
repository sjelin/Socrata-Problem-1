/**	In this file we define a Fibonacci Heap class.  A fibonacci heap is a
 *	heap with special properties which make it fast for use in Dijkstra's
 *	algorithm.  I suggest you read Wikipedia for details, but the short of it
 *	is that it has fast amortized add(), extractMin(), and decreaseKey().
 *
 *	We require to toString() function to produce distinct strings for
 *	distinct values in this implementation.  This is problematic, but the
 *	best option available since JavaScript does not require Objects to have
 *	something like Java's hashCode().
 *
 *	Because I am writing this specifically for use in Dijkstra's algorithm,
 *	I have only implemented add(), extractMin(), and decreaseKey().
 *
 *	@author	sjelin
 */

var FibonacciHeap = (function() {
	"use strict";

	//All the variables needed for a node in the heap.
	var Node = function(key, value) {
		this.key = key;
		this.value = value;
		this.marked = false;
		this.kids = new NodeLinkedList();
		this.parent = null;

		//The next two are so the nodes can be put into a linked list
		//Nodes cannot be in more than one linked list at once
		this.next = null;
		this.prev = null;
	}

	//A very minimal linked list.
	//Used for storing the heap's root nodes & a node's children
	var NodeLinkedList = function() {
		this.head = null;
		this.length = 0;
	}
	//Add an item to the list
	NodeLinkedList.prototype.add = function(node) {
		if(this.length == 0) {
			this.head = node;
			node.next = node;
			node.prev = node;
		} else {
			node.next = this.head.next;
			node.prev = this.head;
			this.head.next.prev = node;
			this.head.next = node;
		}
		this.length++;
	};
	//Remove an item from the list
	NodeLinkedList.prototype.remove = function(node) {
		if(this.length == 1)
			this.head = null;
		else {
			node.next.prev = node.prev;
			node.prev.next = node.next;
			if(this.head == node)
				this.head = node.next;
		}
		node.next = node.prev = node;
		this.length--;
	};
	//Call a function on every item in the list
	NodeLinkedList.prototype.forEach = function(fun) {
		//We have to load the nodes into an array in case the function
		//modifies the list
		var nodes = [];
		var node = this.head;
		if(node != null) do {
			nodes.push(node);
			node = node.next;
		} while(node != this.head);
		nodes.forEach(fun);

	};

	var warned = false;
	return function() {
		///////////////////////
		// Private variables //
		///////////////////////
		var roots = new NodeLinkedList();
		var min = null;
		var valueMap = {};

		///////////////////////
		// Private functions //
		///////////////////////
		//Makes root one node the parent of a former root node
		var addChild = function(parentNode, childNode) {
			roots.remove(childNode);
			childNode.parent = parentNode;
			parentNode.kids.add(childNode);
		}
		//Makes one node a root node
		var makeRoot = function(node) {
			if(node.parent != null) {
				node.parent.kids.remove(node);
				node.parent = null;
			}
			roots.add(node);
			node.marked = false;//Roots are never marked
		}

		//////////////////////
		// Public Functions //
		//////////////////////

		/**	Adds a key/value pair to the heap.  Values must have a proper
		 *	toString() function who's return value won't change while the
		 *	value is in the heap.  Additionally, in order for the heap to
		 *	work quickly, the toString() function should produce a different
		 *	result for each different value put into the heap.
		 *
		 *	@param	key The key of the pair to add
		 *	@param	value The value of the pair to add
		 *
		 *	@throws TypeError if the key is not a number
		 */
		this.add = function(key, value) {
			if(typeof key != "number")
				throw new TypeError("Key must be a number");
			var node = new Node(key, value);
			makeRoot(node);
			if((min == null) || (node.key < min.key))
				min = node;

			//Add to valueMap
			var mappedNode = valueMap[value];
			if(mappedNode != null && mappedNode.value !== value) {
				if(!warned) {
					console.log("WARNING: distinct values must create "+
								"distinct strings upon a calls to "+
								"toString() for getKey() and decreaseKey() "+
								"to work in O(1) time, or even reliably");
					warned = true;
				}
				if(Array.isArray(mappedNode))
					mappedNode.push(node);
				else
					valueMap[value] = [mappedNode, node];
			} else
				valueMap[value] = node;
		};

		/**	Removes and returns the key/value pair with the lowest key
		 *
		 *	@return	The key/value pair with the lowest key, null heap empty
		 */
		this.extractMin = function(x) {
			if(min == null)
				return null;
			else {
				//Remove node
				var oldMin = min;
				roots.remove(oldMin);
				oldMin.kids.forEach(makeRoot);
				if(roots.length == 0) {//Empty heap
					min = null;
					valueMap = {};
				} else {
					min = null;

					//Update value map
					if(Array.isArray(valueMap[oldMin.value])) {
						var mappedArray = valueMap[oldMin.value];
						var i = mappedArray.map(function(x) {return x.value;}
												).indexOf(oldMin.value);
						if(i != -1) {
							mappedArray.splice(i, 1);
							if(mappedArray.length == 1)
								valueMap[oldMin.value] = mappedArray[0];
						}
					} else
						delete valueMap[oldMin.value];

					//Join trees until each root node has a different degree.
					//Read wikipedia for why we do this and why this is
					//amortized O(log(n)).
					var rootWithDegree = [];
					roots.forEach(function(root) {
						while(rootWithDegree[root.kids.length] != null) {
							var root2 = rootWithDegree[root.kids.length];
							delete rootWithDegree[root.kids.length];

							if(root2.key < root.key) {
								addChild(root2, root);
								root = root2;
							} else
								addChild(root, root2);
						}
						rootWithDegree[root.kids.length] = root;
					});

					//Find the new minimum
					roots.forEach(function(root) {
						if((min == null) || (root.key < min.key))
							min = root;
					});
				}
				return {key: oldMin.key, value: oldMin.value};
			}
		}

		/**	Decrease the key which corresponds to a given value.  If the new
		 *	key is not lower than the old one, the change is simply ignored.
		 *
		 *	@param	value The value to decrease the key for
		 *	@param	key What do decrease the key of the pair to
		 *	@return	true if the new key was lower than the old one, false
		 *			otherwise
		 *	@throws	Error if value is not in the heap
		 */
		this.decreaseKey = function(value, key)
		{
			var node = valueMap[value];
			if(Array.isArray(node))
				node = node.filter(function(x) {return x.value===value;})[0];
			if(node == null)
				throw new Error("Value not in heap");
			if(node.key <= key)
				return false;

			node.key = key;
			if(key < min.key)
				min = node;
			if((node.parent != null) && (node.key < node.parent.key)) {
				//Min-heap property has been violated.  We will cut the node
				//from its tree to make it a root.  Additionally, we're going
				//to cut some ancestors, depending on if they're marked,
				//and mark an ancestor.  See wikiepdia for details & why

				do {
					var parentNode = node.parent;
					makeRoot(node);
					node = parentNode;
				} while(node.marked);
				if(node.parent != null)//Roots are never marked
					node.marked = true;
			}

			return true;
		}
	};
})();

//We we're in node.js, make sure to export the result of our hard work!
if(typeof module == "object" && typeof module.exports == "object")
	module.exports = FibonacciHeap;
