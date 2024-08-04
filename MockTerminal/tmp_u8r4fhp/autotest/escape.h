////////////////////////////////////////////////////////////////////////////////
// COMP1521 23T3 --- Assignment 2: `tide', a terribly insecure (file) decryptor
// <https://www.cse.unsw.edu.au/~cs1521/23T3/assignments/ass2/index.html>
//
// 2023-10-25   v1.0    Team COMP1521 <cs1521 at cse.unsw.edu.au>
// This is used for `tide --colors` to print out colors!
// You are NOT expected to understand the code in this file. 
// DO NOT MODIFY THIS CODE.

#define ANSI_TEXT_BOLD          "\33[1m"
#define ANSI_TEXT_UNDERLINE     "\33[4m"
#define ANSI_BG_BRIGHT_BLACK    "\33[40;1m"
#define ANSI_BG_BLACK           "\33[40m"
#define ANSI_BG_RED             "\33[41m"
#define ANSI_BG_GREEN           "\33[42m"
#define ANSI_BG_YELLOW          "\33[43m"
#define ANSI_BG_WHITE           "\33[47m"
#define ANSI_BG_BRIGHT_RED      "\33[41;1m"
#define ANSI_BG_BRIGHT_WHITE    "\33[47;1m"
#define ANSI_COL_BLACK          "\33[30m"
#define ANSI_COL_BRIGHT_BLACK   "\33[30;1m"
#define ANSI_COL_RED            "\33[31m"
#define ANSI_COL_GREEN          "\33[32m"
#define ANSI_COL_YELLOW         "\33[33m"
#define ANSI_COL_BLUE           "\33[34"
#define ANSI_COL_CYAN           "\33[36;1m"
#define ANSI_COL_WHITE          "\33[37m"
#define ANSI_COL_BRIGHT_RED     "\33[31;1m"
#define ANSI_COL_BRIGHT_BLUE    "\33[34;1m"
#define ANSI_ALL_RESET          "\33[0m"
#define ANSI_CLEAR_TERM         "\33c"
