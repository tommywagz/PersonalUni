#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define LENGTH 26
#define MAX_STRING_LENGTH 256
#define START = 'A'
#define start = 'a'


int main(void) {

    int num = 0;
    char alph[LENGTH];
    char alph2[LENGTH];

    char first[MAX_STRING_LENGTH];
    fgets(first, MAX_STRING_LENGTH, stdin);
    char second[MAX_STRING_LENGTH];
    fgets(second, MAX_STRING_LENGTH, stdin);

    for (int i = 0; i < LENGTH; i++) {
        alph[i] = 'A' + i;
    } 

    for (int i = 0; i < LENGTH; i++) {
        alph2[i] = 'a' + i;
    }

    for (int i = 0; i < LENGTH; i++) {
        int one = 0;
        int two = 0;

        for (int j = 0; j < strlen(first); j++) {  
            if (alph[i] == first[j] || alph2[i] == first[j]) {
                one = 1;
            }
        }

        for (int k = 0; k < strlen(second); k++) {
            if (alph[i] == second[k] || alph2[i] == second[k]) {
                two = 1;
            }
        }
        
        if (one == 1 && two == 1) {
            num++;
        }
    }


    printf("%d\n", num);
}


