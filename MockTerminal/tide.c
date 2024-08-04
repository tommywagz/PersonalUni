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
#include <errno.h>

// Add any extra #defines here.
#define BUFFER_SIZE 4096

// Add any extra function signatures here.
char *return_cwd();
void printf_file_stat(char *fileName);
void search_by_fileName_recursion(char *search_string, char *path, char **results, int *count);
void search_by_content_recursion(char *search_bytes, int size, char *path, content_result *results[], int *count);
void xor_blocks(char *result, char *block1, char *block2, int size);

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
    char *cwd = return_cwd();

    if (cwd != NULL) {
        printf("The current directory is: %s\n", cwd);
        free(cwd);
    }
}

// return the string value of the current working directory
char *return_cwd() {
    char *buffer = malloc(MAX_PATH_LEN * sizeof(char));

    if (getcwd(buffer, MAX_PATH_LEN) == NULL) {
        perror(MSG_ERROR_DIRECTORY);
        free(buffer);
        return NULL;
    }

    return buffer;
}

// Change the current directory to the given pathname.
void change_current_directory(char *directory) {
    // Include the edge cases of changing to the home directory
    // and printfing an error for an invalid directory
    if (strcmp("~", directory) == 0) {
        chdir(getenv("HOME"));
        printf("Moving to %s\n", getenv("HOME"));
    } else if (chdir(directory) == 0) {
        printf("Moving to %s\n", directory);
    } else  {
        fprintf(stdout, MSG_ERROR_CHANGE_DIR);
    }
}

// List the contents of the current directory.
void list_current_directory(void) {
    DIR *dir;
    struct dirent *curr;
   
    if ((dir = opendir(".")) == NULL) {
        perror(MSG_ERROR_DIRECTORY);
        return;
    }

    // Fill filenames array of strings with every file in the cwd
    char *fileNames[MAX_LISTINGS];
    int count = 0;
    while ((curr = readdir(dir) )!= NULL && count < MAX_LISTINGS) {
        fileNames[count] = strdup(curr->d_name);
        count++;
    }

    // use helper function to sort the filenames
    sort_strings(fileNames, count);

    // format each filename and it's permissions with helper function
    for (int i = 0; i < count; i++) {
        printf_file_stat(fileNames[i]);
    }

    closedir(dir);
}

// print the stat value of the cwd
void printf_file_stat(char *fileName) {
    struct stat st;
    if (stat(fileName, &st) != 0) {
        perror(MSG_ERROR_FILE_STAT);
        exit(EXIT_FAILURE);
    }

    char permission[] = "rwxrwxrwx";

    // print the first byte depending on the file type
    if (S_ISDIR(st.st_mode)) {
        printf("d");
    } else {
        printf("-");
    }

    // for the remaining bytes, set to '-' if that permission isn't allowed
    for (int i = 0; i < strlen(permission); i++) {
        if (!(st.st_mode & 1 << (8 - i))) {
            permission[i] = '-';
        }
    }
    
    printf("%s\t%s\n", permission, fileName);
}

/////////////////////////////////// SUBSET 1 ///////////////////////////////////

// Check whether the file meets the criteria to be encrypted.
bool is_encryptable(char *filename) {
    struct stat fileStat;

    // check the file exists
    if (stat(filename, &fileStat) != 0) {
        fprintf(stdout, MSG_ERROR_FILE_STAT);
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

    // xor the bytes one by one until EOF and print them
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
    char *results[MAX_LISTINGS] = {NULL};
    int count = 0;

    // if the search string is '.' or '..' print error
    if (strcmp(search_string, ".") == 0 || strcmp(search_string, "..") == 0) {
        fprintf(stdout, MSG_ERROR_RESERVED);
        return;
    }

    // Use the helper functions to recursively search the cwd and sort the results
    search_by_fileName_recursion(search_string, ".", results, &count);
    sort_strings(results, count);

    // print the results
    printf("Found in %d filenames. \n", count);  
    for (int i = 0; i < count; i++) {
        printf_file_stat(results[i]);
        free(results[i]);
    }
}

// recursivley check the file names of the cwd and it's subdirectories
void search_by_fileName_recursion(char *search_string, char *path, char **results, int *count) {
    // Open the current path directory and its entry 
    // along with a new string buffer for the subdirectories and file paths
    DIR *dir = opendir(path);
    if (!dir) {
        perror(MSG_ERROR_DIRECTORY);
        return;
    }
    
    struct dirent *curr;
    char buffer[MAX_PATH_LEN];

    // for each file in cwd, add name to results 
    // unless it's a "." or ".." directory
    while ((curr = readdir(dir)) != NULL && *count < MAX_LISTINGS) {
        snprintf(buffer, sizeof(buffer), "%s/%s", path, curr->d_name);

        if (curr->d_type == DT_REG && (strstr(curr->d_name, search_string) != NULL)) {
            results[*count] = strdup(buffer);
            (*count)++; 
        } else if (curr->d_type == DT_DIR) {
            if (strcmp(curr->d_name, ".") == 0 || strcmp(curr->d_name, "..") == 0) {
                continue;
            }

            if (strstr(curr->d_name, search_string) != NULL) {
                results[*count] = strdup(buffer);
                (*count)++; 
            }

            // recursively search subdirectory's file names
            search_by_fileName_recursion(search_string, buffer, results, count);
        }
    }

    closedir(dir);
}

// Search for a given string of a given size within the abstract of 
// ecery file in the current working directory
void search_by_content(char *search_bytes, int size) {  
    // Make an array of content_result pointers and fill it appropriately
    content_result **results = malloc(MAX_LISTINGS * sizeof(content_result));
    if (!results) {
        fprintf(stdout, "MEMORY ERROR\n");
        free(results);
        return;
    }

    for (int i = 0; i < MAX_LISTINGS; i++) {
        results[i] = malloc(sizeof(content_result));
    }
    
    // number of times the string appears in each file
    int count = 0;

    // use helper functions to recursively search through the cwd 
    // for search_bytes and sort the results 
    search_by_content_recursion(search_bytes, size, ".", results, &count);
    sort_content_results(results, count);

    // print the results
    if (count == 1) {
        printf("Found in 1 file.\n");
    } else {
        printf("Found in %d files. \n", count);
    }

    for (int i = 0; i < count; i++) {
        printf("%d: %s\n", results[i]->matches, results[i]->filename);
        free(results[i]->filename);
        free(results[i]);
    }

    free(results);
}

// Helper function to recursively search through 
// the cwd's subdirectories and files for the given search_bytes string
void search_by_content_recursion(char *search_bytes, int size, char *path, 
content_result *results[], int *count) {

    // Open the directory of the given path and its entry with 
    // a buffer string for the paths of each file within the current path
    DIR *dir = opendir(path);
    if (!dir) {
        perror(MSG_ERROR_DIRECTORY);
        return;
    }
    
    struct dirent *curr;
    char buffer[MAX_PATH_LEN];

    // for each file with the cwd, search for search_bytes string
    while ((curr = readdir(dir)) != NULL) {
        snprintf(buffer, sizeof(buffer), "%s/%s", path, curr->d_name);

        // If the file is regular get the length of the file and read through
        // it 'size' bytes at a time
        if (curr->d_type == DT_REG) {
            FILE *file = fopen(buffer, "rb");

            if (file) {
                fseek(file, 0, SEEK_END);
                long fileLength = ftell(file);
                fseek(file, 0, SEEK_SET);

                if (size > fileLength) {
                    fclose(file);
                    continue;
                }

                // number of times "search_bytes" appears in the current file
                int matches = 0;
                unsigned char *fileBytes = malloc(fileLength * sizeof(char));
                size_t readBytes = fread(fileBytes, 1, fileLength, file);                 

                for (size_t i = 0; i < readBytes - size + 1; i++) {
                    if (memcmp(fileBytes + i, search_bytes, size) == 0) {
                        matches++;
                    }
                }

                // set the attributes of the content_result struct 
                // to the appropriate values
                if (matches > 0 && *count < MAX_LISTINGS) {
                    results[*count]->filename = strdup(buffer);
                    results[*count]->matches = matches;
                    (*count)++;
                }

                free(fileBytes);
                fclose(file);

            } else {
                fprintf(stderr, "%s - %s: %s\n", MSG_ERROR_FILE_OPEN, buffer, strerror(errno));
            }  

        // If the file is a subdirectory, recursively search through each of
        // its files' abstracts for search string unless its name is ". or "..
        } else if (curr->d_type == DT_DIR && strcmp(curr->d_name, ".") != 0 && strcmp(curr->d_name, "..") != 0) {
            search_by_content_recursion(search_bytes, size, buffer, results, count);
        } 
    }

    closedir(dir);
}

/////////////////////////////////// SUBSET 3 ///////////////////////////////////

// Everything henceforth was a first draft that I didn't have time to debug
// I hope the comments are anough to walk you through my thought process

// Shift each character in the given plaintext 
// string by the corresponding byte of password
char *shift_encrypt(char *plaintext, char password[CIPHER_BLOCK_SIZE]) {
    char *cipher = malloc(CIPHER_BLOCK_SIZE);

    for (int i = 0; i < strlen(plaintext); i++) {
        cipher[i] = (plaintext[i] << (password[i] % 8)) | (plaintext[i] >> (8 - password[i] % 8));
    }

    return cipher;
}

// Reverse the encryption process by shifting the cpher text bytes
// by the opposite cyclic shift as the encryption
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

    // Round up the cipher text to nearest multiple of 16 (the password length)
    long roundedUpSize = (fileSize + CIPHER_BLOCK_SIZE - 1) / CIPHER_BLOCK_SIZE * CIPHER_BLOCK_SIZE;
    char *plainText = malloc(roundedUpSize);

    fread(plainText, 1, fileSize, input);
    memset(plainText + fileSize, '\0', roundedUpSize - fileSize);
    fclose(input);

    // make new output file in the cwd
    //  write in the encrypted characters into it
    FILE *output = fopen(strcat(filename, ".ecb"), "w");
    if (output == NULL) {
        perror(MSG_ERROR_FILE_OPEN);
        exit(EXIT_FAILURE);
    }

    // For each cipher block get a block of plan text and encrypt it before
    // writing it into the output file
    for (long i = 0; i < roundedUpSize; i += CIPHER_BLOCK_SIZE) { 
        char *cipherBlock = shift_encrypt(plainText + i, password);
        fwrite(cipherBlock, 1, CIPHER_BLOCK_SIZE, output);
        free(cipherBlock);
    }

    fclose(output);
    free(plainText);
}

//  Makes a new output file in the cwd that 
//transaltes a given file with a password
void ecb_decryption(char *filename, char password[CIPHER_BLOCK_SIZE]) {
    FILE *input = fopen(filename, "r");
    if (input == NULL) {
        perror(MSG_ERROR_FILE_OPEN);
    }

    // Get the length of the given file and read the abstract of the 
    // file into the string "cipher"
    fseek(input, 0, SEEK_END);
    long fileSize = ftell(input);
    fseek(input, 0, SEEK_END);

    char *cipher = malloc(fileSize);
    
    fread(cipher, 1, fileSize, input);
    fclose(input);

    // Make a new output file in the cwd
    FILE *output = fopen(strcat(filename, ".dec"), "w");
    if (output == NULL) {
        perror(MSG_ERROR_FILE_OPEN);
    }

    // For each CIPHER_BLOCK_SIZE'd block of code in the cipher
    // use the decrypt helper function to get the new plainBlock
    // ans write it inot the output file
    for (long i = 0; i < fileSize; i += CIPHER_BLOCK_SIZE) {
        char *plainBlock = shift_decrypt(cipher + i, password);
        fwrite(plainBlock, 1, CIPHER_BLOCK_SIZE, output);
        free(plainBlock);
    }

    fclose(output);
    free(cipher);
}

/////////////////////////////////// SUBSET 4 ///////////////////////////////////

// Use blockchain encryption to make a new file in the cwd that has an element of
// randomness incorporatied into the new file
void cbc_encryption(char *filename, char password[CIPHER_BLOCK_SIZE]) {
    // implements similar setup logic as shift_encryption 
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
    
    // 
    fread(plain, 1, fileSize, input);
    memset(plain + fileSize, '\0', roundedSize - fileSize);
    fclose(input);

    FILE *output = fopen(strcat(filename, ".cbc"), "w");
    if (output == NULL) {
        perror(MSG_ERROR_FILE_OPEN);
        exit(EXIT_FAILURE);
    }
    
    char *randomString = generate_random_string(1);

    // For each 16 byte sized block of plain text set the plain blocks
    // to the xor_block of the random string and the plain block before
    // repeating the process with the cipher block that's been shift_encrypted
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

// Similarly to the blockchain enctyption, use the random string of the same seed of 1
// to unshift the cipher text back into plaintext
void cbc_decryption(char *filename, char password[CIPHER_BLOCK_SIZE]) {
    // Follow the same setup logic as cbc_encrytption
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

    // for each 16 byte block of the cipher text, shift decrypt it
    // it into the cipher string and xor_block it 
    //before writing it into the output file
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

// Helper function that takes two blocks of the same size and 
// sets the given result string to the new "xor" block
void xor_blocks(char *result, char *block1, char *block2, int size) {
    for (int i = 0; i < size; i++) {
        result[i] = block1[i] ^ block2[i];
    }
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
