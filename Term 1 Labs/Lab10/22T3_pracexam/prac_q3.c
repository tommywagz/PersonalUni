#include <stdio.h>
#include <stdlib.h>

#define MAX_LENGTH 10000


int main(void) {

    int num;
    int array[MAX_LENGTH];

    int length = 0;
    while (scanf("%d", &num) == 1 && num != 0) {
        
        array[length] = num;
        length++;
        
    }

    int evens[length];
    int j = 0;
    int odds[length];
    int k = 0;

    for (int i = 0; i < length; i++) {
        if (i % 2 == 0) {
            evens[j] = array[i];
            j++;
        }
        else if (i % 2 == 1) {
            odds[k] = array[i];
            k++;
        }
    }

    int final[MAX_LENGTH];

    for (int i = 0; i < length; i++) {
        if (i < j) {
            final[i] = evens[i];
        }
        
    }

    k = 0;
    for (int i = j; i < length; i++) {
        final[i] = odds[k];
        k++;
    }

    for (int i = 0; i < length; i++) {
        printf("%d ", final[i]);
    }
    printf("\n");

}

