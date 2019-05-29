var program = require( 'commander' )

const HullTypeEnum = Object.freeze( { 'cat': 'cat', 'mono': 'mono' } )
const MM_PER_INCH = 25.4
const INCHES_PER_FOOT = 12
const FEET_PER_MILE = 5280

const SEC_PER_MIN = 60
const MIN_PER_HR = 60
const SEC_PER_HR = MIN_PER_HR * SEC_PER_MIN

const LIPO_CELL_NOMINAL_VOLTS = 3.7

const PCT_SLIPPAGE_MONO = 25
const PCT_SLIPPAGE_CAT = 20

program
    .version( '0.0.1' )
    .description( 'FE boat speed calculator' )
    .usage( ' ' )
    .option( '-d, --propdia <propdia>', 'Prop diameter mm, e.g., 45', parseInt )
    .option( '-p, --pitch <pitch>', 'Prop pitch, e.g., 1.4', parseFloat )
    .option( '-k, --kv <motorkv>', 'Motor KV, e.g., 1650', parseInt )
    .option( '-s, --cellcounts <cellcounts>', 'LiPo cell count (S), e.g., 6', parseInt )
    .option( '--hull <cat|mono>', 'Hull type: cat or mono' )
    .parse( process.argv )

process.exitCode = 1
if ( !program.propdia || !program.pitch || !program.kv || !program.cellcounts ||
    ( program.hull != HullTypeEnum.cat && program.hull != HullTypeEnum.mono ) )
{
    program.help()
}

var slippagePct = PCT_SLIPPAGE_MONO
if ( program.hull === HullTypeEnum.cat ) { slippagePct = PCT_SLIPPAGE_CAT }
inputParameters =
    {
        propDiameter: program.propdia,
        propPitch: program.pitch,
        motorKv: program.kv,
        lipoCellCount: program.cellcounts,
        hullType: program.hull,
        slippagePct: slippagePct
    }
var calculations =
{
    inputParameters: inputParameters,
    totalPropPitch: program.propdia * program.pitch,
    lipoPackVoltage: calcLipoBatteryPackVoltage( program.cellcounts ),
    estMotorRpmPerVolt: calcRpmUnderLoad( program.kv )
}

calculations.estMotorRpm = calculations.estMotorRpmPerVolt * calculations.lipoPackVoltage
calculations.mph = calcBoatSpeedMph( program.propdia, program.pitch, calculations.estMotorRpm, slippagePct )

console.log( JSON.stringify( calculations ) )
process.exitCode = 0
/////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////// LOCAL FUNCTIONS ///////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

function calculateAvgAmps( mAh, secondsOfRuntime )
{
    return Math.round( 3.6 * mAh / secondsOfRuntime * 100 ) / 100.0
}

// prop pitch millimeters
function calcTotalPropPitchMm( propDiaMm, propPitch )
{
    var totalPitchMm = propDiaMm * propPitch
    return totalPitchMm
}

function calcBoatSpeedMph( propDiaMm, propPitch, motorRpm, slippagePct )
{
    var totalPitchMm = calcTotalPropPitchMm( propDiaMm, propPitch )
    var totalPitchIn = Math.round( totalPitchMm / MM_PER_INCH * 100 ) / 100
    var mmPerMinute = totalPitchMm * motorRpm
    // var metersPerSec = mmPerMinute / 1000 / SEC_PER_MIN
    var ftPerSec = mmPerMinute / MM_PER_INCH / INCHES_PER_FOOT / SEC_PER_MIN
    var mph = ftPerSec * SEC_PER_HR / FEET_PER_MILE
    return Math.round( mph * ( 100 - slippagePct ) ) / 100
}

function calcLipoBatteryPackVoltage( cellCountS )
{
    return Math.round( cellCountS * LIPO_CELL_NOMINAL_VOLTS )
}

// Estimated RPM under load per volt.
function calcRpmUnderLoad( motorKv, motorEfficiency = .92 )
{
    return motorKv * motorEfficiency
}