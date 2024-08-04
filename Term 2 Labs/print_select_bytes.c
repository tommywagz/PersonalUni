#include <stdlib.h>
#include <stdio.h>
#include <string.h>
#include <assert.h>


int main(int argc, char *argv[]) {
    if (argc < 3) {
        fprintf(stderr, "Not enough arguments\n");
        return EXIT_FAILURE;
    }

    FILE *newFile = fopen(argv[1], "r");

    if (newFile == NULL) {
        perror("Invalid file\n");
        return EXIT_FAILURE;
    }

    for (int i = 2; i < argc; i++) {
        long off = atol(argv[i]);
        if (fseek(newFile, off, SEEK_SET) != 0) {
            perror("Invalid fseek\n");
            return EXIT_FAILURE;
        };

        int dec = fgetc(newFile);

        if (dec == EOF) {
            perror("dec is EOF\n");
            break;
        }

        if (dec >= 32 && dec <= 126) {
            printf("%d - 0x%02X - '%c'\n", dec, dec, (char)dec);
        }
        else  {
            printf("%d - 0x%02X\n", dec, dec);
        }

    }

    fclose(newFile);
    return EXIT_SUCCESS;
}