////////////////////////////////////////////////////////////////////////////////
// COMP1521 23T3 --- Assignment 2: `tide', a terribly insecure (file) decryptor
// <https://www.cse.unsw.edu.au/~cs1521/23T3/assignments/ass2/index.html>
//
// 2023-10-25   v1.0    Team COMP1521 <cs1521 at cse.unsw.edu.au>
// This is used by main.c to help with command parsing.
// You are NOT expected to understand the code in this file. 
// DO NOT MODIFY THIS CODE.

#ifndef __COMMANDS_H__
#define __COMMANDS_H__

// The name of the help command.
#define CMD_HELP            "help"
// The maximum possible length for a command.
#define MAX_COMMAND_LENGTH  20
// The width of a help entry, to allow for padding.
#define HELP_ENTRY_WIDTH    MAX_COMMAND_LENGTH + 14

typedef struct command {
    char *name;
    char *alias;
    char *description;
    char *argument_desc;
    void (*handler)(char *);
} command_t;

/* Command handlers */
void do_help(char *);
void do_print_current_directory(char *);
void do_change_directory(char *);
void do_list_current_directory(char *);
void do_is_encryptable(char *);
void do_xor_file_contents(char *);
void do_ecb_encryption(char *);
void do_ecb_decryption(char *);
void do_search_by_filename(char *);
void do_search_by_content(char *);
void do_search_from_file(char *);
void do_cbc_encryption(char *);
void do_cbc_decryption(char *);
void do_quit(char *);


command_t commands[] = {
    {
        .name = CMD_HELP,
        .alias = "h",
        .description = "Prints this help message",
        .argument_desc = NULL,
        .handler = do_help
    },
    {
        .name = "pwd",
        .alias = "p",
        .description = "Prints the current directory",
        .argument_desc = NULL,
        .handler = do_print_current_directory
    },
    {
        .name = "chdir",
        .alias = "cd",
        .description = "Changes the current directory",
        .argument_desc = "directory",
        .handler = do_change_directory
    },
    {
        .name = "list",
        .alias = "ls",
        .description = "Lists the contents of the current directory",
        .argument_desc = NULL,
        .handler = do_list_current_directory
    },
    {
        .name = "test-encryptable",
        .alias = "t",
        .description = "Tests if a file can be encrypted",
        .argument_desc = "filename",
        .handler = do_is_encryptable
    },
    {
        .name = "xor-contents",
        .alias = "x",
        .description = "Encrypts a file with simple XOR",
        .argument_desc = "filename",
        .handler = do_xor_file_contents
    },
    {
        .name = "encrypt-ecb",
        .alias = "ee",
        .description = "Encrypts a file with ECB",
        .argument_desc = "filename",
        .handler = do_ecb_encryption
    },
    {
        .name = "decrypt-ecb",
        .alias = "de",
        .description = "Decrypts a file with ECB",
        .argument_desc = "filename",
        .handler = do_ecb_decryption
    },
    {
        .name = "search-name",
        .alias = "sn",
        .description = "Searches for a file by filename",
        .argument_desc = "search-term",
        .handler = do_search_by_filename
    },
    {
        .name = "search-content",
        .alias = "sc",
        .description = "Searches for a file by its content for the provided bytes",
        .argument_desc = "search-size",
        .handler = do_search_by_content
    },
    {
        .name = "search-from-file",
        .alias = "sf",
        .description = "Searches for a file by its content for the provided"\
                       " bytes, supplied from a file",
        .argument_desc = "source-file",
        .handler = do_search_from_file
    },
    {
        .name = "encrypt-cbc",
        .alias = "ec",
        .description = "Encrypts a file with CBC",
        .argument_desc = "filename",
        .handler = do_cbc_encryption
    }, 
    {
        .name = "decrypt-cbc",
        .alias = "dc",
        .description = "Decrypts a file with CBC",
        .argument_desc = "filename",
        .handler = do_cbc_decryption
    },
    {
        .name = "quit",
        .alias = "q",
        .description = "Quits the program",
        .argument_desc = NULL,
        .handler = do_quit
    }
};

#define NUM_COMMANDS (sizeof(commands) / sizeof(command_t))

#endif // __COMMANDS_H__
