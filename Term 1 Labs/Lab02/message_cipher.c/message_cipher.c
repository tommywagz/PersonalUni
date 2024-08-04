//Thomas Wagner
//z5436162
//22/9/22
//Cipher Code

#include <stdio.h>

struct message{
    char letter1;
    char letter2;
    char letter3;
    char letter4;
};

struct numbers{
    int number1;
    int number2;
    int number3;
    int number4;
};

void decipher(void){
    struct message msg;
    struct numbers num;
    
    printf("Enter numbers to decipher by: ");
    scanf("%d %d %d %d", &num.number1, &num.number2, &num.number3, &num.number4);

    if(91 > msg.letter1 - num.number1 > 64 || 123 > msg.letter1 - num.number1 > 96){
        printf("%c%c%c%c\n", msg.letter1-num.number1, msg.letter2-num.number2, 
        msg.letter3-num.number3, msg.letter4-num.number4);
    }
    else{
        int value1 = msg.letter1 - num.number1;
        int value2 = msg.letter2 - num.number2;
        int value3 = msg.letter3 - num.number3;
        int value4 = msg.letter4 - num.number4;

        value1 = value1%26;
    }

    printf("%c%c%c%c\n", msg.letter1-num.number1, msg.letter2-num.number2, 
    msg.letter3-num.number3, msg.letter4-num.number4);

}

void encipher(void){
    struct message msg;
    struct numbers num;
    
    printf("Enter numbers to encipher by: ");
    scanf("%d %d %d %d", &num.number1, &num.number2, &num.number3, &num.number4);
    
    printf("%c%c%c%c", msg.letter1+num.number1, msg.letter2+num.number2, 
    msg.letter3+num.number3, msg.letter4+num.number4);

}

void determine_ciphering(struct message msg){
    char cipher;
    int num1;
    int num2;
    int num3;
    int num4;

    printf("Would you like to encipher or decipher this message (e/d)? ");
    scanf(" %c", &cipher);
    
    if (cipher == 'e'){
       encipher();
    }
    else if (cipher == 'd'){
        decipher();
    }
}

int main(void){
    struct message msg;

    printf("Message: ");
    scanf("%c %c %c %c", &msg.letter1, &msg.letter2, &msg.letter3, &msg.letter4);

    determine_ciphering(msg);
    return 0;
}