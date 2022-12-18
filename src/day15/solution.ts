import { inRange, isEqual, uniqWith } from 'lodash';
import { outputAnswers } from '../output-answers';
import { officialInput, testInput } from './inputs';

interface ISensor {
    x: number;
    y: number;
    distance: number;
    beacon: {
        x: number;
        y: number;
    }
}

interface IRowInfo {
    range: number[];
    hole: number;
}

function parseInput( input: string ): ISensor[] {
    return input.split( '\n' ).map( line => {
        const parts = line.split( ':' );
        const sensor = {
            x: Number( parts[0].match( /x=(-?\d+)/ )[1] ),
            y: Number( parts[0].match( /y=(-?\d+)/ )[1] ),
            distance: null,
            beacon: {
                x: Number( parts[1].match( /x=(-?\d+)/ )[1] ),
                y: Number( parts[1].match( /y=(-?\d+)/ )[1] )
            }
        };
        sensor.distance = getDistance( sensor.x, sensor.y, sensor.beacon.x, sensor.beacon.y );
        return sensor;
    });
}

/** Returns a list of known beacon positions, without duplicates */
function getUniqueBeacons( sensors: ISensor[] ) {
    return uniqWith( sensors.map(s => {
        return {
            x: s.beacon.x,
            y: s.beacon.y
        }
    }), isEqual );
}

/**
 * Returns total x-range spanned by sensors on this row, as well as the x-coordinate of where an add'l beacon might be (if any).
 * This solution uses the hint given in pt 2 of the puzzle that there is only a single possible place where an add'l beacon might be.
 * In other words, either the sensors span the entire row, or there is exactly one coordinate that evades the sensors.
 */
function getRowInfo( sensors: ISensor[], row: number ): IRowInfo {
    // Find the coverage of x-ranges at this row, represented by [x1, x2] for each beacon. Coverage is from x1 (inclusive) to x2 (exclusive)
    // Filter out sensors that don't have coverage on this row and sort by x1, then x2
    const ranges = sensors.map( s => {
        const distanceAtRow = s.distance - Math.abs( s.y - row );
        return distanceAtRow < 0 ? null : [ s.x - distanceAtRow, s.x + distanceAtRow + 1 ];
    }).filter( range => range != null );

    const totalRange = ranges.length === 0 ? null : [ Math.min(...ranges.map(r => r[0])), Math.max(...ranges.map(r => r[1])) ];
    return {
        range: totalRange,
        // Determine if there is a spot with no coverage by finding if the position after the end of a range is not covered by other ranges,
        // and is within the entire range on this row.
        // Return that position if it exists.
        hole: ranges.find(
            r => ranges.every(
                r2 => inRange( r[1], totalRange[0], totalRange[1] ) && !inRange( r[1], r2[0], r2[1] )
            )
        )?.[1]
    }
}

function getDistance( x1: number, y1: number, x2: number, y2: number ):number {
    return Math.abs( x2 - x1 ) + Math.abs( y2 - y1 );
}

outputAnswers(
    testInput,
    officialInput,
     // function that solves part 1
    ( input: string ) => {
        const row = 2000000;
        const sensors = parseInput( input );
        const info = getRowInfo( sensors, row );
        if ( info.range == null ) return;
        const beaconsInRange = getUniqueBeacons( sensors ).filter( b => b.y === row && inRange(b.x, info.range[0], info.range[1]) );
        return info.range[1] - info.range[0] - beaconsInRange.length - (info.hole ? 1 : 0 );
    },
     // function that solves part 2
    ( input: string ) => {
        const sensors = parseInput( input );
        for ( let y = 0; y <= 4000000; y++ ) {
            const info = getRowInfo( sensors, y );
            if ( info.range != null && info.hole != null ) {
                return info.hole * 4000000 + y;
            }
        }
    }
);
