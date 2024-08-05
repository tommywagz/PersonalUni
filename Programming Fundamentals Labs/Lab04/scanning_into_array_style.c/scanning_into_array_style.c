// Thomas Wagner
// z5436162
//
// this is the code where we scanned data into an array.
//

#include <stdio.h>

#define MAX_SIZE 100

// Given an integer array, iterate over the array and print the minimum and
// maximum values in the array.
void print_array_minmax(int length, int numbers[MAX_SIZE]);

int main(void) {
	
    int nums[MAX_SIZE] = {0};
    int len;
    printf("How many numbers: ");
    // TODO: Fill in code that takes the quantity of numbers from the user
    scanf("%d", &len);

    printf("Please enter numbers: ");
    // TODO: Fill in code that scans in integers from the user
    for (int i = 0; i < len; i++) {
        scanf("%d", &nums[i]);
    }
    
    print_array_minmax(len, nums);
    // TODO: Change this statement to match your variables and array.
    //      Refer to the documentation below for correct usage!

    return 0;
}

//////////////////////// DO NOT CHANGE THE CODE BELOW! ////////////////////////

// Given an integer array, iterate over the array and print the minimum and
// maximum values in the array.
//
// Takes in:
// - `length` -- The length of the array.
// - `numbers[MAX_SIZE]` -- The integer array to iterate over.
//
// Returns: nothing.
void print_array_minmax(int length, int numbers[MAX_SIZE]) {
    int index = 0;
    if (length > 0) {
        int minimum = numbers[index];
        int maximum = numbers[index];

        while (index < length) {
            if (numbers[index] < minimum) {
                minimum = numbers[index];
            } else if (numbers[index] > maximum) {
                maximum = numbers[index];
            }
            
            index++;
        }

        printf("Minimum: %d\nMaximum: %d\n", minimum, maximum);
    }
    
    return;
}