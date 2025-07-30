"use client";
import React, { useEffect, useState } from "react";
import moment from "moment-hijri";

const HIJRI_MONTHS = [
  "محرم",
  "صفر",
  "ربيع الأول",
  "ربيع الثاني",
  "جمادى الأولى",
  "جمادى الآخرة",
  "رجب",
  "شعبان",
  "رمضان",
  "شوال",
  "ذو القعدة",
  "ذو الحجة",
];

const GREGORIAN_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function getDaysInGregorianMonth(year, month) {
  return new Date(year, month, 0).getDate();
}
function getDaysInHijriMonth(year, month) {
  return moment(`${year}/${month}/1`, "iYYYY/iM/iD").endOf("iMonth").iDate();
}

export default function DateDropdownPicker({
  type = "gregorian",
  value,
  onChange,
  minYear,
  maxYear,
  label = "",
  required = false,
  locale = "en",
  className = "",
}) {
  const todayG = new Date();
  const todayH = moment().format("iYYYY/iM/iD").split("/").map(Number);

  const GREG_MIN = minYear || 1970;
  const GREG_MAX = maxYear || todayG.getFullYear() + 10;
  const HIJRI_MIN = minYear || 1356;
  const HIJRI_MAX = maxYear || 1500;

  const [year, setYear] = useState(
    value?.year || (type === "hijri" ? todayH[0] : todayG.getFullYear())
  );
  const [month, setMonth] = useState(
    value?.month || (type === "hijri" ? todayH[1] : todayG.getMonth() + 1)
  );
  const [day, setDay] = useState(
    value?.day || (type === "hijri" ? todayH[2] : todayG.getDate())
  );

  useEffect(() => {
    let formatted;
    if (type === "hijri") {
      formatted = moment(`${year}/${month}/${day}`, "iYYYY/iM/iD").format(
        "YYYY-MM-DD"
      );
    } else {
      const pad = (n) => n.toString().padStart(2, "0");
      formatted = `${year}-${pad(month)}-${pad(day)}`;
    }
    onChange?.({ year, month, day, formatted });
  }, [year, month, day, type]);

  useEffect(() => {
    if (type === "hijri") {
      setYear(todayH[0]);
      setMonth(todayH[1]);
      setDay(todayH[2]);
    } else {
      setYear(todayG.getFullYear());
      setMonth(todayG.getMonth() + 1);
      setDay(todayG.getDate());
    }
  }, [type]);

  const dayMax =
    type === "hijri"
      ? getDaysInHijriMonth(year, month)
      : getDaysInGregorianMonth(year, month);

  useEffect(() => {
    if (day > dayMax) setDay(dayMax);
  }, [dayMax]);

  return (
    <div className={`flex flex-col w-full ${className}`}>
      {label && (
        <label className='mb-1 font-medium text-sm text-gray-800'>
          {label}
          {required && <span className='text-red-500 ml-1'>*</span>}
        </label>
      )}

      <div className='flex flex-col sm:flex-row gap-3 w-full'>
        {/* Day */}
        <select
          value={day}
          onChange={(e) => setDay(Number(e.target.value))}
          className='w-full sm:w-24 border p-2 rounded-md text-sm focus:ring-2 focus:ring-[#2c6449] transition'
        >
          {Array.from({ length: dayMax }, (_, i) => i + 1).map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        {/* Month */}
        <select
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          className='w-full sm:w-24 border p-2 rounded-md text-sm focus:ring-2 focus:ring-[#2c6449] transition'
        >
          {(type === "hijri" ? HIJRI_MONTHS : GREGORIAN_MONTHS).map(
            (name, i) => (
              <option key={i} value={i + 1}>
                {name}
              </option>
            )
          )}
        </select>

        {/* Year */}
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className='w-full sm:w-28 border p-2 rounded-md text-sm focus:ring-2 focus:ring-[#2c6449] transition'
        >
          {Array.from(
            {
              length:
                (type === "hijri" ? HIJRI_MAX : GREG_MAX) -
                (type === "hijri" ? HIJRI_MIN : GREG_MIN) +
                1,
            },
            (_, i) => (type === "hijri" ? HIJRI_MIN : GREG_MIN) + i
          ).map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      <div className='text-xs text-gray-500 mt-1'>
        {type === "hijri"
          ? locale === "ar"
            ? "هجري"
            : "Hijri"
          : locale === "ar"
          ? "ميلادي"
          : "Gregorian"}
      </div>
    </div>
  );
}
