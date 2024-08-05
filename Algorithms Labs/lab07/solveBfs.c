// Thomas Wagner
// z5436162
// 16/7/23
// Lab07 Task 1 Implementation
// BFS maze solver

#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include "cell.h"
#include "matrix.h"
#include "Maze.h"
#include "Queue.h"

bool solve(Maze m) {
    struct cell source = MazeGetStart(m);
    int width = MazeWidth(m);
    int height = MazeHeight(m);

    bool** visited = createBoolMatrix(height, width);
    struct cell** predecessor = createCellMatrix(height, width);
    
    Queue mainQueue = QueueNew();
    QueueEnqueue(mainQueue, source);

    visited[source.row][source.col] = true;

    while (!QueueIsEmpty(mainQueue)) {
        struct cell vertex = QueueDequeue(mainQueue);
        
        // check for the exit amd traceback if true
        if (MazeVisit(m, vertex)) {
            while (vertex.row != source.row || vertex.col != source.col) {
                MazeMarkPath(m, vertex);
                vertex = predecessor[vertex.row][vertex.col];
            }
            MazeMarkPath(m, vertex);

            QueueFree(mainQueue);
            freeBoolMatrix(visited);
            freeCellMatrix(predecessor);
            return true;
        }

        // All other adjacent spaces that are not walls
        // and havn't have not been visited are queued and are within the bounds
        int neighborRows[] = {-1, 1, 0, 0};
        int neighborCols[] = {0, 0, -1, 1};

        for (int i = 0; i < 4; i++) {
            int newRow = vertex.row + neighborRows[i];
            int newCol = vertex.col + neighborCols[i];
            struct cell newCell = {newRow, newCol};

            if (newRow >= 0 && newCol >= 0 && 
            newCol <= width && newRow <= height && 
            !MazeIsWall(m, newCell) && 
            visited[newRow][newCol] == false) {
                visited[newRow][newCol] = true;
                predecessor[newRow][newCol] = vertex;
                QueueEnqueue(mainQueue, newCell);
            }
        }
    }

    QueueFree(mainQueue);  
    freeCellMatrix(predecessor);  
    freeBoolMatrix(visited);
    return false;
}
