import React from "react";
import styled from "styled-components";
import Chart from "./Chart";
import { useChart } from "../context/ChartContext";

const ChartGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
  width: 100%;
  overflow-x: hidden;
  min-width: 0;
  max-width: 100%;
`;

const ChartSection = () => {
  const { charts, removeChart } = useChart();

  return (
    <ChartGrid>
      {charts.map((chart, index) => (
        <Chart
          key={chart.id}
          data={chart}
          onRemove={() => removeChart(index)}
        />
      ))}
    </ChartGrid>
  );
};

export default ChartSection;
