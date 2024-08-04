//Thomas Wagner
//z5436162
//20/11/20

#include <stdio.h>
#include <stdlib.h>

#define MAX_COORDINATES 10

struct coordinate {
    int x;
    int y;
};

struct coordinate sum_coords(struct coordinate coords[MAX_COORDINATES]);

int main(void) {

    struct coordinate points[MAX_COORDINATES];
    int first;
    int second;
    
    int i = 0;
    while (scanf("%d %d", &first, &second) == 1 && i < MAX_COORDINATES) {
    
        points[i].x = first;
        points[i].y = second;
        i ++;
        
    }



    sum_coords(points);
    printf("(%d, %d)\n", sum_coords(points).x, sum_coords(points).y);
    return 0;
}

struct coordinate sum_coords(struct coordinate coords[MAX_COORDINATES]) {

    int xs = 0;
    int ys = 0;

    struct coordinate new;
    new.x = 0;
    new.y = 0;

    for (int i = 0; i < MAX_COORDINATES; i++) {
        if (coords[i].x < 0) {
            xs += coords[i].x;
        }
        if (coords[i].y > 0) {
            ys += coords[i].y;
        }
    }

    new.x = xs;
    new.y = ys;

    return new;

}
