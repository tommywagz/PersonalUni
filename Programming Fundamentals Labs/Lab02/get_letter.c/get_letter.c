//Thomas Wagner
//z5436162
//22/9/2022
//Get letter code

#include <stdio.h>

#define NUM_ALPHABET 32

int main(void){

    char is_uppercase;
    printf("Uppercase: ");
    scanf("%c", &is_uppercase);

    int index;
    printf("Index: ");
    scanf("%d", &index);

    char character;
    if(is_uppercase == 'y'){
        character = 'A' + index;
        printf("The letter is %c\n", character);
    }
    else{
        character = 'A' + index + NUM_ALPHABET;
        printf("The letter is %c\n", character);
    }
    return 0;
}