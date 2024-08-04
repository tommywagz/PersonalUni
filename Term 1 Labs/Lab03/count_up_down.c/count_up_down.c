// Thomas Wagner
// z5436162
// 27/9/2022
// Counting up and down code

#include <stdio.h>

int main(void){
    int num;
    printf("Enter number: ");
    scanf("%d", &num);
    if (num >= 0) {
        for (int i = 0; i <= num; i++) {
            printf("%d\n", i);
        }
    }
    else if (num < 0) { 
        for (int i = 0; i >= num; i--) {
            printf("%d\n", i);
        }
    }
}