// this only solves part 1.
import { inRange, isEqual, uniqWith } from 'lodash';
import { outputAnswers } from '../output-answers';
import { officialInput, testInput } from './inputs';

function parseInput( input: string, rowNum: number ) {
    const sensors = input.split( '\n' ).map( line => {
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

    const uniqueBeacons = uniqWith( sensors.map(s => {
        return {
            x: s.beacon.x,
            y: s.beacon.y
        }
    }), isEqual );

    // get an array of [x1, x2] coverage ranges at the row of interest, where coverage is from x1 up to, but not including, x2.
    return sensors.map( sensor => {
        // calculate the coverage on this row to either side of sensor.x. Return null if there is no coverage.
        const distanceAtRow = sensor.distance - Math.abs( sensor.y - rowNum );
        return distanceAtRow < 0 ? null : [ sensor.x - distanceAtRow, sensor.x + distanceAtRow + 1 ];
    }).filter(
        // filter out the sensors for which there is no coverage on this row
        range => range != null
    ).filter( (range, i, ranges) => {
        // keep the ranges that are not entirely contained within other ranges.
        return ranges.every( (otherRange, j) => i === j || !(range[0] >= otherRange[0] && range[1] <= otherRange[1]) );
    }).map( (range, i, ranges) => {
        // Adjust this range to represent values that each range encompasses that no other range encompasses.
        // Only look forward in the array when adjusting these ranges.
        // Adjust this range by setting its start to the end value of another range that overlaps the left side of this range.
        const start = Math.max( range[0], ...ranges.slice(i+1).filter(r => r[1] <= range[1]).map(r => r[1]) );
        // Adjust this range by setting its end to the start of another range that overlaps the right side of this range.
        const end = Math.min( range[1], ...ranges.slice(i+1).filter(r => r[0] >= range[0]).map(r => r[0]) );
        // return the new adjusted range, or null if this range doesn't encompass a range > 0
        return start < end ? [ start, end ] : null;
    }).filter(
        // remove the ranges that have no unique values
        range => range != null
    ).reduce( (total, range) => {
        // add the total coverage spanned by each range, now that they have no overlap.
        // Subtract 1 for every known beacon or sensor in this range and on this row.
        const sensorsInRange = sensors.filter( s => s.y === rowNum && inRange(s.x, range[0], range[1]) ).length;
        const beaconsInRange = uniqueBeacons.filter( b => b.y === rowNum && inRange(b.x, range[0], range[1]) ).length;
        // console.log( sensorsInRange, beaconsInRange );
        return total + range[1] - range[0] - sensorsInRange - beaconsInRange;
    }, 0 );
}

function getDistance( x1: number, y1: number, x2: number, y2: number ):number {
    return Math.abs( x2 - x1 ) + Math.abs( y2 - y1 );
}

outputAnswers(
    testInput,
    officialInput,
     // function that solves part 1
    ( input: string ) => parseInput( input, 2000000 ),
     // function that solves part 2
    ( input: string ) => null
);
