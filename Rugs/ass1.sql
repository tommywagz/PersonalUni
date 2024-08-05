-- COMP3311 24T2 Assignment 1
--
-- Fill in the gaps ("...") below with your code
--
-- You can add any auxiliary views/function that you like
-- but they must be defined in this file *before* their first use
--
-- The code in this file *MUST* load into an empty database in one pass
--
-- It will be tested as follows:
-- createdb test; psql test -f ass1.dump; psql test -f ass1.sql
--
-- Make sure it can load without error under these conditions

-- Put any views/functions that might be useful in multiple questions here


-- Q1
create or replace view Q1(province, nfactories) 
as
SELECT
    l.province, count(f.id) as nfactories
FROM
    locations l 
LEFT JOIN 
    factories f on l.id = f.located_in
GROUP BY 
    l.province; 


-- Q2
create or replace view Q2(style, knot_length_diff)
as
with KnotLengthDifferences as (
    SELECT
        s.name as style,
        (s.max_knot_length - s.min_knot_length) as knot_length_difference
    FROM
        styles s
),
MaxKnotLengthDifference as (
    SELECT
        max(knot_length_difference) as max_difference
    FROM
        KnotLengthDifferences
)
SELECT
    k.style,
    k.knot_length_difference
FROM
    KnotLengthDifferences k,
    MaxKnotLengthDifference m
WHERE
    k.knot_length_difference = m.max_difference;


-- Q3
create or replace view Q3(style, lo_knot_length, 
hi_knot_length, min_knot_length, max_knot_length)
as
WITH RugKnotLengths as (
    SELECT
        s.name as style,
        min(r.knot_leng) as lo_knot_length,
        max(r.knot_leng) as hi_knot_length,
        s.min_knot_length,
        s.max_knot_length
    FROM
        styles s 
    JOIN 
        rugs r ON s.id = r.style
    GROUP BY
        s.name, s.min_knot_length, s.max_knot_length
),
RugsOutsideRange as (
    SELECT DISTINCT 
        s.name as style
    FROM
        styles s
    JOIN
        rugs r ON s.id = r.style
    WHERE r.knot_leng < s.min_knot_length OR r.knot_leng > s.max_knot_length
)
SELECT 
    rkl.style, 
    rkl.lo_knot_length, 
    rkl.hi_knot_length, 
    rkl.min_knot_length, 
    rkl.max_knot_length
FROM
    RugKnotLengths rkl 
JOIN
    RugsOutsideRange ror ON rkl.style = ror.style
WHERE
    rkl.min_knot_length <> rkl.max_knot_length;


-- Q4
create or replace view Q4(factory, rating)
as
with RatedRugs as (
    SELECT
        cb.factory as factory_id,
        r.rating::float as rating
    FROM
        rugs r 
    JOIN
        crafted_by cb on r.id = cb.rug
    WHERE
        r.rating is not NULL
),
FactoryRatings as (
    SELECT
        rr.factory_id,
        avg(rr.rating) as avg_rating,
        count(rr.rating) as rug_count
    FROM
        RatedRugs rr 
    GROUP BY
        rr.factory_id
), 
FilteredFactoryRatings as (
    SELECT
        fr.factory_id, fr.avg_rating
    FROM
        FactoryRatings fr
    WHERE
        fr.rug_count >= 5
),
MaxAverageRating as (
    SELECT 
        max(ffr.avg_rating) as max_avg_rating
    FROM
        FilteredFactoryRatings ffr 
)
SELECT
    f.name as factory, ffr.avg_rating::numeric(3, 1) as rating
FROM
    FilteredFactoryRatings ffr 
JOIN
    factories f ON ffr.factory_id = f.id
JOIN
    MaxAverageRating mar ON ffr.avg_rating = mar.max_avg_rating;


-- Q5
create or replace function 
    Q5(pattern text) RETURNS 
    TABLE(rug text, size_and_stoper text, total_knots numeric)
as $$
BEGIN
    RETURN QUERY
    SELECT
        r.name as rug,
        r.size || 'sf ' || r.rug_stop as size_and_stopper,
        (
            COALESCE(r.knot_per_foot, 50)^2 * r.size
        ) :: numeric(8, 0) as total_knots
    FROM
        rugs r 
    WHERE
        r.name SIMILAR TO '%' || pattern || '%';
END;
$$
language plpgsql;


-- Q6
create or replace function
    Q6(pattern text) RETURNS 
    TABLE(province text, first integer, nrugs integer, rating numeric)
as $$
BEGIN
    RETURN QUERY
    SELECT
        l.province as province,
        min(r.year_crafted) :: integer as first,
        count(r.id) :: integer as nrugs,
        avg(r.rating) :: numeric(3, 1) as rating
    FROM 
        locations l
    JOIN
        factories f ON l.id = f.located_in
    JOIN
        crafted_by cb ON f.id = cb.factory
    JOIN
        rugs r ON cb.rug = r.id 
    WHERE
        LOWER(l.province) LIKE LOWER('%' || pattern || '%')
    GROUP BY
        l.province
    HAVING
        COUNT(r.id) > 0;
END;        
$$
language plpgsql;


-- Q7
create or replace function
    Q7(_rugID integer) returns text
as $$
DECLARE
    rug_name text;
    material_record text;
    result text;
BEGIN
    SELECT 
        r.name into rug_name 
    FROM 
        rugs r
    WHERE 
        r.id = _rugID;

    IF rug_name IS NULL THEN
        RETURN 'No such rug (' || _rugID || ')';
    END IF;

    result := '"' || rug_name || '"';

    SELECT 
        STRING_AGG('    ' || sub.name || ' (' || sub.itype || ')', E'\n')
    INTO 
        material_record
    FROM (
        SELECT
            m.name, m.itype
        FROM 
            contains c
        JOIN
            materials m ON c.material = m.id 
        WHERE
            c.rug = _rugID
        ORDER BY 
            m.name
    ) as sub;

    IF material_record IS NULL THEN
        result := result || E'\n  no materials recorded';
    ELSE
        result := result || E'\n  contains:' || E'\n' || material_record;
    END IF;

    RETURN result;
END;
$$
language plpgsql;


-- Q8
drop type IF exists RugPiles CASCADE;
create type RugPiles as (rug text, factory text, piles text);
create or replace function
    Q8(pattern text) returns setof RugPiles
as $$
Declare
    rug_rec RECORD;
    factory_names text;
    pile_names text;
BEGIN
    FOR rug_rec IN
        SELECT r.id, r.name
        FROM rugs r
        WHERE lower(r.name) like lower('%' || pattern || '%')
    LOOP
        SELECT
            STRING_AGG(f.name, '+' ORDER BY f.name)
        INTO
            factory_names 
        FROM 
            crafted_by cb 
        JOIN 
            factories f ON f.id = cb.factory
        WHERE
            cb.rug = rug_rec.id;

        SELECT 
            STRING_AGG(m.name, ',' ORDER BY m.name)
        INTO
            pile_names 
        FROM
            contains c
        JOIN
            materials m ON c.material = m.id 
        WHERE
            c.rug = rug_rec.id AND m.itype = 'pile';

        IF pile_names IS NULL THEN
            pile_names := 'no piles recorded';
        END IF;

        RETURN NEXT (rug_rec.name, factory_names, pile_names);
    END LOOP;
END;
$$
language plpgsql;


-- Q9
drop type if exists Collab CASCADE;
create type Collab as (factory text, collaborator text);
create or replace function
    Q9(factoryID integer) RETURNS setof Collab 
as $$
Declare
    factory_name text;
    collab_name text;
    is_first boolean := TRUE;
BEGIN
    SELECT 
        f.name INTO factory_name
    FROM
        factories f
    WHERE
        id = factoryID;

    IF factory_name IS NULL THEN
        RETURN NEXT (
            cast('No such factory (' || factoryID || ')' as text), 
            cast('none' as text)
        );
        RETURN;
    END IF;

    FOR collab_name IN
        SELECT
            DISTINCT f2.name 
        FROM    
            crafted_by cb1
        JOIN
            crafted_by cb2 ON cb1.rug = cb2.rug AND cb1.factory <> cb2.factory
        JOIN
            factories f2 ON cb2.factory = f2.id 
        WHERE
            cb1.factory = factoryID 
        ORDER BY 
            f2.name
    LOOP
        IF is_first THEN
            RETURN NEXT (factory_name, collab_name);
            is_first := FALSE;
        ELSE
            RETURN NEXT (cast(NULL as text), collab_name);
        END IF;
    END LOOP;

    IF is_first THEN
        RETURN NEXT (factory_name, cast('none' as text));
    END IF;

END;
$$
language plpgsql;