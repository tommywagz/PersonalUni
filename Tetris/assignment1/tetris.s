########################################################################
# COMP1521 23T3 -- Assignment 1 -- Tetris!
#
#
# !!! IMPORTANT !!!
# Before starting work on the assignment, make sure you set your tab-width to 8!
# It is also suggested to indent with tabs only.
# Instructions to configure your text editor can be found here:
#   https://cgi.cse.unsw.edu.au/~cs1521/23T3/resources/mips-editors.html
# !!! IMPORTANT !!!
#
#
# This program was written by Thomas Wagner (z5436162)
# on INSERT-DATE-HERE
#
# Version 1.0 (2023-09-25): Team COMP1521 <cs1521@cse.unsw.edu.au>
#
########################################################################

#![tabsize(8)]

# ##########################################################
# ####################### Constants ########################
# ##########################################################

# C constants
FIELD_WIDTH  = 9
FIELD_HEIGHT = 15
PIECE_SIZE   = 4
NUM_SHAPES   = 7

FALSE = 0
TRUE  = 1

EMPTY = ' '

# NULL is defined in <stdlib.h>
NULL  = 0

# Other useful constants
SIZEOF_INT = 4

COORDINATE_X_OFFSET = 0
COORDINATE_Y_OFFSET = 4
SIZEOF_COORDINATE = 8

SHAPE_SYMBOL_OFFSET = 0
SHAPE_COORDINATES_OFFSET = 4
SIZEOF_SHAPE = SHAPE_COORDINATES_OFFSET + SIZEOF_COORDINATE * PIECE_SIZE


	.data
# ##########################################################
# #################### Global variables ####################
# ##########################################################

# !!! DO NOT ADD, REMOVE, OR MODIFY ANY OF THESE DEFINITIONS !!!

shapes:				# struct shape shapes[NUM_SHAPES] = ...
	.byte 'I'
	.word -1,  0,  0,  0,  1,  0,  2,  0
	.byte 'J'
	.word -1, -1, -1,  0,  0,  0,  1,  0
	.byte 'L'
	.word -1,  0,  0,  0,  1,  0,  1, -1
	.byte 'O'
	.word  0,  0,  0,  1,  1,  1,  1,  0
	.byte 'S'
	.word  0,  0, -1,  0,  0, -1,  1, -1
	.byte 'T'
	.word  0,  0,  0, -1, -1,  0,  1,  0
	.byte 'Z'
	.word  0,  0,  1,  0,  0, -1, -1, -1

# Note that semantically global variables without
# an explicit initial value should be be zero-initialised.
# However to make testing earlier functions in this
# assignment easier, some global variables have been
# initialised with other values. Correct translations
# will always write to those variables befor reading,
# meaning the difference shouldn't matter to a finished
# translation.

next_shape_index:		# int next_shape_index = 0;
	.word 0

shape_coordinates:		# struct coordinate shape_coordinates[PIECE_SIZE];
	.word -1,  0,  0,  0,  1,  0,  2,  0

piece_symbol:			# char piece_symbol;
	.byte	'I'

piece_x:			# int piece_x;
	.word	3

piece_y:			# int piece_y;
	.word	1

piece_rotation:			# int piece_rotation;
	.word	0

score:				# int score = 0;
	.word	0

game_running:			# int game_running = TRUE;
	.word	TRUE

field:				# char field[FIELD_HEIGHT][FIELD_WIDTH];
	.byte	0:FIELD_HEIGHT * FIELD_WIDTH


# ##########################################################
# ######################### Strings ########################
# ##########################################################

# !!! DO NOT ADD, REMOVE, OR MODIFY ANY OF THESE STRINGS !!!

str__print_field__header:
	.asciiz	"\n/= Field =\\    SCORE: "
str__print_field__next:
	.asciiz	"     NEXT: "
str__print_field__footer:
	.asciiz	"\\=========/\n"

str__new_piece__game_over:
	.asciiz	"Game over :[\n"
str__new_piece__appeared:
	.asciiz	"A new piece has appeared: "

str__compute_points_for_line__tetris:
	.asciiz	"\n*** TETRIS! ***\n\n"

str__choose_next_shape__prompt:
	.asciiz	"Enter new next shape: "
str__choose_next_shape__not_found:
	.asciiz	"No shape found for "

str__main__welcome:
	.asciiz	"Welcome to 1521 tetris!\n"

str__show_debug_info__next_shape_index:
	.asciiz	"next_shape_index = "
str__show_debug_info__piece_symbol:
	.asciiz	"piece_symbol     = "
str__show_debug_info__piece_x:
	.asciiz	"piece_x          = "
str__show_debug_info__piece_y:
	.asciiz	"piece_y          = "
str__show_debug_info__game_running:
	.asciiz	"game_running     = "
str__show_debug_info__piece_rotation:
	.asciiz	"piece_rotation   = "
str__show_debug_info__coordinates_1:
	.asciiz	"coordinates["
str__show_debug_info__coordinates_2:
	.asciiz	"]   = { "
str__show_debug_info__coordinates_3:
	.asciiz	", "
str__show_debug_info__coordinates_4:
	.asciiz	" }\n"
str__show_debug_info__field:
	.asciiz	"\nField:\n"
str__show_debug_info__field_indent:
	.asciiz	":  "

str__game_loop__prompt:
	.asciiz	"  > "
str__game_loop__quitting:
	.asciiz	"Quitting...\n"
str__game_loop__unknown_command:
	.asciiz	"Unknown command!\n"
str__game_loop__goodbye:
	.asciiz	"\nGoodbye!\n"

# !!! Reminder to not not add to or modify any of the above !!!
# !!! strings or any other part of the data segment.        !!!



############################################################
####                                                    ####
####   Your journey begins here, intrepid adventurer!   ####
####                                                    ####
############################################################

################################################################################
#
# Implement the following functions,
# and check these boxes as you finish implementing each function.
#
#  SUBSET 0
#  - [x] main
#  - [x] rotate_left
#  - [x] move_piece
#  SUBSET 1
#  - [x] compute_points_for_line
#  - [x] setup_field
#  - [x] choose_next_shape
#  SUBSET 2
#  - [x] print_field
#  - [x] piece_hit_test
#  - [x] piece_intersects_field
#  - [x] rotate_right
#  SUBSET 3
#  - [x] place_piece
#  - [x] new_piece
#  - [x] consume_lines
#  PROVIDED
#  - [X] show_debug_info
#  - [X] game_loop
#  - [X] read_char


################################################################################
# .TEXT <main>
        .text
main:
        # Subset:   0
        #
        # Args:     None
        #
        # Returns:  $v0: int
        #
        # Frame:    [...]
        # Uses:     [...]
        # Clobbers: [...]
        #
        # Locals:
        #   - ...
        #
        # Structure:
        #   main
        #   -> [prologue]
        #       -> body
        #   -> [epilogue]

main__prologue:
	begin
	push	$ra

main__body:
	li	$v0, 4
	la	$a0, str__main__welcome
	syscall						# printf("Welcome to 1521 tetris!\n");

	jal	setup_field				# setup_field()

	li	$a0, FALSE				
	jal	new_piece				# new_piece(FALSE)

	jal 	game_loop				# game_loop()

	li	$v0, 0					# return 0

main__epilogue:
	pop	$ra
	end
	
        jr      $ra


################################################################################
# .TEXT <rotate_left>
        .text
rotate_left:
        # Subset:   0
        #
        # Args:     None
        #
        # Returns:  None
        #
        # Frame:    [...]
        # Uses:     [...]
        # Clobbers: [...]
        #
        # Locals:
        #   - ...
        #
        # Structure:
        #   rotate_left
        #   -> [prologue]
        #       -> body
        #   -> [epilogue]

rotate_left__prologue:
	begin
	push $ra

rotate_left__body:
	jal	rotate_right				# rotate_right()
	jal	rotate_right				# rotate_right()
	jal	rotate_right				# rotate_right()
rotate_left__epilogue:
	pop	$ra
	end
        jr      $ra



################################################################################
# .TEXT <move_piece>
        .text
move_piece:
        # Subset:   0
        #
        # Args:
        #    - $a0: int dx
        #    - $a1: int dy
        #
        # Returns:  $v0: int
        #
        # Frame:    [...]
        # Uses:     [...]
        # Clobbers: [...]
        #
        # Locals:
	#   - $t1: dx placeholder
	#   - $t2: dy placeholder
        #   - $t3: piece_x placeholder
	#   - $t4: piece_y placeholder
        #
        # Structure:
        #   move_piece
        #   -> [prologue]
        #       -> body
        #   -> [epilogue]

move_piece__prologue:
	begin	
	push 	$ra
	push	$s1
	push	$s2
	push	$s3
	push	$s4


move_piece__body:
	move	$s1, $a0				# int x = dx
	move	$s2, $a1				# int y = dy

	lw	$s3, piece_x				# int currentX = piece_x
	lw	$s4, piece_y				# int currentY = piece_y

	add	$s3, $s3, $s1				# currentX += x
	add	$s4, $s4, $s2				# currentY += y

	sw	$s3, piece_x				# piece_x = currentX
	sw	$s4, piece_y				# piece_y = currentY

	jal	piece_intersects_field			# result = piece_intersects_field

	bnez	$v0, piece_intersection_true		# if (result) {
	j	piece_intersection_false

piece_intersection_true:
	sub	$s3, $s3, $s1				# currentX -= x
	sub	$s4, $s4, $s2				# currentY -= y


	li	$v0, FALSE	
	j	move_piece__epilogue			# return FALSE

piece_intersection_false:
	li	$v0, TRUE				# return TRUE

move_piece__epilogue:
	sw	$s3, piece_x				# piece_x = currentX
	sw	$s4, piece_y				# piece_y = currentY

	pop	$s4
	pop	$s3
	pop	$s2
	pop	$s1
	pop	$ra
	end

        jr      $ra


################################################################################
# .TEXT <compute_points_for_line>
        .text
compute_points_for_line:
        # Subset:   1
        #
        # Args:
        #    - $a0: int bonus
        #
        # Returns:  $v0: int
        #
        # Frame:    [...]
        # Uses:     [...]
        # Clobbers: [...]
        #
        # Locals:
        #   - $t1: 100
	#   - $t2: returnAmount
        #
        # Structure:
        #   compute_points_for_line
        #   -> [prologue]
        #       -> body
        #   -> [epilogue]

compute_points_for_line__prologue:
	begin
	push	$ra
	push	$s1

compute_points_for_line__body:
	move	$s1, $a0				
	beq	$s1, 4, bonus				# if (bonus == 4) {
	j	no_bonus
bonus:
	li	$v0, 4
	la	$a0, str__compute_points_for_line__tetris
	syscall						# printf("\n*** TETRIS! ***\n\n")

no_bonus:
	sub	$s1, $s1, 1				# y--
	mul	$s1, $s1, $s1				# y *= y
	mul	$s1, $s1, 40
	add	$s1, $s1, 100				# y += x
	move	$v0, $s1				# return y

compute_points_for_line__epilogue:
	pop	$s1
	pop	$ra
	end
        jr      $ra



################################################################################
# .TEXT <setup_field>
        .text
setup_field:
        # Subset:   1
        #
        # Args:     None
        #
        # Returns:  None
        #
        # Frame:    [...]
        # Uses:     [...]
        # Clobbers: [...]
        #
        # Locals:
        #   - $t1: row
	#   - $t2: col
	#   - $t3: feild base address
	#   - $t4: offset
        #
        # Structure:
        #   setup_field
        #   -> [prologue]
        #       -> body
        #   -> [epilogue]

setup_field__prologue:
	begin
	push	$ra

setup_field__body:
	li	$t1, 0					# row = 0

outer_loop_cond:
	bge	$t1, FIELD_HEIGHT, setup_field__epilogue# while (row < FEILD_HEIGHT) {
	li	$t2, 0					# int col = 0

inner_loop_cond:
	bge	$t2, FIELD_WIDTH, inner_loop_end	# while (col < FEILD_WIDTH) {

inner_loop_body:
	# 2D character array, no need to multiply iterators by int size
	la	$t3, field				# x = baseAddress
	mul	$t4, $t1, FIELD_WIDTH			# offset = row * NUM_COL
	add	$t4, $t4, $t2				# offset = row + col
	add	$t3, $t4, $t3				# baseAddress += offset

	li	$t5, EMPTY				# y = ' '
	sb	$t5, ($t3)				# feild[row][col] = ' '

	add	$t2, $t2, 1				# col++
	j	inner_loop_cond

inner_loop_end:
	add	$t1, $t1, 1				# row++
	j	outer_loop_cond

setup_field__epilogue:
	pop	$ra
	end
        jr      $ra



################################################################################
# .TEXT <choose_next_shape>
        .text
choose_next_shape:
        # Subset:   1
        #
        # Args:     None
        #
        # Returns:  None
        #
        # Frame:    [...]
        # Uses:     [...]
        # Clobbers: [...]
        #
        # Locals:
        #   - $t1: symbol
	#   - $t2: int i
	#   - $t3: baseAddress
	#   - $t4: offset
	#   - $t5: shapes[i].symbol
        #
        # Structure:
        #   choose_next_shape
        #   -> [prologue]
        #       -> body
        #   -> [epilogue]

choose_next_shape__prologue:
	begin
	push	$ra
	push	$s1
	push	$s2
	push	$s3
	push	$s4
	push	$s5
	push	$s6

choose_next_shape__body:
	# Hint for translating shapes[i].symbol:
	#    You can compute the address of shapes[i] by using
	#      `i`, the address of `shapes`, and SIZEOF_SHAPE.
	#    You can then use that address to find the address of
	#      shapes[i].symbol with SHAPE_SYMBOL_OFFSET.
	#    Once you have the address of shapes[i].symbol you
	#      can use a memory load instruction to find its value.

	li	$v0, 4
	la	$a0, str__choose_next_shape__prompt
	syscall						# printf("Enter new next shape: ");

	jal	read_char
	move	$s1, $v0				# char symbol = read_char()

	li	$s2, 0					# int i = 0

while_cond:
	beq	$s2, NUM_SHAPES, num_shapes_cond	# while (i != NUM_SHAPES) {
	
	la	$s3, shapes				# int x = baseAddress
	mul	$s4, $s2, SIZEOF_SHAPE			# offset = i * sizeOfShape
	add	$s4, $s4, SHAPE_SYMBOL_OFFSET		# offset += 0
	add	$s3, $s4, $s3				# baseAddress += offset

	lb	$s5, ($s3)				# char c = shapes[i].symbol

	beq	$s1, $s5, num_shapes_cond		# while (shapes[i].symbol != symbol) {

increment:
	add	$s2, $s2, 1
	j	while_cond

num_shapes_cond:
	beq	$s2, NUM_SHAPES, no_shape		# if (i != NUM_SHAPES) {
	la	$s6, next_shape_index			# 
	sw	$s2, ($s6)				# next_shape_index = i
	j	choose_next_shape__epilogue

no_shape:
	li	$v0, 4
	la	$a0, str__choose_next_shape__not_found
	syscall						# printf("No shape found for ");

	li	$v0, 11
	move	$a0, $s1
	syscall						# printf("%c", symbol)

	li	$v0, 11
	la	$a0, '\n'
	syscall						# printf('\n')

choose_next_shape__epilogue:
	pop	$s6
	pop	$s5
	pop	$s4
	pop	$s3
	pop	$s2
	pop	$s1
	pop	$ra
	end
        jr      $ra



################################################################################
# .TEXT <print_field>
        .text
print_field:
        # Subset:   2
        #
        # Args:     None
        #
        # Returns:  None
        #
        # Frame:    [...]
        # Uses:     [...]
        # Clobbers: [...]
        #
        # Locals:
        #   - $t1: int row
	#   - $t2: int col
	#   - $t3: &field
	#   - $t4: offset
	#   - $t5: nextSymbol
        #
        # Structure:
        #   print_field
        #   -> [prologue]
        #       -> body
        #   -> [epilogue]

print_field__prologue:
	begin
	push	$ra
	push	$s1
	push	$s2
	push	$s3
	push	$s4
	push	$s5

print_field__body:	
	li	$v0, 4
	la	$a0, str__print_field__header
	syscall						# printf("\n/= Field =\\    SCORE: ");

	lw	$s1, score				# int x = score
	li	$v0, 1
	move	$a0, $s1
	syscall						# printf("$d", x)

	li	$v0, 11
	la	$a0, '\n'
	syscall						# printf('\n')
	

	li	$s1, 0					# int row = 0

outer_loop__cond:
	bge	$s1, FIELD_HEIGHT, print_field__epilogue# while (row < FEILD_HEIGHT) {

	li	$v0, 11
	la	$a0, '|'
	syscall						# putchar('|');

	li	$s2, 0					# int col = 0

inner_loop__cond:
	bge	$s2, FIELD_WIDTH, outer_loop__body	# while (col < FEILD_WIDTH) {

	la	$a0, shape_coordinates			# arg1 = &shape_coordinates
	move	$a1, $s1				# arg2 = row
	move	$a2, $s2				# arg3 = col
	jal	piece_hit_test				# pieceHitTest(shape_coordinates, row, col)		

	bne	$v0, NULL, piece_hit_true		# if (piece_hit_test) {
	j	piece_hit_false

piece_hit_true:
	li	$v0, 11
	lb	$a0, piece_symbol
	syscall						# putchar(piece_symbol)

	j	increment_inner	

piece_hit_false:
	la	$s3, field				# x = &field
	mul	$s4, $s1, FIELD_WIDTH			# offset = row * fieldWidth
	add	$s4, $s4, $s2				# offset += col
	add	$s3, $s3, $s4				# x += offset

	li	$v0, 11
	lb	$a0, ($s3)
	syscall						# putchar(field[row][col]);

increment_inner:
	add	$s2, $s2, 1
	j	inner_loop__cond

outer_loop__body:
	li	$v0, 11
	la	$a0, '|'
	syscall						# putchar('|');

	bne	$s1, 1, row_not_one			# 
	
	li	$v0, 4
	la	$a0, str__print_field__next
	syscall						# printf("\tNEXT: ");

	la	$s3, shapes				# x = &shapes
	lw	$s4, next_shape_index			# offset = next_shape_index
	mul	$s4, $s4, SIZEOF_SHAPE			# offset *= size_of_shape\
	add	$s4, $s4, SHAPE_SYMBOL_OFFSET		# offset += SHAPE_SYMBOL_OFFSET
	add	$s3, $s3, $s4				# x += offset

	lb	$s5, ($s3)				# nextSymbol = shapes[next_shape_index].symbol

	li	$v0, 11
	move	$a0, $s5
	syscall						# printf('%c', nextSymbol);

row_not_one:
	li	$v0, 11
	la	$a0, '\n'
	syscall						# putchar('\n');

	add	$s1, $s1, 1				# row++
	j	outer_loop__cond

print_field__epilogue:
	li	$v0, 4
	la	$a0, str__print_field__footer
	syscall						# printf("\\=========/\n");

	pop	$s5
	pop	$s4
	pop	$s3
	pop	$s2
	pop	$s1
	pop	$ra
	end
        jr      $ra



################################################################################
# .TEXT <piece_hit_test>
        .text
piece_hit_test:
        # Subset:   2
        #
        # Args:
        #    - $a0: struct coordinate coordinates[PIECE_SIZE]
        #    - $a1: int row
        #    - $a2: int col
        #
        # Returns:  $v0: struct coordinate *
        #
        # Frame:    [...]
        # Uses:     [...]
        # Clobbers: [...]
        #
        # Locals:
        #   - $t1: int i
	#   - $t2: piece x
	#   - $t3: piece y
	#   - $t4: offset
	#   - $t5: coordinates[i].x
	#   - $t6: coordinates[i].y
        #
        # Structure:
        #   piece_hit_test
        #   -> [prologue]
        #       -> body
        #   -> [epilogue]

piece_hit_test__prologue:
	begin
	push	$ra

piece_hit_test__body:
	li	$t1, 0					# int i = 0

loop_cond:
	bge	$t1, PIECE_SIZE, no_hits		# while (i < PIECE_SIZE) {

	lw	$t2, piece_x				# x = piece_x
	lw	$t3, piece_y				# y = piece_y
	
	mul	$t4, $t1, SIZEOF_COORDINATE		# offset = i * sizeOfCoordinate
	add	$t4, $t4, $a0				# offset += &coordinates

	lw	$t5, COORDINATE_X_OFFSET($t4)		# x = coordinates[i].x
	lw	$t6, COORDINATE_Y_OFFSET($t4)		# y = coordinates[i].y

	add	$t2, $t2, $t5				# piece_x += coordinates[i].x
	add	$t3, $t3, $t6				# piece_y += coordinates[i].y

	bne	$t2, $a2, hit_test_increment		# if (piece_x == col) {
	bne	$t3, $a1, hit_test_increment		# if (piece_y == row) {

	move	$v0, $a0	
	mul	$t1, $t1, SIZEOF_COORDINATE 		# i *= sizeof(coordinate)
	add	$v0, $v0, $t1				# coordinates += i
	j	piece_hit_test__epilogue		# return coordinates 

hit_test_increment:
	add	$t1, $t1, 1				# i++
	j	loop_cond

no_hits:
	la	$v0, NULL				# return NULL

piece_hit_test__epilogue:
	pop	$ra
	end
        jr      $ra


################################################################################
# .TEXT <piece_intersects_field>
        .text
piece_intersects_field:
        # Subset:   2
        #
        # Args:     None
        #
        # Returns:  $v0: int
        #
        # Frame:    [...]
        # Uses:     [...]
        # Clobbers: [...]
        #
        # Locals:
        #   - $t1: int i
	#   - $t2: piece_x
	#   - $t3: piece_y
        #   - $t4: &shape_coordinates
	#   - $t5: offset
	#   - $t6: shape_x
	#   - $t7: shape_y
	#   - $t8: field[y][x]
	#
        # Structure:
        #   piece_intersects_field
        #   -> [prologue]
        #       -> body
        #   -> [epilogue]

piece_intersects_field__prologue:
piece_intersects_field__body:
	li	$t1, 0					# int i = 0

piece_intersect_loop__cond:
	bge	$t1, PIECE_SIZE, piece_intersect_end	# while (i < PIECE_SIZE) {

	lw	$t2, piece_x				# int x = piece_x
	lw	$t3, piece_y				# int y = piece_y

	la	$t4, shape_coordinates			# baseAddress = &shape_coordinates
	mul	$t5, $t1, SIZEOF_COORDINATE		# offset = i * sizeof(coordinate)
	add	$t4, $t5, $t4				# baseAddress += offset
	lw	$t6, COORDINATE_X_OFFSET($t4)		# shape_x = shape_coordinates[i].x
	lw	$t7, COORDINATE_Y_OFFSET($t4)		# shape_y = shape_coordinates[i].y

	add	$t2, $t2, $t6				# x += shape_coordinates[i].x
	add	$t3, $t3, $t7				# y += shape_coordinates[i].y
	
	blt	$t2, 0, piece_intersect_true		# if (x < 0) {
	bge	$t2, FIELD_WIDTH, piece_intersect_true	# if (x >= FEILD_WIDTH) {
	blt	$t3, 0, piece_intersect_true		# if (y < 0) {
	bge	$t3, FIELD_HEIGHT, piece_intersect_true	# if (y >= FEILD_HEIGHT) {

	la	$t4, field				# baseAddress = &feild
	mul	$t5, $t3, FIELD_WIDTH			# offset = y * FEILD_WIDTH
	add	$t5, $t5, $t2				# offset += x
	add	$t4, $t4, $t5				# baseAddress += offset

	lb	$t8, ($t4)				# c = field[y][x]

	bne	$t8, EMPTY, piece_intersect_true	# if (c != ' ') {

piece_intersect_loop__inc:
	add	$t1, $t1, 1				# i++
	j	piece_intersect_loop__cond

piece_intersect_true:
	li	$v0, TRUE				# returns TRUE
	j	piece_intersects_field__epilogue

piece_intersect_end:
	li	$v0, FALSE				# return FALSE

piece_intersects_field__epilogue:
        jr      $ra


################################################################################
# .TEXT <rotate_right>
        .text
rotate_right:
        # Subset:   2
        #
        # Args:     None
        #
        # Returns:  None
        #
        # Frame:    [...]
        # Uses:     [...]
        # Clobbers: [...]
        #
        # Locals:
        #   - $t0: rotation
	#   - $t1: int i
	#   - $t2: &shape_coordinates
	#   - $t3: offset
	#   - $t4: temp
	#   - $t5: shape_y
	#   - $t6: neg_shape_y
	#   - $t7: piece_symbol
        #
        # Structure:
        #   rotate_right
        #   -> [prologue]
        #       -> body
        #   -> [epilogue]

rotate_right__prologue:
	begin
	push	$ra

rotate_right__body:
	# The following 3 instructions are provided, although you can
	# discard them if you want. You still need to add appropriate
	# comments.
	lw	$t0, piece_rotation			# int x = rotation
	addi	$t0, $t0, 1				# x++
	sw	$t0, piece_rotation			# rotation = x

	li	$t1, 0					# int i = 0
rotate_first_loop__cond:
	bge	$t1, PIECE_SIZE, rotate_cond		# while (i < PIECE_SIZE) {

	la	$t2, shape_coordinates			# baseAddress = &shape_coordinates
	mul	$t3, $t1, SIZEOF_COORDINATE		# offset = i * sizeof(coordinate)
	add	$t2, $t2, $t3				# baseAddress += offset

	lw	$t4, COORDINATE_X_OFFSET($t2)		# temp = shape_coordinates[i].x
	lw	$t5, COORDINATE_Y_OFFSET($t2)		# shape_y =  shape_coordinates[i].y
	mul	$t6, $t5, -1				# neg_shape_y = shape_y * -1

	sw	$t6, COORDINATE_X_OFFSET($t2)		# shape_coordinates[i].x = inv_y
	sw	$t4, COORDINATE_Y_OFFSET($t2)		# shape_coordinates[i].y = temp;

	add	$t1, $t1, 1				# i++
	j	rotate_first_loop__cond


rotate_cond:
	la	$t7, piece_symbol			# char s = piece_symbol
	bne	$t7, 'I', rotate_right__epilogue	# if (piece_symbol == 'I') {
	bne	$t7, 'O', rotate_right__epilogue	# if (piece_symbol == 'O') {

	li	$t1, 0					# i = 0

rotate_second_loop__cond:
	bge	$t1, PIECE_SIZE, rotate_right__epilogue

	lw	$t4, COORDINATE_X_OFFSET($t2)		# temp = shape_coordinates[i].x
	add	$t4, $t4, 1				# temp++
	sw	$t4, COORDINATE_X_OFFSET($t2)		# shape_coordinates[i].x = temp

	add	$t1, $t1, 1				# i++
	j	rotate_second_loop__cond

rotate_right__epilogue:
	pop	$ra
	end
        jr      $ra



################################################################################
# .TEXT <place_piece>
        .text
place_piece:
        # Subset:   3
        #
        # Args:     None
        #
        # Returns:  None
        #
        # Frame:    [...]
        # Uses:     [...]
        # Clobbers: [...]
        #
        # Locals:
        #   - $t1: int i
        #   - $t2: row
	#   - $t3: col
	#   - $t4: &shape_coordinate
	#   - $t5: offset
	#   - $t6: shape_y
	#   - $t7: shape_x
	#   - $t8: piece_symbol
	#
        # Structure:
        #   place_piece
        #   -> [prologue]
        #       -> body
        #   -> [epilogue]

place_piece__prologue:
	begin
	push	$ra					# place registers onto the stack
	push	$s1
	push	$s2
	push 	$s3
	push	$s4
	push	$s5
	push	$s6
	push	$s7
	push	$s0

place_piece__body:
	li	$s1, 0					# int i = 0

place_loop__cond:
	bge	$s1, PIECE_SIZE, place_loop__end	# while (i < PIECE_SIZE) {
	
	lw	$s2, piece_y				# row = piece_y
	lw	$s3, piece_x				# col = piece_x

	la	$s4, shape_coordinates			# baseAddress = &shape_coordinates
	mul	$s5, $s1, SIZEOF_COORDINATE		# offset = i * sizeof(coordinate)
	add	$s4, $s4, $s5				# baseAddresss += offset

	lw	$s6, COORDINATE_Y_OFFSET($s4)		# shape_y = shape_coordinate[i].y
	lw	$s7, COORDINATE_X_OFFSET($s4)		# shape_x = shape_coordinate[i].x

	add	$s2, $s2, $s6				# row += shape_y
	add	$s3, $s3, $s7				# col += shape_x

	la	$s4, field				# baseAddress = &field
	mul	$s5, $s2, FIELD_WIDTH			# offset = row * NUM_COL
	add	$s5, $s5, $s3				# offset += col
	add	$s4, $s5, $s4				# baseAddress += offset

	lb	$s0, piece_symbol			# char c = piece_symbol
	sb	$s0, ($s4)				# field[row][col] = piece_symbol

	add	$s1, $s1, 1				# i++
	j	place_loop__cond


place_loop__end:
	jal	consume_lines				# consume_lines()

	li	$a0, TRUE
	jal	new_piece				# newPiece(TRUE);

place_piece__epilogue:
	pop	$s0					# recover registers from the stack
	pop	$s7
	pop	$s6
	pop	$s5
	pop	$s4
	pop	$s3
	pop	$s2
	pop	$s1
	pop	$ra
	end
        jr      $ra



################################################################################
# .TEXT <new_piece>
        .text
new_piece:
        # Subset:   3
        #
        # Args:
        #    - $a0: int should_announce
        #
        # Returns:  None
        #
        # Frame:    [...]
        # Uses:     [...]
        # Clobbers: [...]
        #
        # Locals:
        #   - $t1: int x, &shapes, int i, next_shape
	#   - $t2: shapesOffset, coordinatesAddress, FALSE
	#   - $t3: coordinatesOffset
	#   - $t4: piece_symbol, coordinate
	#   - $t5: piece_x, piece_y, shapeAddress
	#   - $t6: nextShape
	#   - $t7: shapeOffset
        #
        # Structure:
        #   new_piece
        #   -> [prologue]
        #       -> body
        #   -> [epilogue]

new_piece__prologue:
	begin
	push	$ra					# places registers onto the stack
	push	$s1
	push	$s2
	push	$s3
	push	$s4
	push	$s5
	push	$s6
	push	$s7

new_piece__body:
	move 	$s6, $a0
	li	$s1, 4					# int x = 4
	sw	$s1, piece_x				# piece_x = x

	li	$s2, 1					# x = 1
	sw	$s2, piece_y				# piece_y = x

	li	$s3, 0					# x = 0
	sw	$s3, piece_rotation			# piece_rotation = x

	la	$t1, shapes				# baseAddress = &shapes
	lw	$t2, next_shape_index			# offset = next_shape_index
	mul	$t2, $t2, SIZEOF_SHAPE			# offset *= sizeof(shape)
	add	$t1, $t1, $t2				# baseAddress += offset
	add	$t1, $t1, SHAPE_SYMBOL_OFFSET		# baseAddress += SHAPE_SYMBOL_OFFSET

	lb	$t4, ($t1)				# piece_symbol = shapes[next_shape_index].symbol
	sb	$t4, piece_symbol			#

	bne	$t4, 'O', new_piece_second_cond		# if (piece_symbol == 'O') {
	
	sub	$s1, $s1, 1				# temp = piece_x - 1
	sw	$s1, piece_x				# piece_x = temp

	sub	$s2, $s2, 1				# temp--
	sw	$s2, piece_y				# piece_y = temp

	j	new_piece_loop

new_piece_second_cond:
	bne	$t4, 'I', new_piece_loop		# if (piece_symbol == 'I') {

	sub	$s2, $s2, 1				# temp--
	sw	$s2, piece_y				# piece_y = temp

new_piece_loop:
	li	$t1, 0					# int i = 0

new_piece_loop__cond:
	bge	$t1, PIECE_SIZE, new_piece_body__rest	# while (i < PIECE_SIZE) {

	la	$t2, shape_coordinates			# coordinatesAddress = &shape_coordinates
	mul	$t3, $t1, SIZEOF_COORDINATE		# offset = i * sizeof(coordinate)
	add	$t2, $t2, $t3				# coordinatesAddress += offset

	la	$t5, shapes				# shapeAddress = &shapes
	lw	$t6, next_shape_index			# ofset = next_shape_index
	mul	$t6, $t6, SIZEOF_SHAPE			# offset *= sizeof(shape)
	add	$t5, $t5, $t6				# shapeAdress += offset
	add	$t5, $t5, SHAPE_COORDINATES_OFFSET	# shapeAddress += SHAPE_COORDINATE_OFFSET


	mul	$t7, $t1, SIZEOF_COORDINATE		# shapeOffset = i * size_of_ccordinate
	add	$t5, $t5, $t7				# shapeAddress += shapeOffset

	lw	$t4, COORDINATE_X_OFFSET($t5)		# coordinate.x = shape_coordinates[i].x
	sw	$t4, COORDINATE_X_OFFSET($t2)		# shape_coordinates[i].x = coordinate.x

	lw	$t4, COORDINATE_Y_OFFSET($t5)		# coordinate.x = shape_coordinates[i].x
	sw	$t4, COORDINATE_Y_OFFSET($t2)		# shape_coordinates[i].x = coordinate.x
	

	add	$t1, $t1, 1				# i++
	j	new_piece_loop__cond

new_piece_body__rest:
	lw	$s5, next_shape_index			# nextShape = next_shape_index
	add	$s5, $s5, 1				# nextShape++

	rem	$s5, $s5, NUM_SHAPES			# nextShape %= NUM_SHAPES
	sw	$s5, next_shape_index			# next_shape_index = nextShape

	jal	piece_intersects_field			# 
	bnez	$v0, new_piece_intersects		# if (piece_interesects_field()) {
	j	new_piece_not_intersects

new_piece_intersects:
	jal	print_field				# print_field()

	li	$v0, 4
	la	$a0, str__new_piece__game_over
	syscall						# printf("Game over :[\n");

	li	$t9, FALSE				# int y = FALSE
	sw	$t9, game_running			# game_running = FALSE

	j	new_piece__epilogue

new_piece_not_intersects:
	beqz	$s6, new_piece__epilogue		# if (should_announce) {

	li	$v0, 4					
	la	$a0, str__new_piece__appeared
	syscall						# printf("A new piece has appeared: ");

	li	$v0, 11
	lb	$a0, piece_symbol	
	syscall						# printf("%c", piece_symbol);

	li	$v0, 11
	la	$a0, '\n'
	syscall

new_piece__epilogue:
	pop	$s7					# recovers registers from the stack
	pop	$s6
	pop	$s5
	pop	$s4
	pop	$s3
	pop	$s2
	pop	$s1
	pop	$ra
	end
        jr      $ra



################################################################################
# .TEXT <consume_lines>
        .text
consume_lines:
        # Subset:   3
        #
        # Args:     None
        #
        # Returns:  None
        #
        # Frame:    [...]
        # Uses:     [...]
        # Clobbers: [...]
        #
        # Locals:
        #   - ...
	
        #
        # Structure:
        #   consume_lines
        #   -> [prologue]
        #       -> body
        #   -> [epilogue]

consume_lines__prologue:
	begin
	push	$ra				# place registers onto the stack
	push	$s1
	push	$s2
	push	$s3
	push	$s4
	push	$s5
	push	$s6
	push	$s7

consume_lines__body:
	li	$s1, 0				# int lines_cleared = 0
	li	$s2, FIELD_HEIGHT		# int row = FEILD_HEIGHT
	sub	$s2, $s2, 1			# row--

consume_outer_loop__cond:
	blt	$s2, 0, consume_lines__epilogue	# while (row >= 0) {

	li	$s3, TRUE			# int line_is_full = TRUE
	li	$s4, 0				# int col = 0

consume_inner_loop1__cond:
	bge	$s4, FIELD_WIDTH, consume_outer_cond	# while (col < FIELD_WIDTH) {

	la	$s5, field			# baseAddress = &field
	mul	$s6, $s2, FIELD_WIDTH		# offset = row * FIELD_WIDTH
	add	$s6, $s6, $s4			# offset += col
	add	$s6, $s5, $s6			# offset += baseAddress

	lb	$s7, ($s6)			# c = field[row][col]
	bne	$s7, EMPTY, consume_inner_loop1__inc	# if (field[row][col] == EMPTY) {
	li	$s3, FALSE			# line_is_full = FALSE

consume_inner_loop1__inc:
	add	$s4, $s4, 1			# col++
	j	consume_inner_loop1__cond

consume_outer_cond:
	move	$t1, $s2			# row_to_copy = row
	beqz	$s3, consume_inner_loop2__cond	# if (!line_is_full) {

	sub	$s2, $s2, 1			# row--
	j	outer_loop__cond		

consume_inner_loop2__cond:
	blt	$t1, 0, consume_outer_loop__body	# while (row_to_copy >= 0) {
	li	$s4, 0				# col = 0

consume_inner_loop2__loop:
	bge	$s4, FIELD_HEIGHT, consume_inner_loop2__inc	# while (col < FIELD_WIDTH) {
	
	mul	$t2, $t1, FIELD_WIDTH		# tempOffset = row_to_copy * FIELD_WIDTH
	add	$t2, $t2, $s4			# tempOffset += col
	add	$t2, $t2, $s5			# tempOffset += &field

	sub	$t3, $t2, FIELD_WIDTH		# newOffset -= FIELD_WIDTH
	lb	$s3, ($t3)			# c = field[row_to_copy - 1][col]
	
	beqz	$t1, consume_row_to_copy_is_zero# if (row_to_copy != 0) {

	sb	$s3, ($t2)			# field[row_to_copy][col] = c
	j	consume_inner_loop2__loop_inc

	consume_row_to_copy_is_zero:
		li	$t0, EMPTY		
		sb	$t0, ($t2)		# field[row_to_copy][col] = EMPTY

consume_inner_loop2__loop_inc:
	add	$s4, $s4, 1			# col++
	j	consume_inner_loop2__loop

consume_inner_loop2__inc:
	sub	$t1, $t1, 1			# row_to_copy--
	j	consume_inner_loop1__cond

consume_outer_loop__body:	
	add	$s2, $s2, 1			# row++
	add	$s1, $s1, 1			# lines_cleared++

	move	$a0, $s1 			
	jal	compute_points_for_line	

	lw	$t4, score			# x =  score
	add	$t4, $t4, $v0			# x += compute_points_for_lines(lines_cleared)

	sw	$t4, score			# score = x

	sub	$s2, $s2, 1			# row--
	j	consume_outer_cond

consume_lines__epilogue:
	pop	$s7
	pop	$s6
	pop	$s5
	pop	$s4
	pop	$s3
	pop	$s2
	pop	$s1
	pop	$ra
	end
        jr      $ra


################################################################################
################################################################################
###                   PROVIDED FUNCTIONS — DO NOT CHANGE                     ###
################################################################################
################################################################################

################################################################################
# .TEXT <show_debug_info>
        .text
show_debug_info:
	# Args:     None
        #
        # Returns:  None
	#
	# Frame:    []
	# Uses:     [$a0, $v0, $t0, $t1, $t2, $t3]
	# Clobbers: [$a0, $v0, $t0, $t1, $t2, $t3]
	#
	# Locals:
	#   - $t0: i
	#   - $t1: coordinates address calculations
	#   - $t2: row
	#   - $t3: col
	#   - $t4: field address calculations
	#
	# Structure:
	#   print_board
	#   -> [prologue]
	#   -> body
	#     -> coord_loop
	#       -> coord_loop__init
	#       -> coord_loop__cond
	#       -> coord_loop__body
	#       -> coord_loop__step
	#       -> coord_loop__end
	#     -> row_loop
	#       -> row_loop__init
	#       -> row_loop__cond
	#       -> row_loop__body
	#         -> col_loop
	#           -> col_loop__init
	#           -> col_loop__cond
	#           -> col_loop__body
	#           -> col_loop__step
	#           -> col_loop__end
	#       -> row_loop__step
	#       -> row_loop__end
	#   -> [epilogue]

show_debug_info__prologue:

show_debug_info__body:
	li	$v0, 4				# syscall 4: print_string
	la	$a0, str__show_debug_info__next_shape_index
	syscall					# printf("next_shape_index = ");

	li	$v0, 1				# sycall 1: print_int
	lw	$a0, next_shape_index		# next_shape_index
	syscall					# printf("%d", next_shape_index);

	li	$v0, 11				# syscall 11: print_char
	li	$a0, '\n'
	syscall					# putchar('\n');


	li	$v0, 4				# syscall 4: print_string
	la	$a0, str__show_debug_info__piece_symbol
	syscall					# printf("piece_symbol     = ");

	li	$v0, 1				# sycall 1: print_int
	lb	$a0, piece_symbol		# piece_symbol
	syscall					# printf("%d", piece_symbol);

	li	$v0, 11				# syscall 11: print_char
	li	$a0, '\n'
	syscall					# putchar('\n');


	li	$v0, 4				# syscall 4: print_string
	la	$a0, str__show_debug_info__piece_x
	syscall					# printf("piece_x          = ");

	li	$v0, 1				# sycall 1: print_int
	lw	$a0, piece_x			# piece_x
	syscall					# printf("%d", piece_x);

	li	$v0, 11				# syscall 11: print_char
	li	$a0, '\n'
	syscall					# putchar('\n');


	li	$v0, 4				# syscall 4: print_string
	la	$a0, str__show_debug_info__piece_y
	syscall					# printf("piece_y          = ");

	li	$v0, 1				# sycall 1: print_int
	lw	$a0, piece_y			# piece_y
	syscall					# printf("%d", piece_y);

	li	$v0, 11				# syscall 11: print_char
	li	$a0, '\n'
	syscall					# putchar('\n');


	li	$v0, 4				# syscall 4: print_string
	la	$a0, str__show_debug_info__game_running
	syscall					# printf("game_running     = ");

	li	$v0, 1				# sycall 1: print_int
	lw	$a0, game_running		# game_running
	syscall					# printf("%d", game_running);

	li	$v0, 11				# syscall 11: print_char
	li	$a0, '\n'
	syscall					# putchar('\n');


	li	$v0, 4				# syscall 4: print_string
	la	$a0, str__show_debug_info__piece_rotation
	syscall					# printf("piece_rotation   = ");

	li	$v0, 1				# sycall 1: print_int
	lw	$a0, piece_rotation		# piece_rotation
	syscall					# printf("%d", piece_rotation);

	li	$v0, 11				# syscall 11: print_char
	li	$a0, '\n'
	syscall					# putchar('\n');


show_debug_info__coord_loop:
show_debug_info__coord_loop__init:
	li	$t0, 0				# int i = 0;

show_debug_info__coord_loop__cond:		# while (i < PIECE_SIZE) {
	bge	$t0, PIECE_SIZE, show_debug_info__coord_loop__end

show_debug_info__coord_loop__body:
	li	$v0, 4				#   syscall 4: print_string
	la	$a0, str__show_debug_info__coordinates_1
	syscall					#   printf("coordinates[");

	li	$v0, 1				#   syscall 1: print_int
	move	$a0, $t0
	syscall					#   printf("%d", i);

	li	$v0, 4				#   syscall 4: print_string
	la	$a0, str__show_debug_info__coordinates_2
	syscall					#   printf("]   = { ");

	mul	$t1, $t0, SIZEOF_COORDINATE	#   i * sizeof(struct coordinate)
	addi	$t1, $t1, shape_coordinates	#   &shape_coordinates[i]

	li	$v0, 1				#   syscall 1: print_int
	lw	$a0, COORDINATE_X_OFFSET($t1)	#   shape_coordinates[i].x
	syscall					#   printf("%d", shape_coordinates[i].x);

	li	$v0, 4				#   syscall 4: print_string
	la	$a0, str__show_debug_info__coordinates_3
	syscall					#   printf(", ");

	li	$v0, 1				#   syscall 1: print_int
	lw	$a0, COORDINATE_Y_OFFSET($t1)	#   shape_coordinates[i].y
	syscall					#   printf("%d", shape_coordinates[i].y);

	li	$v0, 4				#   syscall 4: print_string
	la	$a0, str__show_debug_info__coordinates_4
	syscall					#   printf(" }\n");

show_debug_info__coord_loop__step:
	addi	$t0, $t0, 1			#   i++;
	b	show_debug_info__coord_loop__cond

show_debug_info__coord_loop__end:		# }

	li	$v0, 4				# syscall 4: print_string
	la	$a0, str__show_debug_info__field
	syscall					# printf("\nField:\n");

show_debug_info__row_loop:
show_debug_info__row_loop__init:
	li	$t2, 0				# int row = 0;

show_debug_info__row_loop__cond:		# while (row < FIELD_HEIGHT) {
	bge	$t2, FIELD_HEIGHT, show_debug_info__row_loop__end

show_debug_info__row_loop__body:
	bge	$t2, 10, show_debug_info__print_row
	li	$v0, 11				#  if (row < 10) {
	li	$a0, ' '
	syscall					#     putchar(' ');

show_debug_info__print_row:			#   }
	li	$v0, 1				#   syscall 1: print_int
	move	$a0, $t2
	syscall					#   printf("%d", row);


	li	$v0, 4				#   syscall 4: print_string
	la	$a0, str__show_debug_info__field_indent
	syscall					#   printf(":  ");

show_debug_info__col_loop:
show_debug_info__col_loop__init:
	li	$t3, 0				#   int col = 0;

show_debug_info__col_loop__cond:		#   while (col < FIELD_WIDTH) {
	bge	$t3, FIELD_WIDTH, show_debug_info__col_loop__end

show_debug_info__col_loop__body:
	mul	$t4, $t2, FIELD_WIDTH		#     row * FIELD_WIDTH
	add	$t4, $t4, $t3			#     row * FIELD_WIDTH + col
	addi	$t4, $t4, field			#     &field[row][col]

	li	$v0, 1				#     syscall 1: print_int
	lb	$a0, ($t4)			#     field[row][col]
	syscall					#     printf("%d", field[row][col]);

	li	$v0, 11				#     syscall 11: print_char
	li	$a0, ' '
	syscall					#     putchar(' ');

	lb	$a0, ($t4)			#     field[row][col]
	syscall					#     printf("%c", field[row][col]);

	li	$v0, 11				#     syscall 11: print_char
	li	$a0, ' '
	syscall					#     putchar(' ');

show_debug_info__col_loop__step:
	addi	$t3, $t3, 1			#     i++;
	b	show_debug_info__col_loop__cond

show_debug_info__col_loop__end:			#   }

	li	$v0, 11				#   syscall 11: print_char
	li	$a0, '\n'
	syscall					#   putchar('\n');

show_debug_info__row_loop__step:
	addi	$t2, $t2, 1			#   row++;
	b	show_debug_info__row_loop__cond

show_debug_info__row_loop__end:			# }

	li	$v0, 11				# syscall 11: print_char
	li	$a0, '\n'
	syscall					# putchar('\n');

show_debug_info__epilogue:
	jr	$ra


################################################################################
# .TEXT <game_loop>
        .text
game_loop:
        # Args:     None
        #
        # Returns:  None
        #
        # Frame:    [$ra]
        # Uses:     [$t0, $t1, $v0, $a0]
        # Clobbers: [$t0, $t1, $v0, $a0]
        #
        # Locals:
        #   - $t0: copy of game_running
        #   - $t1: char command
        #
        # Structure:
        #   game_loop
        #   -> [prologue]
        #       -> body
	#         -> big_loop
	#         -> big_loop__cond
	#         -> big_loop__body
	#           -> game_loop__command_r
	#           -> game_loop__command_R
	#           -> game_loop__command_n
	#           -> game_loop__command_s
	#           -> game_loop__command_S
	#           -> game_loop__command_a
	#           -> game_loop__command_d
	#           -> game_loop__command_p
	#           -> game_loop__command_c
	#           -> game_loop__command_question
	#           -> game_loop__command_q
	#           -> game_loop__unknown_command
	#         -> big_loop__step
	#         -> big_loop__end
        #   -> [epilogue]

game_loop__prologue:
	begin
	push	$ra

game_loop__body:
game_loop__big_loop__cond:
	lw	$t0, game_running
	beqz	$t0, game_loop__big_loop__end		# while (game_running) {

game_loop__big_loop__body:
	jal	print_field				#   print_field();

	li	$v0, 4					#   syscall 4: print_string
	la	$a0, str__game_loop__prompt
	syscall						#   printf("  > ");

	jal	read_char
	move	$t1, $v0				#   command = read_char();

	beq	$t1, 'r', game_loop__command_r		#   if (command == 'r') { ...
	beq	$t1, 'R', game_loop__command_R		#   } else if (command == 'R') { ...
	beq	$t1, 'n', game_loop__command_n		#   } else if (command == 'n') { ...
	beq	$t1, 's', game_loop__command_s		#   } else if (command == 's') { ...
	beq	$t1, 'S', game_loop__command_S		#   } else if (command == 'S') { ...
	beq	$t1, 'a', game_loop__command_a		#   } else if (command == 'a') { ...
	beq	$t1, 'd', game_loop__command_d		#   } else if (command == 'd') { ...
	beq	$t1, 'p', game_loop__command_p		#   } else if (command == 'p') { ...
	beq	$t1, 'c', game_loop__command_c		#   } else if (command == 'c') { ...
	beq	$t1, '?', game_loop__command_question	#   } else if (command == '?') { ...
	beq	$t1, 'q', game_loop__command_q		#   } else if (command == 'q') { ...
	b	game_loop__unknown_command		#   } else { ... }

game_loop__command_r:					#   if (command == 'r') {
	jal	rotate_right				#     rotate_right();

	jal	piece_intersects_field			#     call piece_intersects_field();
	beqz	$v0, game_loop__big_loop__cond		#     if (piece_intersects_field())
	jal	rotate_left				#       rotate_left();

	b	game_loop__big_loop__cond		#   }

game_loop__command_R:					#   else if (command == 'R') {
	jal	rotate_left				#     rotate_left();

	jal	piece_intersects_field			#     call piece_intersects_field();
	beqz	$v0, game_loop__big_loop__cond		#     if (piece_intersects_field())
	jal	rotate_right				#       rotate_right();

	b	game_loop__big_loop__cond		#   }

game_loop__command_n:					#   else if (command == 'n') {
	li	$a0, FALSE				#     argument 0: FALSE
	jal	new_piece				#     new_piece(FALSE);

	b	game_loop__big_loop__cond		#   }

game_loop__command_s:					#   else if (command == 's') {
	li	$a0, 0					#     argument 0: 0
	li	$a1, 1					#     argument 1: 1
	jal	move_piece				#     call move_piece(0, 1);

	bnez	$v0, game_loop__big_loop__cond		#     if (!piece_intersects_field())
	jal	place_piece				#       rotate_left();

	b	game_loop__big_loop__cond		#   }

game_loop__command_S:					#   else if (command == 'S') {
game_loop__hard_drop_loop:
	li	$a0, 0					#     argument 0: 0
	li	$a1, 1					#     argument 1: 1
	jal	move_piece				#     call move_piece(0, 1);
	bnez	$v0, game_loop__hard_drop_loop		#     while (move_piece(0, 1));

	jal	place_piece				#     place_piece();

	b	game_loop__big_loop__cond		#   }

game_loop__command_a:					#   else if (command == 'a') {
	li	$a0, -1					#     argument 0: -1
	li	$a1, 0					#     argument 1: 0
	jal	move_piece				#     move_piece(-1, 0);

	b	game_loop__big_loop__cond		#   }

game_loop__command_d:					#   else if (command == 'd') {
	li	$a0, 1					#     argument 0: 1
	li	$a1, 0					#     argument 1: 0
	jal	move_piece				#     move_piece(1, 0);

	b	game_loop__big_loop__cond		#   }

game_loop__command_p:					#   else if (command == 'p') {
	jal	place_piece				#     place_piece();

	b	game_loop__big_loop__cond		#   }

game_loop__command_c:					#   else if (command == 'c') {
	jal	choose_next_shape			#     choose_next_shape();

	b	game_loop__big_loop__cond		#   }

game_loop__command_question:				#   else if (command == '?') {
	jal	show_debug_info				#     show_debug_info();

	b	game_loop__big_loop__cond		#   }

game_loop__command_q:					#   else if (command == 'q') {
	li	$v0, 4					#     syscall 4: print_string
	la	$a0, str__game_loop__quitting
	syscall						#     printf("Quitting...\n");

	b	game_loop__big_loop__end		#     break;

game_loop__unknown_command:				#   } else {
	li	$v0, 4					#     syscall 4: print_string
	la	$a0, str__game_loop__unknown_command
	syscall						#     printf("Unknown command!\n");

game_loop__big_loop__step:				#   }
	b	game_loop__big_loop__cond

game_loop__big_loop__end:				# }
	li	$v0, 4					# syscall 4: print_string
	la	$a0, str__game_loop__goodbye
	syscall						# printf("\nGoodbye!\n");

game_loop__epilogue:
	pop	$ra
	end

	jr	$ra					# return;


################################################################################
# .TEXT <show_debug_info>
        .text
read_char:
	# NOTE: The implementation of this function is
	#       DIFFERENT from the C code! This is
	#       because mipsy handles input differently
	#       compared to `scanf`. You do not need to
	#       worry about this difference as you will
	#       only be calling this function.
	#
        # Args:     None
        #
        # Returns:  $v0: char
        #
        # Frame:    []
        # Uses:     [$v0]
        # Clobbers: [$v0]
        #
        # Locals:
	#   - $v0: char command
        #
        # Structure:
        #   read_char
        #   -> [prologue]
        #       -> body
        #   -> [epilogue]

read_char__prologue:

read_char__body:
	li	$v0, 12				# syscall 12: read_char
	syscall					# scanf("%c", &command);

read_char__epilogue:
	jr	$ra				# return command;
