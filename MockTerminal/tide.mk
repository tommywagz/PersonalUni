CFLAGS =

ifneq (, $(shell which dcc))
CC	?= dcc
else
CC	?= clang
CFLAGS += -Wall
endif

EXERCISES	  += tide 

SRC = tide.c main.c
INCLUDES = tide.h commands.h escape.h

# if you add extra .c files, add them here
SRC +=

# if you add extra .h files, add them here
INCLUDES +=


tide:	$(SRC) $(INCLUDES)
	$(CC) $(CFLAGS) $(SRC) -o $@
