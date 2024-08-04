// CSE Frogger (cs_frogger.c)
//
// This program was written by [Thomas Wagner] (z5436162)
// Completed on [24/10/2022]
//
// This program is mean to emulate the game Frogger from 1981.
// The user can place turtles, logs, and bugs on the board at will.
// They can then move their frog and try to make their way to the lilypads.
// However, if they are hit by a bug or jump into the water the player will
// lose a life. If three lives are lost, the game is over.

#include <stdio.h> 

////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////  CONSTANTS  /////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

#define SIZE        9
#define TRUE        1
#define FALSE       0
#define ROW_START   8
#define COL_START   4
#define BANK_NUM    8
#define SHORE_NUM   0
#define START_LIFE  3
#define WRONG      -1

enum tile_type {LILLYPAD, BANK, WATER, TURTLE, LOG, BUG};

////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////  STRUCTS  //////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

struct board_tile {
    enum tile_type type; 
    int occupied;
    int bug;
    int bug_dir;        
};


////////////////////////////////////////////////////////////////////////////////
/////////////////////////////  FUNCTION PROTOTYPES  ////////////////////////////
////////////////////////////////////////////////////////////////////////////////

void initialize_board(struct board_tile board[SIZE][SIZE]);
void place_turtles(struct board_tile board[SIZE][SIZE], int turtle_count);
void command(struct board_tile board[SIZE][SIZE]);
void logs(struct board_tile board[SIZE][SIZE]);
void clear(struct board_tile board[SIZE][SIZE]);
void delete(struct board_tile board[SIZE][SIZE]);
void move(struct board_tile board[SIZE][SIZE], char dir);
void death(struct board_tile board[SIZE][SIZE], int lives, int i, int j);
void bugs(struct board_tile board[SIZE][SIZE]);
void bug_move(struct board_tile board[SIZE][SIZE]);
void print_board(struct board_tile board[SIZE][SIZE]);

////////////////////////////////////////////////////////////////////////////////
//////////////////////////  FUNCTION IMPLEMENTATIONS  //////////////////////////
////////////////////////////////////////////////////////////////////////////////

int main(void) {

    printf("Welcome to CSE Frogger!\n");
    struct board_tile game_board[SIZE][SIZE];

    initialize_board(game_board);
    game_board[ROW_START][COL_START].occupied = TRUE;

    int turtles;
    printf("How many turtles? ");
    scanf("%d", &turtles);
    place_turtles(game_board, turtles); 

    printf("Game Started\n");
    print_board(game_board);

    int lives = 3;
    while (lives > 0) {

        char com;
        printf("Enter command: ");
        int scan_return = scanf(" %c", &com);
        if (scan_return != 1) {
            lives = -1;
        }

        else {
            if (com == 'l') {
                logs(game_board);
            }

            else if (com == 'c') {
                clear(game_board);
            }

            else if (com == 'r') {
                delete(game_board);
            }

            else if (com == 'w' || com == 'a' || 
            com == 's' || com == 'd') {
                move(game_board, com);
            }

            else if (com == 'b') {    
                bugs(game_board);
            }
        }
       
        int won = 0;
        for (int j = 0; j < SIZE; j++) {
            if (j % 2 == 0 && game_board[0][j].occupied == TRUE) {
                //print_board(game_board);
                printf("\nWahoo!! You Won!\n\n");
                won ++;
            }
        }

        if (won == 1) {
            lives = 0;
        }
       
        for (int i = 0; i < SIZE; i++) {
            for (int j = 0; j < SIZE; j++) {
                if (game_board[i][j].occupied == TRUE && 
                (game_board[i][j].type == WATER || 
                game_board[i][j].bug == TRUE) && lives > 0) {
                    
                    lives --;
                    death(game_board, lives, i, j);
                }
            }
        }
    }

    printf("Thank you for playing CSE Frogger!\n");
    return 0;
}

////////////////////////////////////////////////////////////////////////////////
///////////////////////////// ADDITIONAL FUNCTIONS /////////////////////////////
////////////////////////////////////////////////////////////////////////////////


void initialize_board(struct board_tile board[SIZE][SIZE]) {
    int i = 0;
    while (i < SIZE) {
        int j = 0;
        while (j < SIZE) {
            if (i == 0 && j % 2 == 0) {
                board[i][j].type = LILLYPAD;
                board[i][j].occupied = FALSE;
                board[i][j].bug = FALSE;
                board[i][j].bug_dir = FALSE;
            }
            else if (i == ROW_START) {
                board[i][j].type = BANK;
                board[i][j].occupied = FALSE;
                board[i][j].bug = FALSE;
                board[i][j].bug_dir = FALSE;

            }
            else {
                board[i][j].type = WATER;
                board[i][j].occupied = FALSE;
                board[i][j].bug = FALSE;
                board[i][j].bug_dir = FALSE;

            }
            j++;
        }
        i++;
    }
}

void death(struct board_tile board[SIZE][SIZE], int lives, int i, int j) {
    if (lives > 0) {
        printf("\n# LIVES LEFT: %d #\n\n", lives);
        
        board[i][j].occupied = FALSE;
        board[ROW_START][COL_START].occupied = TRUE;
        print_board(board);
    }

    if (lives == 0) {
        printf("\n !! GAME OVER !!\n\n");
    }    
}

void place_turtles(struct board_tile board[SIZE][SIZE], int turtle_count) {
    int i = 0;
    int row;
    int col;

    if (turtle_count <= 0) {
        return;
    }

    printf("Enter pairs: \n");

    while (i < turtle_count) {
        scanf("%d %d", &row, &col);
        if ((row > 0)&&(row < BANK_NUM)) {
            board[row][col].type = TURTLE;
            board[row][col].occupied = FALSE;
        }
        i++;
    }   
}

void logs(struct board_tile board[SIZE][SIZE]) {
    int row;
    int start;
    int end;
    scanf("%d %d %d", &row, &start, &end);

    if (start < SIZE && end > SIZE-1) {
        end = SIZE-1;
    }

    if (0 < row && row < SIZE - 1 && start <= SIZE) {
        
        int no_log = 0;
        for (int j = 0; j < SIZE; j ++) {
            if (board[row][j].type == TURTLE) {
                no_log++;
            }
        }
        if (no_log == 0 && start < SIZE) {
            int i = start;
            while (i <= end) {
                board[row][i].type = LOG;
                i++;
            }
        }
    }  

    print_board(board);
}

void clear(struct board_tile board[SIZE][SIZE]) {
    int row;
    scanf("%d", &row);

    if (row > 0 &&  row < SIZE-1) {
        int frog = 0;
        for (int i = 0; i < SIZE; i++) { 
            if (board[row][i].occupied) {
                frog++;
            }
        }
        for (int i = 0; i < SIZE; i++ ) {
            if (frog == 0) {
                board[row][i].type = WATER;
                board[row][i].bug = FALSE;
            }
        }
    }
    print_board(board);
}

void delete(struct board_tile board[SIZE][SIZE]) {
    int row;
    int col;
    scanf("%d %d", &row, &col);

    if (0 > row || row > SIZE - 1 ||
    0 > col || col >= SIZE - 1) {
        print_board(board);
        return;
    }

    int frog = 0;
    for (int i = col; i < SIZE; i++) {
        if (board[row][i].type ==  WATER) {
            i = SIZE;
        }

        else if (board[row][i].occupied) {
            frog++;
        }
    }

    for (int i = col; i > 0; i--) {
        if (board[row][i].type ==  WATER) {
            i = 0;
        }
        else if (board[row][i].occupied) {
            frog++;
        }
    }

    if (board[row][col].type == LOG && frog == 0) {
        for (int i = col; i < SIZE; i++) {
            if (board[row][i].type == LOG) {
                board[row][i].type = WATER;
                board[row][i].bug = FALSE;
            }
            
            else {
                i += SIZE;
            }
            
        }
        
        for (int j = col-1; j >= 0; j--) {
            if (board[row][j].type == LOG) {
                board[row][j].type = WATER;
                board[row][j].bug = FALSE;
            }
            
            else {
                j = 0;
            }    
        }
    }    
    print_board(board);
}

void bugs(struct board_tile board[SIZE][SIZE]) {
    int row;
    int col;
    scanf("%d %d", &row, &col);
    
    if (0 <= col && col < SIZE && 
    0 < row && row < SIZE ) {
        if ((board[row][col].type == LOG || board[row][col].type == TURTLE) && 
        board[row][col].occupied == FALSE ) {

            board[row][col].bug = TRUE;
            board[row][col].bug_dir = TRUE;
        }
    }
    print_board(board);
}

void move(struct board_tile board[SIZE][SIZE], char dir) {
    int row = 0;
    int col = 0;
    for (int i = 0; i < SIZE; i++) {
        for (int j = 0; j < SIZE; j++) {
            if (dir == 'w' && i > 0 && board[i][j].occupied) {
                board[i][j].occupied = FALSE;  
                board[i - 1][j].occupied = TRUE;
            }

            else if (dir == 'a' && j > 0 && board[i][j].occupied) {
                board[i][j].occupied = FALSE;
                board[i][j - 1].occupied = TRUE;
            }

            else if (dir == 's' && i < SIZE-1 && board[i][j].occupied) {
                row = i;
                col = j;
            }

            else if (dir == 'd' && j < SIZE-1 && board[i][j].occupied) {
                row = i;
                col = j;
            }
        }
    }

    if (dir == 's' && 0 < row) {
        board[row][col].occupied = FALSE;
        board[row + 1][col].occupied = TRUE;
    }

    else if (dir == 'd' && col > 0) {
        board[row][col].occupied = FALSE;
        board[row][col + 1].occupied = TRUE;
    }

    bug_move(board);
    print_board(board);
}

void bug_move(struct board_tile board[SIZE][SIZE]) {
    for (int i = 0; i < SIZE; i++) { 
        int next;
        int previous;
        for (int j = 1; j < SIZE - 1; j++) { 

            next = j + 1;
            previous = j - 1;
            
            if (j == SIZE - 1 && board[i][j].bug &&
            board[i][j].bug_dir == TRUE &&
            board[i][previous].bug == FALSE) {

                board[i][j].bug = FALSE;
                board[i][j].bug_dir = FALSE;

                board[i][previous].bug = TRUE;
                board[i][previous].bug_dir = WRONG;
            }

            else if (j == 0 && board[i][j].bug &&
            board[i][j].bug_dir == WRONG &&
            board[i][next].bug == FALSE) {

                board[i][j].bug = FALSE;
                board[i][j].bug_dir = FALSE;
                j = next;
                board[i][next].bug = TRUE;
                board[i][next].bug_dir = TRUE;
            }
            
            else if (next < SIZE && board[i][j].bug &&  
            board[i][j].bug_dir == TRUE &&
            board[i][next].bug == FALSE &&
            board[i][next].type != WATER) {

                board[i][j].bug = FALSE;
                board[i][j].bug_dir = FALSE;
                j = next;
                board[i][next].bug = TRUE;
                board[i][next].bug_dir = TRUE;
            }

            else if (next < SIZE && board[i][j].bug &&
            board[i][previous].type != WATER &&
            board[i][previous].bug == FALSE &&
            (board[i][next].type == WATER ||
            board[i][next].bug)) {
                
                board[i][j].bug = FALSE;
                board[i][j].bug_dir = FALSE;

                board[i][previous].bug = TRUE;
                board[i][previous].bug_dir = WRONG;
            }

            else if (j > 0 && board[i][j].bug &&
            board[i][j].bug_dir == WRONG &&
            board[i][previous].bug == FALSE &&
            board[i][previous].type != WATER) {

                board[i][j].bug = FALSE;
                board[i][j].bug_dir = FALSE;

                board[i][previous].bug = TRUE;
                board[i][previous].bug_dir = WRONG;
            }

            else if (previous >= 0 && board[i][j].bug &&
            board[i][next].type != WATER &&
            board[i][next].bug == FALSE &&
            (board[i][previous].type == WATER ||
            board[i][previous].bug)) {

                board[i][j].bug = FALSE;
                board[i][j].bug_dir = FALSE;
                j = next;
                board[i][next].bug = TRUE;
                board[i][next].bug_dir = TRUE;
            }    
        }
    }      
}

////////////////////////////////////////////////////////////////////////////////
////////////////////////////// PROVIDED FUNCTIONS //////////////////////////////
////////////////////////////////////////////////////////////////////////////////

void print_board(struct board_tile board[SIZE][SIZE]) {
    for (int row = 0; row < SIZE; row++) {
        for (int col = 0; col < SIZE; col++) {
            char type_char;
            if (board[row][col].occupied == TRUE) {
                type_char = 'F';
            } else if (board[row][col].bug == TRUE) {
                type_char = 'B';
            } else {
                enum tile_type type = board[row][col].type;
                if (type == LILLYPAD) {
                    type_char = 'o';
                } else if (type == BANK) {
                    type_char = 'x';
                } else if (type == WATER) {
                    type_char = '~';
                } else if (type == TURTLE) {
                    type_char = 'T';
                } else if (type == LOG) {
                    type_char = 'L';
                } 
            }
            printf("%c ", type_char);
        }
        printf("\n");
    }
}
