//Thomas Wagner
//z5436162
//27/9/2022
//Code the dice roll activity

#include <stdio.h>

int main(void){
    int sides;
    int count;

    printf("Enter the number of sides on your dice: ");
    scanf("%d", &sides);
    printf("Enter the number of dice being rolled: ");
    scanf("%d", &count);

    if (sides <= 0 || count <= 0) {
        printf("These dice will not produce a range.\n");
        return 1;
    }

    double max = sides * count;
    double avg = (count + max) / 2;

    printf("Your dice range is %d to %.0lf.\n", count, max);
    printf("The average value is %lf\n", avg);

    return 0;
}