#include <stdio.h>
#include <stdlib.h>
#include <string.h>

void append_to_diary(const char *entry);

int main(int argc, char *argv[]) {
    if (argc < 2) {
        return EXIT_FAILURE; 
    }

    for (int i = 1; i < argc; ++i) {
        append_to_diary(argv[i]);
    }        

    // Print the content of the .diary file after each operation
    FILE *diary_file = fopen(".diary", "r");
    if (diary_file != NULL) {
        char line[256];
        while (fgets(line, sizeof(line), diary_file) != NULL) {
            printf("%s", line);
        }
        fclose(diary_file);
    }

    return EXIT_SUCCESS;
}

void append_to_diary(const char *entry) {
    char *home_dir = getenv("HOME");
    if (home_dir == NULL) {
        perror("Home environment variable not set\n");
        return; 
    }

    // Construct the path to the .diary file
    char diary_path[256];
    snprintf(diary_path, sizeof(diary_path), "%s/.diary", home_dir);

    // Open the .diary file in append mode
    FILE *diary_file = fopen(diary_path, "a");
    if (diary_file == NULL) {
        perror("Unable to open file\n");
        return;
    }

    fprintf(diary_file, "%s\n", entry);

    fclose(diary_file);

    diary_file = fopen(".diary", "r");
    if (diary_file != NULL) {
        char line[256];
        while (fgets(line, sizeof(line), diary_file) != NULL) {
            printf("%s", line);
        }
        fclose(diary_file);
    }
}
