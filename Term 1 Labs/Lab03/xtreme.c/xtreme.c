//Thomas Wagner
//z5436162
//27/9/2022
//This was the 'X' shaped omnitrix design project

#include <stdio.h>

int main(void){
    int n;
    printf("Enter size: ");
    scanf("%d", &n);

    int i = 0;
    int j;
    while (i<n) {
        j = 0;
        while (j<n) {
            if (j == i ) {
                printf("*");
            }
            else if (j == i + 4 && (i >= n / 2 || j <= n / 2)){//|| j == i - 4) {
                printf("*");
            }
            else if (j == i - 4 && (i <= n / 2 || j >= n / 2)) {
                printf("*");
            }
            else if (i + j == n - 1 ) {
                printf("*");
            }
            //else if (i + j + 4 == n - 1 && (i >= n / 2 || j <= n / 2)) {
              //  printf("*");
            //}
            //else if (i + j - 4 == n - 1 && (i <= n / 2 || j <= n / 2)) {
              //  printf("*");
            //}
            //else if (i + j + 4 == n-1 || i + j - 4 == n-1) {
               // printf("*");
            //}
            else {
                printf("-");
            }
            j++;
        }
        printf(" \n");
        i++;
    }
    return 0;
}