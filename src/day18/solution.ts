import { inRange, range } from 'lodash';
import { outputAnswers } from '../output-answers';
import { officialInput, testInput } from './inputs';

interface ICube {
    coords: number[];
    /** an array representing whether it has neighbors at [x+, x-, y+, y-, z+, z-] */
    hasNeighbors: boolean[];
}

function parseInput( input: string ) {
    const map = new Map<string, ICube>();
    input.split( '\n' ).map(
        line => line.split( ',' ).map( Number )
    ).map( coords => {
        const cube = {
            coords: coords,
            hasNeighbors: new Array( 6 ).fill( null )
        };
        map.set( coords.join(','), cube );
    });
    return map;
}

function getNeighbors( coords: number[] ): number[][] {
    return [ [1,0,0], [-1,0,0], [0,1,0], [0,-1,0], [0,0,1], [0,0,-1] ].map(
        diff => coords.map( (v, i) => v + diff[i])
    );
}

outputAnswers(
    testInput,
    officialInput,
     // function that solves part 1
    ( input: string ) => {
        const blocks = parseInput( input );
        blocks.forEach( block => {
            getNeighbors( block.coords ).forEach(
                (neighbor, i) => block.hasNeighbors[i] = blocks.has( neighbor.join(',') )
            );
        });

        // count the number of falses in 'hasNeighbors' across all block
        return Array.from( blocks.values() ).map( b => b.hasNeighbors.filter(v => !v) ).flat().length;
    },
     // function that solves part 2
    ( input: string ) => {
        const blocks = parseInput( input );
        // find max and min x, y, and z
        const valArrays = range( 3 ).map(
            i => Array.from( blocks.values() ).map( b => b.coords[i] )
        );
        const [ minX, minY, minZ ] = valArrays.map( vs => Math.min(...vs) - 1 );
        const [ maxX, maxY, maxZ ] = valArrays.map( vs => Math.max(...vs) + 1 );
        const mins = [ minX, minY, minZ ];
        const maxes = [ maxX, maxY, maxZ ];
        // We now have the bounds of a cube that contains the blocks, with a bit of margin on every side.
        // Use a breadth first search starting at the corner to fill a volume of air all around the blocks, limited by our cube.
        // For each block of air, count how many sides touch a block of non-air.
        const visited = new Map<string,boolean>([ ['0,0,0', true] ]);
        let surfaceArea = 0;
        const queue: number[][] = [ [minX,minY,minZ] ];
        while ( queue.length > 0 ) {
            getNeighbors( queue.pop() ).filter(
                // get neighbors within the min/max bounding cube that have not yet been vitied
                neighbor => neighbor.every( (v, i) => inRange(v, mins[i], maxes[i] + 1) ) && !visited.has( neighbor.join(',') )
            ).forEach( neighbor => {
                // if it's a block of air, add it to visited and to the queue. If it's a block of rock, increment surface area
                if ( blocks.has(neighbor.join(',')) ) {
                    surfaceArea++;
                } else {
                    visited.set( neighbor.join(','), true );
                    queue.unshift( neighbor );
                }
            });
        }
        return surfaceArea;
    }
);
