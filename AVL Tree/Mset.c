// Implementation of the Multiset ADT using a balanced BST
// COMP2521 23T2 Assignment 1

#include <assert.h>
#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>

#include "Mset.h"
#include "MsetStructs.h"

////////////////////////////////////////////////////////////////////////
// Basic Operations Prototypes
/**
Locates and inserts the node at the appropriate place
*/
// static void locateAndInsertNode(
//      Mset s, bool isRepeat, int item,
//      struct node *current, struct node
//      *parent, struct node *newNode
// );

/*
Readjust all of the heights from the leaf parent up to the root
*/
static void adjustHeight(Mset s, struct node *balanceNode, int item);

/*
Rotate a subtree to the right
*/
static void rotateRight(struct node *root);

/*
Rotate a subtree to the left
*/
static void rotateLeft(struct node *root);

/*
If necessary, changes the height of a node given
the height of its children,
ASSUMED THAT THE NODE IS NOT NULL
*/
static void updateHeight(struct node *node);

/*
Finds the balance factor of a node given the heights of its children
*/
static int getBalance(struct node *node);

/*
Retrives the height for the given node, and -1 if the node is NULL
*/
static int getHeight(struct node *node);

// /**
// Goes through an inorder traversal and adds the item elements to an array
// */
// static void orderTreeItems(struct node *root, int intArray[], int *listIndex);

////////////////////////////////////////////////////////////////////////
// Advanced Operation Prototypes

/*
In order traversal that compares the count of a node value to the
count of the node value of the other given tree. The node with the
higher count is inserted into the new tree
*/
static void makeUnionSet(struct node *head1, Mset set2, Mset newSet);

/**
This function compares each node count of the given tree head
and compares it to the count in the given set. Whichever has
a lower count is added to the new set
*/
static void makeIntersectionSet(struct node *head1, Mset set2, Mset newSet);

/**
With an in order traversal for every node in the first set,
insert a new node of that value with the count of both sets
combined
*/
static void makeSumSet(struct node *head1, Mset newSet);

/*
Uses a level order traversal of every node in the first set and
automatically returns false if thee is a node in set 1 that isn't in set 2.
*/
static bool checkInclusion(struct node *head1, Mset set2,  bool returnItem);
/*
Similarly to the iuncludes function, uses a level order traversal
to see if every node in set one is the same in value and count as the other
*/
static bool checkEquivalence(struct node *current, Mset set2, bool returnItem);

/*
Uses a post order traversal to search all of the node values
from greatest to smallest. Once the array is full, the remaining
node counts are compared to the element with the smallest count.
The array will be sorted later.
*/
static void commonList(
    struct node *current, int index,
    struct item items[], int k
);

/*
Sorts an array of items using bubble sort for most common values
*/
void sortItems(struct item items[], int k);


////////////////////////////////////////////////////////////////////////
// Basic Operations

/**
 * Creates a new empty mset
 */
Mset MsetNew(void) {
	struct mset *newTree = malloc(sizeof(struct mset));
	newTree->size = 0;
	newTree->tree = NULL;
	return newTree;
}

/*
Frees all of the nodes in a given BST
*/
void freeNode(struct node *root) {
    if (root == NULL) {
        return;
    }

	freeNode(root->left);
	freeNode(root->right);

    free(root);
}


/**
 * Frees all memory allocated to the given mset
 */
void MsetFree(Mset s) {
    if (s->tree == NULL) {
        return;
    }

    // free all of the nodes
    freeNode(s->tree);

    // free the multiSet
    free(s);
}


/**
 * Inserts one of an item into the mset. Does nothing if the item is
 * equal to UNDEFINED.
 */
void MsetInsert(Mset s, int item) {
	// if the item is void
	if (item == NULL || item == UNDEFINED) {
		return;
	}
	s->count++;

	struct node *newNode = malloc(sizeof(struct node));
	newNode->count = 1;
	newNode->item = item;
	newNode->parent = NULL;
	newNode->height = 0;
	newNode->left = NULL;
	newNode->right = NULL;

	// the multiset is empty
	bool isRepeat = false;
	if (s->tree == NULL) {
		s->tree = newNode;
		s->size++;
		return;
	}

	// If there are more counts added to the head
	else if (item == s->tree->item) {
		isRepeat = true;
		s->tree->count++;
		free(newNode);
		return;
	}

	// the multiset isn't empty and has to go in front and locate
	// appropriate leaf location and instert the node
	struct node *current = s->tree;
	struct node *parentNode = NULL;

	while (current != NULL) {
        int cursorVal = current->item;
        if (cursorVal > item) {
            parentNode = current;
            current = current->left;
        }

        else if (cursorVal < item) {
            parentNode = current;
            current = current->right;
        }

        else {
            current->count++;
            free(newNode);
            isRepeat = true;
            return;
        }
    }

    // Insert the new node where the current cursor is
	if (!isRepeat && parentNode->item > item) {
		parentNode->left = newNode;
		newNode->parent = parentNode;
		s->size++;
	}		
	else if (parentNode->item < item) {
		parentNode->right = newNode;
		newNode->parent = parentNode;
		s->size++;
	}

	// Adjust all of the heights
	struct node *balanceNode = parentNode->parent;

	if (!isRepeat) {
		adjustHeight(s, balanceNode, item);
	}


}

/*
Insert the new node where the current cursor is
*/
static void adjustHeight(Mset s, struct node *balanceNode, int item) {
	while (balanceNode != NULL) {
		updateHeight(balanceNode);
		int balance = getBalance(balanceNode);

		// Search for any rotations
		// (If one child's height is two greater than another)

		// If there is a right to right line - single left
		if (balance < -1 && item < balanceNode->right->item) {
			printf("SINGLE LEFT\n");
			rotateLeft(balanceNode);
		}

		// If there is a left to left line - single right
		if (balance > 1 && item > balanceNode->left->item) {
			printf("SINGLE RIGHT\n");
			rotateRight(balanceNode);
		}

		// If there is a right to left zig zag on the side with more height
		// double left
		if (balance < -1 && item < balanceNode->right->item) {
			printf("DOUBLE LEFT\n");
			rotateRight(balanceNode->right);
			rotateLeft(balanceNode);
		}

		// If there is a left to right zig zag - double right
		if (balance > 1 && item > balanceNode->left->item) {
			printf("DOUBLE RIGHT\n");
			rotateLeft(balanceNode->left);
			rotateRight(balanceNode);
		}

		if (balanceNode == s->tree) {
			s->tree = balanceNode;
		}

		balanceNode = balanceNode->parent;
	}

}

/*
Rotate a subtree to the right
*/
static void rotateRight(struct node *root) {
    struct node *newRoot = root->left;
    struct node *newChild = newRoot->right;

    newRoot->right = root;
    newRoot->parent = root->parent;
    root->parent = newRoot;
    root->left = newChild;

    if (newChild != NULL) {
        newChild->parent = root;
    }

    updateHeight(root);
    updateHeight(newRoot);
}

/*
Rotate a subtree to the left
*/
static void rotateLeft(struct node *root) {
    struct node *newRoot = root->right;
    struct node *newChild = newRoot->left;

    newRoot->left = root;
    newRoot->parent = root->parent;
    root->parent = newRoot;
    root->right = newChild;

    if (newChild != NULL) {
        newChild->parent = root;
    }

    updateHeight(root);
    updateHeight(newRoot);
}

/*
If necessary, changes the height of a node given
the height of its children,
ASSUMED THAT THE NODE IS NOT NULL
*/
static void updateHeight(struct node *node) {
    int leftHeight = getHeight(node->left);
    int rightHeight = getHeight(node->right);
    if (node == NULL) {
        return;
    }

    if (leftHeight >= rightHeight) {
        node->height = leftHeight + 1;
    }
    else {
        node->height = rightHeight + 1;
    }
}

/*
Finds the balance factor of a node given the heights of its children
*/
static int getBalance(struct node *node) {
    if (node == NULL) {
        return 0;
    }

    return getHeight(node->left) - getHeight(node->right);
}

/*
Retrieves the height for the given node, and -1 if the node is NULL
*/
static int getHeight(struct node *node) {
    if (node == NULL) {
        return -1;
    }
    return node->height;
}


/**
 * Inserts the given amount of an item into the mset. Does nothing if
 * the item is equal to UNDEFINED or the given amount is 0 or less.
 */
void MsetInsertMany(Mset s, int item, int amount) {
	if (amount < 1 || item == UNDEFINED) {
		return;
	}

	for (int i = 0; i < amount; i++) {
		MsetInsert(s, item);
	}
}


/**
 * Returns the number of distinct elements in the mset
 */
int MsetSize(Mset s) {
	if (s->tree == NULL) {
		return 0;
	}

	return s->size;
}

/**
 * Returns the sum of counts of all elements in the mset
 */
int MsetTotalCount(Mset s) {
	if (s->tree == NULL) {
		return 0;
	}

	int sum = 0;

	struct node *current = s->tree;
	sum += current->count;

	s->tree = current->left;
	sum += MsetTotalCount(s);
	s->tree = current->right;
	sum += MsetTotalCount(s);

	return sum;
}

/**
 * Returns the count of an item in the mset, or 0 if it doesn't occur in
 * the mset
 */
int MsetGetCount(Mset s, int item) {
	if (s->tree == NULL) {
		return 0;
	}
	
	int count = 0;
	struct node *current = s->tree;

	while (current != NULL) {
		if (current->item == item) {
			return current->count;
		}
		else if (item < current->item) {
			current = current->left;
		}
		else if (item > current->item) {
			current = current->right;
		}
	}

	return count;
}

/**
 * Prints the given mset in the format
 * {(elem1, count1), (elem2, count2), (elem3, count3)}
 * where the elements are in increasing order
 */
void MsetShow(Mset s) {
	struct node *curr = s->tree;
	int firstElement = 1;

	printf('{');
	showNodes(curr);
	printf('}');
}

void showNodes(struct node* cur) {
	if (cur == NULL) {
		return;
	}

	showNodes(cur->left);
	printf("(%d, %d)", cur->item, cur->count);
	showNodes(cur->right);
}

////////////////////////////////////////////////////////////////////////
// Advanced Operations

/**
 * Returns a new mset representing the union of the two msets
 */
Mset MsetUnion(Mset s1, Mset s2) {
	Mset newSet = MsetNew();
	struct node *head1 = s1->tree;
	struct node *head2 = s2->tree;

	makeUnionSet(head1, s2, newSet);
	makeUnionSet(head2, s1, newSet);
	return NULL;
}

/*
In order traversal that compares the count of a node value to the 
count of the node value of the other given tree. The node with the 
higher count is inserted into the new tree
*/
static void makeUnionSet(struct node *head1, Mset set2, Mset newSet) {
	if (head1 == NULL) {
		return;
	}
	struct node *current = head1;

	// Left branch
	makeUnionSet(current->left, set2, newSet);

	// Get count of the current node's value in all working sets
	int newSetHas = MsetGetCount(newSet, current->item);
	int currSetHas = current->count;
	int set2Has = MsetGetCount(set2, current->item);

	if (newSetHas == 0) {
		if (set2Has >= currSetHas) {
			MsetInsertMany(newSet, current->item, set2Has);
		}
		else {
			MsetInsertMany(newSet, current->item, currSetHas);
		}
	}

	// right branch
	makeUnionSet(current->right, set2, newSet);
}

/**
 * Returns a new mset representing the intersection of two msets
 */
Mset MsetIntersection(Mset s1, Mset s2) {
	Mset newSet = MsetNew();
	struct node *head1 = s1->tree;

	makeIntersectionSet(head1, s2, newSet);

	return newSet;
}

/**
This function compares each node count of the given tree head
and compares it to the count in the given set. Whichever has
a lower count is added to the new set
*/
static void makeIntersectionSet(struct node *head1, Mset set2, Mset newSet) {
    if (head1 == NULL) {
        return;
    }
    struct node *current = head1;
    int set2Has = MsetGetCount(set2, current->item);
	int currHas = current->count;

    makeIntersectionSet(current->left, set2, newSet);
    if (currHas > 0 && set2Has > 0) {
        if (currHas >= set2Has) {
            MsetInsertMany(newSet, current->item, set2Has);
        }
        else {
            MsetInsertMany(newSet, current->item, currHas);
        }
    }

    makeIntersectionSet(current->right, set2, newSet);
}


/**
 * Returns a new mset representing the addition of two msets
 */
Mset MsetSum(Mset s1, Mset s2) {
	Mset newSet = MsetNew();
	struct node *head1 = s1->tree;
	struct node *head2 = s2->tree;

	// Go through the first tree and add the total counts of its node values
	makeSumSet(head1, newSet);

	// Go through the second tree and add all of the stragglers
	makeSumSet(head2, newSet);

	return NULL;
}

/**
 * With an in-order traversal for every node in the first set,
 * insert a new node of that value with the count of both sets
 * combined
 */
static void makeSumSet(struct node *head1, Mset newSet) {
	if (head1 == NULL) {
		return;
	}

	struct node *current = head1;

	makeSumSet(current->left, newSet);
	MsetInsertMany(newSet, current->item, current->count);
	makeSumSet(current->right, newSet);
}


/**
 * Returns a new mset representing the difference s1 - s2
 */
Mset MsetDifference(Mset s1, Mset s2) {
	Mset newSet = MsetNew();
	struct node *head1 = s1->tree;

	// For every node in set1, get rid of every counterpart in set2
	makeDifferenceSet(head1, s2, newSet);

	return NULL;
}

/*
This function uses a post order traversal to find the difference between 
the node count of the first tree's node and the seconf tree's nodes. If the 
second has a higher count, then don't add the node. If the difference is
positive then add it to the new set 
*/
static void makeDifferenceSet(struct node *head1, Mset set2, Mset newSet) {
	if (head1 == NULL) {
		return;
	}

	struct node *current = head1;
	int set2Has = MsetGetCount(set2, current->item);
	int difference = current->count - set2Has;

	makeDifferenceSet(current->left, set2, newSet);
	if (difference > 0) {
		MsetInsertMany(current->right, set2, newSet);
	}
	makeDifferenceSet(current->right, set2, newSet);
}


/**
 * Returns true if the mset s1 is included in the mset s2, and false
 * otherwise
 */
bool MsetIncluded(Mset s1, Mset s2) {
	struct node *head1 = s1->tree;
	return checkInclusion(head1, s2, true);
}


/**
 * Uses a level order traversal of every node iun the first set and
 * automatically returns false if there is a node in set 1 that isn't
 * in set 2
 */
static bool checkInclusion(struct node *head1, Mset set2, bool returnItem) {
    if (head1 == NULL) {
        return true;
    }

    struct node *current = head1;
    int set2Has = MsetGetCount(set2, current->item);
    int difference = set2Has - current->count;

    if (difference < 0) {
        return false;
    }

    bool checkLeft = checkInclusion(current->left, set2, returnItem);
    bool checkRight = checkInclusion(current->right, set2, returnItem);

    return (checkLeft && checkRight);
}




/**
 * Returns true if the two given msets are equal, and false otherwise
 */
bool MsetEquals(Mset s1, Mset s2) {
	if (MsetSize(s1) != MsetSize(s2)) {
		return false;
	}

	struct node *current = s1->tree;
	bool returnItem = checkEquivalence(current, s2, true);

	return returnItem;
}


/**
 * Similarly to the includes function, uses a level order traversal 
 * to see if every node in set one is the same in value and count as 
 * the other
 */
static bool checkEquivalence(struct node *current, Mset set2, bool returnItem) {
    if (current == NULL) {
        return true;
    }

    if (MsetGetCount(set2, current->item) != current->count) { // O(log(m))
        return false;
    }

    bool returnLeft = checkEquivalence(current->left, set2, returnItem);
    bool returnRight = checkEquivalence(current->right, set2, returnItem);

    return returnLeft && returnRight;
}


/**
 * Stores the k most common elements in the mset into the given items
 * array in decreasing order of count and returns the number of elements
 * stored. Elements with the same count should be stored in increasing
 * order.
 */
int MsetMostCommon(Mset s, int k, struct item items[]) {
	if (k <= 0) {
		return 0;
	}

	// Find the actual length of the to-be returned list
	if (k > MsetSize(s)) {
		k = MsetSize(s);
	}

	// Set every initialized value of struct's item and count to 0
	for (int i = 0; i < k; i++) {
		items[i].count = 0;
		items[i].item = 0;
	}

	struct node *current = s->tree;

	// Fill items with the nodes of the highest count
	int index = 0;
	commonList(current, index, items, k);

	if (k > 1) {
		sortItems(items, k);
	}

	return k;
}

/*
Uses a post-order traversal to search all of the node values
from greatest to smallest. Once the array is full, the remaining
node counts are compared to the element with the smallest count.
The array will be sorted later.
*/
static void commonList(
    struct node *current, int index,
    struct item items[], int k
) {
    if (current == NULL) {
        return;
    }

    // If the list is at max of k elements, scope through it and
    // see if current count is greater than the smallest count
    // in the array
    int indexx = 0;
    for (int i = 0; i < k; i++) {
        if (items[i].count == 0) {
            indexx++;
        }
    }

    // Find the smallest count currently in the array of items
    if (index < k) {
        items[index].count = current->count;
        items[index].item = current->item;
        index++;
    } else {
        int tempIndex = 0;
        int tempSmallestCount = items[tempIndex].count;
        for (int i = 0; i < k; i++) {
            if (items[i].count < tempSmallestCount) {
                tempSmallestCount = items[i].count;
                tempIndex = i;
            }
            // If the array has two of the same count, keep the smaller item
            else if (tempSmallestCount == items[i].count && i > 0) {
                if (items[tempIndex].item > items[i].item) {
                    tempSmallestCount = items[i].count;
                    tempIndex = i;
                }
            }
        }

        // See if the current count is greater than the smallest count in the list or if the counts
        // are the same but the current value is greater than the value of the array's smallest count
        // and if so replaces the array item
        if (current->count > items[tempIndex].count ||
            (current->count == items[tempIndex].count && current->item < items[tempIndex].item)) {
            items[tempIndex].count = current->count;
            items[tempIndex].item = current->item;
        }
    }

    commonList(current->left, index, items, k);
    commonList(current->right, index, items, k);
}

/*
Sorts an array of items using bubble sort for most common values
*/
void sortItems(struct item items[], int k) {
    // Bubble sort items by count in the items array
    for (int j = 0; j < k; j++) {
        for (int i = 0; i < k; i++) {
            if (i + 1 == k) {
                break;
            }
            if (items[i].count < items[i + 1].count) {
                struct item temp = items[i];
                items[i] = items[i + 1];
                items[i + 1] = temp;
            } else if (items[i].count == items[i + 1].count) {
                if (items[i].item > items[i + 1].item) {
                    struct item temp = items[i];
                    items[i] = items[i + 1];
                    items[i + 1] = temp;
                }
            }
        }
    }
}




////////////////////////////////////////////////////////////////////////
// Cursor Operations

typedef struct cursor *MsetCursor;

/**
 * Creates a new cursor positioned at the start of the mset
 */
MsetCursor MsetCursorNew(Mset s) {
	struct node *head = s->tree;

	// Find the lowest and largest nodes in tree
	struct node *lowest = s->tree;
	while (lowest != NULL) {
		lowest = lowest->left;
	}

	struct node *highest = s->tree;
	while (highest != NULL) {
		highest = highest->right;
	}

	// Make a new double linked list for the cursor to live in
	struct list *mainList = malloc(sizeof(mainList));

	// Make a NULL listNode for the head and tail of the list
	struct listNode *bknd1 = malloc(sizeof(bknd1));
	struct listNode *bknd2 = malloc(sizeof(bknd2));
	printf("%d is the bookend count", bknd1->count);

	bknd1->isBookend = true;
	bknd1->previous = NULL;
	bknd1->count = 0;
	bknd1->item = UNDEFINED;
	bknd1->next = bknd2;

	bknd2->isBookend = true;
	bknd2->previous = bknd1;
	bknd2->count = 0;
	bknd2->item = UNDEFINED;
	bknd2->next = NULL;

	mainList->head = bknd1;
	mainList->tail = bknd2;
	mainList->size = 0;

	// Fill the double list
	mainList = partitionTreeToList(mainList, bknd1, head, lowest, highest);

	// Make a new cursor
	MsetCursor newCursor = malloc(sizeof(*newCursor));  // Corrected sizeof parameter
	newCursor->count = 0;
	newCursor->position = UNDEFINED;
	newCursor->curNode = bknd1;
	newCursor->associatedMset = s;

	return newCursor;
}

/**
 * Frees all memory allocated to the given cursor
 */
void MsetCursorFree(MsetCursor cur) {
	if (cur == NULL) {
		return;
	}

	free(cur);
	return;
}

/**
 * Returns the element at the cursor's position and its count, or
 * {UNDEFINED, 0} if the cursor is positioned at the start or end of
 * the mset.
 */
struct item MsetCursorGet(MsetCursor cur) {
	struct listNode *current = cur->curNode;
	struct item *newItem = malloc(sizeof(newItem));

	newItem->count = current->count;
	newItem->item = current->item;

	if (current->isBookend) {
		return (struct item){UNDEFINED, 0};
	}

	return (struct item){newItem->item, newItem->count};
}

/**
 * Moves the cursor to the next greatest element, or to the end of the
 * mset if there is no next greatest element. Returns false if the
 * cursor is now at the end of the mset, and true otherwise.
 */
bool MsetCursorNext(MsetCursor cur) {
	struct listNode *current = cur->curNode;
	current = current->next;

	if (current->isBookend) {
		cur->count = 0;
		cur->position = UNDEFINED;
		return false;
	}
	cur->count = current->count;
	cur->position++;

	return true;
}

/**
 * Moves the cursor to the next smallest element, or to the start of the
 * mset if there is no next smallest element. Returns false if the
 * cursor is now at the start of the mset, and true otherwise.
 */
bool MsetCursorPrev(MsetCursor cur) {
    struct listNode *current = cur->curNode;
    current = current->next;

    if (current->isBookend) {
        cur->count = 0;
        cur->position = UNDEFINED;
        return false;
    }
    cur->count = current->count;
    cur->position--;

    return true;
}

////////////////////////////////////////////////////////////////////////

