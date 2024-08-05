//Thomas Wagner
//5436162

//z5436162

#include <stdio.h>
#include <string.h>
#define MAX_SIZE 30

int main(void) {
    char input[MAX_SIZE] = {0};
    printf("Input word: ");
    fgets(input, MAX_SIZE, stdin);
    printf("\nWord square is:\n");
    for (int i = 1; i < strlen(input); i++) {
        printf("%s", input);
    }
    return 0;
}