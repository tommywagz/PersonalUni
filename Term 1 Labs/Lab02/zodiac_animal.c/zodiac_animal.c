//Thomas Wagner
//z5436162
//21/9/2022
//Zodiac Animal Code

#include <stdio.h>

#define MIN_YEAR 1900

enum zodiac_animal{
    RAT,
    OX,
    TIGER,
    RABBIT,
    DRAGON,
    SNAKE,
    HORSE,
    GOAT,
    MONKEY,
    ROOSTER,
    DOG,
    PIG
};

int main(void){
    
    int birth_year;
    int year;
    printf("Enter the year of your birth: ");
    scanf("%d", &birth_year);
    year = (birth_year-MIN_YEAR)%12;
    
    if(year == 0){
        printf("You were born in the year of the Rat!\n");
    }
    else if(year == 1){
        printf("You were born in the year of the Ox!\n");
    }
    else if(year == 2){
        printf("You were born in the year of the Tiger!\n");
    }
    else if(year == 3){
        printf("You were born in the year of the Rabbit!\n");
    }
    else if(year == 4){
        printf("You were born in the year of the Dragon!\n");
    }
    else if(year == 5){
        printf("You were born in the year of the Snake!\n");
    }
    else if(year == 6){
        printf("You were born in the year of the Horse!\n");
    }
    else if(year == 7){
        printf("You were born in the year of the Goat!\n");
    }
    else if(year == 8){
        printf("You were born in the year of the Monkey!\n");
    }
    else if(year == 9){
        printf("You were born in the year of the Rooster!\n");
    }
    else if(year == 10){
        printf("You were born in the year of the Dog!\n");
    }
    else{
        printf("You were born in the year of the Pig!\n");
    }
  
    return 0;
}