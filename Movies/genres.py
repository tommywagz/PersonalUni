#!/usr/bin/python3

# COMP3311 24T2 Assignment 2
# Print a list of countries where a named movie was released

import sys
import psycopg2
import helpers

### Globals

db = None 
usage = f"Usage: {sys.argv[0]} Year"

### Command-line args

if len(sys.argv) < 2:
   print(usage)
   exit(1)

year = sys.argv[1]

if not year.isdigit() or int(year) > 2024 or int(year) < 1800:
   print("Invalid year")
   exit(1)
   
### Queries

movies = '''
   select mg.genre, AVG(m.rating) as avgRating
   from movies m
   join moviegenres mg on m.id = mg.movie
   where m.year = %s 
   group by mg.genre
   order by avgRating DESC, mg.genre ASC
   limit 10
'''

### Manipulating database

try:
   db = psycopg2.connect("dbname=ass2")
   cur = db.cursor()
   
   cur.execute(movies, (year,))
   moviesFromYear = cur.fetchall()
   
   # error check
   if not moviesFromYear:
      print("No movies")
      exit(1)

   # print eachavg rating of the top 10 rated genres
   for genre, avgRating in moviesFromYear:
      print(f"{avgRating:.2f} {genre}")
            
except Exception as err:
   print("DB error: ", err)
finally:
   if db:
      db.close()

