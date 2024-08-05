//Thomas Wagner
//z5436162

//17/10/2022

#include <stdio.h>


int main(void){ 
    char letter;
    while (scanf("%c", &letter) == 1) {
        if (letter != 'a' &&
            letter != 'e' &&
            letter != 'i' &&
            letter != 'o' &&
            letter != 'u') {
            printf("%c", letter); 
        }  
    }

    return 0;
}