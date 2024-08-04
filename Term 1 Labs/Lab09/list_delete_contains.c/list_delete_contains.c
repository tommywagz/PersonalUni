//Thomas Wagner
//z5436162

//12/11/22

#include <stdio.h>
#include <stdlib.h>
#include <assert.h>

struct node {
    struct node *next;
    int          data;
};

struct node *delete_contains(int value, struct node *head);
struct node *array_to_list(int len, int array[]);
void print_list(struct node *head);
static void free_list(struct node *head);

#define MAX_INIT_LIST_LEN 100

// DO NOT CHANGE THIS MAIN FUNCTION
int main() {
    // Need to read in a number of ints into an array
    printf("How many numbers in initial list?: ");
    int list_size = 0;
    scanf("%d", &list_size);
    int initial_elems[MAX_INIT_LIST_LEN] = {0};
    int n_read = 0;
    while (n_read < list_size && scanf("%d", &initial_elems[n_read])) {
        n_read++;
    }
    
    // create linked list from command line arguments
    struct node *head = NULL;
    if (n_read > 0) {
        // list has elements
        head = array_to_list(n_read, initial_elems);
    }
    
    printf("Enter value to delete: ");
    int value;
    scanf("%d", &value);
    struct node *new_head = delete_contains(value, head);
    print_list(new_head);
    
    free_list(new_head);

    return 0;
}


//
// Delete the first node in the list containing the value `value`.
// The deleted node is freed.
// If no node contains `value`, the list is not changed.
// The head of the list is returned.
//
struct node *delete_contains(int value, struct node *head) {

    struct node *current = head;
    struct node *previous = NULL;
    struct node *dummy = NULL;

    if (current == NULL) {
        return head;
    }

    else if (current->next == NULL && current->data == value) {
        free(current);
        return NULL;
    }

    else if (current->next == NULL) {
        return head;
    }

    else if (current->next != NULL && current->data == value) {
        dummy = current;
        current = current->next;
        head = current;
        free(dummy);
        return head;
    }

    while (current != NULL && current->data != value) {
        previous = current;
        current = current->next;

    } 

    if (current->data == value) {
        dummy = current;
        previous->next = current->next;
        current = current->next;

        free(dummy); 
    }

    if (current == NULL) {
        return head;
    }

    return head;

}

// DO NOT CHANGE THIS FUNCTION
// Free all nodes in the supplied list
static void free_list(struct node *head) {
    if (head != NULL) {
        free_list(head->next);
        free(head);
    }
}


// DO NOT CHANGE THIS FUNCTION
// create linked list from array of strings
struct node *array_to_list(int len, int array[]) {
    struct node *head = NULL;
    int i = len - 1;
    while (i >= 0) {
        struct node *n = malloc(sizeof (struct node));
        assert(n != NULL);
        n->next = head;
        n->data = array[i];
        head = n;
        i -= 1;
    }   
    return head;
}

// DO NOT CHANGE THIS FUNCTION
// print linked list
void print_list(struct node *head) {
    printf("[");    
    struct node *n = head;
    while (n != NULL) {
        // If you're getting an error here,
        // you have returned an invalid list
        printf("%d", n->data);
        if (n->next != NULL) {
            printf(", ");
        }
        n = n->next;
    }
    printf("]\n");
}