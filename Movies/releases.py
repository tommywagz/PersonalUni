#!/usr/bin/python3

# COMP3311 24T2 Assignment 2
# Print a list of countries where a named movie was released

import sys
import psycopg2
import helpers

### Globals

db = None
usage = f"Usage: {sys.argv[0]} 'MovieName' Year"

### Command-line args

if len(sys.argv) < 3:
   print(usage)
   exit(1)
   
title = sys.argv[1]
year = sys.argv[2]

if not year.isdigit() or int(year) > 2024 or int(year) < 1800:
   print("Invalid year")
   exit(1)

### Queries

movie = "select id, origin from movies where title = %s and year = %s"

releases = '''
   select c.name from countries c 
   join releasedin r on c.code = r.country 
   where r.movie = %s 
   order by r.country
'''

origin = '''
   select c.name from countries c 
   join movies m on c.code = m.origin 
   where m.id = %s
'''

### Manipulating database

try:
   db = psycopg2.connect("dbname=ass2")
   cur = db.cursor()
   
   cur.execute(movie, (title, year))
   movie = cur.fetchone()
   
   # error checking
   if movie is None:
      print("No such movie")
      exit(1)
      
   movieId, movieOrigin = movie
      
   cur.execute(releases, (movieId,))
   releaseCountries = cur.fetchall()
   
   if not releaseCountries:
      print("No releases")
      exit(1)
   
   cur.execute(origin, (movieId,))
   org = cur.fetchone()
   
   if org:
      orgName = org[0]
   else:
      orgName = "Unknown"
   
   # edge case check
   if len(releaseCountries) == 1 and orgName == releaseCountries[0][0]:
      print(f"The movie was only released in its origin country: {orgName}")
      exit(1)

   # print each release nation
   for (country,) in releaseCountries:
      print(country)

except Exception as err:
   print("DB error: ", err)
finally:
   if db:
      db.close()

