import { inRange, range } from 'lodash';
import { XYZ } from '../util/xyz';
import { officialInput } from './inputs';

enum Tile {
    blank = ' ',
    wall = '#',
    ground = '.'
}

/** Cube face names */
enum F {
    front = 'front',
    back = 'back',
    left = 'left',
    right = 'right',
    top = 'top',
    bottom = 'bottom'
}

function parseInput( input: string ): { directions: string[]; map: Tile[][] } {
    const lines = input.split( '\n' );
    // remove the last to make directions
    return {
        directions: Array.from( lines.pop().matchAll(/\d+|R|L/g) ).map( m => m[0] ),
        map: lines.slice( 0, lines.length - 1 ).map( line => line.split('') as Tile[] )
    }
}

function followDirections( input: string, wrapFunc: (map: Tile[][], position: XYZ, facing: XYZ) => { newPosition: XYZ, newFacing: XYZ } ) {
    const { directions, map } = parseInput( input );

    // coords are [y,x] with [0,0] at top-left
    let position = new XYZ( map[0].indexOf( Tile.ground ), 0 );
    let facing = vectors[0];

    directions.forEach( d => {
        if ( 'RL'.includes(d) ) {
            // rotate right or left
            const diff = d === 'R' ? 1 : 3;
            facing = vectors[ (vectors.indexOf(facing) + diff) % vectors.length ];
        } else {
            range( Number(d) ).forEach( _ => {
                let newPos = XYZ.sum( position, facing );
                let newTile = map[newPos.y]?.[newPos.x];

                // if moving to a blank space, we're actually moving to a new face on the cube
                if ( [Tile.blank, undefined, null].includes(newTile) ) {
                    const result = wrapFunc( map, position, facing );
                    position = result.newPosition;
                    facing = result.newFacing;
                } else if ( newTile === Tile.ground ) {
                    position = newPos;
                }
            });
        }
    });

    return 1000 * (position.y + 1) + 4 * (position.x + 1) + vectors.indexOf( facing );
}

/** a list of directions it's possible to face, in clockwise order */
const vectors = [ new XYZ(1,0), new XYZ(0,1), new XYZ(-1,0), new XYZ(0,-1) ];

function solvePt1() {
    return followDirections( officialInput, (map: Tile[][], position: XYZ, facing: XYZ ) => {
        // scoot backwards until we get to a null or blank position
        const newPos = position.copy();
        do {
            newPos.minus( facing );
        } while ( ![Tile.blank, undefined, null].includes(map[newPos.y]?.[newPos.x]) );
        // move once more and see if we can actually move there
        newPos.plus( facing );
        return {
            newFacing: facing,
            newPosition: map[newPos.y][newPos.x] === Tile.ground ? newPos : position
        };
    });
}

function solvePt2() {
    const faceSize = 50;
    // record the top-left origin coordinates of faces and describe how the faces relate to each other
    //     __ __
    //    |__|__|
    //  __|__|
    // |__|__|
    // |__|
    // create functions that help define how to map the old face (x,y) to new face (x,y) coordinates, relative to face origin
    const zero = ( c: XYZ ) => 0;
    const max = ( c: XYZ ) => faceSize - 1;
    const x = ( c: XYZ ) => c.x;
    const y = ( c: XYZ ) => c.y;
    const yInv = ( c: XYZ ) => faceSize - 1 - c.y;
    // for each neighbors array, the index of the array describes which face we're moving onto based on the direction we're facing,
    // and the array at that index describes:
    // [target face, how we rotate when moving to the new face, a function to find the x position on the new face, a function to find the y position on the new face]
    const faces: { [key in F]: { origin: XYZ, neighbors: [F, number, (c:XYZ) => number, (c:XYZ) => number][] } } = {
        top: {
            origin: new XYZ( 1, 0 ),
            neighbors: [ [F.right, 0, zero, y],    [F.front, 0, x, max],   [F.left, 2, zero, yInv], [F.back, 1, zero, x] ]
        },
        right: {
            origin: new XYZ( 2, 0 ),
            neighbors: [ [F.bottom, 2, x, yInv],   [F.front, 1, max, x],   [F.top, 0, max, y],      [F.back, 0, x, max] ]
        },
        front: {
            origin: new XYZ( 1, 1 ),
            neighbors: [ [F.right, 3, y, max],     [F.bottom, 0, x, zero], [F.left, 3, y, zero],    [F.top, 0, x, max] ]
        },
        left: {
            origin: new XYZ( 0, 2 ),
            neighbors: [ [F.bottom, 0, zero, y],   [F.back, 0, x, zero],   [F.top, 2, zero, yInv],  [F.front, 1, zero, x] ]
        },
        bottom: {
            origin: new XYZ( 1, 2 ),
            neighbors: [ [F.right, 2, max, yInv],  [F.back, 1, max, x],    [F.left, 0, max, y],     [F.front, 0, x, max] ]
        },
        back: {
            origin: new XYZ( 0, 3 ),
            neighbors: [ [F.bottom, 3, y, max],    [F.right, 0, x, zero],  [F.top, 3, y, zero],     [F.left, 0, y, max] ]
        } 
    };

    // scale origins by face size
    Object.keys( faces ).forEach( k => faces[k as F].origin.times(faceSize) );

    return followDirections( officialInput, (map: Tile[][], position: XYZ, facing: XYZ) => {
        // find the label for the current face
        const currentFace = Object.entries( faces ).find( entry => {
            const [ origin, end ] = [ entry[1].origin, entry[1].origin.copy().plus([faceSize,faceSize]) ];
            return inRange( position.x, origin.x, end.x ) && inRange( position.y, origin.y, end.y );
        })[0] as F;

        const newFace = faces[currentFace].neighbors[vectors.indexOf(facing)];
        // find the position relative to the origin of the current face
        const posOnFace = position.copy().minus( faces[currentFace].origin );
        // given the position on the old face, find the position we're moving to on the new face (relative to its origin)
        const posOnNewFace = new XYZ( newFace[2](posOnFace), newFace[3](posOnFace) );
        // find the new position relative to the original map, and find the tile on the map
        const newPos = XYZ.sum( posOnNewFace, faces[newFace[0]].origin );
        const newTile = map[newPos.y][newPos.x];
        if ( newTile === Tile.ground ) {
            facing = vectors[ (vectors.indexOf(facing) + newFace[1]) % vectors.length ];
            position = newPos;
        }
        return {
            newPosition: position,
            newFacing: facing
        };
    });
}

console.log( 'Answer for part 1: ', solvePt1() );
console.log( 'Answer for part 2: ', solvePt2() );
