////////////////////////////////////////////////////////////////////////////////
// COMP1521 23T3 --- Assignment 2: `tide', a terribly insecure (file) decryptor
// <https://www.cse.unsw.edu.au/~cs1521/23T3/assignments/ass2/index.html>
//
// 2023-10-25   v1.0    Team COMP1521 <cs1521 at cse.unsw.edu.au>
// This is used to provide a command-line interface to call the functions
// you implement!
//
// You are NOT expected to understand the code in this file.
// DO NOT MODIFY THIS CODE.
// THIS FILE WILL BE PROVIDED AS IS DURING TESTING AND MARKING.

#include <stdio.h>
#include <stdbool.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>
#include <unistd.h>

#include "tide.h"
#include "escape.h"
#include "commands.h"

#define MAX_INPUT_LEN (MAX_PATH_LEN + MAX_COMMAND_LENGTH + 1)

static const char *const PROGRAM_NAME = "tide";
static const char *const COLOR_FLAG = "--colors";

static const char *const XOR_EXT = ".xor";
static const char *const DEC_EXT = ".dec";

static bool allow_escapes = false;

static inline void print_escape(char *escape) {
    if (allow_escapes) printf("%s", escape);
}

bool get_command(char *command, char **argument);

int main(int argc, char **argv) {
    if (argc >= 2 && !strcmp(argv[1], COLOR_FLAG)) {
        allow_escapes = true;
    }

    print_escape(ANSI_COL_CYAN ANSI_TEXT_BOLD ANSI_TEXT_UNDERLINE);
    printf("Welcome to %s!\n", PROGRAM_NAME);
    print_escape(ANSI_ALL_RESET);

    print_escape(ANSI_TEXT_BOLD);
    printf("To see what commands are available, type ");
    print_escape(ANSI_COL_YELLOW);
    printf(CMD_HELP);
    print_escape(ANSI_ALL_RESET ANSI_TEXT_BOLD);
    printf(".\n\n");
    print_escape(ANSI_ALL_RESET);

    char command_buf[MAX_COMMAND_LENGTH];
    char *argument;

    while (get_command(command_buf, &argument)) {
        // Scan in commands until EOF.
        int i;
        for (i = 0; i < NUM_COMMANDS; i++) {
            // Scan through the list of commands to try find a match.
            if (!strcmp(commands[i].name, command_buf) ||
                !strcmp(commands[i].alias, command_buf)) {
                // If a match is found, invoke the handler!
                commands[i].handler(argument);
                break;
            }
        }


        if (i == NUM_COMMANDS) {
            // If we reached the end, there was no match.

            char *buf_iter = command_buf;

            while (*buf_iter) {
                if (!isspace((unsigned char)*buf_iter)) break;
                buf_iter++;
            }

            if (*buf_iter) {
                printf("Unknown command: %s\n", command_buf);
            }
        }

        if (argument != NULL) {
            // argument is malloced by get_command, so free it.
            free(argument);
        }
    }

    do_quit(NULL);
    return 0;
}

bool get_command(char *command, char **argument) {
    // Print prompt.
    print_escape(ANSI_COL_CYAN ANSI_TEXT_BOLD);
    printf(PROGRAM_NAME);
    print_escape(ANSI_ALL_RESET ANSI_TEXT_BOLD);
    printf("> ");
    print_escape(ANSI_ALL_RESET);

    char *input_buf = malloc(MAX_INPUT_LEN);
    if (input_buf == NULL) {
        perror("malloc");
        return false;
    }

    if (fgets(input_buf, MAX_INPUT_LEN, stdin) == NULL) {
        free(input_buf);
        return false;
    }

    // If stdin is not a terminal, echo the input back.
    // helps with reading autotest output.
    if (!isatty(STDIN_FILENO)) {
        printf("%s", input_buf);
    }

    // Remove the newline stored by fgets, if any.
    char *newline_ptr = strchr(input_buf, '\n');
    if (newline_ptr != NULL) {
        *newline_ptr = '\0';
    }

    // Split the input into the command and argument if there is one.
    char *sep_ptr = strchr(input_buf, ' ');
    if (sep_ptr == NULL) {
        // Both buffers are of the same size.
        strcpy(command, input_buf);
        *argument = NULL;
    } else {
        *sep_ptr = '\0';
        // Both buffers are of the same size.
        strcpy(command, input_buf);
        sep_ptr++;

        *argument = malloc(strlen(sep_ptr) + 1);
        if (*argument == NULL) {
            perror("malloc");
            free(input_buf);
            return false;
        }
        strcpy(*argument, sep_ptr);
    }

    free(input_buf);
    return true;
}

void do_help(char *argument) {
    for (int i = 0; i < NUM_COMMANDS; i++) {
        int padding = HELP_ENTRY_WIDTH - 3;
        int written;

        // Print command name.
        print_escape(ANSI_COL_YELLOW ANSI_TEXT_BOLD);
        printf("%s%n", commands[i].name, &written);
        padding -= written;
        print_escape(ANSI_ALL_RESET ANSI_TEXT_BOLD);

        // Print argument if any.
        if (commands[i].argument_desc != NULL) {
            printf(" %s%n", commands[i].argument_desc, &written);
            padding -= written;
        }

        // Print the alias for the command.
        print_escape(ANSI_ALL_RESET);
        printf(" (");
        print_escape(ANSI_COL_YELLOW ANSI_TEXT_BOLD);
        printf("%s%n", commands[i].alias, &written);
        padding -= written;
        print_escape(ANSI_ALL_RESET);

        // Print computed padding.
        printf(")");
        for (int j = 0; j < padding; j++) {
            putchar(' ');
        }

        printf("%s\n", commands[i].description);
    }
}

void do_print_current_directory(char *argument) {
    print_current_directory();
}

void do_change_directory(char *argument) {
    if (argument == NULL) {
        printf("No directory specified.\n");
        return;
    }
    change_current_directory(argument);
}

void do_list_current_directory(char *argument) {
    list_current_directory();
}

void do_is_encryptable(char *argument) {
    if (argument == NULL) {
        printf("No filename specified.\n");
        return;
    }

    // Strip any trailing slashes from the argument.
    if (argument[strlen(argument) - 1] == '/') {
        argument[strlen(argument) - 1] = '\0';
    }

    if (is_encryptable(argument)) {
        printf("%s is encryptable.\n", argument);
    } else {
        printf("%s is not encryptable.\n", argument);
    }
}

void do_xor_file_contents(char *argument) {
    if (argument == NULL) {
        printf("No filename specified.\n");
        return;
    }

    if (!is_encryptable(argument)) {
        printf("%s is not encryptable.\n", argument);
        return;
    }

    char *extension = strrchr(argument, '.');
    char *destination_extension = (char *)XOR_EXT;
    if (extension != NULL &&
        !strcmp(extension, XOR_EXT)) {
        destination_extension = (char *)DEC_EXT;
    }

    char *destination_filename = malloc(
        strlen(argument) + strlen(destination_extension) + 1
    );

    if (destination_filename == NULL) {
        perror("malloc");
        return;
    }

    snprintf(destination_filename,
        strlen(argument) + strlen(destination_extension) + 1,
        "%s%s", argument, destination_extension
    );

    xor_file_contents(argument, destination_filename);
    free(destination_filename);
}

void do_ecb_encryption(char *argument) {
    if (argument == NULL) {
        printf("No filename specified.\n");
        return;
    }

    if (!is_encryptable(argument)) {
        printf("%s is not encryptable.\n", argument);
        return;
    }

    printf("Enter password (must be exactly %d bytes): ", CIPHER_BLOCK_SIZE);

    char password_buf[CIPHER_BLOCK_SIZE + 1];
    if (fread(password_buf, CIPHER_BLOCK_SIZE + 1, 1, stdin) != 1) {
        printf("Incomplete read.");
    }

    ecb_encryption(argument, password_buf);
}

void do_ecb_decryption(char *argument) {
    printf("Enter password (must be exactly %d bytes): ", CIPHER_BLOCK_SIZE);

    if (!is_encryptable(argument)) {
        printf("%s is not encryptable.\n", argument);
        return;
    }

    char password_buf[CIPHER_BLOCK_SIZE + 1];
    if (fread(password_buf, CIPHER_BLOCK_SIZE + 1, 1, stdin) != 1) {
        printf("Incomplete read.");
    }

    ecb_decryption(argument, password_buf);
}

void do_search_by_filename(char *argument) {
    if (argument == NULL) {
        printf("No search string specified.\n");
        return;
    }
    search_by_filename(argument);
}

void do_search_by_content(char *argument) {
    if (argument == NULL) {
        printf("No search size specified.\n");
        return;
    }

    char *endptr;
    long size = strtol(argument, &endptr, 10);
    if (endptr == argument || *endptr != '\0' ||
        size <= 0 || size > MAX_SEARCH_SIZE) {
        printf("Invalid search size (enter a value between 1 and %d).\n",
                MAX_SEARCH_SIZE);
        return;
    }

    char *search_bytes = malloc(size);
    if (search_bytes == NULL) {
        perror("malloc");
        return;
    }

    printf("Enter %ld bytes to search for: ", size);

    if (fread(search_bytes, 1, size, stdin) != size) {
        perror("fread");
        free(search_bytes);
        return;
    }

    int extra_bytes = 0;
    // Keep consuming bytes until we reach a newline.
    while (fgetc(stdin) != '\n') {
        extra_bytes++;
    }

    if (extra_bytes) {
        printf("You entered %d extra byte%s - continuing...\n",
                extra_bytes, extra_bytes == 1 ? "" : "s");
    }

    search_by_content(search_bytes, size);
    free(search_bytes);
}

void do_search_from_file(char *argument) {
    if (argument == NULL) {
        printf("No filename specified.\n");
        return;
    }

    FILE *stream = fopen(argument, "r");
    if (stream == NULL) {
        perror(argument);
        return;
    }

    char *search_bytes = malloc(MAX_SEARCH_SIZE);
    if (search_bytes == NULL) {
        perror("malloc");
        fclose(stream);
        return;
    }

    size_t bytes_read = fread(search_bytes, 1, MAX_SEARCH_SIZE, stream);

    if (bytes_read == 0) {
        printf("Warning: no content");
    }

    if (bytes_read == MAX_SEARCH_SIZE && !feof(stream)) {
        printf("Warning: search bytes greater than max allowed (max: %d). Continuing...\n", MAX_SEARCH_SIZE);
    }

    search_by_content(search_bytes, bytes_read);

    free(search_bytes);
    fclose(stream);
}

void do_cbc_encryption(char *argument) {
    if (argument == NULL) {
        printf("No filename specified.\n");
        return;
    }

    if (!is_encryptable(argument)) {
        printf("%s is not encryptable.\n", argument);
        return;
    }

    printf("Enter password (must be exactly %d bytes): ", CIPHER_BLOCK_SIZE);

    char password_buf[CIPHER_BLOCK_SIZE + 1];
    if (fread(password_buf, CIPHER_BLOCK_SIZE + 1, 1, stdin) != 1) {
        printf("Incomplete read.");
    }

    cbc_encryption(argument, password_buf);

}

void do_cbc_decryption(char *argument) {
    if (argument == NULL) {
        printf("No filename specified.\n");
        return;
    }

    if (!is_encryptable(argument)) {
        printf("%s is not decryptable.\n", argument);
        return;
    }

    printf("Enter password (must be exactly %d bytes): ", CIPHER_BLOCK_SIZE);

    char password_buf[CIPHER_BLOCK_SIZE + 1];
    if (fread(password_buf, CIPHER_BLOCK_SIZE + 1, 1, stdin) != 1) {
        printf("Incomplete read.");
    }

    cbc_decryption(argument, password_buf);
}

void do_quit(char *argument) {
    printf("Thanks for using %s. Have a nice day!\n", PROGRAM_NAME);
    exit(0);
}
