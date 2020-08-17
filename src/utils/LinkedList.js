class Node {
  constructor(element) {
    this.element = element;
    this.previous = null;
    this.next = null;
  }
};

export default class LinkedList {
  constructor() {
    this.head = null;
    this.tail = null;
    this.size = 0;
  }

  push(element) {
    const node = new Node(element);
    if (this.size === 0) {
      this.head = this.tail = node;
    } else {
      this.tail.next = node;
      node.previous = this.tail;
      this.tail = node;
    }
    this.size++;
  }

  shift() {
    if (this.size > 1) {
      const res = this.head.element;
      this.head = this.head.next;
      this.head.previous = null;
      this.size--;
      return res;
    } else if (this.size === 1) {
      const res = this.head.element;
      this.head = this.tail = null;
      this.size--;
      return res;
    }

    return null;
  }
};