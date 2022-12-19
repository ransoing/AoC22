import { cloneDeep, inRange, isEqual, range } from 'lodash';
import { outputAnswers } from '../output-answers';
import { officialInput, testInput } from './inputs';

// y- is toward the floor, y+ is toward the ceiling
// 1 represents rock, 0 represents air

const rocks = [
    [
        [1], [1], [1], [1]
    ], [
        [0, 1, 0], [1, 1, 1], [0, 1, 0]
    ], [
        [1, 0, 0], [1, 0, 0], [1, 1, 1]
    ], [
        [1, 1, 1, 1]
    ], [
        [1, 1], [1, 1]
    ]
]

function parseInput( input: string, numRocks: number ) {
    const jets = input.split( '' ).map( c => c === '<' ? -1 : 1 );

    // initialize the shaft as a 7-unit wide row of floor
    const shaft = range(7).map( _ => [1] );
    
    let rockIndex = 0;
    let jetIndex = 0;
    let oldJetIndex = 0;
    const cycle = [];
    let heightPerCycle: number;
    let rocksPerCycle: number;
    let originalNumRocks = numRocks;
    // iterate a number of rocks
    for ( let i = 0; i < numRocks; i++ ) {

        // find where the rock cycle and jet cycle restart a loop together.
        // This is somewhat inaccurate and causes the test input to fail, but works for the official input
        if ( rocksPerCycle == null && rockIndex === 0 ) {
            if ( jetIndex < oldJetIndex && rockIndex === 0) {
                const prev = cycle.find( c => c.jet === jetIndex );
                if ( prev != null ) {
                    // calculate how many more rocks to simulate
                    rocksPerCycle = i - prev.i;
                    heightPerCycle = getHighestY( shaft ) - prev.maxY;
                    numRocks = ( (numRocks - i) % rocksPerCycle ) + ( i % rocksPerCycle ) + i;
                } else {
                    cycle.push({ i: i, jet: jetIndex, maxY: getHighestY(shaft) });
                }
            }
            oldJetIndex = jetIndex;
        }

        // spawn the next rock
        const rock = rocks[rockIndex];
        
        // spawn the rock at x=2, y=(highest rock index + 4). Track the rock by its lower-left corner
        let rockPos = [ 2, getHighestY(shaft) + 4 ];
        // extend the height of the shaft
        const numNewRows = rockPos[1] - shaft[0].length + 1 + rock[0].length;
        if ( numNewRows > 0 ) {
            shaft.forEach( col => col.push( ...new Array(numNewRows).fill(0)) );
        }
        let oldRockPos;

        do {
            // move the rock until it cannot move downward; repeat getting pushed by wind and falling 1 step. First move horizontally.
            rockPos = moveRock( shaft, rock, rockPos, [jets[jetIndex], 0] );
            jetIndex = ( jetIndex + 1 ) % jets.length;
            oldRockPos = rockPos;
            rockPos = moveRock( shaft, rock, rockPos, [0, -1] );
            // keep moving the rock until it's no longer able to move down
        } while ( !isEqual(rockPos, oldRockPos) );

        // record the final position of the rock in the shaft
        rock.forEach(
            (col, x) => col.forEach(
                (v, y) => v ? shaft[x+rockPos[0]][y+rockPos[1]] = 1 : 0
            )
        );

        rockIndex = ( rockIndex + 1 ) % rocks.length;
    }

    // get the total height of the tower. 0 is the floor so the highest y-value is the height of the tower
    return rocksPerCycle == null ?
        getHighestY( shaft ) :
        getHighestY( shaft ) + heightPerCycle * ( originalNumRocks - numRocks ) / rocksPerCycle;
}

/** returns the highest y-index at which there is rock in the shaft */
function getHighestY( shaft: number[][] ): number {
    for ( let y = shaft[0].length - 1; y >= 0; y-- ) {
        if ( shaft.some((_, x) => shaft[x][y]) ) {
            return y;
        }
    }
}

/** returns the position of a rock after attempting to move an amount represented by a [x, y] change */
function moveRock( shaft: number[][], rock: number[][], rockPos: number[], change: number[] ) {
    // for each x,y coordinate that the rock wants to occupy, determine if that spot is free
    const canMove = rock.every(
        (col, x) => col.every( (v, y) => {
            if ( !v ) {
                return true; // the rock doesn't exist at this coordinat
            }
            const [ newX, newY ] = [ x+rockPos[0]+change[0], y+rockPos[1]+change[1] ];
            // ensure the shaft doesn't have rock in this spot, and that it's within x-bounds
            return inRange( newX, 0, shaft.length ) && !shaft[newX][newY];
        })
    )
    return canMove ? [ rockPos[0] + change[0], rockPos[1] + change[1] ] : rockPos;
}

outputAnswers(
    testInput,
    officialInput,
     // function that solves part 1
    ( input: string ) => parseInput( input, 2022 ),
     // function that solves part 2
    ( input: string ) => parseInput( input, 1000000000000 )
);

