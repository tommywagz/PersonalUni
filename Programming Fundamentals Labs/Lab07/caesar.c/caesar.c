//Thomas Wagner
//z5436162
//25/10/2022

#include <stdio.h>

char encrypt(char character, int shift);
char lower(char character, int temp);
char upper(char character, int temp);

int main(void) {
    int shift;
    char letter;

    scanf("%d ", &shift);
     
    while (scanf("%c", &letter) == 1) {
        printf("%c", encrypt(letter, shift));
    }
    
    return 0;
}

char encrypt(char character, int shift) {
    
    int temp = shift % 26;
    
    if ('a' <= character && character <= 'z') {   
        return lower(character, temp);
    }

    else if ('A' <= character && character <= 'Z') {
        return upper(character, temp);
    }
 
    else {
        return character;
    }   
}

char upper(char character, int temp) {
    character += temp;
    if (character > 'Z') {  
        character = (character - 'Z') + 'A' - 1;
    }

    else if (character < 'A') {
        character = (character - 'A') + 'Z' + 1;
    }
    return character;
    
}

char lower(char character, int temp) {
    if (temp >= 0) {
        for (int i = 0; i < temp; i ++) {
            character += 1;
            if (character == '{') {
                character = 'a';
            }
        }
    }

    else if (temp < 0) {
        for (int i = 0; i > temp; i--) {
            character -= 1;
            if (character == '`') {
                character = 'z';
            }
        }
    }
    return character;
}