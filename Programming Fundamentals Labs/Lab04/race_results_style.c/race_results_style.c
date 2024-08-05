// Thomas Wagner
// z5436162
//
// Scanning ther results of formula one races into an array of structs
//

#include <stdio.h>


#define MAX_CARS 20

struct race_result {
    // TODO: fill this in with the details of the result of a single car in the
    // race.
    //
    // i.e. This struct should contain:
    //      the car number (int), 
    //      and the race time (double).
    double time;
    int number;

};


// Prints the race result in the correct format.
void print_results(int car_number, double race_time);

int main(void) {

    
    int race_num;
    struct race_result cars[MAX_CARS];
    printf("How many cars in the race? ");
   
    scanf("%d", &race_num);
    printf("Enter results:\n");
    // TODO: scan in the details of each car into the array
    for (int i = 0; i < race_num; i++) {
        scanf("%d %lf", &cars[i].number, &cars[i].time);
    }

    printf("Results:\n");
    int i = 0;
    while (i < race_num) {

        print_results(cars[i].number, cars[i].time);
        i++;
    }
    
    return 0;
}


//  Prints the race result in the correct format.
//
// Parameters:
// - `car_number` -- The car number of the result
// - `race_time` -- The time the car took to finish the race.
//
// Returns: nothing.
void print_results(int car_number, double race_time) {
    
    printf("%2d: %.2lf\n", car_number, race_time);
}