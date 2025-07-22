import type { VehicleType } from "../types/vehicle";
import moment from "moment";

export function createVehiclePopupContent(vehicle: VehicleType): string {
  const {
    LineRef = "לא ידוע",
    VehicleRef = "לא ידוע",
    RecordedAtTime,
    OperatorRef = "לא ידוע",
    OriginAimedDepartureTime,
    Bearing = "לא ידוע",
    Velocity = "לא ידוע",
    StopPointRef = "לא ידוע",
    DistanceFromStop = "לא ידוע",
    Order = "לא ידוע",
  } = vehicle;

  const formattedRecordedTime = RecordedAtTime
    ? moment(RecordedAtTime).format("DD/MM/YYYY HH:mm:ss")
    : "לא ידוע";

  const formattedDepartureTime = OriginAimedDepartureTime
    ? moment(OriginAimedDepartureTime).format("DD/MM/YYYY HH:mm:ss")
    : "לא ידוע";

  const velocityKmh =
    Velocity !== "לא ידוע"
      ? (parseFloat(String(Velocity)) * 3.6).toFixed(1)
      : "לא ידוע";

  let formattedDistance = "לא ידוע";
  if (DistanceFromStop !== "לא ידוע") {
    const distanceNum = parseFloat(String(DistanceFromStop));
    formattedDistance =
      distanceNum >= 1000
        ? `${(distanceNum / 1000).toFixed(2)} ק"מ`
        : `${distanceNum.toFixed(0)} מטר`;
  }

  return `
    <div dir="rtl" style="text-align:right; font-size: 14px; line-height: 1.4;">
      <p><strong>🔢 מספר קו:</strong> ${LineRef}</p>
      <p><strong>🚌 מזהה רכב:</strong> ${VehicleRef}</p>
      <p><strong>🕒 זמן עדכון אחרון:</strong> ${formattedRecordedTime}</p>
      <p><strong>🏢 מפעיל הקו:</strong> ${OperatorRef}</p>
      <p><strong>🚦 שעת יציאה מתוכננת:</strong> ${formattedDepartureTime}</p>
      <p><strong>🧭 כיוון נסיעה:</strong> ${Bearing}°</p>
      <p><strong>💨 מהירות נוכחית:</strong> ${velocityKmh} קמ"ש</p>
      <p><strong>📍 קוד תחנה קרובה:</strong> ${StopPointRef}</p>
      <p><strong>↔️ מרחק מהתחנה:</strong> ${formattedDistance}</p>
      <p><strong>🔢 מיקום התחנה במסלול:</strong> מספר ${Order}</p>
    </div>
  `;
}
