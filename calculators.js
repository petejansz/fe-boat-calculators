const MM_PER_INCH = 25.4
const INCHES_PER_FOOT = 12
const FEET_PER_MILE = 5280

const SEC_PER_MIN = 60
const MIN_PER_HR = 60
const SEC_PER_HR = MIN_PER_HR * SEC_PER_MIN

const LIPO_CELL_NOMINAL_VOLTS = 3.7

const PCT_SLIPPAGE_MONO = 25
const PCT_SLIPPAGE_CAT = 20

var propDiaMm = 52
var propPitch = 1.4
var motorRpm = 30000
var slippagePct = PCT_SLIPPAGE_CAT
var motorKv = 1650

var estMotorRpmLoaded = calcLipoBatteryPackVoltage (6) * calcRpmUnderLoad( motorKv )
var estMph = calcPropSpeed( propDiaMm, propPitch, estMotorRpmLoaded, slippagePct )

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

function calcPropSpeed( propDiaMm, propPitch, motorRpm, slippagePct )
{
    var totalPitchMm = calcTotalPropPitchMm( propDiaMm, propPitch )
    var totalPitchIn = Math.round( totalPitchMm / MM_PER_INCH * 100 ) / 100
    var mmPerMinute = totalPitchMm * motorRpm
    // var metersPerSec = mmPerMinute / 1000 / SEC_PER_MIN
    // var Km_H1 = metersPerSec * SEC_PER_HR / 1000
    var ftPerSec = mmPerMinute / MM_PER_INCH / INCHES_PER_FOOT / SEC_PER_MIN
    var mph = ftPerSec * SEC_PER_HR / FEET_PER_MILE
    return Math.round( mph * ( 100 - slippagePct ) ) / 100
}

function calcLipoBatteryPackVoltage( cellCountS )
{
    return cellCountS * LIPO_CELL_NOMINAL_VOLTS
}

// Estimated RPM under load per volt.
function calcRpmUnderLoad( motorKv, motorEfficiency = .92 )
{
    return motorKv * motorEfficiency
}