#!/usr/bin/python3

# COMP3311 24T2 Assignment 2
# Print a list of movies written by a given person

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
# process the command-line args ...

### Queries

tupQry = "select id from people where name = %s order by id"

qry = '''
   select m.title, m.year
   from principals p
   join movies m on p.movie = m.id
   where p.person = %s and p.job = 'writer'
   order by m.year
'''
   
### Manipulating database

try:
   db = psycopg2.connect("dbname=ass2")
   cur = db.cursor() 
   
   cur.execute(tupQry, [name])
   personInQuestion = cur.fetchall()
   
   # error check
   if not personInQuestion:
      print("No such person")
      exit(1)
   
   personId = personInQuestion[0][0]
   
   cur.execute(qry, [personId])
   personInQuestionsScripts = cur.fetchall()
   
   # edge case check
   if not personInQuestionsScripts:
      if len(personInQuestion) > 1:
         print(f"None of the people called {name} has written any films")
      if len(personInQuestion) == 1:
         print(f"{name} has not written any mvoies")
      
      exit(1)
      
   # print each script and year
   for script in personInQuestionsScripts:
      print(f"{script[0]} ({script[1]})")

except Exception as err:
   print("DB error: ", err)
finally:
   if db:
      db.close()

