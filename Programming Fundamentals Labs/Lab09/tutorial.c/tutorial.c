
// Program to do various linked list exercises
// Written by <your-name> (zID) on <date>

#include <stdio.h>
#include <stdlib.h>
//
struct node {
	int data;		// data item at this node
	struct node *next;		// pointer to the next node
};

/** PRESCRIBED FUNCTIONS **/

// Append to a linked list
struct node *add_last(struct node *head, int data);

// Prints the data of a linked list
void print_list(struct node *head);

// Returns a copy of the linked list and frees the original list.
struct node *copy(struct node *head);

// Returns a new linked list where it is the second appended to the first
struct node *list_append(struct node *first_list, struct node *second_list);

// Returns 1 if the two lists are identical, otherwise returns 0
int identical(struct node *first_list, struct node *second_list);

// Given two lists in strictly increasing order, perform the set operation: 
// intersection.
// Return a new linked list (in strictly increasing order) of the elements in 
// both set1 and set2
struct node *set_intersection(struct node *first_list, struct node *second_list);

/** REVISION FUNCTIONS **/

// Deletes the last node of the given linked list and returns the head of
// the linked list
struct node *delete_last(struct node *head);

// Returns 1 if list is in strictly increasing order, otherwise returns 0
int ordered(struct node *head);

// Given two linked lists in strictly increasing order, perform the set operation: union.
// Return a new linked list (in strictly increasing order) of the elements in either set1 or set2
// which has no duplicates (only include them once)
struct node *set_union(struct node *first_list, struct node *second_list);

// Frees all the elements in a linked list
void free_list(struct node *head);

// Return the number of items in the linked list
int num_items(struct node *head);
//
struct node *create_node(int data);
struct node *find_last_node(struct node *head);

int main(void) {

    return 0;
}

/** PRESCRIBED FUNCTIONS **/

struct node *add_last(struct node *head, int data) {
    struct node *new = create_node(data);

    // Return new if linked list is initially empty
    if (head == NULL) {
        return new;
    }

    struct node *last = find_last_node(head);
    last->next = new;

    // We are inserting at the end --> head will not change
    return head;
}

struct node *create_node(int data) {
    struct node *new = malloc(sizeof(struct node));
    new->data = data;
    new->next = NULL;

    return new;
}

struct node *find_last_node(struct node *head) {
    struct node *curr = head;
    while (curr->next != NULL) {
        curr = curr->next;
    }
    return curr;
}

void print_list(struct node *head) {
    struct node *curr = head;
    while (curr != NULL) {
        printf("%d -> ", curr->data);
        curr = curr->next;
    }
    printf("X\n");
}

struct node *copy(struct node *list) {
    struct node *new_list = NULL;
    struct node *curr = list;
    while (curr != NULL) {
        new_list = add_last(new_list, curr->data);

        curr = curr->next;
    }
    return new_list;
}

struct node *list_append(struct node *first_list, struct node *second_list) {
    struct node *first_copy = copy(first_list);
    struct node *second_copy = copy(second_list);
    if (first_copy == NULL) {
        return second_copy;
    }
    struct node *first_last = find_las_node(first_list);
    first_last->next = second_copy;
    
    return first copy;
}

int identical(struct node *first_list, struct node *second_list) {
    struct node *first_copy = copy(first_list);
    struct node *second_copy = copy(second_list);

    while (first_copy != NULL && second_copy != NULL) {
        if (first_copy->data != second_copy->data) {
            return 0;
        }
        first_copy = first_copy->next;
        second_copy = second_copy->next;
    }
    if (first_copy != NULL || second_copy != NULL) {
        return 0
    }
    return 1;
}

struct node *set_intersection(
    struct node *first_list,
    struct node *second_list
    
) {
    struct node *first_copy = copy(first_list);
    struct node *second_copy = copy(second_list);
    struct node *new_node = NULL;
    while (first_copy != NULL) {
        while (second_copy != NULL) {
            if (first_copy->data == second_copy->data) {
                new_node = add_last(new, first_curr->data);
                second_copy = NULL;
            }
            second_curr = second_curr->next;
        }
        first_curr = first_curr->next;
    }
    return new_node;
}
