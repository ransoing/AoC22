import { isEqual } from 'lodash';
import { outputAnswers } from '../output-answers';
import { officialInput, testInput } from './inputs';

type Node = number[];

function solve( input: string ) {
    // find locations of start and end points
    const cols = input.indexOf( '\n' ) + 1;
    const [ start, end ] = [ 'S', 'E' ].map( l => {
        const index = input.indexOf( l );
        return [ Math.floor(index/cols), index % cols ];
    });
    // parse the grid as char codes, replacing start and end points with their height values
    const map = input.replace( 'S', 'a' ).replace( 'E', 'z' ).split( '\n' ).map(
        line => line.split( '' ).map( l => l.charCodeAt(0) )
    );
    
    return bfsRoute( map, start, end );
}

/**
 * Uses a breadth-first search algorithm to find the shortest path from start to the end. I decided to implement this instead of importing
 * one because I'd never done a breadth-first search before.
 */
function bfsRoute( map: number[][], start: Node, end: Node ) {
    const height = ( coords: number[] ) => map[coords[0]]?.[coords[1]]; // the height at given coordinates
    const queue: [ Node, number ][] = [ [start, 0] ]; // keeps track of node to check and its distance from the start
    const visited = new Set<string>([ start.toString() ]);
    // loop until one route has found the end
    while ( queue.length > 0 ) {
        const [ coords, distance ] = queue.pop();
        if ( isEqual(coords, end) ) {
            return distance;
        }

        [ [1, 0], [-1, 0], [0, 1], [0, -1] ]
        // convert diffs from current position to potential new coordinates
        .map( diff => [coords[0] + diff[0], coords[1] + diff[1]] )
        // only navigate if we will still be in bounds on the map, if the new spot isn't too high, and if we haven't already visited it
        .filter( next => height(next) != null && height(next) <= height(coords) + 1 && !visited.has(next.toString()) )
        .forEach( next => {
            visited.add( next.toString() );
            queue.unshift([ next, distance + 1 ]);
        });
    }

    return Number.MAX_SAFE_INTEGER;
}

outputAnswers(
    testInput,
    officialInput,
    ( input: string ) => solve( input ), // function that solves part 1
    ( input: string ) => {
         // function that solves part 2
        input = input.replace( 'S', 'a' ); // ignore the original starting location
        return Math.min(
            // treat each 'a' as a starting point and brute-force solve for all a's
            ...Array.from( input.replace('S', 'a').matchAll(/a/g) ).map( match => {
                return solve( input.substring(0, match.index) + 'S' + input.substring(match.index+1) );
            })
        )
    }
);
