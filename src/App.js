import React, { useState } from "react";
import styled from "styled-components";
import ChartSection from "./components/ChartSection";
import TableSection from "./components/TableSection";
import { ChartProvider } from "./context/ChartContext";

const AppContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #000000;
  color: #ffffff;
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  overflow-x: hidden;
`;

const MainContent = styled.div`
  display: flex;
  width: 100%;
  padding: 20px;
  gap: 20px;
  position: relative;
`;

const ChartContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  transition: margin-right 0.3s ease;
  margin-right: ${(props) => (props.isTableCollapsed ? "0" : "1px")};
  min-width: 0;
`;

const TableContainer = styled.div`
  flex: 0 0 ${(props) => (props.isCollapsed ? "10px" : "500px")};
  transition: flex-basis 0.3s ease;
  min-width: 0;
  position: relative;
  padding-left: 5px;
`;

function App() {
  const [isTableCollapsed, setIsTableCollapsed] = useState(false);

  return (
    <ChartProvider>
      <AppContainer>
        <MainContent>
          <ChartContainer isTableCollapsed={isTableCollapsed}>
            <ChartSection />
          </ChartContainer>
          <TableContainer isCollapsed={isTableCollapsed}>
            <TableSection
              onCollapseChange={setIsTableCollapsed}
              isCollapsed={isTableCollapsed}
            />
          </TableContainer>
        </MainContent>
      </AppContainer>
    </ChartProvider>
  );
}

export default App;
