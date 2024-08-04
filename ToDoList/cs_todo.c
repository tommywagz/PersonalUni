//Thomas Wagner
//z5436162

//18/11/2022

//This program is meant to emulate all of the functionalities of a to do list. 
//The user should be able to add, complete, repeat and delete tasks on their
//to do list. The user can also count the number of tasks there are on the list, 
//raise the prriority of their tasks, and even estimate the time it will take to
//complete them. The user can also clear their completed section completely,
//while exiting out of the list will wipe it clean.

//As a side note there is a substantial amount of code that is commented out
//in seemingly random places. This was all of the code that I wrote to try and 
//complete stage 4.1. Unfortunately I should did not allocate enough time to 
//finish stage 4.1 but I wanted to show at least in part what I did for the 
//stage prior to running out of time.

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define INVALID_PRIORITY -1

#define MAX_TASK_LENGTH 200
#define MAX_CATEGORY_LENGTH 40
#define MAX_STRING_LENGTH 1024

#define COMMAND_ADD_TASK 'a'
#define COMMAND_PRINT_TASK 'p'
#define COMMAND_UPDATE_TASK 'i'
#define COMMAND_COUNT_TASKS 'n'
#define COMMAND_COMPLETE_TASK 'c'
#define COMMAND_PRINT_COMPLETE 'P'
#define COMMAND_COMPLETION 'e'
#define COMMAND_DELETE_TASK 'd'
#define COMMAND_FINISH 'f'
#define COMMAND_REPEAT 'r'
/*#define COMMAND_PATTERN 'm'
#define MATCH_ONE '?'
#define MATCH_MULTI '*'
#define MATCH_ANY_FIRST '['
#define MATCH_ANY_SECOND ']'*/

enum priority { LOW, MEDIUM, HIGH };

struct task {
    char task_name[MAX_TASK_LENGTH];
    char category[MAX_CATEGORY_LENGTH];
    enum priority priority;
    int repeat;
    struct task *next;
};

/*struct match_task {
    char task_name[MAX_TASK_LENGTH];
    char category[MAX_CATEGORY_LENGTH];
    enum priority priority;
    int repeat;
    struct task *next;
};*/

struct completed_task {
    struct task *task;
    int start_time;
    int finish_time;
    int repeat;
    struct completed_task *next;
};

struct todo_list {
    struct task *tasks;
    struct completed_task *completed_tasks;
    struct match_task *match_tasks;
};

////////////////////////////////////////////////////////////////////////////////
///////////////////// YOUR FUNCTION PROTOTYPES GO HERE /////////////////////////
////////////////////////////////////////////////////////////////////////////////

void command_loop(struct todo_list *todo);
struct todo_list *create_todo(); 
struct task *create_task(
    char task_name[MAX_TASK_LENGTH], 
    char task_category[MAX_CATEGORY_LENGTH], 
    enum priority priority);
void add_task_to_end (struct todo_list *list, struct task *new);
void add_task(struct todo_list *list);
void print_all(struct todo_list *todo); 
void update_priority(struct todo_list *todo);
void count_tasks(struct todo_list *todo);
struct completed_task *create_completed_task(
    struct task *task,
    int start_time,
    int finish_time
);
void add_completed(struct todo_list *todo);
void add_completed_to_end (struct todo_list *list, struct completed_task *new);
void print_complete(struct todo_list *todo);
void expected_time(struct todo_list *todo);
int find_average(struct todo_list *todo, char cat[MAX_CATEGORY_LENGTH]);
void delete_task(struct todo_list *todo);
void finish_list(struct todo_list *list);
void repeat(struct todo_list *todo);
void delete_everything(struct todo_list *todo);
/*void match_one(struct todo_list *list, 
    char pattern[MAX_STRING_LENGTH], 
    int position);
void match_multi(
    struct todo_list *list, 
    char pattern[MAX_STRING_LENGTH],
    int position
);
void match_some(
    struct todo_list *list, 
    char pattern[MAX_STRING_LENGTH], 
    int first, int second
);
void add_match_to_end(struct todo_list *list, struct match_task *new);
void match(struct todo_list *list);
struct match_task *create_match_task(
    char task_name[MAX_TASK_LENGTH], 
    char category[MAX_CATEGORY_LENGTH], 
    enum priority priority
); */

////////////////////////////////////////////////////////////////////////////////
//////////////////////// PROVIDED HELPER PROTOTYPES ////////////////////////////
////////////////////////////////////////////////////////////////////////////////

void parse_add_task_line(
    char buffer[MAX_STRING_LENGTH], char task_name[MAX_TASK_LENGTH],
    char task_category[MAX_CATEGORY_LENGTH], enum priority *prio
);
void parse_task_category_line(
    char buffer[MAX_STRING_LENGTH], char task_name[MAX_TASK_LENGTH],
    char task_category[MAX_CATEGORY_LENGTH]
);
void parse_complete_task_line(
    char buffer[MAX_STRING_LENGTH], char task_name[MAX_TASK_LENGTH],
    char task_category[MAX_CATEGORY_LENGTH], int *start_time, int *finish_time
);

enum priority string_to_priority(char priority[MAX_STRING_LENGTH]);
void remove_newline(char input[MAX_STRING_LENGTH]);
void trim_whitespace(char input[MAX_STRING_LENGTH]);
void print_one_task(int task_num, struct task *task);
void print_completed_task(struct completed_task *completed_task);

int task_compare(struct task *t1, struct task *t2);

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

int main(void) {
    printf("Welcome to CS ToDo!\n");
    struct todo_list *todo = create_todo();
    
    command_loop(todo);
    printf("All done!\n");
    
    return 0;
}

void command_loop(struct todo_list *todo) {
    printf("Enter Command: ");
    char command;
    while (scanf(" %c", &command) == 1) {
        
        if (command == COMMAND_ADD_TASK) {
            add_task(todo);
        }
        else if (command == COMMAND_PRINT_TASK) {
            print_all(todo);
        }
        else if (command == COMMAND_UPDATE_TASK) {
            update_priority(todo);
        }
        else if (command == COMMAND_COUNT_TASKS) {
            count_tasks(todo);
        }
        else if (command == COMMAND_COMPLETE_TASK) {
            add_completed(todo);
        }
        else if (command == COMMAND_PRINT_COMPLETE) {
            print_complete(todo);
        }
        else if (command == COMMAND_COMPLETION) {
            expected_time(todo);
        }
        else if (command == COMMAND_DELETE_TASK) {
            delete_task(todo);
        }
        else if (command == COMMAND_FINISH) {
            finish_list(todo);
        }
        else if (command == COMMAND_REPEAT) {
            repeat(todo);
        }
        /*else if (command == COMMAND_PATTERN) {
            match(todo);
        }*/
        printf("Enter Command: ");
    }

    delete_everything(todo);

}

////////////////////////////////////////////////////////////////////////////////
////////////////////////// YOUR HELPER FUNCTIONS ///////////////////////////////
////////////////////////////////////////////////////////////////////////////////
/*
struct match_task *create_match_task(char task_name[MAX_TASK_LENGTH], 
char category[MAX_CATEGORY_LENGTH], enum priority priority) {
    struct match_task *new;
    new = malloc(sizeof(struct match_task));
    strcpy(new->task_name, task_name);
    strcpy(new->category, category);
    new->priority = priority;
    new->next = NULL;

    return new;
}

void match_one(struct todo_list *list, char pattern[MAX_STRING_LENGTH], 
int position) {

    struct task *current_task = list->tasks;
    struct match_task *current = list->match_tasks;

    char task[MAX_TASK_LENGTH] = {0};

    while (current_task != NULL) {
        
        strcpy(task, current_task->task_name);
        if ((task[position - 1] == pattern[position - 1]) && 
        (task[position + 1] == pattern[position + 1])) {

            struct match_task *new = create_match_task(
            current_task->task_name,
            current_task->category,
            current_task->priority
            );

            if (current == NULL) {
                list->match_tasks = new;
            }

            else {
                add_match_to_end(list, new);
            }
        }
        
        current_task = current_task->next;
    }
    
}

void match_multi(struct todo_list *list, char pattern[MAX_STRING_LENGTH],
int position) {

    struct match_task *current = list->match_tasks;
    struct task *current_task = list->tasks;

    char start = pattern[position - 1];
    char after = pattern[position + 1];
    char task[MAX_STRING_LENGTH] = {0};

    while (current_task != NULL) {
        
        strcpy(task, current_task->task_name);
        int start_index = -1;
        int end_index = -1;
        for (int i = 0; i < strlen(task); i++) {
            if (task[i] == start) {
                start_index = i;
            }
            else if (task[i] == after) {
                end_index = i;
                i = strlen(task);
            }
        }

        if (start_index > -1 && end_index > -1) {
            struct match_task *new = create_match_task(
                current_task->task_name,
                current_task->category,
                current_task->priority
            );
            if (current == NULL) {
                list->match_tasks = new;
            }
            else {
                add_match_to_end(list, new);
            }
        }

        current_task = current_task->next;
    }
}

void match_some(struct todo_list *list, char pattern[MAX_STRING_LENGTH], 
int first, int second) {

    struct match_task *current = list->match_tasks;
    struct task *current_task = list->tasks;

    char task[MAX_TASK_LENGTH] = {0};
    char options[MAX_TASK_LENGTH] = {0};

    for (int i = 0; i < strlen(options);i++) {

    }


}

void add_match_to_end(struct todo_list *list, struct match_task *new) {
    struct match_task *current_task = list->tasks;

    if (current_task == NULL) {
        list->tasks = new;
        return;
    }

    while (current_task->next != NULL) {
        current_task = current_task->next;
    }

    current_task->next = new;
}

void match(struct todo_list *list) {

    struct match_task *current_match = list->match_tasks;
    struct task *current = list->tasks;

    char buffer[MAX_STRING_LENGTH];
    fgets(buffer, MAX_STRING_LENGTH, stdin);
    trim_whitespace(buffer);

    printf("Tasks matching pattern '%s':\n", buffer);

    int first;
    int single_locations[MAX_TASK_LENGTH] = {0}; 
    int multi_locations[MAX_TASK_LENGTH] = {0};
    int match_firsts[MAX_TASK_LENGTH] = {0};
    int match_seconds[MAX_TASK_LENGTH] = {0};
    int single_place = 0, multi_place = 0, first_place = 0, second_place = 0;
    for (int i = 0; i < strlen(buffer); i++) {
        
        if (buffer[i] == MATCH_ONE) {

           single_locations[single_place] = i;
           single_place++;
            //call ? function todo, buffer, and i, the position of the question mark
            // if character before ? are the same as items in tasks then 
            //print that task
            

        }

        else if (buffer[i] == MATCH_MULTI) {
            multi_locations[multi_place] = i;
            multi_place++;
            //call * function
            //while i is between character before and after *
            //add task to the array
        }

        else if (buffer[i] == MATCH_ANY_FIRST) {
            match_firsts[first_place] = i;
            first_place++;
            first = i;
        }

        else if (buffer[i] == MATCH_ANY_SECOND) {
            match_seconds[second_place] = i;
            second_place++;
            
            //call [ function until ] para i, first
            //if any character within the brackets is the character after
            //the previous character in any task, then print it
        }
        
    }

    if (match_firsts > 0) {
        while (match_firsts >= 0) {
            match_some();
            match_firsts--;
        }
        
    }
    if (single_place > 0) {
        for (int i = 0; i < single_place; i++)
        match_one();
    }
    if (multi_place > 0) {
        match_multi();
    }
    

    int task_num = 1;
    while (current_match != NULL) {
        print_one_task(task_num, current);
        task_num++;
        current_match = current_match->next;
    }
    
    
}
*/
void delete_everything(struct todo_list *todo) {
    
    struct task *current = todo->tasks;
    struct task *dummy = NULL;
    struct completed_task *current_completed = todo->completed_tasks;
    struct completed_task *dummy_comp = NULL;
    /*struct match_task *current_match = todo->match_tasks;
    struct match_task *match_dummy = NULL;*/

    while (current_completed != NULL) {
        dummy_comp = current_completed;
        current_completed = current_completed->next;
        todo->completed_tasks = current_completed;
        dummy_comp->next = NULL;
        free(dummy_comp->task);
        free(dummy_comp);
    }
    free(current_completed);
    free(todo->completed_tasks);

    while (todo->tasks != NULL) {
        dummy = current;
        current = current->next;
        todo->tasks = current;
        dummy->next = NULL;
        free(dummy);
    }
    free(current);
    free(todo->tasks);

    /*while (current_match != NULL) {
        match_dummy = current_match;
        current_match = current_match->next;
        todo->match_tasks = current_match;
        match_dummy->next = NULL;
        free(match_dummy);
    }
    free(current_match);*/

    free(todo);
}

void repeat(struct todo_list *todo) {

    char buffer[MAX_STRING_LENGTH];
    fgets(buffer, MAX_STRING_LENGTH, stdin);

    char task_name[MAX_TASK_LENGTH];
    char category[MAX_CATEGORY_LENGTH];
    parse_task_category_line(buffer, task_name, category);

    struct task *current = todo->tasks;

    while (current != NULL) {
        if (strcmp(current->task_name, task_name) == 0 &&
        strcmp(current->category, category) == 0) {
            if (current->repeat == 1) {
                current->repeat = 0;
                return;
            }
            current->repeat = 1;
            return;
        }
        current = current->next;
    }

    if (current == NULL) {
        printf("Could not find task '%s' in category '%s'.\n", 
        task_name, category);
    }
    return;
}

void finish_list(struct todo_list *list) {

    struct completed_task *current = list->completed_tasks;

    if (current == NULL) {
        return;
    }

    else if (current->next == NULL) {
        if (current->repeat == 1) {
            add_task_to_end(list, current->task);
            current->task = NULL;
        }

        list->completed_tasks = NULL;
        free(current->task);
        free(current);
        return;
    }

    while (current != NULL) {
        if (current->repeat == 1) {
            add_task_to_end(list, current->task);
            current->task = NULL;
        }

        struct completed_task *dummy = NULL;
        list->completed_tasks = current->next;
        dummy = current;
        current = current->next;
        free(dummy->task);
        free(dummy);
    }
    free(list->completed_tasks);
}

void delete_task(struct todo_list *todo) {
    char buffer[MAX_STRING_LENGTH];
    fgets(buffer, MAX_STRING_LENGTH, stdin);

    char task_name[MAX_TASK_LENGTH];
    char category[MAX_CATEGORY_LENGTH];
    parse_task_category_line(buffer, task_name, category);

    struct task *head = todo->tasks;
    struct task *current = head;
    struct task *previous = NULL;
    struct task *dummy = NULL;

    if (current == NULL) {
        printf("Could not find task '%s' in category '%s'.\n", 
        task_name, category);
        return;
    }

    else if (current->next == NULL && 
    strcmp(current->task_name, task_name) == 0 && 
    strcmp(current->category, category) == 0) {
        dummy = current;
        todo->tasks = current->next;
        current = current->next;
        free(dummy);
        return;
    }

    else if (current->next == NULL) {
        printf("Could not find task '%s' in category '%s'.\n", 
        task_name, category);
        return;
    }

    else if (current->next != NULL && 
    strcmp(current->task_name, task_name) == 0 && 
    strcmp(current->category, category) == 0) {
        dummy = current;
        current = current->next;
        todo->tasks = current;
        free(dummy);
        return;
    }

    while (current != NULL && 
    (strcmp(current->task_name, task_name) != 0 ||
    strcmp(current->category, category) != 0)) {
        previous = current;
        current = current->next;
    }
    
    if (current == NULL) {
        printf("Could not find task '%s' in category '%s'.\n", 
        task_name, category);
    }

   

    else if (strcmp(current->task_name, task_name) == 0 &&
    strcmp(current->category, category) == 0) {
        dummy = current;
        previous->next = current->next;
        current = current->next; 
        free(dummy);
        return;
    }
}

int find_average(struct todo_list *todo, char cat[MAX_CATEGORY_LENGTH]) {
    struct completed_task *current_complete = todo->completed_tasks;

    int avg_time = 0;
    int times = 0;
    if (current_complete == NULL) {
        return 100;
    }

    while (current_complete != NULL) {
        if (strcmp(current_complete->task->category, cat) == 0) {
            avg_time += 
            (current_complete->finish_time - current_complete->start_time);
            times++;
        }
        current_complete = current_complete->next;
    }

    if (times == 0) {
        return 100;
    }

    avg_time = avg_time/times;

    return avg_time;
}

void expected_time(struct todo_list *todo) {

    printf("Expected completion time for remaining tasks: \n\n");
    struct task *current_task = todo->tasks;

    int num_task = 1;
    while (current_task != NULL) {
        print_one_task(num_task, current_task);
        num_task++;
        printf("Expected completion time: %d minutes\n\n", 
        find_average(todo, current_task->category));
        current_task = current_task->next;
    }
}

void print_complete(struct todo_list *todo) {
    
    struct completed_task *current = todo->completed_tasks;;

    printf("==== Completed Tasks ====\n");

    if (current == NULL) {
        printf("No tasks have been completed today!\n");
    }

    while (current != NULL) {
        print_completed_task(current);
        current = current->next;
    }

    printf("=========================\n");
}

void add_completed_to_end(struct todo_list *list, struct completed_task *new) {
    
    struct completed_task *current = list->completed_tasks;

    if (current == NULL) {
        list->completed_tasks = new;
        return;
    }
    
    list->completed_tasks = new;
    new->next = current;
}

void add_completed(struct todo_list *list) {
    
    char buffer[MAX_STRING_LENGTH];
    fgets(buffer, MAX_STRING_LENGTH, stdin);

    char task_name[MAX_TASK_LENGTH];
    char category[MAX_CATEGORY_LENGTH];
    int start;
    int finish;
    parse_complete_task_line(buffer, task_name, category, &start, &finish);

    struct task *current = list->tasks;
    struct task *previous = NULL;
    struct task *dummy = NULL;
    struct completed_task *current_complete = list->completed_tasks;

    if (start == -1 && list->completed_tasks != NULL) {
        int fin = 0;
        while (current != NULL) {
            if (current_complete->finish_time > fin) {
                fin = current_complete->finish_time;
                
            }
            current_complete = current_complete->next;
        }
        start = fin;
    }
    else if (start == -1) {
        start = 0;
    }

    if (current == NULL) {
        printf("Could not find task '%s' in category '%s'.\n", 
        task_name, category);
        return;
    }

    if (strcmp(current->task_name, task_name) == 0 &&
        strcmp(current->category, category) == 0) {
        list->tasks = current->next;
        dummy = current;
        dummy->next = NULL;

        struct completed_task *new = create_completed_task(
        dummy, 
        start, 
        finish);
        add_completed_to_end(list, new);
        return;
    }

    int done = 0;
    while (current != NULL) {
        
        if (strcmp(current->task_name, task_name) == 0 &&
        strcmp(current->category, category) == 0) {
            
            previous->next = current->next;
            dummy = current;
            dummy->next = NULL;
            done++;

            struct completed_task *new = create_completed_task(
            dummy, 
            start, 
            finish);

            add_completed_to_end(list, new);
        }

        previous = current;
        current = current->next;
    
    }

    if (done == 0) {
        printf("Could not find task '%s' in category '%s'.\n", 
        task_name, category);
    }

    
}

struct completed_task *create_completed_task(struct task *task, int start_time, 
int finish_time) {

    struct completed_task *new = malloc(sizeof(struct completed_task));
    new->next = NULL;
    new->start_time = start_time;
    new->finish_time = finish_time;
    new->task = task;
    new->repeat = task->repeat;

    return new;
}

void count_tasks(struct todo_list *todo) {
    int count = 0;
    struct task *current = todo->tasks;

    while (current != NULL) {
        count++;
        current = current->next;
    }

    printf("There are %d items on your list!\n", count);
}

void update_priority(struct todo_list *todo) {

    struct task *head = todo->tasks;
    struct task *current = head;

    char buffer[MAX_STRING_LENGTH];
    fgets(buffer, MAX_STRING_LENGTH, stdin);

    char task[MAX_TASK_LENGTH];
    char category_name[MAX_CATEGORY_LENGTH];
    parse_task_category_line(buffer, task, category_name);

    while (current != NULL) {
        if (strcmp(current->task_name, task) == 0 && 
            strcmp(current->category, category_name) == 0) {
            if (current->priority == LOW) {
                current->priority = MEDIUM;
                return;
            }
            else if (current->priority == MEDIUM) {
                current->priority = HIGH;
                return;
            }
            else if (current->priority == HIGH) {
                current->priority = LOW;
                return;
            }
        }
        current = current->next;
    }

    if (current == NULL) {
        printf("Could not find task '%s' in category '%s'.\n", 
        task, category_name);
    }

    return;
}

void print_all(struct todo_list *todo) {

    printf("==== Your ToDo List ====\n");
    struct task *head = todo->tasks;
    struct task *current = head;

    int task_num = 1;

    if (head == NULL) {
        printf("All tasks completed, you smashed it!\n");
    }

    while (current != NULL) {
        print_one_task(task_num, current);
        task_num++;
        current = current->next;
    }

    printf("====   That's it!   ====\n");

}

struct todo_list *create_todo() {

    struct todo_list *list;
    list = malloc(sizeof(struct todo_list));
    list->tasks = NULL;
    list->completed_tasks = NULL;

    return list;
}

struct task *create_task(char task_name[MAX_TASK_LENGTH], 
char task_category[MAX_CATEGORY_LENGTH], enum priority priority) {

    struct task *new;
    new = malloc(sizeof(struct task));
    strcpy(new->task_name, task_name);
    strcpy(new->category, task_category);
    new->priority = priority;
    new->next = NULL;
    new->repeat = 0;

    return new;
}

void add_task(struct todo_list *list) {

    char buffer[MAX_STRING_LENGTH];
    fgets(buffer, MAX_STRING_LENGTH, stdin);

    char task_name[MAX_TASK_LENGTH];
    char category[MAX_CATEGORY_LENGTH];
    enum priority prio;
    parse_add_task_line(buffer, task_name, category, &prio);

    struct task *new = create_task(task_name, category, prio);
    add_task_to_end(list, new);
}

void add_task_to_end(struct todo_list *list, struct task *new) {

    struct task *current_task = list->tasks;

    if (current_task == NULL) {
        list->tasks = new;
        return;
    }

    while (current_task->next != NULL) {
        current_task = current_task->next;
    }

    current_task->next = new;
}

////////////////////////////////////////////////////////////////////////////////
/////////////////////// PROVIDED HELPER FUNCTIONS //////////////////////////////
////////////////////////////////////////////////////////////////////////////////

/**
 * Helper Function
 * You DO NOT NEED TO UNDERSTAND THIS FUNCTION, and will not need to change it.
 *
 * Given a raw string in the format: [string1] [string2] [enum priority]
 * This function will extract the relevant values into the given variables.
 * The function will also remove any newline characters.
 *
 * For example, if given: "finish_assignment_2 assignment2 high"
 * The function will copy the string:
 *     "finish_assignment_2" into the `task_name` array
 * Then copy the string:
 *     "assignment2" into the `task_category` array
 * And finally, copy over the enum:
 *     "high" into the memory that `prio` is pointing at.
 *
 * Parameters:
 *     buffer        - A null terminated string in the following format
 *                     [string1] [string2] [enum priority]
 *     task_name     - A character array for the [string1] to be copied into
 *     task_category - A character array for the [string2] to be copied into
 *     prio          - A pointer to where [enum priority] should be stored
 *
 * Returns:
 *     None
 */
void parse_add_task_line(
    char buffer[MAX_STRING_LENGTH],
    char task_name[MAX_TASK_LENGTH],
    char task_category[MAX_CATEGORY_LENGTH],
    enum priority *prio
) {
    remove_newline(buffer);

    // Extract value 1 as string
    char *name_str = strtok(buffer, " ");
    if (name_str != NULL) {
        strcpy(task_name, name_str);
    }

    // Extract value 2 as string
    char *category_str = strtok(NULL, " ");
    if (category_str != NULL) {
        strcpy(task_category, category_str);
    }
    
    // Extract value 3 as string
    char *prio_str = strtok(NULL, " ");
    if (prio_str != NULL) {
        *prio = string_to_priority(prio_str);
    }

    if (
        name_str == NULL ||
        category_str == NULL ||
        prio_str == NULL ||
        *prio == INVALID_PRIORITY
    ) {
        // If any of these are null, there were not enough words.
        printf("Could not properly parse line: '%s'.\n", buffer);
    }
}

/*
 * Helper Function
 * You DO NOT NEED TO UNDERSTAND THIS FUNCTION, and will not need to change it.
 *
 * See `parse_add_task_line` for explanation - This function is very similar,
 * with only the exclusion of an `enum priority`.
 */
void parse_task_category_line(
    char buffer[MAX_STRING_LENGTH],
    char task_name[MAX_TASK_LENGTH],
    char task_category[MAX_CATEGORY_LENGTH]
) {
    remove_newline(buffer);

    // Extract value 1 as string
    char *name_str = strtok(buffer, " ");
    if (name_str != NULL) {
        strcpy(task_name, name_str);
    }

    // Extract value 2 as string
    char *category_str = strtok(NULL, " ");
    if (category_str != NULL) {
        strcpy(task_category, category_str);
    }

    if (name_str == NULL || category_str == NULL) {
        // If any of these are null, there were not enough words.
        printf("Could not properly parse line: '%s'.\n", buffer);
    }
}

/*
 * Helper Function
 * You DO NOT NEED TO UNDERSTAND THIS FUNCTION, and will not need to change it.
 *
 * See `parse_add_task_line` for explanation - This function is very similar,
 * with only the exclusion of an `enum priority` and addition of start/end times
 */
void parse_complete_task_line(
    char buffer[MAX_STRING_LENGTH],
    char task_name[MAX_TASK_LENGTH],
    char task_category[MAX_CATEGORY_LENGTH],
    int *start_time,
    int *finish_time
) {
    remove_newline(buffer);

    // Extract value 1 as string
    char *name_str = strtok(buffer, " ");
    if (name_str != NULL) {
        strcpy(task_name, name_str);
    }

    // Extract value 2 as string
    char *category_str = strtok(NULL, " ");
    if (category_str != NULL) {
        strcpy(task_category, category_str);
    }
    
    // Extract value 2 as string
    char *start_str = strtok(NULL, " ");
    if (start_str != NULL) {
        *start_time = atoi(start_str);
    }
    
    // Extract value 2 as string
    char *finish_str = strtok(NULL, " ");
    if (finish_str != NULL) {
        *finish_time = atoi(finish_str);
    }

    if (
        name_str == NULL ||
        category_str == NULL ||
        start_str == NULL ||
        finish_str == NULL
    ) {
        // If any of these are null, there were not enough words.
        printf("Could not properly parse line: '%s'.\n", buffer);
    }
}

/**
 * Helper Function
 * You should not need to change this function.
 *
 * Given a raw string, will return the corresponding `enum priority`,
 * or INVALID_PRIORITY if the string doesn't correspond with the enums.
 *
 * Parameters:
 *     priority - string representing the corresponding `enum priority` value
 * Returns:
 *     enum priority
 */
enum priority string_to_priority(char priority[MAX_STRING_LENGTH]) {
    if (strcmp(priority, "low") == 0) {
        return LOW;
    } else if (strcmp(priority, "medium") == 0) {
        return MEDIUM;
    } else if (strcmp(priority, "high") == 0) {
        return HIGH;
    }

    return INVALID_PRIORITY;
}

/**
 * Helper Function
 * You should not need to change this function.
 *
 * Given an priority and a character array, fills the array with the
 * corresponding string version of the priority.
 *
 * Parameters:
 *     prio - the `enum priority` to convert from
 *     out  - the array to populate with the string version of `prio`.
 * Returns:
 *     Nothing
 */
void priority_to_string(enum priority prio, char out[MAX_STRING_LENGTH]) {
    if (prio == LOW) {
        strcpy(out, "LOW");
    } else if (prio == MEDIUM) {
        strcpy(out, "MEDIUM");
    } else if (prio == HIGH) {
        strcpy(out, "HIGH");
    } else {
        strcpy(out, "Provided priority was invalid");
    }
}

/*
 * Helper Function
 * You should not need to change this function.
 *
 * Given a raw string will remove and first newline it sees.
 * The newline character wil be replaced with a null terminator ('\0')
 *
 * Parameters:
 *     input - The string to remove the newline from
 *
 * Returns:
 *     Nothing
 */
void remove_newline(char input[MAX_STRING_LENGTH]) {
    // Find the newline or end of string
    int index = 0;
    while (input[index] != '\n' && input[index] != '\0') {
        index++;
    }
    // Goto the last position in the array and replace with '\0'
    // Note: will have no effect if already at null terminator
    input[index] = '\0';
}

/*
 * Helper Function
 * You likely do not need to change this function.
 *
 * Given a raw string, will remove any whitespace that appears at the start or
 * end of said string.
 *
 * Parameters:
 *     input - The string to trim whitespace from
 *
 * Returns:
 *     Nothing
 */
void trim_whitespace(char input[MAX_STRING_LENGTH]) {
    remove_newline(input);
    
    int lower;
    for (lower = 0; input[lower] == ' '; ++lower);
    
    int upper;
    for (upper = strlen(input) - 1; input[upper] == ' '; --upper);
    
    for (int base = lower; base <= upper; ++base) {
        input[base - lower] = input[base];
    }

    input[upper - lower + 1] = '\0';
}

/**
 * Helper Function
 * You SHOULD NOT change this function.
 *
 * Given a task, prints it out in the format specified in the assignment.
 *
 * Parameters:
 *     task_num - The position of the task within a todo list
 *     task     - The task in question to print
 *
 * Returns:
 *     Nothing
 */
void print_one_task(int task_num, struct task *task) {
    char prio_str[MAX_STRING_LENGTH];
    priority_to_string(task->priority, prio_str);

    printf(
        "  %02d. %-30.30s [ %s ] %s\n",
        task_num, task->task_name, task->category, prio_str
    );

    int i = 30;
    while (i < strlen(task->task_name)) {
        printf("      %.30s\n", task->task_name + i);
        i += 30;
    }
}

/**
 * Helper Function
 * You SHOULD NOT change this function.
 *
 * Given a completed task, prints it out in the format specified in the
 * assignment.
 *
 * Parameters:
 *     completed_task - The task in question to print
 *
 * Returns:
 *     Nothing
 */
void print_completed_task(struct completed_task *completed_task) {
    int start_hour = completed_task->start_time / 60;
    int start_minute = completed_task->start_time % 60;
    int finish_hour = completed_task->finish_time / 60;
    int finish_minute = completed_task->finish_time % 60;
    
    printf(
        "  %02d:%02d-%02d:%02d | %-30.30s [ %s ]\n",
        start_hour, start_minute, finish_hour, finish_minute,
        completed_task->task->task_name, completed_task->task->category
    );

    int i = 30;
    while (i < strlen(completed_task->task->task_name)) {
        printf("      %.30s\n", (completed_task->task->task_name + i));
        i += 30;
    }
}

/**
 * Compares two tasks by precedence of category -> priority -> name and returns
 * an integer referring to their relative ordering
 * 
 * Parameters:
 *     t1 - The first task to compare
 *     t2 - The second task to compare
 *
 * Returns:
 *     a negative integer if t1 belongs before t2
 *     a positive integer if t1 belongs after t2
 *     0 if the tasks are identical (This should never happen in your program)
 */
int task_compare(struct task *t1, struct task *t2) {
    int category_diff = strcmp(t1->category, t2->category);
    if (category_diff != 0) {
        return category_diff;
    }
    
    int priority_diff = t2->priority - t1->priority;
    if (priority_diff != 0) {
        return priority_diff;
    }
    
    return strcmp(t1->task_name, t2->task_name);
}
