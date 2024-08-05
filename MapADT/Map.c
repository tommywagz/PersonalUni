#include <assert.h>
#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include "Map.h"

#define MAX_NAME 35
// #define MAX_NAME 35: You shouldn't assume a maximum length for the name

struct neighbor {
    int name;
    struct neighbor *next;
};

struct city {
    int name; // city index name
    char realName[MAX_NAME]; // city's text name
    bool informant; // true if the informant is there, false if it isn't
    struct neighbor *neighborNext; // list of adjacent cities
    int neighbors; // number of neighbors
    int visits; // amount of times an agent has visited the city
};

struct map { 
    struct road* roads; // list of all roads
    struct city* cities; // list of all cities
    int numCities; // number of cities
    int numRoads; // number of roads
};

// Labelling struct fields with comments to describe their purpose is great :)
// A couple of things to look out for:
// - Avoid storing the same information in multiple places - you have a list of all roads in the map, but the 
//   cities also store a list of their own neighbours. This causes issues if you update one but forget to update
//   the other, so you have two things saying that a city has different neighbours. Try to keep a 'single source
//   of truth'
// - The Map is an ADT that doesn't need to know anything about the agents. Since the agent uses the map and not
//   the other way around, the agent should keep track of how many times it has visited the city, rather than
//   the map keeping track.
// - The name should be a dynamically allocated string as it can have arbitrary length.
// I haven't penalised you for these, just things to keep in mind for software design in future.

/**
 * Creates a new map with the given number of cities
 * Assumes that `numCities` is positive
 */
Map MapNew(int numCities) {
    struct city *newCities = malloc(sizeof(struct city) * numCities);
    Map newMap = malloc(sizeof(struct map));

    for (int i = 0; i < numCities; i++) {
        newCities[i].name = i;
        newCities[i].neighborNext = NULL;
        strcpy(newCities[i].realName, "unnamed");
        newCities[i].informant = false;
        newCities[i].visits = 0;
        newCities[i].neighbors = 0;
    }

    newMap->roads = NULL;
    newMap->cities = newCities;
    newMap->numCities = numCities;
    newMap->numRoads = 0;

    return newMap;
}

/**
 * Frees all memory allocated to the given map
 */
void MapFree(Map m) {
    // free every city's neighbors list then free the rest of the arrays
    for (int i = 0; i < MapNumCities(m); i++) {
        while (m->cities[i].neighborNext != NULL) {
            struct neighbor *temp = m->cities[i].neighborNext;
            m->cities[i].neighborNext = temp->next;
            free(temp);
        }        
        // free(m->cities[i].neighborNext);
    }
    free(m->cities);
    free(m->roads);
    free(m);
}

/**
 * Returns the number of cities on the given map
 */
int MapNumCities(Map m) {
    return m->numCities;
}

/**
 * Returns the number of roads on the given map
 */
int MapNumRoads(Map m) {
    return m->numRoads;
}

/**
 * Sets the name of the given city
 * If the city's name has already been set, renames it
 */
void MapSetName(Map m, int city, char *name) {
    struct city *cityList = m->cities;
    int i = 0;
    while (i < MapNumCities(m)) {
        if (cityList[i].name == city) {
            strcpy(cityList[i].realName, name);
        }
        i++;
    }
}

/**
 * Returns the name of the given city, or "unnamed" if the city's name
 * has not been set
 */
char *MapGetName(Map m, int city) {
    struct city *current = m->cities;
    int i = 0;
    while (i < MapNumCities(m)) {
        if (current[i].name == city) {
            return current[i].realName;
        }
        i++;
    }
    return "unnamed"; 
}

/**
 * Inserts a road between
