//Thomas Wagner
//z5436162
//21/9/2022
//Addition Code

#include <stdio.h>

int main(void){
    int tutors;
    int students;
    int sum;
    printf("Please enter the number of students and tutors: ");
    scanf("%d %d", &students, &tutors);
    sum = tutors + students;
    printf("%d + %d = %d\n", students, tutors, sum);

}