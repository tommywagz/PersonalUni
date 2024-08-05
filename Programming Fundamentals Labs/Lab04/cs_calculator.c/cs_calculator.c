//Thomas Wagner
//z5436162

//5/10/2022

#include <stdio.h>
#include <math.h>

void power(int number1, int number2);
void square(int nums1);

int main (void) {
    char inst;
    int num1;
    int num2;
    printf("Enter instruction: ");
    while(scanf(" %c", &inst) == 1){

        if (inst == 's') {
            scanf("%d", &num1);
            square(num1);
             
        }
        else if (inst == 'p') {
            scanf("%d %d", &num1, &num2);
            power(num1, num2);
             
        }
        printf("Enter instruction: ");
    }
    
};

void power(int number1, int number2) {
    int powr = 0;
    powr = pow(number1, number2);
    printf("%d\n", powr);
};

void square(int nums1) {
    int squa = 0;
    squa = pow(nums1, 2);
    printf("%d\n", squa);
};