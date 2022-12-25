import { inRange, sum } from 'lodash';
import { XYZ } from '../util/xyz';
import { outputAnswers } from '../output-answers';
import { officialInput, testInput } from './inputs';

enum direction { up = 'up', down = 'down', left = 'left', right = 'right' }
interface Blizzards {
    initial: boolean[][],
    offset: XYZ
}
type BlizzMap = { [key in direction]: Blizzards }

/** Takes an array of strings and returns a 2D array of whether each character matches the given one */
function charIs( strings: string[], char: string ): boolean[][] {
    return strings.map( str => str.split('').map(c => c === char) );
}

const directions = [ [0,-1], [0,1], [-1,0], [1,0], [0,0] ].map( c => new XYZ(c) );
const [ up, down, left, right, wait ] = directions;

function parseInput( input: string ): BlizzMap {
    // slice off the first and last row and column to remove the walls and set 0,0 as the top-left non-wall space
    const lines = input.split( '\n' ).slice( 1, -1 ).map( l => l.slice(1, -1) );
    // For each set of blizzards the move in the same direction, record their initial positions, and how to offset which spot to check
    // after a single minute. For example, if the pattern of right-moving blizzards in a single row is '>..>>' and you want to check index 3
    // after 1 minute, just check index 2 instead to see if there's a blizzard there. The pattern will always stay the same, so we can just
    // offset which index we check based on the number of elapsed minutes instead of simulating the motion of every blizzard.
    return {
        right: {
            initial: charIs( lines, '>' ),
            offset: left
        },
        left: {
            initial: charIs( lines, '<' ),
            offset: right
        },
        up: {
            initial: charIs( lines, '^'  ),
            offset: down
        },
        down: {
            initial: charIs( lines, 'v' ),
            offset: up
        }
    };
}

function spotIsEmpty( blizz: BlizzMap, spot: XYZ, minute: number ): boolean {
    // check for the presence of blizzards
    return Object.keys( blizz ).every( (key: direction) => {
        // offset the spot to check by an amount relative to how many minutes have passed
        const hasBlizzard = blizz[key].initial;
        const spotToCheck = blizz[key].offset.copy().times( minute ).plus( spot );
        [ ['x',hasBlizzard[0].length], ['y',hasBlizzard.length] ].forEach( (vals: [string,number]) => {
            // keep the x,y coordinates within valid bounds, wrapping around if needed
            const [ prop, maxLength ] = vals;
            spotToCheck[prop] = spotToCheck[prop] % maxLength;
            if ( spotToCheck[prop] < 0 ) {
                spotToCheck[prop] = maxLength + spotToCheck[prop];
            }
        });
        return !hasBlizzard[spotToCheck.y][spotToCheck.x];
    });
}

function findShortestPath( blizz: BlizzMap, entrance: XYZ, exit: XYZ, startMinute: number ): number {
    const numCols = blizz.right.initial[0].length;
    const numRows = blizz.right.initial.length;
    // the visited Map keys look like `x,y,minute`
    const visited = new Map<string,boolean>([ [`${entrance.x},${entrance.y},${startMinute}`,true] ]);
    // prepare the BFS
    let queue = [{ position: entrance, minute: startMinute }];
    // keep a map of farthest distances reached per minute
    let farthestDistance = new Map<number,number>();

    while ( queue.length > 0 ) {
        const state = queue.pop();
        if ( state.position.eq(exit) ) {
            return state.minute;
        }
        farthestDistance.set(
            state.minute,
            Math.max( state.position.x + state.position.y, farthestDistance.get(state.minute) ?? 0 )
        );

        // add all valid moves to the queue
        queue.unshift(
            ...directions.map( direction => {
                return {
                    position: state.position.copy().plus( direction ),
                    minute: state.minute + 1
                };
            }).filter( (newState, i) => {
                // check that we haven't seen this state before
                if ( visited.has(`${newState.position.x},${newState.position.y},${newState.minute}`) ) {
                    return false;
                }
                // check that the new position is within bounds of the map and doesn't have a blizzard,
                // with special cases for the entrance and exit
                let willMove = false;
                if ( newState.position.eq(entrance) && directions[i].eq(wait) || newState.position.eq(exit) ) {
                    willMove = true;
                } else {
                    willMove = inRange( newState.position.x, 0, numCols ) &&
                        inRange( newState.position.y, 0, numRows ) &&
                        spotIsEmpty( blizz, newState.position, newState.minute );
                }
                if ( willMove ) {
                    visited.set( `${newState.position.x},${newState.position.y},${newState.minute}`, true );
                }
                return willMove;
            })
        );
    }
}

function solve( input: string, journeys: 1 | 3 ): number {
    const blizz = parseInput( input );
    const start = new XYZ( 0, -1 );
    const end = new XYZ( blizz.right.initial[0].length - 1, blizz.right.initial.length );
    const leg1 = findShortestPath( blizz, start, end, 0 );
    if ( journeys === 1 ) return leg1;
    const leg2 = findShortestPath( blizz, end, start, leg1 );
    const leg3 = findShortestPath( blizz, start, end, leg2 );
    return leg3;
}

outputAnswers(
    testInput,
    officialInput,
     // function that solves part 1
    ( input: string ) => solve( input, 1 ),
     // function that solves part 2
    ( input: string ) => solve( input, 3 )
);
