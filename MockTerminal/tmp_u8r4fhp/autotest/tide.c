////////////////////////////////////////////////////////////////////////////////
// COMP1521 23T3 --- Assignment 2: `tide', a terribly insecure (file) decryptor
// <https://www.cse.unsw.edu.au/~cs1521/23T3/assignments/ass2/index.html>
//
// 2023-10-25   v1.0    Team COMP1521 <cs1521 at cse.unsw.edu.au>
// 
// This program was written by YOUR-NAME-HERE (YOUR-ZID-HERE) on DD/MM/2023.
// (COMPLETE THE ABOVE COMMENT AND REMOVE THIS LINE FOR FREE STYLE MARKS!)

#include <stdio.h>
#include <stdbool.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <dirent.h>
#include <sys/stat.h>
#include <sys/types.h>
#include "tide.h"

// Add any extra #defines here.
#define PERMISSION_LEN 11

// Add any extra function signatures here.

// Some provided strings which you may find useful. Do not modify.
const char *const MSG_ERROR_FILE_STAT  = "Could not stat file.\n";
const char *const MSG_ERROR_FILE_OPEN  = "Could not open file.\n";
const char *const MSG_ERROR_CHANGE_DIR = "Could not change directory.\n";
const char *const MSG_ERROR_DIRECTORY  =
    "tide does not support encrypting directories.\n";
const char *const MSG_ERROR_READ       =
    "group does not have permission to read this file.\n";
const char *const MSG_ERROR_WRITE      =
    "group does not have permission to write here.\n";
const char *const MSG_ERROR_RESERVED   =
    "'.' and '..' are reserved filenames, please search for something else.\n";

/////////////////////////////////// SUBSET 0 ///////////////////////////////////

// Print the name of the current directory.
void print_current_directory(void) {
    char buffer[MAX_PATH_LEN];
    if (getcwd(buffer, sizeof(buffer)) == NULL) {
        perror(MSG_ERROR_DIRECTORY);
        return;
    }

    printf("The current directory is: %s\n", buffer);
}

// Change the current directory to the given pathname.
void change_current_directory(char *directory) {
    if (strcmp("~", directory) == 0) {
        chdir(getenv("HOME"));
        printf("Moving to %s\n", getenv("HOME"));
    }

    else if (chdir(directory) == 0) {
        printf("Moving to %s\n", directory);
    } else  {
        fprintf(stdout, MSG_ERROR_CHANGE_DIR);
    }
}

// List the contents of the current directory.
void list_current_directory(void) {
    DIR *dir;
    struct dirent *curr;
    struct stat st;

    if ((dir = opendir(".")) == NULL) {
        perror(MSG_ERROR_DIRECTORY);
        return;
    }

    char *fileNames[MAX_LISTINGS];
    int count = 0;
    while ((curr = readdir(dir) )!= NULL && count < MAX_LISTINGS) {
        fileNames[count] = strdup(curr->d_name);
        count++;
    }

    sort_strings(fileNames, count);

    for (int i = 0; i < count; i++) {
        if (stat(fileNames[i], &st) == -1) {
            perror(MSG_ERROR_FILE_STAT);
            continue;
        }

        char permission[11];

        if (S_ISDIR(st.st_mode)) {
            permission[0] = 'd';
        } else {
            permission[0] = '-';
        }

        permission[1] = ((st.st_mode & S_IRUSR) ? 'r' : '-');
        permission[2] = ((st.st_mode & S_IWUSR) ? 'w' : '-');
        permission[3] = ((st.st_mode & S_IXUSR) ? 'x' : '-');

        permission[4] = ((st.st_mode & S_IRGRP) ? 'r' : '-');
        permission[5] = ((st.st_mode & S_IWGRP) ? 'w' : '-');
        permission[6] = ((st.st_mode & S_IXUSR) ? 'x' : '-');

        permission[7] = ((st.st_mode & S_IROTH) ? 'r' : '-');
        permission[8] = ((st.st_mode & S_IWOTH) ? 'w' : '-');
        permission[9] = ((st.st_mode & S_IXOTH) ? 'x' : '-');   

        permission[10] = '\0';
        
        printf("%s\t%s\n", permission, fileNames[i]);
        free(fileNames[i]);
    }

    closedir(dir);
}

/////////////////////////////////// SUBSET 1 ///////////////////////////////////

// Check whether the file meets the criteria to be encrypted.
bool is_encryptable(char *filename) {
    struct stat fileStat;

    // check the file exists
    if (stat(filename, &fileStat) != 0) {
        perror(MSG_ERROR_FILE_STAT);
        return false;
    }

    // must be a regular file
    if (!S_ISREG(fileStat.st_mode)) {
        printf(MSG_ERROR_DIRECTORY);
        return false;
    }

    // group must have the read mode
    if (!(fileStat.st_mode & S_IRGRP)) {
        printf(MSG_ERROR_READ);
        return false;
    }

    // group must be able to write in the mode
    if (!(fileStat.st_mode & S_IWGRP)) {
        printf(MSG_ERROR_WRITE);
        return false;
    }

    return true;
}

// XOR the contents of the given file with a set key, and write the result to
// a new file.
void xor_file_contents(char *src_filename, char *dest_filename) {
    int64_t key = 0xA9;
    FILE *src_file, *dest_file;

    // check that both files can be openned
    src_file = fopen(src_filename, "r");
    if (src_file == NULL) {
        fprintf(stdout, MSG_ERROR_FILE_OPEN);
        return;
    }

    dest_file = fopen(dest_filename, "w");
    if (dest_file == NULL) {
        fprintf(stdout, MSG_ERROR_FILE_OPEN);
        fclose(src_file);
        return;
    }

    int byte;
    while ((byte = fgetc(src_file)) != EOF) {
        int xor_result = byte ^ key;
        fputc(xor_result, dest_file);
    }

    fclose(src_file);
    fclose(dest_file);
}

/////////////////////////////////// SUBSET 2 ///////////////////////////////////

// Search the current directory and its subdirectories for filenames containing
// the search string.
void search_by_filename(char *search_string) {
    // if the search string is '.' or '..' print error
    if (strcmp(search_string, ".") == 0 || strcmp(search_string, "..")) {
        printf(MSG_ERROR_RESERVED);
        return;
    }

    DIR *dir;
    struct dirent *curr;
    struct stat fileStat;

    // read all files in the current directory and compare
    char buffer[MAX_PATH_LEN];
    getcwd(buffer, sizeof(buffer));

    dir = opendir(buffer);

    while ((curr = readdir(dir)) != NULL) {
        if (strcmp(curr->d_name, ".") == 0 || strcmp(curr->d_name, "..") == 0) {
            continue;
        }

        char path[MAX_PATH_LEN];
        snprintf(path, sizeof(path), "%s/%s", ".", curr->d_name);
        
        // read all of the subdirectories 
        if (stat(path, &fileStat) == 0 && S_ISDIR(fileStat.st_mode)) {
            search_by_filename(search_string);

        // print if the search string is a substring of anything in the 
        } else {
            if (strstr(curr->d_name, search_string) != NULL) {
                printf("%s/%s\n,", ".", curr->d_name);
            }
        }
    }


    closedir(dir);
}

// Search the current directory and its subdirectories for files containing the
// provided search bytes.

void searchContent(char *path, char *search_bytes, int size) {
    FILE *file = fopen(path, "r");
    if (file == NULL) {
        perror(MSG_ERROR_FILE_OPEN);
        return;
    }

    char buffer[MAX_PATH_LEN];
    size_t bytesRead;

    while ((bytesRead = fread(buffer, 1, sizeof(buffer), file)) > 0) {
        for (size_t i = 0; i < bytesRead - size + 1; i++) {
            if (memcmp(buffer + i, search_bytes, size) == 0) {
                printf("%s\n", path);
                fclose(file);
                return;
            }
        }
    }

    fclose(file);
}

void searchInDirectory(char *dirPath, char *search_bytes, int size) {
    DIR *dir;
    struct dirent *curr;
    struct stat fileStat;

    if ((dir = opendir(dirPath)) == NULL) {
        perror(MSG_ERROR_DIRECTORY);
        return;
    }

    while ((curr = readdir(dir)) != NULL) {
        if (strcmp(curr->d_name, ".") == 0 || strcmp(curr->d_name, "..") == 0) {
            continue;
        }

        char path[MAX_PATH_LEN];
        snprintf(path, sizeof(path), "%s/%s", dirPath, curr->d_name);

        if (stat(path, &fileStat) == 0 && S_ISDIR(fileStat.st_mode)) {
            searchInDirectory(path, search_bytes, size);
        } else {
            searchContent(path, search_bytes, size);
        }
    }

    closedir(dir);
}

void search_by_content(char *search_bytes, int size) {
    searchInDirectory(".", search_bytes, size);
}

/////////////////////////////////// SUBSET 3 ///////////////////////////////////

char *shift_encrypt(char *plaintext, char password[CIPHER_BLOCK_SIZE]) {
    char *cipher = malloc(CIPHER_BLOCK_SIZE);

    for (int i = 0; i < 16; i++) {
        cipher[i] = (plaintext[i] << (password[i] % 8)) | (plaintext[i] >> (8 - password[i] % 8));
    }

    return cipher;
}

char *shift_decrypt(char *ciphertext, char password[CIPHER_BLOCK_SIZE]) {
    char *plain = malloc(CIPHER_BLOCK_SIZE);

    for (int i = 0; i < 16; i++) {
        plain[i] = (ciphertext[i] >> (password[i] % 8)) | (ciphertext[i] << (8 - password[i] % 8));
    }

    return plain;
}

void ecb_encryption(char *filename, char password[CIPHER_BLOCK_SIZE]) {

    FILE *input = fopen(filename, "r");
    if (input == NULL) {
        perror(MSG_ERROR_FILE_OPEN);
    }

    fseek(input, 0, SEEK_END);
    long fileSize = ftell(input);
    fseek(input, 0, SEEK_SET);

    long roundedUpSize = (fileSize + CIPHER_BLOCK_SIZE - 1) / CIPHER_BLOCK_SIZE * CIPHER_BLOCK_SIZE;

    char *plainText = malloc(roundedUpSize);

    fread(plainText, 1, fileSize, input);
    memset(plainText + fileSize, '\0', roundedUpSize - fileSize);
    fclose(input);

    FILE *output = fopen(strcat(filename, ".ecb"), "w");
    if (output == NULL) {
        perror(MSG_ERROR_FILE_OPEN);
        exit(EXIT_FAILURE);
    }

    for (long i = 0; i < roundedUpSize; i += CIPHER_BLOCK_SIZE) {
        char *cipherBlock = shift_encrypt(plainText + i, password);
        fwrite(cipherBlock, 1, CIPHER_BLOCK_SIZE, output);
        free(cipherBlock);
    }

    fclose(output);
    free(plainText);
}

void ecb_decryption(char *filename, char password[CIPHER_BLOCK_SIZE]) {
    FILE *input = fopen(filename, "r");
    if (input == NULL) {
        perror(MSG_ERROR_FILE_OPEN);
    }

    fseek(input, 0, SEEK_END);
    long fileSize = ftell(input);
    fseek(input, 0, SEEK_END);

    char *cipher = malloc(fileSize);
    
    fread(cipher, 1, fileSize, input);
    fclose(input);

    FILE *output = fopen(strcat(filename, ".dec"), "w");
    if (output == NULL) {
        perror(MSG_ERROR_FILE_OPEN);
    }

    for (long i = 0; i < fileSize; i += CIPHER_BLOCK_SIZE) {
        char *plainBlock = shift_decrypt(cipher + i, password);
        fwrite(plainBlock, 1, CIPHER_BLOCK_SIZE, output);
        free(plainBlock);
    }

    fclose(output);
    free(cipher);
}

/////////////////////////////////// SUBSET 4 ///////////////////////////////////

void xor_blocks(char *result, char *block1, char *block2, int size) {
    for (int i = 0; i < size; i++) {
        result[i] = block1[i] ^ block2[i];
    }
}

void cbc_encryption(char *filename, char password[CIPHER_BLOCK_SIZE]) {
    FILE *input = fopen(filename, "r");
    if (input  == NULL) {
        perror(MSG_ERROR_FILE_OPEN);
        exit(EXIT_FAILURE);
    }

    fseek(input, 0, SEEK_END);
    long fileSize = ftell(input);
    fseek(input, 0, SEEK_SET);

    long roundedSize = (fileSize + CIPHER_BLOCK_SIZE - 1) / CIPHER_BLOCK_SIZE * CIPHER_BLOCK_SIZE;

    char *plain = malloc(roundedSize);
    
    fread(plain, 1, fileSize, input);
    memset(plain + fileSize, '\0', roundedSize - fileSize);
    fclose(input);

    FILE *output = fopen(strcat(filename, ".cbc"), "w");
    if (output == NULL) {
        perror(MSG_ERROR_FILE_OPEN);
        exit(EXIT_FAILURE);
    }
    
    char *randomString = generate_random_string(1);

    for (long i = 0; i < roundedSize; i += CIPHER_BLOCK_SIZE) {
        xor_blocks(plain + i, plain + i, randomString, CIPHER_BLOCK_SIZE);

        char *cipherBlock = shift_encrypt(randomString, password);

        if (i + CIPHER_BLOCK_SIZE < roundedSize) {
            xor_blocks(plain + i, plain + i, cipherBlock, CIPHER_BLOCK_SIZE);
        }

        fwrite(plain + i, 1, CIPHER_BLOCK_SIZE, output);
        memcpy(randomString, cipherBlock, CIPHER_BLOCK_SIZE);
        free(cipherBlock);
    }

    fclose(output);
    free(plain);
    free(randomString);
}

void cbc_decryption(char *filename, char password[CIPHER_BLOCK_SIZE]) {
    FILE *input = fopen(filename, "r");
    if (input == NULL) {
        perror(MSG_ERROR_FILE_OPEN);
        exit(EXIT_FAILURE);
    }

    fseek(input, 0, SEEK_END);
    long fileSize = ftell(input);
    fseek(input, 0, SEEK_SET);

    char *cipher = malloc(fileSize);
    
    fread(cipher, 1, fileSize, input);
    fclose(input);

    FILE *output = fopen(strcat(filename, ".cbc.dec"), "w");
    if (output == NULL) {
        perror("Invalid output file");
        exit(EXIT_FAILURE);
    }

    char *randomString = generate_random_string(1);

    for (long i = 0; i < fileSize; i += CIPHER_BLOCK_SIZE) {
        char *plainBlock = shift_decrypt(cipher + i, password);

        xor_blocks(plainBlock, plainBlock, randomString, CIPHER_BLOCK_SIZE);
        fwrite(plainBlock, 1, CIPHER_BLOCK_SIZE, output);
        
        memcpy(randomString, cipher + i, CIPHER_BLOCK_SIZE);
        free(plainBlock);
    }

    fclose(output);
    free(cipher);
    free(randomString);
}

/////////////////////////////////// PROVIDED ///////////////////////////////////
// Some useful provided functions. Do NOT modify.

// Sort an array of strings in alphabetical order.
// strings:  the array of strings to sort
// count:    the number of strings in the array
// This function is to be provided to students.
void sort_strings(char *strings[], int count) {
    for (int i = 0; i < count; i++) {
        for (int j = 0; j < count; j++) {
            if (strcmp(strings[i], strings[j]) < 0) {
                char *temp = strings[i];
                strings[i] = strings[j];
                strings[j] = temp;
            }
        }
    }
}

// Sort an array of content_result_t in descending order of matches.
// results:  the array of pointers to content_result_t to sort
// count:    the number of pointers to content_result_t in the array
// This function is to be provided to students.
void sort_content_results(content_result *results[], int count) {
    for (int i = 0; i < count; i++) {
        for (int j = 0; j < count; j++) {
            if (results[i]->matches > results[j]->matches) {
                content_result *temp = results[i];
                results[i] = results[j];
                results[j] = temp;
            } else if (results[i]->matches == results[j]->matches) {
                // If the matches are equal, sort alphabetically.
                if (strcmp(results[i]->filename, results[j]->filename) < 0) {
                    content_result *temp = results[i];
                    results[i] = results[j];
                    results[j] = temp;
                }
            }
        }
    }
}

// Generate a random string of length RAND_STR_LEN.
// Requires a seed for the random number generator.
// The same seed will always generate the same string.
// The string contains only lowercase + uppercase letters,
// and digits 0 through 9.
// The string is returned in heap-allocated memory,
// and must be freed by the caller.
char *generate_random_string(int seed) {
    if (seed != 0) {
        srand(seed);
    }
    char *alpha_num_str =
        "abcdefghijklmnopqrstuvwxyz"
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
        "0123456789";

    char *random_str = malloc(RAND_STR_LEN);

    for (int i = 0; i < RAND_STR_LEN; i++) {
        random_str[i] = alpha_num_str[rand() % (strlen(alpha_num_str) - 1)];
    }

    return random_str;
}
