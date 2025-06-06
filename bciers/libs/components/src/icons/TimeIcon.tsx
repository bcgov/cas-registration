import React from "react";

interface TimeIconProps {
  fill?: string;
  width?: string;
  height?: string;
}

const TimeIcon: React.FC<TimeIconProps> = ({
  fill = "#313132",
  width = "15",
  height = "15",
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 15 15"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M7.26562 0.25C3.25195 0.25 0 3.50195 0 7.51562C0 11.5293 3.25195 14.7812 7.26562 14.7812C11.2793 14.7812 14.5312 11.5293 14.5312 7.51562C14.5312 3.50195 11.2793 0.25 7.26562 0.25ZM8.93848 10.5068L6.35449 8.62891C6.26367 8.56152 6.21094 8.45605 6.21094 8.34473V3.41406C6.21094 3.2207 6.36914 3.0625 6.5625 3.0625H7.96875C8.16211 3.0625 8.32031 3.2207 8.32031 3.41406V7.44824L10.1807 8.80176C10.3389 8.91602 10.3711 9.13574 10.2568 9.29395L9.43066 10.4307C9.31641 10.5859 9.09668 10.6211 8.93848 10.5068Z"
      fill={fill}
    />
  </svg>
);

export default TimeIcon;
