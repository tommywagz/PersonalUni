#include <stdio.h>
#include <stdlib.h>

#define LEFT_SQUARE '['
#define RIGHT_SQUARE ']'
#define LEFT_CURL '{'
#define RIGHT_CURL '}'
#define LEFT_PARA '('
#define RIGHT_PARA ')'
#define LEFT_VEC '<'
#define RIGHT_VEC '>'

struct big {
    struct left *lefts;
    struct right *rights;
    struct big *next;
    struct all *alls
};

struct all {
    struct all *net;
    char symbol;
};

struct left {
    struct left *next;
    char symbol;
};

struct right {
    struct right *next;
    char symbol;
};

struct left create_left(char symbol);
struct right create_right(char symbol);
struct all create_all(char symbol);
struct big create_big();

void add_all(struct big both, char symbol);
void add_left(struct big both, char symbol);
void add_right(struct big both, char symbol);

void correct(struct big *both);

int main(void) {

    int pass = 0;
    char temp;

    struct big *both = create_big();

    struct left *current_left = both->lefts;
    struct right *current_right = both->rights;

    int scan_return = scanf("%c", &temp);
    while (scan_return > 0) {
        int left = 0;
        int right = 0;
        if(temp == (LEFT_SQUARE || LEFT_CURL || LEFT_PARA || LEFT_VEC)) {
            add_left(both, temp);
            left = 1;
        }
        else if (temp == (RIGHT_SQUARE || RIGHT_CURL || RIGHT_PARA || RIGHT_VEC)) {
            add_right(both, temp);
            right = 1;
        }

        if (left == 1 || right == 1) {
            add_all(both, temp);
        }
    }

    




    if (pass == 0) {
        printf("Valid Sequence!\n");
    }
    else if (pass == 1) {
        printf("Invalid Sequence, the correct closing sequence is: \n");
        correct(both);
    }
    printf("Replace this with your solution!\n");
}

void add_all(struct big *bigs, char symbol) {
    struct all *new = create_all(symbol);
    struct all *current = bigs->alls;
    
    if (current == NULL) {
        bigs->alls = new;
        return;
    }

    while (current != NULL) {
        current = current->next;
    }

    current->next = new;
}

void add_left(struct big *bigs, char symbol) {
    struct left *new = create_left(symbol);
    struct left *current = bigs->lefts;
    
    if (current == NULL) {
        bigs->lefts = new;
        return;
    }

    while (current != NULL) {
        current = current->next;
    }

    current->next = new;
}

void add_right(struct big *bigs, char symbol) {
    struct left *new = create_right(symbol);
    struct left *current = bigs->rights;
    
    if (current == NULL) {
        bigs->rights = new;
        return;
    }

    while (current != NULL) {
        current = current->next;
    }

    current->next = new;
}


struct all create_all(char symbol) {
    struct all *new = malloc(sizeof(struct all));
    new->next = NULL;
    new->symbol = symbol;

    return new;
}

struct big create_big() {
    struct big *new = malloc(sizeof(struct big));
    new->next = NULL;
    new->rigts = NULL;
    new->lefts = NULL;
    return new;
}

struct left create_left(char symbol) {
    struct left *new = malloc(sizeof(struct left));
    new->symbol = symbol;
    new->next = NULL;
    return new;
}

struct right create_right(char symbol) {
    struct right *new = malloc(sizeof(struct right));
    new->symbol = symbol;
    new->next = NULL;
}


// {    <  (  ( >))}
//for all characters in string if the first right bracket != last left bracket - bad
//''                         '' if the second right bracket 
