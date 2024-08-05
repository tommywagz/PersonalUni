#!/usr/bin/python3
#  agent.py
#  Nine-Board Tic-Tac-Toe Agent starter code
#  COMP3411/9814 Artificial Intelligence
#  CSE, UNSW

# The general process of my play function is to initially find all of the 
# possible moves within the current board being played on and weigh their 
# utilities. Every individual game will have it's own utility that is examined 
# every time the play function is called. These functions give a reference to 
# the general position each player has in each individual game. For example, if
# the middle right game was going in the the opponents favor, then when it is 
# the agent's turn, it will prioritize move 6 (given that it's a possible move)
# lower than the other current game's options. The higher priority moves will 
# be the moves which, their corresponding games have a utility value in the 
# player's favor. The utility check of each board also commits the boards that 
# have immediate potential losses (opposition has two in a row, col, or 
# diagonal without currently being blocked) to the killArray. The killArray 
# holds all of the moves that would currently result in an immediate loss given
# an optimal move in response.

# All of these moves however, are not taking into account the current game that
# is being played. To find the local ideal move, I used an alpha-beta search 
# similar to the one from the ttt.py file. With this move in mind I made sure
# that it's not in the current killArray. If it isn't, then it is brought to 
# the front of the legal moveset and returned as the best move.

import socket
import sys
import numpy as np

# a board cell can hold:
#   0 - Empty
#   1 - We played here
#   2 - Opponent played here
EMPTY = 0
X = 1
O = 2

MAX_MOVE = 9

# the boards are of size 10 because index 0 isn't used
boards = np.zeros((10, 10), dtype="int8")
s = [".","X","O"]
curr = 0 # this is the current board to play in


MIN_VAL = -100000
MAX_VAL = 100000

# print a row
def print_board_row(bd, a, b, c, i, j, k):
    print(" "+s[bd[a][i]]+" "+s[bd[a][j]]+" "+s[bd[a][k]]+" | " \
             +s[bd[b][i]]+" "+s[bd[b][j]]+" "+s[bd[b][k]]+" | " \
             +s[bd[c][i]]+" "+s[bd[c][j]]+" "+s[bd[c][k]])

# Print the entire board
def print_board(board):
    print_board_row(board, 1,2,3,1,2,3)
    print_board_row(board, 1,2,3,4,5,6)
    print_board_row(board, 1,2,3,7,8,9)
    print(" ------+-------+------")
    print_board_row(board, 4,5,6,1,2,3)
    print_board_row(board, 4,5,6,4,5,6)
    print_board_row(board, 4,5,6,7,8,9)
    print(" ------+-------+------")
    print_board_row(board, 7,8,9,1,2,3)
    print_board_row(board, 7,8,9,4,5,6)
    print_board_row(board, 7,8,9,7,8,9)
    print()

# choose a move to play
def play():
    # array to hold moves that will guaruntee a loss
    killArray = [] 
    
    # arrays hold all of the legal moves in the current board and
    # the associated utility of the move
    legals = currLegalMoves(curr)
    utilities = []
    
    # fill the utilities array
    for l in legals:
        utilities.append(checkUtilityOfBoard(l, killArray))
        
    # sort the legal moves by their utility
    legals = sortLegalMoves(legals, utilities)
    
    # conduct an alpha-beta search for the ideal local move
    m = -1
    player = 1 
    bestMove = np.zeros(10,dtype=np.int32)
    move = np.zeros(10,dtype=np.int32)
    while m < MAX_MOVE:
        m += 1
        player = 1 - player
        alphabeta(player, m, boards[curr], MIN_VAL, MAX_VAL, bestMove)
        move[m] = bestMove[m]
    
    # put the a-B search at beginning of legal moves if it is a legal move
    if (move[m] not in killArray and move[m] in legals):
        legals.insert(0, legals.pop(legals.index(m)))
    
    # remove any moves from the legals list also found in the killArray
    finalMoveSet = [x for x in legals if x not in killArray]
    bestMove = np.array(finalMoveSet)

    place(curr, bestMove[0], player)
    return bestMove[0]


####################################### HELPER FUNCTIONS #########################################

################# Connection Checkers #################

# alphabeta search to find the ideal move in the local board 
# currently being played on
def alphabeta(player, m, board, alpha, beta, bestMove):
    bestEval = MIN_VAL
    
    if (m >= 9):
        return alpha
    
    thisMove = 0
    for i in range (1, 10):
        if board[i] == EMPTY:
            thisMove = i
            board[thisMove] = player
            thisEval = -alphabeta(1 - player, m + 1, board, -beta, 
                                -alpha, bestMove)
            board[thisMove] = EMPTY
            
            if thisEval > bestEval:
                bestMove[m] = thisMove
                bestEval = thisEval
                if bestEval > alpha:
                    alpha = bestEval
                    if alpha >= beta:
                        return alpha
    
    if thisMove == 0:
        return 0
    else:
        return alpha    
        

# sort a list of legal moves by it's corresponding utility values
def sortLegalMoves(legals, utilities):
    combined = list(zip(utilities, legals))
    
    combined = sorted(combined, key=lambda x: x[0], reverse=True)
    
    utilities[:] = [x[0] for x in combined]
    legals[:] = [x[1] for x in combined]
    
    return legals

# Find the array of legal moves in the current board and return the array
def currLegalMoves(board):
    legals = []
    for n in range(1, 10):
        if (boards[board][n] == EMPTY):
            legals.append(n)
    
    return legals
            
# Board utility, returns the utility of a given board
def checkUtilityOfBoard(boardNum, killArray):
    return checkVerticals(boardNum, killArray) + \
    checkHorizontals(boardNum, killArray) + checkDiagonals(boardNum, killArray)


# check for vertical connections that the agent has in a given board
# Returns vertical utility evaluation value
def checkVerticals(board, killArray):
    X_2 = 0
    X_1 = 0
    O_2 = 0
    O_1 = 0
    
    # Check all three verticals on the board
    for v in range (1, 4):
        # Reset the temp values for the next vertical
        X_2Count = 0
        X_1Count = 0
        O_2Count = 0
        O_1Count = 0
        
        for r in range(v, v + 6, 3):
            # if our move/moves are found
            if (boards[board][r] == X):
                X_1Count += 1
                if (X_1Count % 2 == 0):
                    X_2Count += 1
                    X_1Count -= 1 
            
            # if opponent move is found
            elif (boards[board][r] == O):
                O_1Count += 1
                # 2 Os are found - add board to the killArray
                if (O_1Count % 2 == 0):
                    killArray.append(board)
                    O_2Count += 1
                    O_1Count -= 1 
                    
            # if a column has both an O and an X - move on to the next column
            if (O_1Count > 0 or O_2Count > 0) and \
                (X_1Count > 0 or X_2Count > 0):
                if board in killArray:
                    killArray.remove(board)
                break

            # add the single column's utiltity to the total comlum's utility
            X_2 += X_2Count
            X_1 += X_1Count
            O_2 += O_2Count
            O_1 += O_1Count
    
    # add to killArray if opposition has two moves in one column
    if (O_2 > 0 and board not in killArray):
        killArray.append(board)    
        
    return ((3*X_2 + X_1) - (3*O_2 + O_1))


# Check for horizontal Connections the agent has on a given board
# Returns the horizontal evalutation value
def checkHorizontals(board, killArray):
    X_2 = 0
    X_1 = 0
    O_2 = 0
    O_1 = 0
    
    # Check all 3 rows on the board
    for h in range (1, 4):
        X_2Count = 0
        X_1Count = 0
        O_2Count = 0
        O_1Count = 0
        
        for c in range(1, 4):
            # record our move/moves
            if (boards[board][3*(h - 1) + c] == X):
                X_1Count += 1
                if (X_1Count % 2 == 0):
                    X_2Count += 1
                    X_1Count -= 1
                    # check opposition moves
            elif (boards[board][3*(h - 1) + c] == O):
                O_1Count += 1
                # Upon having two opposing moves within a row, add to killArray
                if (O_1Count % 2 == 0):
                    killArray.append(board)
                    O_2Count += 1
                    O_1Count -= 1
                    
            # if a row has both an O and an X - remove from killArray
            if (O_1Count > 0 or O_2Count > 0) and \
                (X_1Count > 0 or X_2Count > 0):
                if board in killArray:
                    killArray.remove(board)
                break

            # add the single row's utiltity to the total row utility
            X_2 += X_2Count
            X_1 += X_1Count
            O_2 += O_2Count
            O_1 += O_1Count
        
    # Add to killArray if any row mas more than one opposing move
    if (O_2 > 0 and board not in killArray):
        killArray.append(board) 
                    
    return ((3*X_2 + X_1) - (3*O_2 + O_1))
    

# Check for diagonal Connections the agent has on a given board
# Returns the horizontal utility value
def checkDiagonals(board, killArray):
    X_2Count = 0
    X_1Count = 0
    O_2Count = 0
    O_1Count = 0
    
    # Top left to bottom right diagonal check
    for d in range (1, 10, 4):
        if (boards[board][d] == X):
            X_1Count += 1
            if (X_1Count % 2 == 0):
                X_2Count += 1
                X_1Count -= 1
                
        elif (boards[board][4] == O):
            O_1Count += 1
            if (O_1Count % 2 == 0):
                O_2Count += 1
                O_1Count -= 1
                killArray.append(board)

        if (O_1Count > 0 or O_2Count > 0) and (X_1Count > 0 or X_2Count > 0):
            if board in killArray:
                killArray.remove(board)
            X_2Count = 0
            X_1Count = 0
            O_2Count = 0
            O_1Count = 0
            break
                       
    # Top right to bottom left 
    for d in range (3, 8, 2):
        if (boards[board][d] == 1): 
            X_1Count += 1
            if (X_1Count % 2 == 0):
                X_2Count += 1
                X_1Count -= 1
                   
        elif (boards[board][d] == 2):
            O_1Count += 1
            if (O_1Count % 2 == 0):
                O_2Count += 1
                O_1Count -= 1
                killArray.append(board)
                
        if (O_1Count > 0 or O_2Count > 0) and (X_1Count > 0 or X_2Count > 0):
            if board in killArray:
                killArray.remove(board)
            X_2Count = 0
            X_1Count = 0
            O_2Count = 0
            O_1Count = 0
            break
    
    if (O_2Count > 0 and board not in killArray):
        killArray.append(board) 
    
    return ((3*X_2Count + X_1Count) - (3*O_2Count + O_1Count))


# place a move in the global boards
def place( board, num, player ):
    global curr
    curr = num
    boards[board][num] = player

# read what the server sent us and
# parse only the strings that are necessary
def parse(string):
    if "(" in string:
        command, args = string.split("(")
        args = args.split(")")[0]
        args = args.split(",")
    else:
        command, args = string, []

    # init tells us that a new game is about to begin.
    # start(x) or start(o) tell us whether we will be playing first (x)
    # or second (o); we might be able to ignore start if we internally
    # use 'X' for *our* moves and 'O' for *opponent* moves.

    # second_move(K,L) means that the (randomly generated)
    # first move was into square L of sub-board K,
    # and we are expected to return the second move.
    if command == "second_move":
        # place the first move (randomly generated for opponent)
        place(int(args[0]), int(args[1]), 2)
        return play()  # choose and return the second move

    # third_move(K,L,M) means that the first and second move were
    # in square L of sub-board K, and square M of sub-board L,
    # and we are expected to return the third move.
    elif command == "third_move":
        # place the first move (randomly generated for us)
        place(int(args[0]), int(args[1]), 1)
        # place the second move (chosen by opponent)
        place(curr, int(args[2]), 2)
        return play() # choose and return the third move

    # nex_move(M) means that the previous move was into
    # square M of the designated sub-board,
    # and we are expected to return the next move.
    elif command == "next_move":
        # place the previous move (chosen by opponent)
        place(curr, int(args[0]), 2)
        return play() # choose and return our next move

    elif command == "win":
        print("Yay!! We win!! :)")
        return -1

    elif command == "loss":
        print("We lost :(")
        return -1

    return 0

# connect to socket
def main():
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    port = int(sys.argv[2]) # Usage: ./agent.py -p (port)

    s.connect(('localhost', port))
    while True:
        text = s.recv(1024).decode()
        if not text:
            continue
        for line in text.split("\n"):
            response = parse(line)
            if response == -1:
                s.close()
                return
            elif response > 0:
                s.sendall((str(response) + "\n").encode())

if __name__ == "__main__":
    main()
