//Thomas Wagner
//z5436162
//17/10/2022

#include <stdio.h>
#include <assert.h>

#define BOARD_LENGTH 8
#define PIECE_RED 'R'
#define PIECE_BLACK 'B'
#define PIECE_EMPTY ' '
#define TYPE_KING 1
#define TYPE_NORMAL 0
struct board_square {
    int type;
    char piece_color;
};

// Prints out a checkerboard using the provided 2D array as reference.
void print_checkerboard(struct board_square board[BOARD_LENGTH][BOARD_LENGTH]);

int main(void) {
    // TODO: Declare a 2D struct board_square array representing your
    //       checkerboard, using the given struct board_square defined above as
    //       the array element type.
    //       Your checkerboard array size should be 8x8; BOARD_LENGTH has been
    //       defined above for you to accomplish this. Your checkerboard should
    //       not be an 2D int array.
    struct board_square game[BOARD_LENGTH][BOARD_LENGTH];


    // TODO: Initialize each member variable of each struct board_square in
    //       your checkerboard 2D array with:
    //          1. piece_color: A value of PIECE_EMPTY (i.e. it is empty)
    //          2. type:        A value of TYPE_NORMAL (i.e. no piece starts as king!)
    // HINT: How do you change elements of a 2D array? What about structs?
    for (int i = 0; i < BOARD_LENGTH; i ++) {
        for (int j = 0; j < BOARD_LENGTH; j++) {
            game[i][j].piece_color = PIECE_EMPTY;
            game[i][j].type = TYPE_NORMAL;
        }
    }

    // TODO: Scan in instructions from the user for filling the checkerboard
    //       until Ctrl+D is entered
    // HINT: How do you continuously scan for user input?
    int row;
    int col;
    char color;
    int king;
    printf("Please enter pieces:\n");
    while (scanf("%d %d %c %d", &row, &col, &color, &king) == 4) {
        if (color == PIECE_RED) {
            game[row][col].piece_color = PIECE_RED;
        }
        else if (color == PIECE_BLACK) {
            game[row][col].piece_color = PIECE_BLACK;
        }
        if (king == TYPE_KING) {
            game[row][col].type = TYPE_KING;
        }
    }

    // TODO: Pass your checkerboard 2D array to this function call!
    //       Refer to how the function is implemented below for more information
    //       on how the checkerboard is printed.
    // HINT: You need to change REPLACE_ME to your checkerboard 2D array. How do
    //       you pass whole arrays as function arguments?
    print_checkerboard(game);

    return 0;
}

///////////////////////////////////////////////////////////////////////////////
//////////////////// DO NOT EDIT THE CODE BELOW THIS LINE! ////////////////////
///////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
// print_checkerboard(): Prints out a checkerboard using the provided 2D array
//                       as reference.
//
// Takes in:
// - `board[BOARD_LENGTH][BOARD_LENGTH]` -- The 2D array containing a
//                                          representation of the checkerboard
//
// Returns: nothing.
void print_checkerboard(struct board_square board[BOARD_LENGTH][BOARD_LENGTH]) {
    int row_index = 0;
    while (row_index < BOARD_LENGTH) {

        // NOTE: Print row dividers of checkerboard
        printf("+-----+-----+-----+-----+-----+-----+-----+-----+\n");
        printf("|");
        
        int column_index = 0;
        while (column_index < BOARD_LENGTH) {
            
            // NOTE: Check that all struct values contain valid input.
            assert(
                board[row_index][column_index].piece_color == PIECE_RED ||
                board[row_index][column_index].piece_color == PIECE_BLACK ||
                board[row_index][column_index].piece_color == PIECE_EMPTY
            );
   
            assert(
                board[row_index][column_index].type == TYPE_KING || 
                board[row_index][column_index].type == TYPE_NORMAL
            );
            
            // NOTE: Print column dividers of checkerboard
            if (board[row_index][column_index].type == TYPE_KING) {
                printf(" %c-K |", board[row_index][column_index].piece_color);
            } else {
                printf("  %c  |", board[row_index][column_index].piece_color);

            }
            
            column_index++;
        }
        
        printf("\n");
        row_index++;
    }
    // NOTE: Print final row divider of checkerboard
    printf("+-----+-----+-----+-----+-----+-----+-----+-----+\n");

    return;
}