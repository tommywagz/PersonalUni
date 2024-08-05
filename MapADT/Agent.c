// Implementation of the Agent ADT

#include <assert.h>
#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include "Agent.h"
#include "Map.h"

#define LEAST_TURNS 3
#define INFINITY 2147483647 // largest value an int can hold

struct node {
    int cityId;
    struct node *next;
};

typedef struct queue {
    struct node *head;
    struct node *tail;
} *Queue;

// This struct stores information about an individual agent and can be
// used to store information that the agent needs to remember.
struct agent {
    char *name;
    int startLocation;
    int location;
    int maxStamina; // max stamina
    int stamina;    // current stamina
    int strategy;
    Map map;

    int target;
    int *visits;    // index is cityID and value is the num of visits
    Queue dfsQueue; // queue of mapped out cities the agent must visit
    Queue shortQueue;
    bool stopDfs;
};

static struct move chooseRandomMove(Agent agent, Map m);
static int filterRoads(Agent agent, struct road roads[], int numRoads,
                       struct road legalRoads[]);
static struct move chooseCheapest(Agent agent, Map m);
static struct move chooseDFS(Agent agent, Map m);
static void mapDfs(Map m, Agent agent, int currCity);
static Queue QueueNew();
static void QueueEnqueue(Queue queue, int cityId);
static int QueueDequeue(Queue queue);
static bool QueueIsEmpty(Queue queue);
static void QueueFree(Queue queue);
static bool QueueContains(Queue queue, int city);
static int QueueGetFront(Queue queue);
static struct move chooseShortestPath(Agent agent, Map m);
static int* mapDijkstras(Agent agent, int start);
static int findMinDistance(Agent agent, int dist[], bool visited[], int numCities);


/**
 * Creates a new agent
 */
Agent AgentNew(int start, int stamina, int strategy, Map m, char *name) {
    if (start >= MapNumCities(m)) {
        fprintf(stderr, "error: starting city (%d) is invalid\n", start);
        exit(EXIT_FAILURE);
    }
    
    Agent agent = malloc(sizeof(struct agent));
    if (agent == NULL) {
        fprintf(stderr, "error: out of memory\n");
        exit(EXIT_FAILURE);
    }
    
    int *visits = calloc(MapNumCities(m), sizeof(int));
    
    agent->startLocation = start;
    agent->location = start;
    agent->maxStamina = stamina;
    agent->stamina = stamina;
    agent->strategy = strategy;
    agent->map = m;
    agent->name = strdup(name);
    agent->target = -1;
    agent->visits = visits;
    agent->dfsQueue = QueueNew();
    agent->shortQueue = QueueNew();
    agent->stopDfs = false;
    
    return agent;
}

/**
 * Frees all memory associated with the agent
 * NOTE: You should not free the map because the map is owned by the
 *       main program, and the main program will free it
 */
void AgentFree(Agent agent) {
    free(agent->name);
    free(agent->visits);

    while (!QueueIsEmpty(agent->dfsQueue)) {
        QueueDequeue(agent->dfsQueue);
    }
    QueueFree(agent->dfsQueue);

    while (!QueueIsEmpty(agent->shortQueue)) {
        QueueDequeue(agent->shortQueue);
    }
    QueueFree(agent->shortQueue);

    free(agent);
}

/**********************************************************************
 * Gets information about the agent
 * NOTE: It is expected that these functions do not need to be modified
 */

/**
 * Gets the name of the agent
 */
char *AgentName(Agent agent) {
    return agent->name;
}

/**
 * Gets the current location of the agent
 */
int AgentLocation(Agent agent) {
    return agent->location;
}

/**
 * Gets the amount of stamina the agent currently has
 */
int AgentStamina(Agent agent) {
    return agent->stamina;
}

/**********************************************************************
 * Making moves
 */

/**
 * Calculates the agent's next move
 * NOTE: Does NOT actually carry out the move
 */
struct move AgentGetNextMove(Agent agent, Map m) {
    switch (agent->strategy) { 
        case STATIONARY: return (struct move){agent->location, 0};
        case RANDOM:     return chooseRandomMove(agent, m);
        case CHEAPEST_LEAST_VISITED: return chooseCheapest(agent, m);
        case DFS:        return chooseDFS(agent, m);
        case LEAST_TURNS: return chooseShortestPath(agent, m);
        default:
            printf("error: strategy not implemented yet\n");
            exit(EXIT_FAILURE);
    }
}

static struct move chooseRandomMove(Agent agent, Map m) {
    struct road *roads = malloc(MapNumCities(m) * sizeof(struct road));
    struct road *legalRoads = malloc(MapNumCities(m) * sizeof(struct road));

    // Get all roads to adjacent cities
    int numRoads = MapGetRoadsFrom(m, agent->location, roads);
    
    // Filter out roads that the agent does not have enough stamina for
    int numLegalRoads = filterRoads(agent, roads, numRoads, legalRoads);

    struct move move;
    if (numLegalRoads > 0) {
        // Sort the roads using insertion sort
        for (int i = 1; i < numLegalRoads; i++) {
            struct road r = legalRoads[i];
            int j = i;
            while (j > 0 && r.to < legalRoads[j - 1].to) {
                legalRoads[j] = legalRoads[j - 1];
                j--;
            }
            legalRoads[j] = r;
        }
        
        // nextMove is randomly chosen from the legal roads
        int k = rand() % numLegalRoads;
        move = (struct move){legalRoads[k].to, legalRoads[k].length};
    } else {
        // The agent must stay in the same location
        move = (struct move){agent->location, 0};
    }
    
    free(legalRoads);
    free(roads);
    return move;
}

// Takes an array with all the possible roads and puts the ones the agent
// has enough stamina for into the legalRoads array
// Returns the number of legal roads
static int filterRoads(Agent agent, struct road roads[], int numRoads,
                       struct road legalRoads[]) {
    int numLegalRoads = 0;
    for (int i = 0; i < numRoads; i++) {
        if (roads[i].length <= agent->stamina) {
            legalRoads[numLegalRoads++] = roads[i];
        }
    }
    return numLegalRoads;
}

/*
First agent move set implementation of cheapest and least visited.
For every neighbor that is cheap
*/
static struct move chooseCheapest(Agent agent, Map m) {
    int start = AgentLocation(agent);
    struct road *roads = malloc(MapNumCities(m) * sizeof(struct road));
    struct road *legalRoads = malloc(MapNumCities(m) * sizeof(struct road));
    struct move newMove = {start, 0};

    // Get all roads to adjacent cities stored in 'roads' and filter them
    int numRoads = MapGetRoadsFrom(m, start, roads);
    int numLegalRoads = filterRoads(agent, roads, numRoads, legalRoads);
    if (numLegalRoads == 0) {
        free(roads);
        free(legalRoads);
        return newMove;
    }

    // find the city that has been visited the least. If there are numerous
    // 'cheapest' cities then the destination becomes the city that is closest
    int destination;
    int stamina;
    int leastVisited = agent->visits[legalRoads[0].to]; 
    for (int i = 0; i < numLegalRoads; i++) {
        int dest = legalRoads[i].to;
        if (start == dest) {
            dest = legalRoads[i].from;
        }

        int stam = legalRoads[i].length;
        int visitNum = agent->visits[dest];

        if (visitNum == 0) {
            destination = dest;
            stamina = stam;
            break;
        }
        else if (leastVisited >= visitNum) {
            leastVisited = visitNum;
            destination = dest;
            stamina = stam;

        }
    }

    newMove.to = destination;
    newMove.staminaCost = stamina;
    
    free(roads);
    free(legalRoads);
    return newMove;
}

/**
 * Implements the DFS strategy for the inspectors to catch the thief
 */
static struct move chooseDFS(Agent agent, Map m) {
    struct move newMove = {agent->location, 0};

    if (QueueIsEmpty(agent->dfsQueue)) {
        mapDfs(m, agent, agent->location);
    } 

    // dequeue next city from the queue and visit it if possible
    // if not, rest at current city    
    else {
        int front = QueueGetFront(agent->dfsQueue);
        int distance = MapContainsRoad(m, front, agent->location);
        if (distance < agent->stamina) {
            int cityId = QueueDequeue(agent->dfsQueue);
            newMove.to = cityId;
            new
