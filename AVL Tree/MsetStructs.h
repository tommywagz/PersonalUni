// COMP2521 23T2 Assignment 1

#ifndef MSET_STRUCTS_H
#define MSET_STRUCTS_H

// DO NOT CHANGE THE NAME OF THIS STRUCT
struct node {
	int item;           // DO NOT CHANGE/REMOVE THIS FIELD
	int count;          // DO NOT CHANGE/REMOVE THIS FIELD
	struct node *left;  // DO NOT CHANGE/REMOVE THIS FIELD
	struct node *right; // DO NOT CHANGE/REMOVE THIS FIELD
	struct node *parent;
	int height;
	// You may add more fields here if needed
};

// DO NOT CHANGE THE NAME OF THIS STRUCT
struct mset {
	struct node *tree;  // DO NOT CHANGE/REMOVE THIS FIELD
	int size;
	int count;
	// You may add more fields here if needed
};

// You may define more structs here if needed

////////////////////////////////////////////////////////////////////////
// Cursors

struct cursor {
	int position;
	int count;
    struct listNode *curNode;
    struct mset *associatedMset;
	// You may add more fields here if needed
};

struct listNode {
    struct listNode *previous;
    struct listNode *next;
    int count;
    int item;
    bool isBookend;
};

struct list {
    struct listNode *head;
    struct listNode *tail;
    int size;
};

////////////////////////////////////////////////////////////////////////

#endif

