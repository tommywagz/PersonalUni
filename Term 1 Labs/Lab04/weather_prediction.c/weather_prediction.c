
// Written by <Thomas Wagner> (<z5436162>) 
// on <4/10/2022>
//
// Interactive program to scan in and display the details of students in a
// class.

#include <stdio.h>

#define NUM_TEMPS 4
#define NUM_HUMIDITY 5

void print_intro(void);
void read_info(double temps[],  int counter, int num);
double get_averages(int num, int counter, double sum, double avg, double humidity[]);
void print_temp(double avg);
void print_humidity(double avg);

int main(void) {

    // Intro
    print_intro();
    // Read Temperatures
    printf("Please enter the past %d day(s) worth of temperatures.\n", NUM_TEMPS);
    int counter = 0;
    double temp[NUM_TEMPS] = {0.0};
    double humidity[NUM_HUMIDITY] = {0.0};
    read_info(temp, counter, NUM_TEMPS);
    // Read Humidities
    printf("Please enter the last %d days(s) worth of humidities\n", NUM_HUMIDITY);
    read_info(humidity,  counter, NUM_HUMIDITY);

    double sum = 0.0;
    double avg = 0.0;

    // Get average Temperature
    get_averages(NUM_TEMPS, counter, sum, avg, temp);
    // Get average humidity
    get_averages(NUM_HUMIDITY, counter, sum, avg, humidity);
    
    // Give info about average temp
    print_temp(get_averages(NUM_TEMPS, counter, sum, avg, temp));
    // Give info about average humidity
    print_humidity(get_averages(NUM_HUMIDITY, counter, sum, avg, humidity));
    
    return 0;
}

void print_intro(void) {
    printf("Hello and welcome to CS Weather!\n");
    printf("=======================================\n");
    printf("This program will help you to analyse a given weather patten\n");
    printf("and make some predictions about the coming day\n");

}

void read_info(double temps[],  int counter, int num) {
    counter = 0;
    while (counter < num) {
        scanf("%lf", &temps[counter]);
        counter++;
    }
}

double get_averages(int num, int counter, double sum, double avg, double humidity[]) {
    counter = 0;
    sum = 0.0;
    while (counter < num)
    {
        sum += humidity[counter];
        counter++;
    }
    avg = sum / num;
    return avg;
};

void print_temp(double avg_temp) {
    printf("The average temperature was: %lf\n", avg_temp);
    if (avg_temp >= 28.0) {
        printf("It will be hot tomorrow!");
    } else if (avg_temp >= 15.0 && avg_temp < 28.0 ) {
        printf("Should be a lovely temperature tomorrow.\n");
    } else {
        printf("It'll be chilly tomorrow, pack a jumper!\n");
    }
};

void print_humidity(double avg_humidity) {
    printf("The average humidity was: %lf\n", avg_humidity);
    if (avg_humidity > 80.0) {
        printf("It will be humid tomorrow.\n");
    } else {
        printf("Shouldn't be too humid tomorrow.\n");
    }    
};