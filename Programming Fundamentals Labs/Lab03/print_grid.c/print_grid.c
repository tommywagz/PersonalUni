//Thomas Wagner
//z5436162
//27/9/2022
//This was the activity with the grid printing

#include <stdio.h>

int main(void){
    int size;

    printf("Enter size: ");
    scanf("%d", &size);

    int i;
    int j;

    i = 0;
    while (i < size) {
        j = 0;
        while (j < size) {
            printf("(%d,%d) ", i, j);
            j++;
        }
        printf("\n");
        i++;
    }
    return 0;
}