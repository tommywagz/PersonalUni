//Thomas Wagner
//z5436162
//4/10/2022

// Prints the first n digits of pi, where n is specified 
// by the user

#include <stdio.h>

#define MAX_DIGITS 10

void print_pi_style(int num_digits);

int main(void) {
    // DO NOT EDIT CODE HERE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    printf("How many digits of pi would you like to print? ");
    int digits;
    scanf("%d", &digits);
    print_pi_style(digits);

    return 0;
    // DO NOT EDIT CODE HERE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
}

void print_pi_style(int num_digits) {
    // DO NOT CHANGE THIS LINE
    int pi[MAX_DIGITS] = {3, 1, 4, 1, 5, 9, 2, 6, 5, 3};
    // TODO: Finish this function below
    for (int i = 0; i < num_digits; i++) {
        if (i == 0) {
            printf("%d.", pi[i]);
        }
        else {
            printf("%d", pi[i]);
        }
    }
    printf("\n");
}