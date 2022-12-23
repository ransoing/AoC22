import { range } from 'lodash';
import { XYZ } from '../util/xyz';
import { outputAnswers } from '../output-answers';
import { officialInput, testInput } from './inputs';

// use trigonometry to define 1-magnitue vectors for each of 8 compass directions
let [ N, NE, E, SE, S, SW, W, NW ] = range( 8 ).map(
    i => new XYZ( Math.round( Math.sin(i*Math.PI/4) ), -Math.round( Math.cos(i*Math.PI/4) ) )
);
const toKey = a => a.toString();

/** Returns a map whose keys are positions of elves, and the values are the elf's proposed position */
function parseInput( input: string ) {
    return new Map(
        input.split( '\n' ).map(
            (line, y) => Array.from( line.matchAll(/#/g) ).map( m => {
                return [ toKey([m.index,y,0]), null ] as [ string, XYZ ];
            })
        ).flat()
    );
}

/** Calculates how every elf will step, and changes their position, for a defined number of rounds. Returns total empty tiles. */
function doRounds( elves: Map<string,XYZ>, numRounds: number, roundOffset = 0 ) {
    // store the number of times each coordinate has been proposed for movement
    const proposedCount = new Map<string,number>();
    
    /** Takes a list of cardinal directions and checks if those directions relative to the elf are vacant */
    function areVacant( elf: XYZ, ...diffs: XYZ[] ): boolean {
        return diffs.every(
            diff => !elves.has( toKey(XYZ.sum(elf,diff)) )
        );
    }
    
    /** Functions that check whether specific neighboring spaces are vacant, and returns the proposed position relative to the elf */
    const getNewPosition = [
        (elf: XYZ) => areVacant( elf, N, NE, NW ) ? N : null,
        (elf: XYZ) => areVacant( elf, S, SE, SW ) ? S : null,
        (elf: XYZ) => areVacant( elf, W, NW, SW ) ? W : null,
        (elf: XYZ) => areVacant( elf, E, NE, SE ) ? E : null
    ];

    // keep track of the number of times elves move
    let numMoves = 0;

    range( numRounds ).forEach( i => {
        proposedCount.clear();

        Array.from( elves.keys() ).forEach( key => {
            const elf = new XYZ( key.split(',').map(Number) );
            // if any of the adjacent spots are not vacant, consider moving
            if ( !areVacant(elf, N, NE, E, SE, S, SW, W, NW) ) {
                // propose moving in each of four different directions
                range( getNewPosition.length ).forEach( j => {
                    if ( elves.get(key) == null ) {
                        const newPosDiff = getNewPosition[(i + j + roundOffset) % getNewPosition.length]( elf );
                        if ( newPosDiff != null ) {
                            const newPos = XYZ.sum( elf, newPosDiff );
                            elves.set( key, newPos );
                            const currentCount = proposedCount.get( toKey(newPos) );
                            proposedCount.set( toKey(newPos), currentCount == null ? 1 : currentCount + 1 );
                        }
                    }
                });
            }
        });
    
        // get only the elves that don't share a proposed position with another elf
        Array.from( elves.entries() ).forEach( entry => {
            // if exactly one elf has proposed to go to this elf's proposed position, delete the elf's entry at the current position
            // and set it to a new position
            if ( entry[1] != null && proposedCount.get( toKey(entry[1]) ) === 1 ) {
                numMoves++;
                elves.delete( entry[0] );
                elves.set( toKey(entry[1]), null );
            } else {
                // set the elf's proposed position to null
                elves.set( entry[0], null );
            }
        });
    });

    // find the bounds of the elves' positions
    const allX = Array.from( elves.keys() ).map( key => Number(key.split(',')[0]) );
    const allY = Array.from( elves.keys() ).map( key => Number(key.split(',')[1]) );
    const area = ( Math.max(...allX) - Math.min(...allX) + 1 ) * ( Math.max(...allY) - Math.min(...allY) + 1 );
    return {
        emptySpaces: area - elves.size,
        moves: numMoves
    };
}

outputAnswers(
    testInput,
    officialInput,
     // function that solves part 1
    ( input: string ) => doRounds( parseInput(input), 10 ).emptySpaces,
     // function that solves part 2
    ( input: string ) => {
        const elves = parseInput( input );
        let i = 0;
        while ( true ) {
            if ( doRounds(elves, 1, i).moves === 0 ) {
                return i + 1;
            }
            i++;
        }
    }
);
