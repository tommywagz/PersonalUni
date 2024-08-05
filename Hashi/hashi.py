# !/usr/bin/python3.12.2
# Thomas Wagner
# z5436162
# 28/2/24
# Hashi Puzzle Algorithm

# Question: Briefly describe how your program works, including any 
# algorithms and data structures employed, and explain any design decisions 
# you made along the way.

# Answer: The basis of the solution is based on the idea of arc consistency
# based in an adjacency list of given islands. Most hashi starter maps 
# will start with a few guarunteed bridges. Making these bridges in turn 
# creates more guarunteed bridges and the cycle continues. The 'arcs' link
# nodes to their neighbors, which are linked to their neighbors and so on.
# Each node only has so many combinations of bridges for each neighboring node. 
#
# On top of the adjacency list I also have a central Map object that houses 
# lists of all of the islands and all of the bridges in the game. The island
# objects themselves have every data element required to figure out how many 
# bridges need to be placed to each of it's neighbors. The directions array element
# of the islands describes how many bridges there currently are to the neighbor
# dictated by the index of the array, [north, east, south, west]. The island also
# has an array of the other island objects that are neighboring it in the same
# fashion as the directions array. 
#
# The puzzle will almost always come with a certain amount of guarunteed brigdges
# that can be placed given on the island's working value (the constantly updating
# value as opposed to it's starting value) and the number of neighbors it has. 
# After placing all of the bridges that are guarunteed without involving any backtracking
# the DFS begins. 
#
# The recursive 'DFS' begins with the first positive value coming from the top left of the
# game grid and bridging the neighbor with the highest working value with one 
# plank. The process of bridging to the neighbor with the highest working value
# repeats until there are no more direct neighbors to bridge to or the puzzle is
# solved. In the case where the puzzle is out of legal moves but not done with 
# the puzzle, the last bridge is removed and another path is chosen.


import numpy as np
import sys
from collections import defaultdict


class Map:
    def __init__(
        map,
        game,
        rows,
        cols,
    ):
        map.game = game
        map.islandCount = 0
        map.gridVal = 0
        map.rows = rows
        map.cols = cols
        map.islands = []
        map.bridges = []
        map.adjacencyList = {}
        
class Island:
    def __init__(
        island, 
        orderNum,
        startingVal,
        rowNum,
        colNum,
    ):
        island.orderNum = orderNum
        island.startingVal = startingVal
        island.workingVal = startingVal
        island.neighbors = [None, None, None, None]
        island.directions = [-1, -1, -1, -1]
        island.numNeighbors = 0
        island.eligible = True
        island.rowNum = rowNum
        island.colNum = colNum

class Bridge:
    def __init__(
        bridge,
        row1,
        col1,
        row2,
        col2,
    ):
        bridge.row1 = row1
        bridge.col1 = col1
        bridge.row2 = row2
        bridge.col2 = col2
        bridge.plankNum = 0




def main():
    code = ".123456789abc"
    nrow, ncol, map_game = scan_map()
    # for r in range(nrow):
    #     for c in range(ncol):
    #         print(code[map_game[r][c]],end="")
    #     print()
    
    # print()
    
    # Create the game object along with its elements
    map = Map(map_game, nrow, ncol)
    setup(map)
    
    adjList, totalIslands = createAdjList(map)
    map.adjacencyList = adjList
    map.islandCount = totalIslands
     
    # guaruntees loop       
    startingGuarunteedPlanks(map)
    
    # DFS if neeeded
    # if not checkSolved(map): 
    #     startingIsland = getFirstDfsIsland(map)
    #     solve(map, startingIsland)
    
    print()    
    printResult(map)
    
    

#   Constraint check each placed bridge after it is placed
#   


#######################################################################################
################################ SETUP AND ORGANIZATION ###############################
#######################################################################################

# takes in an empty intialized map and fills it's islands and count elements
def setup(map):   
    game = map.game
    # make the list of island and count them
    islandCount = 0
    islandVal = 0
    for i in range(map.rows):
        for j in range(map.cols):
            if map.game[i, j] != 0:
                islandCount += 1
                islandVal += game[i, j]
                
                currentIsland = Island(islandCount, game[i, j], i, j)
                
                map.islands.append(currentIsland)       
                
    map.islandCount = islandCount
    map.gridVal = islandVal
  
# Scan the hashi puzzle from standard output and store as 2D numpy  
def scan_map():
    text = []
    for line in sys.stdin:
        row = []
        for ch in line:
            n = ord(ch)
            if n >= 48 and n <= 57:    # between '0' and '9'
                row.append(n - 48)
            elif n >= 97 and n <= 122: # between 'a' and 'z'
                row.append(n - 87)
            elif ch == '.':
                row.append(0)
        text.append(row)

    nrow = len(text)
    ncol = len(text[0])

    map = np.zeros((nrow,ncol),dtype=np.int32)
    for r in range(nrow):
        for c in range(ncol):
            map[r,c] = text[r][c]
    
    return nrow, ncol, map
    
# creates an adjacency list from the Game numpy returns the number of islands, 
# the adjacency list, and the dictionary of the islands (key: orderNum, value: island)
def createAdjList(map):
    adjList = defaultdict(list)
    node_dict = {}
    
    islandCount = 0
    for island in map.islands:
        islandCount += 1
        node_dict[islandCount] = island
        
        row = island.rowNum
        col = island.colNum
        
        adjList[islandCount].append(island)
        
        # scan each direction for a non-0 tile or the bound of the square
        directions = scanForNeighbors(map, row, col)
        
        if (directions[0] != -1):
            northIsland = findIslandByCoordinate(map, row - directions[0], col)
            adjList[islandCount].append(northIsland) 
            island.neighbors[0] = northIsland 
            island.directions[0] = 0
            
        if (directions[1] != -1):
            eastIsland = findIslandByCoordinate(map, row, col + directions[1])
            adjList[islandCount].append(eastIsland)
            island.neighbors[1] = eastIsland
            island.directions[0] = 0
            
        if (directions[2] != -1):
            southIsland = findIslandByCoordinate(map, row + directions[2], col)
            adjList[islandCount].append(southIsland)
            island.neighbors[2] = southIsland
            island.directions[0] = 0
            
        if (directions[3] != -1):
            westIsland = findIslandByCoordinate(map, row, col - directions[3])
            adjList[islandCount].append(westIsland)
            island.neighbors[3] = westIsland
            island.directions[0] = 0

    
        island.numNeighbors = len(adjList[islandCount])
    
    return adjList, islandCount

# Given a coordinate, returns an array of the neighbors' distances from and how far away they are
def scanForNeighbors(map, row, col):
    Game = map.game
    GameWidth = map.cols
    GameHeight = map.rows
    neighborDistances = [0, 0, 0, 0]
    for direction in range(4):
        dist = 1
        if (direction == 0):
            currRow = row - 1
            while (currRow >= 0):
                if (Game[currRow, col] != 0):
                    neighborDistances[direction] = dist
                    break
                currRow -= 1
                dist += 1
                
        elif (direction == 1):
            currCol = col + 1
            while (currCol <= GameWidth - 1):
                if (Game[row, currCol] != 0): 
                    neighborDistances[direction] = dist
                    break
                currCol += 1
                dist += 1
            
        elif (direction == 2):
            currRow = row + 1
            while (currRow <= GameHeight - 1):
                if (Game[currRow, col] != 0): 
                    neighborDistances[direction] = dist
                    break
                currRow += 1
                dist += 1
                
        elif (direction == 3):
            currCol = col - 1
            while (currCol >= 0):
                if (Game[row, currCol] != 0):
                    neighborDistances[direction] = dist
                    break
                currCol -= 1
                dist += 1
                
    
                
    return neighborDistances

######################################################################################
##################################### MAIN LOGIC #####################################
######################################################################################
# main loop:
#   Bridge all guarunteed planks (when a bridge is placed and both island's
#   working value is reduced, ):
#       - floating values (1's, 2's, 3's)
#       - island with 2 eligible neighbors and WV >= 4 - bridge both neighbors
#       - island with 3 eligible neighbors and WV >= 7 = bridge all neighbors twice
#       - 'c' - triple bridge every direction
#       - 'a' or 'b' - single bridge in every direction
#       - if island has positive working value and one 
#         remaining eligible neighbor, bridge them till island's completion
#       - any island with 'n' neighbors with working values of 1 and 
#         a working value of 'n' place planks to each neighbor
#       - if an island has 'n' eligible neighbors and SV-WV = n 
#         plank each eligible neighbor 
#       - island with 'n' eligible neighbors and WV >= 3n -> triple bridge each neighbor
#       - if island has 'n' eligible neighbors and WV >= n and >= 1


# Given an island and a list of its neighbors
# Bridge all of the guarunteed planks
def startingGuarunteedPlanks(map):  
    adj = map.adjacencyList
    
    tripleBridgeNeighbors(map, adj) 
    startingValueTheorems(map, adj)
    floatingValues(map, adj)

    guarunteedPlanks(map, adj)

def guarunteedPlanks(map, adj): 
    initialIslands = map.islands
    initialBridges = map.bridges
       
    tripleBridgeNeighbors(map, adj)   
    floatingValues(map, adj)
    doubleNeighborTheorem(map, adj)
    tripleNeighborTheorem(map, adj)
    wv1Neighbors(map, adj)
            
    if initialIslands == map.islands and initialBridges == map.bridges:
        return
    else:
        guarunteedPlanks(map)


# When given a fresh puzzle - add all of the guarunteed bridges regardless of 
# neighbor count
def startingValueTheorems(map, adj):
    # Big islands 
    cIslands(map, adj)
    aAndBIslands(map, adj)
    # double neighbor
    doubleNeighborTheorem(map, adj)
    # triple neighbor
    tripleNeighborTheorem(map, adj)
    
    
# LONE PAIR THEOREM
# Scan through the adjacency list and make sure any island with a neighbor list length
# of 1 fully bridges to that neighbor
def floatingValues(map, adj):  
    for island, neighbors in adj.items(): 
        isle = neighbors[0]
        if len(neighbors) == 2:           
            islandID = isle.orderNum
            neighborID = neighbors[1].orderNum
            
            addBridge(map, islandID, neighborID, isle.workingVal)       
                    
            
# Bridges an island with 2 eligible neighbors appropriately depending 
# on its working value
def doubleNeighborTheorem(map, adj):
    for isla, neighbors in adj.items():
        island = neighbors[0]
        if len(neighbors) == 3:
            if len(neighbors) == 3 and island.workingVal >= 5:
                for neighbor in neighbors:
                    if island != neighbor:
                        checkpoint(map, island, 2)
                        
            elif island.startingVal >= 4:
                for neighbor in neighbors:
                    if (island != neighbor and neighbor != None):
                        checkpoint(map, island, 1)


# Brdige island with 3 eligible neighbors and WV >= 7 twice
def tripleNeighborTheorem(map, adj):
    for isla, neighbors in adj.items(): 
        island = neighbors[0]
        if len(neighbors) == 4:
            if island.workingVal >= 8:
                for neighbor in neighbors:
                    if (island != neighbor):
                        checkpoint(map, island, 2)
            elif island.workingVal >= 7:
                for neighbor in neighbors:
                    if (island != neighbor):
                        checkpoint(map, island, 1)
                        
    
# Triple bridge in every direction if island 'c' 
def cIslands(map, adj):
    for island, neighbors in adj.items(): 
        isle = neighbors[0]
        if isle.workingVal == 12:
            for neighbor in neighbors:
                if (isle != neighbor):
                    checkpoint(map, isle, 3)


# Single bridge in every direction if island has working value of 10 or 11
def aAndBIslands(map, adj):
    for island, neighbors in adj.items(): 
        isle = neighbors[0] 
        if isle.workingVal == 10:
            for neighbor in neighbors:
                if (isle != neighbor):
                    checkpoint(map, isle, 1)
        elif isle.workingVal == 11:
            for neighbor in neighbors:
                if (isle != neighbors):
                    checkpoint(map, isle, 2)
                    
        
# For any island with 'n' neighbors which all have working values of 1 and 
# the island has a working value of 'n', place planks to each neighbor
def wv1Neighbors(map, adj):
    for island, neighbors in adj.items(): 
        isle = neighbors[0] 
        if isle.workingVal == len(neighbors) - 1:
            neighborsWithWvOf1 = all(neighbor.workingVal == 1 for neighbor in neighbors if neighbor != island)
            if neighborsWithWvOf1:
                for neighbor in neighbors:
                    if (isle != neighbor):
                        checkpoint(map, isle, 1)


# Island with 'n' eligible neighbors and WV = 3n -> triple bridge each neighbor
def tripleBridgeNeighbors(map, adj):
    count = 1
    for island, neighbors in adj.items():
        count += 1
        isle = neighbors[0]

        if isle.workingVal == 3*(len(neighbors) - 1):
            for neighbor in neighbors:
                if (isle != neighbor and neighbor != None):
                    checkpoint(map, isle, 3)

#       - if island has 'n' eligible neighbors and WV >= n and >= 1  

# Given an island, and the number of planks needed in each possible direction - 
# plank each needed direction
def checkpoint(map, island, planksNeeded):
    for i in range(4):
        if (0 < island.directions[i] < planksNeeded):
            addBridge(map, island.orderNum, island.neighbors[i].orderNum, planksNeeded - island.directions[i])

####################################################################################
#################################### DFS Logic #####################################
####################################################################################
#   If all guaruntees are filled and there is a 'fork'
#   (Fork found if after an entire guaruntee scan, no bridge is placed)
#       - Store fork state as most recent fork
#       - DFS!!!!!
#           - start at top left (first in adjList)
#           - bridge neighbor with highest working value
#           - recurse to that neighbor
#           --- IF WVs ARE THE SAME FOR NEIGHBORS - DEFAULT TO UP, RIGHT, DOWN, LEFT
#           REPEAT STEPS 2 AND 3
#           - if we reach an island with 0 WV, recurse to (URDL) 
#           W/OUT bridging the two islands 
#           --- IF we reach island with WV 0 and all neighbors are WV 0
#           then recurse to one up the adjList. If THAT is WV 0, go to its neighbors
#           then if the nieghbors are all WV 0, then recurse to the next adjList UP
#           and repeat until u reach the top -THEN go bottom


# Recursivley bridge the 'next island' 
def solve(map, island):
    if (checkSolved(map)):
        return True
    
    adj = map.adjacencyList
    for neighbor in adj[island.orderNum]:
        # print("neighbor coords: (%d, %d)" % (neighbor.rowNum, neighbor.colNum))
        if checkBridge(map, island, neighbor) != None:
            addPlank(map, island.orderNum, neighbor.orderNum)
            
            if solve(map, getNextIsland(map, island)):
                return True

            removePlank(island, neighbor)
            
    return False
            
# Returns the next needed island for the DFS search
def getNextIsland(map, island):
    num = island.orderNum
    if island.orderNum == len(map.islands):
        num = -1
    
    maybeNeighbor = map.islands[num + 1]
    
    if island.neighbors[0] != None:
        return island.neighbors[0]
    elif island.neighbors[1] != None:
        return island.neighbors[1]
    elif island.neighbors[2] != None:
        return island.neighbors[2]
    elif island.neighbors[3] != None:
        return island.neighbors[3]
        
    else:
        return getNextIsland(map, maybeNeighbor)
    
# Upon beginning a DFS, given the map, returns the first island with a positive
# working value 
def getFirstDfsIsland(map): 
    for island in map.islands:
        if island.workingVal > 0: 
            return island
        

################################# HELPER FUNCTIONS ################################

# given the orderNums of two islands and the number of planks to add to said bridge
def addBridge(map, orderNum1, orderNum2, plankCount):
    for i in range (plankCount):
        addPlank(map, orderNum1, orderNum2)
        
    printResult(map)

        
 
# given 2 islands, will make a bridge object and add planks binding the islands         
def addPlank(map, orderNum1, orderNum2):
    island1 = findIslandByOrderNum(map, orderNum1)
    island2 = findIslandByOrderNum(map, orderNum2)
        
    # One of these islands is already maxed out
    if island1.workingVal == 0 or island2.workingVal == 0:
        return
    
    # Island not found
    if island1 == None or island2 == None:
        return
    
    # if there isn't a bridge object between the islands, make one
    bridge = checkBridge(map, island1, island2)
    
    # Bridge is at capacity
    if bridge.plankNum == 3:
        return
    
    bridge.plankNum = bridge.plankNum + 1
    
    # alter each island's working value
    newWorking = island1.workingVal - 1
    island1.workingVal = newWorking
    
    newWorking = island2.workingVal - 1
    island2.workingVal = newWorking
    
    # Alter each island's direction and neighbors arrays appropriately 
    
    # Bridge is horizontal
    if island1.rowNum == island2.rowNum:
        if island1.colNum < island2.colNum:
            island1.directions[1] = island1.directions[1] + 1
            island2.directions[3] = island2.directions[3] + 1
            
            # island1.neighbors[1] = island2
            # island2.neighbors[3] = island1
            
        else:
            island1.directions[3] = island1.directions[3] + 1
            island2.directions[1] = island2.directions[1] + 1
    
            # island1.neighbors[3] = island2
            # island2.neighbors[1] = island1
            
    # Bridge is vertical
    elif island1.colNum == island2.colNum:
        if island1.rowNum < island2.rowNum:
            island1.directions[2] = island1.directions[2] + 1
            island2.directions[0] = island2.directions[0] + 1
            
            # island1.neighbors[2] = island2
            # island2.neighbors[0] = island1
            
        else:
            island1.directions[0] = island1.directions[0] + 1
            island2.directions[2] = island2.directions[2] + 1
    
            # island1.neighbors[0] = island2
            # island2.neighbors[2] = island1

    # constraint check the new bridge and backtrack if rule is broken
    if not allConstraintChecks(map):
        br = map.bridges[-1]
        i1 = findIslandByCoordinate(map, br.row1, br.col1)
        i2 = findIslandByCoordinate(map, br.row2, br.col2)
        removePlank(map, i1.orderNum, i2.orderNum)
        
    # nullify islands that have reached plank max
    if island1.workingVal == 0:
        nullifyIsland(map, island1.orderNum)
    if island2.workingVal == 0:
        nullifyIsland(map, island2.orderNum)
        

# Given the game map and the orderNums of the two islands connected by a bridge - 
# remove a plank from said bridge
def removePlank(map, orderNum1, orderNum2):
    island1 = findIslandByOrderNum(map, orderNum1)
    island2 = findIslandByOrderNum(map, orderNum2)
    
    # find the bridge in question and -1 from it's plank count
    bridge = checkBridge(map, island1, island2)
    if bridge.workingVal == 0:
        map.bridges.remove(bridge)
        return
    
    bridge.plankNum = bridge.plankNum - 1
    
    # Increase the working values of the islands
    island1.workingVal = island1.workingVal + 1
    island1.workingVal = island1.workingVal + 1
    
    # Change the islands' direction arrays appropriately
    if island1.rowNum == island2.rowNum:
        if island1.colNum < island2.colNum:
            island1.directions[1] = island1.directions[1] - 1
            island2.directions[3] = island2.directions[3] - 1      
            
        else:
            island1.directions[3] = island1.directions[3] - 1
            island2.directions[1] = island2.directions[1] -1
            
    elif island1.colNum == island2.colNum:
        if island1.rowNum < island2.rowNum:
            island1.directions[2] = island1.directions[2] - 1
            island2.directions[0] = island2.directions[0] - 1
            
        else:
            island1.directions[0] = island1.directions[0] - 1
            island2.directions[2] = island2.directions[2] - 1

    
    # If the Bridge has a working value of 0, remove the bridge from map
    if bridge.plankNum <= 0:
        map.bridges.remove(bridge)

# Returns an island by it's orderNum
def findIslandByOrderNum(map, orderNum):
    for island in map.islands:
        if island.orderNum == orderNum:
            return island  
    return None
        
# Returns an island by it's coordinates
def findIslandByCoordinate(map, row, col):
    for island in map.islands:
        if island.rowNum == row and island.colNum == col:
            return island
    return None
    
# Checks if there is already a bridge between two given islands
# returns the bridge if true and returns new bridge if false
def checkBridge(map, island1, island2):
    for bridge in map.bridges:
        if bridge.row1 == island1.rowNum and bridge.col1 == island1.colNum and bridge.row2 == island2.rowNum and bridge.col2 == island2.colNum:
            return bridge
        elif bridge.row1 == island2.rowNum and bridge.col1 == island2.colNum and bridge.row2 == island1.rowNum and bridge.col2 == island1.colNum:
            return bridge
        
    newBridge = Bridge(island1.rowNum, island1.colNum, island2.rowNum, island2.colNum)
    map.bridges.append(newBridge)
    return newBridge

# Given the orderNum of an island, make that island ineligable to bridge and remove if from 
# any other neighborLists it appears in and alter other island's directions array accordingly
def nullifyIsland(map, orderNum):
    adjList = map.adjacencyList
    island = findIslandByOrderNum(map, orderNum)
    
    island.eligible = False
    
    if island.numNeighbors > 0:
        neighbors = adjList[orderNum]
        for neighbor in neighbors:
            if neighbor != None and neighbor != island:
                nullifyNeighbor(adjList, neighbor, island)
        
        
# Given the adjacency list, an island, and one of the island's neighbors that must be nullified - 
# nullify it
def nullifyNeighbor(adjList, island, islandNeighbor):
    # subtract one from the island's numNeighbors
    island.numNeighbors = island.numNeighbors - 1
    
    # eliminate from island's neighbor list
    # adjList[island.orderNum].remove(islandNeighbor)
    
    neighborList = island.neighbors
    if islandNeighbor in neighborList:
        neighborList = [None if n == islandNeighbor else n for n in neighborList]
        island.neighbors = neighborList
            
    # delete value from the directions array
    if island.rowNum > islandNeighbor.rowNum:
        island.directions[0] = 0
    elif island.rowNum < islandNeighbor.rowNum:
        island.directions[1] = 0
    elif island.colNum > islandNeighbor.colNum:
        island.directions[2] = 0
    elif island.colNum < islandNeighbor.colNum:
        island.directions[3] = 0
    
    # delete from adjacency list
    # print("Island being nullified: %d with sv: %d" % (islandNeighbor.orderNum, islandNeighbor.startingVal))
    
    if islandNeighbor in adjList[island.orderNum]:
        adjList[island.orderNum].remove(islandNeighbor)
    
# Check if the puzzle is solved
def checkSolved(map):
    if (map.gridVal / 2 == len(map.bridges)):
        return True

############################## CONSTRAINT CHECKING ####################################

############# ALL FUNCTIONS RETURN FALSE IF CONSTRAINT IS BROKEN #####################

# All of the constraint checks for the current map of islands and bridges
def allConstraintChecks(map):
    for bridge in map.bridges:
        if not (scopeForIntersections(map, bridge) or checkBridgeIsSquare(bridge) or checkBridgePlankCount(bridge)):
            return False
        
    for island in map.islands:
        if not (checkIslandPlankCount(island) or islandNotIsolated(island)):
            return False
    
    return True

# Given a potential bridge - scope through the map and make sure it wont
# intersect with any previously placed bridges
# Return True if the bridge can be placed and False if it cannot
def scopeForIntersections(map, newBridge):
    bridges = map.bridges
    for bridge in bridges:
        if bridge != newBridge:
            continue
        elif not intersectionCheck(newBridge, bridge):
            continue
        else:
            return False
    
    return True
            
# Given two, bridges - returns true if there is an intersection and false if not
def intersectionCheck(bridge1, bridge2):
    # if both bridges are vertical or both horizontal
    if bridge1.row1 == bridge1.row2 and bridge2.row1 == bridge2.row2:
        return False
    if bridge1.col1 == bridge1.col2 and bridge2.col1 == bridge2.col2:
        return False
    
    # If bridge 1 is vertical and bridge 2 is horizontal and intersecting 
    if bridge1.col1 == bridge1.col2 and bridge2.row1 == bridge2.row2:
        # The row of the horizontal biridge is in between the rows of the vertical bridge
        if bridge1.row2 <= bridge2.row1 <= bridge1.row1 or bridge1.row1 < bridge2.row1 < bridge1.row2: 
            # The col of the vertical bridge is within the domain of the cols of the horizontal bridge
            if bridge2.col1 < bridge1.col1 < bridge2.col2 or bridge2.col2 < bridge1.col1 < bridge2.col1:
                return True
                
    # If bridge 2 is vertical and bridge 1 is horizontal and intersecting
    elif bridge2.col1 == bridge2.col2 and bridge1.row1 == bridge1.row2:
        # The row of the horizontal biridge is in between the rows of the vertical bridge
        if bridge2.row2 <= bridge1.row1 <= bridge2.row1 or bridge2.row1 < bridge1.row1 < bridge2.row2: 
            # The col of the vertical bridge is within the domain of the cols of the horizontal bridge
            if bridge1.col1 < bridge2.col1 < bridge1.col2 or bridge1.col2 < bridge2.col1 < bridge1.col1:
                return True
    
    else:
        return False
    
 
# Island can't have a plank count higher than its value
# Given an island, return true if it's legal and false if the island has more planks than starting value
def checkIslandPlankCount(island):
    total = 0
    for val in island.directions:
        if val > 3:
            # print("Island has more than 3 in a directions index")
            return False
        total += val
    
    if total > island.startingVal or island.workingVal < 0:
        return False
    
    return True

# Max of three planks to a bridge
# Given a bridge, make sure the plankCount is <= 3
def checkBridgePlankCount(bridge):
    if bridge.plankCount > 3:
        return False
    return True

#   bridges must run vertically and horizontally
def checkBridgeIsSquare(bridge):
    if bridge.row1 == bridge.row2 or bridge.col1 == bridge.col2:
        return True
    return False

#   --no need to make the graph fully connected--

# Bridge cannot isolate incomplete block - given an island return False if the island is isolated
def islandNotIsolated(island):
    if len(island.neighbors) <= 1:
        return False
    return True

# print result
#   make full 2D array of the given dimensions of spaces
#   fill the appropriate coordinates with the right number
#   fill in the right spaces with bridges with the right plank numbers
#   fill in the rest of the grid with ' '
def printResult(map):
    finalGame = np.full((map.rows, map.cols), ' ', dtype = np.str_)
    
    #Islands
    for island in map.islands:
        if (island.startingVal == 12):
            finalGame[island.rowNum, island.colNum] = "c"
        elif (island.startingVal == 11):
            finalGame[island.rowNum, island.colNum] = "b"
        elif (island.startingVal == 10):
            finalGame[island.rowNum, island.colNum] = "a"
        else:  
            finalGame[island.rowNum, island.colNum] = str(island.startingVal)

    for bridge in map.bridges:
        bridgeVal = ' '
                
        # Horizontal briges
        if bridge.row1 == bridge.row2:
            start = min(bridge.col1, bridge.col2)
            finish = max(bridge.col1, bridge.col2)  
            
            if bridge.plankNum == 1:
                bridgeVal = '-'
            elif bridge.plankNum == 2:
                bridgeVal = '='
            else:
                bridgeVal = 'E'
            
            for i in range (start + 1, finish):               
                finalGame[bridge.row1, i] = bridgeVal
           
        # Vertical Bridge 
        else:
            if bridge.plankNum == 1:
                bridgeVal = '|'
            elif bridge.plankNum == 2:
                bridgeVal = '"'
            else:
                bridgeVal = '#'
                
            start = min(bridge.row1, bridge.row2)
            finish = max(bridge.row1, bridge.row2)
    
            for i in range(start + 1, finish):
                finalGame[i, bridge.col1] = bridgeVal

    print()
    for row in finalGame:
        print(''.join(row))
    print()
    

if __name__ == '__main__':
    main()