//Assignment 0 -- CS Matches
//cs_matches.c
//
//This program was written by Thomas Wagner
//on 15/9/2022
//zID: z5436162
//
//This excercise will emulate the old matches game 'Nim'

#include <stdio.h>
#define MATCH_SYMBOL '!'

int main(void){
    char FirstPlayer;
	
    printf("\\/\\/\\/ COMP1511 - CS Matches \\/\\/\\/ \n\n");
    printf("In this game, 2 players will take turns removing matches.\n");
    printf("Each player can remove 1, 2 or 3 matches in any turn.\n\n");
    printf("Would you like Player 1 to go first? (y/n)\n");
    scanf(" %c", &FirstPlayer);
    printf("You Entered: '%c'\n\n", FirstPlayer);

    int init_player;
    int sec_player;
    int move;
    int turn = 1; 
    int matches = 7;

    if (FirstPlayer == 'y') {
        printf("Player 1 will go first!\n\n");
        init_player = 1;
        sec_player = 2;
    }

    else if (FirstPlayer == 'n') {
        printf("Player 2 will go first!\n\n");
        init_player = 2;
        sec_player = 1;
    }

    else {
        printf("You did not enter 'y' of 'n', program now exiting...\n");
        return 1;
    }

    printf("The game begins!\nThere are 7 remaining matches!\n");

    for(int i  = 0; i < 7; i++){
        printf("%c  ", MATCH_SYMBOL);
    }

    printf(" \n\n");
    
    while (matches > 0) {	
        
        if (turn % 2 == 1) {
            printf("Player %d move: ", init_player);
            scanf("%d", &move);
			
            if (move <= matches && (move <= 3 && move > 0)) {
                printf("Player %d removed %d matches!\n", init_player, move);
                matches = matches-move;
                printf("There are %d remaining matches!\n", matches);

				for (int j = 0; j < matches; j++) {
					printf("%c  ", MATCH_SYMBOL);
				}

                printf("\n\n");
                turn ++;

                if (matches > 0) {
                    printf("It is now Player %d's turn!\n", sec_player);
                }
            }

			else if (move > matches && move <=3 ) {
				printf("Player %d cannot remove %d matches from the remaining %d\n\n", init_player, move, matches);
                printf("It is now Player %d's turn!\n", init_player);
            }
				
            else {
                printf("Player %d is not allowed to remove %d matches!\n\n", init_player, move); 
                printf("It is now Player %d's turn!\n", init_player);   
            }
        }
			
        else {
            printf("Player %d move: ", sec_player);
            scanf("%d", &move);

            if (move <= matches && (move <= 3 && move > 0)) { 
                printf("Player %d removed %d matches!\n", sec_player, move);
                matches = matches-move;
                printf("There are %d remaining matches!\n", matches);

				for (int j = 0; j < matches; j++) {
					printf("%c  ", MATCH_SYMBOL);
				}

                printf("\n\n");
                turn ++;

                if (matches > 0) {
                    printf("It is now Player %d's turn!\n", init_player);
                }
            }

			else if (move > matches && move <= 3) {
				printf("Player %d cannot remove %d matches from the remaining %d\n\n", sec_player, move, matches);
                printf("It is now Player %d's turn!\n", sec_player);   
			}

            else {
                printf("Player %d is not allowed to remove %d matches!\n\n", sec_player, move);
                printf("It is now Player %d's turn!\n", sec_player);   
            }
        }         
    }

    if (init_player == 1 && turn%2 == 0) { 
        printf("Player 2 won the game!\n");
    }

    else if (init_player == 2 && turn%2 == 0) {
        printf("Player 1 won the game!\n");
    }

    else if (sec_player == 1 && turn%2 == 1) {
        printf("Player 2 won the game!\n");
    }

    else if (sec_player == 2 && turn%2 == 1) {
        printf("Player 1 won the game!\n"); 
    }

    return 0;
}