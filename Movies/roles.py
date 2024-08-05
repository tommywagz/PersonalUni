#!/usr/bin/python3

# COMP3311 24T2 Assignment 2
# Print a list of character roles played by an actor/actress

import sys
import psycopg2
import helpers

### Globals

db = None
usage = f"Usage: {sys.argv[0]} FullName"

### Command-line args

if len(sys.argv) < 2:
   print(usage)
   exit(1)

name = sys.argv[1]

### Queries

personQuery = "select id, name from people where name = %s order by id"

roleQuery = '''
   select r.role, m.title, m.year, m.rating
   from playsrole r
   join principals p on r.inmovie = p.id 
   join movies m on m.id = p.movie
   where p.person = %s
   order by m.year, m.title, r.role
'''

### Manipulating database

try:
   db = psycopg2.connect("dbname=ass2")
   cur = db.cursor()
   
   cur.execute(personQuery, (name,))
   individuals = cur.fetchall()
   
   # error check
   if not individuals:
      print("No such person")
      exit(1)
      
   
   # for each individual with the same name retrieve all of their roles and print them
   for index, (personId, personName) in enumerate(individuals):
      cur.execute(roleQuery, (personId,))
      roles = cur.fetchall()
      
      if len(individuals) > 1:
         print(f"{personName} #{index + 1}")
      
      # error check
      if not roles:
         print("No acting roles")
         continue
   
      for role, title, year, rating in roles:
         print(f"{role} in {title} ({year}) {rating:.1f}")
      

except Exception as err:
   print("DB error: ", err)
finally:
   if db:
      db.close()

