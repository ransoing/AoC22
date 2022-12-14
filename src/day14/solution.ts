import { clone, isEqual, range } from 'lodash';
import { outputAnswers } from '../output-answers';
import { officialInput, testInput } from './inputs';

enum Tile {
    air = '.',
    rock = '#',
    sand = 'O'
}

function solve( input: string, addFloor = false ) {
    // parse input into a series of paths composed of segments
    const paths = input.split( '\n' ).map(
        line => line.split( ' -> ' ).map(
            coords => coords.split( ',' ).map( Number )
        )
    );
    // find the limits of the grid before we build it
    const [ highestX, highestY ] = [ 0, 1 ].map(
        i => Math.max(
            ...paths.flat().map( coords => coords[i] )
        )
    );
    
    // initially fill the grid with air. The X dimension needs + 1 to avoid off-by-one errors. The Y dimension needs extras to allow
    // drawing a floor at the bottom or detecting when sand has fallen past where that floor would be if we don't add it
    const grid = range( highestX + 1 ).map( _ => new Array(highestY + 4).fill(Tile.air) );

    paths.forEach( segments => {
        segments.forEach( (segment, i) => {
            if ( i === 0 ) return;
            // for the range of x0,y0 to x1,y1, fill the spots and those between with rock. One of these loops will execute exactly once.
            rangeIncl( segments[i-1][0], segment[0] ).forEach(
                x => rangeIncl( segments[i-1][1], segment[1] ).forEach(
                    y => grid[x][y] = Tile.rock
                )
            );
        });
    });

    if ( addFloor ) {
        grid.forEach( r => r[highestY + 2] = Tile.rock );
    }

    // the grid of rock is built. Now simulate sand
    const source = [ 500, 0 ];
    let grains = 0;
    let grainPos = clone( source );

    // a function to easily retrieve what is at a given spot in the grid
    const gridAt = ( pos: number[] ) => {
        // expand the grid if needed
        if ( pos[0] >= grid.length ) {
            grid.push( clone(grid[0]) );
        }
        return grid[pos[0]][pos[1]];
    };

    do {
        // move the grain of sand to an empty spot. Potential new spots are below and (center || left || right), in that order
        const spots = [ 0, -1, 1 ].map( diff => [grainPos[0] + diff, grainPos[1] + 1] );
        const empty = spots.find( newPos => gridAt(newPos) === Tile.air );
        if ( empty != null ) {
            grid[grainPos[0]][grainPos[1]] = Tile.air;
            grid[empty[0]][empty[1]] = Tile.sand;
            grainPos = empty;
        } else {
            grains++;
            if ( isEqual(grainPos, source) ) {
                break;
            } else {
                grainPos = clone( source );
            }
        }
    } while ( grainPos[1] <= highestY + 2 );

    return grains;
}

// returns a range of numbers that includes the 'to' number, unlike lodash's `range`. The numbers are not necessarily sorted
const rangeIncl = ( from: number, to: number ) => [ ...range(from, to), to ];

outputAnswers(
    testInput,
    officialInput,
     // function that solves part 1
     ( input: string ) => solve( input ),
     // function that solves part 2
    ( input: string ) => solve( input, true )
);
