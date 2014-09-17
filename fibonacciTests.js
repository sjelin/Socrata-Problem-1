/**	This file contains a bunch of tests for the Fibonacci Heap.  The tests
 *	can be run using Mocha for Node.js.  Just use:
 *		mocha fibonacciTests.js
 *	If you have istanbul installed, you can generate a coverage report too:
 *		istanbul cover _mocha fibonacciTests.js
 *
 *	@author	sjelin
 */

var FibHeap = require("./fibonacciHeap.js");
var assert = require("assert");

describe("Fibonacci Heap", function() {
	describe("(crash check)", function() {
		it("shouldn't crash creating a heap", function() {
			new FibHeap();
		});
		it("shouldn't crash adding an item", function() {
			var heap = new FibHeap();
			heap.add(0,0);
		});
		it("shouldn't crash removing an item", function() {
			var heap = new FibHeap();
			heap.add(0,0);
			heap.extractMin();
		});
		it("shouldn't crash deleting a key", function() {
			var heap = new FibHeap();
			heap.add(1, 0);
			heap.decreaseKey(0, 0);
		});
	});
	describe("(correctness)", function() {
		it("should correctly extract an item", function() {
			var heap = new FibHeap();
			heap.add(0, 0);
			var min = heap.extractMin();
			assert.strictEqual(min.key, 0);
			assert.strictEqual(min.value, 0);
		});
		it("should remove extracted items from heap", function() {
			var heap = new FibHeap();
			heap.add(0, 0);
			heap.extractMin();
			assert.equal(heap.extractMin(), null);
		});
		it("should extract items in the correct order", function() {
			var heap = new FibHeap();

			//Order 1
			heap.add(0, 0);
			heap.add(1, 1);
			var min = heap.extractMin();
			assert.strictEqual(min.key, 0);
			assert.strictEqual(min.value, 0);
			min = heap.extractMin();
			assert.strictEqual(min.key, 1);
			assert.strictEqual(min.value, 1);
			assert.equal(heap.extractMin(), null);

			//Order 2
			heap.add(1, 1);
			heap.add(0, 0);
			var min = heap.extractMin();
			assert.strictEqual(min.key, 0);
			assert.strictEqual(min.value, 0);
			min = heap.extractMin();
			assert.strictEqual(min.key, 1);
			assert.strictEqual(min.value, 1);
			assert.equal(heap.extractMin(), null);
		});
		it("should change key when told to", function() {
			var heap = new FibHeap();
			heap.add(1, 0.5);
			assert.equal(heap.decreaseKey(0.5, 0), true);
			var min = heap.extractMin();
			assert.strictEqual(min.key, 0);
			assert.strictEqual(min.value, 0.5);
		});
		it("should not change key if new key is larger", function() {
			var heap = new FibHeap();
			heap.add(0.5, 0.5);
			assert.equal(heap.decreaseKey(0.5, 1), false);
			var min = heap.extractMin();
			assert.strictEqual(min.key, 0.5);
			assert.strictEqual(min.value, 0.5);
		});
		it("should change extract order if keys change", function() {
			var heap = new FibHeap();
			heap.add(0, 0);
			heap.add(1, 1);
			heap.decreaseKey(1, -1);
			var min = heap.extractMin();
			assert.strictEqual(min.key, -1);
			assert.strictEqual(min.value, 1);
		});
	});
	describe("(static)", function() {
		it("should work on small input without decreasing keys", function() {
			var heap = new FibHeap();
			heap.add(0.3, "A");
			heap.add(0.6, "B");
			heap.add(0.1, "C");
			var min = heap.extractMin();
			assert.strictEqual(min.key, 0.1);
			assert.strictEqual(min.value, "C");
			min = heap.extractMin();
			assert.strictEqual(min.key, 0.3);
			assert.strictEqual(min.value, "A");
			min = heap.extractMin();
			assert.strictEqual(min.key, 0.6);
			assert.strictEqual(min.value, "B");
		});
		it("should work on small input with decreasing keys", function() {
			var heap = new FibHeap();
			heap.add(0.57, "A");
			heap.add(0.49, "B");
			heap.add(0.07, "C");
			heap.add(0.36, "D");
			heap.add(0.35, "E");
			assert.equal(heap.extractMin().key, 0.07);
			assert.equal(heap.extractMin().key, 0.35);
			assert.equal(heap.extractMin(true).key, 0.36);
			assert.equal(heap.decreaseKey("B", 0.35), true);
			assert.equal(heap.decreaseKey("A", 0.03), true);
			assert.equal(heap.extractMin().key, 0.03);
			assert.equal(heap.decreaseKey("B", 0.22), true);
			assert.equal(heap.extractMin().key, 0.22);
			assert.equal(heap.extractMin(), null);
		});
	});
	describe("(stress)", function() {
		it("add a bunch, screw with some keys, and then remove it all",
		function() {
			var M = 100;
			var heap = new FibHeap();
			for(var N = 1; N <= M; N++) {
				var pairs = [];
				while(pairs.length < N) {
					var key = Math.random();
					var val = Math.random();
					heap.add(key, val);
					pairs.push({key:key, val:val});
				}
				while(pairs.length > 0) {
					while(Math.random() < 0.5) {
						var i = Math.floor(Math.random()*pairs.length);
						var newKey = Math.random();
						assert.equal(heap.decreaseKey(pairs[i].val, newKey),
									newKey < pairs[i].key);
						pairs[i].key = Math.min(newKey, pairs[i].key);
					}
					pairs.sort(function(p1, p2) { return p2.key - p1.key; });
					var min = heap.extractMin();
					var pair = pairs.pop();
					assert.strictEqual(min.key, pair.key);
					assert.strictEqual(min.value, pair.val);
				}
				assert.equal(heap.extractMin(), null);
			}
		});
	});
	describe("(edge cases)", function() {
		it("shouldn't accept non-number keys", function() {
			var heap = new FibHeap();
			assert.throws(function() {heap.add("A", "B");}, TypeError);
		});
		it("shouldn't decrease the key of values no in the heap", function(){
			var heap = new FibHeap();
			heap.add(1,1);
			heap.add(2,2);
			heap.extractMin();
			assert.throws(function() {heap.decreaseKey(1, 0.5);}, Error);
		});
		it("shouldn't always break if a bad toString() is used", function() {
			var heap = new FibHeap();
			var x = {a: 1};
			var y = {b: 2};
			var z = {c: 3};
			heap.add(1, x);
			heap.add(2, y);
			heap.add(3, z);
			heap.decreaseKey(z, 0);
			assert.equal(heap.extractMin().value, z);
			assert.equal(heap.extractMin().value, x);
			assert.equal(heap.extractMin().value, y);
		});
	});
});
