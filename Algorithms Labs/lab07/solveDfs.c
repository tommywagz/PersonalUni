// Thomas Wagner
// z5436162
// 17/7/2023
// Lab 7 Task 2 Implementation
// DFS maze solver 

#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include "cell.h"
#include "matrix.h"
#include "Maze.h"
#include "Stack.h"

bool solve(Maze m) {
    struct cell source = MazeGetStart(m);
    int width = MazeWidth(m);
    int height = MazeHeight(m);

    bool** visited = createBoolMatrix(height, width);
    struct cell** predecessor = createCellMatrix(height, width);

    // Initialize the stack
    Stack mainStack = StackNew();
    StackPush(mainStack, source);

    // Add neighbors to the stack after popping and examining for exit
    while(!StackIsEmpty(mainStack)) {
        struct cell vertex = StackPop(mainStack);

        if (MazeVisit(m, vertex)) {
            while (vertex.row != source.row || vertex.col != source.col) {
                MazeMarkPath(m, vertex);
                vertex = predecessor[vertex.row][vertex.col];
            }
            MazeMarkPath(m, vertex);

            StackFree(mainStack);
            freeBoolMatrix(visited);
            freeCellMatrix(predecessor);
            return true;
        }

        if (visited[vertex.row][vertex.col] == true) {
            continue;
        }
        visited[vertex.row][vertex.col] = true;

        int neighborRows[] = {0, 0, -1, 1};
        int neighborCols[] = {-1, 1, 0, 0};

        for (int i = 0; i < 4; i++) {
            int curRow = vertex.row + neighborRows[i];
            int curCol = vertex.col + neighborCols[i];
            struct cell curCell = {curRow, curCol};

            if (curRow >= 0 && curRow <= height && 
            curCol >= 0 && curCol <= width &&
            !MazeIsWall(m, curCell) && visited[curRow][curCol] == false) {
                predecessor[curRow][curCol] = vertex;
                StackPush(mainStack, curCell);
            }
        }
    }

    StackFree(mainStack);
    freeBoolMatrix(visited);
    freeCellMatrix(predecessor);
    return false;
}

