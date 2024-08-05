#!/usr/bin/python3

# COMP3311 24T2 Assignment 2
# Print info about one movie; may need to choose

import sys
import psycopg2
import helpers

### Globals

db = None
usage = f"Usage: {sys.argv[0]} 'PartialMovieName'"

### Command-line args

if len(sys.argv) < 2:
   print(usage)
   exit(1)

namePart = sys.argv[1]

### Queries

moviesWithPart = '''
   select id, title, year
   from movies
   where title ilike %s
   order by title, year
'''

credit = '''
   select p.name, pr.job, COALESCE(r.role, '???') as role
   from principals pr
   join people p on pr.person = p.id
   left join playsrole r on pr.id = r.inmovie
   where pr.movie = %s
   order by pr.ord
'''

### Manipulating database

try:
   db = psycopg2.connect("dbname=ass2")
   cur = db.cursor()
                                                                                                                                                                                                                                                                                                                                                                  
   cur.execute(moviesWithPart, (f"%{namePart}%",))
   movies = cur.fetchall()
   
   # error check
   if not movies:
      print(f"No movie matching: '{namePart}'")
      exit(1)
   
   # check if there are numerous movies to choose from
   if len(movies) > 1:
      # print initial choices
      for index, (id, title, year) in enumerate(movies, start=1):
         print(f"{index}. {title} ({year})")

      choice = input("Which movie?: ")
      
      # error check the choice
      if not choice.isdigit() or int(choice) < 1 or int(choice) > len(movies):
         print("Invalid selection")
         exit(1)
         
      currMovie = movies[int(choice) - 1]
   
   # if there is only one movie to choose from
   else:
      currMovie = movies[0]
      
   movieId, title, year = currMovie
   print(f"{title} ({year})")
   
   cur.execute(credit, (movieId,)) 
   principals = cur.fetchall()
   
   # print the credits
   for name, job, roleName in principals:
      if job in ('actor', 'actress', 'self'):
         role = roleName if roleName else "???"
         print(f"{name} plays {role}")
      else:
         print(f"{name}: {job}")

except Exception as err:
   print("DB error: ", err)
finally:
   if db:
      db.close()

